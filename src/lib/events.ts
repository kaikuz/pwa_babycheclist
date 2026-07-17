import type { CalEvent, EventType } from './types'
import { formatShort, parseISO } from './dates'

// Color de cada tipología en modo oscuro (en claro se usa event_types.color).
// Para 'cita' y 'medicacion' son los mismos tokens eucalipto/miel del resto
// de la app; el resto llevan una versión aclarada para contrastar en oscuro.
const DARK_COLORS: Record<string, string> = {
  parto: '#E08A7E',
  cita: '#8FB59A',
  medicacion: '#D9A45B',
  tramite: '#8C9CD6',
  otro: '#A6A6A6',
}

export function eventColor(type: EventType | undefined, dark: boolean): string {
  if (!type) return dark ? '#A6A6A6' : '#8B8B8B'
  return dark ? (DARK_COLORS[type.id] ?? type.color) : type.color
}

/** ¿El evento cae en el día `iso`? Expande recurrencias sin crear filas. */
export function eventOccursOn(ev: CalEvent, iso: string): boolean {
  if (ev.recurrence === 'none') {
    if (ev.end_date) return iso >= ev.start_date && iso <= ev.end_date
    return iso === ev.start_date
  }
  const until = ev.recurrence_until ?? ev.start_date
  if (iso < ev.start_date || iso > until) return false
  if (ev.recurrence === 'daily') return true
  // weekly: mismo día de la semana que la fecha de inicio
  return parseISO(iso).getDay() === parseISO(ev.start_date).getDay()
}

/** Última fecha en la que el evento tiene efecto (para saber si ya pasó). */
export function effectiveEndISO(ev: CalEvent): string {
  if (ev.recurrence !== 'none') return ev.recurrence_until ?? ev.start_date
  return ev.end_date ?? ev.start_date
}

export function isPast(ev: CalEvent, todayISO: string): boolean {
  return effectiveEndISO(ev) < todayISO
}

/** "Diario hasta 4 oct" / "Semanal hasta 4 oct" / '' si no se repite. */
export function recurrenceCaption(ev: CalEvent): string {
  if (ev.recurrence === 'none') return ''
  const word = ev.recurrence === 'daily' ? 'Diario' : 'Semanal'
  return ev.recurrence_until ? `${word} hasta ${formatShort(ev.recurrence_until)}` : word
}
