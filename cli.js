const WebSocket = require('ws');
const readline = require('readline');
const chalk = require('chalk');
const ora = require('ora');
const { handleInternal, internalCommands } = require('./lib/commands/internal');

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
  rl.on('line', line => {
    const cmd = line.trim().split(' ')[0].replace('/', '');
    if (internalCommands.includes(cmd)) {
      handleInternal(cmd, rl);
      return;
    }

    if (line.startsWith('/')) {
      const [cmd, ...args] = line.trim().substring(1).split(' ');
      const spinner = ora(`⏳ Executando /${cmd}…`).start();
      ws.send(JSON.stringify({ action: cmd, user: username, payload: args.join(' ') }));
      spinner.stop();
    } else {
      ws.send(JSON.stringify({ user: username, text: line.trim() }));
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
