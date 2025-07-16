const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const mime = require('mime-types');

class DevServer {
    constructor(config = {}) {
        this.config = {
            port: 3000,
            host: 'localhost',
            srcDir: 'src',
            publicDir: 'public',
            ...config
        };

        this.templates = new Map();
        this.clients = new Set();
    }

    start() {
        this.loadTemplates();
        this.setupFileWatcher();
        this.createServer();

        console.log(`🚀 Dev server running at http://${this.config.host}:${this.config.port}`);
    }

    loadTemplates() {
        const templatesDir = path.join(this.config.srcDir, 'templates');
        if (fs.existsSync(templatesDir)) {
            const files = this.getFiles(templatesDir, '.html');
            files.forEach(file => {
                const name = path.relative(templatesDir, file).replace('.html', '');
                const content = fs.readFileSync(file, 'utf8');
                this.templates.set(name, content);
            });
        }
    }

    setupFileWatcher() {
        const watcher = chokidar.watch([this.config.srcDir], {
            ignored: /node_modules/,
            persistent: true
        });

        watcher.on('change', (filePath) => {
            console.log(`📝 File changed: ${filePath}`);

            if (filePath.includes('templates') && filePath.endsWith('.html')) {
                this.loadTemplates();
            }

            // Notify clients to reload
            this.broadcast({ type: 'reload' });
        });
    }

    createServer() {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        // WebSocket for hot reload
        const wss = new WebSocket.Server({ server });
        wss.on('connection', (ws) => {
            this.clients.add(ws);
            ws.on('close', () => this.clients.delete(ws));
        });

        server.listen(this.config.port, this.config.host);
    }

    handleRequest(req, res) {
        let filePath = req.url === '/' ? '/index.html' : req.url;

        // Serve templates dynamically
        if (filePath.startsWith('/template/')) {
            const templateName = filePath.replace('/template/', '').replace('.html', '');
            const template = this.templates.get(templateName);

            if (template) {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(template);
            } else {
                res.writeHead(404);
                res.end('Template not found');
            }
            return;
        }

        // Serve static files
        const fullPath = path.join(this.config.publicDir, filePath);

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            const mimeType = mime.lookup(fullPath) || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': mimeType });
            fs.createReadStream(fullPath).pipe(res);
        } else if (filePath === '/index.html') {
            // Serve dev index with hot reload
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(this.getDevIndex());
        } else {
            res.writeHead(404);
            res.end('Not found');
        }
    }

    getDevIndex() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beni.js Development</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="app">
        <div class="loading flex items-center justify-center h-screen">
            <div class="text-lg">Loading...</div>
        </div>
    </div>

    <!-- Beni.js Core (Development) -->
    <script src="/src/core/index.js" type="module"></script>

    <!-- Hot Reload -->
    <script>
        const ws = new WebSocket('ws://localhost:${this.config.port}');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'reload') {
                location.reload();
            }
        };

        // Development template helper
        window.template = async function(name) {
            const response = await fetch('/template/' + name + '.html');
            return await response.text();
        };
    </script>

    <!-- App Code -->
    <script src="/src/app.js" type="module"></script>
</body>
</html>
        `;
    }

    broadcast(message) {
        const data = JSON.stringify(message);
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    getFiles(dir, ext) {
        const files = [];
        if (!fs.existsSync(dir)) return files;

        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                files.push(...this.getFiles(fullPath, ext));
            } else if (!ext || path.extname(item) === ext) {
                files.push(fullPath);
            }
        }

        return files;
    }
}

module.exports = DevServer;