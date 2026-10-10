# SEO and performance audit (DAL-27)

Date: 2026-10-01. Audited commit: `e60d4fe` (`main` after DAL-26) plus the fixes in this change. The raw Lighthouse reports were not kept; the figures below are the values read from them.

## Method

- `npm run build`, then a static server that mimics `vercel.json` (clean URLs, rewrites to `spa.html`) with
  Brotli compression, as Vercel serves it. `vite preview` was not used for `/converter` because it ignores
  `vercel.json` and answers every unknown path with the prerendered home.
- Lighthouse 12 (headless Chrome, mobile with simulated slow 4G and 4x CPU, and desktop), Playwright for a
  layout-shift probe with stored decks. All tools ran from a scratch directory outside the repository; no
  audit dependency was added.

## Results (public routes `/` and `/converter`)

| Metric                     | Mobile    | Desktop   | "Good" threshold |
| -------------------------- | --------- | --------- | ---------------- |
| Lighthouse SEO             | 100 / 100 | 100 / 100 | 100              |
| Lighthouse Performance     | 100 / 100 | 100 / 100 | -                |
| Lighthouse Best practices  | 100 / 100 | 100 / 100 | -                |
| LCP (lab)                  | 0.9 s     | 0.3 s     | <= 2.5 s         |
| CLS (lab, empty storage)   | 0         | 0         | <= 0.1           |
| CLS (8 stored decks, home) | 0.0002    | -         | <= 0.1           |
| TBT (lab proxy for INP)    | 0-10 ms   | 0 ms      | INP <= 200 ms    |

Accessibility is 100 on `/` and 90 on `/converter`; those failures (`color-contrast`, `label`) are already in
`docs/accessibility-audit.md` (A-01 to A-03) and belong to DAL-24.

Checked in the built HTML: one `<title>`, one description, one `h1`, `lang="pt-BR"`, per-page canonical and
Open Graph/Twitter tags, valid `WebApplication` JSON-LD, `robots.txt`, a sitemap with only `/` and
`/converter`, and internal links that all resolve to existing routes. The font is Geist (self-hosted woff2
through `@fontsource-variable/geist`) with `font-display: swap`; on the audited pages only the latin subset (29 kB) was requested (Portuguese accents fall in it). The font has no `preload`; it is discovered through the CSS, and the lab LCP does not need it.

## Issues found and fixed

1. **Layout shift on the home for users with saved decks (CLS 0.17, above the 0.1 limit).** The prerendered
   home has no decks (they live in `localStorage`), so the tiles pushed the "Novo deck" tile when they
   appeared after hydration. The deck grid now renders only once hydrated (`useHydrated`), which brings CLS to
   0.0002. The prerendered home therefore has no deck grid, only the navbar and the screen reader `h1`.
2. **Soft 404s.** The catch-all rewrite answered every unknown URL with `200 spa.html`. `vercel.json` now
   rewrites only the real app routes (`/decks/new`, `/decks/:id`, `/maintenance`); a test keeps the list in
   sync with `ROUTES`. Unknown paths get Vercel's 404.

## Not fixed, on purpose

- **Thin indexable content on the home.** After fix 1 the prerendered `/` has the navbar and a screen reader
  `h1` only, since the page is a list of private, local decks. Search engines will index `/converter` (the
  real public tool) much better than `/`. Giving the home real copy is a product decision, not a fix.

- **Bundle size:** one 580 kB JS file (190 kB gzip; Lighthouse reports about 63% of it unused on first load). The build warns
  about it. With compression the lab LCP is 0.9 s on mobile, so splitting the deck editor into a lazy chunk is
  not needed now. Revisit if mobile LCP regresses.
- `/maintenance` is not prerendered or in the sitemap. It shows personal data, and its shell is served with
  `noindex`, so search engines will not index it.

## Not measurable offline

- Field data (real LCP, CLS and INP from Chrome UX Report) exists only after the site has real traffic. Lab
  values above are estimates, and INP has no lab equivalent; TBT and a click-to-paint probe (8 ms) are proxies.
- Behaviour on the real Vercel deployment (`cleanUrls` serving `converter.html`, rewrite precedence, 404 for
  unknown paths, compression headers). Check a preview deployment.
- Validation with Google's Rich Results Test and social preview debuggers (they need the public URL).

## Search Console and Bing Webmaster checklist

Production URL: `https://ptcgtools.dalm.dev` (override with `SITE_URL` at build time).

- [ ] Confirm the deployed site serves `/`, `/converter`, `/robots.txt`, `/sitemap.xml` and `/og-image.png`
      with status 200, and `/decks/new` with `noindex`.
- [ ] Google Search Console: add the property (Domain via DNS TXT, or URL prefix via the HTML tag).
- [ ] Submit `https://ptcgtools.dalm.dev/sitemap.xml` and check that both URLs are "Discovered".
- [ ] Use "URL inspection" on `/` and `/converter`: the rendered HTML must show the title, description and
      `h1`; request indexing.
- [ ] Run the Rich Results Test on `/` (expect a valid `WebApplication`).
- [ ] Bing Webmaster Tools: import the site from Search Console, or add it and verify (DNS or meta tag).
- [ ] Submit the same sitemap in Bing and run its "URL inspection".
- [ ] Check a share preview (Facebook Sharing Debugger, X/LinkedIn) for the 1200x630 image.
- [ ] After a week, read the Core Web Vitals report and compare with the lab values above.
