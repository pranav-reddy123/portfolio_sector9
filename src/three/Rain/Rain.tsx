import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, MathUtils, Vector3, type ShaderMaterial } from 'three'
import { rainFragment, rainVertex } from '../shaders/rain'
import { travel } from '../../hooks/useStore'
import { sectionAt } from '../../data/towers'
import type { SectionId } from '../../data/towers'

interface RainProps {
  count: number
  activation: React.MutableRefObject<number>
  /** Reduced motion stops the storm rather than hiding it. */
  frozen?: boolean
}

const AREA = 190
const HEIGHT = 130

/** Weather is part of the storytelling: the Lab sits under the worst of it. */
const INTENSITY_BY_SECTION: Record<SectionId, number> = {
  intro: 0.35,
  work: 0.65,
  about: 0.5,
  lab: 1,
  contact: 0.4,
  outro: 0.25,
}

/**
 * One Points cloud for the entire storm. Positions never leave the GPU — the shader
 * wraps each drop inside a box that follows the camera.
 */
export function Rain({ count, activation, frozen = false }: RainProps) {
  const materialRef = useRef<ShaderMaterial>(null)
  const intensity = useRef(0.35)

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const speeds = new Float32Array(count)
    const lengths = new Float32Array(count)

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * AREA
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = (Math.random() - 0.5) * AREA
      seeds[i] = Math.random()
      speeds[i] = 42 + Math.random() * 46
      lengths[i] = 0.35 + Math.random() * 0.9
    }

    return { positions, seeds, speeds, lengths }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uSlant: { value: 0.5 },
      uOrigin: { value: new Vector3() },
      uArea: { value: AREA },
      uHeight: { value: HEIGHT },
      uColor: { value: new Color('#9fd4e8') },
    }),
    [],
  )

  useFrame(({ clock, camera }, delta) => {
    const material = materialRef.current
    if (!material) return

    const target = INTENSITY_BY_SECTION[sectionAt(travel.progress)]
    intensity.current = MathUtils.damp(intensity.current, target, 1.5, delta)

    if (!frozen) material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uIntensity.value = intensity.current * activation.current * (frozen ? 0.5 : 1)
    material.uniforms.uSlant.value = MathUtils.damp(
      material.uniforms.uSlant.value,
      0.42 + travel.velocity * 0.9,
      3,
      delta,
    )
    material.uniforms.uOrigin.value.copy(camera.position)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[geometry.seeds, 1]} />
        <bufferAttribute attach="attributes-aSpeed" args={[geometry.speeds, 1]} />
        <bufferAttribute attach="attributes-aLength" args={[geometry.lengths, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={rainVertex}
        fragmentShader={rainFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}
