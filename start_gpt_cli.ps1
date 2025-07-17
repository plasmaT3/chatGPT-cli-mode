param (
    [switch]$SkipInstall,
    [switch]$Global
)

Write-Host "`n🚀 Iniciando GPT-Butler Deluxe™ (LUXO™ v2)..." -ForegroundColor Cyan

cd -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

if (-not $SkipInstall) {
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Dependências não encontradas. Instalando..." -ForegroundColor Yellow
        npm install
    } else {
        Write-Host "✅ Dependências encontradas. Pulando instalação." -ForegroundColor Green
    }
} else {
    Write-Host "⏭️ Instalação de dependências pulada por flag." -ForegroundColor Yellow
}

if ($Global) {
    Write-Host "🌐 Instalando GPT‑Butler como CLI global..." -ForegroundColor Cyan
    npm link
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Agora você pode rodar com o comando: gpt-butler" -ForegroundColor Green
    } else {
        Write-Host "❌ Falha ao registrar como global." -ForegroundColor Red
    }
}

$ps7 = Get-Command pwsh -ErrorAction SilentlyContinue

if ($ps7) {
    Write-Host "⚡ Preferindo PowerShell 7+ (pwsh)..." -ForegroundColor Green
    $shell = "pwsh"
} else {
    Write-Host "⚠️ PowerShell 7+ não encontrado. Usando PowerShell clássico." -ForegroundColor Yellow
    $shell = "powershell"
}

function Test-Daemon {
    $daemonRunning = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node*" -and $_.StartInfo.Arguments -match "daemon" }
    return $daemonRunning
}

if (Test-Daemon) {
    Write-Host "✅ Daemon já está rodando. Não abrindo outra instância." -ForegroundColor Green
} else {
    Write-Host "🎯 Subindo o daemon em uma nova janela..." -ForegroundColor Green
    Start-Process $shell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Write-Host "📝 Daemon iniciado."
}

Start-Sleep -Seconds 2

Write-Host "🎯 Subindo o cliente CLI em uma nova janela..." -ForegroundColor Green
Start-Process $shell -ArgumentList "-NoExit", "-Command", "npm run cli" -WindowStyle Normal
Write-Host "📝 Cliente iniciado."

Write-Host "`n✨ GPT-Butler Deluxe™ LUXO™ v2 está ao seu dispor! 👨‍💻" -ForegroundColor Cyan
Write-Host "📋 Flags disponíveis:" -ForegroundColor Yellow
Write-Host "   --SkipInstall   → pula instalação de dependências"
Write-Host "   --Global        → instala como CLI global (npm link)"
Write-Host ""
