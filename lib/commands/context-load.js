// 📄 File: commands/context-load.js

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Aqui armazenamos o contexto carregado (poderia ser transferido para um cache ou Redis futuramente)
let contextMemory = {};

function loadContext(filePath, tag = null) {
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red(`Arquivo não encontrado: ${filePath}`));
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const key = tag || path.basename(filePath);
  contextMemory[key] = content;

  console.log(chalk.blue(`📚 Contexto "${key}" carregado com sucesso.`));
}

function getContext() {
  return contextMemory;
}

function listContextKeys() {
  return Object.keys(contextMemory);
}

function clearContext() {
  contextMemory = {};
  console.log(chalk.yellow('🧹 Contexto limpo.'));
}

module.exports = {
  loadContext,
  getContext,
  listContextKeys,
  clearContext,
};
