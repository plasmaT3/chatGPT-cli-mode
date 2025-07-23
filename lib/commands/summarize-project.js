// 📄 File: commands/summarize-project.js

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { askGPT } = require('../services/gpt');

function getAllCodeFiles(dir, exts = ['.js', '.py', '.ts', '.json']) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllCodeFiles(fullPath, exts));
    } else if (exts.includes(path.extname(fullPath))) {
      results.push(fullPath);
    }
  });
  return results;
}

async function summarizeProject(baseDir = '.') {
  const files = getAllCodeFiles(baseDir);
  const maxFiles = 10; // para evitar estouro de contexto
  const sample = files.slice(0, maxFiles);

  let bundle = '';

  for (const file of sample) {
    const content = fs.readFileSync(file, 'utf-8');
    bundle += `\n\n[${file}]\n${content}\n`;
  }

  const prompt = `
Você é um assistente de engenharia de software.

Abaixo está uma amostra de arquivos de um projeto.  
Faça um resumo com:
- Descrição geral do que o projeto faz
- Tecnologias e libs identificadas
- Estrutura de diretórios e módulos
- Componentes principais e suas responsabilidades
- Sugestões para entender melhor ou documentar esse projeto

Arquivos:\n${bundle}
`;

  const response = await askGPT(prompt);
  console.log(chalk.blue.bold('\n📦 Resumo do Projeto:\n'));
  console.log(response);
}

module.exports = { summarizeProject };
