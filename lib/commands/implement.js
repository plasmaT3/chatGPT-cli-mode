const { scanProject } = require('../utils');
const { gpt } = require('../gpt');

module.exports = async function implement(payload) {
  const pedido = payload;
  const files = scanProject(process.cwd());

  const promptForGPT = `
Aqui está meu projeto com os arquivos abaixo. Atenda ao seguinte pedido: "${pedido}".

Responda SOMENTE em JSON no formato:
[
  { "file": "path/para/arquivo", "content": "novo conteúdo completo" }
]

Arquivos atuais:
${files.map(f => `### ${f.file}\n${f.content.slice(0, 500)}`).join('\n\n')}
`;

  const response = await gpt({
    prompt: promptForGPT,
    model: 'gpt-4o'
  });

  return `🔨 Implementação gerada para: "${pedido}"\n\n${response}`;
};
