const fs = require('fs');
const os = require('os');
const path = require('path');

const HISTORY_FILE = path.join(os.homedir(), '.gpt-cli-history');
const SESSION_FILE = path.join(process.cwd(), '.gpt-butler-session.json');

let history = [];
let session = {
  startedAt: new Date().toISOString(),
  baseDir: process.cwd(),
  commands: [],
  files: []
};

if (fs.existsSync(HISTORY_FILE)) {
  history = fs.readFileSync(HISTORY_FILE, 'utf-8').split('\n').filter(Boolean);
}

if (!fs.existsSync(SESSION_FILE)) {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf-8');
} else {
  session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
}

function saveHistory() {
  fs.writeFileSync(HISTORY_FILE, history.join('\n'), 'utf-8');
}

function saveSession() {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf-8');
}

module.exports = { history, session, saveHistory, saveSession };
