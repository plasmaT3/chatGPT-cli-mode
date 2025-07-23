const analyze = require('./analyze');
const gptfree = require('./gptfree');
const implement = require('./implement');
const natural = require('./natural');
const fullcycle = require('./fullcycle');

module.exports = {
  /**
   * Executa o comando recebido pelo servidor
   * @param {string} command - Comando solicitado (/analyze, /implement, etc.)
   * @param {string} payload - Argumentos adicionais
   * @returns {Promise<string>} resposta para enviar aos clientes
   */
  async execute(command, payload) {
    switch (command) {
      case 'analyze':
        return await analyze(payload);
      case 'gptfree':
        return await gptfree(payload);
      case 'implement':
        return await implement(payload);
      case 'natural':
        return await natural(payload);
      case 'fullcycle':
        return await fullcycle(payload);
      default:
        return `❓ Comando não reconhecido: /${command}`;
    }
  }
};
