import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, FrontSide, type ShaderMaterial } from 'three'
import { hologramFragment, hologramVertex } from '../shaders/hologram'
import { createLabelTexture, type LabelLine } from '../shaders/labelTexture'

export interface BillboardProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number]
  lines: LabelLine[]
  tint: string
  seed: number
  activation: React.MutableRefObject<number>
}

/** A projected advertisement. Text is baked once; the shader does the rest. */
export function Billboard({
  position,
  rotation = [0, 0, 0],
  size,
  lines,
  tint,
  seed,
  activation,
}: BillboardProps) {
  const materialRef = useRef<ShaderMaterial>(null)

  const texture = useMemo(
    () => createLabelTexture(lines, { width: 512, height: 256, align: 'left' }),
    [lines],
  )

  useEffect(() => () => texture.dispose(), [texture])

  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uTint: { value: new Color(tint) },
      uSeed: { value: seed },
    }),
    [texture, tint, seed],
  )

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = clock.elapsedTime
    materialRef.current.uniforms.uOpacity.value = activation.current * 0.85
  })

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={hologramVertex}
        fragmentShader={hologramFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        side={FrontSide}
        toneMapped={false}
      />
    </mesh>
  )
}
