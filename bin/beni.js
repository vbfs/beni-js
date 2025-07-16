#!/usr/bin/env node

const command = process.argv[2];
const args = process.argv.slice(3);

const commands = {
    'create': require('../lib/commands/create'),
    'dev': require('../lib/commands/dev'),
    'build': require('../lib/commands/build'),
    'serve': require('../lib/commands/serve'),
    'install-optimization': require('../lib/commands/install-optimization'),
    'analyze': require('../lib/commands/analyze'),
    'create-config': require('../lib/commands/create-config'),
    'help': showHelp,
    '--help': showHelp,
    '-h': showHelp
};

if (!command || command === 'help') {
    showHelp();
} else if (commands[command]) {
    commands[command](args).catch(error => {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    });
} else {
    console.error(`❌ Comando desconhecido: ${command}`);
    console.log('💡 Execute "beni help" para ver os comandos disponíveis');
    process.exit(1);
}

function showHelp() {
    console.log(`
🌟 Beni.js - Framework SPA Leve e Performático

📋 COMANDOS PRINCIPAIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Desenvolvimento:
   beni create <nome>              Criar novo projeto
   beni dev                        Servidor de desenvolvimento
   beni build                      Build otimizado para produção
   beni serve                      Servir build de produção

⚡ Otimização & Performance:
   beni install-optimization       Instalar ferramentas de minificação
   beni analyze                    Analisar tamanho dos arquivos
   beni analyze --detailed         Análise detalhada por arquivo

🔧 Configuração:
   beni create-config              Criar arquivo de configuração
   beni help                       Mostrar esta ajuda

📖 EXEMPLOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   # Criar e executar projeto
   beni create meu-app
   cd meu-app
   beni dev

   # Build para produção com otimizações
   beni install-optimization
   beni build
   beni serve

   # Analisar performance
   beni analyze --detailed

🎯 RECURSOS DE PRODUÇÃO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Minificação automática (HTML, CSS, JS)
✅ Compressão gzip
✅ Cache headers otimizados
✅ Remoção de console.log
✅ Análise de bundle size
✅ Code splitting ready
✅ Performance monitoring

💡 Para mais informações: https://github.com/vbfs/beni-js
`);
}