import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Color, FogExp2, MathUtils } from 'three'
import { InstancedBuildings, RoofBeacons } from './Buildings/InstancedBuildings'
import { Streets } from './City/Streets'
import { Lighting } from './Lighting/Lighting'
import { RigCamera } from './Camera/RigCamera'
import { Towers } from './Towers'
import { Rain } from './Rain/Rain'
import { Vehicles } from './Vehicles/Vehicles'
import { Billboards } from './Billboards'
import { Motes } from './Particles/Motes'
import { PostFX } from './Effects/PostFX'
import { store, travel } from '../hooks/useStore'
import { useSceneBudget } from '../hooks/usePerformance'

interface SceneProps {
  reducedMotion: boolean
  /** Phones get a different scene, not the desktop one scaled down. */
  mobile: boolean
  onSelectTower: (id: import('../data/towers').SectionId) => void
}

/**
 * Root of the WebGL graph. Mounted once for the whole visit — sections never unmount
 * it, they just change where the camera is and how bright the city gets.
 */
export function Scene({ reducedMotion, mobile, onSelectTower }: SceneProps) {
  const budget = useSceneBudget()
  const { scene } = useThree()

  /**
   * How "awake" the city is: 0 on the approach from altitude, 1 once the camera is in
   * the streets. Windows, rain and neon all read from it, so the city switches on as
   * one thing rather than in pieces.
   */
  const activation = useRef(reducedMotion ? 1 : 0.5)

  useEffect(() => {
    scene.fog = new FogExp2('#05070c', 0.0042)
    scene.background = new Color('#05070c')
    return () => {
      scene.fog = null
    }
  }, [scene])

  /**
   * Readiness is a real milestone, not a timer: the city is ready once it has actually
   * rendered a few frames, which is when shaders have compiled and the first pass is on
   * screen.
   */
  const framesRendered = useRef(0)

  useFrame((_, delta) => {
    if (framesRendered.current <= 3) {
      framesRendered.current += 1
      if (framesRendered.current === 2) store.setLoadProgress(0.85)
      if (framesRendered.current === 4) {
        store.setLoadProgress(1)
        store.setReady(true)
      }
    }

    // Never zero: the city is already running when the visitor arrives above it.
    const target = reducedMotion ? 1 : 0.5 + MathUtils.clamp(travel.progress / 0.09, 0, 1) * 0.5
    activation.current = MathUtils.damp(activation.current, target, 3, delta)

    // Fog thins as the camera drops into the streets, then thickens again for the Lab.
    const fog = scene.fog as FogExp2 | null
    if (fog) {
      const district = travel.progress
      // Thin enough at altitude to read the skyline, thicker once inside the streets,
      // and thicker again around the Lab where the weather turns.
      const density =
        0.0042 + MathUtils.clamp(district * 4, 0, 1) * 0.0016 + Math.max(0, district - 0.55) * 0.004
      fog.density = MathUtils.damp(fog.density, density, 2, delta)
    }
  })

  return (
    <>
      <RigCamera reducedMotion={reducedMotion} calm={mobile} />
      <Lighting shadows={budget.shadows} />
      <Streets reflections={budget.reflections && !mobile} activation={activation} />
      <InstancedBuildings count={mobile ? Math.min(46, budget.buildings) : budget.buildings} activation={activation} />
      <Towers onSelect={onSelectTower} activation={activation} />
      <Rain count={budget.rainCount} activation={activation} frozen={reducedMotion} />
      <Vehicles count={mobile ? Math.min(2, budget.vehicles) : budget.vehicles} frozen={reducedMotion} />
      <Billboards count={mobile ? Math.min(2, budget.billboards) : budget.billboards} activation={activation} />
      <Motes count={mobile ? 0 : budget.motes} activation={activation} />
      <PostFX level={mobile ? 'none' : budget.postFX} />
      <RoofBeacons count={Math.round(budget.buildings / 6)} />
    </>
  )
}
