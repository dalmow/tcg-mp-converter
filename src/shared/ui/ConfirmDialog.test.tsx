// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

afterEach(cleanup)

describe('ConfirmDialog', () => {
  it('shows the title, the info line, the warning and both buttons', () => {
    render(
      <ConfirmDialog
        open
        title="Excluir deck?"
        info="A quantidade adquirida é mantida."
        warning="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={vi.fn()}
      />,
    )

    expect(screen.getByRole('alertdialog', { name: 'Excluir deck?' })).toBeTruthy()
    expect(screen.getByText('A quantidade adquirida é mantida.')).toBeTruthy()
    expect(screen.getByText('Esta ação não pode ser desfeita.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeTruthy()
  })

  it('calls onConfirm once when the confirm button is pressed', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog open title="Excluir?" warning="Sem volta." confirmLabel="Excluir" onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('opens from its trigger button and reports the close through onOpenChange', async () => {
    const onOpenChange = vi.fn()
    render(
      <ConfirmDialog
        trigger={<button type="button">Abrir</button>}
        title="Excluir?"
        warning="Sem volta."
        confirmLabel="Excluir"
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByRole('alertdialog', { name: 'Excluir?' })).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false, expect.anything())
  })
})
