## Navegação de código (codebase-memory-mcp)

Este projeto está indexado no `codebase-memory-mcp`, um grafo de conhecimento do código (funções, classes, chamadas e dependências). Use-o como primeira opção para entender a estrutura do código.

### Use o MCP primeiro para
- Localizar funções, classes, métodos e símbolos
- Descobrir quem chama o quê (call graph) e quais são as dependências de um módulo
- Analisar o impacto de uma mudança antes de editar
- Entender a arquitetura e a relação entre módulos
- Encontrar código morto ou não utilizado

### Use Grep/Glob/Read quando
- Buscar texto literal, strings, mensagens de erro, TODOs ou comentários
- Trabalhar com arquivos que não são código (configs, docs, JSON, YAML, .env.example)
- O MCP não retornar resultado ou o índice parecer desatualizado

### Regras
1. Antes de alterar uma função ou módulo, consulte o MCP para ver o que depende dele.
2. Depois de mudanças grandes (novos módulos, refactors, troca de branch), reindexe o projeto antes de confiar nos resultados.
3. Use o MCP para localizar e só então leia os arquivos necessários; evite ler arquivos inteiros só para achar um símbolo.
4. Se o MCP e a leitura direta divergirem, o código-fonte atual é a verdade.
