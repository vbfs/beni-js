const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

module.exports = async function analyze(args) {
    console.log('📊 Analisando arquivos do build...\n');

    const distPath = path.join(process.cwd(), 'dist');

    if (!fs.existsSync(distPath)) {
        console.error('❌ Pasta dist/ não encontrada');
        console.log('💡 Execute "beni build" primeiro');
        return;
    }

    const files = getAllFiles(distPath);
    const analysis = analyzeFiles(files, distPath);

    // Mostrar relatório detalhado
    showDetailedReport(analysis, args);

    // Mostrar sugestões de otimização
    showOptimizationSuggestions(analysis);
};

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

function analyzeFiles(files, distPath) {
    const analysis = {
        totalFiles: 0,
        totalSize: 0,
        compressedSize: 0,
        types: {},
        largeFiles: [],
        compressionRatio: 0,
        details: []
    };

    files.forEach(file => {
        const relativePath = path.relative(distPath, file);
        const ext = path.extname(file);
        const stats = fs.statSync(file);
        const size = stats.size;

        // Pular arquivos .gz
        if (ext === '.gz') return;

        analysis.totalFiles++;
        analysis.totalSize += size;

        // Calcular compressão estimada
        let compressedSize = size;
        const gzipPath = file + '.gz';

        if (fs.existsSync(gzipPath)) {
            compressedSize = fs.statSync(gzipPath).size;
        } else if (isCompressible(ext)) {
            // Estimar compressão para arquivos de texto
            const content = fs.readFileSync(file);
            try {
                const compressed = zlib.gzipSync(content);
                compressedSize = compressed.length;
            } catch (error) {
                // Fallback para estimativa
                compressedSize = Math.round(size * 0.7);
            }
        }

        analysis.compressedSize += compressedSize;

        // Agrupar por tipo
        const type = getFileType(ext);
        if (!analysis.types[type]) {
            analysis.types[type] = {
                count: 0,
                size: 0,
                compressedSize: 0,
                files: []
            };
        }

        analysis.types[type].count++;
        analysis.types[type].size += size;
        analysis.types[type].compressedSize += compressedSize;
        analysis.types[type].files.push({
            path: relativePath,
            size: size,
            compressedSize: compressedSize,
            compressionRatio: compressedSize < size ? ((size - compressedSize) / size * 100) : 0
        });

        // Arquivos grandes (>100KB)
        if (size > 100 * 1024) {
            analysis.largeFiles.push({
                path: relativePath,
                size: size,
                compressedSize: compressedSize,
                type: type
            });
        }

        // Detalhes do arquivo
        analysis.details.push({
            path: relativePath,
            size: size,
            compressedSize: compressedSize,
            type: type,
            ext: ext,
            compressionRatio: compressedSize < size ? ((size - compressedSize) / size * 100) : 0
        });
    });

    analysis.compressionRatio = analysis.totalSize > 0 ?
        ((analysis.totalSize - analysis.compressedSize) / analysis.totalSize * 100) : 0;

    return analysis;
}

function showDetailedReport(analysis, args) {
    const showDetailed = args.includes('--detailed') || args.includes('-d');

    console.log('📋 RELATÓRIO DE ANÁLISE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Resumo geral
    console.log(`📁 Total de arquivos: ${analysis.totalFiles}`);
    console.log(`📦 Tamanho original: ${formatBytes(analysis.totalSize)}`);
    console.log(`🗜️ Tamanho comprimido: ${formatBytes(analysis.compressedSize)}`);
    console.log(`💾 Economia de espaço: ${analysis.compressionRatio.toFixed(1)}%`);

    console.log('\n📊 POR TIPO DE ARQUIVO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Ordenar tipos por tamanho
    const sortedTypes = Object.entries(analysis.types)
        .sort(([,a], [,b]) => b.size - a.size);

    sortedTypes.forEach(([type, data]) => {
        const compressionRatio = data.size > 0 ?
            ((data.size - data.compressedSize) / data.size * 100) : 0;

        console.log(`${getTypeIcon(type)} ${type.toUpperCase()}`);
        console.log(`   Arquivos: ${data.count}`);
        console.log(`   Original: ${formatBytes(data.size)}`);
        console.log(`   Comprimido: ${formatBytes(data.compressedSize)} (${compressionRatio.toFixed(1)}% menor)`);
        console.log('');
    });

    // Arquivos grandes
    if (analysis.largeFiles.length > 0) {
        console.log('⚠️ ARQUIVOS GRANDES (>100KB)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        analysis.largeFiles
            .sort((a, b) => b.size - a.size)
            .forEach(file => {
                const compressionRatio = file.size > 0 ?
                    ((file.size - file.compressedSize) / file.size * 100) : 0;

                console.log(`📄 ${file.path}`);
                console.log(`   ${formatBytes(file.size)} → ${formatBytes(file.compressedSize)} (${compressionRatio.toFixed(1)}% menor)`);
            });
        console.log('');
    }

    // Detalhes por arquivo (se solicitado)
    if (showDetailed) {
        console.log('📝 DETALHES POR ARQUIVO');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        analysis.details
            .sort((a, b) => b.size - a.size)
            .forEach(file => {
                console.log(`${getTypeIcon(file.type)} ${file.path}`);
                console.log(`   ${formatBytes(file.size)} → ${formatBytes(file.compressedSize)} (${file.compressionRatio.toFixed(1)}%)`);
            });
    } else {
        console.log('💡 Use --detailed para ver todos os arquivos');
    }
}

function showOptimizationSuggestions(analysis) {
    console.log('\n🎯 SUGESTÕES DE OTIMIZAÇÃO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const suggestions = [];

    // Verificar se compressão está sendo aplicada
    if (analysis.compressionRatio < 20) {
        suggestions.push('📦 Habilite compressão gzip no servidor para melhor performance');
    }

    // Verificar arquivos grandes
    if (analysis.largeFiles.length > 0) {
        suggestions.push(`⚠️ ${analysis.largeFiles.length} arquivo(s) grandes encontrados - considere code splitting`);
    }

    // Verificar se minificação está sendo aplicada
    const jsFiles = analysis.types.javascript?.files || [];
    const largeJsFiles = jsFiles.filter(f => f.compressionRatio < 30 && f.size > 10000);
    if (largeJsFiles.length > 0) {
        suggestions.push('🗜️ Alguns arquivos JS podem ter minificação melhorada');
    }

    // Verificar CSS
    const cssFiles = analysis.types.css?.files || [];
    const largeCssFiles = cssFiles.filter(f => f.compressionRatio < 25 && f.size > 5000);
    if (largeCssFiles.length > 0) {
        suggestions.push('🎨 Alguns arquivos CSS podem ser melhor otimizados');
    }

    // Verificar imagens
    const imageSize = (analysis.types.images?.size || 0);
    if (imageSize > 500 * 1024) { // >500KB em imagens
        suggestions.push('🖼️ Considere otimizar imagens (WebP, compressão)');
    }

    // Total muito grande
    if (analysis.totalSize > 2 * 1024 * 1024) { // >2MB
        suggestions.push('📊 Bundle total grande - considere lazy loading');
    }

    if (suggestions.length === 0) {
        console.log('🎉 Sua aplicação está bem otimizada!');
        console.log('💚 Tamanho adequado e boa compressão aplicada');
    } else {
        suggestions.forEach(suggestion => {
            console.log(`• ${suggestion}`);
        });
    }

    console.log('\n🔧 COMANDOS ÚTEIS:');
    console.log('• beni build                 - Rebuild com otimizações');
    console.log('• beni install-optimization  - Instalar ferramentas de minificação');
    console.log('• beni serve                 - Testar com compressão gzip');
    console.log('• beni analyze --detailed    - Análise detalhada por arquivo');
}

function getFileType(ext) {
    const types = {
        '.html': 'html',
        '.js': 'javascript',
        '.mjs': 'javascript',
        '.css': 'css',
        '.json': 'data',
        '.xml': 'data',
        '.txt': 'data',
        '.png': 'images',
        '.jpg': 'images',
        '.jpeg': 'images',
        '.gif': 'images',
        '.svg': 'images',
        '.ico': 'images',
        '.woff': 'fonts',
        '.woff2': 'fonts',
        '.ttf': 'fonts',
        '.eot': 'fonts',
        '.pdf': 'documents'
    };

    return types[ext] || 'other';
}

function getTypeIcon(type) {
    const icons = {
        html: '📄',
        javascript: '📜',
        css: '🎨',
        data: '📊',
        images: '🖼️',
        fonts: '🔤',
        documents: '📋',
        other: '📁'
    };

    return icons[type] || '📁';
}

function isCompressible(ext) {
    const compressibleTypes = ['.html', '.js', '.mjs', '.css', '.json', '.svg', '.txt', '.xml'];
    return compressibleTypes.includes(ext);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}