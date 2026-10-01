// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BackupMenu } from '@/components/BackupMenu'
import { buildBackup } from '@/lib/deck/backup'
import { getDeckStore } from '@/lib/deck/deckStore'
import type { PersistedData } from '@/lib/deck/storage'

const current: PersistedData = { decks: [{ id: 'old', name: 'Antigo', cards: [] }], owned: {} }
const incoming: PersistedData = {
  decks: [{ id: 'n1', name: 'Novo', cards: [] }],
  owned: { fogo: { displayName: 'Energia Fogo', category: 'energy', quantity: 4 } },
}

beforeEach(() => {
  localStorage.clear()
  getDeckStore().replaceAll(current)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function openMenu() {
  await userEvent.click(screen.getByRole('button', { name: 'Dados' }))
}

async function pickFile(content: string) {
  await openMenu()
  await userEvent.click(await screen.findByText('Importar backup'))
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  await userEvent.upload(input, new File([content], 'backup.json', { type: 'application/json' }))
}

describe('BackupMenu', () => {
  it('downloads the current data as a json file on export', async () => {
    let blob: Blob | undefined
    URL.createObjectURL = vi.fn((b: Blob) => {
      blob = b
      return 'blob:x'
    })
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<BackupMenu />)
    await openMenu()
    await userEvent.click(await screen.findByText('Exportar backup'))
    expect(click).toHaveBeenCalledOnce()
    const payload = JSON.parse(await blob!.text())
    expect(payload).toMatchObject({ version: 1, decks: current.decks, owned: {} })
    expect(typeof payload.exportedAt).toBe('string')
  })

  it('shows a summary and replaces everything only after confirming', async () => {
    render(<BackupMenu />)
    await pickFile(JSON.stringify(buildBackup(incoming)))
    expect(await screen.findByText(/1 deck\(s\) e 1 carta\(s\)/)).toBeTruthy()
    expect(getDeckStore().getSnapshot()).toEqual(current)
    await userEvent.click(screen.getByRole('button', { name: 'Substituir tudo' }))
    await waitFor(() => expect(getDeckStore().getSnapshot()).toEqual(incoming))
  })

  it('keeps the data when the confirmation is cancelled', async () => {
    render(<BackupMenu />)
    await pickFile(JSON.stringify(buildBackup(incoming)))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(getDeckStore().getSnapshot()).toEqual(current)
  })

  it('rejects an invalid file without touching the data', async () => {
    render(<BackupMenu />)
    await pickFile('{"decks": 1}')
    expect(await screen.findByText('Arquivo de backup inválido')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Substituir tudo' })).toBeNull()
    expect(getDeckStore().getSnapshot()).toEqual(current)
  })
})
