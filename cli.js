const WebSocket = require('ws');
const readline = require('readline');

const ws = new WebSocket('ws://localhost:8080');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '🤖 GPT-CLI> '
});

ws.on('open', () => {
  console.log('✅ Conectado ao ChatGPT CLI Mode');
  rl.prompt();

  rl.on('line', (line) => {
    const cmd = line.trim();
    if (!cmd) {
      rl.prompt();
      return;
    }

    if (cmd === 'exit' || cmd === 'quit') {
      console.log('👋 Saindo...');
      ws.close();
      process.exit(0);
    }

    ws.send(cmd);
    rl.prompt();
  });
});

ws.on('message', (data) => {
  console.log(`📄 ${data.toString().trim()}`);
  rl.prompt();
});

ws.on('close', () => {
  console.log('🔒 Conexão encerrada');
  process.exit(0);
});

ws.on('error', (err) => {
  console.error(`❌ Erro: ${err.message}`);
  process.exit(1);
});
