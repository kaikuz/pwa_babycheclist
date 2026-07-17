import { useAuth } from '../context/AuthContext'

export function PrivatePage() {
  const { signOut } = useAuth()

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-safe pt-safe">
      <div className="w-full max-w-sm rounded-card border border-edge bg-card p-6 text-center shadow-card">
        <p className="text-3xl">🔒</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">
          Esta app es privada
        </h1>
        <p className="mt-2 text-sm text-soft">
          Camino a casa es solo para dos personas. Tu email no está en la
          lista de acceso.
        </p>
        <button
          onClick={() => void signOut()}
          className="mt-5 w-full rounded-[12px] border border-edge py-3 text-[15px] font-semibold transition-colors active:bg-page"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
