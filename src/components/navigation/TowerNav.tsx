import { store, useStore } from '../../hooks/useStore'
import { TOWERS } from '../../data/towers'
import type { SectionId } from '../../data/towers'

interface TowerNavProps {
  onTravel: (id: SectionId) => void
  /** Horizontal layout is used for the mobile bar; vertical for the desktop rail. */
  orientation?: 'vertical' | 'horizontal'
}

const ACCENT_TEXT: Record<string, string> = {
  ice: 'text-ice',
  signal: 'text-signal',
  sodium: 'text-sodium',
  haze: 'text-[#8f7bff]',
}

const ACCENT_BG: Record<string, string> = {
  ice: 'bg-ice',
  signal: 'bg-signal',
  sodium: 'bg-sodium',
  haze: 'bg-[#8f7bff]',
}

/**
 * The city's node list. It is real navigation — keyboard reachable, works with the
 * canvas absent — and doubles as the monitoring readout for each district.
 */
export function TowerNav({ onTravel, orientation = 'vertical' }: TowerNavProps) {
  const section = useStore((s) => s.section)
  const hovered = useStore((s) => s.hoveredTower)

  return (
    <nav aria-label="City towers">
      <ul
        className={
          orientation === 'vertical'
            ? 'flex flex-col gap-1'
            : 'flex items-stretch justify-between gap-1'
        }
      >
        {TOWERS.map((tower) => {
          const active = section === tower.id
          const lit = active || hovered === tower.id
          return (
            <li key={tower.id} className={orientation === 'horizontal' ? 'flex-1' : undefined}>
              <button
                type="button"
                onClick={() => onTravel(tower.id)}
                onPointerEnter={() => store.setHoveredTower(tower.id)}
                onPointerLeave={() => store.setHoveredTower(null)}
                onFocus={() => store.setHoveredTower(tower.id)}
                onBlur={() => store.setHoveredTower(null)}
                aria-current={active ? 'true' : undefined}
                className={[
                  'group relative flex w-full min-w-0 min-h-[44px] transition-colors duration-200 cursor-pointer',
                  // The phone bar stacks index over label so four nodes fit 375px.
                  orientation === 'horizontal'
                    ? 'flex-col items-center justify-center gap-0.5 px-1 py-2 text-center'
                    : 'items-center gap-3 px-3 py-2 text-left',
                  lit ? 'bg-white/[0.04]' : 'hover:bg-white/[0.03]',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute transition-all duration-300',
                    orientation === 'horizontal'
                      ? 'left-1/2 top-0 h-[2px] w-8 -translate-x-1/2'
                      : 'left-0 top-1/2 h-5 w-[2px] -translate-y-1/2',
                    active ? `${ACCENT_BG[tower.accent]} opacity-100` : 'bg-mute opacity-0',
                  ].join(' ')}
                  aria-hidden="true"
                />
                <span
                  className={`font-mono text-[10px] tracking-meta ${
                    lit ? ACCENT_TEXT[tower.accent] : 'text-mute'
                  }`}
                >
                  {tower.index}
                </span>
                <span
                  className={
                    orientation === 'horizontal'
                      ? 'flex min-w-0 flex-col items-center'
                      : 'flex min-w-0 flex-col'
                  }
                >
                  <span
                    className={`font-display text-[13px] leading-none ${
                      lit ? 'text-white' : 'text-vapor/70'
                    }`}
                  >
                    {tower.label}
                  </span>
                  {orientation === 'vertical' && (
                    <span className="meta meta-sm mt-1 truncate">{tower.callsign}</span>
                  )}
                </span>
                <span className="sr-only">— travel to tower {tower.index}</span>
                <span
                  className={[
                    'h-1.5 w-1.5 shrink-0 rounded-full transition-opacity duration-300',
                    orientation === 'horizontal' ? 'mt-0.5' : 'ml-auto',
                    ACCENT_BG[tower.accent],
                    active ? 'opacity-100' : 'opacity-30',
                  ].join(' ')}
                  aria-hidden="true"
                />
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
