# ===========================================
# 🚀 GPT‑Butler CLI — v3.0 Starter Script
# ===========================================

Write-Host "==============================="
Write-Host " GPT‑Butler CLI — v3.0 "
Write-Host " Servidor colaborativo "
Write-Host "==============================="

# verifica se package.json existe
if (-not (Test-Path -Path ".\package.json")) {
    Write-Error "❌ Este script deve ser executado na raiz do projeto (onde está o package.json)."
    exit 1
}

# instala dependências caso necessário
if (-not (Test-Path -Path ".\node_modules")) {
    Write-Host "📦 Instalando dependências..."
    npm install
} else {
    Write-Host "📦 Dependências já instaladas."
}

# verifica .env
if (-not (Test-Path -Path ".\.env")) {
    Write-Warning "⚠️ Arquivo .env não encontrado! Crie um com sua OPENAI_API_KEY."
    exit 1
}

# inicia o servidor em uma aba atual ou invisível
Write-Host "🚀 Iniciando servidor colaborativo..."
Start-Process -NoNewWindow pwsh -ArgumentList "npm start"

Start-Sleep -Seconds 2

# abre novo terminal para o cliente no PowerShell 7 e mantém aberto no final
Write-Host "🖥️ Abrindo cliente em uma nova janela (pwsh)..."
Start-Process pwsh -ArgumentList '-NoExit', '-Command', 'node cli.js'
