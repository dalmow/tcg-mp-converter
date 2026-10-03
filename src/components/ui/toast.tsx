import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CircleAlertIcon, CircleCheckIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error'

export const TOAST_DURATION_MS = 5000

interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) throw new Error('useToast must be used inside <ToastProvider>')
  return api
}

// Errors interrupt (assertive); successes wait their turn (polite).
const VARIANT_STYLE: Record<ToastVariant, { role: 'alert' | 'status'; border: string; text: string; Icon: typeof CircleAlertIcon }> = {
  success: { role: 'status', border: 'border-success', text: 'text-success', Icon: CircleCheckIcon },
  error: { role: 'alert', border: 'border-danger-text', text: 'text-danger-text', Icon: CircleAlertIcon },
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
        className="fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
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
        'flex items-start gap-2 rounded-md border bg-card p-3 text-sm text-card-foreground shadow-md',
        border,
      )}
    >
      <Icon aria-hidden className={cn('mt-0.5 size-4 shrink-0', text)} />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        aria-label="Fechar notificação"
        className="-m-1 flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
        onClick={() => onDismiss(id)}
      >
        <XIcon aria-hidden className="size-4" />
      </button>
    </div>
  )
}
