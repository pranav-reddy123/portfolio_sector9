import type { SectionId } from './towers'

/**
 * The HUD ticker. Lines are district-specific so the console reads like it is
 * watching wherever the camera currently is.
 */
export const TELEMETRY: Record<SectionId, string[]> = {
  intro: [
    'SECTOR 09 · LINK ESTABLISHED',
    'ATMOS · PRECIP LIGHT · VIS 340M',
    'ROUTE 51 · 4 NODES ONLINE',
  ],
  work: [
    'FOUNDRY · BUILD QUEUE 4 · ALL GREEN',
    'HEALTH CHECK · 200 OK · 11MS',
    'AUTO-REMEDIATION · ARMED',
  ],
  about: [
    'ORIGIN · OPERATOR RECORD OPEN',
    'UPTIME · SINCE 2022 · NO GAPS',
    'CERT · SAA · AI PRACTITIONER',
  ],
  lab: [
    'KILN · 3 EXPERIMENTS RUNNING',
    'WARN · CONTAINMENT NOMINAL',
    'SHADER PASS · 0.9MS · 1 DRAW',
  ],
  contact: [
    'RELAY · DISH ALIGNED · LOCKED',
    'UPLINK · AWAITING TRANSMISSION',
    'LATENCY · 11MS TO OPERATOR',
  ],
  outro: ['SECTOR 09 · ROUTE COMPLETE', 'ALL NODES · NOMINAL', 'STANDING BY'],
}
