import { useEffect, useState } from 'react'
import { useStore } from '../../hooks/useStore'

/** Real subsystems, each resolved by an actual milestone rather than a timer. */
const SYSTEMS = [
  { label: 'City systems', at: 0.25 },
  { label: 'Lighting', at: 0.5 },
  { label: 'Environment', at: 0.78 },
  { label: 'Portfolio', at: 1 },
]

function bar(fraction: number) {
  const filled = Math.round(Math.min(1, Math.max(0, fraction)) * 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

export function Loader() {
  const progress = useStore((s) => s.loadProgress)
  const ready = useStore((s) => s.ready)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => setHidden(true), 900)
    return () => window.clearTimeout(t)
  }, [ready])

  if (hidden) return null

  return (
    <div
      className={[
        'fixed inset-0 z-[100] flex items-center justify-center bg-void px-6',
        'transition-opacity duration-700 ease-travel motion-reduce:transition-none',
        ready ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
      role="status"
      aria-live="polite"
      aria-label={ready ? 'System ready' : `Loading, ${Math.round(progress * 100)} percent`}
    >
      <div className="w-full max-w-md">
        <p className="meta text-ice mb-6">Initializing city</p>
        <ul className="space-y-2">
          {SYSTEMS.map((system) => {
            const fraction = Math.min(1, progress / system.at)
            return (
              <li key={system.label} className="flex items-center gap-3 font-mono text-[11px]">
                <span className="w-28 shrink-0 uppercase tracking-meta text-mute">
                  {system.label}
                </span>
                <span className={fraction >= 1 ? 'text-ice' : 'text-mute'}>{bar(fraction)}</span>
                <span className="tabular-nums text-vapor/70">
                  {String(Math.round(fraction * 100)).padStart(3, ' ')}%
                </span>
              </li>
            )
          })}
        </ul>
        <div className="rule my-6" />
        <p className={`meta ${ready ? 'text-ice glow-ice' : 'text-mute'}`}>
          {ready ? 'System ready' : 'Standby'}
        </p>
      </div>
    </div>
  )
}
