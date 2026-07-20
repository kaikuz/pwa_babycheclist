// Composición de los correos de recordatorio. Módulo puro (sin red ni env)
// para poder probarlo aislado; lo consume /api/send-reminders.
//
// Reutiliza eventOccursOn y las utilidades de fecha del cliente, de modo que
// las recurrencias (diaria/semanal) y los rangos se expanden exactamente
// igual que en la pestaña Calendario.
// Imports con extensión .js (requisito de ESM en tiempo de ejecución en Vercel)
import type { CalEvent, EventType } from '../src/lib/types.js'
import {
  eventImageFile,
  eventOccursOn,
  recurrenceCaption,
  WEEKLY_IMAGE_FILE,
} from '../src/lib/events.js'
import { addDaysISO, formatLong, parseISO } from '../src/lib/dates.js'

export interface ReminderEmail {
  subject: string
  html: string
  dayCount: number
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
 * Compone el correo de la víspera: de lunes a sábado lista los eventos de
 * MAÑANA (todayIso + 1), para avisar con un día de antelación. Los domingos
 * no manda la víspera, sino el resumen de la semana entrante (lunes a
 * domingo), que ya incluye el lunes, así que no se duplica.
 * Devuelve null si no hay nada que enviar.
 */
export function buildReminderEmail(
  events: CalEvent[],
  types: EventType[],
  todayIso: string,
  baseUrl = ''
): ReminderEmail | null {
  const typeById = new Map(types.map((t) => [t.id, t]))
  const byTime = (a: CalEvent, b: CalEvent) =>
    (a.time ?? '99').localeCompare(b.time ?? '99')

  const isSunday = parseISO(todayIso).getDay() === 0

  // Aviso de la víspera: eventos de mañana. El domingo se omite (lo cubre el
  // resumen semanal de más abajo).
  const dayIso = addDaysISO(todayIso, 1)
  const dayEvents = isSunday
    ? []
    : events.filter((e) => eventOccursOn(e, dayIso)).sort(byTime)
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

  if (dayEvents.length === 0 && weekCount === 0) return null

  let body = ''
  if (dayEvents.length) {
    body += sectionTitle(`Mañana · ${cap(formatLong(dayIso))}`)
    body += dayEvents.map((e) => eventRow(e, typeById.get(e.type_id))).join('')
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

  // Todas las imágenes se enlazan por URL absoluta bajo baseUrl (los correos
  // no admiten imágenes locales ni base64 en Gmail).
  const asset = (file: string) => (baseUrl ? `${baseUrl}/${file}` : '')

  // Logo centrado en la cabecera; width/height fijos + estilos inline para que
  // se vea igual en todos los clientes.
  const logoUrl = asset('icon-192.png')
  const logo = logoUrl
    ? `<img src="${logoUrl}" width="76" height="76" alt="Camino a casa" style="width:76px;height:76px;border-radius:20px;display:inline-block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;" />`
    : ''

  // Ilustraciones de cabecera (llevan su rótulo incrustado, se muestran
  // completas). En el correo semanal (domingo con eventos de la semana), la del
  // resumen semanal; en el diario, las de los tipos de hoy, una junto a otra.
  const weekly = isSunday && weekCount > 0
  let headerImages = ''
  if (baseUrl && weekly) {
    headerImages = `<div style="text-align:center;margin-bottom:16px;"><img src="${asset(WEEKLY_IMAGE_FILE)}" width="220" alt="Resumen semanal" style="width:220px;max-width:80%;height:auto;border-radius:18px;display:inline-block;border:0;" /></div>`
  } else if (baseUrl) {
    const shownTypes = types.filter((t) =>
      dayEvents.some((e) => e.type_id === t.id)
    )
    if (shownTypes.length) {
      headerImages =
        `<div style="text-align:center;margin-bottom:16px;font-size:0;">` +
        shownTypes
          .map(
            (t) =>
              `<img src="${asset(eventImageFile(t.id))}" width="150" alt="${t.name}" style="width:150px;max-width:44%;height:auto;border-radius:16px;display:inline-block;margin:4px;border:0;" />`
          )
          .join('') +
        `</div>`
    }
  }

  // Documento HTML completo: viewport para móvil y color-scheme "light" para
  // que el modo oscuro de algún cliente no invierta los colores del diseño.
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light" />
<title>Camino a casa</title>
</head>
<body style="margin:0;padding:0;width:100%;background:#f4f6f1;-webkit-text-size-adjust:100%;">
  <div style="margin:0;padding:24px 16px;background:#f4f6f1;font-family:Karla,-apple-system,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:520px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:16px;">
        ${logo}
        <div style="font-family:Fraunces,Georgia,serif;font-size:22px;font-weight:600;color:#2e3a33;margin-top:10px;">Camino a casa</div>
        <div style="font-size:13px;color:#6b7a70;margin-top:2px;">Recordatorio del calendario</div>
      </div>
      ${headerImages}
      ${body}
      <div style="margin-top:20px;font-size:11px;line-height:1.5;color:#6b7a70;text-align:center;">
        Correo automático diario a las 12h (11h en horario de invierno).<br />
        Los eventos se editan desde la pestaña Calendario de la app.
      </div>
    </div>
  </div>
</body>
</html>`

  const subject = isSunday
    ? 'Camino a casa — tu semana'
    : `Camino a casa — mañana: ${dayEvents.map((e) => e.title).join(' · ')}`

  return { subject, html, dayCount: dayEvents.length, weekCount }
}
