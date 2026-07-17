import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './pages/LoginPage'
import { PrivatePage } from './pages/PrivatePage'
import { ChecklistPage } from './pages/ChecklistPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { TabBar, type Tab } from './components/TabBar'
import { useToast } from './context/ToastContext'

function Splash() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-[20px] bg-euca font-display text-3xl font-semibold text-white">
        C
      </div>
    </main>
  )
}

export default function App() {
  const { session, allowed, loading, signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('lista')
  const toast = useToast()

  if (loading) return <Splash />
  if (!session) return <LoginPage />
  if (allowed === null) return <Splash />
  if (!allowed) return <PrivatePage />

  return (
    <div className="mx-auto min-h-dvh max-w-lg pt-safe">
      <div className="flex items-center justify-end px-4 pt-2">
        <button
          onClick={() => {
            void signOut().then(() => toast('Sesión cerrada'))
          }}
          className="text-xs font-semibold text-soft"
        >
          Cerrar sesión
        </button>
      </div>
      {/* pb deja hueco para la tab bar + safe area */}
      <main className="pb-[calc(72px+env(safe-area-inset-bottom))]">
        {tab === 'lista' ? <ChecklistPage /> : <DocumentsPage />}
      </main>
      <TabBar tab={tab} onChange={setTab} />
    </div>
  )
}
