✅ README.md — versão atualizada
md
Copiar
Editar
# 🚀 GPT‑Butler CLI — v3.1 (Servidor Colaborativo com IA Analítica)

*"Não sabendo que era impossível, foi lá e fez."* — Jean Cocteau

Um **servidor colaborativo multiusuário com inteligência assistiva baseada em ChatGPT** via WebSocket + comandos avançados.  
Com recursos de análise de projeto, refatoração automatizada, contexto persistente e ações inteligentes — tudo no terminal.

---

## ✨ Funcionalidades

✅ **Chat multiusuário via WebSocket**  
✅ **Histórico de conversas**  
✅ **Comandos interativos e inteligentes**  
✅ **Autoimplementação (experimental)**  
✅ **Análise e refatoração de código com IA**

---

## 💻 Comandos Avançados

| Comando             | Descrição                                                                 |
|---------------------|---------------------------------------------------------------------------|
| `/analyze-code`     | Analisa um arquivo de código e retorna sugestões de melhoria.             |
| `/context-load`     | Carrega um arquivo para memória ativa como contexto.                      |
| `/context-list`     | Lista todos os contextos carregados.                                      |
| `/context-clear`    | Limpa todos os contextos da memória.                                      |
| `/grep-gpt`         | Busca semântica em linguagem natural em múltiplos arquivos.               |
| `/summarize-project`| Resume estrutura, tecnologias e padrões de um projeto.                    |
| `/refactor`         | Refatora um arquivo com base em objetivo (legibilidade, performance, etc).|

---

## ⚙️ Como Rodar

1️⃣ **Instale as dependências:**
```bash
npm install

2️⃣ Configure sua chave OpenAI:
Crie um arquivo .env com:

OPENAI_API_KEY=sua-chave-aqui

3️⃣ Inicie o servidor:

bash
Copiar
Editar
npm start
🧠 Modo Cliente CLI
Para conectar ao servidor como usuário e executar comandos:


node cli.js
Você será questionado sobre IP, porta e nome.
Depois poderá conversar ou digitar comandos com /.

📋 Exemplo de Uso dos Comandos

/analyze-code ./src/index.js
/context-load ./src/config.js config
/context-list
/grep-gpt "funções que lidam com autenticação"
/refactor ./src/api.js --smart performance --apply
/summarize-project
🎬 Demonstração
📽️ Assista ao vídeo no YouTube  https://youtu.be/YBueJw0_Te4?feature=shared

📄 Licença
MIT — use, melhore e compartilhe.
"Não sabendo que era impossível, foi lá e fez." — Jean Cocteau


