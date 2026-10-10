import { describe, expect, it } from 'vitest'
import { isIntegerText, parseIntegerText } from './integer'

describe('isIntegerText', () => {
  it('accepts digits only', () => {
    expect(isIntegerText('0')).toBe(true)
    expect(isIntegerText('054')).toBe(true)
  })

  it('rejects signs, decimals, exponents and letters', () => {
    for (const text of ['', '-1', '1.5', '1e2', 'x3', ' 1']) expect(isIntegerText(text)).toBe(false)
  })
})

describe('parseIntegerText', () => {
  it('reads a whole number and ignores surrounding spaces', () => {
    expect(parseIntegerText(' 12 ')).toBe(12)
    expect(parseIntegerText('007')).toBe(7)
  })

  it('returns NaN for text that is not a plain digit string', () => {
    for (const text of ['', '   ', '-1', '1.5', '1e2', 'abc']) expect(parseIntegerText(text)).toBeNaN()
  })
})
