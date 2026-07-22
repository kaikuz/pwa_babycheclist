// Exporta un evento del calendario de la app a un archivo .ics (iCalendar),
// que iOS/macOS abren con la app Calendario para añadirlo con un toque.
// Incluye fecha, hora (si la tiene), título (SUMMARY), notas (DESCRIPTION) y
// la recurrencia diaria/semanal si el evento se repite.
import type { CalEvent, EventType } from './types'
import { addDaysISO, pad2 } from './dates.js'

/** Escapa los caracteres especiales de un valor de texto iCalendar. */
function esc(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** 'YYYY-MM-DD' → 'YYYYMMDD' (para valores DATE de todo el día). */
function icsDate(iso: string): string {
  return iso.replace(/-/g, '')
}

/** Sella el momento de creación del .ics en UTC: 'YYYYMMDDTHHMMSSZ'. */
function icsStamp(now = new Date()): string {
  return (
    `${now.getUTCFullYear()}${pad2(now.getUTCMonth() + 1)}${pad2(now.getUTCDate())}` +
    `T${pad2(now.getUTCHours())}${pad2(now.getUTCMinutes())}${pad2(now.getUTCSeconds())}Z`
  )
}

/** Suma una hora a 'HH:MM'; devuelve [díasExtra, 'HH:MM'] por si pasa de medianoche. */
function plusOneHour(time: string): [number, string] {
  const [h, m] = time.split(':').map(Number)
  const nh = h + 1
  return nh >= 24 ? [1, `${pad2(nh - 24)}:${pad2(m)}`] : [0, `${pad2(nh)}:${pad2(m)}`]
}

/** 'YYYY-MM-DD' + 'HH:MM' → hora local flotante 'YYYYMMDDTHHMMSS' (sin zona). */
function icsLocalDateTime(iso: string, time: string): string {
  return `${icsDate(iso)}T${time.replace(':', '')}00`
}

/** Compone el cuerpo iCalendar (VCALENDAR con un VEVENT) del evento dado. */
export function buildICS(ev: CalEvent, type?: EventType): string {
  const lines: string[] = []
  const push = (l: string) => lines.push(l)

  push('BEGIN:VCALENDAR')
  push('VERSION:2.0')
  push('PRODID:-//Camino a casa//Calendario//ES')
  push('CALSCALE:GREGORIAN')
  push('BEGIN:VEVENT')
  push(`UID:${ev.id}@camino-a-casa`)
  push(`DTSTAMP:${icsStamp()}`)

  if (!ev.all_day && ev.time) {
    // Con hora: hora local flotante (se interpreta en la zona del dispositivo).
    const [extraDays, endTime] = plusOneHour(ev.time)
    const endIso = extraDays ? addDaysISO(ev.start_date, extraDays) : ev.start_date
    push(`DTSTART:${icsLocalDateTime(ev.start_date, ev.time)}`)
    push(`DTEND:${icsLocalDateTime(endIso, endTime)}`) // duración por defecto: 1 h
  } else {
    // Todo el día: DTEND es exclusivo, por eso +1 día sobre el último día.
    const lastDay = ev.end_date ?? ev.start_date
    push(`DTSTART;VALUE=DATE:${icsDate(ev.start_date)}`)
    push(`DTEND;VALUE=DATE:${icsDate(addDaysISO(lastDay, 1))}`)
  }

  if (ev.recurrence === 'daily' || ev.recurrence === 'weekly') {
    const freq = ev.recurrence === 'daily' ? 'DAILY' : 'WEEKLY'
    const until = ev.recurrence_until
      ? `;UNTIL=${icsDate(ev.recurrence_until)}`
      : ''
    push(`RRULE:FREQ=${freq}${until}`)
  }

  push(`SUMMARY:${esc(ev.title)}`)
  const descBits = [ev.notes?.trim(), type ? `Tipo: ${type.name}` : null].filter(
    Boolean
  ) as string[]
  if (descBits.length) push(`DESCRIPTION:${esc(descBits.join('\n\n'))}`)

  push('END:VEVENT')
  push('END:VCALENDAR')
  // iCalendar exige CRLF entre líneas.
  return lines.join('\r\n')
}

/** Nombre de archivo seguro a partir del título del evento. */
function fileName(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'evento'}.ics`
}

/** ¿Estamos en iOS/iPadOS? (iPadOS moderno se hace pasar por Mac con táctil). */
function isAppleMobile(): boolean {
  const ua = navigator.userAgent
  const iPhoneiPad = /iPad|iPhone|iPod/.test(ua)
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1
  return iPhoneiPad || iPadOS
}

/**
 * Añade el evento al calendario nativo.
 *
 * En iOS/iPadOS navegamos a un data-URI `text/calendar`, con lo que iOS abre
 * directamente su tarjeta nativa "Añadir al calendario" con los datos ya
 * puestos (un toque para añadir), sin descargar ni importar el archivo.
 * (El compositor completo de Apple Calendar no es accesible desde una web: lo
 * reserva iOS a apps nativas vía EventKit.)
 *
 * En escritorio se descarga el .ics, que Calendario/Outlook abren al pulsarlo.
 */
export function addEventToCalendar(ev: CalEvent, type?: EventType): void {
  const ics = buildICS(ev, type)

  if (isAppleMobile()) {
    // data-URI en lugar de blob: iOS lo reconoce como evento y muestra la
    // ficha nativa. Navegar en la propia vista abre la hoja del sistema y al
    // cerrarla se vuelve a la app.
    window.location.href =
      'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics)
    return
  }

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName(ev.title)
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
