import { useMemo, useState } from 'react'
import type { CalEvent, EventType } from '../lib/types'
import { isPast } from '../lib/events'
import { monthKey, monthLabel } from '../lib/dates'
import { EventRow } from './EventRow'

interface Props {
  events: CalEvent[]
  types: Map<string, EventType>
  dark: boolean
  todayISO: string
  onSelectEvent: (event: CalEvent) => void
}

interface Group {
  key: string
  label: string
  events: CalEvent[]
}

export function EventList({ events, types, dark, todayISO, onSelectEvent }: Props) {
  const [showPast, setShowPast] = useState(false)

  const { groups, past } = useMemo(() => {
    const upcoming: CalEvent[] = []
    const pastEvents: CalEvent[] = []
    for (const ev of events) {
      ;(isPast(ev, todayISO) ? pastEvents : upcoming).push(ev)
    }
    // un evento en curso (empezó antes de hoy pero sigue vigente) se agrupa en el mes actual
    const sortDate = (ev: CalEvent) =>
      ev.start_date < todayISO ? todayISO : ev.start_date
    upcoming.sort(
      (a, b) =>
        sortDate(a).localeCompare(sortDate(b)) ||
        (a.time ?? '99').localeCompare(b.time ?? '99')
    )
    pastEvents.sort((a, b) => b.start_date.localeCompare(a.start_date))

    const grouped: Group[] = []
    for (const ev of upcoming) {
      const k = monthKey(sortDate(ev))
      let g = grouped.find((x) => x.key === k)
      if (!g) {
        g = { key: k, label: monthLabel(sortDate(ev)), events: [] }
        grouped.push(g)
      }
      g.events.push(ev)
    }
    return { groups: grouped, past: pastEvents }
  }, [events, todayISO])

  if (events.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-edge px-6 py-10 text-center">
        <p className="text-3xl">🗓️</p>
        <p className="mt-3 font-semibold">Aún no hay eventos</p>
        <p className="mt-1 text-sm text-soft">
          Añade la fecha del parto, citas médicas, medicación o trámites.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <section key={g.key}>
          <h2 className="px-1 pb-1.5 text-xs font-bold uppercase tracking-wide text-soft">
            {g.label}
          </h2>
          <ul className="divide-y divide-edge overflow-hidden rounded-card border border-edge bg-card shadow-card">
            {g.events.map((ev) => (
              <li key={ev.id}>
                <EventRow
                  event={ev}
                  type={types.get(ev.type_id)}
                  dark={dark}
                  onClick={() => onSelectEvent(ev)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {past.length > 0 && (
        <section>
          <button
            onClick={() => setShowPast((v) => !v)}
            className="flex w-full items-center justify-between px-1 pb-1.5 text-xs font-bold uppercase tracking-wide text-soft"
          >
            <span>Anteriores ({past.length})</span>
            <span>{showPast ? '▲' : '▼'}</span>
          </button>
          {showPast && (
            <ul className="divide-y divide-edge overflow-hidden rounded-card border border-edge bg-card opacity-70 shadow-card">
              {past.map((ev) => (
                <li key={ev.id}>
                  <EventRow
                    event={ev}
                    type={types.get(ev.type_id)}
                    dark={dark}
                    onClick={() => onSelectEvent(ev)}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
