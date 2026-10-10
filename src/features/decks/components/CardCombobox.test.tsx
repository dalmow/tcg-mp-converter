// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import type { CardSuggestion } from '@/features/decks/lib/rowLogic'
import { CardCombobox } from './CardCombobox'

afterEach(cleanup)

const suggestion = (displayName: string): CardSuggestion => ({ key: displayName, displayName, quantity: 1 })

function combobox(suggestions: CardSuggestion[]) {
  return (
    <CardCombobox aria-label="Carta" value="" suggestions={suggestions} onValueChange={() => {}} onPick={() => {}} />
  )
}

describe('CardCombobox', () => {
  it('points aria-activedescendant at the highlighted option when the suggestions change and the count stays the same', async () => {
    const user = userEvent.setup()
    const { rerender } = render(combobox([suggestion('Pikachu')]))
    const input = screen.getByRole('combobox', { name: 'Carta' })
    await user.click(input)
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Pikachu' }).id)

    rerender(combobox([suggestion('Raichu')]))

    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getByRole('option', { name: 'Raichu' }).id)
  })
})
