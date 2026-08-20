import { BoxGeometry, BufferGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

/**
 * Four silhouettes, all authored inside a unit cube so an instance's scale is also its
 * world size — which is exactly what the facade shader needs to keep windows square.
 */
function block(w: number, h: number, d: number, y: number, x = 0, z = 0): BoxGeometry {
  const geometry = new BoxGeometry(w, h, d)
  geometry.translate(x, y, z)
  return geometry
}

function unit(...parts: BoxGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false)
  parts.forEach((part) => part.dispose())
  merged.computeBoundingBox()
  return merged
}

/** Plain shaft — the background mass of the sector. */
const slab = () => unit(block(1, 1, 1, 0))

/** Setback tower: a wide base with a narrower crown. */
const setback = () =>
  unit(block(1, 0.66, 1, -0.17), block(0.62, 0.34, 0.62, 0.33))

/** Fin block: a flat slab with a service spine down one side. */
const fin = () =>
  unit(block(1, 1, 0.62, 0), block(0.18, 0.86, 0.16, -0.02, 0.58, 0))

/** Stepped stack — three decreasing plates. */
const stepped = () =>
  unit(
    block(1, 0.44, 1, -0.28),
    block(0.78, 0.34, 0.78, 0.09),
    block(0.5, 0.22, 0.5, 0.39),
  )

export const BUILDING_VARIANTS = [slab, setback, fin, stepped]

/** Deterministic PRNG so the city is identical on every load and across reloads. */
export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}
