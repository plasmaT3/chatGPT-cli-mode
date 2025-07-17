/**
 * GPT-CLI BUTLER DELUXE v1.5 — Contexto & Memória + Self-Update Remoto
 * Changelog:
 * - stdout/stderr com cores diferentes
 * - Paginação para saída longa
 * - Mensagens de erro mais amigáveis
 * - Memória de sessão com .gpt-butler-session.json
 * - Comando `context` para ver estado da sessão
 * - Comando `self-update` para atualizar a partir de cli.update.js
 * - NOVO: comando `update-from-remote <url>` para baixar e aplicar patch remoto
 */

const WebSocket = require('ws');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const https = require('https');
const pager = require('child_process');

const ws = new WebSocket('ws://localhost:8080');
const HISTORY_FILE = path.join(os.homedir(), '.gpt-cli-history');
const SESSION_FILE = path.join(process.cwd(), '.gpt-butler-session.json');

let history = [];
let session = {
  startedAt: new Date().toISOString(),
  baseDir: process.cwd(),
  commands: [],
  files: []
};

if (fs.existsSync(HISTORY_FILE)) {
  history = fs.readFileSync(HISTORY_FILE, 'utf-8').split('\n').filter(Boolean);
}

if (!fs.existsSync(SESSION_FILE)) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf-8');
} else {
  session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
}

function saveHistory() {
  fs.writeFileSync(HISTORY_FILE, history.join('\n'), 'utf-8');
}

function saveSession() {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf-8');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: completer,
  prompt: ''
});

const internalCommands = [
  'help', 'clear', 'exit', 'quit', 'history', 'context',
  'tree', 'edit', 'analyze', 'todos', 'search', 'self-update', 'update-from-remote'
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

  const buddyName = chalk.bgBlack.cyan.bold(' 🤖 GPT-BUTLER ');
  const sparkle = chalk.magentaBright('✨');
  const dir = chalk.bgBlack.white(` ${cwd} `);
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
    session.commands.push(cmd);

    const cmdBase = cmd.split(/\s+/)[0];
    const target = cmd.split(/\s+/)[1];
    const fileOps = ['edit', 'touch', 'rm', 'mkdir'];

    if (fileOps.includes(cmdBase) && target) {
      if (!session.files.includes(target)) {
        session.files.push(target);
      }
    }

    saveHistory();
    saveSession();

    if (cmd === 'exit' || cmd === 'quit') {
      console.log(chalk.magenta('👋 Saindo...'));
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

    if (cmd === 'self-update') {
      const updateFile = path.join(process.cwd(), 'cli.update.js');
      if (!fs.existsSync(updateFile)) {
        console.log(chalk.red('❌ Arquivo cli.update.js não encontrado na raiz do projeto.'));
        rl.prompt();
        return;
      }

      const newCode = fs.readFileSync(updateFile, 'utf-8');
      const cliPath = path.join(process.cwd(), 'cli.js');

      fs.writeFileSync(cliPath, newCode, 'utf-8');
      console.log(chalk.green('✅ cli.js atualizado com sucesso a partir de cli.update.js! Reinicie para aplicar.'));
      rl.prompt();
      return;
    }

    if (cmd.startsWith('update-from-remote')) {
      const url = cmd.split(/\s+/)[1];
      if (!url) {
        console.log(chalk.red('❌ Forneça a URL do patch! Ex: update-from-remote <URL>'));
        rl.prompt();
        return;
      }
      const updateFile = path.join(process.cwd(), 'cli.update.js');
      const file = fs.createWriteStream(updateFile);

      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(chalk.green('✅ Patch baixado como cli.update.js'));
          const newCode = fs.readFileSync(updateFile, 'utf-8');
          const cliPath = path.join(process.cwd(), 'cli.js');
          fs.writeFileSync(cliPath, newCode, 'utf-8');
          console.log(chalk.green('✅ cli.js atualizado com sucesso! Reinicie para aplicar.'));
          rl.prompt();
        });
      }).on('error', (err) => {
        fs.unlink(updateFile, () => {});
        console.error(chalk.red(`❌ Erro ao baixar patch: ${err.message}`));
        rl.prompt();
      });
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
  saveSession();
  console.log(chalk.red('🔒 Conexão encerrada'));
  process.exit(0);
});

ws.on('error', (err) => {
  console.error(chalk.red(`❌ Erro ao conectar ao daemon: ${err.message}`));
  console.error(chalk.yellow('💡 Verifique se você iniciou o daemon com `npm start` em outra janela.'));
  process.exit(1);
});
