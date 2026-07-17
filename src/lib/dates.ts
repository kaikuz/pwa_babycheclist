// Utilidades de fecha que trabajan con cadenas 'YYYY-MM-DD' en horario local,
// evitando el desfase de zona horaria de `new Date('2026-10-04')` (que se
// interpreta como UTC). Todo se construye con Date(año, mes, día) local.

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const MESES_CORTO = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** Date (local) → 'YYYY-MM-DD' */
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** 'YYYY-MM-DD' → Date local a medianoche */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayISO(): string {
  return toISO(new Date())
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + days)
  return toISO(d)
}

/** "4 oct" · añade el año si no es el actual */
export function formatShort(iso: string): string {
  const d = parseISO(iso)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return `${d.getDate()} ${MESES_CORTO[d.getMonth()]}${sameYear ? '' : ` ${d.getFullYear()}`}`
}

/** "sábado, 4 de octubre" */
export function formatLong(iso: string): string {
  const d = parseISO(iso)
  return `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`
}

/** "octubre 2026" (para cabeceras de mes) */
export function formatMonthYear(year: number, monthIndex: number): string {
  return `${MESES[monthIndex]} ${year}`
}

export function monthLabel(iso: string): string {
  const d = parseISO(iso)
  const label = formatMonthYear(d.getFullYear(), d.getMonth())
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** Clave 'YYYY-MM' para agrupar por mes */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

/** "14:30" o '' si no hay hora */
export function formatTime(time: string | null): string {
  return time ?? ''
}
