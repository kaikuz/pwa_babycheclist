import { useEffect, useState } from 'react'

/**
 * Botón flotante "subir al principio" que aparece al bajar y hace scroll
 * suave hasta arriba (el mismo efecto que al pulsar un chip de sección).
 * Se coloca por encima de la tab bar inferior.
 */
export function ScrollTopButton({ threshold = 500 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Subir al principio"
      className={`fixed right-4 bottom-[calc(78px+env(safe-area-inset-bottom))] z-30 flex h-11 w-11 items-center justify-center rounded-pill border border-edge bg-card text-euca shadow-card transition-all duration-200 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M10 15.5V5m0 0-5 5m5-5 5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
