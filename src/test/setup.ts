// cmdk (used by the card combobox) relies on browser APIs that jsdom lacks. Node-environment files have no `Element`.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof Element !== 'undefined') Element.prototype.scrollIntoView ??= () => {}
