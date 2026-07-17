import { useMemo } from 'react'
import type { CalEvent, EventType } from '../lib/types'
import { eventOccursOn } from '../lib/events'
import { formatLong } from '../lib/dates'
import { EventRow } from './EventRow'

interface Props {
  iso: string
  events: CalEvent[]
  types: Map<string, EventType>
  dark: boolean
  onClose: () => void
  onAdd: (iso: string) => void
  onSelectEvent: (event: CalEvent) => void
}

export function DaySheet({
  iso,
  events,
  types,
  dark,
  onClose,
  onAdd,
  onSelectEvent,
}: Props) {
  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => eventOccursOn(e, iso))
        .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99')),
    [events, iso]
  )

  const long = formatLong(iso)
  const title = long.charAt(0).toUpperCase() + long.slice(1)

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative max-h-[75vh] overflow-y-auto rounded-t-[20px] border-t border-edge bg-page pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="sticky top-0 flex items-center justify-between border-b border-edge bg-page px-4 py-3">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-pill px-2 text-2xl leading-none text-soft"
          >
            ×
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-soft">
            No hay eventos este día.
          </p>
        ) : (
          <ul className="divide-y divide-edge px-1">
            {dayEvents.map((ev) => (
              <li key={ev.id}>
                <EventRow
                  event={ev}
                  type={types.get(ev.type_id)}
                  dark={dark}
                  showDate={false}
                  onClick={() => onSelectEvent(ev)}
                />
              </li>
            ))}
          </ul>
        )}

        <div className="px-4 pt-3">
          <button
            onClick={() => onAdd(iso)}
            className="w-full rounded-[12px] bg-euca py-3 text-[15px] font-semibold text-white"
          >
            + Añadir evento este día
          </button>
        </div>
      </div>
    </div>
  )
}
