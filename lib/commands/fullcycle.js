const fs = require('fs');
const path = require('path');
const { scanProject } = require('../utils');
const { gpt } = require('../gpt');

module.exports = async function fullcycle(payload) {
  let targetDir = payload.trim();
  if (!targetDir) {
    return '❌ Por favor, forneça um diretório. Ex: `/fullcycle C:\\meu\\projeto`';
  }

  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    return `❌ Diretório inválido ou inexistente: ${targetDir}`;
  }

  process.chdir(targetDir);

  // 📋 Analise
  const files = scanProject(process.cwd());
  const analyzePrompt = `
Estou te enviando um projeto com os seguintes arquivos e conteúdos resumidos. Me diga em que estágio ele parece estar, quais melhorias podem ser feitas e o que parece faltar.

${files.map(f => `### ${f.file}\n${f.content.slice(0, 500)}`).join('\n\n')}
`;

  const analysis = await gpt({
    prompt: analyzePrompt,
    model: 'gpt-3.5-turbo'
  });

  // 🔨 Implementação
  const implementPrompt = `
Aqui está meu projeto com os arquivos abaixo. Melhore-o seguindo as sugestões que você mesmo der.

Responda SOMENTE em JSON no formato:
[
  { "file": "path/para/arquivo", "content": "novo conteúdo completo" }
]

Arquivos atuais:
${files.map(f => `### ${f.file}\n${f.content.slice(0, 500)}`).join('\n\n')}
`;

  const implementResponse = await gpt({
    prompt: implementPrompt,
    model: 'gpt-4o'
  });

  let updates;
  try {
    updates = JSON.parse(implementResponse);
  } catch (err) {
    return `❌ Erro ao interpretar a resposta do GPT como JSON:\n\n${implementResponse}`;
  }

  // 💾 Aplicar alterações
  const results = [];
  for (const update of updates) {
    const filePath = path.join(process.cwd(), update.file);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, update.content, 'utf8');
    results.push(`✅ Arquivo salvo: ${update.file}`);
  }

  // 🧪 Testar (opcional)
  let testResult = '';
  if (fs.existsSync('package.json')) {
    testResult = '🧪 Executando `npm test`...\n';
    try {
      const { execSync } = require('child_process');
      const output = execSync('npm test', { encoding: 'utf8', stdio: 'pipe' });
      testResult += output;
    } catch (err) {
      testResult += `❌ Teste falhou: ${err.message}`;
    }
  } else {
    testResult = 'ℹ️ Nenhum `package.json` encontrado para rodar testes.';
  }

  return `
📋 Análise:
${analysis}

🔨 Alterações aplicadas:
${results.join('\n')}

${testResult}
`;
};
