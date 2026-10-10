import { afterEach } from 'vitest'

// cmdk (used by the card combobox) relies on browser APIs that jsdom lacks. Node-environment files have no `Element`.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView ??= () => {}

// Pages set the title and robots/canonical tags on `document`, which jsdom keeps across tests in a file.
afterEach(() => {
  if (typeof document === 'undefined') return
  document.title = ''
  document.head
    .querySelectorAll('meta[name], link[rel="canonical"], meta[property="og:url"]')
    .forEach((tag) => tag.remove())
})
