#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Argumentos da linha de comando
const [,, command, ...args] = process.argv;

// Função de ajuda
function showHelp() {
    const packagePath = path.join(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    console.log(`
🔥 Beni.js CLI v${pkg.version}

Usage:
  beni <command> [options]

Commands:
  create <name>     Create a new Beni.js project
  dev               Start development server with hot reload
  build             Build project for production
  serve             Serve production build

Options:
  --help, -h        Show help
  --version, -v     Show version

Examples:
  beni create my-app
  beni dev
  beni build
  beni serve
    `);
}

// Função de versão
function showVersion() {
    const packagePath = path.join(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log(`beni-js v${pkg.version}`);
}

// Carregar comandos
function loadCommand(commandName) {
    const commandPath = path.join(__dirname, '../lib/commands', `${commandName}.js`);

    if (fs.existsSync(commandPath)) {
        return require(commandPath);
    }

    return null;
}

// Processar comando
async function main() {
    // Verificar flags globais
    if (!command || command === '--help' || command === '-h') {
        showHelp();
        return;
    }

    if (command === '--version' || command === '-v') {
        showVersion();
        return;
    }

    // Carregar e executar comando
    const commandHandler = loadCommand(command);

    if (commandHandler) {
        try {
            await commandHandler(args);
        } catch (error) {
            console.error(`❌ Erro ao executar comando '${command}':`, error.message);
            if (process.env.DEBUG) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    } else {
        console.error(`❌ Comando desconhecido: ${command}`);
        console.log('');
        console.log('Comandos disponíveis: create, dev, build, serve');
        console.log('Use "beni --help" para mais informações');
        process.exit(1);
    }
}

// Executar
main().catch(error => {
    console.error('💥 Erro inesperado:', error.message);
    if (process.env.DEBUG) {
        console.error(error.stack);
    }
    process.exit(1);
});