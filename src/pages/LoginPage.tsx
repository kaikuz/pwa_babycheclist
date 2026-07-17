import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)

    const credentials = { email: email.trim(), password }
    const { error: err } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword(credentials)
        : await supabase.auth.signUp(credentials)

    setBusy(false)
    if (err) {
      if (err.message.includes('Invalid login credentials')) {
        setError(
          'Email o contraseña incorrectos. Si es tu primera vez, usa "Crear mi contraseña".'
        )
      } else if (err.message.includes('already registered')) {
        setError('Ese email ya tiene contraseña: usa "Ya tengo contraseña".')
      } else if (err.message.includes('at least 6')) {
        setError('La contraseña debe tener al menos 6 caracteres.')
      } else if (err.status === 429) {
        setError('Demasiados intentos seguidos. Espera unos minutos.')
      } else {
        setError('No se pudo iniciar sesión. Inténtalo de nuevo.')
      }
    }
    // con sesión creada, onAuthStateChange se encarga del resto
  }

  const inputCls =
    'rounded-[12px] border border-edge bg-page px-4 py-3 text-center text-[15px] outline-none focus:border-euca'

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm rounded-card border border-edge bg-card p-6 text-center shadow-card">
        <img
          src="/icon-512.png"
          alt=""
          className="mx-auto h-20 w-20 rounded-[20px] border border-edge object-cover shadow-card"
        />
        <h1 className="mt-4 font-display text-3xl font-semibold">Camino a casa</h1>
        <p className="mt-1 text-sm text-soft">
          Todo listo para la llegada del bebé
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={mode === 'login' ? 'Contraseña' : 'Elige una contraseña (mín. 6)'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
          <button
            type="submit"
            disabled={busy || !email.trim() || !password}
            className="rounded-[12px] bg-euca py-3 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {busy
              ? 'Un momento…'
              : mode === 'login'
                ? 'Entrar'
                : 'Crear cuenta y entrar'}
          </button>
          {error && <p className="text-sm text-honey">{error}</p>}
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === 'login' ? 'signup' : 'login'))
            setError(null)
          }}
          className="mt-4 text-xs font-semibold text-soft underline decoration-edge underline-offset-2"
        >
          {mode === 'login'
            ? '¿Primera vez? Crear mi contraseña'
            : 'Ya tengo contraseña'}
        </button>
      </div>
    </main>
  )
}
