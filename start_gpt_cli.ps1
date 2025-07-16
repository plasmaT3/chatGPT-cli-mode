Write-Host "🚀 Iniciando ChatGPT CLI Mode..." -ForegroundColor Cyan

# Navega para a pasta do projeto (ajuste se necessário)
cd -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

# Verifica se já tem node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Abre duas janelas do PowerShell: uma pro daemon, outra pro cliente
Write-Host "🎯 Subindo o daemon em uma nova janela..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "🎯 Subindo o cliente CLI em uma nova janela..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run cli" -WindowStyle Normal

Write-Host "✅ Tudo pronto. Bom hacking! 👨‍💻" -ForegroundColor Cyan
