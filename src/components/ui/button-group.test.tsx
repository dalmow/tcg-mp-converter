// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Button } from './button'
import { ButtonGroup } from './button-group'

afterEach(cleanup)

describe('ButtonGroup', () => {
  it('groups its buttons under one labelled role', () => {
    render(
      <ButtonGroup aria-label="Ações do deck">
        <Button aria-label="Salvar deck" />
        <Button variant="danger" aria-label="Excluir deck" />
      </ButtonGroup>,
    )

    const group = screen.getByRole('group', { name: 'Ações do deck' })
    expect(group.querySelectorAll('button')).toHaveLength(2)
  })

  it('has one outer radius, clips its children and has no border of its own', () => {
    render(
      <ButtonGroup aria-label="Ações">
        <Button aria-label="a" />
        <Button aria-label="b" />
      </ButtonGroup>,
    )

    const classes = screen.getByRole('group').className
    expect(classes).toContain('rounded-md')
    expect(classes).toContain('overflow-hidden')
    expect(classes).not.toMatch(/(^|\s)border(\s|$)/)
  })

  it('separates buttons with a 1px divider-accent seam instead of per-button borders', () => {
    render(
      <ButtonGroup aria-label="Ações">
        <Button aria-label="a" />
        <Button aria-label="b" />
      </ButtonGroup>,
    )

    const classes = screen.getByRole('group').className
    expect(classes).toContain('gap-px')
    expect(classes).toContain('bg-divider-accent')
    expect(classes).toContain('[&>*]:rounded-none')
    expect(classes).toContain('[&>*]:border-0')
  })

  it('renders a single button with no seam to draw', () => {
    render(
      <ButtonGroup aria-label="Ações">
        <Button variant="danger" aria-label="Excluir" />
      </ButtonGroup>,
    )

    expect(screen.getByRole('group').querySelectorAll('button')).toHaveLength(1)
  })

  it('exposes the group slot so sized buttons drop their own radius', () => {
    render(
      <ButtonGroup aria-label="Ações">
        <Button aria-label="a" />
      </ButtonGroup>,
    )

    expect(screen.getByRole('group').getAttribute('data-slot')).toBe('button-group')
  })
})
