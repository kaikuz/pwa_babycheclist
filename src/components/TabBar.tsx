export type Tab = 'lista' | 'documentos'

interface Props {
  tab: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'lista', label: 'Lista', icon: '📝' },
  { id: 'documentos', label: 'Documentos', icon: '📄' },
]

export function TabBar({ tab, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-card pb-safe">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition-colors ${
              tab === t.id ? 'text-euca' : 'text-soft'
            }`}
          >
            <span className="text-xl leading-none">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
