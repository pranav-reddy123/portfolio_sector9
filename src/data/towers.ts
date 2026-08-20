export type SectionId = 'intro' | 'work' | 'about' | 'lab' | 'contact' | 'outro'

export interface TowerDef {
  /** Stable id, also the DOM section id and the URL hash. */
  id: SectionId
  /** Displayed as TOWER 01 … TOWER 04. */
  index: string
  /** Nav + heading label. */
  label: string
  /** The building's name in the city. Gives each tower an identity beyond its function. */
  callsign: string
  /** One line describing what the district does, used in the HUD. */
  role: string
  /** Where the scroll timeline parks the camera, 0..1. */
  progress: number
  /** World position of the tower base. */
  position: [number, number, number]
  /** Accent used for this district's neon + HUD state. */
  accent: 'ice' | 'signal' | 'sodium' | 'haze'
  /** Yaw, in radians, that turns the tower's sign to face the camera's dwell point. */
  signYaw: number
}

/**
 * The four towers are the navigation. Each has a distinct silhouette so it can be
 * recognised from across the city before its label is readable.
 */
/**
 * Towers stand at the avenue's edge, clear of the flight corridor. The camera runs
 * inside |x| < 24, so nothing on the route can ever end up inside a building.
 */
export const TOWERS: TowerDef[] = [
  {
    id: 'work',
    index: '01',
    label: 'Work',
    callsign: 'Foundry',
    role: 'Build & deploy',
    progress: 0.2,
    position: [-46, 0, -60],
    accent: 'ice',
    signYaw: 0.69,
  },
  {
    id: 'about',
    index: '02',
    label: 'About',
    callsign: 'Origin',
    role: 'Operator record',
    progress: 0.44,
    position: [44, 0, -150],
    accent: 'sodium',
    signYaw: -0.68,
  },
  {
    id: 'lab',
    index: '03',
    label: 'Lab',
    callsign: 'Kiln',
    role: 'Experimental',
    progress: 0.66,
    position: [-46, 0, -244],
    accent: 'signal',
    signYaw: 0.69,
  },
  {
    id: 'contact',
    index: '04',
    label: 'Contact',
    callsign: 'Relay',
    role: 'Uplink',
    progress: 0.87,
    position: [40, 0, -338],
    accent: 'haze',
    signYaw: -0.63,
  },
]

export const SECTION_ORDER: SectionId[] = ['intro', 'work', 'about', 'lab', 'contact', 'outro']

/** Scroll progress at which each section takes over. Drives HUD state and panel visibility. */
export const SECTION_RANGES: Record<SectionId, [number, number]> = {
  intro: [0, 0.12],
  work: [0.12, 0.33],
  about: [0.33, 0.55],
  lab: [0.55, 0.77],
  contact: [0.77, 0.95],
  outro: [0.95, 1],
}

export function sectionAt(progress: number): SectionId {
  for (const id of SECTION_ORDER) {
    const [start, end] = SECTION_RANGES[id]
    if (progress >= start && progress < end) return id
  }
  return 'outro'
}
