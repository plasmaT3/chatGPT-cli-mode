# 🤖 GPT-Butler CLI Deluxe™ — v1.8

Um assistente de linha de comando projetado para ser seu *code buddy* pessoal: rápido, útil, com memória, e agora ainda mais inteligente.  
Desenvolvido para desenvolvedores que não aguentam mais Ctrl+C/Ctrl+V e querem poder no terminal.

---

## 🚀 Funcionalidades

✅ Prompt colorido e elegante com informações do diretório atual  
✅ Histórico persistente entre sessões  
✅ Memória de sessão (`.gpt-butler-session.json`) com:
  - Diretório base
  - Comandos executados
  - Arquivos modificados
✅ Paginação automática para saídas longas  
✅ Saída colorida: stdout/stderr com contraste  
✅ Mensagens de erro amigáveis  
✅ Atualização do próprio `cli.js` diretamente pelo terminal  
✅ Diagnóstico do projeto com `analyze-project` (GPT‑3.5 + streaming)  
✅ Implementação automática de mudanças com `implement "<pedido>"` (GPT‑4o)  
✅ Respostas em tempo real no terminal (modo streaming)  
✅ Fallback inteligente para economizar créditos: diagnóstico com 3.5, código com 4o  

---

## 📋 Comandos internos

| Comando                        | O que faz |
|--------------------------------|-----------------------------------------------|
| `help`                         | Mostra os comandos internos disponíveis |
| `clear`                        | Limpa o terminal |
| `exit` / `quit`                | Encerra a sessão |
| `history`                      | Lista o histórico geral (`~/.gpt-cli-history`) |
| `context`                      | Exibe o estado atual da sessão |
| `self-update`                  | Atualiza o `cli.js` usando `cli.update.js` |
| `update-from-remote <url>`     | Baixa patch de uma URL e atualiza automaticamente |
| `cd <dir>`                     | Muda de diretório |
| `gpt <mensagem>`               | Faz uma pergunta ao GPT‑4o |
| `analyze-project`              | Diagnostica o estado do projeto com GPT‑3.5 |
| `implement "<pedido>"`         | Gera e aplica mudanças no código com GPT‑4o |

---

## 🎯 Como usar

1️⃣ Clone e instale:
git clone https://github.com/seurepo/chatGPT-cli-mode.git
cd chatGPT-cli-mode
npm install

2️⃣ Configure sua chave OpenAI:
cp .env.example .env
# edite e coloque sua chave OPENAI_API_KEY

3️⃣ Suba tudo:
.\start_gpt_cli.ps1

ou, para pular instalação de dependências:
.\start_gpt_cli.ps1 --SkipInstall

🎨 Roadmap
✨ Dry‑run para revisar alterações antes de salvar
✨ Suporte a voz
✨ Relatórios de uso e estatísticas
✨ Múltiplos temas para o prompt
✨ Execução offline com LLM local

📄 Licença
MIT — use, melhore e compartilhe.

