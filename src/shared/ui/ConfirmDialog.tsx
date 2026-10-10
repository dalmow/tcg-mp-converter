import type { ReactElement } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog'

type ConfirmDialogProps = {
  /** Omit both to let the trigger own the state. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Button that opens the dialog. Its children (an icon, for example) are kept. */
  trigger?: ReactElement
  title: string
  /** Neutral line before the warning. */
  info?: string
  /** Consequence the user accepts by confirming. */
  warning: string
  cancelLabel?: string
  confirmLabel: string
  /** Only confirms. Closing the dialog is up to the caller. */
  onConfirm: () => void
}

/** Destructive confirmation: title, optional info line, danger warning, ghost cancel and danger confirm. */
export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  info,
  warning,
  cancelLabel = 'Cancelar',
  confirmLabel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription render={<div />} className="flex flex-col gap-space-2">
            {info && <p className="text-secondary">{info}</p>}
            <p className="font-semibold text-danger-soft">{warning}</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
