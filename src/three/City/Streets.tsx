import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import { AdditiveBlending, Color, DoubleSide, type ShaderMaterial } from 'three'
import { streetFragment, streetVertex } from '../shaders/street'

interface StreetsProps {
  reflections: boolean
  activation: React.MutableRefObject<number>
}

const ROAD_LENGTH = 600
const ROAD_WIDTH = 120
const ROAD_CENTRE_Z = -200

/**
 * Two passes: the asphalt itself, and an additive wet pass that carries the neon spill.
 * Real reflections only run on the top tier — everywhere else the wet pass carries it.
 */
export function Streets({ reflections, activation }: StreetsProps) {
  const wetRef = useRef<ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWet: { value: 0 },
      uIce: { value: new Color('#56e9ff') },
      uSignal: { value: new Color('#ff3d9a') },
      uSodium: { value: new Color('#ffb25c') },
    }),
    [],
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uWet.value = activation.current
    if (wetRef.current) wetRef.current.uniforms.uWet.value = activation.current
  })

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, ROAD_CENTRE_Z]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        {reflections ? (
          <MeshReflectorMaterial
            resolution={256}
            mixBlur={1.4}
            mixStrength={2.4}
            blur={[320, 90]}
            mirror={0.42}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            color="#05070c"
            metalness={0.86}
            roughness={0.42}
          />
        ) : (
          <meshStandardMaterial color="#05070c" metalness={0.8} roughness={0.34} />
        )}
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.04, ROAD_CENTRE_Z]}>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH]} />
        <shaderMaterial
          ref={wetRef}
          vertexShader={streetVertex}
          fragmentShader={streetFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
