const { gpt } = require('../gpt');

module.exports = async function natural(payload) {
  const systemPrompt = `
Você é um assistente que traduz frases em português para comandos shell seguros.
Não execute nada perigoso como 'rm -rf /'.
Responda somente com o comando equivalente, sem explicação.
`;

  const prompt = `${systemPrompt}\n\nFrase: ${payload}\nComando:`;

  const response = await gpt({
    prompt,
    model: 'gpt-3.5-turbo',
    temperature: 0,
    top_p: 1
  });

  return `⚡ Comando sugerido para: "${payload}"\n\n${response}`;
};
