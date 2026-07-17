import { ItemRow } from './ItemRow'
import type { Item, ItemCheck, Section } from '../lib/types'

interface Props {
  section: Section
  items: Item[]
  checks: Record<string, ItemCheck>
  /** progreso sobre TODOS los ítems de la sección (no solo los filtrados) */
  done: number
  total: number
  onToggle: (item: Item) => void
  onDelete: (item: Item) => void
}

export function SectionBlock({
  section,
  items,
  checks,
  done,
  total,
  onToggle,
  onDelete,
}: Props) {
  return (
    <section
      id={`section-${section.id}`}
      className="scroll-mt-4 overflow-hidden rounded-card border border-edge bg-card shadow-card"
    >
      <header className="px-4 pb-2 pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">
            {section.emoji} {section.name}
          </h2>
          <span className="text-xs font-semibold text-soft">
            {done}/{total}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-edge">
          <div
            className="h-full rounded-pill bg-euca transition-[width] duration-500"
            style={{ width: total > 0 ? `${(done / total) * 100}%` : 0 }}
          />
        </div>
        {section.id === 'mama' && (
          <p className="mt-2 text-xs leading-snug text-soft">
            La pauta de cuándo y cómo tomar la tensión la marca tu matrona u
            obstetra. Ante una cifra ≥ 140/90, dolor de cabeza intenso,
            alteraciones de la visión o dolor en la parte alta del abdomen,
            contacta de inmediato con urgencias de obstetricia o llama al 112.
          </p>
        )}
      </header>
      <ul className="divide-y divide-edge">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            check={checks[item.id]}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  )
}
