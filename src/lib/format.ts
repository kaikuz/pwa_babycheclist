/** "ana.garcia@gmail.com" → "Ana" */
export function displayName(email: string, ownEmail?: string | null): string {
  if (ownEmail && email.toLowerCase() === ownEmail.toLowerCase()) return 'tú'
  const local = email.split('@')[0]
  const first = local.split(/[._-]/)[0] || local
  return first.charAt(0).toUpperCase() + first.slice(1)
}

/** Fecha corta en español: "3 jul" o "3 jul 25" si es de otro año */
export function shortDate(iso: string): string {
  const d = new Date(iso)
  const sameYear = d.getFullYear() === new Date().getFullYear()
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: '2-digit' }),
  })
}
