import { useMemo } from 'react'
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Noise,
  SMAA,
  Vignette,
} from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import { Vector2 } from 'three'
import type { SceneBudget } from '../../hooks/usePerformance'

interface PostFXProps {
  level: SceneBudget['postFX']
}

/**
 * Restrained by design. Bloom sits at a high threshold so only genuine emitters glow,
 * and there is no depth of field — the fog carries depth, and DOF here reads as blur
 * rather than cinema.
 */
export function PostFX({ level }: PostFXProps) {
  const offset = useMemo(() => new Vector2(0.00042, 0.00052), [])

  if (level === 'none') return null

  if (level === 'basic') {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.7}
          luminanceThreshold={0.62}
          luminanceSmoothing={0.24}
          kernelSize={KernelSize.MEDIUM}
          mipmapBlur
        />
        <Vignette offset={0.28} darkness={0.72} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.95}
        luminanceThreshold={0.58}
        luminanceSmoothing={0.2}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />
      <ChromaticAberration offset={offset} radialModulation modulationOffset={0.35} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.32} />
      <Vignette offset={0.24} darkness={0.78} blendFunction={BlendFunction.NORMAL} />
      <SMAA />
    </EffectComposer>
  )
}
