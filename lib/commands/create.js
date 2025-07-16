const fs = require("fs");
const path = require("path");

module.exports = async function create(args) {
  const projectName = args[0];

  if (!projectName) {
    console.error("❌ Nome do projeto é obrigatório");
    console.log("Uso: beni create <nome-do-projeto>");
    return;
  }

  console.log(`🚀 Criando projeto Beni.js: ${projectName}`);

  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(`❌ Pasta '${projectName}' já existe`);
    return;
  }

  try {
    fs.mkdirSync(projectPath, { recursive: true });

    const structure = [
      "src",
      "src/templates",
      "src/templates/components",
      "src/styles",
      "public",
    ];

    structure.forEach((dir) => {
      fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
    });

    createProjectFiles(projectPath, projectName);

    console.log("✅ Projeto criado com sucesso!");
    console.log("");
    console.log("📋 Próximos passos:");
    console.log(`   cd ${projectName}`);
    console.log("   npm install");
    console.log("   npm run dev");
    console.log("");
    console.log("🌐 Servidor estará em: http://localhost:3000");
    console.log("🔥 Hot reload será ativado automaticamente");
    console.log("🎨 Tailwind CSS está pronto para uso");
  } catch (error) {
    console.error("❌ Erro ao criar projeto:", error.message);
  }
};

function createProjectFiles(projectPath, projectName) {
  const files = {
    // package.json
    "package.json": JSON.stringify(
      {
        name: projectName,
        version: "1.0.0",
        description: `${projectName} - Aplicação Beni.js`,
        scripts: {
          dev: "beni dev",
          build: "beni build",
          serve: "beni serve",
          start: "npm run dev",
        },
        dependencies: {
          "beni-js": "^1.0.0",
        },
      },
      null,
      2
    ),

    // ✅ public/index.html - COM TAILWIND CSS CDN LATEST
    "public/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BeniJS</title>
    <!-- ✅ Tailwind CSS CDN Latest -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Hot Reload Indicator */
        .hot-reload-indicator {
            position: fixed;
            top: 4px;
            right: 4px;
            background: #10b981;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 50;
            font-family: ui-monospace, SFMono-Regular, monospace;
        }

        .hot-reload-indicator.show {
            opacity: 1;
        }

        /* Smooth animations */
        .fade-in {
            animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Custom gradient */
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        /* Pulse animation for hot reload */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }

        .hot-reload-indicator.show {
            animation: pulse 0.5s ease-in-out;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Hot Reload Indicator -->
    <div id="hot-reload-indicator" class="hot-reload-indicator">
        🔥 Hot Reload
    </div>

    <div id="app" class="min-h-screen flex items-center justify-center">
        <!-- Loading State -->
        <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading ${projectName}...</p>
        </div>
    </div>

    <!-- Beni.js via UMD -->
    <script src="https://unpkg.com/beni-js@latest/dist/index.umd.js"></script>
    <script src="/src/app.js"></script>
</body>
</html>`,

    // ✅ src/app.js - PÁGINA ELEGANTE COM DESCRIÇÃO OFICIAL
    "src/app.js": `// ${projectName} - Aplicação Beni.js
console.log('🔥 Iniciando ${projectName}...');

document.addEventListener('DOMContentLoaded', async function() {
    // Criar aplicação Beni.js
    const app = Beni.createApp({
        container: '#app',
        hashRouting: true
    });

    // Estado inicial
    app.setState('appName', '${projectName}');
    app.setState('currentPage', 'home');

    // Rota principal
    app.route('/', () => {
        app.render(\`
            <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <!-- Header -->
                <header class="container mx-auto px-6 pt-16 pb-8">
                    <div class="text-center">
                        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                            <span class="text-2xl font-bold text-white">B</span>
                        </div>
                        <h1 class="text-5xl font-bold text-gray-900 mb-4">
                            BeniJS
                        </h1>
                        <p class="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                            A lightweight, performant JavaScript library designed for developers who want to build modern single-page applications without the complexity of heavyweight frameworks.
                        </p>
                    </div>
                </header>

                <!-- Main Content -->
                <main class="container mx-auto px-6 pb-16">
                    <!-- Feature Cards -->
                    <div class="grid md:grid-cols-3 gap-8 mb-12">
                        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <span class="text-2xl">⚡</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                            <p class="text-gray-600">
                                Under 5KB gzipped with zero dependencies.
                                Optimized rendering and minimal overhead.
                            </p>
                        </div>

                        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <span class="text-2xl">🔄</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-3">Reactive State</h3>
                            <p class="text-gray-600">
                                Built-in reactive state management that automatically
                                updates your UI when data changes.
                            </p>
                        </div>

                        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <span class="text-2xl">🛠️</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-3">Developer Experience</h3>
                            <p class="text-gray-600">
                                Hot reload, CLI tools, and intuitive API.
                                From idea to SPA in minutes.
                            </p>
                        </div>
                    </div>

                    <!-- Demo Section -->
                    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-12">
                        <div class="text-center mb-8">
                            <h2 class="text-3xl font-bold text-gray-900 mb-4">See It In Action</h2>
                            <p class="text-gray-600">A simple counter to demonstrate reactive state management</p>
                        </div>

                        <div class="max-w-md mx-auto text-center">
                            <div class="bg-gray-50 rounded-2xl p-8 mb-6">
                                <div class="text-6xl font-bold text-gray-900 mb-4" data-state="counter">0</div>
                                <p class="text-gray-600">Counter Value</p>
                            </div>

                            <div class="flex gap-3 justify-center">
                                <button onclick="decrementCounter()"
                                        class="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">
                                    ➖ Decrease
                                </button>
                                <button onclick="resetCounter()"
                                        class="px-6 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors">
                                    🔄 Reset
                                </button>
                                <button onclick="incrementCounter()"
                                        class="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors">
                                    ➕ Increase
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="text-center">
                        <div class="inline-flex bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                            <a href="#/" class="px-6 py-3 text-blue-600 bg-blue-50 rounded-xl font-medium">
                                Home
                            </a>
                            <a href="#/docs" class="px-6 py-3 text-gray-600 hover:text-gray-900 rounded-xl font-medium transition-colors">
                                Documentation
                            </a>
                            <a href="#/examples" class="px-6 py-3 text-gray-600 hover:text-gray-900 rounded-xl font-medium transition-colors">
                                Examples
                            </a>
                        </div>
                    </div>
                </main>

                <!-- Footer -->
                <footer class="border-t border-gray-200 bg-white">
                    <div class="container mx-auto px-6 py-8">
                        <div class="text-center">
                            <p class="text-gray-600">
                                Built with ❤️ using BeniJS •
                                <span class="text-sm">Hot reload is active - edit files to see changes</span>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        \`);

        app.setState('currentPage', 'home');
    });

    // Rota Documentação
    app.route('/docs', () => {
        app.render(\`
            <div class="min-h-screen bg-gray-50">
                <div class="container mx-auto px-6 py-16">
                    <div class="max-w-4xl mx-auto">
                        <div class="text-center mb-12">
                            <h1 class="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
                            <p class="text-xl text-gray-600">Learn how to build amazing SPAs with BeniJS</p>
                        </div>

                        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                            <h2 class="text-2xl font-bold text-gray-900 mb-6">Quick Start</h2>

                            <div class="space-y-6">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900 mb-2">1. Create Your App</h3>
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <code class="text-sm text-gray-800">
                                            const app = Beni.createApp({ container: '#app' });
                                        </code>
                                    </div>
                                </div>

                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900 mb-2">2. Add Routes</h3>
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <code class="text-sm text-gray-800">
                                            app.route('/', () => app.render('&lt;h1&gt;Home&lt;/h1&gt;'));
                                        </code>
                                    </div>
                                </div>

                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900 mb-2">3. Initialize</h3>
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <code class="text-sm text-gray-800">
                                            app.init();
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="text-center">
                            <a href="#/" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                                ← Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        \`);

        app.setState('currentPage', 'docs');
    });

    // Rota Examples
    app.route('/examples', () => {
        app.render(\`
            <div class="min-h-screen bg-gray-50">
                <div class="container mx-auto px-6 py-16">
                    <div class="max-w-4xl mx-auto">
                        <div class="text-center mb-12">
                            <h1 class="text-4xl font-bold text-gray-900 mb-4">Examples</h1>
                            <p class="text-xl text-gray-600">See BeniJS in action with these examples</p>
                        </div>

                        <div class="grid md:grid-cols-2 gap-6 mb-8">
                            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 class="text-xl font-semibold text-gray-900 mb-3">Todo App</h3>
                                <p class="text-gray-600 mb-4">
                                    A complete todo application demonstrating state management and routing.
                                </p>
                                <div class="flex gap-2">
                                    <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">State</span>
                                    <span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Routing</span>
                                </div>
                            </div>

                            <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h3 class="text-xl font-semibold text-gray-900 mb-3">Dashboard</h3>
                                <p class="text-gray-600 mb-4">
                                    An admin dashboard with charts and real-time data updates.
                                </p>
                                <div class="flex gap-2">
                                    <span class="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Charts</span>
                                    <span class="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">Real-time</span>
                                </div>
                            </div>
                        </div>

                        <div class="text-center">
                            <a href="#/" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                                ← Back to Home
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        \`);

        app.setState('currentPage', 'examples');
    });

    // Rota 404
    app.route('404', () => {
        app.render(\`
            <div class="min-h-screen bg-gray-50 flex items-center justify-center">
                <div class="text-center">
                    <div class="text-9xl font-bold text-gray-300 mb-4">404</div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                    <p class="text-gray-600 mb-8">
                        The page you're looking for doesn't exist.
                    </p>
                    <a href="#/" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        🏠 Back to Home
                    </a>
                </div>
            </div>
        \`);
    });

    // Estado do contador
    app.setState('counter', 0);

    // Funções globais para os botões
    window.incrementCounter = function() {
        const current = app.getState('counter');
        app.setState('counter', current + 1);

    };

    window.decrementCounter = function() {
        const current = app.getState('counter');
        app.setState('counter', current - 1);

    };

    window.resetCounter = function() {
        app.setState('counter', 0);

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
        console.log('📊 Counter changed to:', value);
    });

    app.subscribe('currentPage', (page) => {
        console.log('📄 Current page:', page);
        if (page === 'home') {
            document.title = 'BeniJS';
        } else {
            document.title = \`BeniJS - \${page.charAt(0).toUpperCase() + page.slice(1)}\`;
        }
    });

    // Inicializar aplicação
    await app.init();

    console.log('✅ ${projectName} initialized successfully!');
    console.log('🔥 Hot reload is active - edit files to see changes');
});`,

    // src/styles/main.css (mantido para customizações futuras)
    "src/styles/main.css": `/* ${projectName} - Estilos personalizados */

/* Tailwind CSS está disponível via CDN no HTML */
/* Use este arquivo para estilos personalizados adicionais */

/* Exemplo de customização */
.custom-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Animação personalizada */
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.slide-in-up {
    animation: slideInUp 0.6s ease-out;
}

/* Hover personalizado para cards */
.card-hover {
    transition: all 0.3s ease;
}

.card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Customização do Tailwind CSS */
@media (prefers-color-scheme: dark) {
    /* Suporte a dark mode futuro */
}`,

    // README.md atualizado
    "README.md": `# ${projectName}

Aplicação criada com [BeniJS](https://www.npmjs.com/package/beni-js) - A lightweight, performant JavaScript library designed for developers who want to build modern single-page applications without the complexity of heavyweight frameworks.

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

## 🎨 Design System

Este projeto usa **Tailwind CSS** para estilização:

- ✅ **Tailwind CSS CDN** - Sempre a versão mais recente
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Modern UI** - Gradients, shadows, rounded corners
- ✅ **Interactive Elements** - Hover effects, transitions
- ✅ **Hot Reload** - Mudanças instantâneas durante desenvolvimento

## 📁 Estrutura do projeto

\`\`\`
${projectName}/
├── src/
│   ├── app.js              # Aplicação principal
│   └── styles/
│       └── main.css        # Estilos personalizados (complementa Tailwind)
├── public/
│   └── index.html          # HTML com Tailwind CSS CDN
├── package.json
└── README.md
\`\`\`

## ✨ Features implementadas

- 🏠 **Home Page** - Apresentação do BeniJS com design moderno
- 📚 **Documentation** - Guia de início rápido
- 🎯 **Examples** - Exemplos de uso
- 🔢 **Interactive Counter** - Demonstração de estado reativo
- 🔥 **Hot Reload** - Desenvolvimento com mudanças instantâneas
- 📱 **Responsive** - Layout adaptável para todos os dispositivos

## 🎨 Customização

### Tailwind CSS
O projeto usa Tailwind CSS via CDN para desenvolvimento rápido. Para produção, considere:

\`\`\`bash
# Instalar Tailwind localmente
npm install -D tailwindcss
npx tailwindcss init

# Gerar CSS customizado
npx tailwindcss -i ./src/styles/main.css -o ./public/styles.css --watch
\`\`\`

### Cores e Temas
Modifique as classes Tailwind no \`src/app.js\`:

\`\`\`javascript
// Exemplo: mudar cor principal de azul para roxo
bg-blue-600 → bg-purple-600
text-blue-600 → text-purple-600
\`\`\`

## 🚀 Deploy

O projeto gera arquivos estáticos prontos para qualquer hosting:

\`\`\`bash
npm run build
# Deploy da pasta dist/ para:
# - Netlify, Vercel, GitHub Pages
# - AWS S3, Firebase Hosting
# - Qualquer servidor estático
\`\`\`

## 📚 Sobre BeniJS

- **Bundle pequeno**: < 5KB gzipped
- **Zero dependências**: Sem vendor lock-in
- **Estado reativo**: Atualizações automáticas da UI
- **Roteamento inteligente**: Com parâmetros dinâmicos
- **Hot reload**: Desenvolvimento produtivo
- **API simples**: Fácil de aprender e usar

## 📄 Licença

MIT
`,

    // .gitignore
    ".gitignore": `# Dependencies
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
*.hot-update.*

# Tailwind
tailwind.config.js
postcss.config.js`,
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
    fs.writeFileSync(fullPath, content, "utf8");
  });
}
