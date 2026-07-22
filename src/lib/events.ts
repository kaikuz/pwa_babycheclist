import type { CalEvent, EventType } from './types'
// .js en el import: este módulo lo reutiliza la función serverless de
// recordatorios (ESM en Vercel), que exige la extensión en tiempo de ejecución.
import { formatShort, parseISO } from './dates.js'

// Color de cada tipología en modo oscuro (en claro se usa event_types.color).
// Para 'cita' y 'medicacion' son los mismos tokens eucalipto/miel del resto
// de la app; el resto llevan una versión aclarada para contrastar en oscuro.
const DARK_COLORS: Record<string, string> = {
  parto: '#E08A7E',
  cita: '#8FB59A',
  medicacion: '#D9A45B',
  inicio_medicacion: '#B9A6DB',
  tramite: '#8C9CD6',
  otro: '#A6A6A6',
}

export function eventColor(type: EventType | undefined, dark: boolean): string {
  if (!type) return dark ? '#A6A6A6' : '#8B8B8B'
  return dark ? (DARK_COLORS[type.id] ?? type.color) : type.color
}

// Ilustración (en /public) asociada a cada tipo. Se usa en el detalle del
// evento (app) y en la cabecera del correo. Las claves son los id de
// event_types; nombres de archivo tal cual los subió el usuario.
const TYPE_IMAGE: Record<string, string> = {
  parto: 'parto.jpg',
  cita: 'citas_medicas.jpg',
  medicacion: 'analisis-vacunas.PNG',
  inicio_medicacion: 'inicio-medicacion.PNG',
  tramite: 'tramites.jpg',
  otro: 'otros.jpg',
}

/** Nombre de archivo de la ilustración del tipo (fallback: 'otros.jpg'). */
export function eventImageFile(typeId: string): string {
  return TYPE_IMAGE[typeId] ?? 'otros.jpg'
}

/** Ilustración del resumen semanal (cabecera del correo de los domingos). */
export const WEEKLY_IMAGE_FILE = 'resumen_semanal.jpg'

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
