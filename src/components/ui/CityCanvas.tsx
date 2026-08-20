import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { Scene } from '../../three/Scene'
import { detectProfile } from '../../hooks/usePerformance'
import { store } from '../../hooks/useStore'
import type { SectionId } from '../../data/towers'

interface CityCanvasProps {
  reducedMotion: boolean
  onSelectTower: (id: SectionId) => void
}

/**
 * The single Canvas. Mounted once by App and never remounted, so the city keeps running
 * while the DOM sections change around it.
 */
export function CityCanvas({ reducedMotion, onSelectTower }: CityCanvasProps) {
  const profile = useMemo(detectProfile, [])

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={profile.dpr}
        gl={{
          antialias: profile.quality === 'high',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
        camera={{ fov: 52, near: 0.5, far: 900, position: [14, 168, 150] }}
        onCreated={({ gl }) => {
          store.setLoadProgress(0.6)
          gl.toneMapping = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            store.setWebglFailed(true)
          })
        }}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <Scene reducedMotion={reducedMotion} mobile={profile.isMobile} onSelectTower={onSelectTower} />
        </Suspense>
      </Canvas>
    </div>
  )
}
