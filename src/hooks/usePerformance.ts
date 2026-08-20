import { useEffect, useMemo } from 'react'
import { store, travel, useStore, type Quality } from './useStore'

export interface DeviceProfile {
  quality: Quality
  isMobile: boolean
  /** Device pixel ratio clamp handed to the Canvas. */
  dpr: [number, number]
}

function readRenderer(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null
    if (!gl) return ''
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return name.toLowerCase()
  } catch {
    return ''
  }
}

/**
 * Scored heuristic rather than a UA sniff: cores, memory, pointer type and the GPU
 * string each move the score, and the tier falls out of the total.
 */
export function detectProfile(): DeviceProfile {
  if (typeof window === 'undefined') return { quality: 'medium', isMobile: false, dpr: [1, 1.5] }

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < 768
  const isMobile = coarse && narrow

  const cores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const renderer = readRenderer()

  let score = 0
  score += cores >= 8 ? 2 : cores >= 4 ? 1 : 0
  score += memory >= 8 ? 2 : memory >= 4 ? 1 : 0
  score += isMobile ? -2 : 1
  if (/apple m\d/.test(renderer)) score += 2
  if (/(rtx|radeon rx|geforce)/.test(renderer)) score += 2
  if (/(swiftshader|llvmpipe|software)/.test(renderer)) score -= 5
  if (/(adreno|mali|powervr)/.test(renderer)) score -= 1

  const quality: Quality = score >= 5 ? 'high' : score >= 2 ? 'medium' : 'low'
  const dpr: [number, number] =
    quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.5] : [0.75, 1]

  return { quality, isMobile, dpr }
}

/**
 * Samples frame rate and drops one tier if the running average stays under target.
 * Hysteresis is one-way — it never upgrades mid-session, so the scene cannot oscillate.
 */
export function useQualityManager(enabled: boolean) {
  const quality = useStore((s) => s.quality)

  useEffect(() => {
    if (!enabled) return
    let frames = 0
    let last = performance.now()
    let strikes = 0
    let raf = 0

    const tick = () => {
      frames += 1
      const now = performance.now()
      const elapsed = now - last
      if (elapsed >= 1000) {
        const fps = (frames * 1000) / elapsed
        travel.fps = fps
        frames = 0
        last = now

        const current = store.getState().quality
        if (fps < 45 && current !== 'low') {
          strikes += 1
          if (strikes >= 3) {
            store.setQuality(current === 'high' ? 'medium' : 'low')
            strikes = 0
          }
        } else {
          strikes = 0
        }
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [enabled])

  return quality
}

export interface SceneBudget {
  buildings: number
  rainCount: number
  vehicles: number
  billboards: number
  motes: number
  reflections: boolean
  postFX: 'full' | 'basic' | 'none'
  shadows: boolean
}

const BUDGETS: Record<Quality, SceneBudget> = {
  high: {
    buildings: 132,
    rainCount: 4200,
    vehicles: 8,
    billboards: 5,
    motes: 900,
    reflections: true,
    postFX: 'full',
    shadows: true,
  },
  medium: {
    buildings: 84,
    rainCount: 2000,
    vehicles: 5,
    billboards: 4,
    motes: 450,
    reflections: false,
    postFX: 'basic',
    shadows: false,
  },
  low: {
    buildings: 40,
    rainCount: 700,
    vehicles: 2,
    billboards: 2,
    motes: 0,
    reflections: false,
    postFX: 'none',
    shadows: false,
  },
}

export function useSceneBudget(): SceneBudget {
  const quality = useStore((s) => s.quality)
  return useMemo(() => BUDGETS[quality], [quality])
}
