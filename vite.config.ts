import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { createServer, defineConfig, type Plugin } from 'vite'
import { configDefaults } from 'vitest/config'
import { PUBLIC_PAGES } from './src/shared/lib/pageMeta.ts'
import { applyPageToShell, buildHeadTags, buildRobotsTxt, buildSitemapXml, SHELL_PAGE } from './src/shared/lib/seo.ts'
import { DEFAULT_SITE_URL } from './src/shared/lib/site.ts'

const siteUrl = process.env.SITE_URL || DEFAULT_SITE_URL

/** Injects SEO head tags into index.html and emits robots.txt / sitemap.xml. */
function seoPlugin(): Plugin {
  return {
    name: 'seo-metadata',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace('</head>', `    ${buildHeadTags(siteUrl, SHELL_PAGE)}\n  </head>`),
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobotsTxt(siteUrl) })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml(siteUrl) })
    },
  }
}

/**
 * After the client build, renders the public pages to static HTML. The empty app shell moves to
 * `spa.html`, which `vercel.json` serves for every route that has no prerendered file.
 */
function prerenderPlugin(): Plugin {
  let outDir = ''
  return {
    name: 'prerender-public-pages',
    apply: 'build',
    configResolved: (config) => {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const shell = await readFile(path.join(outDir, 'index.html'), 'utf-8')
      const vite = await createServer({ appType: 'custom', server: { middlewareMode: true }, logLevel: 'error' })
      try {
        const { renderApp } = await vite.ssrLoadModule('/src/entry-server.tsx')
        await writeFile(path.join(outDir, 'spa.html'), shell)
        for (const page of PUBLIC_PAGES) {
          const file = path.join(outDir, page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`)
          await mkdir(path.dirname(file), { recursive: true })
          await writeFile(file, applyPageToShell(shell, siteUrl, page, await renderApp(page.path)))
        }
      } finally {
        await vite.close()
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoPlugin(), prerenderPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    // `.claude/` holds git worktrees with stale copies of the source, not part of this project.
    exclude: [...configDefaults.exclude, '.claude/**', 'dist/**', 'node_modules/**'],
  },
})
