const chalk = require('chalk');
const { history, session } = require('../history');

const internalCommands = [
  'help', 'clear', 'exit', 'quit', 'history', 'context'
];

function handleInternal(cmd, rl) {
  if (cmd === 'exit' || cmd === 'quit') {
    console.log(chalk.magenta('👋 Saindo...'));
    process.exit(0);
  }

  if (cmd === 'clear') {
    console.clear();
    rl.prompt();
    return;
  }

  if (cmd === 'help') {
    console.log(chalk.green('\n📖 Comandos disponíveis:'));
    console.log(internalCommands.map(c => `  ${c}`).join('\n'));
    rl.prompt();
    return;
  }

  if (cmd === 'history') {
    console.log(chalk.gray('\n📜 Histórico:'));
    history.forEach((h, i) => console.log(`${i + 1}: ${h}`));
    rl.prompt();
    return;
  }

  if (cmd === 'context') {
    console.log(chalk.blue(`\n🤖 Sessão iniciada: ${session.startedAt}`));
    console.log(chalk.blue(`📂 Diretório base: ${session.baseDir}`));
    console.log(chalk.blue(`📜 Comandos executados:`));
    session.commands.forEach((c, i) => {
      console.log(chalk.gray(`  [${i + 1}] ${c}`));
    });
    console.log(chalk.blue(`📝 Arquivos modificados:`));
    session.files.forEach(f => {
      console.log(chalk.gray(`  - ${f}`));
    });
    rl.prompt();
    return;
  }
}

module.exports = { handleInternal, internalCommands };
