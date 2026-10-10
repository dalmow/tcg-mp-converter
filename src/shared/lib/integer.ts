const integerPattern = /^\d+$/

/** True for text made only of digits: a quantity, a card number or a token of a pasted list. */
export function isIntegerText(text: string): boolean {
  return integerPattern.test(text)
}

/** Whole number from the text, ignoring surrounding spaces. NaN when the text is not a plain digit string. */
export function parseIntegerText(text: string): number {
  const trimmed = text.trim()
  return isIntegerText(trimmed) ? Number(trimmed) : Number.NaN
}
