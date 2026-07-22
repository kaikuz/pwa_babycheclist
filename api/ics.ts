// Devuelve un evento en formato iCalendar (.ics) con Content-Type text/calendar.
// Al navegar a esta URL desde un iPhone/iPad, iOS abre directamente su tarjeta
// nativa "Añadir al calendario" con los datos ya puestos (sin descargar ni
// importar el archivo). Los datos del evento llegan por query params, así que
// no necesita base de datos ni autenticación.
//
// Import con extensión .js: ESM en Vercel exige la extensión en runtime.
import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { CalEvent, EventType, Recurrence } from '../src/lib/types.js'
import { buildICS } from '../src/lib/ics.js'

const first = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? v[0] ?? '' : v ?? ''

export default function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query
  const title = first(q.title).trim()
  const start = first(q.start_date)
  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    return res.status(400).send('Parámetros inválidos')
  }

  const rec = first(q.recurrence)
  const ev: CalEvent = {
    id: first(q.id) || 'evento',
    type_id: first(q.type_id) || 'otro',
    title,
    notes: first(q.notes) || null,
    start_date: start,
    end_date: first(q.end_date) || null,
    all_day: first(q.all_day) !== 'false',
    time: first(q.time) || null,
    recurrence: (['daily', 'weekly'].includes(rec) ? rec : 'none') as Recurrence,
    recurrence_until: first(q.recurrence_until) || null,
    created_by: '',
    created_at: '',
    updated_at: '',
  }

  const typeName = first(q.type_name)
  const type: EventType | undefined = typeName
    ? { id: ev.type_id, name: typeName, color: '', icon: '' }
    : undefined

  const ics = buildICS(ev, type)
  // inline (no attachment): así iOS muestra la ficha del evento en vez de
  // guardarlo en Archivos.
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  res.setHeader('Content-Disposition', 'inline; filename="evento.ics"')
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).send(ics)
}
