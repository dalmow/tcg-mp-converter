// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router'
import ConverterPage from './ConverterPage'
import converterSource from './ConverterPage.tsx?raw'
import { ToastProvider } from '@/shared/ui/Toast'

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
      expect(group.getByRole('radio', { name: option }).getAttribute('aria-checked')).toBe(String(option === selected))
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
      // Tailwind spacing unit is 4px, so h-6 is 24px; the DS pill is h-9.5 (38px).
      const units = Number(/(?:^|\s)h-(\d+(?:\.\d+)?)(?:\s|$)/.exec(item.className)?.[1])
      expect(units * 4).toBeGreaterThanOrEqual(24)
    }
  })
})

describe('ConverterPage design system copy', () => {
  it('shows the page title with its supporting sentence', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Conversor' })).toBeTruthy()
    expect(screen.getByText('Cole sua decklist e converta pro formato aceito pelas lojas parceiras.')).toBeTruthy()
  })

  it('uses the DS placeholders for the input and result textareas', () => {
    renderPage()

    expect(screen.getByRole('textbox', { name: 'Decklist' }).getAttribute('placeholder')).toBe(
      'Cole sua decklist aqui…',
    )
    for (const name of ['Liga Pokemon', 'MYPCards']) {
      expect(screen.getByRole('textbox', { name }).getAttribute('placeholder')).toBe('O resultado aparecerá aqui…')
    }
  })

  it('titles each Quality pill with its full name', () => {
    renderPage()

    expect(radio('M').title).toBe('Mint')
    expect(radio('NM').title).toBe('Near Mint')
    expect(radio('D').title).toBe('Damaged')
  })

  it('disables Copiar until there is something to copy', async () => {
    const user = userEvent.setup()
    renderPage()
    const copyButtons = screen.getAllByRole('button', { name: 'Copiar' })

    expect(copyButtons.every((button) => button.hasAttribute('disabled'))).toBe(true)

    await user.type(screen.getByRole('textbox', { name: 'Decklist' }), '3 Abra MEG 53')
    await user.click(screen.getByRole('button', { name: 'Converter' }))

    expect(copyButtons.some((button) => !button.hasAttribute('disabled'))).toBe(true)
  })

  it('lists unresolved cards in a labelled panel', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByRole('textbox', { name: 'Decklist' }), 'not a card line')
    await user.click(screen.getByRole('button', { name: 'Converter' }))

    const panel = screen.getByRole('region', { name: 'Cartas não resolvidas' })
    expect(within(panel).getByText('not a card line')).toBeTruthy()
  })
})

describe('ConverterPage unselected states', () => {
  it('unselected badges do not rely on opacity', () => {
    expect(converterSource).not.toMatch(/opacity-\d+/)
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
