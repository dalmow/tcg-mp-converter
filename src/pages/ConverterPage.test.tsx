// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router'
import ConverterPage from '@/pages/ConverterPage'

afterEach(cleanup)

function renderPage() {
  return render(
    <MemoryRouter>
      <ConverterPage />
    </MemoryRouter>,
  )
}

describe('ConverterPage selectors', () => {
  it.each([
    ['Qualidade', ['M', 'NM', 'SP', 'MP', 'HP', 'D'], 'NM'],
    ['Idioma', ['PTEN', 'PT', 'EN'], 'PTEN'],
  ])('exposes %s as a labelled radiogroup', (name, options, selected) => {
    renderPage()

    const group = screen.getByRole('radiogroup', { name })
    const radios = screen.getAllByRole('radio', { hidden: false }).filter((radio) => group.contains(radio))

    expect(radios).toHaveLength(options.length)
    const checked = radios.filter((radio) => radio.getAttribute('aria-checked') === 'true')
    expect(checked).toHaveLength(1)
    expect(checked[0].textContent).toContain(selected)
  })

  it('selects an option on click', async () => {
    renderPage()
    const group = screen.getByRole('radiogroup', { name: 'Qualidade' })

    await userEvent.click(screen.getByRole('radio', { name: 'HP' }))

    expect(screen.getByRole('radio', { name: 'HP' }).getAttribute('aria-checked')).toBe('true')
    expect(group.querySelectorAll('[aria-checked="true"]')).toHaveLength(1)
  })

  it('is reachable by keyboard with roving tabindex and arrow keys', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.tab() // decklist textarea
    await user.tab() // checked Qualidade radio (NM)
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'NM' }))

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'SP' }))
    expect(screen.getByRole('radio', { name: 'SP' }).getAttribute('aria-checked')).toBe('true')

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'M' }))

    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'D' }))

    await user.tab() // leaves group to next group
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: /PTEN/ }))
  })
})

describe('ConverterPage results', () => {
  it('names each result textarea after its marketplace heading', () => {
    renderPage()

    expect(screen.getByRole('textbox', { name: 'Liga Pokemon' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'MYPCards' })).toBeTruthy()
  })
})
