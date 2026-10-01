/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { buildHeadTags, buildRobotsTxt, buildSitemapXml } from './src/lib/seo.ts'
import { DEFAULT_SITE_URL } from './src/lib/site.ts'

const siteUrl = process.env.SITE_URL || DEFAULT_SITE_URL

/** Injects SEO head tags into index.html and emits robots.txt / sitemap.xml. */
function seoPlugin(): Plugin {
  return {
    name: 'seo-metadata',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replace('</head>', `    ${buildHeadTags(siteUrl)}\n  </head>`),
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobotsTxt(siteUrl) })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemapXml(siteUrl) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: false,
  },
})
