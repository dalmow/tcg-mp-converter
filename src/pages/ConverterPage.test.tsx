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

    screen.getByRole('textbox', { name: 'Decklist' }).focus()
    await user.tab() // next tab stop is the checked Qualidade radio (NM)
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'NM' }))

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'SP' }))
    expect(screen.getByRole('radio', { name: 'SP' }).getAttribute('aria-checked')).toBe('true')

    await user.keyboard('{ArrowLeft}{ArrowLeft}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'M' }))

    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'D' }))

    await user.tab() // leaves group to next group
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'PTEN' }))
  })

  it('navigates Idioma with ArrowUp/ArrowDown and selects with Enter and Space', async () => {
    const user = userEvent.setup()
    renderPage()

    screen.getByRole('radio', { name: 'PTEN' }).focus()

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'PT' }))
    expect(screen.getByRole('radio', { name: 'PT' }).getAttribute('aria-checked')).toBe('true')

    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'EN' }))

    await user.keyboard('{ArrowDown}') // wraps around
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'PTEN' }))

    await user.keyboard('{ArrowUp}') // wraps backwards
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'EN' }))

    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'PT' }))

    await user.keyboard('{Enter}')
    expect(screen.getByRole('radio', { name: 'PT' }).getAttribute('aria-checked')).toBe('true')

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('radio', { name: 'EN' }).getAttribute('aria-checked')).toBe('true')
    screen.getByRole('radio', { name: 'PTEN' }).focus()
    await user.keyboard(' ')
    expect(screen.getByRole('radio', { name: 'PTEN' }).getAttribute('aria-checked')).toBe('true')
  })
})

describe('ConverterPage results', () => {
  it('names each result textarea after its marketplace heading', () => {
    renderPage()

    expect(screen.getByRole('textbox', { name: 'Liga Pokemon' })).toBeTruthy()
    expect(screen.getByRole('textbox', { name: 'MYPCards' })).toBeTruthy()
  })
})
