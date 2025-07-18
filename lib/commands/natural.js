const { streamGPT } = require('../gpt');
const { exec } = require('child_process');
const chalk = require('chalk');

function naturalCommand(input, rl) {
    const systemPrompt = `
Você é um assistente que traduz frases em português para comandos shell seguros.
Não execute nada perigoso como 'rm -rf /'.
Responda somente com o comando equivalente, sem explicação.
`;

    console.log(chalk.yellow('💡 Interpretando comando...'));

    // Reutiliza o streamGPT com prompt customizado
    const prompt = `${systemPrompt}\n\nFrase: ${input}\nComando:`;
    let commandBuffer = '';

    streamGPT({
        prompt,
        model: 'gpt-3.5-turbo',
        rl,
        temperature: 0,
        top_p: 1,
        onToken: token => {
            process.stdout.write(chalk.green(token));
            commandBuffer += token;
        },
        onComplete: () => {
            console.log(chalk.blue('\n⚡ Comando sugerido:'));
            console.log(chalk.whiteBright(commandBuffer.trim()));

            rl.question(chalk.magenta('❓ Executar este comando? (s/n): '), answer => {
                if (answer.toLowerCase() === 's') {
                    exec(commandBuffer.trim(), (err, stdout, stderr) => {
                        if (err) {
                            console.error(chalk.red(`❌ Erro: ${err.message}`));
                        }
                        if (stdout) console.log(chalk.green(stdout));
                        if (stderr) console.error(chalk.red(stderr));
                        rl.prompt();
                    });
                } else {
                    console.log(chalk.yellow('🚫 Comando cancelado.'));
                    rl.prompt();
                }
            });
        }
    });
}

module.exports = { naturalCommand };
