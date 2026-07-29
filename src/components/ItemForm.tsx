import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import type { Item, Product, Section } from '../lib/types'

export interface ItemInput {
  name: string
  section_id: string
  essential: boolean
  /** solo al crear: primera opción de producto (opcional) */
  product?: Product
}

interface Props {
  sections: Section[]
  /** ítem a editar; si falta, es alta */
  item?: Item
  onSave: (input: ItemInput, existing?: Item) => Promise<boolean>
  onDelete: (item: Item) => Promise<boolean>
  onClose: () => void
}

const inputCls =
  // text-base (16px): por debajo, iOS hace zoom automático al enfocar el campo
  'w-full rounded-[12px] border border-edge bg-page px-3 py-2.5 text-base outline-none focus:border-euca'

export function ItemForm({ sections, item, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(item?.name ?? '')
  const [sectionId, setSectionId] = useState(
    item?.section_id ?? sections[0]?.id ?? ''
  )
  const [essential, setEssential] = useState(item?.essential ?? true)
  const [withProduct, setWithProduct] = useState(false)
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodUrl, setProdUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Bloquea el scroll de fondo mientras el formulario está abierto.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    const trimmed = name.trim()
    if (!trimmed) return setError('Ponle un nombre al ítem.')
    if (!sectionId) return setError('Elige una sección.')

    setError(null)
    setBusy(true)
    const product: Product | undefined =
      !item && withProduct && prodName.trim()
        ? { n: prodName.trim(), p: prodPrice.trim() || '—', u: prodUrl.trim() }
        : undefined
    const ok = await onSave(
      { name: trimmed, section_id: sectionId, essential, product },
      item
    )
    setBusy(false)
    if (ok) onClose()
  }

  const confirmDelete = async () => {
    if (!item) return
    if (!confirm(`¿Eliminar «${item.name}»?`)) return
    setBusy(true)
    const ok = await onDelete(item)
    setBusy(false)
    if (ok) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-page pt-safe">
      <header className="flex items-center justify-between border-b border-edge px-4 py-3">
        <button
          onClick={onClose}
          className="text-[15px] font-semibold text-soft"
          type="button"
        >
          Cancelar
        </button>
        <h2 className="font-display text-lg font-semibold">
          {item ? 'Editar ítem' : 'Nuevo ítem'}
        </h2>
        <button
          onClick={submit}
          disabled={busy}
          className="text-[15px] font-semibold text-euca disabled:opacity-40"
          type="button"
        >
          Guardar
        </button>
      </header>

      <form
        onSubmit={submit}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-[calc(24px+env(safe-area-inset-bottom))]"
      >
        <label className="block">
          <span className="text-sm font-semibold">Nombre</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="p. ej. Chupetes"
            className={`mt-1 ${inputCls}`}
            autoFocus={!item}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Sección</span>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className={`mt-1 ${inputCls}`}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-sm font-semibold">Categoría</span>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={() => setEssential(true)}
              className={`flex-1 rounded-[12px] border py-2 text-[13px] font-semibold transition-colors ${
                essential
                  ? 'border-euca bg-euca-soft text-euca'
                  : 'border-edge text-soft'
              }`}
            >
              Básico
            </button>
            <button
              type="button"
              onClick={() => setEssential(false)}
              className={`flex-1 rounded-[12px] border py-2 text-[13px] font-semibold transition-colors ${
                !essential
                  ? 'border-honey bg-honey-soft text-honey'
                  : 'border-edge text-soft'
              }`}
            >
              Nice to have
            </button>
          </div>
        </div>

        {/* La primera opción solo al crear: en un ítem existente las opciones
            se gestionan desde su propia fila en la lista. */}
        {!item &&
          (withProduct ? (
            <div className="space-y-2 rounded-[12px] border border-dashed border-edge p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-soft">
                  Producto recomendado
                </span>
                <button
                  type="button"
                  onClick={() => setWithProduct(false)}
                  className="text-xs font-semibold text-soft"
                >
                  Quitar
                </button>
              </div>
              <input
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="Nombre, p. ej. Suavinex pack 2"
                className={inputCls}
              />
              <input
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                placeholder="Precio orientativo, p. ej. 8-12 €"
                className={inputCls}
              />
              <input
                value={prodUrl}
                onChange={(e) => setProdUrl(e.target.value)}
                type="url"
                inputMode="url"
                placeholder="Enlace (opcional)"
                className={inputCls}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setWithProduct(true)}
              className="text-xs font-semibold text-soft underline decoration-edge underline-offset-2"
            >
              + producto recomendado (opcional)
            </button>
          ))}

        {error && <p className="text-sm text-honey">{error}</p>}

        {item && (
          <button
            type="button"
            onClick={confirmDelete}
            disabled={busy}
            className="w-full rounded-[12px] border border-honey py-3 text-[15px] font-semibold text-honey transition-opacity disabled:opacity-40"
          >
            Eliminar ítem
          </button>
        )}
      </form>
    </div>,
    document.body
  )
}
