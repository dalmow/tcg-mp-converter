/// <reference types="vite/client" />

/**
 * Variables the client reads through `import.meta.env`. Vite exposes only `VITE_`-prefixed names,
 * and none are needed yet. `SITE_URL` is build-time only, validated by `parseBuildEnv` in `src/shared/lib/env.ts`.
 */
interface ImportMetaEnv {}
