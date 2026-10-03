// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from './dialog'

afterEach(cleanup)

describe('Dialog', () => {
  it('names the corner close button in Portuguese', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Título</DialogTitle>
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByRole('button', { name: 'Fechar' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
  })

  it('names the footer close button in Portuguese', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>Título</DialogTitle>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>,
    )

    expect(screen.getByRole('button', { name: 'Fechar' })).toBeTruthy()
  })
})
