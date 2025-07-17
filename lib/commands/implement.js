const { scanProject } = require('../utils');
const chalk = require('chalk');
const { callGPT } = require('../gpt');
const path = require('path');
const fs = require('fs');
const diff = require('diff');
const readlineSync = require('readline-sync');

function handleImplement(cmd, rl) {
  const pedido = cmd.replace(/^implement\s+/i, '');
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

  console.log(chalk.cyan(`\n🤖 Implementando (com dry‑run): "${pedido}"…`));

  callGPT({ prompt: promptForGPT, model: 'gpt-4o' })
    .then(res => {
      const raw = res.data.choices[0].message.content.trim();

      let updates;
      try {
        updates = JSON.parse(raw);
      } catch (e) {
        console.error(chalk.red('❌ Resposta do GPT não foi um JSON válido!'));
        console.log(raw);
        rl.prompt();
        return;
      }

      for (const update of updates) {
        const filePath = path.join(process.cwd(), update.file);
        const oldContent = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
        const newContent = update.content;

        const diffs = diff.diffLines(oldContent, newContent);

        console.log(chalk.yellow(`\n📄 Diff para: ${update.file}`));
        diffs.forEach(part => {
          const color = part.added ? 'green' :
                        part.removed ? 'red' : 'grey';
          process.stdout.write(chalk[color](part.value));
        });
        console.log('\n');
      }

      const answer = readlineSync.question(chalk.cyan('\n💬 Aplicar alterações? (y/n): '));

      if (answer.toLowerCase() === 'y') {
        updates.forEach(update => {
          const filePath = path.join(process.cwd(), update.file);
          fs.writeFileSync(filePath, update.content, 'utf8');
          console.log(chalk.green(`✅ Atualizado: ${update.file}`));
        });
        console.log(chalk.green('\n🚀 Alterações aplicadas com sucesso!'));
      } else {
        console.log(chalk.red('\n🚫 Alterações descartadas.'));
      }

      rl.prompt();
    })
    .catch(err => {
      console.error(chalk.red(`❌ Erro ao implementar: ${err.message}`));
      rl.prompt();
    });
}

module.exports = { handleImplement };
