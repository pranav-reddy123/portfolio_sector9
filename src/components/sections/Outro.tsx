import { useRef } from 'react'
import { useStore } from '../../hooks/useStore'
import { useInert } from '../../hooks/useInert'

interface OutroProps {
  onRestart: () => void
}

export function Outro({ onRestart }: OutroProps) {
  const active = useStore((s) => s.section) === 'outro'
  const ref = useRef<HTMLElement>(null)
  useInert(ref, active)

  return (
    <section
      ref={ref}
      id="outro"
      aria-labelledby="outro-title"
      className={[
        'fixed inset-0 z-20 flex flex-col items-center justify-center px-6 text-center',
        'transition-opacity duration-700 ease-travel motion-reduce:transition-none',
        active ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      aria-hidden={!active}
    >
      <p className="meta text-ice">Route complete</p>
      <h2 id="outro-title" className="mt-4 font-display text-[clamp(1.6rem,5vw,3rem)] text-white">
        End of the line
      </h2>
      <p className="mt-4 max-w-sm text-balance text-sm text-vapor/70">
        That is the whole sector. Take the route again, or send a transmission from Relay.
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex min-h-[48px] items-center gap-3 border border-mute/40 px-6 font-mono text-[11px] uppercase tracking-meta text-vapor transition-colors duration-300 hover:border-ice hover:text-ice cursor-pointer"
      >
        Return to the skyline
      </button>
    </section>
  )
}
