## Navegação de código (codebase-memory-mcp): OBRIGATÓRIO

Este projeto está indexado no `codebase-memory-mcp`. Toda busca e análise de código DEVE passar pelas tools desse MCP. Não use Grep, Glob, `find`, `grep`, `rg` ou `cat` para explorar código.

### Obrigatório via MCP
- Localizar funções, classes, métodos, variáveis e símbolos
- Descobrir quem chama o quê e quais são as dependências
- Analisar impacto antes de qualquer alteração
- Entender arquitetura e relação entre módulos
- Encontrar código morto ou não utilizado
- Listar arquivos e estrutura do código

### Fluxo padrão
1. Consulte o MCP para localizar o que precisa.
2. Use Read apenas nos trechos ou arquivos que o MCP indicou, quando precisar do conteúdo exato para editar.
3. Antes de editar uma função ou módulo, consulte o MCP para ver o que depende dele.

### Proibido
- Usar Grep, Glob ou comandos de shell de busca (`grep`, `rg`, `find`) para procurar código
- Ler arquivos inteiros "para ver o que tem" sem consultar o MCP antes
- Começar uma tarefa sem consultar o MCP

### Únicas exceções
- Busca de texto literal em arquivos que não são código (docs, configs, .env.example, logs)
- O MCP falhou, retornou vazio ou o índice está desatualizado. Nesse caso: (1) tente reindexar o projeto, (2) se persistir, avise o usuário que está usando busca direta e por quê.

### Manutenção do índice
- Reindexe após mudanças grandes (novos módulos, refactors, troca de branch).
- Se o MCP e o código-fonte divergirem, o código-fonte atual é a verdade.