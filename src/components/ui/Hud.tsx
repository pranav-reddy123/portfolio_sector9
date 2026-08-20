import { useEffect, useRef } from 'react'
import { TowerNav } from '../navigation/TowerNav'
import { travel, useStore } from '../../hooks/useStore'
import { TELEMETRY } from '../../data/telemetry'
import { TOWERS, type SectionId } from '../../data/towers'
import { PERSON } from '../../data/about'

interface HudProps {
  onTravel: (id: SectionId) => void
}

/**
 * The system monitor. Everything on it is real: route position comes from the scroll
 * driver, the frame rate from the render loop, the tier from the quality manager.
 * Values are written straight to the DOM in rAF so the console can update every frame
 * without re-rendering React.
 */
export function Hud({ onTravel }: HudProps) {
  const section = useStore((s) => s.section)
  const quality = useStore((s) => s.quality)
  const entered = useStore((s) => s.entered)

  const routeRef = useRef<HTMLSpanElement>(null)
  const nextRef = useRef<HTMLSpanElement>(null)
  const fpsRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = travel.progress
      if (routeRef.current) routeRef.current.textContent = `${(p * 100).toFixed(1).padStart(5, '0')}%`
      if (barRef.current) barRef.current.style.transform = `scaleY(${Math.max(0.001, p)})`
      if (fpsRef.current) fpsRef.current.textContent = `${Math.round(travel.fps)}`
      if (nextRef.current) {
        const next = TOWERS.find((t) => t.progress > p)
        nextRef.current.textContent = next
          ? `${Math.round((next.progress - p) * 4200)}M`
          : 'ARRIVED'
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const lines = TELEMETRY[section]

  return (
    <div
      className={[
        'pointer-events-none fixed inset-0 z-40',
        'transition-opacity duration-1000 ease-travel motion-reduce:transition-none',
        entered ? 'opacity-100' : 'opacity-0',
      ].join(' ')}
      aria-hidden={!entered}
    >
      {/* Framing scrims: they hold the overlay text and letterbox the city slightly. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-void via-void/60 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-void via-void/50 to-transparent"
      />

      {/* Identity — top left, above the rail */}
      <div className="scrim pointer-events-auto absolute left-5 top-6 flex items-center gap-3 sm:left-8 lg:left-12">
        {/* The page's only h1. It outlives the intro, so the document always has one. */}
        <h1 className="font-display text-sm text-white">
          {PERSON.name}
          <span className="sr-only"> — software engineer and creative developer</span>
        </h1>
        <span className="h-3 w-px bg-mute/40" aria-hidden="true" />
        <span className="meta">Sector 09 / 2026</span>
      </div>

      {/* Desktop rail — the console */}
      <div className="pointer-events-auto absolute left-8 top-1/2 hidden w-[196px] -translate-y-1/2 md:block lg:left-12">
        <div className="panel px-2 py-3">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="meta meta-sm">Nodes</span>
            <span className="meta meta-sm text-ice">4 online</span>
          </div>
          <TowerNav onTravel={onTravel} />

          <div className="rule mx-3 my-3" />

          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-3 pb-1 font-mono text-[10px] uppercase tracking-meta">
            <dt className="text-mute">Route</dt>
            <dd className="text-right tabular-nums text-vapor" aria-live="off">
              <span ref={routeRef}>00.0%</span>
            </dd>
            <dt className="text-mute">Next</dt>
            <dd className="text-right tabular-nums text-vapor">
              <span ref={nextRef}>—</span>
            </dd>
            <dt className="text-mute">Render</dt>
            <dd className="text-right tabular-nums text-vapor">
              <span ref={fpsRef}>60</span> fps · {quality}
            </dd>
          </dl>
        </div>
      </div>

      {/* Route spine — a physical progress line down the right edge */}
      <div className="absolute right-6 top-1/2 hidden h-40 w-px -translate-y-1/2 bg-mute/20 md:block">
        <div
          ref={barRef}
          className="h-full w-full origin-top bg-gradient-to-b from-ice to-haze"
          style={{ transform: 'scaleY(0)' }}
          aria-hidden="true"
        />
      </div>

      {/* Telemetry ticker — bottom, district-specific */}
      <div className="scrim absolute bottom-4 left-8 right-8 hidden items-center gap-6 overflow-hidden md:flex lg:left-12 lg:right-12">
        {lines.map((line) => (
          <span key={line} className="meta meta-sm whitespace-nowrap">
            {line}
          </span>
        ))}
      </div>

      {/* Mobile bar — same nodes, thumb reachable */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 md:hidden">
        <div className="panel border-x-0 border-b-0 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <TowerNav onTravel={onTravel} orientation="horizontal" />
        </div>
      </div>
    </div>
  )
}
