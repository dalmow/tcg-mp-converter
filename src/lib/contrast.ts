/** WCAG 2.x contrast helpers for oklch(), hex and rgba() colors (used by design-token tests). */

export type Rgb = [number, number, number]

export function oklchToRgb(l: number, c: number, hDeg: number): Rgb {
  const h = (hDeg * Math.PI) / 180
  const a = c * Math.cos(h)
  const b = c * Math.sin(h)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ]
  return lin.map((v) => Math.min(1, Math.max(0, v))) as Rgb // linear sRGB, clamped to gamut
}

export function parseOklch(value: string): Rgb {
  const m = value.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/)
  if (!m) throw new Error(`Not an oklch color: ${value}`)
  const l = m[2] ? Number(m[1]) / 100 : Number(m[1])
  return oklchToRgb(l, Number(m[3]), Number(m[4]))
}

const toLinear = (channel: number) => {
  const c = channel / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** Parses #rgb, #rrggbb, rgb() and rgba(); translucent colors are composited over `over`. */
export function parseColor(value: string, over: Rgb = [0, 0, 0]): Rgb {
  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  const fn = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/)
  let channels: number[]
  let alpha = 1
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join('') : hex[1]
    channels = [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16))
  } else if (fn) {
    channels = [fn[1], fn[2], fn[3]].map(Number)
    alpha = fn[4] === undefined ? 1 : Number(fn[4])
  } else {
    throw new Error(`Not a hex or rgba color: ${value}`)
  }
  const background = over.map((v) => linearToSrgb(v))
  return channels.map((c, i) => toLinear(alpha * c + (1 - alpha) * background[i])) as Rgb
}

const linearToSrgb = (v: number) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055) * 255

export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
