// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_DURATION_MS, ToastProvider, useToast } from './toast'

function Trigger() {
  const toast = useToast()
  return (
    <>
      <button onClick={() => toast.success('Salvo')}>ok</button>
      <button onClick={() => toast.error('Falhou')}>erro</button>
    </>
  )
}

function setup() {
  render(
    <ToastProvider>
      <Trigger />
    </ToastProvider>,
  )
}

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Toast', () => {
  it('shows a success toast as a polite status', async () => {
    setup()
    await userEvent.click(screen.getByText('ok'))
    expect(screen.getByRole('status').textContent).toContain('Salvo')
  })

  it('shows an error toast as an alert', async () => {
    setup()
    await userEvent.click(screen.getByText('erro'))
    expect(screen.getByRole('alert').textContent).toContain('Falhou')
  })

  it('dismisses itself after the duration', async () => {
    setup()
    await userEvent.click(screen.getByText('ok'))
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS + 1)
    })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('dismisses on close button', async () => {
    setup()
    await userEvent.click(screen.getByText('ok'))
    await userEvent.click(screen.getByRole('button', { name: 'Fechar notificação' }))
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('stacks several toasts', async () => {
    setup()
    await userEvent.click(screen.getByText('ok'))
    await userEvent.click(screen.getByText('erro'))
    expect(screen.getAllByRole('button', { name: 'Fechar notificação' })).toHaveLength(2)
  })

  it('does nothing without a provider', async () => {
    render(<Trigger />)
    await userEvent.click(screen.getByText('ok'))
    expect(screen.queryByRole('status')).toBeNull()
  })
})
