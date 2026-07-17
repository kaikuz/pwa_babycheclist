import { useMemo } from 'react'
import type { CalEvent, EventType } from '../lib/types'
import { eventColor, eventOccursOn } from '../lib/events'
import { formatMonthYear, pad2 } from '../lib/dates'

interface Props {
  year: number
  monthIndex: number // 0-11
  events: CalEvent[]
  types: EventType[]
  dark: boolean
  todayISO: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSelectDay: (iso: string) => void
}

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export function MonthGrid({
  year,
  monthIndex,
  events,
  types,
  dark,
  todayISO,
  onPrev,
  onNext,
  onToday,
  onSelectDay,
}: Props) {
  const typeById = useMemo(() => {
    const m = new Map<string, EventType>()
    for (const t of types) m.set(t.id, t)
    return m
  }, [types])

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  // offset con lunes como primer día (getDay: dom=0 … sáb=6)
  const firstOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7

  // por cada día del mes: tipologías presentes (en el orden del catálogo)
  const marksByDay = useMemo(() => {
    const map = new Map<number, EventType[]>()
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`
      const present = new Set<string>()
      for (const ev of events) if (eventOccursOn(ev, iso)) present.add(ev.type_id)
      const marks = types.filter((t) => present.has(t.id))
      if (marks.length) map.set(day, marks)
    }
    return map
  }, [events, types, year, monthIndex, daysInMonth])

  const cells: (number | null)[] = [
    ...Array<null>(firstOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const label = formatMonthYear(year, monthIndex)

  return (
    <div className="rounded-card border border-edge bg-card p-3 shadow-card">
      <header className="mb-2 flex items-center justify-between">
        <button
          onClick={onPrev}
          aria-label="Mes anterior"
          className="rounded-pill px-3 py-1 text-lg text-soft active:bg-page"
        >
          ‹
        </button>
        <div className="flex items-center gap-2">
          <h2 className="font-display text-lg font-semibold capitalize">{label}</h2>
          <button
            onClick={onToday}
            className="rounded-pill border border-edge px-2.5 py-1 text-xs font-semibold text-soft active:border-euca"
          >
            Hoy
          </button>
        </div>
        <button
          onClick={onNext}
          aria-label="Mes siguiente"
          className="rounded-pill px-3 py-1 text-lg text-soft active:bg-page"
        >
          ›
        </button>
      </header>

      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-soft">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="pb-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const iso = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`
          const marks = marksByDay.get(day) ?? []
          const isToday = iso === todayISO
          const hasParto = marks.some((m) => m.id === 'parto')
          const dots = marks.slice(0, 3)
          const extra = marks.length - dots.length

          return (
            <button
              key={i}
              onClick={() => onSelectDay(iso)}
              className={`flex aspect-square flex-col items-center rounded-[10px] pt-1 transition-colors active:bg-page ${
                isToday ? 'bg-euca-soft' : ''
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-pill text-[13px] ${
                  isToday ? 'font-bold text-euca' : ''
                } ${hasParto && !isToday ? 'font-bold' : ''}`}
                style={
                  hasParto
                    ? {
                        color: eventColor(typeById.get('parto'), dark),
                        boxShadow: `inset 0 0 0 1.5px ${eventColor(typeById.get('parto'), dark)}`,
                      }
                    : undefined
                }
              >
                {day}
              </span>
              <span className="mt-0.5 flex min-h-[8px] items-center gap-0.5">
                {dots.map((t) => (
                  <span
                    key={t.id}
                    className="h-1.5 w-1.5 rounded-pill"
                    style={{ backgroundColor: eventColor(t, dark) }}
                  />
                ))}
                {extra > 0 && (
                  <span className="text-[9px] font-semibold leading-none text-soft">
                    +{extra}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
