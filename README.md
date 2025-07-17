# 🤖 GPT-Butler CLI Deluxe™

Um assistente de linha de comando projetado para ser seu *code buddy* pessoal: rápido, útil e com memória.  
Desenvolvido para desenvolvedores que não aguentam mais Ctrl+C/Ctrl+V.

---

## 🚀 Funcionalidades

✅ Prompt colorido e elegante com informações do diretório atual.  
✅ Histórico persistente entre sessões.  
✅ Memória de sessão (`.gpt-butler-session.json`) com:
  - Diretório base
  - Comandos executados
  - Arquivos modificados
✅ Paginação automática para saídas longas.  
✅ Saída colorida: stdout/stderr com contraste.  
✅ Mensagens de erro amigáveis.  
✅ Atualização do próprio `cli.js` diretamente pelo terminal!

---

## 📋 Comandos internos

| Comando                | O que faz                                     |
|-------------------------|-----------------------------------------------|
| `help`                 | Mostra os comandos internos disponíveis      |
| `clear`                | Limpa o terminal                             |
| `exit` / `quit`        | Encerra a sessão                             |
| `history`              | Lista o histórico geral (`~/.gpt-cli-history`) |
| `context`              | Exibe o estado atual da sessão (`.gpt-butler-session.json`) |
| `self-update`          | Atualiza o `cli.js` usando `cli.update.js`   |
| `update-from-remote <url>` | Baixa patch de uma URL e atualiza automaticamente |
| `cd <dir>`             | Muda de diretório                            |

---

## 🎯 Como atualizar o Butler

### 🔷 Método local (manual)
1️⃣ Receba um novo `cli.js` (fornecido por mim).  
2️⃣ Salve como:
```bash
cli.update.js
