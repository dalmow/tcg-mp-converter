// @vitest-environment jsdom
import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import DeckEditorPage from '@/pages/DeckEditorPage'
import { EMPTY_DATA } from '@/lib/deck/storage'
import { getDeckStore } from '@/lib/deck/deckStore'
import type { Deck } from '@/lib/deck/types'
import { deckPath, ROUTES } from '@/routes'

beforeAll(() => {
  // cmdk (used by the card combobox) relies on browser APIs jsdom lacks.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Element.prototype.scrollIntoView ??= () => {}
})

beforeEach(() => getDeckStore().replaceAll(EMPTY_DATA))
afterEach(cleanup)

function renderEditor(path: string = ROUTES.newDeck) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={ROUTES.decks} element={<h1>Lista</h1>} />
        <Route path={ROUTES.newDeck} element={<DeckEditorPage />} />
        <Route path={ROUTES.deck} element={<DeckEditorPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function panel(name: string) {
  return within(screen.getByRole('region', { name }))
}

async function addRow(panelName: string, quantity: string, text: string, owned?: string) {
  const user = userEvent.setup()
  const scope = panel(panelName)
  await user.click(scope.getByRole('button', { name: 'Adicionar carta' }))
  const rows = scope.getAllByTestId('card-row')
  const element = rows[rows.length - 1]
  const row = within(element)
  await user.type(row.getByLabelText('Quantidade'), quantity)
  await user.type(row.getByLabelText('Carta'), text)
  if (owned !== undefined) await user.type(row.getByLabelText('Adquirido'), owned)
  return { user, row, element }
}

function savedDeck(): Deck | undefined {
  return getDeckStore().getSnapshot().decks[0]
}

describe('DeckEditor', () => {
  it('shows the three category panels and the name input', () => {
    renderEditor()
    expect(screen.getByPlaceholderText('Nome do deck')).toBeTruthy()
    for (const title of ['Pokémon', 'Treinadores', 'Energias']) {
      expect(screen.getByRole('region', { name: title })).toBeTruthy()
    }
  })

  it('requires a deck name before the first row is saved', async () => {
    renderEditor()
    const { user, row } = await addRow('Pokémon', '2', 'Abra MEG 54', '2')
    await user.click(row.getByRole('button', { name: 'Salvar linha' }))
    expect((await screen.findAllByText('Informe o nome do deck')).length).toBeGreaterThan(0)
    expect(savedDeck()).toBeUndefined()
  })

  it('creates the deck when the first row is saved and persists the owned quantity', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    const { row } = await addRow('Pokémon', '2', 'abra meg 54', '3')
    await user.click(row.getByRole('button', { name: 'Salvar linha' }))

    expect(savedDeck()?.name).toBe('Alakazam')
    expect(savedDeck()?.cards).toEqual([
      { category: 'pokemon', key: 'MEG-54', displayName: 'abra MEG 54', quantity: 2 },
    ])
    expect(getDeckStore().getSnapshot().owned['MEG-54']?.quantity).toBe(3)
  })

  it('keeps the row editable after saving and changes the key when the text changes', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    const { row } = await addRow('Pokémon', '2', 'Abra MEG 54', '2')
    await user.click(row.getByRole('button', { name: 'Salvar linha' }))

    const saved = panel('Pokémon').getByDisplayValue('Abra MEG 54')
    await user.clear(saved)
    await user.type(saved, 'Kadabra MEG 55')
    await user.click(panel('Pokémon').getByRole('button', { name: 'Salvar linha' }))

    expect(savedDeck()?.cards.map((card) => card.key)).toEqual(['MEG-55'])
    // The old key keeps its owned quantity, so Maintenance still lists it.
    expect(getDeckStore().getSnapshot().owned['MEG-54']?.quantity).toBe(2)
  })

  it('keeps the old key owned and reads the new key owned from the map or 0 on a text edit', async () => {
    getDeckStore().saveDeck(
      {
        id: 'abc',
        name: 'Alakazam',
        cards: [{ category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 2 }],
      },
      {
        'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 5 },
        'MEG-55': { displayName: 'Kadabra MEG 55', category: 'pokemon', quantity: 3 },
      },
    )
    renderEditor(deckPath('abc'))
    const user = userEvent.setup()
    const text = panel('Pokémon').getByLabelText('Carta')
    await user.clear(text)
    await user.type(text, 'Kadabra MEG 55')
    expect((panel('Pokémon').getByLabelText('Adquirido') as HTMLInputElement).value).toBe('3')
    await user.click(panel('Pokémon').getByRole('button', { name: 'Salvar linha' }))

    const { owned } = getDeckStore().getSnapshot()
    expect(owned['MEG-54']?.quantity).toBe(5)
    expect(owned['MEG-55']?.quantity).toBe(3)
    expect(savedDeck()?.cards.map((card) => card.key)).toEqual(['MEG-55'])
  })

  it('deletes a saved row and discards an unsaved one', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    const { row } = await addRow('Treinadores', '4', 'Ordem da chefia', '4')
    await user.click(row.getByRole('button', { name: 'Salvar linha' }))
    expect(savedDeck()?.cards).toHaveLength(1)

    await user.click(panel('Treinadores').getByRole('button', { name: 'Excluir linha' }))
    expect(savedDeck()?.cards).toHaveLength(0)

    await addRow('Treinadores', '1', 'Rascunho')
    await user.click(panel('Treinadores').getByRole('button', { name: 'Excluir linha' }))
    expect(panel('Treinadores').queryAllByTestId('card-row')).toHaveLength(0)
  })

  it('renames a persisted deck on blur', async () => {
    renderEditor()
    const user = userEvent.setup()
    const name = screen.getByPlaceholderText('Nome do deck')
    await user.type(name, 'Alakazam')
    const { row } = await addRow('Treinadores', '1', 'Ordem da chefia', '1')
    await user.click(row.getByRole('button', { name: 'Salvar linha' }))

    await user.clear(name)
    await user.type(name, 'Mega Absol')
    await user.tab()
    expect(savedDeck()?.name).toBe('Mega Absol')
  })

  it.each([
    ['Pokémon', 'Abra XYZ 54', 'Coleção XYZ não cadastrada'],
    ['Pokémon', 'Abra MEG 9999', /fora do total/],
    ['Treinadores', 'Ordem da chefia MEG 54', 'Treinador não aceita coleção nem número'],
    ['Energias', 'Fantasma', 'Energia especial exige coleção e número'],
  ])('shows the parser error inline in %s for "%s"', async (panelName, text, message) => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Deck')
    const { row } = await addRow(panelName, '1', text, '1')
    await user.click(row.getByRole('button', { name: 'Salvar linha' }))
    expect(await row.findByRole('alert')).toBeTruthy()
    expect(row.getByRole('alert').textContent).toMatch(message)
    expect(savedDeck()).toBeUndefined()
  })

  it('rejects a duplicate row and a quantity above the 60-card cap', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Deck')
    const first = await addRow('Energias', '58', 'Energia Fogo', '58')
    await user.click(first.row.getByRole('button', { name: 'Salvar linha' }))

    const duplicate = await addRow('Energias', '1', 'Fogo', '1')
    await user.click(duplicate.row.getByRole('button', { name: 'Salvar linha' }))
    expect(duplicate.row.getByRole('alert').textContent).toBe('Carta já está no deck, edite a linha existente')

    const tooMany = await addRow('Treinadores', '3', 'Ordem da chefia', '3')
    await user.click(tooMany.row.getByRole('button', { name: 'Salvar linha' }))
    expect(tooMany.row.getByRole('alert').textContent).toBe('Quantidade máxima para esta carta: 2')
  })

  it('warns about more than 4 copies across printings but still saves the draft', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Deck')
    const first = await addRow('Pokémon', '3', 'Abra MEG 54', '3')
    await user.click(first.row.getByRole('button', { name: 'Salvar linha' }))

    const second = await addRow('Pokémon', '2', 'Abra MEG 53', '2')
    expect(second.row.getByText('Mais de 4 cópias de Abra MEG 53 no deck')).toBeTruthy()
    expect(second.element.getAttribute('data-status')).toBe('invalid')
    await user.click(second.row.getByRole('button', { name: 'Salvar linha' }))
    expect(savedDeck()?.cards).toHaveLength(2)
  })

  it('marks a row green only when valid and owned covers the quantity', async () => {
    renderEditor()
    const user = userEvent.setup()
    const { row, element } = await addRow('Pokémon', '2', 'Abra MEG 54', '1')
    expect(element.getAttribute('data-status')).toBe('invalid')

    await user.clear(row.getByLabelText('Adquirido'))
    await user.type(row.getByLabelText('Adquirido'), '2')
    expect(element.getAttribute('data-status')).toBe('valid')

    await user.clear(row.getByLabelText('Carta'))
    await user.type(row.getByLabelText('Carta'), 'Abra XYZ 54')
    expect(element.getAttribute('data-status')).toBe('invalid')
  })

  it('suggests known cards of the same category and fills text and owned on pick', async () => {
    getDeckStore().replaceAll({
      decks: [],
      owned: {
        'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 3 },
        'ordem da chefia': { displayName: 'Ordem da chefia', category: 'trainer', quantity: 4 },
      },
    })
    renderEditor()
    const user = userEvent.setup()
    await user.click(panel('Pokémon').getByRole('button', { name: 'Adicionar carta' }))
    const row = within(panel('Pokémon').getByTestId('card-row'))
    await user.click(row.getByLabelText('Carta'))

    expect(screen.getByRole('option', { name: 'Abra MEG 54' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Ordem da chefia' })).toBeNull()

    await user.click(screen.getByRole('option', { name: 'Abra MEG 54' }))
    expect((row.getByLabelText('Carta') as HTMLInputElement).value).toBe('Abra MEG 54')
    expect((row.getByLabelText('Adquirido') as HTMLInputElement).value).toBe('3')
  })

  it('pre-fills owned when the typed text resolves to a known key', async () => {
    getDeckStore().replaceAll({
      decks: [],
      owned: { 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 3 } },
    })
    renderEditor()
    const { row } = await addRow('Pokémon', '1', 'Abra MEG 54')
    expect((row.getByLabelText('Adquirido') as HTMLInputElement).value).toBe('3')
  })

  it('loads an existing deck on /decks/:id', () => {
    getDeckStore().saveDeck({
      id: 'abc',
      name: 'Alakazam',
      cards: [{ category: 'trainer', key: 'ordem da chefia', displayName: 'Ordem da chefia', quantity: 4 }],
    })
    renderEditor(deckPath('abc'))
    expect((screen.getByPlaceholderText('Nome do deck') as HTMLInputElement).value).toBe('Alakazam')
    expect(panel('Treinadores').getByDisplayValue('Ordem da chefia')).toBeTruthy()
  })

  it('deletes the deck after confirmation and returns to the list', async () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderEditor(deckPath('abc'))
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Excluir deck/ }))
    expect(getDeckStore().getSnapshot().decks).toHaveLength(1)
    await user.click(await screen.findByRole('button', { name: 'Excluir' }))
    expect(getDeckStore().getSnapshot().decks).toHaveLength(0)
    expect(await screen.findByRole('heading', { name: 'Lista' })).toBeTruthy()
  })

  it('shows a not-found state for an unknown deck id without creating a deck', () => {
    renderEditor(deckPath('missing'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar deck' })).toBeTruthy()
    expect(screen.getByText('Deck não encontrado')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Voltar/ }).getAttribute('href')).toBe(ROUTES.decks)
    expect(screen.queryByPlaceholderText('Nome do deck')).toBeNull()
    expect(getDeckStore().getSnapshot().decks).toHaveLength(0)
  })

  it('follows owned changes made elsewhere unless the field has an unsaved edit', async () => {
    const card = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 2 } as const
    const deck = { id: 'abc', name: 'Alakazam', cards: [card] }
    const entry = (quantity: number) => ({ 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon' as const, quantity } })
    getDeckStore().saveDeck(deck, entry(1))
    renderEditor(deckPath('abc'))
    const owned = () => panel('Pokémon').getByLabelText('Adquirido') as HTMLInputElement
    expect(owned().value).toBe('1')

    act(() => getDeckStore().saveDeck(deck, entry(4)))
    expect(owned().value).toBe('4')

    const user = userEvent.setup()
    await user.clear(owned())
    await user.type(owned(), '9')
    act(() => getDeckStore().saveDeck(deck, entry(6)))
    expect(owned().value).toBe('9')
  })

  it('reverts an empty rename of a stored deck to the stored name and shows the error', async () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderEditor(deckPath('abc'))
    const user = userEvent.setup()
    const name = screen.getByPlaceholderText('Nome do deck') as HTMLInputElement
    await user.clear(name)
    await user.tab()
    expect(screen.getByRole('alert').textContent).toBe('Informe o nome do deck')
    expect(name.value).toBe('Alakazam')
    expect(savedDeck()?.name).toBe('Alakazam')
  })
})
