import { useState, type FormEvent } from 'react'
import type { CalEvent, EventType, Recurrence } from '../lib/types'
import { RECURRENCES, RECURRENCE_LABELS } from '../lib/types'
import { eventColor, eventImageFile } from '../lib/events'
import type { EventInput } from '../hooks/useEvents'

interface Props {
  types: EventType[]
  dark: boolean
  /** evento a editar; si falta, es alta */
  event?: CalEvent
  /** fecha preseleccionada al crear desde un día del calendario */
  defaultDate?: string
  onSave: (input: EventInput, existing?: CalEvent) => Promise<boolean>
  onDelete: (event: CalEvent) => Promise<boolean>
  onClose: () => void
}

const inputCls =
  // text-base (16px): por debajo, iOS hace zoom automático al enfocar el campo
  'w-full rounded-[12px] border border-edge bg-page px-3 py-2.5 text-base outline-none focus:border-euca'

export function EventForm({
  types,
  dark,
  event,
  defaultDate,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [typeId, setTypeId] = useState(event?.type_id ?? types[0]?.id ?? 'otro')
  const [startDate, setStartDate] = useState(
    event?.start_date ?? defaultDate ?? ''
  )
  const [endDate, setEndDate] = useState(event?.end_date ?? '')
  const [allDay, setAllDay] = useState(event?.all_day ?? true)
  const [time, setTime] = useState(event?.time ?? '')
  const [recurrence, setRecurrence] = useState<Recurrence>(
    event?.recurrence ?? 'none'
  )
  const [recurrenceUntil, setRecurrenceUntil] = useState(
    event?.recurrence_until ?? ''
  )
  const [notes, setNotes] = useState(event?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    if (!title.trim()) return setError('Ponle un título al evento.')
    if (!startDate) return setError('Elige la fecha de inicio.')
    if (endDate && endDate < startDate)
      return setError('La fecha de fin no puede ser anterior al inicio.')
    if (recurrence !== 'none' && !recurrenceUntil)
      return setError('Indica hasta qué fecha se repite.')

    setError(null)
    setBusy(true)
    const input: EventInput = {
      type_id: typeId,
      title: title.trim(),
      notes: notes.trim() || null,
      start_date: startDate,
      end_date: recurrence === 'none' && endDate ? endDate : null,
      all_day: allDay,
      time: !allDay && time ? time : null,
      recurrence,
      recurrence_until: recurrence !== 'none' ? recurrenceUntil : null,
    }
    const ok = await onSave(input, event)
    setBusy(false)
    if (ok) onClose()
  }

  const confirmDelete = async () => {
    if (!event) return
    if (!confirm(`¿Eliminar «${event.title}»?`)) return
    setBusy(true)
    const ok = await onDelete(event)
    setBusy(false)
    if (ok) onClose()
  }

  return (
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
          {event ? 'Editar evento' : 'Nuevo evento'}
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
          <span className="text-sm font-semibold">Título</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="p. ej. Revisión con la matrona"
            className={`mt-1 ${inputCls}`}
            autoFocus={!event}
          />
        </label>

        <div>
          <span className="text-sm font-semibold">Tipo</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {types.map((t) => {
              const selected = t.id === typeId
              const color = eventColor(t, dark)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTypeId(t.id)}
                  className="rounded-pill border px-3 py-1.5 text-[13px] font-semibold transition-colors"
                  style={
                    selected
                      ? { backgroundColor: `${color}22`, color, borderColor: color }
                      : { borderColor: 'var(--c-edge)' }
                  }
                >
                  {t.icon} {t.name}
                </button>
              )
            })}
          </div>
          {/* Ilustración del tipo seleccionado (solo en el detalle del evento) */}
          <div className="mt-3 flex justify-center">
            <img
              src={`/${eventImageFile(typeId)}`}
              alt={types.find((t) => t.id === typeId)?.name ?? ''}
              className="h-40 w-40 rounded-[18px] border border-edge object-cover shadow-card"
            />
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-semibold">Fecha de inicio</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
        </label>

        {recurrence === 'none' && (
          <label className="block">
            <span className="text-sm font-semibold">
              Fecha de fin{' '}
              <span className="font-normal text-soft">(opcional, varios días)</span>
            </span>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className={`mt-1 ${inputCls}`}
            />
          </label>
        )}

        <div className="flex items-center justify-between rounded-[12px] border border-edge bg-card px-3 py-2.5">
          <span className="text-sm font-semibold">Todo el día</span>
          <button
            type="button"
            role="switch"
            aria-checked={allDay}
            onClick={() => setAllDay((v) => !v)}
            className={`relative h-6 w-11 rounded-pill transition-colors ${
              allDay ? 'bg-euca' : 'bg-edge'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-pill bg-white transition-all ${
                allDay ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {!allDay && (
          <label className="block">
            <span className="text-sm font-semibold">Hora</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`mt-1 ${inputCls}`}
            />
          </label>
        )}

        <div>
          <span className="text-sm font-semibold">Se repite</span>
          <div className="mt-1 flex gap-2">
            {RECURRENCES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRecurrence(r)}
                className={`flex-1 rounded-[12px] border py-2 text-[13px] font-semibold transition-colors ${
                  recurrence === r
                    ? 'border-euca bg-euca-soft text-euca'
                    : 'border-edge text-soft'
                }`}
              >
                {RECURRENCE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {recurrence !== 'none' && (
          <label className="block">
            <span className="text-sm font-semibold">Hasta</span>
            <input
              type="date"
              value={recurrenceUntil}
              min={startDate || undefined}
              onChange={(e) => setRecurrenceUntil(e.target.value)}
              className={`mt-1 ${inputCls}`}
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-semibold">
            Notas <span className="font-normal text-soft">(opcional)</span>
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`mt-1 resize-none ${inputCls}`}
          />
        </label>

        {error && <p className="text-sm text-honey">{error}</p>}

        {event && (
          <button
            type="button"
            onClick={confirmDelete}
            disabled={busy}
            className="w-full rounded-[12px] border border-honey py-3 text-[15px] font-semibold text-honey transition-opacity disabled:opacity-40"
          >
            Eliminar evento
          </button>
        )}
      </form>
    </div>
  )
}
