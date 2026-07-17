import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  email: string | null
  /** null = comprobando; true/false = resultado de la allowlist */
  allowed: boolean | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  session: null,
  email: null,
  allowed: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const email = session?.user.email ?? null

  useEffect(() => {
    if (!email) {
      setAllowed(null)
      return
    }
    let cancelled = false
    // RLS solo deja leer tu propia fila: si no aparece, no estás en la lista
    supabase
      .from('allowed_users')
      .select('email')
      .eq('email', email)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) setAllowed(!error && data !== null)
      })
    return () => {
      cancelled = true
    }
  }, [email])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, email, allowed, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
