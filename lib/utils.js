const fs = require('fs');
const path = require('path');

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

module.exports = { scanProject };
