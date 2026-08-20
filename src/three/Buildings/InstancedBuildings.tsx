import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  Object3D,
  Vector3,
  type BufferGeometry,
} from 'three'
import { BUILDING_VARIANTS, seededRandom } from './buildingGeometry'
import { TOWERS } from '../../data/towers'
import { createCityMaterial } from '../shaders/windows'

interface InstancedBuildingsProps {
  count: number
  /** 0..1 — how lit the city is. Ramped up during the intro descent. */
  activation: React.MutableRefObject<number>
}

interface Placement {
  variant: number
  position: [number, number, number]
  size: [number, number, number]
  rotation: number
  seed: number
}

/** The avenue the camera travels down stays clear; blocks build outward from it. */
const AVENUE_HALF_WIDTH = 30
const CITY_DEPTH_START = 70
const CITY_DEPTH_END = -470

/** Each tower gets a clearing, so nothing generic grows in front of a destination. */
function inTowerClearing(x: number, z: number): boolean {
  return TOWERS.some(
    (tower) =>
      Math.abs(x - tower.position[0]) < 40 && Math.abs(z - tower.position[2]) < 62,
  )
}

function buildPlacements(count: number): Placement[] {
  const random = seededRandom(2609)
  const placements: Placement[] = []
  let guard = 0

  for (let i = 0; i < count && guard < count * 12; i += 1) {
    const side = i % 2 === 0 ? -1 : 1
    // Depth-first distribution: closer buildings are sparser so the canyon reads open.
    const depth = CITY_DEPTH_START + (CITY_DEPTH_END - CITY_DEPTH_START) * random()
    const lane = Math.floor(random() * 4)
    const x = side * (AVENUE_HALF_WIDTH + lane * 26 + random() * 16)
    const z = depth + (random() - 0.5) * 18

    if (inTowerClearing(x, z)) {
      guard += 1
      i -= 1
      continue
    }

    // Height falls off away from the avenue so the canyon walls read tallest.
    const proximity = 1 - Math.min(1, (Math.abs(x) - AVENUE_HALF_WIDTH) / 100)
    const height = 14 + random() * 34 + proximity * 26
    const width = 12 + random() * 12
    const depthSize = 12 + random() * 12

    placements.push({
      variant: Math.floor(random() * BUILDING_VARIANTS.length),
      position: [x, height / 2, z],
      size: [width, height, depthSize],
      rotation: (random() - 0.5) * 0.12,
      seed: random() * 100,
    })
  }
  return placements
}

/**
 * Every building in the sector is one of four instanced meshes — four draw calls for
 * the entire skyline, windows included.
 */
export function InstancedBuildings({ count, activation }: InstancedBuildingsProps) {
  const material = useMemo(() => createCityMaterial(), [])
  const meshes = useRef<(InstancedMesh | null)[]>([])

  const geometries = useMemo<BufferGeometry[]>(
    () => BUILDING_VARIANTS.map((make) => make()),
    [],
  )

  const groups = useMemo(() => {
    const placements = buildPlacements(count)
    return geometries.map((_, variant) => placements.filter((p) => p.variant === variant))
  }, [count, geometries])

  useLayoutEffect(() => {
    const dummy = new Object3D()
    const matrix = new Matrix4()

    groups.forEach((placements, variant) => {
      const mesh = meshes.current[variant]
      if (!mesh) return

      const sizes = new Float32Array(placements.length * 3)
      const seeds = new Float32Array(placements.length)

      placements.forEach((placement, index) => {
        dummy.position.set(...placement.position)
        dummy.rotation.set(0, placement.rotation, 0)
        dummy.scale.set(...placement.size)
        dummy.updateMatrix()
        matrix.copy(dummy.matrix)
        mesh.setMatrixAt(index, matrix)

        sizes.set(placement.size, index * 3)
        seeds[index] = placement.seed
      })

      mesh.geometry.setAttribute('aSize', new InstancedBufferAttribute(sizes, 3))
      mesh.geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 1))
      mesh.instanceMatrix.needsUpdate = true
      mesh.computeBoundingSphere()
    })
  }, [groups])

  useEffect(() => {
    return () => {
      material.dispose()
      geometries.forEach((geometry) => geometry.dispose())
    }
  }, [material, geometries])

  useFrame((state) => {
    const uniforms = material.userData.uniforms
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uWindowIntensity.value = activation.current * 1.15
  })

  return (
    <group>
      {groups.map((placements, variant) => (
        <instancedMesh
          key={variant}
          ref={(mesh) => {
            meshes.current[variant] = mesh
          }}
          args={[geometries[variant], material, Math.max(1, placements.length)]}
          frustumCulled
        />
      ))}
    </group>
  )
}

/** Aviation beacons on the tallest roofs — small, red, and slightly out of sync. */
export function RoofBeacons({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null)
  const positions = useMemo(() => {
    const random = seededRandom(7717)
    const out: Vector3[] = []
    for (let i = 0; i < count; i += 1) {
      const side = i % 2 === 0 ? -1 : 1
      out.push(
        new Vector3(
          side * (AVENUE_HALF_WIDTH + random() * 90),
          46 + random() * 52,
          CITY_DEPTH_START + (CITY_DEPTH_END - CITY_DEPTH_START) * random(),
        ),
      )
    }
    return out
  }, [count])

  useLayoutEffect(() => {
    const dummy = new Object3D()
    positions.forEach((position, index) => {
      dummy.position.copy(position)
      dummy.scale.setScalar(0.5)
      dummy.updateMatrix()
      mesh.current?.setMatrixAt(index, dummy.matrix)
    })
    if (mesh.current) mesh.current.instanceMatrix.needsUpdate = true
  }, [positions])

  useFrame(({ clock }) => {
    if (!mesh.current) return
    const material = mesh.current.material as { opacity: number }
    material.opacity = 0.35 + 0.65 * Math.abs(Math.sin(clock.elapsedTime * 1.1))
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, Math.max(1, count)]} frustumCulled>
      <sphereGeometry args={[1, 6, 5]} />
      <meshBasicMaterial color="#ff3d6a" transparent opacity={0.7} toneMapped={false} />
    </instancedMesh>
  )
}
