const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async function installOptimization(args) {
    console.log('📦 Instalando dependências de otimização...');

    const packageJsonPath = path.join(process.cwd(), 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        console.error('❌ package.json não encontrado');
        console.log('💡 Execute "npm init" primeiro');
        return;
    }

    const optimizationDeps = [
        'terser',
        'html-minifier-terser',
        'postcss',
        'cssnano'
    ];

    const force = args.includes('--force') || args.includes('-f');

    if (!force) {
        console.log('🔍 Verificando dependências instaladas...');

        // Verificar quais já estão instaladas
        const alreadyInstalled = [];
        const needsInstallation = [];

        optimizationDeps.forEach(dep => {
            try {
                require.resolve(dep);
                alreadyInstalled.push(dep);
            } catch (error) {
                needsInstallation.push(dep);
            }
        });

        if (alreadyInstalled.length > 0) {
            console.log('✅ Já instalados:');
            alreadyInstalled.forEach(dep => {
                console.log(`   - ${dep}`);
            });
        }

        if (needsInstallation.length === 0) {
            console.log('🎉 Todas as dependências de otimização já estão instaladas!');
            console.log('💡 Use --force para reinstalar');
            return;
        }

        console.log('📦 Precisam ser instalados:');
        needsInstallation.forEach(dep => {
            console.log(`   - ${dep}`);
        });
    }

    try {
        const depsToInstall = force ? optimizationDeps : needsInstallation;

        console.log('\n🚀 Instalando dependências...');

        // Detectar gerenciador de pacotes
        const hasYarnLock = fs.existsSync(path.join(process.cwd(), 'yarn.lock'));
        const hasPnpmLock = fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'));

        let installCommand;
        let packageManager;

        if (hasYarnLock) {
            packageManager = 'yarn';
            installCommand = `yarn add -D ${depsToInstall.join(' ')}`;
        } else if (hasPnpmLock) {
            packageManager = 'pnpm';
            installCommand = `pnpm add -D ${depsToInstall.join(' ')}`;
        } else {
            packageManager = 'npm';
            installCommand = `npm install --save-dev ${depsToInstall.join(' ')}`;
        }

        console.log(`📦 Usando ${packageManager}...`);
        console.log(`⚡ Executando: ${installCommand}`);

        execSync(installCommand, {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        console.log('\n✅ Dependências de otimização instaladas com sucesso!');
        console.log('\n🎯 Agora você pode usar:');
        console.log('   • Minificação avançada de HTML, CSS e JS');
        console.log('   • Compressão automática');
        console.log('   • Otimizações de performance');

        console.log('\n💡 Comandos úteis:');
        console.log('   beni build          - Build otimizado para produção');
        console.log('   beni serve           - Servir com compressão gzip');
        console.log('   beni analyze         - Analisar tamanho dos arquivos');

        // Verificar se config existe e sugerir criação
        const configPath = path.join(process.cwd(), 'beni.config.js');
        if (!fs.existsSync(configPath)) {
            console.log('\n🔧 Configuração recomendada:');
            console.log('   Execute "beni create-config" para criar beni.config.js');
        }

    } catch (error) {
        console.error('\n❌ Erro ao instalar dependências:');
        console.error(error.message);

        console.log('\n💡 Soluções possíveis:');
        console.log('   • Verificar conexão com a internet');
        console.log('   • Limpar cache: npm cache clean --force');
        console.log('   • Tentar novamente com --force');
        console.log('   • Instalar manualmente: npm install --save-dev terser html-minifier-terser postcss cssnano');
    }
};

// Função auxiliar para verificar se uma dependência está instalada
function isDependencyInstalled(packageName) {
    try {
        require.resolve(packageName);
        return true;
    } catch (error) {
        return false;
    }
}