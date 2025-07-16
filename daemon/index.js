const WebSocket = require('ws');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

// Cria diretório de logs se não existir
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const logFile = path.join(logDir, `${new Date().toISOString().slice(0,10)}.log`);

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.log(line.trim());
}

// Inicializa WebSocket
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`🚀 WebSocket Server rodando em ws://localhost:${PORT}`);
  log(`Servidor iniciado em ws://localhost:${PORT}`);
});

wss.on('connection', (ws) => {
  console.log('🔗 Cliente conectado');
  ws.send('Bem-vindo ao ChatGPT CLI Mode');

  ws.on('message', (msg) => {
    const cmd = msg.toString().trim();
    log(`CMD recebido: ${cmd}`);

    if (!cmd) {
      ws.send('⚠️ Comando vazio.');
      return;
    }

    const proc = exec(cmd, { cwd: process.cwd() });

    proc.stdout.on('data', data => {
      ws.send(data.toString());
      log(`OUT: ${data.toString()}`);
    });

    proc.stderr.on('data', data => {
      ws.send(data.toString());
      log(`ERR: ${data.toString()}`);
    });

    proc.on('close', code => {
      ws.send(`✅ Finalizado com código ${code}`);
      log(`EXIT: ${code}`);
    });
  });

  ws.on('close', () => {
    log('Cliente desconectado');
  });
});
