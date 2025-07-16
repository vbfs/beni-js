const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

module.exports = async function serve(args) {
    const port = args.includes('--port') ?
        parseInt(args[args.indexOf('--port') + 1]) : 8080;

    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) {
        console.error('❌ Pasta dist/ não encontrada');
        console.log('💡 Execute "beni build" primeiro');
        return;
    }

    // Carregar configuração
    const configPath = path.join(process.cwd(), 'beni.config.js');
    let config = {
        prodServer: {
            compression: true,
            caching: true
        }
    };

    if (fs.existsSync(configPath)) {
        try {
            config = { ...config, ...require(configPath) };
        } catch (error) {
            console.log('⚠️ Usando configuração padrão para o servidor');
        }
    }

    console.log('🚀 Servindo build de produção...');
    console.log(`📁 Servindo de: ${distPath}`);

    if (config.prodServer.compression) {
        console.log('📦 Compressão gzip habilitada');
    }

    if (config.prodServer.caching) {
        console.log('🔄 Cache headers habilitados');
    }

    const server = http.createServer((req, res) => {
        handleRequest(req, res, distPath, config);
    });

    server.listen(port, config.prodServer.host || 'localhost', () => {
        console.log(`✅ Produção rodando em http://localhost:${port}`);
        console.log('📊 Performance otimizada para produção');
    });
};

function handleRequest(req, res, distPath, config) {
    let filePath = req.url === '/' ? '/index.html' : req.url;

    // Remove query parameters
    filePath = filePath.split('?')[0];

    const fullPath = path.join(distPath, filePath);
    const gzipPath = fullPath + '.gz';

    // Verificar se arquivo existe
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        // Tentar fallback para index.html (SPA routing)
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            serveFile(req, res, indexPath, distPath, config);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>404 - Página não encontrada</h1>
                        <p>O arquivo <code>${filePath}</code> não foi encontrado.</p>
                        <a href="/">← Voltar para home</a>
                    </body>
                </html>
            `);
        }
        return;
    }

    serveFile(req, res, fullPath, distPath, config);
}

function serveFile(req, res, filePath, distPath, config) {
    const ext = path.extname(filePath);
    const gzipPath = filePath + '.gz';

    // MIME types
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.pdf': 'application/pdf'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Headers básicos
    const headers = {
        'Content-Type': contentType,
        'X-Powered-By': 'Beni.js'
    };

    // ✅ CACHE HEADERS PARA PERFORMANCE
    if (config.prodServer.caching) {
        // Assets estáticos podem ser cachados por mais tempo
        if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'].includes(ext)) {
            headers['Cache-Control'] = 'public, max-age=31536000, immutable'; // 1 ano
            headers['Expires'] = new Date(Date.now() + 31536000000).toUTCString();
        } else if (ext === '.html') {
            // HTML pode mudar, cache menor
            headers['Cache-Control'] = 'public, max-age=3600'; // 1 hora
        } else {
            headers['Cache-Control'] = 'public, max-age=86400'; // 1 dia
        }

        // ETag para cache validation
        const stats = fs.statSync(filePath);
        const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
        headers['ETag'] = etag;

        // Verificar If-None-Match header
        if (req.headers['if-none-match'] === etag) {
            res.writeHead(304, headers);
            res.end();
            return;
        }
    }

    // ✅ COMPRESSÃO GZIP AUTOMÁTICA
    if (config.prodServer.compression) {
        const acceptEncoding = req.headers['accept-encoding'] || '';

        // Verificar se cliente aceita gzip e se arquivo comprimido existe
        if (acceptEncoding.includes('gzip') && fs.existsSync(gzipPath)) {
            headers['Content-Encoding'] = 'gzip';
            headers['Vary'] = 'Accept-Encoding';

            // Servir arquivo pré-comprimido
            const gzipContent = fs.readFileSync(gzipPath);
            headers['Content-Length'] = gzipContent.length;

            res.writeHead(200, headers);
            res.end(gzipContent);

            logRequest(req, 200, gzipContent.length, true);
            return;
        }
        // Se não tem arquivo pré-comprimido, comprimir na hora para arquivos de texto
        else if (acceptEncoding.includes('gzip') && isCompressible(ext)) {
            const content = fs.readFileSync(filePath);

            zlib.gzip(content, (err, compressed) => {
                if (err) {
                    // Fallback para arquivo não comprimido
                    serveUncompressed(res, filePath, headers, req);
                } else {
                    headers['Content-Encoding'] = 'gzip';
                    headers['Vary'] = 'Accept-Encoding';
                    headers['Content-Length'] = compressed.length;

                    res.writeHead(200, headers);
                    res.end(compressed);

                    logRequest(req, 200, compressed.length, true);
                }
            });
            return;
        }
    }

    // Servir arquivo sem compressão
    serveUncompressed(res, filePath, headers, req);
}

function serveUncompressed(res, filePath, headers, req) {
    const stats = fs.statSync(filePath);
    headers['Content-Length'] = stats.size;

    res.writeHead(200, headers);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    logRequest(req, 200, stats.size, false);
}

function isCompressible(ext) {
    const compressibleTypes = ['.html', '.js', '.css', '.json', '.svg', '.txt', '.xml'];
    return compressibleTypes.includes(ext);
}

function logRequest(req, statusCode, size, compressed) {
    const timestamp = new Date().toLocaleTimeString();
    const method = req.method;
    const url = req.url;
    const sizeFormatted = formatBytes(size);
    const compressionIcon = compressed ? '📦' : '📄';

    console.log(`${timestamp} - ${method} ${url} - ${statusCode} - ${sizeFormatted} ${compressionIcon}`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}