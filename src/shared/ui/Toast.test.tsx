// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_DURATION_MS, ToastProvider } from './Toast'
import { useToast } from '@/shared/hooks/useToast'

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

  it('does not auto-dismiss error toasts', async () => {
    setup()
    await userEvent.click(screen.getByText('erro'))
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 10)
    })
    expect(screen.getByRole('alert').textContent).toContain('Falhou')
  })

  it('pauses the timer while hovered and resumes on leave', async () => {
    setup()
    await userEvent.click(screen.getByText('ok'))
    const toast = screen.getByRole('status')
    await userEvent.hover(toast)
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 3)
    })
    expect(screen.getByRole('status')).toBeTruthy()
    await userEvent.unhover(toast)
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS + 1)
    })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('pauses the timer while focus is inside and resumes on blur', async () => {
    setup()
    await userEvent.click(screen.getByText('ok'))
    const close = screen.getByRole('button', { name: 'Fechar notificação' })
    act(() => close.focus())
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS * 3)
    })
    expect(screen.getByRole('status')).toBeTruthy()
    act(() => close.blur())
    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION_MS + 1)
    })
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('gives the close button a hit area of at least 24x24px', async () => {
    setup()
    await userEvent.click(screen.getByText('ok'))
    const close = screen.getByRole('button', { name: 'Fechar notificação' })
    expect(close.className).toContain('size-6')
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

  it('throws without a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Trigger />)).toThrow('useToast must be used inside <ToastProvider>')
  })
})
