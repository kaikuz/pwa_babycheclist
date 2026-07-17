import { useMemo, useState } from 'react'
import { useEvents } from '../hooks/useEvents'
import { usePrefersDark } from '../hooks/usePrefersDark'
import { MonthGrid } from '../components/MonthGrid'
import { EventList } from '../components/EventList'
import { DaySheet } from '../components/DaySheet'
import { EventForm } from '../components/EventForm'
import { CalendarSkeleton } from '../components/Skeletons'
import { eventColor } from '../lib/events'
import { todayISO } from '../lib/dates'
import type { CalEvent, EventType } from '../lib/types'

type View = 'lista' | 'calendario'
const VIEW_KEY = 'canastilla:calview'

function initialView(): View {
  return localStorage.getItem(VIEW_KEY) === 'calendario' ? 'calendario' : 'lista'
}

interface FormState {
  event?: CalEvent
  defaultDate?: string
}

export function CalendarPage() {
  const { data, loading, stale, saveEvent, deleteEvent } = useEvents()
  const dark = usePrefersDark()
  const today = todayISO()

  const [view, setView] = useState<View>(initialView)
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), monthIndex: d.getMonth() }
  })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [form, setForm] = useState<FormState | null>(null)

  const typesMap = useMemo(() => {
    const m = new Map<string, EventType>()
    for (const t of data?.types ?? []) m.set(t.id, t)
    return m
  }, [data?.types])

  const changeView = (v: View) => {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  const prevMonth = () =>
    setMonth((m) =>
      m.monthIndex === 0
        ? { year: m.year - 1, monthIndex: 11 }
        : { ...m, monthIndex: m.monthIndex - 1 }
    )
  const nextMonth = () =>
    setMonth((m) =>
      m.monthIndex === 11
        ? { year: m.year + 1, monthIndex: 0 }
        : { ...m, monthIndex: m.monthIndex + 1 }
    )
  const goToday = () => {
    const d = new Date()
    setMonth({ year: d.getFullYear(), monthIndex: d.getMonth() })
  }

  if (loading) return <CalendarSkeleton />

  if (!data) {
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

  const segBtn = (v: View, label: string) => (
    <button
      onClick={() => changeView(v)}
      className={`flex-1 rounded-[10px] py-1.5 text-[13px] font-semibold transition-colors ${
        view === v ? 'bg-card text-ink shadow-card' : 'text-soft'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      {stale && (
        <div className="rounded-card border border-honey bg-honey-soft px-4 py-2.5 text-center text-sm font-medium text-honey">
          Sin conexión — mostrando última versión
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold">Calendario</h1>
        <button
          onClick={() => setForm({ defaultDate: today })}
          className="rounded-pill bg-euca px-3.5 py-1.5 text-[13px] font-semibold text-white"
        >
          + Nuevo
        </button>
      </div>

      {/* segmented control Lista / Calendario */}
      <div className="flex gap-1 rounded-[12px] border border-edge bg-page p-1">
        {segBtn('lista', 'Lista')}
        {segBtn('calendario', 'Calendario')}
      </div>

      {view === 'calendario' ? (
        <>
          <MonthGrid
            year={month.year}
            monthIndex={month.monthIndex}
            events={data.events}
            types={data.types}
            dark={dark}
            todayISO={today}
            onPrev={prevMonth}
            onNext={nextMonth}
            onToday={goToday}
            onSelectDay={setSelectedDay}
          />
          {/* leyenda de tipologías */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 text-[11px] text-soft">
            {data.types.map((t) => (
              <span key={t.id} className="flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-pill"
                  style={{ backgroundColor: eventColor(t, dark) }}
                />
                {t.name}
              </span>
            ))}
          </div>
        </>
      ) : (
        <EventList
          events={data.events}
          types={typesMap}
          dark={dark}
          todayISO={today}
          onSelectEvent={(ev) => setForm({ event: ev })}
        />
      )}

      {selectedDay && (
        <DaySheet
          iso={selectedDay}
          events={data.events}
          types={typesMap}
          dark={dark}
          onClose={() => setSelectedDay(null)}
          onAdd={(iso) => setForm({ defaultDate: iso })}
          onSelectEvent={(ev) => setForm({ event: ev })}
        />
      )}

      {form && (
        <EventForm
          types={data.types}
          dark={dark}
          event={form.event}
          defaultDate={form.defaultDate}
          onSave={saveEvent}
          onDelete={deleteEvent}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  )
}
