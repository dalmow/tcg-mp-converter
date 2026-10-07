## Agent skills

### Issue tracker

Tracked in Linear (team `DAL`, project `PTCG Tool`); code and PRs on GitHub via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context repo. See `CONTEXT.md` (domain, conversion rules, stack) and `docs/agents/domain.md`.

### Conventions (MUST)

- **Never commit directly to `main`.** Create a feature branch (or worktree) per issue/spec and commit there. Open a PR into `main` when the work is ready for review. Exception: when the Linear issue names another base branch (e.g. `fix/deck-building`), branch from it and open the PR into it instead of `main`.
- **Code is always written in English**: identifiers, types, function names, comments. The only exception is text shown to the end user (UI labels, error messages) — the app is Portuguese-facing, so user-visible strings stay in Portuguese. `CONTEXT.md`'s glossary terms are the business vocabulary (Portuguese); map each one to an English identifier in code (e.g. Qualidade → `Condition`, Coleção → `collection`). Marketplace-defined literal tokens (e.g. the `[QUALIDADE=X]` tag Liga Pokemon expects) are external protocol strings, not code identifiers, and stay verbatim regardless of this rule.
- Use conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, ...).

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
