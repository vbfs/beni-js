module.exports = {
    srcDir: 'src',
    distDir: 'dist',
    templatesDir: 'src/templates',
    publicDir: 'public',

    minify: true,
    optimize: true,
    compress: true,
    dropConsole: true,

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
            mangle: true,
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: [
                    'console.log',
                    'console.info',
                    'console.debug'
                ],
                passes: 2
            },
            format: {
                comments: false
            }
        },

        css: {
            enabled: true,
            preset: 'default',
            discardComments: true,
            discardEmpty: true,         // Remover regras vazias
            mergeRules: true,           // Combinar regras similares
            minifySelectors: true,      // Minificar seletores
            normalizeWhitespace: true   // Normalizar espaços
        }
    },

    // Configurações do app
    title: 'Beni.js App',
    css: [
        'https://cdn.tailwindcss.com'
    ],

    // Servidor de desenvolvimento
    devServer: {
        port: 3000,
        host: 'localhost',
        hotReload: true,
        open: false                    // Abrir navegador automaticamente
    },

    // Servidor de produção
    prodServer: {
        port: 8080,
        host: 'localhost',
        compression: true,             // Habilitar compressão gzip no servidor
        caching: true                  // Habilitar cache headers
    },

    // Template engine
    templateEngine: {
        delimiters: ['{{', '}}'],
        components: {
            prefix: 'beni-'
        }
    },

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

    // ✅ ANÁLISE E RELATÓRIOS
    reporting: {
        showBuildStats: true,          // Mostrar estatísticas do build
        showCompressionStats: true,    // Mostrar ganhos de compressão
        warnLargeFiles: true,          // Avisar sobre arquivos grandes
        largeFileThreshold: 250000     // 250KB threshold
    }
};