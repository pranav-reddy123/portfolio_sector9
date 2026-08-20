import { useSyncExternalStore } from 'react'
import type { SectionId } from '../data/towers'

export type Quality = 'high' | 'medium' | 'low'

export interface AppState {
  /** Which district the camera is in. The only scroll-derived value allowed into React. */
  section: SectionId
  /** True once the intro is dismissed and travel begins. */
  entered: boolean
  /** Real asset/scene readiness, 0..1. */
  loadProgress: number
  ready: boolean
  quality: Quality
  hoveredTower: SectionId | null
  /** Set when WebGL is unavailable or the context is lost. */
  webglFailed: boolean
}

type Listener = () => void

const initial: AppState = {
  section: 'intro',
  entered: false,
  loadProgress: 0,
  ready: false,
  quality: 'high',
  hoveredTower: null,
  webglFailed: false,
}

let state: AppState = initial
const listeners = new Set<Listener>()

function setState(patch: Partial<AppState>) {
  let changed = false
  for (const key of Object.keys(patch) as (keyof AppState)[]) {
    if (state[key] !== patch[key]) {
      changed = true
      break
    }
  }
  // Guard on identity: the scroll loop calls setSection every frame and must not
  // re-render React unless the district actually changed.
  if (!changed) return
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const store = {
  getState: () => state,
  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setSection: (section: SectionId) => setState({ section }),
  setEntered: (entered: boolean) => setState({ entered }),
  setLoadProgress: (loadProgress: number) => setState({ loadProgress }),
  setReady: (ready: boolean) => setState({ ready }),
  setQuality: (quality: Quality) => setState({ quality }),
  setHoveredTower: (hoveredTower: SectionId | null) => setState({ hoveredTower }),
  setWebglFailed: (webglFailed: boolean) => setState({ webglFailed }),
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(initial),
  )
}

/**
 * Scroll progress lives outside React entirely. ScrollTrigger writes it, useFrame
 * reads it, and no component re-renders in between.
 */
export const travel = {
  /** 0..1 across the whole journey. */
  progress: 0,
  /** Remapped 0..1 along the flight path, written by the camera rig each frame. */
  eased: 0,
  /** Scroll velocity, -1..1, drives rain slant and vehicle blur. */
  velocity: 0,
  /** Normalised pointer position, -1..1. */
  pointerX: 0,
  pointerY: 0,
  /** Live frame rate, sampled by the quality manager and shown in the HUD. */
  fps: 60,
  /** Set for one frame to place the camera without easing (nav jumps, dev preview). */
  snap: false,
}
