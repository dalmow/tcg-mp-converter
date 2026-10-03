// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import ConverterPage from '@/pages/ConverterPage'
import { ToastProvider } from '@/components/ui/toast'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderPage() {
  return render(
    <ToastProvider>
      <MemoryRouter>
        <ConverterPage />
      </MemoryRouter>
    </ToastProvider>,
  )
}

function radio(name: string) {
  return screen.getByRole('radio', { name })
}

function isChecked(name: string) {
  return radio(name).getAttribute('aria-checked') === 'true'
}

describe('ConverterPage selectors', () => {
  it.each([
    ['Qualidade', ['M', 'NM', 'SP', 'MP', 'HP', 'D'], 'NM'],
    ['Idioma', ['PTEN', 'PT', 'EN'], 'PTEN'],
  ])('exposes %s as a labelled radiogroup', (name, options, selected) => {
    renderPage()

    const group = within(screen.getByRole('radiogroup', { name }))

    expect(group.getAllByRole('radio')).toHaveLength(options.length)
    for (const option of options) {
      expect(group.getByRole('radio', { name: option }).getAttribute('aria-checked')).toBe(
        String(option === selected),
      )
    }
  })

  it('uses roving tabindex: only the checked radio is a tab stop', async () => {
    const user = userEvent.setup()
    renderPage()

    const radios = within(screen.getByRole('radiogroup', { name: 'Qualidade' })).getAllByRole('radio')
    for (const item of radios) {
      expect(item.tabIndex).toBe(item.getAttribute('aria-checked') === 'true' ? 0 : -1)
    }

    await user.click(radio('HP'))

    expect(radio('HP').tabIndex).toBe(0)
    expect(radio('NM').tabIndex).toBe(-1)
  })

  it('selects an option on click', async () => {
    renderPage()
    const group = screen.getByRole('radiogroup', { name: 'Qualidade' })

    await userEvent.click(radio('HP'))

    expect(isChecked('HP')).toBe(true)
    expect(group.querySelectorAll('[aria-checked="true"]')).toHaveLength(1)
  })

  it('reaches the checked radio of each group with Tab and leaves the group with one Tab', async () => {
    const user = userEvent.setup()
    renderPage()

    for (let presses = 0; document.activeElement !== radio('NM') && presses < 10; presses++) {
      await user.tab()
    }
    expect(document.activeElement).toBe(radio('NM'))

    await user.tab()
    expect(document.activeElement).toBe(radio('PTEN'))
  })

  it('moves focus and selection with arrow keys, wrapping around', async () => {
    const user = userEvent.setup()
    renderPage()
    radio('NM').focus()

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(radio('SP'))
    expect(isChecked('SP')).toBe(true)

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(document.activeElement).toBe(radio('M'))

    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(radio('D'))
  })

  describe('Idioma', () => {
    it('moves with ArrowDown and ArrowUp', async () => {
      const user = userEvent.setup()
      renderPage()
      radio('PTEN').focus()

      await user.keyboard('{ArrowDown}')
      expect(document.activeElement).toBe(radio('PT'))
      expect(isChecked('PT')).toBe(true)

      await user.keyboard('{ArrowUp}')
      expect(document.activeElement).toBe(radio('PTEN'))
      expect(isChecked('PTEN')).toBe(true)
    })

    it('wraps around in both directions', async () => {
      const user = userEvent.setup()
      renderPage()
      radio('PTEN').focus()

      await user.keyboard('{ArrowUp}')
      expect(document.activeElement).toBe(radio('EN'))

      await user.keyboard('{ArrowDown}')
      expect(document.activeElement).toBe(radio('PTEN'))
    })

    it('selects the focused option with Enter', async () => {
      const user = userEvent.setup()
      renderPage()
      radio('PT').focus()

      await user.keyboard('{Enter}')

      expect(isChecked('PT')).toBe(true)
    })

    it('selects the focused option with Space', async () => {
      const user = userEvent.setup()
      renderPage()
      radio('EN').focus()

      await user.keyboard(' ')

      expect(isChecked('EN')).toBe(true)
    })
  })
})

describe('ConverterPage results', () => {
  it('names each result textarea after its marketplace heading', () => {
    renderPage()

    expect(screen.getByRole('textbox', { name: 'Liga Pokemon' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'MYPCards' })).toBeTruthy()
  })
})

describe('ConverterPage target size', () => {
  it('keeps every option radio at least 24px tall (WCAG 2.5.8)', () => {
    renderPage()

    for (const item of screen.getAllByRole('radio')) {
      expect(item.className).toContain('h-6')
    }
  })
})

describe('ConverterPage copy feedback', () => {
  async function convertAndCopy(writeText: (text: string) => Promise<void>) {
    const user = userEvent.setup()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    renderPage()
    await user.type(screen.getByRole('textbox', { name: 'Decklist' }), '3 Abra MEG 53')
    await user.click(screen.getByRole('button', { name: 'Converter' }))
    await user.click(screen.getAllByRole('button', { name: 'Copiar' })[0])
  }

  it('announces success after copying', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    await convertAndCopy(writeText)

    expect(writeText).toHaveBeenCalledOnce()
    expect((await screen.findByRole('status')).textContent).toContain('Copiado')
  })

  it('announces an error when the clipboard write is rejected', async () => {
    await convertAndCopy(vi.fn().mockRejectedValue(new Error('denied')))

    expect((await screen.findByRole('alert')).textContent).toContain('Não foi possível copiar')
  })
})
