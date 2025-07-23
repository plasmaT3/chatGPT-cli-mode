const { scanProject } = require('../utils');
const { gpt } = require('../gpt');

module.exports = async function analyze(payload) {
  const files = scanProject(process.cwd());
  const promptForGPT = `
Estou te enviando um projeto com os seguintes arquivos e conteúdos resumidos. Me diga em que estágio ele parece estar, quais melhorias podem ser feitas e o que parece faltar.

${files.map(f => `### ${f.file}\n${f.content.slice(0, 500)}`).join('\n\n')}
`;

  const response = await gpt({
    prompt: promptForGPT,
    model: 'gpt-3.5-turbo'
  });

  return `📊 Análise do projeto:\n${response}`;
};
