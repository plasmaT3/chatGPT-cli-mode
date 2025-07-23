const { gpt } = require('../gpt');

module.exports = async function gptfree(payload) {
  const userPrompt = payload;

  const response = await gpt({
    prompt: userPrompt,
    model: 'gpt-4o'
  });

  return `🆓 GPT Free respondeu a: "${userPrompt}"\n\n${response}`;
};
