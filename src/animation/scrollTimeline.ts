import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { store, travel } from '../hooks/useStore'
import { sectionAt, TOWERS, type SectionId } from '../data/towers'

gsap.registerPlugin(ScrollTrigger)

export interface ScrollDriver {
  travelTo: (id: SectionId | 'top') => void
  destroy: () => void
}

interface Options {
  /** Reduced motion swaps Lenis smoothing for native scrolling and kills the ease. */
  reducedMotion: boolean
}

/**
 * The single source of scroll truth. ScrollTrigger scrubs one tween of a plain object,
 * which writes into `travel`; nothing here touches React state except the district
 * change, which is guarded by identity in the store.
 */
export function createScrollDriver(scroller: HTMLElement, { reducedMotion }: Options): ScrollDriver {
  let lenis: Lenis | null = null
  let rafId = 0

  if (!reducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => {
      lenis?.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)
  }

  const state = { progress: 0 }

  const trigger = ScrollTrigger.create({
    trigger: scroller,
    start: 'top top',
    end: 'bottom bottom',
    scrub: reducedMotion ? true : 0.6,
    onUpdate: (self) => {
      state.progress = self.progress
      travel.progress = self.progress
      travel.velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 3000)
      store.setSection(sectionAt(self.progress))
      if (self.progress > 0.02) store.setEntered(true)
    },
  })

  function travelTo(id: SectionId | 'top') {
    const target = id === 'top' ? 0 : (TOWERS.find((t) => t.id === id)?.progress ?? 0)
    const max = ScrollTrigger.maxScroll(window)
    const destination = target * max
    if (lenis) {
      // Long, eased flights: arriving at a tower should feel like a landing, not a jump.
      lenis.scrollTo(destination, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 4) })
    } else {
      window.scrollTo({ top: destination, behavior: 'auto' })
    }
    if (id !== 'top') store.setEntered(true)
  }

  return {
    travelTo,
    destroy() {
      cancelAnimationFrame(rafId)
      trigger.kill()
      lenis?.destroy()
      lenis = null
    },
  }
}
