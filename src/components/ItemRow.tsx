import { useAuth } from '../context/AuthContext'
import { displayName, shortDate } from '../lib/format'
import type { Item, ItemCheck } from '../lib/types'

interface Props {
  item: Item
  check: ItemCheck | undefined
  onToggle: (item: Item) => void
  onDelete: (item: Item) => void
}

export function ItemRow({ item, check, onToggle, onDelete }: Props) {
  const { email } = useAuth()
  const checked = check !== undefined

  return (
    <li className="flex gap-3 px-4 py-3">
      {/* Checkbox grande, cómodo para el pulgar */}
      <button
        role="checkbox"
        aria-checked={checked}
        aria-label={item.name}
        onClick={() => onToggle(item)}
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border-2 transition-colors ${
          checked
            ? 'border-euca bg-euca text-white'
            : 'border-edge bg-card active:border-euca'
        }`}
      >
        {checked && (
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8.5 6.5 12 13 4.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[15px] leading-snug ${
              checked ? 'text-soft line-through decoration-edge' : ''
            }`}
          >
            {item.name}
          </p>
          {item.is_custom && (
            <button
              onClick={() => {
                if (confirm(`¿Eliminar «${item.name}»?`)) onDelete(item)
              }}
              aria-label={`Eliminar ${item.name}`}
              className="shrink-0 rounded-pill px-1.5 text-lg leading-none text-soft active:text-honey"
            >
              ×
            </button>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-pill px-2 py-0.5 text-[11px] font-semibold ${
              item.essential
                ? 'bg-euca-soft text-euca'
                : 'bg-honey-soft text-honey'
            }`}
          >
            {item.essential ? 'Básico' : 'Nice to have'}
          </span>
          {item.is_custom && (
            <span className="rounded-pill border border-edge px-2 py-0.5 text-[11px] font-semibold text-soft">
              Mío
            </span>
          )}
          {check && (
            <span className="text-[11px] text-soft">
              ✓ {displayName(check.checked_by, email)} · {shortDate(check.checked_at)}
            </span>
          )}
        </div>

        {item.products.length > 0 && (
          <ul className="mt-2 space-y-1">
            {item.products.map((p, i) => (
              <li key={i} className="flex items-baseline gap-2 text-[13px]">
                <span className="min-w-0 truncate text-soft">{p.n}</span>
                <span className="shrink-0 whitespace-nowrap text-soft">{p.p}</span>
                <a
                  href={p.u}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 font-semibold text-euca"
                >
                  Ver →
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}
