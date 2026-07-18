import type { Item } from '../lib/types'

interface Props {
  item: Item
  /** product = nombre elegido; null = "otro / no está en la lista" */
  onPick: (product: string | null) => void
  onClose: () => void
}

/** Al marcar un ítem con productos recomendados: ¿cuál habéis conseguido? */
export function ProductPicker({ item, onPick, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative max-h-[75vh] overflow-y-auto rounded-t-[20px] border-t border-edge bg-page pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="sticky top-0 border-b border-edge bg-page px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              ¿Cuál habéis conseguido?
            </h2>
            <button
              onClick={onClose}
              aria-label="Cancelar"
              className="rounded-pill px-2 text-2xl leading-none text-soft"
            >
              ×
            </button>
          </div>
          <p className="mt-0.5 truncate text-xs text-soft">{item.name}</p>
        </div>

        <ul className="px-4 pt-3">
          {item.products.map((p, i) => (
            <li key={i} className="pb-2">
              <button
                onClick={() => onPick(p.n)}
                className="flex w-full items-baseline justify-between gap-3 rounded-card border border-edge bg-card px-4 py-3 text-left shadow-card active:border-euca"
              >
                <span className="min-w-0 flex-1 text-[15px] font-medium">{p.n}</span>
                <span className="shrink-0 text-sm text-soft">{p.p}</span>
              </button>
            </li>
          ))}
          <li className="pb-2">
            <button
              onClick={() => onPick(null)}
              className="w-full rounded-card border border-dashed border-edge px-4 py-3 text-left text-[15px] font-medium text-soft active:border-euca"
            >
              Otro / no está en la lista
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
