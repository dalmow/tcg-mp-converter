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
]

// Named spacing tokens (`space-N`, index.css). Unknown to tailwind-merge, so without this list a class that
// overrides a token (`gap-space-7` over `gap-space-6`) would keep both. `p` is left out on purpose: a `p-*` class
// would drop a `py-*` from the base classes, and panels rely on their `py` winning over a `p` on the same element.
const SPACE_TOKENS = [
  'space-1',
  'space-2',
  'space-3',
  'space-4',
  'space-5',
  'space-6',
  'space-7',
  'space-8',
  'space-9',
  'space-10',
  'space-12',
]

export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZES }],
      px: [{ px: SPACE_TOKENS }],
      py: [{ py: SPACE_TOKENS }],
      gap: [{ gap: SPACE_TOKENS }],
    },
  },
})
