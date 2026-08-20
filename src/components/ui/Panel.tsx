import { useRef, type ReactNode } from 'react'
import { useInert } from '../../hooks/useInert'

interface PanelProps {
  /** Small mono label in the panel's top rule — the console's file name for this view. */
  code: string
  title: string
  children: ReactNode
  /** Aligns the panel to the side of the screen the tower is not on. */
  side?: 'left' | 'right'
  active: boolean
  id: string
  labelledBy?: string
}

/**
 * The one content container in the experience. It sits over the city rather than
 * covering it: hairline border, dark fill, corner ticks, no oversized glass card.
 */
export function Panel({ code, title, children, side = 'right', active, id }: PanelProps) {
  const ref = useRef<HTMLElement>(null)
  useInert(ref, active)

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      // Lenis owns the page scroll; long panels keep their own.
      data-lenis-prevent
      className={[
        // Viewport-relative so the panel can never escape a narrow screen, whatever the
        // flex column does around it.
        'pointer-events-auto panel panel-corner w-full max-w-[calc(100vw_-_2.5rem)] md:max-w-[30rem]',
        'max-h-[62dvh] md:max-h-[74dvh] overflow-y-auto overscroll-contain',
        'px-5 py-5 sm:px-7 sm:py-6',
        'transition-[opacity,transform] duration-700 ease-travel motion-reduce:transition-none',
        side === 'left' ? 'md:mr-auto' : 'md:ml-auto',
        active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none',
      ].join(' ')}
      aria-hidden={!active}
    >
      <header className="mb-4">
        <div className="flex items-baseline justify-between gap-4">
          <span className="meta text-ice">{code}</span>
          <span className="meta meta-sm">Sector 09</span>
        </div>
        <div className="rule my-3" />
        <h2 id={`${id}-title`} className="font-display text-2xl sm:text-3xl text-white">
          {title}
        </h2>
      </header>
      {children}
    </section>
  )
}
