import { useState, type FormEvent } from 'react'
import type { Section } from '../lib/types'

interface Props {
  sections: Section[]
  onAdd: (name: string, sectionId: string, essential: boolean) => Promise<boolean>
}

export function AddItemForm({ sections, onAdd }: Props) {
  const [name, setName] = useState('')
  const [sectionId, setSectionId] = useState(sections[0]?.id ?? '')
  const [essential, setEssential] = useState(true)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !sectionId || busy) return
    setBusy(true)
    const ok = await onAdd(trimmed, sectionId, essential)
    setBusy(false)
    if (ok) setName('')
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
