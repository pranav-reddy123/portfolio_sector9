import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BoxGeometry, MathUtils, type MeshStandardMaterial } from 'three'
import { useFocusValue } from './TowerShell'
import { attachFacadeAttributes } from '../shaders/windows'

const PLATES = [
  { size: [26, 14, 22] as const, y: 7, rot: 0, x: 0, z: 0 },
  { size: [22, 13, 26] as const, y: 20.5, rot: 0.22, x: -3.5, z: 2 },
  { size: [24, 12, 20] as const, y: 33, rot: -0.16, x: 3, z: -2.5 },
  { size: [18, 15, 22] as const, y: 45.5, rot: 0.34, x: -2.5, z: 3 },
  { size: [14, 18, 16] as const, y: 62, rot: -0.1, x: 2, z: -1.5 },
]

/**
 * Foundry — a build pipeline made architectural: five plates stacked out of alignment,
 * with a lit seam between each one, like stages passing work upward.
 */
export function Tower01Work({ material }: { material: MeshStandardMaterial }) {
  const focus = useFocusValue()
  const seamRef = useRef<MeshStandardMaterial>(null)

  const geometries = useMemo(
    () =>
      PLATES.map((plate, index) => {
        const geometry = new BoxGeometry(1, 1, 1)
        return attachFacadeAttributes(geometry, [...plate.size] as [number, number, number], index * 13.7)
      }),
    [],
  )

  useFrame(({ clock }) => {
    if (!seamRef.current) return
    // Seams pulse upward through the stack, so the tower reads as processing something.
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 1.4)
    seamRef.current.emissiveIntensity = MathUtils.lerp(0.5, 5.5, focus.current) * (0.7 + 0.3 * pulse)
  })

  return (
    <group>
      {PLATES.map((plate, index) => (
        <group key={index} position={[plate.x, plate.y, plate.z]} rotation={[0, plate.rot, 0]}>
          <mesh
            geometry={geometries[index]}
            material={material}
            scale={[plate.size[0], plate.size[1], plate.size[2]]}
            castShadow
          />
          {/* Corner strips define the plate's edge against the fog. */}
          {[
            [plate.size[0] / 2, plate.size[2] / 2],
            [-plate.size[0] / 2, plate.size[2] / 2],
          ].map(([cx, cz], corner) => (
            <mesh key={corner} position={[cx, 0, cz]}>
              <boxGeometry args={[0.22, plate.size[1] * 0.78, 0.22]} />
              <meshStandardMaterial
                color="#06101c"
                emissive="#56e9ff"
                emissiveIntensity={0.45}
                toneMapped={false}
              />
            </mesh>
          ))}

          {/* Seam light sitting in the gap under each plate. */}
          <mesh position={[0, -plate.size[1] / 2 - 0.4, 0]}>
            <boxGeometry args={[plate.size[0] * 0.94, 0.5, plate.size[2] * 0.94]} />
            <meshStandardMaterial
              ref={index === 0 ? seamRef : undefined}
              color="#0b1220"
              emissive="#56e9ff"
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
