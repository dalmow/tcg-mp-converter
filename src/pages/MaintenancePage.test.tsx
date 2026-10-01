// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getDeckStore } from '@/lib/deck/deckStore'
import type { Deck, OwnedMap } from '@/lib/deck/types'
import MaintenancePage from './MaintenancePage'

const abra = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54' } as const
const boss = { category: 'trainer', key: 'ordem da chefia', displayName: 'Ordem da chefia' } as const
const fire = { category: 'energy', key: 'energy:fogo', displayName: 'Energia Fogo' } as const

function deck(id: string, name: string, cards: Deck['cards']): Deck {
  return { id, name, cards }
}

function seed(decks: Deck[], owned: OwnedMap = {}) {
  getDeckStore().replaceAll({ decks, owned })
}

beforeEach(() => seed([]))
afterEach(cleanup)

const row = (name: string) => screen.getByText(name).closest('li') as HTMLElement

describe('MaintenancePage', () => {
  it('lists missing cards with needed quantity and deck badges, grouped by category', () => {
    seed([
      deck('1', 'Alakazam', [{ ...abra, quantity: 2 }, { ...boss, quantity: 4 }]),
      deck('2', 'Absol', [{ ...boss, quantity: 3 }]),
    ])
    render(<MaintenancePage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Manutenção' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Pokémon' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Treinadores' })).toBeTruthy()
    const r = within(row('Ordem da chefia'))
    expect(r.getByText('Decks: Alakazam, Absol')).toBeTruthy()
    expect(r.getByText('Precisa: 4')).toBeTruthy()
  })

  it('hides satisfied cards by default and shows them when the toggle is off', async () => {
    seed(
      [deck('1', 'Alakazam', [{ ...abra, quantity: 2 }, { ...boss, quantity: 4 }])],
      { 'MEG-54': { ...abra, quantity: 2 } },
    )
    render(<MaintenancePage />)
    expect(screen.queryByText('Abra MEG 54')).toBeNull()
    expect(screen.getByText('Ordem da chefia')).toBeTruthy()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    expect(screen.getByText('Abra MEG 54')).toBeTruthy()
  })

  it('saves the owned quantity of a row', async () => {
    seed([deck('1', 'Alakazam', [{ ...boss, quantity: 4 }])])
    render(<MaintenancePage />)
    const r = within(row('Ordem da chefia'))
    const input = r.getByLabelText('Adquirido')
    await userEvent.clear(input)
    await userEvent.type(input, '3')
    await userEvent.click(r.getByRole('button', { name: 'Salvar' }))
    expect(getDeckStore().getSnapshot().owned['ordem da chefia']).toEqual({ displayName: 'Ordem da chefia', category: 'trainer', quantity: 3 })
  })

  it('marks rows as satisfied when owned reaches needed', async () => {
    seed([deck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'ordem da chefia': { ...boss, quantity: 4 } })
    render(<MaintenancePage />)
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    expect(row('Ordem da chefia').dataset.satisfied).toBe('true')
  })

  it('offers delete only for cards in no deck, after confirmation', async () => {
    seed([deck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'energy:fogo': { ...fire, quantity: 1 } })
    render(<MaintenancePage />)
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    expect(within(row('Ordem da chefia')).queryByRole('button', { name: 'Excluir' })).toBeNull()
    const r = within(row('Energia Fogo'))
    expect(r.getByText('Decks: 0')).toBeTruthy()
    await userEvent.click(r.getByRole('button', { name: 'Excluir' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
    expect(getDeckStore().getSnapshot().owned['energy:fogo']).toBeUndefined()
  })
})
