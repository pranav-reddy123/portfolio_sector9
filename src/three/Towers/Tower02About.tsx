import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, MathUtils, type MeshStandardMaterial } from 'three'
import { useFocusValue } from './TowerShell'
import { attachFacadeAttributes } from '../shaders/windows'

const SIZE: [number, number, number] = [24, 74, 24]

/**
 * Origin — one unbroken monolith split by a single warm seam running its full height.
 * The quietest tower in the sector, and the only one lit from inside.
 */
export function Tower02About({ material }: { material: MeshStandardMaterial }) {
  const focus = useFocusValue()
  const seamRef = useRef<MeshStandardMaterial>(null)

  const geometry = useMemo(
    () => attachFacadeAttributes(new BoxGeometry(1, 1, 1), SIZE, 4.2),
    [],
  )

  useFrame(({ clock }) => {
    if (!seamRef.current) return
    const breath = 0.82 + 0.18 * Math.sin(clock.elapsedTime * 0.7)
    seamRef.current.emissiveIntensity = MathUtils.lerp(0.5, 3.2, focus.current) * breath
  })

  return (
    <group>
      <mesh
        geometry={geometry}
        material={material}
        position={[0, SIZE[1] / 2, 0]}
        scale={SIZE}
        castShadow
      />

      {/* The seam: a narrow slot of warm light from base to crown. */}
      <mesh position={[0, SIZE[1] / 2, SIZE[2] / 2 + 0.05]}>
        <boxGeometry args={[1.1, SIZE[1] * 0.86, 0.4]} />
        <meshStandardMaterial
          ref={seamRef}
          color="#1a1206"
          emissive="#ffb25c"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>

      {/* Crown cap, slightly wider, catching the seam light. */}
      <mesh position={[0, SIZE[1] + 1.4, 0]} castShadow>
        <boxGeometry args={[SIZE[0] * 1.12, 2.8, SIZE[2] * 1.12]} />
        <meshStandardMaterial color="#0b1220" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  )
}
