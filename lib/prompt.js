const readline = require('readline');
const chalk = require('chalk');
const { handleInternal, internalCommands } = require('./commands/internal');
const { handleAnalyze } = require('./commands/analyze');
const { handleImplement } = require('./commands/implement');
const { handleGPTFree } = require('./commands/gptfree');
const { updatePrompt, completer } = require('./utils');
const { history, saveHistory, session, saveSession } = require('./history');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer,
  prompt: ''
});

function startREPL() {
  console.log(chalk.green('✅ GPT‑Butler Deluxe™ iniciado.'));
  updatePrompt(rl);
  rl.prompt();

  rl.on('line', (line) => {
    const cmd = line.trim();
    if (!cmd) { rl.prompt(); return; }

    history.push(cmd);
    session.commands.push(cmd);
    saveHistory();
    saveSession();

    if (internalCommands.includes(cmd.split(/\s+/)[0])) {
      handleInternal(cmd, rl);
      return;
    }

    if (cmd.startsWith('analyze-project')) {
      handleAnalyze(cmd, rl);
      return;
    }

    if (cmd.startsWith('implement ')) {
      handleImplement(cmd, rl);
      return;
    }

    if (cmd.startsWith('gpt ')) {
      handleGPTFree(cmd, rl);
      return;
    }

    console.log(chalk.red(`❓ Comando desconhecido: ${cmd}`));
    rl.prompt();
  });
}

module.exports = { startREPL };
