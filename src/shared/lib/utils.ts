import { createCn } from 'cn/config'

// Font sizes from the @theme in index.css. Unknown text-* classes count as colors,
// so without this list a text color class drops the size (text-ui, text-body).
const FONT_SIZES = [
  'h1',
  'wordmark',
  'modal-title',
  'h2',
  'body',
  'body-strong',
  'ui',
  'nav-link',
  'caption',
  'micro-label',
  'eyebrow',
  'eyebrow-wordmark',
]

export const cn = createCn({
  extend: { classGroups: { 'font-size': [{ text: FONT_SIZES }] } },
})
