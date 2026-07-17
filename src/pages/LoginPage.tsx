import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setBusy(false)
    if (err) {
      setError(
        err.status === 429
          ? 'Demasiados intentos seguidos. Por seguridad, espera unos 10 minutos y vuelve a intentarlo.'
          : 'No se pudo enviar el enlace. Inténtalo de nuevo.'
      )
      return
    }
    setSent(true)
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm rounded-card border border-edge bg-card p-6 text-center shadow-card">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-euca font-display text-3xl font-semibold text-white">
          C
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold">Camino a casa</h1>
        <p className="mt-1 text-sm text-soft">
          Todo listo para la llegada del bebé
        </p>

        {sent ? (
          <div className="mt-6 rounded-[12px] bg-euca-soft px-4 py-5">
            <p className="text-2xl">📬</p>
            <p className="mt-2 font-semibold">Te hemos enviado un enlace</p>
            <p className="mt-1 text-sm text-soft">
              Abre el correo en este dispositivo y toca el enlace para entrar.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[12px] border border-edge bg-page px-4 py-3 text-center text-[15px] outline-none focus:border-euca"
            />
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="rounded-[12px] bg-euca py-3 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
            >
              {busy ? 'Enviando…' : 'Enviarme el enlace'}
            </button>
            {error && <p className="text-sm text-honey">{error}</p>}
          </form>
        )}
      </div>
    </main>
  )
}
