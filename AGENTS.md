## Agent skills

### Issue tracker

Tracked on GitHub via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context repo. See `CONTEXT.md` (domain, conversion rules, stack) and `docs/agents/domain.md`.

### Conventions (MUST)

- **Never commit directly to `main`.** Create a feature branch (or worktree) per issue/spec and commit there. Open a PR into `main` when the work is ready for review.
- **Code is always written in English**: identifiers, types, function names, comments. The only exception is text shown to the end user (UI labels, error messages) — the app is Portuguese-facing, so user-visible strings stay in Portuguese. `CONTEXT.md`'s glossary terms are the business vocabulary (Portuguese); map each one to an English identifier in code (e.g. Qualidade → `Condition`, Coleção → `collection`). Marketplace-defined literal tokens (e.g. the `[QUALIDADE=X]` tag Liga Pokemon expects) are external protocol strings, not code identifiers, and stay verbatim regardless of this rule.
- Use conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, ...).
