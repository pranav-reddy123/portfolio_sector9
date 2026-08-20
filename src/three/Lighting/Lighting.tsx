import { useMemo } from 'react'
import { TOWERS } from '../../data/towers'

const ACCENT_HEX: Record<string, string> = {
  ice: '#56e9ff',
  signal: '#ff3d9a',
  sodium: '#ffb25c',
  haze: '#6b4dff',
}

interface LightingProps {
  shadows: boolean
}

/**
 * Cinematic rather than physical: a cold ambient wash for the sky, one soft key so the
 * masses read, and a neon lamp at each tower so the signs actually spill onto the
 * street around them instead of glowing in a vacuum.
 */
export function Lighting({ shadows }: LightingProps) {
  const towerLights = useMemo(
    () =>
      TOWERS.map((tower) => ({
        id: tower.id,
        color: ACCENT_HEX[tower.accent],
        position: [tower.position[0], 24, tower.position[2]] as [number, number, number],
      })),
    [],
  )

  return (
    <>
      <hemisphereLight args={['#243b6b', '#05070c', 0.55]} />
      <ambientLight intensity={0.12} color="#6b4dff" />

      {/* Key light from high and behind, standing in for city glow off the cloud base. */}
      <directionalLight
        position={[-60, 120, 40]}
        intensity={0.5}
        color="#7f9bd6"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={20}
        shadow-camera-far={400}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
      />

      {towerLights.map((light) => (
        <pointLight
          key={light.id}
          position={light.position}
          color={light.color}
          intensity={220}
          distance={110}
          decay={2}
        />
      ))}

      {/* Warm street-level lamps: the one warm note in a cold palette. */}
      <pointLight position={[0, 8, -20]} color="#ffb25c" intensity={110} distance={70} decay={2} />
      <pointLight
        position={[0, 8, -190]}
        color="#ffb25c"
        intensity={110}
        distance={70}
        decay={2}
      />
      <pointLight
        position={[0, 8, -320]}
        color="#ffb25c"
        intensity={110}
        distance={70}
        decay={2}
      />
    </>
  )
}
