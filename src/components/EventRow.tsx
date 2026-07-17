import type { CalEvent, EventType } from '../lib/types'
import { eventColor, recurrenceCaption } from '../lib/events'
import { formatShort } from '../lib/dates'

interface Props {
  event: CalEvent
  type: EventType | undefined
  dark: boolean
  onClick: () => void
  /** en la vista lista mostramos la fecha; en el panel de un día, no */
  showDate?: boolean
}

export function EventRow({ event, type, dark, onClick, showDate = true }: Props) {
  const color = eventColor(type, dark)
  const caption = recurrenceCaption(event)

  const dateBits: string[] = []
  if (showDate) {
    dateBits.push(
      event.end_date
        ? `${formatShort(event.start_date)} – ${formatShort(event.end_date)}`
        : formatShort(event.start_date)
    )
  }
  if (!event.all_day && event.time) dateBits.push(event.time)

  return (
    <button
      onClick={onClick}
      className="flex w-full items-stretch gap-3 py-3 pl-3 pr-4 text-left"
    >
      <span
        className="w-1.5 shrink-0 rounded-pill"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="text-xl leading-tight">{type?.icon ?? '📌'}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-snug">{event.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-soft">
          {dateBits.length > 0 && <span>{dateBits.join(' · ')}</span>}
          {caption && <span>· {caption}</span>}
        </div>
      </div>
      {type && (
        <span
          className="mt-0.5 h-fit shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {type.name}
        </span>
      )}
    </button>
  )
}
