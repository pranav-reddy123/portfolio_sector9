import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../hooks/useStore'
import { useInert } from '../../hooks/useInert'
import { PERSON } from '../../data/about'

interface IntroProps {
  onEnter: () => void
}

/** The arrival. Short by design — one line of identity, one instruction, then travel. */
export function Intro({ onEnter }: IntroProps) {
  const entered = useStore((s) => s.entered)
  const ready = useStore((s) => s.ready)
  const ref = useRef<HTMLElement>(null)
  const [gone, setGone] = useState(false)
  useInert(ref, !entered)

  // Leave the DOM once the fade is done: a half-transparent title lingering over the
  // city is worse than no title at all.
  useEffect(() => {
    if (!entered) {
      setGone(false)
      return
    }
    const timer = window.setTimeout(() => setGone(true), 1100)
    return () => window.clearTimeout(timer)
  }, [entered])

  if (gone) return null

  return (
    <section
      ref={ref}
      id="intro"
      aria-labelledby="intro-title"
      className={[
        'pointer-events-none fixed inset-0 z-20 flex flex-col items-center justify-center px-6 text-center',
        'transition-[opacity,transform] duration-1000 ease-travel motion-reduce:transition-none',
        entered ? 'pointer-events-none opacity-0 -translate-y-4' : 'opacity-100',
      ].join(' ')}
      aria-hidden={entered}
    >
      <p className="meta mb-6 text-ice">Sector 09 · night · precipitation light</p>

      <p id="intro-title" className="font-display text-white">
        <span className="block text-[clamp(3rem,13vw,9rem)] leading-[0.86]">{PERSON.name}</span>
        <span className="mt-4 block text-[clamp(0.7rem,2.2vw,1rem)] tracking-[0.4em] text-vapor/80">
          Software engineer · Creative developer
        </span>
      </p>

      <p className="mt-8 max-w-md text-balance text-sm leading-relaxed text-vapor/70">
        The work is in the city. Four towers, one route, no menus — travel through it.
      </p>

      <button
        type="button"
        onClick={onEnter}
        disabled={!ready}
        className={[
          'pointer-events-auto group mt-10 inline-flex min-h-[48px] items-center gap-4 border border-ice/40 px-7',
          'font-mono text-[11px] uppercase tracking-meta text-ice transition-all duration-300 cursor-pointer',
          'hover:bg-ice/10 hover:border-ice focus-visible:bg-ice/10',
          'disabled:cursor-wait disabled:border-mute/30 disabled:text-mute',
        ].join(' ')}
      >
        {ready ? 'Enter the city' : 'Building the city'}
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </button>

      <p className="meta mt-8 animate-pulse">Scroll to travel</p>
    </section>
  )
}
