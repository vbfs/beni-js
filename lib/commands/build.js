const fs = require('fs');
const path = require('path');

module.exports = async function build(args) {
    console.log('🔨 Fazendo build para produção...');

    const srcPath = path.join(process.cwd(), 'src');
    const publicPath = path.join(process.cwd(), 'public');
    const distPath = path.join(process.cwd(), 'dist');

    // Verificar se há arquivo de configuração
    const configPath = path.join(process.cwd(), 'beni.config.js');
    let config = {
        minify: true,
        optimize: true,
        dropConsole: true
    };

    if (fs.existsSync(configPath)) {
        try {
            config = { ...config, ...require(configPath) };
        } catch (error) {
            console.log('⚠️ Erro ao carregar beni.config.js, usando configuração padrão');
        }
    }

    // Limpar dist
    if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { recursive: true });
    }
    fs.mkdirSync(distPath, { recursive: true });

    // Copiar public para dist
    if (fs.existsSync(publicPath)) {
        copyDir(publicPath, distPath);
        console.log('📁 Arquivos públicos copiados');
    }

    // Copiar src para dist/src
    if (fs.existsSync(srcPath)) {
        const srcDist = path.join(distPath, 'src');
        fs.mkdirSync(srcDist, { recursive: true });
        copyDir(srcPath, srcDist);
        console.log('📁 Código fonte copiado');
    }

    // Aplicar minificação se habilitada
    if (config.minify) {
        console.log('🗜️ Iniciando minificação...');
        await minifyFiles(distPath, config);
    }

    // Otimizações adicionais
    if (config.optimize) {
        console.log('⚡ Aplicando otimizações...');
        await optimizeFiles(distPath, config);
    }

    console.log('✅ Build concluído em dist/');
    console.log('🚀 Execute "beni serve" para testar');

    // Mostrar estatísticas de tamanho
    showBuildStats(distPath);
};

function copyDir(src, dest) {
    const items = fs.readdirSync(src);

    items.forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);

        if (fs.statSync(srcPath).isDirectory()) {
            fs.mkdirSync(destPath, { recursive: true });
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

async function minifyFiles(distPath, config) {
    const files = getAllFiles(distPath);

    for (const file of files) {
        const ext = path.extname(file);

        try {
            switch (ext) {
                case '.html':
                    await minifyHTML(file, config);
                    break;
                case '.js':
                    await minifyJS(file, config);
                    break;
                case '.css':
                    await minifyCSS(file, config);
                    break;
            }
        } catch (error) {
            console.log(`⚠️ Erro ao minificar ${file}:`, error.message);
        }
    }
}

async function minifyHTML(filePath, config) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Minificação básica de HTML
    content = content
        // Remove comentários HTML
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove espaços em branco desnecessários
        .replace(/\s+/g, ' ')
        // Remove espaços entre tags
        .replace(/>\s+</g, '><')
        // Remove espaços no início e fim
        .trim();

    // Se tiver html-minifier-terser disponível, usar ele
    try {
        const { minify } = require('html-minifier-terser');
        content = await minify(content, {
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            collapseWhitespace: true,
            useShortDoctype: true,
            minifyCSS: true,
            minifyJS: true
        });
    } catch (error) {
        // Fallback para minificação básica se html-minifier-terser não estiver disponível
        console.log('💡 Para melhor minificação HTML, instale: npm install html-minifier-terser');
    }

    fs.writeFileSync(filePath, content);
    console.log(`🗜️ HTML minificado: ${path.basename(filePath)}`);
}

async function minifyJS(filePath, config) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Minificação básica de JavaScript
    if (config.dropConsole) {
        // Remove console.log statements
        content = content.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?/g, '');
    }

    // Remove comentários de linha
    content = content.replace(/\/\/.*$/gm, '');
    // Remove comentários de bloco
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove espaços desnecessários
    content = content.replace(/\s+/g, ' ').trim();

    // Se tiver terser disponível, usar ele
    try {
        const { minify } = require('terser');
        const result = await minify(content, {
            compress: {
                drop_console: config.dropConsole,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug']
            },
            mangle: true,
            format: {
                comments: false
            }
        });
        content = result.code;
    } catch (error) {
        // Fallback para minificação básica se terser não estiver disponível
        console.log('💡 Para melhor minificação JS, instale: npm install terser');
    }

    fs.writeFileSync(filePath, content);
    console.log(`🗜️ JS minificado: ${path.basename(filePath)}`);
}

async function minifyCSS(filePath, config) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Minificação básica de CSS
    content = content
        // Remove comentários
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // Remove espaços desnecessários
        .replace(/\s+/g, ' ')
        // Remove espaços ao redor de símbolos
        .replace(/\s*([{}:;,>+~])\s*/g, '$1')
        // Remove último semicolon antes de }
        .replace(/;}/g, '}')
        .trim();

    // Se tiver cssnano disponível, usar ele
    try {
        const postcss = require('postcss');
        const cssnano = require('cssnano');

        const result = await postcss([
            cssnano({
                preset: 'default'
            })
        ]).process(content, { from: undefined });

        content = result.css;
    } catch (error) {
        // Fallback para minificação básica se cssnano não estiver disponível
        console.log('💡 Para melhor minificação CSS, instale: npm install postcss cssnano');
    }

    fs.writeFileSync(filePath, content);
    console.log(`🗜️ CSS minificado: ${path.basename(filePath)}`);
}

async function optimizeFiles(distPath, config) {
    // Otimizações adicionais

    // 1. Remover arquivos desnecessários
    const unnecessaryFiles = [
        '.DS_Store',
        'Thumbs.db',
        '*.tmp',
        '*.bak'
    ];

    removeUnnecessaryFiles(distPath, unnecessaryFiles);

    // 2. Comprimir arquivos grandes (se possível)
    if (config.compress) {
        await compressFiles(distPath);
    }

    console.log('⚡ Otimizações aplicadas');
}

function removeUnnecessaryFiles(dir, patterns) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            removeUnnecessaryFiles(filePath, patterns);
        } else {
            // Verificar se arquivo deve ser removido
            const shouldRemove = patterns.some(pattern => {
                if (pattern.includes('*')) {
                    const regex = new RegExp(pattern.replace('*', '.*'));
                    return regex.test(file);
                }
                return file === pattern;
            });

            if (shouldRemove) {
                fs.unlinkSync(filePath);
                console.log(`🗑️ Removido: ${file}`);
            }
        }
    });
}

async function compressFiles(distPath) {
    // Implementar compressão gzip se necessário
    const zlib = require('zlib');
    const files = getAllFiles(distPath);

    for (const file of files) {
        const ext = path.extname(file);

        // Comprimir apenas arquivos de texto
        if (['.html', '.js', '.css', '.json', '.svg'].includes(ext)) {
            try {
                const content = fs.readFileSync(file);
                const compressed = zlib.gzipSync(content);

                // Só manter compressão se houver ganho significativo
                if (compressed.length < content.length * 0.8) {
                    fs.writeFileSync(file + '.gz', compressed);
                    console.log(`📦 Comprimido: ${path.basename(file)}`);
                }
            } catch (error) {
                console.log(`⚠️ Erro ao comprimir ${file}:`, error.message);
            }
        }
    }
}

function getAllFiles(dir) {
    const files = [];

    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);

        items.forEach(item => {
            const itemPath = path.join(currentDir, item);

            if (fs.statSync(itemPath).isDirectory()) {
                scan(itemPath);
            } else {
                files.push(itemPath);
            }
        });
    }

    scan(dir);
    return files;
}

function showBuildStats(distPath) {
    const files = getAllFiles(distPath);
    let totalSize = 0;
    let compressedSize = 0;

    const stats = {
        html: 0,
        js: 0,
        css: 0,
        other: 0
    };

    files.forEach(file => {
        const size = fs.statSync(file).size;
        totalSize += size;

        const ext = path.extname(file);

        switch (ext) {
            case '.html':
                stats.html += size;
                break;
            case '.js':
                stats.js += size;
                break;
            case '.css':
                stats.css += size;
                break;
            default:
                stats.other += size;
                break;
        }

        // Verificar se tem versão comprimida
        if (fs.existsSync(file + '.gz')) {
            compressedSize += fs.statSync(file + '.gz').size;
        }
    });

    console.log('\n📊 Build Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📄 HTML: ${formatBytes(stats.html)}`);
    console.log(`📜 JavaScript: ${formatBytes(stats.js)}`);
    console.log(`🎨 CSS: ${formatBytes(stats.css)}`);
    console.log(`📁 Others: ${formatBytes(stats.other)}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📦 Total: ${formatBytes(totalSize)}`);

    if (compressedSize > 0) {
        const compression = ((totalSize - compressedSize) / totalSize * 100).toFixed(1);
        console.log(`📦 Gzip: ${formatBytes(compressedSize)} (${compression}% menor)`);
    }

    console.log(`📁 Files: ${files.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}