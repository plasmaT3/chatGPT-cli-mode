// 📄 File: commands/analyze-code.js

const fs = require('fs');
const path = require('path');
const { askGPT } = require('../services/gpt');
const chalk = require('chalk');

async function analyzeCode(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red(`Arquivo não encontrado: ${filePath}`));
    return;
  }

  const code = fs.readFileSync(filePath, 'utf-8');
  const prompt = `
Você é um assistente técnico especializado em revisão de código.
Analise o conteúdo a seguir com foco em:
1. Bugs ou vulnerabilidades
2. Oportunidades de refatoração
3. Melhoria de performance e legibilidade
4. Sugestões de boas práticas

Código:\n\n${code}
`;

  const response = await askGPT(prompt);
  console.log(chalk.green.bold('\n🔍 Análise Técnica:\n'));
  console.log(response);
}

module.exports = { analyzeCode };
