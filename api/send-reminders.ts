// Endpoint invocado por Vercel Cron (ver "crons" en vercel.json) cada día a
// las 10:00 UTC (12:00 en Madrid en verano, 11:00 en invierno). Lee los
// eventos con la service role key (solo servidor), compone el recordatorio
// y lo envía por Brevo a los emails de allowed_users.
//
// Variables de entorno necesarias (en Vercel, NUNCA con prefijo VITE_):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY,
//   BREVO_SENDER_EMAIL (remitente verificado en Brevo), CRON_SECRET
//
// Prueba manual sin enviar nada:
//   curl -H "Authorization: Bearer $CRON_SECRET" "https://TU-APP.vercel.app/api/send-reminders?dry=1"
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { CalEvent, EventType } from '../src/lib/types.js'
// Imports con extensión .js: en ESM (package.json "type":"module") Node exige
// la extensión en tiempo de ejecución, y Vercel transpila cada archivo sin
// bundlear. Sin ella, la función falla con ERR_MODULE_NOT_FOUND.
import { buildReminderEmail, madridTodayISO } from '../server/reminders.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const brevoKey = process.env.BREVO_API_KEY
  const sender = process.env.BREVO_SENDER_EMAIL
  if (!url || !serviceKey || !brevoKey || !sender) {
    return res.status(500).json({ error: 'Faltan variables de entorno' })
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  const [usersRes, typesRes, eventsRes] = await Promise.all([
    supabase.from('allowed_users').select('email'),
    supabase.from('event_types').select('*'),
    supabase.from('events').select('*'),
  ])
  if (usersRes.error || typesRes.error || eventsRes.error) {
    return res.status(502).json({ error: 'No se pudo leer de Supabase' })
  }

  const recipients = (usersRes.data as { email: string }[]).map((u) => u.email)
  // ?date=YYYY-MM-DD fuerza el día, tanto para previsualizar (?dry) como para
  // enviar una prueba real de otro día (p. ej. un domingo con su resumen).
  // Es seguro: el cron programado en vercel.json nunca pasa este parámetro,
  // así que solo se aplica cuando tú lo añades a mano en la URL.
  const dateParam = req.query.date
  const today =
    typeof dateParam === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : madridTodayISO()
  // URL pública de la app para el logo del correo. Configurable con APP_URL;
  // si no, usa el dominio de producción. icon-192.png se sirve desde /public.
  const appUrl = (process.env.APP_URL || 'https://pwa-babycheclist.vercel.app').replace(/\/+$/, '')
  const email = buildReminderEmail(
    eventsRes.data as CalEvent[],
    typesRes.data as EventType[],
    today,
    `${appUrl}/icon-192.png`
  )

  if (!email) {
    return res.status(200).json({ sent: false, reason: 'Sin eventos', today })
  }

  // El preview no necesita destinatarios: devuelve el HTML tal cual.
  if (req.query.dry) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(200).send(email.html)
  }

  if (recipients.length === 0) {
    return res.status(200).json({ sent: false, reason: 'Sin destinatarios', today })
  }

  const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': brevoKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Camino a casa', email: sender },
      to: recipients.map((e) => ({ email: e })),
      subject: email.subject,
      htmlContent: email.html,
    }),
  })
  if (!brevoRes.ok) {
    const detail = await brevoRes.text()
    return res.status(502).json({ error: 'Brevo rechazó el envío', detail })
  }

  return res.status(200).json({
    sent: true,
    today,
    recipients: recipients.length,
    todayCount: email.todayCount,
    weekCount: email.weekCount,
  })
}
