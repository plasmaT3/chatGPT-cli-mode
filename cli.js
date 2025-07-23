const WebSocket = require('ws');
const readline = require('readline');
const chalk = require('chalk');
const ora = require('ora');
const { handleInternal, internalCommands } = require('./lib/commands/internal');

// Novos comandos:
const { analyzeCode } = require('./commands/analyze-code');
const { loadContext, listContextKeys, clearContext } = require('./commands/context-load');
const { grepGPT } = require('./commands/grep-gpt');
const { summarizeProject } = require('./commands/summarize-project');
const { refactorSmart } = require('./commands/refactor-smart');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let ws, username = 'anon';

function printLogo() {
  console.clear();
  console.log(chalk.green.bold(`
==============================
      ChatGPT CLI — v3.0
==============================
`));
}

function connect(ip, port) {
  ws = new WebSocket(`ws://${ip}:${port}`);

  ws.on('open', () => {
    printLogo();
    rl.question(chalk.cyan('👤 Qual seu nome? '), answer => {
      username = answer || 'anon';
      console.log(chalk.green(`✅ Conectado como ${username}`));
      showMenu();
    });
  });

  ws.on('message', message => {
    const msgObj = JSON.parse(message);
    if (msgObj.history) {
      console.log(chalk.yellow(`📜 Histórico de mensagens (${msgObj.history.length}):`));
      msgObj.history.forEach(printMessage);
    } else {
      printMessage(msgObj);
    }
  });

  ws.on('close', () => {
    console.log(chalk.red('❌ Conexão encerrada.'));
    process.exit(0);
  });
}

function showMenu() {
  console.log(chalk.yellow(`
📜 Menu:
1️⃣ Continuar conversa
2️⃣ Iniciar nova conversa
3️⃣ Sair
`));

  rl.question(chalk.cyan('👉 Escolha uma opção [1-3]: '), option => {
    if (option === '1') {
      startChat();
    } else if (option === '2') {
      ws.send(JSON.stringify({ action: 'new', user: username }));
      startChat();
    } else if (option === '3') {
      console.log(chalk.green('👋 Até logo!'));
      ws.close();
      process.exit(0);
    } else {
      console.log(chalk.red('❌ Opção inválida.'));
      showMenu();
    }
  });
}

function startChat() {
  console.log(chalk.gray('(Digite sua mensagem ou comando e pressione Enter) 💬'));
  rl.on('line', async line => {
    const input = line.trim();

    if (!input) return;

    const [cmd, ...args] = input.startsWith('/') ? input.substring(1).split(' ') : [null];

    if (internalCommands.includes(cmd)) {
      handleInternal(cmd, rl);
      return;
    }

    if (cmd) {
      const spinner = ora(`⏳ Executando /${cmd}…`).start();
      try {
        // 🔌 Comandos locais personalizados
        switch (cmd) {
          case 'analyze-code':
            await analyzeCode(args[0]);
            break;
          case 'context-load':
            await loadContext(args[0], args[1]);
            break;
          case 'context-list':
            console.log(chalk.cyan(`🔑 Contextos ativos: ${listContextKeys().join(', ')}`));
            break;
          case 'context-clear':
            clearContext();
            break;
          case 'grep-gpt':
            await grepGPT(args.join(' '));
            break;
          case 'summarize-project':
            await summarizeProject(args[0] || '.');
            break;
          case 'refactor':
            const file = args[0];
            const goal = args[2] || 'legibilidade';
            const apply = args.includes('--apply');
            await refactorSmart(file, goal, apply);
            break;
          default:
            ws.send(JSON.stringify({ action: cmd, user: username, payload: args.join(' ') }));
        }
      } catch (err) {
        console.log(chalk.red(`Erro ao executar /${cmd}: ${err.message}`));
      }
      spinner.stop();
    } else {
      ws.send(JSON.stringify({ user: username, text: input }));
    }
  });
}

function printMessage(msgObj) {
  const time = chalk.gray(`[${new Date(msgObj.timestamp).toLocaleTimeString()}]`);
  let userTag = chalk.yellow(`👤 ${msgObj.user}`);
  let text = chalk.white(msgObj.text);

  if (msgObj.user === username) {
    userTag = chalk.blueBright(`🫵 ${msgObj.user}`);
  } else if (msgObj.user === 'IA') {
    userTag = chalk.magenta(`🤖 ${msgObj.user}`);
    text = chalk.magentaBright(msgObj.text);
  }

  console.log(`${time} ${userTag}: ${text}`);
}

rl.question(chalk.cyan('🌐 IP do servidor [default: localhost]: '), ip => {
  rl.question(chalk.cyan('🌐 Porta do servidor [default: 8080]: '), port => {
    connect(ip || 'localhost', port || '8080');
  });
});
