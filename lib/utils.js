const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const pager = require('child_process');

function scanProject(rootDir, maxFiles = 10, maxSizeKB = 50) {
  const result = [];
  const walk = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          walk(fullPath);
        }
      } else {
        const ext = path.extname(file);
        if (!['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css'].includes(ext)) continue;
        if (stat.size > maxSizeKB * 1024) continue;

        const content = fs.readFileSync(fullPath, 'utf8');
        result.push({ file: path.relative(rootDir, fullPath), content });

        if (result.length >= maxFiles) return;
      }
    }
  };
  walk(rootDir);
  return result;
}

function updatePrompt(rl) {
  const cwd = process.cwd().replace(os.homedir(), '~');
  const buddyName = chalk.bgBlack.cyan.bold(' 🤖 GPT-BUTLER ');
  const sparkle = chalk.magentaBright('✨');
  const dir = chalk.bgBlack.white(` ${cwd} `);
  const arrow = chalk.greenBright.bold('→ ');
  rl.setPrompt(`${buddyName} ${sparkle} ${dir} ${arrow}`);
}

function completer(line) {
  const lastToken = line.split(' ').pop();
  const hits = [].filter(c => c.startsWith(lastToken));
  return [hits.length ? hits : [], lastToken];
}

function paginate(text) {
  const less = pager.spawnSync('less', [], { input: text, encoding: 'utf-8', stdio: 'inherit' });
  if (less.error) console.log(text);
}

module.exports = { scanProject, updatePrompt, completer, paginate };
