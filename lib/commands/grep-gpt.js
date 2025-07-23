// 📄 File: commands/grep-gpt.js

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { askGPT } = require('../services/gpt');

function getAllFiles(dir, ext = ['.js', '.py', '.ts']) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext));
    } else if (ext.includes(path.extname(fullPath))) {
      results.push(fullPath);
    }
  });
  return results;
}

async function grepGPT(query, baseDir = '.') {
  const files = getAllFiles(baseDir);
  const snippets = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const prompt = `
A seguir está o conteúdo de um arquivo de código chamado "${file}".
O usuário quer encontrar trechos relacionados à seguinte dúvida:

"${query}"

Leia o conteúdo e, se houver algo relacionado, extraia e destaque apenas os trechos relevantes com explicações. Se nada for relevante, diga "irrelevante".

Código:\n\n${content}
`;

    const result = await askGPT(prompt);
    if (!result.toLowerCase().includes('irrelevante')) {
      snippets.push(`📂 ${file}\n${result}\n`);
    }
  }

  if (snippets.length === 0) {
    console.log(chalk.yellow('⚠️ Nenhum trecho relevante encontrado.'));
  } else {
    console.log(chalk.green.bold('\n🧠 Resultados da busca semântica:\n'));
    snippets.forEach(s => console.log(s));
  }
}

module.exports = { grepGPT };
