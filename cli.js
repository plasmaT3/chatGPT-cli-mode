/**
 * GPT-CLI BUTLER DELUXE v1.2 — Qualidade de Vida + Prompt Bonitão
 * Changelog:
 * - stdout/stderr com cores diferentes
 * - Paginação para saída longa
 * - Melhor suporte a Unicode
 * - Mensagens de erro mais amigáveis e descritivas
 * - Informa se daemon não está rodando
 * - Novo prompt com cores e contraste
 */

const WebSocket = require('ws');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const pager = require('child_process');

const ws = new WebSocket('ws://localhost:8080');
const HISTORY_FILE = path.join(os.homedir(), '.gpt-cli-history');

let history = [];

if (fs.existsSync(HISTORY_FILE)) {
  history = fs.readFileSync(HISTORY_FILE, 'utf-8').split('\n').filter(Boolean);
}

function saveHistory() {
  fs.writeFileSync(HISTORY_FILE, history.join('\n'), 'utf-8');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: completer,
  prompt: ''
});

const internalCommands = [
  'help', 'clear', 'exit', 'quit', 'history', 'tree', 'edit', 'analyze', 'todos', 'search'
];
const shellCommands = [
  'ls', 'cd', 'cat', 'mkdir', 'touch', 'rm', 'pwd', 'npm', 'node', 'echo'
];

function completer(line) {
  const lastToken = line.split(' ').pop();
  const hits = [
    ...internalCommands,
    ...shellCommands,
    ...listFilesAndDirs(lastToken)
  ].filter(c => c.startsWith(lastToken));

  return [hits.length ? hits : [], lastToken];
}

function listFilesAndDirs(partial) {
  try {
    const files = fs.readdirSync(process.cwd());
    return files.filter(f => f.startsWith(partial));
  } catch {
    return [];
  }
}

function paginate(text) {
  const less = pager.spawnSync('less', [], { input: text, encoding: 'utf-8', stdio: 'inherit' });
  if (less.error) console.log(text);
}

function handleOutput(data) {
  const lines = data.toString().split('\n');
  const output = lines.map(line => {
    if (line.toLowerCase().includes('error')) {
      return chalk.red(line);
    }
    if (line.trim() === '') return line;
    return chalk.green(line);
  }).join('\n');

  if (lines.length > 20) {
    paginate(output);
  } else {
    console.log(output);
  }
}

function updatePrompt() {
  const cwd = process.cwd().replace(os.homedir(), '~');

  const buddyName = chalk.bgBlueBright.black.bold(' 🤖 GPT-BUTLER ');
  const sparkle = chalk.magentaBright('✨');
  const dir = chalk.bgBlackBright.white(` ${cwd} `);
  const arrow = chalk.greenBright.bold('→ ');

  rl.setPrompt(`${buddyName} ${sparkle} ${dir} ${arrow}`);
}

ws.on('open', () => {
  console.log(chalk.green('✅ Conectado ao GPT-BUTLER'));
  ws.send('');

  updatePrompt();
  rl.prompt();

  rl.on('line', (line) => {
    const cmd = line.trim();
    if (!cmd) { rl.prompt(); return; }

    history.push(cmd);

    if (cmd === 'exit' || cmd === 'quit') {
      console.log(chalk.magenta('👋 Saindo...'));
      saveHistory();
      ws.close();
      process.exit(0);
    }

    if (cmd === 'clear') {
      console.clear();
      rl.prompt();
      return;
    }

    if (cmd === 'help') {
      console.log(chalk.green('\n📖 Use `help` para ver os comandos disponíveis.'));
      rl.prompt();
      return;
    }

    if (cmd === 'history') {
      console.log(chalk.gray('\n📜 Histórico:'));
      history.forEach((h, i) => console.log(`${i + 1}: ${h}`));
      rl.prompt();
      return;
    }

    if (cmd.startsWith('cd ')) {
      try {
        process.chdir(cmd.split(/\s+/)[1] || os.homedir());
      } catch {
        console.log(chalk.red('❌ Diretório inválido.'));
      }
      updatePrompt();
      rl.prompt();
      return;
    }

    ws.send(cmd);
  });
});

ws.on('message', (data) => {
  handleOutput(data);
  updatePrompt();
  rl.prompt();
});

ws.on('close', () => {
  saveHistory();
  console.log(chalk.red('🔒 Conexão encerrada'));
  process.exit(0);
});

ws.on('error', (err) => {
  console.error(chalk.red(`❌ Erro ao conectar ao daemon: ${err.message}`));
  console.error(chalk.yellow('💡 Verifique se você iniciou o daemon com `npm start` em outra janela.'));
  process.exit(1);
});
