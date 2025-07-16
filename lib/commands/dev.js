const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const chokidar = require('chokidar');

module.exports = async function dev(args) {
    const port = args.includes('--port') ?
        parseInt(args[args.indexOf('--port') + 1]) : 3000;

    const verbose = args.includes('--verbose');

    console.log('🔥 Iniciando servidor de desenvolvimento com hot reload...');
    console.log('📝 Arquivos sendo observados para mudanças automáticas');

    // Conjunto de clientes conectados
    const clients = new Set();

    // Servidor HTTP
    const server = http.createServer((req, res) => {
        handleRequest(req, res, verbose);
    });

    // ✅ WEBSOCKET PARA HOT RELOAD
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        clients.add(ws);
        console.log('🔌 Cliente conectado para hot reload');

        ws.on('close', () => {
            clients.delete(ws);
            console.log('🔌 Cliente desconectado');
        });

        ws.on('error', (error) => {
            console.error('❌ Erro WebSocket:', error.message);
            clients.delete(ws);
        });
    });

    // ✅ FILE WATCHER
    const watcher = chokidar.watch([
        'src/**/*',
        'public/**/*',
        '*.js',
        '*.json',
        '*.html',
        '*.css'
    ], {
        ignored: [
            'node_modules/**',
            'dist/**',
            '.git/**',
            '**/.DS_Store'
        ],
        persistent: true,
        ignoreInitial: true
    });

    watcher.on('change', (filePath) => {
        console.log(`📝 Arquivo alterado: ${filePath}`);

        // Notificar todos os clientes para recarregar
        broadcastReload(clients, filePath);
    });

    watcher.on('add', (filePath) => {
        console.log(`➕ Arquivo adicionado: ${filePath}`);
        broadcastReload(clients, filePath);
    });

    watcher.on('unlink', (filePath) => {
        console.log(`🗑️ Arquivo removido: ${filePath}`);
        broadcastReload(clients, filePath);
    });

    watcher.on('error', (error) => {
        console.error('❌ Erro no file watcher:', error);
    });

    // Iniciar servidor
    server.listen(port, () => {
        console.log(`✅ Servidor rodando em http://localhost:${port}`);
        console.log('🔥 Hot reload ativado - edite arquivos para ver mudanças instantâneas');
        console.log('📊 Logs de requisições:');
    });

    // Log de requisições
    server.on('request', (req) => {
        if (verbose || !req.url.includes('favicon')) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`  ${timestamp} - ${req.method} ${req.url}`);
        }
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Parando servidor...');
        watcher.close();
        server.close();
        process.exit(0);
    });
};

function handleRequest(req, res, verbose) {
    let filePath = req.url === '/' ? '/public/index.html' : req.url;

    // Servir da pasta atual do projeto
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const ext = path.extname(fullPath);
        const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };

        let content = fs.readFileSync(fullPath);

        // ✅ INJETAR HOT RELOAD CLIENT NO HTML
        if (ext === '.html') {
            content = injectHotReloadClient(content.toString());
        }

        res.writeHead(200, {
            'Content-Type': mimeTypes[ext] || 'text/plain',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        });

        res.end(content);
    } else {
        // 404 com hot reload client
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(injectHotReloadClient(`
            <h1>404 - Arquivo não encontrado</h1>
            <p>Arquivo: ${filePath}</p>
            <p>Caminho: ${fullPath}</p>
            <a href="/">← Voltar</a>
        `));
    }
}

function injectHotReloadClient(html) {
    const hotReloadScript = `
    <script>
        (function() {
            console.log('🔥 Hot Reload Client conectando...');

            const ws = new WebSocket('ws://localhost:${3000}');

            ws.onopen = function() {
                console.log('✅ Hot Reload ativo - edite arquivos para recarregar automaticamente');
            };

            ws.onmessage = function(event) {
                const data = JSON.parse(event.data);

                if (data.type === 'reload') {
                    console.log('🔄 Recarregando devido a mudança em:', data.file);

                    // Adicionar pequeno delay para evitar recarregar muito rápido
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            };

            ws.onclose = function() {
                console.log('🔌 Hot Reload desconectado');

                // Tentar reconectar após 3 segundos
                setTimeout(() => {
                    console.log('🔄 Tentando reconectar hot reload...');
                    window.location.reload();
                }, 3000);
            };

            ws.onerror = function(error) {
                console.error('❌ Erro no Hot Reload:', error);
            };
        })();
    </script>
    `;

    // Injetar antes do </body> ou no final se não houver </body>
    if (html.includes('</body>')) {
        return html.replace('</body>', hotReloadScript + '\n</body>');
    } else {
        return html + hotReloadScript;
    }
}

function broadcastReload(clients, filePath) {
    const message = JSON.stringify({
        type: 'reload',
        file: filePath,
        timestamp: Date.now()
    });

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(message);
            } catch (error) {
                console.error('❌ Erro ao enviar mensagem para cliente:', error.message);
                clients.delete(client);
            }
        } else {
            // Remover clientes desconectados
            clients.delete(client);
        }
    });

    if (clients.size > 0) {
        console.log(`📡 Hot reload enviado para ${clients.size} cliente(s)`);
    }
}