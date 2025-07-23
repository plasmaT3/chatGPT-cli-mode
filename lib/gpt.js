require('dotenv').config(); // garante que .env seja carregado
const { OpenAI } = require('openai');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    throw new Error('❌ OPENAI_API_KEY não definida no .env');
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Função para chamar a API do GPT
 * @param {Object} opts - Opções do prompt
 * @param {string} opts.prompt - O texto enviado ao GPT
 * @param {string} [opts.model='gpt-3.5-turbo'] - O modelo a ser usado
 * @param {number} [opts.temperature=0.7] - Criatividade
 * @param {number} [opts.top_p=1] - Amostragem
 * @returns {Promise<string>} resposta do GPT
 */
async function gpt({ prompt, model = 'gpt-3.5-turbo', temperature = 0.7, top_p = 1 }) {
    const messages = [
        { role: 'system', content: 'Você é um assistente útil.' },
        { role: 'user', content: prompt }
    ];

    const completion = await openai.chat.completions.create({
        model,
        temperature,
        top_p,
        messages
    });

    const resposta = completion.choices[0].message.content.trim();

    return resposta;
}

module.exports = { gpt };
