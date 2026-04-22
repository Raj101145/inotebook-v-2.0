import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

function Toast({ toast, onClose }) {
  const toneStyles = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    info: 'border-slate-200 bg-white text-slate-900',
  }

  return (
    <div
      className={[
        'pointer-events-auto w-full max-w-sm rounded-xl border p-3 shadow-sm',
        'transition-all duration-200 ease-out',
        toneStyles[toast.tone] || toneStyles.info,
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {toast.title ? <div className="text-sm font-semibold">{toast.title}</div> : null}
          <div className="mt-0.5 text-sm opacity-90">{toast.message}</div>
        </div>
        <button
          type="button"
          onClick={() => onClose(toast.id)}
          className="rounded-md px-2 py-1 text-xs font-medium hover:bg-black/5"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    ({ title, message, tone = 'info', durationMs = 3500 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const toast = { id, title, message, tone }
      setToasts((prev) => [toast, ...prev].slice(0, 3))
      window.setTimeout(() => remove(id), durationMs)
    },
    [remove],
  )

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] flex-col gap-2 sm:w-auto">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

