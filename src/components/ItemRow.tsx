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
  onUpdateProduct: (item: Item, index: number, product: Product) => Promise<boolean>
  onDeleteProduct: (item: Item, index: number) => Promise<boolean>
  /** abre el formulario del ítem (editar nombre/sección/categoría o eliminarlo) */
  onEdit: (item: Item) => void
}

const miniInputCls =
  // text-base (16px): por debajo, iOS hace zoom automático al enfocar el campo
  'w-full rounded-[10px] border border-edge bg-page px-2.5 py-1.5 text-base outline-none focus:border-euca'

/** Formulario compacto reutilizable para crear o editar una opción. */
function OptionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Product
  submitLabel: string
  onSubmit: (p: Product) => Promise<boolean>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.n ?? '')
  const [price, setPrice] = useState(initial && initial.p !== '—' ? initial.p : '')
  const [url, setUrl] = useState(initial?.u ?? '')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const n = name.trim()
    if (!n || busy) return
    setBusy(true)
    const ok = await onSubmit({ n, p: price.trim() || '—', u: url.trim() })
    setBusy(false)
    if (ok) onCancel()
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-1.5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del producto"
        className={miniInputCls}
        autoFocus
      />
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Precio (ej. 20-30 €)"
        className={miniInputCls}
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        type="url"
        inputMode="url"
        placeholder="Enlace (opcional)"
        className={miniInputCls}
      />
      <div className="flex gap-1.5">
        <button
          type="submit"
          disabled={!name.trim() || busy}
          className="rounded-pill bg-euca px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
        >
          {busy ? 'Guardando…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-pill px-3 py-1 text-xs font-semibold text-soft"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

export function ItemRow({
  item,
  check,
  onToggle,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onEdit,
}: Props) {
  const { email } = useAuth()
  const checked = check !== undefined
  const [picking, setPicking] = useState(false)
  const [addingOption, setAddingOption] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleCheck = () => {
    if (checked) return onToggle(item)
    // con productos recomendados, pregunta cuál se ha conseguido
    if (item.products.length > 0) return setPicking(true)
    onToggle(item, null)
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
          {/* Editar: nombre, sección y categoría, y eliminar desde el formulario */}
          <button
            onClick={() => onEdit(item)}
            aria-label={`Editar ${item.name}`}
            className="-mt-0.5 shrink-0 rounded-pill p-1.5 text-soft active:text-euca"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M13.5 3.5a1.77 1.77 0 0 1 2.5 2.5L7 15l-3.5 1L4.5 12.5z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
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
            {item.products.map((p, i) =>
              editingIndex === i ? (
                <li key={i}>
                  <OptionForm
                    initial={p}
                    submitLabel="Guardar"
                    onSubmit={async (prod) => onUpdateProduct(item, i, prod)}
                    onCancel={() => setEditingIndex(null)}
                  />
                </li>
              ) : (
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
                  <span className="ml-auto flex shrink-0 items-baseline gap-1.5">
                    <button
                      onClick={() => {
                        setAddingOption(false)
                        setEditingIndex(i)
                      }}
                      className="text-[11px] font-semibold text-soft underline decoration-edge underline-offset-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Borrar la opción «${p.n}»?`))
                          void onDeleteProduct(item, i)
                      }}
                      aria-label={`Borrar opción ${p.n}`}
                      className="rounded-pill px-1 text-base leading-none text-soft active:text-honey"
                    >
                      ×
                    </button>
                  </span>
                </li>
              )
            )}
          </ul>
        )}

        {/* Añadir una opción de producto a este ítem */}
        {addingOption ? (
          <OptionForm
            submitLabel="Añadir opción"
            onSubmit={(prod) => onAddProduct(item, prod)}
            onCancel={() => setAddingOption(false)}
          />
        ) : (
          editingIndex === null && (
            <button
              onClick={() => setAddingOption(true)}
              className="mt-1.5 text-[11px] font-semibold text-soft underline decoration-edge underline-offset-2"
            >
              + opción
            </button>
          )
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
