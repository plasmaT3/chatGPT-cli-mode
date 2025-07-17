const { scanProject } = require('../utils');
const chalk = require('chalk');
const { streamGPT } = require('../gpt');

function handleAnalyze(cmd, rl) {
  const files = scanProject(process.cwd());
  const promptForGPT = `
Estou te enviando um projeto com os seguintes arquivos e conteúdos resumidos. Me diga em que estágio ele parece estar, quais melhorias podem ser feitas e o que parece faltar.

${files.map(f => `### ${f.file}\n${f.content.slice(0, 500)}`).join('\n\n')}
`;

  console.log(chalk.cyan('\n🤖 Analisando o projeto…'));

  streamGPT({ prompt: promptForGPT, model: 'gpt-3.5-turbo', rl });
}

module.exports = { handleAnalyze };
