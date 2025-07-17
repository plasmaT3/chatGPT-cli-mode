const chalk = require('chalk');
const { streamGPT } = require('../gpt');

function handleGPTFree(cmd, rl) {
  const userPrompt = cmd.replace(/^gpt\s+/i, '');
  console.log(chalk.cyan(`\n🤖 Enviando para GPT: "${userPrompt}"…`));

  streamGPT({ prompt: userPrompt, model: 'gpt-4o', rl });
}

module.exports = { handleGPTFree };
