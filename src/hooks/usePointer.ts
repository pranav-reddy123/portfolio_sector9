import { useEffect } from 'react'
import { travel } from './useStore'

/**
 * Writes normalised pointer position straight into the travel object. Deliberately
 * not React state — the camera reads it in useFrame.
 */
export function usePointerTracking(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const onMove = (event: PointerEvent) => {
      travel.pointerX = (event.clientX / window.innerWidth) * 2 - 1
      travel.pointerY = (event.clientY / window.innerHeight) * 2 - 1
    }
    const onLeave = () => {
      travel.pointerX = 0
      travel.pointerY = 0
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled])
}
