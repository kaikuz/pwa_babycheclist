import { useMemo, useState } from 'react'
import { useChecklist } from '../hooks/useChecklist'
import { ProgressRing } from '../components/ProgressRing'
import { SectionBlock } from '../components/SectionBlock'
import { AddItemForm } from '../components/AddItemForm'
import { ChecklistSkeleton } from '../components/Skeletons'
import type { Filter, Item } from '../lib/types'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'essential', label: 'Básicos' },
  { id: 'nice', label: 'Nice to have' },
  { id: 'pending', label: 'Pendientes' },
]

export function ChecklistPage() {
  const { data, loading, stale, toggle, addItem, deleteItem } = useChecklist()
  const [filter, setFilter] = useState<Filter>('all')

  const stats = useMemo(() => {
    if (!data) return null
    const isChecked = (i: Item) => data.checks[i.id] !== undefined
    const essential = data.items.filter((i) => i.essential)
    const nice = data.items.filter((i) => !i.essential)
    const bySection = new Map<string, { done: number; total: number }>()
    for (const s of data.sections) bySection.set(s.id, { done: 0, total: 0 })
    for (const i of data.items) {
      const st = bySection.get(i.section_id)
      if (!st) continue
      st.total++
      if (isChecked(i)) st.done++
    }
    return {
      done: data.items.filter(isChecked).length,
      total: data.items.length,
      essentialDone: essential.filter(isChecked).length,
      essentialTotal: essential.length,
      niceDone: nice.filter(isChecked).length,
      niceTotal: nice.length,
      bySection,
    }
  }, [data])

  if (loading) return <ChecklistSkeleton />

  if (!data || !stats) {
    return (
      <div className="px-6 pt-16 text-center">
        <p className="text-3xl">📡</p>
        <p className="mt-3 font-semibold">Sin conexión</p>
        <p className="mt-1 text-sm text-soft">
          No hay datos guardados todavía. Conéctate y recarga.
        </p>
      </div>
    )
  }

  const matchesFilter = (item: Item): boolean => {
    switch (filter) {
      case 'essential':
        return item.essential
      case 'nice':
        return !item.essential
      case 'pending':
        return data.checks[item.id] === undefined
      default:
        return true
    }
  }

  const scrollToSection = (id: string) => {
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      {stale && (
        <div className="rounded-card border border-honey bg-honey-soft px-4 py-2.5 text-center text-sm font-medium text-honey">
          Sin conexión — mostrando última versión
        </div>
      )}

      {/* Cabecera con progreso global */}
      <header className="rounded-card border border-edge bg-card p-4 shadow-card">
        <div className="flex items-center gap-4">
          <ProgressRing progress={stats.total > 0 ? stats.done / stats.total : 0} />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold">Camino a casa</h1>
            <p className="text-sm text-soft">
              {stats.done} de {stats.total} conseguidas
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-medium">
              <span className="text-euca">
                Básicos {stats.essentialDone}/{stats.essentialTotal}
              </span>
              <span className="text-honey">
                Nice to have {stats.niceDone}/{stats.niceTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Chips de sección → scroll */}
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {data.sections.map((s) => {
            const st = stats.bySection.get(s.id)
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className="shrink-0 rounded-pill border border-edge bg-page px-3 py-1.5 text-xs font-semibold active:border-euca"
              >
                {s.emoji} {s.name}
                <span className="ml-1.5 text-soft">
                  {st?.done ?? 0}/{st?.total ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      </header>

      {/* Filtros */}
      <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-pill px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              filter === f.id
                ? 'bg-ink text-page'
                : 'border border-edge bg-card text-soft'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Secciones */}
      {data.sections.map((section) => {
        const sectionItems = data.items.filter(
          (i) => i.section_id === section.id && matchesFilter(i)
        )
        if (sectionItems.length === 0) return null
        const st = stats.bySection.get(section.id)
        return (
          <SectionBlock
            key={section.id}
            section={section}
            items={sectionItems}
            checks={data.checks}
            done={st?.done ?? 0}
            total={st?.total ?? 0}
            onToggle={(i) => void toggle(i)}
            onDelete={(i) => void deleteItem(i)}
          />
        )
      })}

      <AddItemForm sections={data.sections} onAdd={addItem} />

      <div className="space-y-1 px-2 text-center text-[11px] text-soft">
        <p>
          Maleta del hospital lista para la semana 34-35. Si el bebé se
          adelantara, la ropa de talla prematuro se compra en el momento: no
          la compres por adelantado.
        </p>
        <p>
          Precios orientativos (España, jul. 2026); varían según tienda y
          ofertas.
        </p>
      </div>
    </div>
  )
}
