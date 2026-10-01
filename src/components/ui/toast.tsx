import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CircleAlertIcon, CircleCheckIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error'

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

// Without a provider (isolated component tests) toasts are silently dropped.
const NOOP_API: ToastApi = { success: () => {}, error: () => {} }

const ToastContext = createContext<ToastApi>(NOOP_API)

export function useToast(): ToastApi {
  return useContext(ToastContext)
}

let nextToastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const api = useMemo<ToastApi>(() => {
    const push = (variant: ToastVariant) => (message: string) =>
      setToasts((current) => [...current, { id: nextToastId++, variant, message }])
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

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  const isError = variant === 'error'
  const Icon = isError ? CircleAlertIcon : CircleCheckIcon

  return (
    <div
      // Errors interrupt (assertive); successes wait their turn (polite).
      role={isError ? 'alert' : 'status'}
      data-variant={variant}
      className={cn(
        'flex items-start gap-2 rounded-md border bg-card p-3 text-sm text-card-foreground shadow-md',
        isError ? 'border-danger' : 'border-success',
      )}
    >
      <Icon aria-hidden className={cn('mt-0.5 size-4 shrink-0', isError ? 'text-danger' : 'text-success')} />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        aria-label="Fechar notificação"
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => onDismiss(id)}
      >
        <XIcon aria-hidden className="size-4" />
      </button>
    </div>
  )
}
