# 🚀 GPT‑Butler CLI — v3.0 (Servidor Colaborativo)

*"Não sabendo que era impossível, foi lá e fez."* — Jean Cocteau

Um **servidor colaborativo com ChatGPT multiusuário** via WebSocket, com histórico persistente, comandos inteligentes e um autoimplementador que analisa, sugere e aplica mudanças no código sozinho.

---

## ✨ Funcionalidades

✅ **Multiusuário**  
✅ **Histórico persistente**  
✅ **Comandos interativos**:
- `/analyze` → analisa o projeto e sugere melhorias
- `/implement` → gera código para melhorias solicitadas
- `/gptfree` → responde perguntas simples
- `/natural` → transforma frase em comando shell seguro
✅ **Autoimplementador**:
- basta dizer: *"varre a pasta X e atualiza com suas sugestões"*
- ele analisa, gera alterações, salva e testa

---

## ⚡ Como rodar

1️⃣ **Instale as dependências:**
```bash
npm install

2️⃣ Configure sua chave OpenAI:
Crie um arquivo .env na raiz com:

OPENAI_API_KEY=sua-chave-aqui

3️⃣ Inicie o servidor:
npm start

## 🎬 Demonstração
📽️ [Assista ao vídeo no YouTube](https://youtu.be/YBueJw0_Te4)

👨‍💻 Como os clientes se conectam
Rode o cli.js ou demo_cli.ps1 para simular.
O cliente pede IP/porta, nome do usuário e permite enviar mensagens ou comandos.

📄 Licença
MIT — use, melhore e compartilhe.
"Não sabendo que era impossível, foi lá e fez." — Jean Cocteau