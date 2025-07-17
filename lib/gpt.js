const https = require('https');
const axios = require('axios');
const chalk = require('chalk');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function streamGPT({ prompt, model, rl }) {
  const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    }
  };

  const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.replace(/^data:\s*/, '');
          if (data === '[DONE]') {
            process.stdout.write('\n');
            rl.prompt();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0].delta.content;
            if (content) process.stdout.write(chalk.green(content));
          } catch {}
        }
      }
    });
  });

  req.on('error', (err) => {
    console.error(chalk.red(`❌ Erro ao chamar API: ${err.message}`));
    rl.prompt();
  });

  req.write(JSON.stringify({
    model,
    stream: true,
    messages: [{ role: 'user', content: prompt }]
  }));

  req.end();
}

function callGPT({ prompt, model }) {
  return axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    }
  );
}

module.exports = { streamGPT, callGPT };
