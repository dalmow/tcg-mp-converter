// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, Link, RouterProvider } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ToastProvider } from '@/shared/ui/Toast'
import DeckEditorPage from './DeckEditorPage'
import { EMPTY_DATA } from '@/features/decks/lib/storage'
import { getDeckStore } from '@/features/decks/lib/deckStore'
import type { Deck } from '@/features/decks/types/deck'
import { deckPath, ROUTES } from '@/shared/lib/routes'

beforeEach(() => getDeckStore().replaceAll(EMPTY_DATA))
afterEach(cleanup)

function editorElement() {
  return (
    <>
      <Link to={ROUTES.decks}>Sair</Link>
      <DeckEditorPage />
    </>
  )
}

// The editor blocks navigation, which needs a data router.
function renderEditor(path: string = ROUTES.newDeck) {
  const router = createMemoryRouter(
    [
      { path: ROUTES.decks, element: <h1>Lista</h1> },
      { path: ROUTES.newDeck, element: editorElement() },
      { path: ROUTES.deck, element: editorElement() },
    ],
    { initialEntries: [path] },
  )
  render(
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>,
  )
  return router
}

function panel(name: string) {
  return within(screen.getByRole('region', { name }))
}

type PanelName = 'Pokémon' | 'Treinadores' | 'Energias'

async function addCard(user: ReturnType<typeof userEvent.setup>, panelName: PanelName) {
  await user.click(panel(panelName).getByRole('button', { name: /^Adicionar carta/ }))
}

async function addRow(panelName: PanelName, quantity: string, text: string, owned?: string) {
  const user = userEvent.setup()
  const scope = panel(panelName)
  await addCard(user, panelName)
  const rows = scope.getAllByTestId('card-row')
  const element = rows[rows.length - 1]
  const row = within(element)
  if (quantity) await user.type(row.getByLabelText(/^Quantidade/), quantity)
  await user.type(row.getByLabelText(/^Carta/), text)
  if (owned !== undefined) await user.type(row.getByLabelText(/^Adquirido/), owned)
  return { user, row, element }
}

async function save(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /Salvar deck/ }))
}

function savedDeck(): Deck | undefined {
  return getDeckStore().getSnapshot().decks[0]
}

function progressBar() {
  return screen.getByRole('progressbar', { name: 'Progresso do deck' })
}

/** The visible "{count}/60 cartas" text of the progress bar. */
function cardCountText() {
  return screen.getByText('/60 cartas').parentElement?.textContent
}

describe('DeckEditor', () => {
  it('shows the three category panels, the name input and the Save deck button', () => {
    renderEditor()
    expect(screen.getByPlaceholderText('Nome do deck')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Salvar deck/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Salvar linha' })).toBeNull()
    for (const title of ['Pokémon', 'Treinadores', 'Energias']) {
      expect(screen.getByRole('region', { name: title })).toBeTruthy()
    }
  })

  it('starts a new deck with one blank row in each category', () => {
    renderEditor()
    for (const name of ['Pokémon', 'Treinadores', 'Energias'] as const) {
      expect(panel(name).getAllByTestId('card-row')).toHaveLength(1)
    }
  })

  it('has an icon-only "+" button in each panel that adds a row to that category only', async () => {
    renderEditor()
    expect(screen.getAllByRole('button', { name: /^Adicionar carta/ })).toHaveLength(3)
    expect(panel('Energias').getByRole('button', { name: /^Adicionar carta/ }).textContent).toBe('')
    await addCard(userEvent.setup(), 'Energias')
    expect(panel('Energias').getAllByTestId('card-row')).toHaveLength(2)
    expect(panel('Pokémon').getAllByTestId('card-row')).toHaveLength(1)
  })

  it('focuses the quantity input of the row just added', async () => {
    renderEditor()
    await addCard(userEvent.setup(), 'Energias')
    const rows = panel('Energias').getAllByTestId('card-row')
    const row = within(rows[rows.length - 1])
    expect(document.activeElement).toBe(row.getByLabelText(/^Quantidade/))
  })

  it('still asks for confirmation before deleting the deck', async () => {
    renderEditor()
    const group = within(screen.getByRole('group', { name: 'Ações do deck' }))
    await userEvent.setup().click(group.getByRole('button', { name: /Excluir deck/ }))
    expect(await screen.findByRole('alertdialog')).toBeTruthy()
  })

  it('groups Save deck and Delete deck in one button group', () => {
    renderEditor()
    const group = within(screen.getByRole('group', { name: 'Ações do deck' }))
    expect(group.getByRole('button', { name: /Salvar deck/ })).toBeTruthy()
    expect(group.getByRole('button', { name: /Excluir deck/ })).toBeTruthy()
  })

  it('shows the draft card count against the 60-card total above the panels', async () => {
    renderEditor()
    const bar = progressBar()
    expect(cardCountText()).toBe('0/60 cartas')
    expect(
      bar.compareDocumentPosition(screen.getByRole('region', { name: 'Pokémon' })) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    await addRow('Pokémon', '2', 'abra meg 54', '3')
    await addRow('Treinadores', '4', 'Ordem da chefia', '4')
    expect(cardCountText()).toBe('6/60 cartas')
    expect(bar.getAttribute('aria-valuenow')).toBe('6')

    // A row that is not a valid card yet does not count.
    await addRow('Energias', '5', 'Abra XYZ 54')
    expect(cardCountText()).toBe('6/60 cartas')
  })

  it('keeps a row whose quantity is still blank out of the count', async () => {
    renderEditor()
    await addRow('Energias', '', 'Psíquica')
    expect(cardCountText()).toBe('0/60 cartas')
    expect(progressBar().getAttribute('aria-valuenow')).toBe('0')
  })

  it('uses "#" as the quantity placeholder', async () => {
    renderEditor()
    expect(
      panel('Pokémon')
        .getByLabelText(/^Quantidade/)
        .getAttribute('placeholder'),
    ).toBe('#')
  })

  it('writes nothing until Save deck, then commits name, rows and owned together', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    await addRow('Pokémon', '2', 'abra meg 54', '3')
    await addRow('Treinadores', '4', 'Ordem da chefia', '4')
    expect(savedDeck()).toBeUndefined()

    await save(user)
    expect(savedDeck()?.name).toBe('Alakazam')
    expect(savedDeck()?.cards).toEqual([
      { category: 'pokemon', key: 'MEG-54', displayName: 'abra MEG 54', quantity: 2 },
      { category: 'trainer', key: 'ordem da chefia', displayName: 'Ordem da chefia', quantity: 4 },
    ])
    expect(getDeckStore().getSnapshot().owned['MEG-54']?.quantity).toBe(3)
    expect(getDeckStore().getSnapshot().owned['ordem da chefia']?.quantity).toBe(4)
  })

  it('shows feedback after saving and replaces /decks/new with /decks/:id', async () => {
    const router = renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    await save(user)
    expect(router.state.location.pathname).toBe(deckPath(savedDeck()?.id ?? ''))
    expect(router.state.historyAction).toBe('REPLACE')
    expect((await screen.findByRole('status')).textContent).toContain('Deck salvo')
  })

  it('requires a deck name on Save and writes nothing', async () => {
    renderEditor()
    const user = userEvent.setup()
    await addRow('Pokémon', '2', 'Abra MEG 54', '2')
    await save(user)
    expect((await screen.findAllByText('Informe o nome do deck')).length).toBeGreaterThan(0)
    expect(savedDeck()).toBeUndefined()
  })

  it('titles an existing deck "Editando deck {name}" and a new deck not at all', () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderEditor(deckPath('abc'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editando deck Alakazam' })).toBeTruthy()
    cleanup()
    renderEditor()
    expect(screen.queryByRole('heading', { name: /Editando deck/ })).toBeNull()
  })

  it('links back to Meus decks beside the title of an existing deck', async () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderEditor(deckPath('abc'))
    const back = screen.getByRole('link', { name: 'Voltar para Meus decks' })
    const title = screen.getByRole('heading', { level: 1, name: 'Editando deck Alakazam' })
    expect(back.getAttribute('href')).toBe(ROUTES.decks)
    expect(back.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    await userEvent.setup().click(back)
    expect(await screen.findByRole('heading', { name: 'Lista' })).toBeTruthy()
  })

  it('shows no back link on a new deck', () => {
    renderEditor()
    expect(screen.queryByRole('link', { name: 'Voltar para Meus decks' })).toBeNull()
  })

  it('does not save on Enter in the name field and an empty name does not revert', async () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderEditor(deckPath('abc'))
    const user = userEvent.setup()
    const name = screen.getByPlaceholderText('Nome do deck') as HTMLInputElement
    await user.clear(name)
    await user.type(name, 'Outro{Enter}')
    expect(savedDeck()?.name).toBe('Alakazam')
    await user.clear(name)
    await user.tab()
    expect(name.value).toBe('')
    expect(savedDeck()?.name).toBe('Alakazam')
    await save(user)
    expect(screen.getByRole('alert').textContent).toBe('Informe o nome do deck')
    expect(savedDeck()?.name).toBe('Alakazam')
  })

  it('edits a saved row text, changing the key while the old key keeps its owned quantity', async () => {
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
    const text = panel('Pokémon').getByLabelText(/^Carta/)
    await user.clear(text)
    await user.type(text, 'Kadabra MEG 55')
    expect((panel('Pokémon').getByLabelText(/^Adquirido/) as HTMLInputElement).value).toBe('3')
    await save(user)

    const { owned } = getDeckStore().getSnapshot()
    expect(owned['MEG-54']?.quantity).toBe(5)
    expect(owned['MEG-55']?.quantity).toBe(3)
    expect(savedDeck()?.cards.map((card) => card.key)).toEqual(['MEG-55'])
  })

  it('writes owned only for rows edited in the draft, so other changes are not overwritten', async () => {
    const a = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 1 } as const
    const b = { category: 'pokemon', key: 'MEG-55', displayName: 'Kadabra MEG 55', quantity: 1 } as const
    const entry = (card: typeof a | typeof b, quantity: number) => ({
      displayName: card.displayName,
      category: card.category,
      quantity,
    })
    getDeckStore().saveDeck({ id: 'abc', name: 'D', cards: [a, b] }, { 'MEG-54': entry(a, 1), 'MEG-55': entry(b, 1) })
    renderEditor(deckPath('abc'))
    const user = userEvent.setup()
    const [ownedA] = panel('Pokémon').getAllByLabelText(/^Adquirido/)
    await user.clear(ownedA)
    await user.type(ownedA, '9')
    // Maintenance (or another tab) changes the other row meanwhile.
    act(() => getDeckStore().setOwned('MEG-55', entry(b, 7)))
    await save(user)

    const { owned } = getDeckStore().getSnapshot()
    expect(owned['MEG-54']?.quantity).toBe(9)
    expect(owned['MEG-55']?.quantity).toBe(7)
  })

  it('deletes a row only from the draft, without confirmation, and the deck changes on Save', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    await addRow('Treinadores', '4', 'Ordem da chefia', '4')
    await save(user)
    expect(savedDeck()?.cards).toHaveLength(1)

    await user.click(panel('Treinadores').getByRole('button', { name: /^Excluir linha/ }))
    expect(panel('Treinadores').queryAllByTestId('card-row')).toHaveLength(0)
    expect(savedDeck()?.cards).toHaveLength(1)

    await save(user)
    expect(savedDeck()?.cards).toHaveLength(0)
    // The card stays owned.
    expect(getDeckStore().getSnapshot().owned['ordem da chefia']?.quantity).toBe(4)
  })

  it('silently discards fully blank rows on Save', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    await addCard(user, 'Pokémon')
    await save(user)
    expect(savedDeck()?.cards).toEqual([])
    expect(panel('Pokémon').queryAllByTestId('card-row')).toHaveLength(0)
  })

  it('blocks the whole save on a partially filled row and shows the error on that row', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    await addRow('Treinadores', '4', 'Ordem da chefia', '4')
    const partial = await addRow('Pokémon', '', 'Abra MEG 54', '1')
    await save(user)
    expect(partial.row.getByRole('alert')).toBeTruthy()
    expect(savedDeck()).toBeUndefined()
    expect(getDeckStore().getSnapshot().owned).toEqual({})
  })

  it('does not mark Adquirido invalid while the quantity is still blank', async () => {
    renderEditor()
    const { row } = await addRow('Pokémon', '', 'Abra MEG 54')
    expect(row.getByLabelText(/^Adquirido/).getAttribute('aria-invalid')).toBeNull()
  })

  it.each<[PanelName, string, string | RegExp]>([
    ['Pokémon', 'Abra XYZ 54', 'Coleção XYZ não cadastrada'],
    ['Pokémon', 'Abra MEG 9999', /fora do total/],
    ['Treinadores', 'Ordem da chefia MEG 54', 'Treinador não aceita coleção nem número'],
    ['Energias', 'Fantasma', 'Energia especial exige coleção e número'],
  ])('shows the parser error inline in %s for "%s" and blocks Save', async (panelName, text, message) => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Deck')
    const { row } = await addRow(panelName, '1', text, '1')
    await save(user)
    expect(await row.findByRole('alert')).toBeTruthy()
    expect(row.getByRole('alert').textContent).toMatch(message)
    expect(savedDeck()).toBeUndefined()
  })

  it('blocks on a duplicate row, a quantity above the 60-card cap and a non-integer owned', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Deck')
    await addRow('Energias', '58', 'Energia Fogo', '58')
    const duplicate = await addRow('Energias', '1', 'Fogo', '1')
    const tooMany = await addRow('Treinadores', '3', 'Ordem da chefia', '3')
    const badOwned = await addRow('Pokémon', '1', 'Abra MEG 54', '1.5')
    await save(user)
    expect(duplicate.row.getByRole('alert').textContent).toBe('Carta já está no deck, edite a linha existente')
    expect(tooMany.row.getByRole('alert').textContent).toBe('Quantidade máxima para esta carta: 2')
    expect(badOwned.row.getByRole('alert').textContent).toMatch(/Adquirido/)
    expect(savedDeck()).toBeUndefined()
  })

  it('clears a row error when the row is edited', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Deck')
    const { row } = await addRow('Pokémon', '1', 'Abra XYZ 54', '1')
    await save(user)
    expect(row.getByRole('alert')).toBeTruthy()
    await user.type(row.getByLabelText(/^Quantidade/), '1')
    expect(row.queryByRole('alert')).toBeNull()
  })

  it('warns about more than 4 copies across printings but still saves', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Deck')
    await addRow('Pokémon', '3', 'Abra MEG 54', '3')
    const second = await addRow('Pokémon', '2', 'Abra MEG 53', '0')
    expect(second.row.getByText('Mais de 4 cópias de Abra MEG 53 no deck')).toBeTruthy()
    expect(second.element.getAttribute('data-status')).toBe('invalid')
    await save(user)
    expect(savedDeck()?.cards).toHaveLength(2)
  })

  it('marks a row green only when valid and owned covers the quantity', async () => {
    renderEditor()
    const user = userEvent.setup()
    const { row, element } = await addRow('Pokémon', '2', 'Abra MEG 54', '1')
    expect(element.getAttribute('data-status')).toBe('invalid')

    await user.clear(row.getByLabelText(/^Adquirido/))
    await user.type(row.getByLabelText(/^Adquirido/), '2')
    expect(element.getAttribute('data-status')).toBe('valid')

    await user.clear(row.getByLabelText(/^Carta/))
    await user.type(row.getByLabelText(/^Carta/), 'Abra XYZ 54')
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
    const row = within(panel('Pokémon').getByTestId('card-row'))
    await user.click(row.getByLabelText(/^Carta/))

    expect(screen.getByRole('option', { name: 'Abra MEG 54' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Ordem da chefia' })).toBeNull()

    await user.click(screen.getByRole('option', { name: 'Abra MEG 54' }))
    expect((row.getByLabelText(/^Carta/) as HTMLInputElement).value).toBe('Abra MEG 54')
    expect((row.getByLabelText(/^Adquirido/) as HTMLInputElement).value).toBe('3')
  })

  it('pre-fills owned when the typed text resolves to a known key', async () => {
    getDeckStore().replaceAll({
      decks: [],
      owned: { 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 3 } },
    })
    renderEditor()
    const { row } = await addRow('Pokémon', '1', 'Abra MEG 54')
    expect((row.getByLabelText(/^Adquirido/) as HTMLInputElement).value).toBe('3')
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

  it('deletes the deck after confirmation and returns to the list without a leave prompt', async () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderEditor(deckPath('abc'))
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'x')
    await user.click(screen.getByRole('button', { name: /Excluir deck/ }))
    expect(getDeckStore().getSnapshot().decks).toHaveLength(1)
    await user.click(await screen.findByRole('button', { name: 'Excluir' }))
    expect(getDeckStore().getSnapshot().decks).toHaveLength(0)
    expect(await screen.findByRole('heading', { name: 'Lista' })).toBeTruthy()
  })

  it('shows a not-found state for an unknown deck id without creating a deck', () => {
    renderEditor(deckPath('missing'))
    expect(screen.getByRole('heading', { level: 1, name: 'Editar deck' }).className).toContain('sr-only')
    expect(screen.getByText('Deck não encontrado')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Voltar/ }).getAttribute('href')).toBe(ROUTES.decks)
    expect(screen.queryByPlaceholderText('Nome do deck')).toBeNull()
    expect(getDeckStore().getSnapshot().decks).toHaveLength(0)
  })

  it('follows owned changes made elsewhere unless the field has an unsaved edit', async () => {
    const card = { category: 'pokemon', key: 'MEG-54', displayName: 'Abra MEG 54', quantity: 2 } as const
    const deck = { id: 'abc', name: 'Alakazam', cards: [card] }
    const entry = (quantity: number) => ({
      'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon' as const, quantity },
    })
    getDeckStore().saveDeck(deck, entry(1))
    renderEditor(deckPath('abc'))
    const owned = () => panel('Pokémon').getByLabelText(/^Adquirido/) as HTMLInputElement
    expect(owned().value).toBe('1')

    act(() => getDeckStore().saveDeck(deck, entry(4)))
    expect(owned().value).toBe('4')

    const user = userEvent.setup()
    await user.clear(owned())
    await user.type(owned(), '9')
    act(() => getDeckStore().saveDeck(deck, entry(6)))
    expect(owned().value).toBe('9')
  })

  it('recreates the deck under the same id when it was deleted elsewhere', async () => {
    getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
    renderEditor(deckPath('abc'))
    act(() => getDeckStore().deleteDeck('abc'))
    const user = userEvent.setup()
    await save(user)
    expect(savedDeck()?.id).toBe('abc')
  })

  describe('leaving with unsaved changes', () => {
    it('does not prompt for a new deck with nothing typed', async () => {
      const router = renderEditor()
      const user = userEvent.setup()
      await user.click(screen.getByRole('link', { name: 'Sair' }))
      expect(router.state.location.pathname).toBe(ROUTES.decks)
    })

    it('asks before in-app navigation when dirty, and stays on Continue editing', async () => {
      const router = renderEditor()
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
      await user.click(screen.getByRole('link', { name: 'Sair' }))
      expect(await screen.findByText('Descartar alterações?')).toBeTruthy()
      expect(router.state.location.pathname).toBe(ROUTES.newDeck)

      await user.click(screen.getByRole('button', { name: 'Continuar editando' }))
      expect(router.state.location.pathname).toBe(ROUTES.newDeck)
      expect((screen.getByPlaceholderText('Nome do deck') as HTMLInputElement).value).toBe('Alakazam')
    })

    it('treats Escape as Continue editing', async () => {
      const router = renderEditor()
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
      await user.click(screen.getByRole('link', { name: 'Sair' }))
      expect(await screen.findByText('Descartar alterações?')).toBeTruthy()

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByText('Descartar alterações?')).toBeNull())
      expect(router.state.location.pathname).toBe(ROUTES.newDeck)
    })

    it('leaves and discards on confirmation', async () => {
      const router = renderEditor()
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
      await user.click(screen.getByRole('link', { name: 'Sair' }))
      await user.click(await screen.findByRole('button', { name: 'Descartar' }))
      expect(router.state.location.pathname).toBe(ROUTES.decks)
      expect(savedDeck()).toBeUndefined()
    })

    it('does not prompt after saving', async () => {
      getDeckStore().saveDeck({ id: 'abc', name: 'Alakazam', cards: [] })
      const router = renderEditor(deckPath('abc'))
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Nome do deck'), ' 2')
      await save(user)
      await user.click(screen.getByRole('link', { name: 'Sair' }))
      expect(router.state.location.pathname).toBe(ROUTES.decks)
    })

    it('warns on close or reload only while dirty', async () => {
      renderEditor()
      const user = userEvent.setup()
      const unloadPrevented = () => {
        const event = new Event('beforeunload', { cancelable: true })
        window.dispatchEvent(event)
        return event.defaultPrevented
      }
      expect(unloadPrevented()).toBe(false)
      await user.type(screen.getByPlaceholderText('Nome do deck'), 'A')
      expect(unloadPrevented()).toBe(true)
    })
  })
})

describe('DeckEditor accessibility', () => {
  it('renders each panel title as an h2', () => {
    renderEditor()
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['Pokémon', 'Treinadores', 'Energias'])
  })

  it('gives row controls unique names with row position and category', async () => {
    renderEditor()
    await addCard(userEvent.setup(), 'Pokémon')
    const scope = panel('Pokémon')
    expect(scope.getByRole('spinbutton', { name: 'Quantidade da linha 2 de Pokémon' })).toBeTruthy()
    expect(scope.getByRole('combobox', { name: 'Carta da linha 2 de Pokémon' })).toBeTruthy()
    expect(scope.getByRole('spinbutton', { name: 'Adquirido da linha 2 de Pokémon' })).toBeTruthy()
    expect(scope.getByRole('button', { name: 'Excluir linha 2 de Pokémon' })).toBeTruthy()
    expect(scope.getByRole('button', { name: 'Adicionar carta de Pokémon' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Adicionar carta de Treinadores' })).toBeTruthy()
  })

  it('moves focus to the next row after deleting a row, else the previous, else the add button', async () => {
    renderEditor()
    const user = userEvent.setup()
    await addCard(user, 'Pokémon')
    await addCard(user, 'Pokémon')
    const scope = panel('Pokémon')
    await user.click(scope.getByRole('button', { name: 'Excluir linha 2 de Pokémon' }))
    expect(document.activeElement).toBe(scope.getByLabelText('Quantidade da linha 2 de Pokémon'))
    await user.click(scope.getByRole('button', { name: 'Excluir linha 2 de Pokémon' }))
    expect(document.activeElement).toBe(scope.getByLabelText('Quantidade da linha 1 de Pokémon'))
    await user.click(scope.getByRole('button', { name: 'Excluir linha 1 de Pokémon' }))
    expect(document.activeElement).toBe(scope.getByRole('button', { name: 'Adicionar carta de Pokémon' }))
  })

  it('links the card combobox to its listbox and the highlighted option', async () => {
    getDeckStore().replaceAll({
      decks: [],
      owned: {
        'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 3 },
        'MEG-55': { displayName: 'Kadabra MEG 55', category: 'pokemon', quantity: 3 },
      },
    })
    renderEditor()
    const user = userEvent.setup()
    const input = panel('Pokémon').getByRole('combobox')
    expect(input.getAttribute('aria-controls')).toBeNull()
    await user.click(input)
    const listbox = screen.getByRole('listbox')
    expect(input.getAttribute('aria-controls')).toBe(listbox.id)
    expect(listbox.id).not.toBe('')
    const active = () => document.getElementById(input.getAttribute('aria-activedescendant') ?? '')
    expect(active()?.getAttribute('role')).toBe('option')
    const first = active()?.textContent
    await user.keyboard('{ArrowDown}')
    expect(active()?.textContent).not.toBe(first)
    expect(active()?.getAttribute('aria-selected')).toBe('true')
    await user.keyboard('{Escape}')
    expect(input.getAttribute('aria-activedescendant')).toBeNull()
  })

  it('announces the number of suggestions in a polite live region', async () => {
    getDeckStore().replaceAll({
      decks: [],
      owned: { 'MEG-54': { displayName: 'Abra MEG 54', category: 'pokemon', quantity: 3 } },
    })
    renderEditor()
    await userEvent.setup().click(panel('Pokémon').getByRole('combobox'))
    expect(screen.getByText('1 sugestão').getAttribute('role')).toBe('status')
  })

  it('titles the owned column "Tem" and uses the same word as the owned placeholder', async () => {
    renderEditor()
    const scope = panel('Pokémon')
    expect(scope.getByText('Tem')).toBeTruthy()
    expect(scope.queryByText('Adq.')).toBeNull()
    const { row } = await addRow('Pokémon', '1', 'Abra MEG 54')
    expect(row.getByLabelText(/^Adquirido/).getAttribute('placeholder')).toBe('Tem')
  })

  it('counts the copies still missing in the pendency sentence', async () => {
    renderEditor()
    const { element } = await addRow('Treinadores', '4', 'Ordem da chefia', '1')
    expect(within(element).getByText('Linha com pendências — faltam 3 cartas')).toBeTruthy()
  })

  it('uses the singular for a single missing copy', async () => {
    renderEditor()
    const { element } = await addRow('Treinadores', '1', 'Ordem da chefia')
    expect(within(element).getByText('Linha com pendências — faltam 1 carta')).toBeTruthy()
  })

  it('ties a row error to its inputs and shows a non-colour cue', async () => {
    renderEditor()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('Nome do deck'), 'Alakazam')
    const { row, element } = await addRow('Pokémon', '1', 'lixo')
    await save(user)
    const alert = row.getByRole('alert')
    for (const name of [/^Quantidade/, /^Carta/, /^Adquirido/]) {
      expect(row.getByLabelText(name).getAttribute('aria-describedby')).toBe(alert.id)
    }
    expect(alert.id).not.toBe('')
    expect(row.getByLabelText(/^Carta/).getAttribute('aria-invalid')).toBe('true')
    expect(within(element).getByText('Linha com pendências')).toBeTruthy()
  })

  it('marks a valid row with text, not only colour, and without aria-invalid', async () => {
    const { row } = await (async () => {
      renderEditor()
      return addRow('Treinadores', '1', 'Ordem da chefia', '1')
    })()
    expect(row.getByText('Linha válida')).toBeTruthy()
    expect(row.getByLabelText(/^Carta/).getAttribute('aria-invalid')).toBeNull()
  })

  it('announces a row warning with role status and links it to the card input', async () => {
    renderEditor()
    const { row } = await addRow('Treinadores', '5', 'Ordem da chefia', '5')
    const status = row.getAllByRole('status').find((el) => el.id) as HTMLElement
    expect(status.textContent).not.toBe('')
    expect(row.getByLabelText(/^Carta/).getAttribute('aria-describedby')).toBe(status.id)
  })

  it('ties a copies warning to the card and quantity inputs only', async () => {
    renderEditor()
    const { row } = await addRow('Treinadores', '5', 'Ordem da chefia', '5')
    const id = row.getAllByRole('status').find((el) => el.id)?.id
    for (const name of [/^Quantidade/, /^Carta/]) {
      expect(row.getByLabelText(name).getAttribute('aria-invalid')).toBe('true')
      expect(row.getByLabelText(name).getAttribute('aria-describedby')).toBe(id)
    }
    const owned = row.getByLabelText(/^Adquirido/)
    expect(owned.getAttribute('aria-invalid')).toBeNull()
    expect(owned.getAttribute('aria-describedby')).toBeNull()
  })

  it('flags only the owned input when it is below the quantity', async () => {
    renderEditor()
    const { row } = await addRow('Treinadores', '2', 'Ordem da chefia', '1')
    const owned = row.getByLabelText(/^Adquirido/)
    expect(owned.getAttribute('aria-invalid')).toBe('true')
    expect(owned.getAttribute('aria-describedby')).toBeNull()
    for (const name of [/^Quantidade/, /^Carta/]) {
      expect(row.getByLabelText(name).getAttribute('aria-invalid')).toBeNull()
    }
  })

  it('ties the deck name error to the name input', async () => {
    renderEditor()
    const user = userEvent.setup()
    await save(user)
    const input = screen.getByPlaceholderText('Nome do deck')
    const alert = screen.getAllByRole('alert').find((el) => el.id === input.getAttribute('aria-describedby'))
    expect(alert).toBeTruthy()
  })
})

describe('icon-only row controls', () => {
  // Rule: the title is the short action shown on hover; the aria-label names the row or panel it acts on.
  it('title the short action and name the row in the accessible name', async () => {
    const user = userEvent.setup()
    renderEditor()
    await addCard(user, 'Pokémon')

    const remove = screen.getByRole('button', { name: 'Excluir linha 1 de Pokémon' })
    expect(remove.getAttribute('title')).toBe('Remover carta')
    const add = panel('Pokémon').getByRole('button', { name: 'Adicionar carta de Pokémon' })
    expect(add.getAttribute('title')).toBe('Adicionar carta')
  })
})
