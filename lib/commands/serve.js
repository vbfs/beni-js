const http = require('http');
const fs = require('fs');
const path = require('path');

module.exports = async function serve(args) {
    const port = args.includes('--port') ?
        parseInt(args[args.indexOf('--port') + 1]) : 8080;

    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) {
        console.error('❌ Pasta dist/ não encontrada');
        console.log('💡 Execute "beni build" primeiro');
        return;
    }

    console.log('🚀 Servindo build de produção...');
    console.log(`📁 Servindo de: ${distPath}`);

    const server = http.createServer((req, res) => {
        let filePath = req.url === '/' ? '/index.html' : req.url;
        const fullPath = path.join(distPath, filePath);

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const ext = path.extname(fullPath);
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json'
            };

            res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
            fs.createReadStream(fullPath).pipe(res);
        } else {
            res.writeHead(404);
            res.end('404 - Not Found');
        }
    });

    server.listen(port, () => {
        console.log(`✅ Produção rodando em http://localhost:${port}`);
    });
};