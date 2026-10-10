// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ToastProvider } from '@/shared/ui/Toast'
import { getDeckStore } from '@/features/decks'
import type { Deck, OwnedMap } from '@/features/decks'
import MaintenancePage from './MaintenancePage'

const abra = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54' } as const
const boss = { category: 'trainer', key: 'ordem da chefia', displayName: 'Ordem da chefia' } as const
const fire = { category: 'energy', key: 'energy:fogo', displayName: 'Energia Fogo' } as const

function makeDeck(id: string, name: string, cards: Deck['cards']): Deck {
  return { id, name, cards }
}

function seedStore(decks: Deck[], owned: OwnedMap = {}) {
  getDeckStore().replaceAll({ decks, owned })
}

function renderPage() {
  return render(
    <ToastProvider>
      <MaintenancePage />
    </ToastProvider>,
  )
}

beforeEach(() => seedStore([]))
afterEach(cleanup)

const rowOf = (name: string) => screen.getByText(name).closest('li') as HTMLElement
const stateOf = (name: string) => (rowOf(name).querySelector('[data-slot="row-state"]') as HTMLElement).dataset.state

describe('MaintenancePage', () => {
  it('lists missing cards with needed quantity and deck badges, grouped by category', () => {
    seedStore([
      makeDeck('1', 'Alakazam', [
        { ...abra, quantity: 2 },
        { ...boss, quantity: 4 },
      ]),
      makeDeck('2', 'Absol', [{ ...boss, quantity: 3 }]),
    ])
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Manutenção' }).className).not.toContain('sr-only')
    expect(screen.getByText('Cartas que faltam para completar seus decks, agrupadas por categoria.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Pokémon' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Treinadores' })).toBeTruthy()
    const card = within(rowOf('Ordem da chefia'))
    expect(card.getByText('Decks:')).toBeTruthy()
    expect(card.getByText('Alakazam').dataset.slot).toBe('badge')
    expect(card.getByText('Absol').dataset.slot).toBe('badge')
    expect(card.getByText('Precisa: 4')).toBeTruthy()
  })

  it('hides satisfied cards by default and shows them when the toggle is off', async () => {
    seedStore(
      [
        makeDeck('1', 'Alakazam', [
          { ...abra, quantity: 2 },
          { ...boss, quantity: 4 },
        ]),
      ],
      { 'MEG-54': { ...abra, quantity: 2 } },
    )
    renderPage()
    expect(screen.queryByText('Abra MEG 54')).toBeNull()
    expect(screen.getByText('Ordem da chefia')).toBeTruthy()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    expect(screen.getByText('Abra MEG 54')).toBeTruthy()
  })

  it('saves the owned quantity of a row', async () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])])
    renderPage()
    const card = within(rowOf('Ordem da chefia'))
    const input = card.getByLabelText(/^Adquirido/)
    await userEvent.clear(input)
    await userEvent.type(input, '3')
    await userEvent.click(card.getByRole('button', { name: /^Salvar/ }))
    expect(getDeckStore().getSnapshot().owned['ordem da chefia']).toEqual({
      displayName: 'Ordem da chefia',
      category: 'trainer',
      quantity: 3,
    })
  })

  it('shows toasts when saving and deleting an owned card', async () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'energy:fogo': { ...fire, quantity: 1 } })
    renderPage()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    const bossCard = within(rowOf('Ordem da chefia'))
    await userEvent.click(bossCard.getByRole('button', { name: /^Salvar/ }))
    expect((await screen.findByRole('status')).textContent).toContain('Quantidade salva')
    const card = within(rowOf('Energia Fogo'))
    await userEvent.click(card.getByRole('button', { name: /^Excluir/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
    expect(await screen.findByText('Carta excluída')).toBeTruthy()
  })

  it('marks rows as satisfied when owned reaches needed', async () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'ordem da chefia': { ...boss, quantity: 4 } })
    renderPage()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    expect(rowOf('Ordem da chefia').dataset.satisfied).toBe('true')
  })

  it('offers delete only for cards in no deck, after confirmation', async () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'energy:fogo': { ...fire, quantity: 1 } })
    renderPage()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    expect(within(rowOf('Ordem da chefia')).queryByRole('button', { name: /^Excluir/ })).toBeNull()
    const card = within(rowOf('Energia Fogo'))
    expect(card.getByText('Decks:')).toBeTruthy()
    expect(card.getByText('nenhum')).toBeTruthy()
    await userEvent.click(card.getByRole('button', { name: /^Excluir/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
    expect(getDeckStore().getSnapshot().owned['energy:fogo']).toBeUndefined()
  })

  it('persists 0 when the owned input is saved empty', async () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'ordem da chefia': { ...boss, quantity: 2 } })
    renderPage()
    const card = within(rowOf('Ordem da chefia'))
    await userEvent.clear(card.getByLabelText(/^Adquirido/))
    await userEvent.click(card.getByRole('button', { name: /^Salvar/ }))
    expect(card.queryByRole('alert')).toBeNull()
    expect(getDeckStore().getSnapshot().owned['ordem da chefia']?.quantity).toBe(0)
  })

  it('keeps an unsaved draft when the store changes, and follows the store otherwise', async () => {
    seedStore(
      [
        makeDeck('1', 'Alakazam', [
          { ...boss, quantity: 4 },
          { ...abra, quantity: 2 },
        ]),
      ],
      { 'ordem da chefia': { ...boss, quantity: 1 }, 'MEG-54': { ...abra, quantity: 1 } },
    )
    renderPage()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    const bossInput = within(rowOf('Ordem da chefia')).getByLabelText(/^Adquirido/) as HTMLInputElement
    const abraInput = within(rowOf('Abra MEG 54')).getByLabelText(/^Adquirido/) as HTMLInputElement
    await userEvent.clear(bossInput)
    await userEvent.type(bossInput, '3')
    act(() => getDeckStore().setOwned('ordem da chefia', { ...boss, quantity: 2 }))
    act(() => getDeckStore().setOwned('MEG-54', { ...abra, quantity: 2 }))
    expect(bossInput.value).toBe('3')
    expect(abraInput.value).toBe('2')
  })
})

describe('MaintenancePage row states', () => {
  it('marks a row as pendency, complete or no-op', async () => {
    seedStore(
      [
        makeDeck('1', 'Alakazam', [
          { ...abra, quantity: 2 },
          { ...boss, quantity: 4 },
        ]),
      ],
      { 'MEG-54': { ...abra, quantity: 2 }, 'energy:fogo': { ...fire, quantity: 1 } },
    )
    renderPage()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    expect(stateOf('Ordem da chefia')).toBe('pendency')
    expect(stateOf('Abra MEG 54')).toBe('complete')
    expect(stateOf('Energia Fogo')).toBe('noop')
  })

  it('keeps only Excluir on a no-op row, never Salvar', async () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'energy:fogo': { ...fire, quantity: 1 } })
    renderPage()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    const card = within(rowOf('Energia Fogo'))
    expect(card.queryByRole('button', { name: /^Salvar/ })).toBeNull()
    expect(card.getByRole('button', { name: /^Excluir/ })).toBeTruthy()
  })

  it('does not accept edits on a no-op row, since nothing can save them', async () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'energy:fogo': { ...fire, quantity: 1 } })
    renderPage()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    const input = within(rowOf('Energia Fogo')).getByLabelText(/^Adquirido/) as HTMLInputElement
    await userEvent.type(input, '5')
    expect(input.value).toBe('1')
  })

  it('groups the quantity input actions in a button group', () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])])
    renderPage()
    const group = within(rowOf('Ordem da chefia')).getByRole('group')
    expect(within(group).getByRole('button', { name: 'Salvar Ordem da chefia' })).toBeTruthy()
  })
})

describe('MaintenancePage accessible names', () => {
  it('names each row control after its card', () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...abra, quantity: 1 }])])
    renderPage()
    expect(screen.getByRole('spinbutton', { name: 'Adquirido de Abra MEG 54' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Salvar Abra MEG 54' })).toBeTruthy()
  })

  it('names the delete button of an unused card after it', async () => {
    seedStore([makeDeck('1', 'Alakazam', [{ ...boss, quantity: 4 }])], { 'energy:fogo': { ...fire, quantity: 1 } })
    renderPage()
    await userEvent.click(screen.getByRole('switch', { name: 'Só faltantes' }))
    expect(screen.getByRole('button', { name: 'Excluir Energia Fogo' })).toBeTruthy()
  })
})
