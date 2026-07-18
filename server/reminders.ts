// Composición de los correos de recordatorio. Módulo puro (sin red ni env)
// para poder probarlo aislado; lo consume /api/send-reminders.
//
// Reutiliza eventOccursOn y las utilidades de fecha del cliente, de modo que
// las recurrencias (diaria/semanal) y los rangos se expanden exactamente
// igual que en la pestaña Calendario.
import type { CalEvent, EventType } from '../src/lib/types'
import { eventOccursOn, recurrenceCaption } from '../src/lib/events'
import { addDaysISO, formatLong, parseISO } from '../src/lib/dates'

export interface ReminderEmail {
  subject: string
  html: string
  todayCount: number
  weekCount: number
}

/** 'YYYY-MM-DD' de hoy en Europa/Madrid, se ejecute donde se ejecute. */
export function madridTodayISO(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function eventRow(ev: CalEvent, type: EventType | undefined): string {
  const color = type?.color ?? '#8B8B8B'
  const icon = type?.icon ?? '📌'
  const time = !ev.all_day && ev.time ? ev.time : null
  const caption = recurrenceCaption(ev)
  const metaBits = [type?.name, time, caption || null].filter(Boolean)
  const notes = ev.notes
    ? `<div style="margin-top:4px;font-size:13px;color:#6b7a70;">${ev.notes}</div>`
    : ''
  return `
    <div style="display:flex;margin:0 0 10px;padding:12px 14px;background:#ffffff;border:1px solid #dde4dc;border-radius:14px;">
      <div style="width:5px;border-radius:99px;background:${color};margin-right:12px;"></div>
      <div>
        <div style="font-size:15px;font-weight:600;color:#2e3a33;">${icon} ${ev.title}</div>
        <div style="margin-top:2px;font-size:12px;color:${color};font-weight:600;">${metaBits.join(' · ')}</div>
        ${notes}
      </div>
    </div>`
}

function sectionTitle(text: string): string {
  return `<div style="margin:18px 0 8px;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#6b7a70;">${text}</div>`
}

/**
 * Compone el correo del día: eventos de hoy y, si `todayIso` es domingo,
 * añade el resumen de la semana entrante (lunes a domingo).
 * Devuelve null si no hay nada que enviar.
 */
export function buildReminderEmail(
  events: CalEvent[],
  types: EventType[],
  todayIso: string
): ReminderEmail | null {
  const typeById = new Map(types.map((t) => [t.id, t]))
  const byTime = (a: CalEvent, b: CalEvent) =>
    (a.time ?? '99').localeCompare(b.time ?? '99')

  const todayEvents = events.filter((e) => eventOccursOn(e, todayIso)).sort(byTime)

  const isSunday = parseISO(todayIso).getDay() === 0
  // En el resumen semanal, los recurrentes diarios (p. ej. la heparina) se
  // listan una sola vez bajo "Todos los días" en vez de repetirse 7 veces.
  const weekDays: { iso: string; events: CalEvent[] }[] = []
  const weekDaily: CalEvent[] = []
  if (isSunday) {
    for (let d = 1; d <= 7; d++) {
      const iso = addDaysISO(todayIso, d)
      for (const ev of events) {
        if (!eventOccursOn(ev, iso)) continue
        if (ev.recurrence === 'daily') {
          if (!weekDaily.includes(ev)) weekDaily.push(ev)
        } else {
          let day = weekDays.find((w) => w.iso === iso)
          if (!day) weekDays.push((day = { iso, events: [] }))
          day.events.push(ev)
        }
      }
    }
    for (const day of weekDays) day.events.sort(byTime)
  }
  const weekCount =
    weekDaily.length + weekDays.reduce((n, d) => n + d.events.length, 0)

  if (todayEvents.length === 0 && weekCount === 0) return null

  let body = ''
  if (todayEvents.length) {
    body += sectionTitle(`Hoy · ${cap(formatLong(todayIso))}`)
    body += todayEvents.map((e) => eventRow(e, typeById.get(e.type_id))).join('')
  }
  if (weekCount) {
    body += sectionTitle('La semana que viene')
    if (weekDaily.length) {
      body += `<div style="margin:10px 0 6px;font-size:13px;font-weight:700;color:#2e3a33;">Todos los días</div>`
      body += weekDaily.map((e) => eventRow(e, typeById.get(e.type_id))).join('')
    }
    for (const day of weekDays) {
      body += `<div style="margin:10px 0 6px;font-size:13px;font-weight:700;color:#2e3a33;">${cap(formatLong(day.iso))}</div>`
      body += day.events.map((e) => eventRow(e, typeById.get(e.type_id))).join('')
    }
  }

  const html = `
  <div style="margin:0;padding:24px 16px;background:#f4f6f1;font-family:Karla,-apple-system,'Segoe UI',sans-serif;">
    <div style="max-width:520px;margin:0 auto;">
      <div style="font-family:Fraunces,Georgia,serif;font-size:22px;font-weight:600;color:#2e3a33;margin-bottom:2px;">🏡 Camino a casa</div>
      <div style="font-size:13px;color:#6b7a70;margin-bottom:6px;">Recordatorio del calendario</div>
      ${body}
      <div style="margin-top:18px;font-size:11px;color:#6b7a70;">
        Correo automático diario a las 12h (11h en horario de invierno).
        Los eventos se editan desde la pestaña Calendario de la app.
      </div>
    </div>
  </div>`

  const subject =
    isSunday && weekCount
      ? todayEvents.length
        ? `Camino a casa — hoy (${todayEvents.length}) y tu semana`
        : 'Camino a casa — tu semana'
      : `Camino a casa — hoy: ${todayEvents.map((e) => e.title).join(' · ')}`

  return { subject, html, todayCount: todayEvents.length, weekCount }
}
