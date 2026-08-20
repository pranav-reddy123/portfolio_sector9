import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, MathUtils, type Group, type MeshStandardMaterial } from 'three'
import { useFocusValue } from './TowerShell'
import { attachFacadeAttributes } from '../shaders/windows'

const BASE: [number, number, number] = [28, 46, 26]

/**
 * Relay — a squat base carrying a tapered mast, three dishes aimed down the avenue, and
 * a beacon at the top that keeps transmitting whether or not anyone is listening.
 */
export function Tower04Contact({ material }: { material: MeshStandardMaterial }) {
  const focus = useFocusValue()
  const beaconRef = useRef<MeshStandardMaterial>(null)
  const dishRef = useRef<Group>(null)

  const geometry = useMemo(() => attachFacadeAttributes(new BoxGeometry(1, 1, 1), BASE, 9.1), [])

  useFrame(({ clock }, delta) => {
    if (beaconRef.current) {
      // Slow sweep, like a lighthouse rather than a strobe.
      const sweep = Math.pow(0.5 + 0.5 * Math.sin(clock.elapsedTime * 1.1), 3)
      beaconRef.current.emissiveIntensity = MathUtils.lerp(1.5, 9, focus.current) * (0.3 + sweep)
    }
    if (dishRef.current) dishRef.current.rotation.y += delta * 0.06
  })

  return (
    <group>
      <mesh
        geometry={geometry}
        material={material}
        position={[0, BASE[1] / 2, 0]}
        scale={BASE}
        castShadow
      />

      {/* Lit collar where the mast meets the base. */}
      <mesh position={[0, BASE[1] + 1.2, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[BASE[0] * 0.62, 0.5, 6, 28]} />
        <meshStandardMaterial
          color="#0d0a20"
          emissive="#8f7bff"
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>

      {/* Tapered mast. */}
      <mesh position={[0, BASE[1] + 19, 0]} castShadow>
        <cylinderGeometry args={[1.2, 5, 38, 8]} />
        <meshStandardMaterial color="#131b2b" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Dish array, slowly re-aiming. */}
      <group ref={dishRef} position={[0, BASE[1] + 8, 0]}>
        {[0, 2.1, 4.2].map((angle, index) => (
          <mesh
            key={index}
            position={[Math.cos(angle) * 7, index * 5, Math.sin(angle) * 7]}
            rotation={[Math.PI / 2.6, angle, 0]}
          >
            <sphereGeometry args={[3.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2.6]} />
            <meshStandardMaterial
              color="#1b2334"
              roughness={0.35}
              metalness={0.8}
              side={2}
            />
          </mesh>
        ))}
      </group>

      {/* Beacon. */}
      <mesh position={[0, BASE[1] + 39, 0]}>
        <sphereGeometry args={[1.6, 12, 10]} />
        <meshStandardMaterial
          ref={beaconRef}
          color="#0d0a20"
          emissive="#8f7bff"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* Guy wires, three sides, catching a little of the beacon. */}
      {[0, 2.09, 4.19].map((angle, index) => (
        <mesh
          key={`wire-${index}`}
          position={[Math.cos(angle) * 8, BASE[1] + 8, Math.sin(angle) * 8]}
          rotation={[0, -angle, Math.PI / 8]}
        >
          <cylinderGeometry args={[0.12, 0.12, 34, 3]} />
          <meshStandardMaterial color="#2a3348" roughness={0.6} metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}
