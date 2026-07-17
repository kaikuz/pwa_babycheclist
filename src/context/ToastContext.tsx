import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface Toast {
  id: number
  message: string
  kind: 'ok' | 'error'
}

const ToastContext = createContext<(message: string, kind?: Toast['kind']) => void>(
  () => {}
)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const show = useCallback((message: string, kind: Toast['kind'] = 'ok') => {
    const id = nextId.current++
    setToasts((t) => [...t, { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 pb-safe">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast max-w-sm rounded-pill px-4 py-2.5 text-sm font-medium shadow-card ${
              t.kind === 'error'
                ? 'bg-honey text-white'
                : 'bg-ink text-page'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
