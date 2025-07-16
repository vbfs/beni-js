const fs = require('fs');
const path = require('path');

module.exports = async function build(args) {
    console.log('🔨 Fazendo build para produção...');

    const srcPath = path.join(process.cwd(), 'src');
    const publicPath = path.join(process.cwd(), 'public');
    const distPath = path.join(process.cwd(), 'dist');

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

    console.log('✅ Build concluído em dist/');
    console.log('🚀 Execute "beni serve" para testar');
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