const fs = require('fs');
const path = require('path');

module.exports = async function createConfig(args) {
    const configPath = path.join(process.cwd(), 'beni.config.js');
    const force = args.includes('--force') || args.includes('-f');

    if (fs.existsSync(configPath) && !force) {
        console.log('⚠️ beni.config.js já existe');
        console.log('💡 Use --force para sobrescrever');
        return;
    }

    const configTemplate = `module.exports = {
    // 📁 Diretórios
    srcDir: 'src',
    distDir: 'dist',
    templatesDir: 'src/templates',
    publicDir: 'public',

    // ⚡ OTIMIZAÇÕES DE PRODUÇÃO
    minify: true,                    // Habilitar minificação geral
    optimize: true,                  // Habilitar otimizações avançadas
    compress: true,                  // Gerar arquivos .gz
    dropConsole: true,               // Remover console.log em produção

    // 🗜️ Configurações específicas de minificação
    minification: {
        html: {
            enabled: true,
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            minifyCSS: true,
            minifyJS: true
        },

        javascript: {
            enabled: true,
            mangle: true,               // Encurtar nomes de variáveis
            compress: {
                drop_console: true,     // Remover console.*
                drop_debugger: true,    // Remover debugger
                pure_funcs: [           // Funções a serem removidas
                    'console.log',
                    'console.info',
                    'console.debug'
                ],
                passes: 2               // Múltiplas passadas de otimização
            },
            format: {
                comments: false         // Remover comentários
            }
        },

        css: {
            enabled: true,
            preset: 'default',          // Preset do cssnano
            discardComments: true,      // Remover comentários
            discardEmpty: true,         // Remover regras vazias
            mergeRules: true,           // Combinar regras similares
            minifySelectors: true,      // Minificar seletores
            normalizeWhitespace: true   // Normalizar espaços
        }
    },

    // 🎯 Configurações do app
    title: 'My Beni.js App',
    css: [
        'https://cdn.tailwindcss.com'
    ],

    // 🖥️ Servidor de desenvolvimento
    devServer: {
        port: 3000,
        host: 'localhost',
        hotReload: true,
        open: false                    // Abrir navegador automaticamente
    },

    // 🚀 Servidor de produção
    prodServer: {
        port: 8080,
        host: 'localhost',
        compression: true,             // Habilitar compressão gzip
        caching: true                  // Habilitar cache headers
    },

    // 🎨 Template engine
    templateEngine: {
        delimiters: ['{{', '}}'],
        components: {
            prefix: 'beni-'
        }
    },

    // ⚡ Otimizações avançadas
    optimization: {
        // Remover arquivos desnecessários
        removeUnnecessaryFiles: [
            '.DS_Store',
            'Thumbs.db',
            '*.tmp',
            '*.bak',
            '*.log'
        ],

        // Threshold para compressão (só comprimir se economizar pelo menos 20%)
        compressionThreshold: 0.8,

        // Arquivos a serem comprimidos
        compressibleExtensions: ['.html', '.js', '.css', '.json', '.svg', '.txt'],

        // Bundle splitting (futuro)
        bundleSplitting: {
            enabled: false,
            chunkSize: 50000,           // 50KB chunks
            vendor: true                // Separar bibliotecas externas
        }
    },

    // 📊 Análise e relatórios
    reporting: {
        showBuildStats: true,          // Mostrar estatísticas do build
        showCompressionStats: true,    // Mostrar ganhos de compressão
        warnLargeFiles: true,          // Avisar sobre arquivos grandes
        largeFileThreshold: 250000     // 250KB threshold
    }
};`;

    try {
        fs.writeFileSync(configPath, configTemplate);
        console.log('✅ beni.config.js criado com sucesso!');
        console.log('');
        console.log('🎯 Configuração padrão inclui:');
        console.log('   ✅ Minificação automática');
        console.log('   ✅ Compressão gzip');
        console.log('   ✅ Otimizações de performance');
        console.log('   ✅ Remoção de console.log');
        console.log('   ✅ Cache headers');
        console.log('');
        console.log('💡 Próximos passos:');
        console.log('   1. beni install-optimization  # Instalar ferramentas de minificação');
        console.log('   2. beni build                 # Build otimizado');
        console.log('   3. beni analyze               # Verificar resultados');

    } catch (error) {
        console.error('❌ Erro ao criar configuração:', error.message);
    }
};