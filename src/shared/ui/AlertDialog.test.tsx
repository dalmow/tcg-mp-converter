// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogTitle } from './AlertDialog'

function setup() {
  render(
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogTitle>Excluir deck?</AlertDialogTitle>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction variant="danger">Excluir</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>,
  )
}

describe('AlertDialog buttons', () => {
  it('sets the confirm button to the 14px strong body size', () => {
    setup()
    const action = screen.getByRole('button', { name: 'Excluir' })
    expect(action.className).toContain('text-body-strong')
    expect(action.className).not.toContain('text-ui')
  })

  it('sets the cancel button to the 14px nav-link size', () => {
    setup()
    const cancel = screen.getByRole('button', { name: 'Cancelar' })
    expect(cancel.className).toContain('text-nav-link')
    expect(cancel.className).not.toContain('text-ui')
  })
})
