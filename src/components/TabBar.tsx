export type Tab = 'lista' | 'documentos' | 'calendario'

interface Props {
  tab: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'lista', label: 'Lista', icon: '📝' },
  { id: 'calendario', label: 'Calendario', icon: '📅' },
  { id: 'documentos', label: 'Documentos', icon: '📄' },
]

export function TabBar({ tab, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-card pb-safe">
      <div className="mx-auto flex max-w-lg px-2 pt-1.5">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 pb-1.5 text-xs font-semibold transition-colors ${
                active ? 'text-euca' : 'text-soft'
              }`}
            >
              <span
                className={`flex h-8 w-16 items-center justify-center rounded-pill text-xl leading-none transition-colors ${
                  active ? 'bg-euca-soft' : ''
                }`}
              >
                {t.icon}
              </span>
              {t.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
