// 📄 File: commands/refactor-smart.js

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { askGPT } = require('../services/gpt');

async function refactorSmart(filePath, objetivo = 'legibilidade', apply = false) {
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red(`Arquivo não encontrado: ${filePath}`));
    return;
  }

  const code = fs.readFileSync(filePath, 'utf-8');

  const prompt = `
Você é um assistente de refatoração de código.

Objetivo da refatoração: ${objetivo}

Reescreva o código a seguir com esse foco, mantendo a funcionalidade original.
Não adicione comentários excessivos. O código deve ser enxuto, moderno e eficiente.

Código original:\n\n${code}
`;

  const refactored = await askGPT(prompt);

  if (apply) {
    const backupPath = filePath + '.bak';
    fs.copyFileSync(filePath, backupPath);
    fs.writeFileSync(filePath, refactored);
    console.log(chalk.green(`✅ Código refatorado salvo em ${filePath}. Backup criado em ${backupPath}.`));
  } else {
    console.log(chalk.yellow.bold('\n💡 Sugestão de refatoração:\n'));
    console.log(refactored);
  }
}

module.exports = { refactorSmart };
