# ADR 0003: Prettier and stricter lint rules

Status: accepted

## Context

`.claude/rules/typescript-react-vite.md` requires `tsc --noEmit`, a linter and a formatter to pass before a task is done. The repo had no formatter, `lint` ran oxlint with two react rules only, and there was no CI. The code style was already mixed: 66 files used single quotes and 15 used double quotes.

## Decision

- **Formatter: Prettier.** Config in `.prettierrc.json`: no semicolons, single quotes, trailing commas, 120 columns. `.prettierignore` skips generated output, the lockfile, `.claude/`, `.maestri/` and the design mockups. Markdown and JSON are formatted too.
- **Linter: oxlint.** It stays the only linter. `.oxlintrc.json` adds `react-hooks/exhaustive-deps`, `typescript/no-explicit-any`, `typescript/no-non-null-assertion`, `typescript/consistent-type-imports` and `import/no-relative-parent-imports`. The `lint` script uses `--deny-warnings`, so warnings fail too.
- **One `check` script:** `typecheck`, `lint`, `format:check` and `test`. `.github/workflows/ci.yml` runs it on pull requests and on `main`.
- Prettier was chosen over Biome because oxlint already covers linting. Biome would either duplicate it or replace it.

## Consequences

- The whole tree was formatted in one commit, `b011fad`. Add it to a local ignore list with `git config blame.ignoreRevsFile .git-blame-ignore-revs` (the repo ships that file), so `git blame` skips it.
- Run `npm run format` before committing. `npm run check` fails on unformatted files.
- A parent-directory import (`../`) fails lint. Import across folders through the `@/` alias. The one exception, `src/app/vercelConfig.test.ts` (it reads `vercel.json` at the repo root), carries an `oxlint-disable-next-line` comment that says why.
- `docs/design-system/mockups/` is excluded from formatting because those files are generated.
