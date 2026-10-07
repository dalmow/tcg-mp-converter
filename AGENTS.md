## Agent skills

### Issue tracker

Tracked in Linear (team `DAL`, project `PTCG Tool`); code and PRs on GitHub via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context repo. See `CONTEXT.md` (domain, conversion rules, stack) and `docs/agents/domain.md`.

### Conventions (MUST)

- **Never commit directly to `main`.** Create a feature branch (or worktree) per issue/spec and commit there. Open a PR into `main` when the work is ready for review. Exception: when the Linear issue names another base branch (e.g. `fix/deck-building`), branch from it and open the PR into it instead of `main`.
- **Code is always written in English**: identifiers, types, function names, comments. The only exception is text shown to the end user (UI labels, error messages) — the app is Portuguese-facing, so user-visible strings stay in Portuguese. `CONTEXT.md`'s glossary terms are the business vocabulary (Portuguese); map each one to an English identifier in code (e.g. Qualidade → `Condition`, Coleção → `collection`). Marketplace-defined literal tokens (e.g. the `[QUALIDADE=X]` tag Liga Pokemon expects) are external protocol strings, not code identifiers, and stay verbatim regardless of this rule.
- Use conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, ...).

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