require('dotenv').config();
const WebSocket = require('ws');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const commands = require('./lib/commands/internal');

const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const HISTORY_FILE = path.join(__dirname, 'history.json');
let history = [];
const MAX_HISTORY = 20;

// Carrega histórico do disco
if (fs.existsSync(HISTORY_FILE)) {
  try {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    console.log(`📜 Histórico carregado com ${history.length} mensagens.`);
  } catch (err) {
    console.error('❌ Erro ao carregar histórico:', err);
    history = [];
  }
}

console.log(`🚀 Servidor colaborativo com IA rodando na porta ${process.env.PORT || 8080}`);

// salva histórico no disco
function saveHistory() {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history.slice(-MAX_HISTORY), null, 2), 'utf8');
}

// detecta linguagem natural para fullcycle
async function detectAndExecute(text, user) {
  const lower = text.toLowerCase();
  const pathRegex = /(c:\\[^\s]*)/i;

  const match = text.match(pathRegex);

  if (lower.includes('varre') && match) {
    const path = match[1];
    console.log(`🔍 Detectado pedido para /fullcycle no diretório: ${path}`);
    const result = await commands.execute('fullcycle', path);
    return {
      user: 'IA',
      text: result,
      timestamp: Date.now()
    };
  }

  return null;
}

wss.on('connection', ws => {
  console.log('🟢 Novo usuário conectado');
  ws.send(JSON.stringify({ history }));

  ws.on('message', async message => {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch {
      parsed = { user: 'anon', text: message.toString() };
    }

    if (parsed.action === 'new') {
      history = [];
      saveHistory();
      ws.send(JSON.stringify({ history }));
      return;
    }

    if (parsed.action && parsed.action !== 'new') {
      const result = await commands.execute(parsed.action, parsed.payload || '');
      const cmdMsg = {
        user: 'IA',
        text: result,
        timestamp: Date.now()
      };
      history.push(cmdMsg);
      if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
      saveHistory();
      broadcast(cmdMsg);
      return;
    }

    const detected = await detectAndExecute(parsed.text, parsed.user);
    if (detected) {
      history.push(detected);
      if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
      saveHistory();
      broadcast(detected);
      return;
    }

    const msgObj = {
      user: parsed.user || 'anon',
      text: parsed.text || '',
      timestamp: Date.now()
    };

    history.push(msgObj);
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
    saveHistory();
    broadcast(msgObj);

    const contextMessages = history.map(h => ({
      role: h.user === 'IA' ? 'assistant' : 'user',
      content: `${h.user}: ${h.text}`
    }));

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é uma IA colaborativa em um chat multiusuário.' },
          ...contextMessages
        ]
      });

      const aiReply = completion.choices[0].message.content.trim();

      const aiMsgObj = {
        user: 'IA',
        text: aiReply,
        timestamp: Date.now()
      };

      history.push(aiMsgObj);
      if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
      saveHistory();
      broadcast(aiMsgObj);

    } catch (err) {
      console.error('❌ Erro ao chamar OpenAI:', err);
    }
  });

  ws.on('close', () => console.log('🔴 Usuário desconectado'));
});

function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}
