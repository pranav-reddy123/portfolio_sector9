import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, type Points } from 'three'

interface MotesProps {
  count: number
  activation: React.MutableRefObject<number>
}

const SPREAD = 160
const CEILING = 90

/**
 * Airborne debris caught in the neon: slow, sparse, and drifting upward on the city's
 * own heat. Distinct from rain, which falls fast and straight.
 */
export function Motes({ count, activation }: MotesProps) {
  const points = useRef<Points>(null)

  const positions = useMemo(() => {
    const array = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * SPREAD
      array[i * 3 + 1] = Math.random() * CEILING
      array[i * 3 + 2] = (Math.random() - 0.5) * SPREAD
    }
    return array
  }, [count])

  useFrame(({ clock, camera }) => {
    if (!points.current) return
    points.current.position.set(camera.position.x, 0, camera.position.z)
    points.current.rotation.y = clock.elapsedTime * 0.014
    const material = points.current.material as { opacity: number }
    material.opacity = 0.34 * activation.current
  })

  if (count === 0) return null

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.32}
        sizeAttenuation
        color={new Color('#9fb6d6')}
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
