/**
 * GPT-CLI BUTLER DELUXE v1.0
 * Changelog:
 * - Navegação com cd no prompt
 * - tree: estrutura de diretórios
 * - edit <arquivo>: edita arquivo inline
 * - analyze <arquivo>: mostra info do arquivo
 * - search <texto> [arquivo]: procura texto
 * - todos: lista TODOs/FIXMEs
 * - comandos internos: help, clear, exit, history
 * - histórico salvo em ~/.gpt-cli-history
 */

const WebSocket = require('ws');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

const ws = new WebSocket('ws://localhost:8080');
const HISTORY_FILE = path.join(os.homedir(), '.gpt-cli-history');

let history = [];

// carrega histórico
if (fs.existsSync(HISTORY_FILE)) {
  history = fs.readFileSync(HISTORY_FILE, 'utf-8').split('\n').filter(Boolean);
}

function saveHistory() {
  fs.writeFileSync(HISTORY_FILE, history.join('\n'), 'utf-8');
}

const internalCommands = ['help', 'clear', 'exit', 'quit', 'history', 'tree', 'edit', 'analyze', 'todos', 'search'];
const shellCommands = ['ls', 'cd', 'cat', 'mkdir', 'touch', 'rm', 'pwd', 'npm', 'node', 'echo'];

function listFilesAndDirs(partial) {
  try {
    const files = fs.readdirSync(process.cwd());
    return files.filter(f => f.startsWith(partial));
  } catch {
    return [];
  }
}

function completer(line) {
  const lastToken = line.split(' ').pop();
  const hits = [
    ...internalCommands,
    ...shellCommands,
    ...listFilesAndDirs(lastToken)
  ].filter(c => c.startsWith(lastToken));

  return [hits.length ? hits : [], lastToken];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer,
  prompt: ''
});

function updatePrompt() {
  const cwd = process.cwd();
  rl.setPrompt(`${chalk.cyan('🤖 GPT-BUTLER')} ${chalk.yellow(cwd)}> `);
}

function printHelp() {
  console.log(chalk.green(`
📖 Comandos internos:
  help                 - Mostra esta ajuda
  clear                - Limpa a tela
  exit/quit            - Sai do GPT-CLI
  history              - Mostra histórico da sessão
  tree                 - Mostra estrutura de diretórios
  edit <arquivo>       - Edita arquivo inline
  analyze <arquivo>    - Mostra stats do arquivo
  search <texto> [arq] - Busca texto no arquivo ou pasta
  todos                - Lista TODOs/FIXMEs nos arquivos
`));
}

function printTree(dir = '.', prefix = '') {
  const items = fs.readdirSync(dir);
  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    const fullPath = path.join(dir, item);
    console.log(`${prefix}${isLast ? '└──' : '├──'} ${item}`);
    if (fs.statSync(fullPath).isDirectory()) {
      printTree(fullPath, `${prefix}${isLast ? '   ' : '│  '}`);
    }
  });
}

function editFile(filename) {
  const fullPath = path.resolve(filename);
  let content = '';
  if (fs.existsSync(fullPath)) {
    content = fs.readFileSync(fullPath, 'utf-8');
  }

  console.log(chalk.gray(`\n📄 Editando ${filename}. Digite o novo conteúdo abaixo (Ctrl+D para salvar):`));

  const editor = readline.createInterface({ input: process.stdin, output: process.stdout });
  let newContent = '';
  editor.on('line', line => { newContent += line + '\n'; });
  editor.on('close', () => {
    fs.writeFileSync(fullPath, newContent.trim(), 'utf-8');
    console.log(chalk.green(`✅ Arquivo ${filename} salvo.`));
    rl.prompt();
  });
}

function analyzeFile(filename) {
  const fullPath = path.resolve(filename);
  if (!fs.existsSync(fullPath)) {
    console.log(chalk.red(`❌ Arquivo não encontrado: ${filename}`));
    rl.prompt();
    return;
  }

  const stats = fs.statSync(fullPath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  console.log(chalk.blue(`
📊 Análise de ${filename}:
- Tamanho: ${stats.size} bytes
- Linhas: ${lines.length}
- Últimas 5 linhas:
`));
  lines.slice(-5).forEach(l => console.log(l));
  rl.prompt();
}

function searchInFile(text, file) {
  if (!file) {
    fs.readdirSync(process.cwd()).forEach(f => searchInFile(text, f));
    return;
  }
  const fullPath = path.resolve(file);
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) return;

  const content = fs.readFileSync(fullPath, 'utf-8');
  content.split('\n').forEach((line, i) => {
    if (line.includes(text)) {
      console.log(`${chalk.yellow(file)}:${i + 1}: ${line}`);
    }
  });
}

function findTodos(dir = '.') {
  fs.readdirSync(dir).forEach(f => {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      findTodos(fullPath);
    } else {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach((line, i) => {
        if (line.includes('TODO') || line.includes('FIXME')) {
          console.log(`${chalk.magenta(fullPath)}:${i + 1}: ${line}`);
        }
      });
    }
  });
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

    const parts = cmd.split(/\s+/);
    const base = parts[0];
    const args = parts.slice(1);

    switch (base) {
      case 'exit':
      case 'quit':
        console.log(chalk.magenta('👋 Saindo...'));
        saveHistory();
        ws.close();
        process.exit(0);
      case 'clear':
        console.clear();
        break;
      case 'help':
        printHelp();
        break;
      case 'history':
        console.log(chalk.gray('\n📜 Histórico:'));
        history.forEach((h, i) => console.log(`${i + 1}: ${h}`));
        break;
      case 'cd':
        try {
          process.chdir(args[0] || os.homedir());
        } catch {
          console.log(chalk.red('❌ Diretório inválido.'));
        }
        break;
      case 'tree':
        printTree();
        break;
      case 'edit':
        editFile(args[0]);
        return;
      case 'analyze':
        analyzeFile(args[0]);
        break;
      case 'search':
        searchInFile(args[0], args[1]);
        break;
      case 'todos':
        findTodos();
        break;
      default:
        ws.send(cmd);
    }

    updatePrompt();
    rl.prompt();
  });
});

ws.on('message', (data) => {
  console.log(`${chalk.gray('📄 Saída:')} ${data.toString().trim()}`);
  updatePrompt();
  rl.prompt();
});

ws.on('close', () => {
  saveHistory();
  console.log(chalk.red('🔒 Conexão encerrada'));
  process.exit(0);
});

ws.on('error', (err) => {
  console.error(chalk.red(`❌ Erro: ${err.message}`));
  process.exit(1);
});
