// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BackupMenu } from '@/components/BackupMenu'
import { ToastProvider } from '@/components/ui/toast'
import { useBackup } from '@/components/useBackup'
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

async function expectNoDialog() {
  await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
}

async function pickFile(content: string) {
  await openMenu()
  await userEvent.click(await screen.findByText('Importar backup'))
  const input = screen.getByLabelText('Arquivo de backup')
  await userEvent.upload(input, new File([content], 'backup.json', { type: 'application/json' }))
}

function Host() {
  const backup = useBackup()
  return (
    <>
      <BackupMenu backup={backup} />
      {backup.dialog}
    </>
  )
}

function renderMenu() {
  return render(
    <ToastProvider>
      <Host />
    </ToastProvider>,
  )
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
    renderMenu()
    await openMenu()
    await userEvent.click(await screen.findByText('Exportar backup'))
    expect(click).toHaveBeenCalledOnce()
    expect(await screen.findByText('Backup exportado')).toBeTruthy()
    const payload = JSON.parse(await blob!.text())
    expect(payload).toMatchObject({
      version: 1,
      decks: current.decks,
      owned: {},
    })
    expect(typeof payload.exportedAt).toBe('string')
  })

  it('shows a summary and replaces everything only after confirming', async () => {
    renderMenu()
    await pickFile(JSON.stringify(buildBackup(incoming)))
    expect(await screen.findByText(/1 deck\(s\) e 1 carta\(s\)/)).toBeTruthy()
    expect(getDeckStore().getSnapshot()).toEqual(current)
    await userEvent.click(screen.getByRole('button', { name: 'Substituir tudo' }))
    await waitFor(() => expect(getDeckStore().getSnapshot()).toEqual(incoming))
    expect((await screen.findByText('Backup importado com sucesso')).textContent).toBeTruthy()
    await expectNoDialog()
  })

  it('keeps the data when the confirmation is cancelled', async () => {
    renderMenu()
    await pickFile(JSON.stringify(buildBackup(incoming)))
    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(getDeckStore().getSnapshot()).toEqual(current)
  })

  it('rejects an invalid file with an error toast and no dialog', async () => {
    renderMenu()
    await pickFile('{"decks": 1}')
    const toast = await screen.findByText('Arquivo de backup inválido')
    expect(toast.closest('[role="alert"]')).not.toBeNull()
    await expectNoDialog()
    expect(getDeckStore().getSnapshot()).toEqual(current)
  })

  it('shows a specific toast for an unsupported version', async () => {
    renderMenu()
    await pickFile(JSON.stringify({ ...buildBackup(incoming), version: 2 }))
    expect(await screen.findByText('Versão de backup não suportada')).toBeTruthy()
    await expectNoDialog()
    expect(getDeckStore().getSnapshot()).toEqual(current)
  })
})
