/**
 * Botón flotante de acción principal (+) para añadir un ítem a la lista.
 * Se coloca por encima de la tab bar inferior, al alcance del pulgar.
 */
export function AddFab({
  onClick,
  label = 'Añadir ítem',
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-[calc(78px+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-pill bg-euca text-white shadow-card transition-transform active:scale-95"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  )
}
