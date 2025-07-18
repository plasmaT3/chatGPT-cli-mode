const readline = require('readline');
const chalk = require('chalk');
const { exec } = require('child_process');
const { naturalCommand } = require('./commands/natural');
const { streamGPT } = require('./gpt');

function startPrompt() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: chalk.cyanBright('🤖 GPT-BUTLER → ')
    });

    rl.prompt();

    rl.on('line', (line) => {
        const cmd = line.trim();

        if (!cmd) {
            rl.prompt();
            return;
        }

        if (cmd === 'exit' || cmd === 'quit') {
            console.log(chalk.magenta('👋 Saindo...'));
            process.exit(0);
        }

        if (cmd.startsWith('natural ')) {
            naturalCommand(cmd.replace('natural ', ''), rl);
            return;
        }

        if (cmd.startsWith('gpt ')) {
            const prompt = cmd.replace('gpt ', '');
            streamGPT({ prompt, model: 'gpt-3.5-turbo', rl });
            return;
        }

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(chalk.red(`❌ Erro: ${err.message}`));
            }
            if (stdout) console.log(chalk.green(stdout));
            if (stderr) console.error(chalk.red(stderr));
            rl.prompt();
        });
    });
}

module.exports = { startPrompt };
