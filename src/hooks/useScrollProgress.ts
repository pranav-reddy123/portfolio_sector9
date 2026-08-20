import { useCallback, useEffect, useRef } from 'react'
import { createScrollDriver, type ScrollDriver } from '../animation/scrollTimeline'
import { sectionAt, type SectionId } from '../data/towers'
import { store, travel } from './useStore'

/**
 * Owns the scroll driver's lifecycle and hands back a stable travel function for the
 * HUD to call. The driver itself is created once; React never sees scroll values.
 */
export function useScrollDriver(
  scrollerRef: React.RefObject<HTMLElement>,
  reducedMotion: boolean,
  enabled: boolean,
) {
  const driverRef = useRef<ScrollDriver | null>(null)

  useEffect(() => {
    if (!enabled || !scrollerRef.current) return
    const driver = createScrollDriver(scrollerRef.current, { reducedMotion })
    driverRef.current = driver
    return () => {
      driver.destroy()
      driverRef.current = null
    }
  }, [scrollerRef, reducedMotion, enabled])

  const travelTo = (id: SectionId | 'top') => driverRef.current?.travelTo(id)

  /**
   * Parks the experience at a point on the route without touching scroll. Used by the
   * dev route inspector so a frame can be captured mid-journey.
   */
  const previewRoute = useCallback((progress: number) => {
    travel.progress = progress
    travel.snap = true
    store.setSection(sectionAt(progress))
    store.setEntered(progress > 0.02)
  }, [])

  return { travelTo, previewRoute }
}
