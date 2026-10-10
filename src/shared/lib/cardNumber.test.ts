import { describe, expect, it } from 'vitest'
import { isCardNumberInRange } from './cardNumber'

describe('isCardNumberInRange', () => {
  it.each([1, 53])('accepts card number %i in a collection of 53 cards', (cardNumber) => {
    expect(isCardNumberInRange(cardNumber, 53)).toBe(true)
  })

  it.each([0, -1, 54, 1.5])('rejects card number %s in a collection of 53 cards', (cardNumber) => {
    expect(isCardNumberInRange(cardNumber, 53)).toBe(false)
  })
})
