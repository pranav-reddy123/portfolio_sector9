import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, type Group, type MeshStandardMaterial } from 'three'
import { useFocusValue } from './TowerShell'

const COLUMN_HEIGHT = 66
const SPREAD = 9

/**
 * Kiln — the only tower with its structure on the outside. Four exposed columns, a
 * stack of tie rings, and a containment ring turning around a lit core: a building
 * that is visibly an experiment rather than an office.
 */
export function Tower03Lab() {
  const focus = useFocusValue()
  const ringRef = useRef<Group>(null)
  const coreRef = useRef<MeshStandardMaterial>(null)

  useFrame(({ clock }, delta) => {
    if (ringRef.current) {
      // The ring spins faster the closer the visitor gets — the lab reacting to arrival.
      ringRef.current.rotation.y += delta * (0.12 + focus.current * 0.55)
      ringRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.12
      ringRef.current.position.y = 44 + Math.sin(clock.elapsedTime * 0.6) * 1.6
    }
    if (coreRef.current) {
      const unstable = 0.75 + 0.25 * Math.sin(clock.elapsedTime * 7.3)
      coreRef.current.emissiveIntensity = MathUtils.lerp(1, 7, focus.current) * unstable
    }
  })

  const columns: [number, number][] = [
    [-SPREAD, -SPREAD],
    [SPREAD, -SPREAD],
    [-SPREAD, SPREAD],
    [SPREAD, SPREAD],
  ]

  return (
    <group>
      {columns.map(([x, z], index) => (
        <mesh key={index} position={[x, COLUMN_HEIGHT / 2, z]} castShadow>
          <boxGeometry args={[2.4, COLUMN_HEIGHT, 2.4]} />
          <meshStandardMaterial color="#141c2c" roughness={0.55} metalness={0.65} />
        </mesh>
      ))}

      {/* Tie rings every eight metres, thinning toward the top. */}
      {Array.from({ length: 7 }).map((_, index) => (
        <mesh key={`ring-${index}`} position={[0, 8 + index * 9, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[SPREAD * 1.5, 0.32, 6, 24]} />
          <meshStandardMaterial color="#141c2c" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* Lit core — the reason for the containment. */}
      <mesh position={[0, 30, 0]}>
        <cylinderGeometry args={[3.4, 3.4, 52, 12, 1, true]} />
        <meshStandardMaterial
          ref={coreRef}
          color="#12040c"
          emissive="#ff3d9a"
          emissiveIntensity={2}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Free-floating containment ring. */}
      <group ref={ringRef} position={[0, 44, 0]}>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[16, 0.5, 8, 48]} />
          <meshStandardMaterial
            color="#0b1220"
            emissive="#ff3d9a"
            emissiveIntensity={2.4}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Roof platform. */}
      <mesh position={[0, COLUMN_HEIGHT + 1, 0]} castShadow>
        <boxGeometry args={[SPREAD * 2.8, 2, SPREAD * 2.8]} />
        <meshStandardMaterial color="#0b1220" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  )
}
