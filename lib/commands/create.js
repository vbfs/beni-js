const fs = require('fs');
const path = require('path');

module.exports = async function create(args) {
    const projectName = args[0];

    if (!projectName) {
        console.error('❌ Nome do projeto é obrigatório');
        console.log('Uso: beni create <nome-do-projeto>');
        return;
    }

    console.log(`🚀 Criando projeto Beni.js: ${projectName}`);

    // Criar diretório do projeto
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
        console.error(`❌ Pasta '${projectName}' já existe`);
        return;
    }

    try {
        fs.mkdirSync(projectPath, { recursive: true });

        // Estrutura do projeto
        const structure = [
            'src',
            'src/templates',
            'src/templates/components',
            'src/styles',
            'public'
        ];

        structure.forEach(dir => {
            fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
        });

        // Criar arquivos do projeto
        createProjectFiles(projectPath, projectName);

        console.log('✅ Projeto criado com sucesso!');
        console.log('');
        console.log('📋 Próximos passos:');
        console.log(`   cd ${projectName}`);
        console.log('   npm install');
        console.log('   npm run dev');
        console.log('');
        console.log('🌐 Servidor estará em: http://localhost:3000');
        console.log('🔥 Hot reload será ativado automaticamente');

    } catch (error) {
        console.error('❌ Erro ao criar projeto:', error.message);
    }
};

function createProjectFiles(projectPath, projectName) {
    const files = {
        // package.json
        'package.json': JSON.stringify({
            name: projectName,
            version: '1.0.0',
            description: `${projectName} - Aplicação Beni.js`,
            scripts: {
                dev: 'beni dev',
                build: 'beni build',
                serve: 'beni serve',
                start: 'npm run dev'
            },
            dependencies: {
                'beni-js': '^1.0.0'
            }
        }, null, 2),

        // ✅ public/index.html - SEM TAILWIND CDN + COM HOT RELOAD
        'public/index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="/src/styles/main.css">
    <style>
        /* Estilos básicos para desenvolvimento */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }

        .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
            cursor: pointer;
            border: none;
            font-size: 1rem;
            transition: all 0.15s ease;
        }

        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); }

        .btn-green { background: #10b981; color: white; }
        .btn-green:hover { background: #059669; }

        .btn-red { background: #ef4444; color: white; }
        .btn-red:hover { background: #dc2626; }

        .btn-gray { background: #6b7280; color: white; }
        .btn-gray:hover { background: #4b5563; }

        .card {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            transition: box-shadow 0.15s ease;
        }

        .card:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .grid {
            display: grid;
            gap: 1.5rem;
        }

        .grid-2 {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .text-center { text-align: center; }
        .text-blue { color: #3b82f6; }
        .text-gray { color: #6b7280; }
        .space-x > * + * { margin-left: 0.5rem; }

        h1 { font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; }
        h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; }
        h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }

        p { margin-bottom: 1rem; }

        .counter-display {
            font-size: 3rem;
            font-weight: bold;
            margin: 1rem 0;
            transition: color 0.15s ease;
        }

        /* Hot Reload Indicator */
        .hot-reload-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #10b981;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 9999;
        }

        .hot-reload-indicator.show {
            opacity: 1;
        }

        @media (max-width: 768px) {
            .container { padding: 0 0.5rem; }
            h1 { font-size: 2rem; }
            .grid-2 { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <!-- Hot Reload Indicator -->
    <div id="hot-reload-indicator" class="hot-reload-indicator">
        🔥 Hot Reload Ativo
    </div>

    <div id="app">
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh;">
            <div style="font-size: 1.125rem; color: #6b7280;">Carregando ${projectName}...</div>
        </div>
    </div>

    <!-- Beni.js via UMD -->
    <script src="https://unpkg.com/beni-js@latest/dist/index.umd.js"></script>
    <script src="/src/app.js"></script>
</body>
</html>`,

        // ✅ src/app.js - ROTA 404 CORRIGIDA (SEM '*')
        'src/app.js': `// ${projectName} - Aplicação Beni.js
console.log('🔥 Iniciando ${projectName}...');

document.addEventListener('DOMContentLoaded', async function() {
    // Criar aplicação Beni.js - SEM ANIMAÇÕES
    const app = Beni.createApp({
        container: '#app',
        hashRouting: true
    });

    // Estado inicial
    app.setState('appName', '${projectName}');
    app.setState('user', { name: 'Desenvolvedor', role: 'Creator' });
    app.setState('counter', 0);
    app.setState('currentPage', 'home');

    // Rota principal
    app.route('/', () => {
        const appName = app.getState('appName');
        const user = app.getState('user');
        const counter = app.getState('counter');

        app.render(\`
            <div class="container" style="padding: 2rem 1rem;">
                <!-- Header -->
                <header class="text-center" style="margin-bottom: 2rem;">
                    <h1 class="text-blue">
                        🔥 \${appName}
                    </h1>
                    <p class="text-gray">
                        Criado com Beni.js - Framework SPA minimalista
                    </p>
                </header>

                <!-- Cards Grid -->
                <div class="grid grid-2">
                    <!-- Informações do usuário -->
                    <div class="card">
                        <h2>👤 Informações do Usuário</h2>
                        <p><strong>Nome:</strong> \${user.name}</p>
                        <p><strong>Função:</strong> \${user.role}</p>
                    </div>

                    <!-- Contador interativo -->
                    <div class="card">
                        <h2>🔢 Contador Interativo</h2>
                        <div class="text-center">
                            <div class="counter-display" data-state="counter">\${counter}</div>
                            <div class="space-x">
                                <button onclick="incrementCounter()" class="btn btn-green">
                                    ➕ Incrementar
                                </button>
                                <button onclick="decrementCounter()" class="btn btn-red">
                                    ➖ Decrementar
                                </button>
                                <button onclick="resetCounter()" class="btn btn-gray">
                                    🔄 Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navegação -->
                <div class="card">
                    <h2>🧭 Navegação</h2>
                    <div class="space-x">
                        <a href="#/" class="btn btn-primary">🏠 Home</a>
                        <a href="#/about" class="btn btn-primary">ℹ️ Sobre</a>
                        <a href="#/features" class="btn btn-primary">⭐ Features</a>
                    </div>
                </div>

                <!-- Footer -->
                <footer class="text-center" style="margin-top: 2rem; color: #6b7280; font-size: 0.875rem;">
                    <p>Construído com ❤️ usando Beni.js</p>
                </footer>
            </div>
        \`);

        app.setState('currentPage', 'home');
    });

    // Rota Sobre
    app.route('/about', () => {
        const appName = app.getState('appName');

        app.render(\`
            <div class="container" style="padding: 2rem 1rem;">
                <div style="max-width: 800px; margin: 0 auto;">
                    <h1>ℹ️ Sobre o \${appName}</h1>

                    <div class="card">
                        <h2>📖 Sobre este projeto</h2>
                        <p>
                            O <strong>\${appName}</strong> é uma aplicação Single Page Application (SPA)
                            criada com Beni.js, um framework JavaScript minimalista e performático.
                        </p>

                        <h3>🚀 Características do Beni.js:</h3>
                        <ul style="list-style: disc; margin-left: 2rem; margin-bottom: 1rem;">
                            <li>⚡ Performático e leve (menos de 5KB)</li>
                            <li>🔄 Sistema de estado reativo</li>
                            <li>🛣️ Roteamento com parâmetros dinâmicos</li>
                            <li>🎨 Funciona com qualquer CSS framework</li>
                            <li>📱 Mobile-friendly por padrão</li>
                            <li>🛠️ CLI completo para desenvolvimento</li>
                            <li>🔥 Hot reload integrado</li>
                        </ul>
                    </div>

                    <div class="text-center">
                        <a href="#/" class="btn btn-primary">← Voltar para Home</a>
                    </div>
                </div>
            </div>
        \`);

        app.setState('currentPage', 'about');
    });

    // Rota Features
    app.route('/features', () => {
        app.render(\`
            <div class="container" style="padding: 2rem 1rem;">
                <div style="max-width: 1000px; margin: 0 auto;">
                    <h1>⭐ Features do Beni.js</h1>

                    <div class="grid grid-2">
                        <div class="card">
                            <h3 class="text-blue">🚀 Performance</h3>
                            <p>
                                Renderização otimizada sem animações desnecessárias.
                                Bundle pequeno para carregamento instantâneo.
                            </p>
                        </div>

                        <div class="card">
                            <h3 style="color: #10b981;">🔄 Estado Reativo</h3>
                            <p>
                                Sistema de estado reativo que atualiza automaticamente a UI
                                quando os dados mudam.
                            </p>
                        </div>

                        <div class="card">
                            <h3 style="color: #8b5cf6;">🛣️ Roteamento</h3>
                            <p>
                                Roteamento simples com suporte a parâmetros dinâmicos
                                e navegação programática.
                            </p>
                        </div>

                        <div class="card">
                            <h3 style="color: #f97316;">🔥 Hot Reload</h3>
                            <p>
                                Desenvolvimento com hot reload automático.
                                Edite arquivos e veja mudanças instantaneamente.
                            </p>
                        </div>
                    </div>

                    <div class="text-center">
                        <a href="#/" class="btn btn-primary">← Voltar para Home</a>
                    </div>
                </div>
            </div>
        \`);

        app.setState('currentPage', 'features');
    });

    // ✅ ROTA 404 CORRIGIDA (usar '404' em vez de '*')
    app.route('404', () => {
        app.render(\`
            <div class="container" style="padding: 2rem 1rem;">
                <div class="text-center" style="padding: 4rem 0;">
                    <h1 style="color: #ef4444; font-size: 4rem; margin-bottom: 1rem;">404</h1>
                    <h2 style="margin-bottom: 2rem;">Página não encontrada</h2>
                    <p class="text-gray" style="margin-bottom: 2rem;">
                        A página que você está procurando não existe.
                    </p>
                    <a href="#/" class="btn btn-primary">
                        🏠 Voltar para Home
                    </a>
                </div>
            </div>
        \`);
    });

    // Funções globais para os botões
    window.incrementCounter = function() {
        const current = app.getState('counter');
        app.setState('counter', current + 1);

        // Mostrar hot reload indicator brevemente
        showHotReloadIndicator();
    };

    window.decrementCounter = function() {
        const current = app.getState('counter');
        app.setState('counter', current - 1);

        showHotReloadIndicator();
    };

    window.resetCounter = function() {
        app.setState('counter', 0);

        showHotReloadIndicator();
    };

    // Função para mostrar indicador de hot reload
    function showHotReloadIndicator() {
        const indicator = document.getElementById('hot-reload-indicator');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }
    }

    // Subscrições de estado
    app.subscribe('counter', (value) => {
        console.log('📊 Counter mudou para:', value);
    });

    app.subscribe('currentPage', (page) => {
        console.log('📄 Página atual:', page);
        document.title = \`\${app.getState('appName')} - \${page}\`;
    });

    // Inicializar aplicação
    await app.init();

    console.log('✅ ${projectName} inicializado com sucesso!');
    console.log('🔥 Hot reload ativo - edite arquivos para ver mudanças');
});`,

        // ✅ src/styles/main.css - SEM ANIMAÇÕES AGRESSIVAS
        'src/styles/main.css': `/* ${projectName} - Estilos personalizados */

/* Import de fontes */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Variáveis CSS */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #10b981;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --dark-color: #1f2937;
    --light-color: #f9fafb;
    --border-radius: 0.5rem;
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --transition: all 0.15s ease;
}

/* Reset básico */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: var(--dark-color);
    background-color: var(--light-color);
}

/* Layout responsivo */
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Componentes */
.card {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    transition: var(--transition);
}

.card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Sistema de grid */
.grid {
    display: grid;
    gap: 1.5rem;
}

.grid-2 {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Botões */
.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: var(--border-radius);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
    transition: var(--transition);
    cursor: pointer;
    border: none;
    text-align: center;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

/* Utilitários */
.text-center { text-align: center; }
.space-x > * + * { margin-left: 0.5rem; }

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 1rem;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 1.875rem; }
h3 { font-size: 1.5rem; }

p {
    margin-bottom: 1rem;
}

/* Responsividade */
@media (max-width: 768px) {
    .container {
        padding: 0 0.5rem;
    }

    h1 { font-size: 2rem; }
    h2 { font-size: 1.5rem; }

    .grid-2 {
        grid-template-columns: 1fr;
    }

    .btn {
        display: block;
        width: 100%;
        margin-bottom: 0.5rem;
    }

    .space-x > * {
        margin-left: 0;
        margin-bottom: 0.5rem;
    }
}

/* Hot reload indicator animation */
@keyframes hotReloadPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}

.hot-reload-indicator.show {
    animation: hotReloadPulse 0.5s ease-in-out;
}`,

        // ✅ README.md ATUALIZADO
        'README.md': `# ${projectName}

Aplicação criada com [Beni.js](https://www.npmjs.com/package/beni-js) - Framework SPA minimalista e performático.

## 🚀 Como executar

\`\`\`bash
# Instalar dependências
npm install

# Desenvolvimento com hot reload
npm run dev
# Acesse: http://localhost:3000

# Build para produção
npm run build

# Servir produção
npm run serve
# Acesse: http://localhost:8080
\`\`\`

## 📁 Estrutura do projeto

\`\`\`
${projectName}/
├── src/
│   ├── app.js              # Aplicação principal
│   └── styles/
│       └── main.css        # Estilos personalizados
├── public/
│   └── index.html          # HTML base
├── package.json
└── README.md
\`\`\`

## ✅ Correções implementadas

- 🔧 **Rota 404**: Corrigida para usar '404' em vez de '*'
- 🎨 **CSS**: Removido Tailwind CDN, adicionado CSS personalizado
- 🔥 **Hot Reload**: Ativo automaticamente durante desenvolvimento
- ⚡ **Performance**: Sem animações desnecessárias
- 📱 **Responsivo**: Layout adaptável para mobile

## 🔥 Features

- ⚡ **Performático**: Renderização instantânea sem piscar
- 🔄 **Reativo**: Estado reativo que atualiza a UI automaticamente
- 🛣️ **Roteamento**: Navegação SPA com hash routing
- 📱 **Responsivo**: Mobile-first design
- 🎨 **CSS Personalizado**: Estilos próprios sem dependências externas
- 🔥 **Hot Reload**: Mudanças instantâneas durante desenvolvimento

## 🧪 Desenvolvimento

Durante o desenvolvimento:

1. **Hot Reload**: Edite qualquer arquivo e veja mudanças instantâneas
2. **File Watcher**: Observa arquivos em \`src/\`, \`public/\` e arquivos raiz
3. **WebSocket**: Conexão em tempo real para recarregamento automático
4. **Logs**: Acompanhe mudanças no terminal

## 📚 Sobre Beni.js

Beni.js é um framework JavaScript minimalista para criar SPAs com:

- Bundle pequeno (< 5KB)
- API simples e intuitiva
- Sistema de estado reativo
- Roteamento com parâmetros
- CLI completo para desenvolvimento
- Hot reload integrado

## 📄 Licença

MIT
`,

        // .gitignore
        '.gitignore': `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs
*.log

# Cache
.cache/
.parcel-cache/

# Hot reload files
*.hot-update.*`
    };

    // Criar todos os arquivos
    Object.entries(files).forEach(([relativePath, content]) => {
        const fullPath = path.join(projectPath, relativePath);
        const dir = path.dirname(fullPath);

        // Criar diretório se não existir
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Escrever arquivo
        fs.writeFileSync(fullPath, content, 'utf8');
    });
}