import { CatmullRomCurve3, Vector3 } from 'three'

/**
 * Two independent curves: where the camera is, and what it is aiming at. Because the
 * aim curve is authored separately, the camera turns corners and looks off-axis on its
 * own — no `position.y += scroll`, and no lookAt snapping when a tower goes past.
 */
const POSITION_POINTS: [number, number, number][] = [
  [10, 110, 150], // holding altitude above the sector
  [8, 74, 112],
  [4, 46, 76], // dropping between the outer blocks
  [2, 34, 56],
  [22, 24, 22], // dwell: Foundry, across the avenue and up
  [4, 24, -34],
  [-16, 26, -52], // crossing to the far kerb
  [-22, 26, -68], // dwell: Origin
  [-10, 24, -124],
  [8, 24, -146],
  [20, 22, -164], // dwell: Kiln
  [4, 24, -212],
  [-12, 24, -238],
  [-20, 24, -256], // dwell: Relay
  [-4, 34, -352],
  [16, 96, -420], // pulling up and out
  [18, 168, -486], // final view back across the sector
]

const TARGET_POINTS: [number, number, number][] = [
  [-2, 44, -70], // the avenue, seen the long way down
  [-6, 36, -80],
  [-12, 32, -70],
  [-30, 38, -62],
  [-28, 44, -60], // aims beside Foundry so the tower frames opposite its panel
  [-26, 30, -92],
  [26, 40, -136],
  [26, 46, -150], // aims beside Origin
  [14, 30, -200],
  [-26, 34, -234],
  [-28, 42, -244], // aims beside Kiln
  [-10, 28, -300],
  [24, 44, -330],
  [22, 50, -338], // aims beside Relay
  [8, 30, -390],
  [2, 40, -330],
  [-6, 30, -190], // looking back down the route
]

const toVec = (p: [number, number, number][]) => p.map(([x, y, z]) => new Vector3(x, y, z))

export const positionCurve = new CatmullRomCurve3(toVec(POSITION_POINTS), false, 'catmullrom', 0.4)
export const targetCurve = new CatmullRomCurve3(toVec(TARGET_POINTS), false, 'catmullrom', 0.4)

/**
 * CatmullRom curves are sampled by arc length, so a waypoint's index is not its `u`.
 * These are measured once at module load, which keeps the dwell points locked to the
 * towers no matter how the path is re-authored.
 */
const WAYPOINT_U: number[] = (() => {
  const divisions = 2000
  const lengths = positionCurve.getLengths(divisions)
  const total = lengths[divisions]
  const count = POSITION_POINTS.length
  return POSITION_POINTS.map((_, index) => {
    const t = index / (count - 1)
    return lengths[Math.round(t * divisions)] / total
  })
})()

/** Waypoint indices where the camera parks alongside a tower. */
const DWELL_INDICES = [4, 7, 10, 13]

/**
 * Scroll progress does not map linearly to curve position: the camera holds near each
 * tower (a small curve delta over a wide scroll range) and runs between them, which is
 * what makes arrivals feel like arrivals.
 */
const SPEED_KEYS: [scroll: number, curve: number][] = [
  [0, 0],
  [0.12, WAYPOINT_U[3]],
  [0.2, WAYPOINT_U[DWELL_INDICES[0]]],
  [0.33, WAYPOINT_U[5]],
  [0.44, WAYPOINT_U[DWELL_INDICES[1]]],
  [0.55, WAYPOINT_U[8]],
  [0.66, WAYPOINT_U[DWELL_INDICES[2]]],
  [0.77, WAYPOINT_U[11]],
  [0.87, WAYPOINT_U[DWELL_INDICES[3]]],
  [0.95, WAYPOINT_U[14]],
  [1, 1],
]

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Maps 0..1 scroll to 0..1 curve position with dwell zones at each tower. */
export function remapTravel(progress: number): number {
  const t = Math.min(1, Math.max(0, progress))
  for (let i = 0; i < SPEED_KEYS.length - 1; i += 1) {
    const [s0, c0] = SPEED_KEYS[i]
    const [s1, c1] = SPEED_KEYS[i + 1]
    if (t >= s0 && t <= s1) {
      const local = s1 === s0 ? 0 : (t - s0) / (s1 - s0)
      return c0 + (c1 - c0) * easeInOut(local)
    }
  }
  return 1
}

const _pos = new Vector3()
const _target = new Vector3()
const _ahead = new Vector3()

export interface CameraSample {
  position: Vector3
  target: Vector3
  /** Radians. Derived from how hard the path is turning, so corners bank. */
  roll: number
}

const sample: CameraSample = { position: _pos, target: _target, roll: 0 }

export function sampleCamera(curveT: number): CameraSample {
  const u = Math.min(0.9999, Math.max(0, curveT))

  // Both curves are sampled by the same raw t so waypoint N of the path always looks at
  // waypoint N of the aim curve, even though the two have different arc lengths.
  const t = positionCurve.getUtoTmapping(u, 0)
  positionCurve.getPoint(t, _pos)
  targetCurve.getPoint(t, _target)

  // Lateral change over a short lookahead approximates turn rate without a derivative.
  positionCurve.getPoint(Math.min(1, t + 0.004), _ahead)
  const turn = _ahead.x - _pos.x
  sample.roll = Math.max(-0.06, Math.min(0.06, -turn * 0.05))
  return sample
}

/** Static viewpoints used when the visitor asks for reduced motion. */
export const STILL_VIEWS: Record<string, { position: [number, number, number]; target: [number, number, number] }> = {
  intro: { position: [10, 110, 150], target: [-2, 44, -70] },
  work: { position: [22, 24, 22], target: [-28, 44, -60] },
  about: { position: [-22, 26, -68], target: [26, 46, -150] },
  lab: { position: [20, 22, -164], target: [-28, 42, -244] },
  contact: { position: [-20, 24, -256], target: [22, 50, -338] },
  outro: { position: [18, 168, -486], target: [-6, 30, -190] },
}
