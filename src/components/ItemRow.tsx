import { useState, type FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { displayName, shortDate } from '../lib/format'
import type { Item, ItemCheck, Product } from '../lib/types'
import { ProductPicker } from './ProductPicker'

interface Props {
  item: Item
  check: ItemCheck | undefined
  onToggle: (item: Item, product?: string | null) => void
  onAddProduct: (item: Item, product: Product) => Promise<boolean>
  onDelete: (item: Item) => void
}

const miniInputCls =
  // text-base (16px): por debajo, iOS hace zoom automático al enfocar el campo
  'w-full rounded-[10px] border border-edge bg-page px-2.5 py-1.5 text-base outline-none focus:border-euca'

export function ItemRow({ item, check, onToggle, onAddProduct, onDelete }: Props) {
  const { email } = useAuth()
  const checked = check !== undefined
  const [picking, setPicking] = useState(false)
  const [addingOption, setAddingOption] = useState(false)
  const [optName, setOptName] = useState('')
  const [optPrice, setOptPrice] = useState('')
  const [optUrl, setOptUrl] = useState('')
  const [optBusy, setOptBusy] = useState(false)

  const handleCheck = () => {
    if (checked) return onToggle(item)
    // con productos recomendados, pregunta cuál se ha conseguido
    if (item.products.length > 0) return setPicking(true)
    onToggle(item, null)
  }

  const submitOption = async (e: FormEvent) => {
    e.preventDefault()
    const n = optName.trim()
    if (!n || optBusy) return
    setOptBusy(true)
    const ok = await onAddProduct(item, {
      n,
      p: optPrice.trim() || '—',
      u: optUrl.trim(),
    })
    setOptBusy(false)
    if (ok) {
      setOptName('')
      setOptPrice('')
      setOptUrl('')
      setAddingOption(false)
    }
  }

  return (
    <li className="flex gap-3 px-4 py-3">
      {/* Checkbox grande, cómodo para el pulgar */}
      <button
        role="checkbox"
        aria-checked={checked}
        aria-label={item.name}
        onClick={handleCheck}
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border-2 transition-colors ${
          checked
            ? 'border-euca bg-euca text-white'
            : 'border-edge bg-card active:border-euca'
        }`}
      >
        {checked && (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8.5 6.5 12 13 4.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[15px] leading-snug ${
              checked ? 'text-soft line-through decoration-edge' : ''
            }`}
          >
            {item.name}
          </p>
          {item.is_custom && (
            <button
              onClick={() => {
                if (confirm(`¿Eliminar «${item.name}»?`)) onDelete(item)
              }}
              aria-label={`Eliminar ${item.name}`}
              className="shrink-0 rounded-pill px-1.5 text-lg leading-none text-soft active:text-honey"
            >
              ×
            </button>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-pill px-2 py-0.5 text-[11px] font-semibold ${
              item.essential
                ? 'bg-euca-soft text-euca'
                : 'bg-honey-soft text-honey'
            }`}
          >
            {item.essential ? 'Básico' : 'Nice to have'}
          </span>
          {item.is_custom && (
            <span className="rounded-pill border border-edge px-2 py-0.5 text-[11px] font-semibold text-soft">
              Mío
            </span>
          )}
          {check && (
            <span className="text-[11px] text-soft">
              ✓ {displayName(check.checked_by, email)} · {shortDate(check.checked_at)}
              {check.product && (
                <span className="font-semibold"> · {check.product}</span>
              )}
            </span>
          )}
        </div>

        {item.products.length > 0 && (
          <ul className="mt-2 space-y-1">
            {item.products.map((p, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[13px]">
                <span
                  className={`min-w-0 truncate text-soft ${
                    check?.product === p.n ? 'font-semibold text-euca' : ''
                  }`}
                >
                  {p.n}
                </span>
                <span className="shrink-0 whitespace-nowrap text-soft">{p.p}</span>
                {p.u && (
                  <a
                    href={p.u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-semibold text-euca"
                  >
                    Ver →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Añadir una opción de producto a este ítem */}
        {addingOption ? (
          <form onSubmit={submitOption} className="mt-2 space-y-1.5">
            <input
              value={optName}
              onChange={(e) => setOptName(e.target.value)}
              placeholder="Nombre del producto"
              className={miniInputCls}
              autoFocus
            />
            <div className="flex gap-1.5">
              <input
                value={optPrice}
                onChange={(e) => setOptPrice(e.target.value)}
                placeholder="Precio (ej. 20-30 €)"
                className={`${miniInputCls} min-w-0 flex-1`}
              />
            </div>
            <input
              value={optUrl}
              onChange={(e) => setOptUrl(e.target.value)}
              type="url"
              inputMode="url"
              placeholder="Enlace (opcional)"
              className={miniInputCls}
            />
            <div className="flex gap-1.5">
              <button
                type="submit"
                disabled={!optName.trim() || optBusy}
                className="rounded-pill bg-euca px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
              >
                {optBusy ? 'Añadiendo…' : 'Añadir opción'}
              </button>
              <button
                type="button"
                onClick={() => setAddingOption(false)}
                className="rounded-pill px-3 py-1 text-xs font-semibold text-soft"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAddingOption(true)}
            className="mt-1.5 text-[11px] font-semibold text-soft underline decoration-edge underline-offset-2"
          >
            + opción
          </button>
        )}
      </div>

      {picking && (
        <ProductPicker
          item={item}
          onPick={(product) => {
            setPicking(false)
            onToggle(item, product)
          }}
          onClose={() => setPicking(false)}
        />
      )}
    </li>
  )
}
