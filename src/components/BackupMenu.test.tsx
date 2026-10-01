// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BackupMenu } from '@/components/BackupMenu'
import { ToastProvider } from '@/components/ui/toast'
import { buildBackup } from '@/lib/deck/backup'
import { getDeckStore } from '@/lib/deck/deckStore'
import type { PersistedData } from '@/lib/deck/storage'

const current: PersistedData = {
  decks: [{ id: 'old', name: 'Antigo', cards: [] }],
  owned: {},
}
const incoming: PersistedData = {
  decks: [{ id: 'n1', name: 'Novo', cards: [] }],
  owned: {
    fogo: { displayName: 'Energia Fogo', category: 'energy', quantity: 4 },
  },
}

const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

beforeEach(() => {
  localStorage.clear()
  getDeckStore().replaceAll(current)
})
afterEach(() => {
  cleanup()
  URL.createObjectURL = originalCreateObjectURL
  URL.revokeObjectURL = originalRevokeObjectURL
  vi.restoreAllMocks()
})

async function openMenu() {
  await userEvent.click(screen.getByRole('button', { name: 'Dados' }))
}

async function pickFile(content: string) {
  await openMenu()
  await userEvent.click(await screen.findByText('Importar backup'))
  const input = screen.getByLabelText('Arquivo de backup')
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
    render(<ToastProvider><BackupMenu /></ToastProvider>)
    await openMenu()
    await userEvent.click(await screen.findByText('Exportar backup'))
    expect(click).toHaveBeenCalledOnce()
    const payload = JSON.parse(await blob!.text())
    expect(payload).toMatchObject({
      version: 1,
      decks: current.decks,
      owned: {},
    })
    expect(typeof payload.exportedAt).toBe('string')
  })

  it('shows a summary and replaces everything only after confirming', async () => {
    render(<ToastProvider><BackupMenu /></ToastProvider>)
    await pickFile(JSON.stringify(buildBackup(incoming)))
    expect(await screen.findByText(/1 deck\(s\) e 1 carta\(s\)/)).toBeTruthy()
    expect(getDeckStore().getSnapshot()).toEqual(current)
    await userEvent.click(screen.getByRole('button', { name: 'Substituir tudo' }))
    await waitFor(() => expect(getDeckStore().getSnapshot()).toEqual(incoming))
    expect((await screen.findByText('Backup importado com sucesso')).textContent).toBeTruthy()
  })

  it('keeps the data when the confirmation is cancelled', async () => {
    render(<ToastProvider><BackupMenu /></ToastProvider>)
    await pickFile(JSON.stringify(buildBackup(incoming)))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(getDeckStore().getSnapshot()).toEqual(current)
  })

  it('rejects an invalid file without touching the data', async () => {
    render(<ToastProvider><BackupMenu /></ToastProvider>)
    await pickFile('{"decks": 1}')
    expect(await screen.findByText('Arquivo de backup inválido')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Substituir tudo' })).toBeNull()
    expect(getDeckStore().getSnapshot()).toEqual(current)
  })

  it('shows a specific message for an unsupported version', async () => {
    render(<ToastProvider><BackupMenu /></ToastProvider>)
    await pickFile(JSON.stringify({ ...buildBackup(incoming), version: 2 }))
    expect(await screen.findByText('Versão de backup não suportada')).toBeTruthy()
    expect(getDeckStore().getSnapshot()).toEqual(current)
  })

  it('styles the invalid-file title with the danger token', async () => {
    render(<ToastProvider><BackupMenu /></ToastProvider>)
    await pickFile('{"decks": 1}')
    const title = await screen.findByText('Não foi possível importar')
    expect(title.className).toContain('text-danger')
  })
})
