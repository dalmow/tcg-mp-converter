import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CircleAlertIcon, CircleCheckIcon, XIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { ToastContext, type ToastApi } from '@/shared/hooks/useToast'

type ToastVariant = 'success' | 'error'

export const TOAST_DURATION_MS = 5000

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

// Errors interrupt (assertive); successes wait their turn (polite).
const VARIANT_STYLE: Record<
  ToastVariant,
  { role: 'alert' | 'status'; border: string; text: string; Icon: typeof CircleAlertIcon }
> = {
  success: { role: 'status', border: 'border-secondary', text: 'text-secondary', Icon: CircleCheckIcon },
  error: { role: 'alert', border: 'border-danger', text: 'text-danger', Icon: CircleAlertIcon },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const api = useMemo<ToastApi>(() => {
    const push = (variant: ToastVariant) => (message: string) =>
      setToasts((current) => [...current, { id: nextId.current++, variant, message }])
    return { success: push('success'), error: push('error') }
  }, [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        role="region"
        aria-label="Notificações"
        className="fixed right-space-7 bottom-space-7 z-50 flex max-w-[calc(100vw-2.5rem)] flex-col items-end gap-space-3"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  const { id, variant, message } = toast

  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = hovered || focused
  // Errors stay until dismissed (WCAG 2.2.1); successes auto-dismiss, paused on hover/focus.
  const autoDismiss = variant === 'success' && !paused

  useEffect(() => {
    if (!autoDismiss) return
    const timer = setTimeout(() => onDismiss(id), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [autoDismiss, id, onDismiss])

  const { role, border, text, Icon } = VARIANT_STYLE[variant]

  return (
    <div
      role={role}
      data-variant={variant}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={cn(
        'flex items-center gap-space-4 rounded-md status-border bg-surface-200 px-space-6 py-space-5 text-ui text-ink shadow-toast',
        border,
      )}
    >
      <Icon aria-hidden className={cn('size-4 shrink-0', text)} />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        aria-label="Fechar notificação"
        className="-m-0.5 flex size-6 shrink-0 items-center justify-center rounded-xs text-ink-faint hover:text-ink"
        onClick={() => onDismiss(id)}
      >
        <XIcon aria-hidden className="size-[13px]" />
      </button>
    </div>
  )
}
