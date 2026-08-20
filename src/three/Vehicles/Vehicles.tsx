import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Object3D, Quaternion, Vector3, type InstancedMesh } from 'three'
import { VEHICLE_ROUTES } from './paths'
import { createGlowTexture } from '../shaders/glowTexture'

interface VehiclesProps {
  count: number
  /** Reduced motion parks the traffic mid-route instead of removing it. */
  frozen?: boolean
}

const _position = new Vector3()
const _ahead = new Vector3()
const _direction = new Vector3()
const _quaternion = new Quaternion()
const _dummy = new Object3D()
const FORWARD = new Vector3(0, 0, 1)

/**
 * Distant traffic. Small, slow, and never in the way — environmental storytelling that
 * costs two instanced meshes: the hulls and their headlight glows.
 */
export function Vehicles({ count, frozen = false }: VehiclesProps) {
  const hulls = useRef<InstancedMesh>(null)
  const lights = useRef<InstancedMesh>(null)
  const glow = useMemo(() => createGlowTexture(64), [])

  const craft = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        route: VEHICLE_ROUTES[index % VEHICLE_ROUTES.length],
        offset: (index * 0.37) % 1,
        speed: 0.008 + (index % 3) * 0.0035,
        scale: 0.6 + ((index * 7) % 5) * 0.16,
      })),
    [count],
  )

  useLayoutEffect(() => {
    if (hulls.current) hulls.current.instanceMatrix.needsUpdate = true
  }, [craft])

  useFrame(({ clock, camera }) => {
    const dummy = _dummy
    const time = frozen ? 0 : clock.elapsedTime

    craft.forEach((vehicle, index) => {
      const t = (vehicle.offset + time * vehicle.speed) % 1
      vehicle.route.getPointAt(t, _position)
      vehicle.route.getPointAt(Math.min(0.999, t + 0.01), _ahead)
      _direction.subVectors(_ahead, _position).normalize()

      dummy.position.copy(_position)
      _quaternion.setFromUnitVectors(FORWARD, _direction)
      dummy.quaternion.copy(_quaternion)
      dummy.scale.setScalar(vehicle.scale)
      dummy.updateMatrix()
      hulls.current?.setMatrixAt(index, dummy.matrix)

      // Headlight glow rides a little ahead of the hull.
      dummy.position.copy(_position).addScaledVector(_direction, 2.4)
      dummy.lookAt(camera.position)
      dummy.scale.setScalar(vehicle.scale * 7)
      dummy.updateMatrix()
      lights.current?.setMatrixAt(index, dummy.matrix)
    })

    if (hulls.current) hulls.current.instanceMatrix.needsUpdate = true
    if (lights.current) lights.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={hulls} args={[undefined, undefined, Math.max(1, count)]} frustumCulled={false}>
        {/* A stretched wedge — enough silhouette at this distance, six triangles of cost. */}
        <boxGeometry args={[1.1, 0.5, 4.2]} />
        <meshStandardMaterial
          color="#0d1420"
          emissive="#56e9ff"
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.6}
        />
      </instancedMesh>

      <instancedMesh ref={lights} args={[undefined, undefined, Math.max(1, count)]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glow}
          color="#ffd9a8"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  )
}
