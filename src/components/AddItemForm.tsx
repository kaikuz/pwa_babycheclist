import { useState, type FormEvent } from 'react'
import type { Product, Section } from '../lib/types'

interface Props {
  sections: Section[]
  onAdd: (
    name: string,
    sectionId: string,
    essential: boolean,
    product?: Product
  ) => Promise<boolean>
}

export function AddItemForm({ sections, onAdd }: Props) {
  const [name, setName] = useState('')
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '')
  const [essential, setEssential] = useState(true)
  const [withProduct, setWithProduct] = useState(false)
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodUrl, setProdUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !sectionId || busy) return
    const product: Product | undefined =
      withProduct && prodName.trim()
        ? { n: prodName.trim(), p: prodPrice.trim() || '—', u: prodUrl.trim() }
        : undefined
    setBusy(true)
    const ok = await onAdd(trimmed, sectionId, essential, product)
    setBusy(false)
    if (ok) {
      setName('')
      setProdName('')
      setProdPrice('')
      setProdUrl('')
      setWithProduct(false)
    }
  }

  const inputCls =
    // text-base (16px): por debajo, iOS hace zoom automático al enfocar el campo
    'rounded-[12px] border border-edge bg-page px-3 py-2.5 text-base outline-none focus:border-euca'

  return (
    <form
      onSubmit={submit}
      className="rounded-card border border-edge bg-card p-4 shadow-card"
    >
      <h2 className="font-display text-lg font-semibold">Añadir a la lista</h2>
      <div className="mt-3 flex flex-col gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="¿Qué falta? p. ej. Chupetes"
          className={inputCls}
        />
        <div className="flex gap-2">
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className={`${inputCls} min-w-0 flex-1`}
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setEssential((v) => !v)}
            className={`shrink-0 rounded-[12px] border px-3 text-sm font-semibold transition-colors ${
              essential
                ? 'border-euca bg-euca-soft text-euca'
                : 'border-honey bg-honey-soft text-honey'
            }`}
          >
            {essential ? 'Básico' : 'Nice'}
          </button>
        </div>

        {withProduct ? (
          <div className="space-y-2 rounded-[12px] border border-dashed border-edge p-2.5">
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
              className={`${inputCls} w-full`}
            />
            <input
              value={prodPrice}
              onChange={(e) => setProdPrice(e.target.value)}
              placeholder="Precio orientativo, p. ej. 8-12 €"
              className={`${inputCls} w-full`}
            />
            <input
              value={prodUrl}
              onChange={(e) => setProdUrl(e.target.value)}
              type="url"
              inputMode="url"
              placeholder="Enlace (opcional)"
              className={`${inputCls} w-full`}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setWithProduct(true)}
            className="self-start text-xs font-semibold text-soft underline decoration-edge underline-offset-2"
          >
            + producto recomendado (opcional)
          </button>
        )}

        <button
          type="submit"
          disabled={!name.trim() || busy}
          className="rounded-[12px] bg-euca py-2.5 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {busy ? 'Añadiendo…' : 'Añadir'}
        </button>
      </div>
    </form>
  )
}
