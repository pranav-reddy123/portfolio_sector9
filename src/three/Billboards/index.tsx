import { Billboard } from './Billboard'
import type { LabelLine } from '../shaders/labelTexture'

interface BillboardsProps {
  count: number
  activation: React.MutableRefObject<number>
}

const meta = (text: string, color = '#c9d6e4'): LabelLine => ({
  text,
  size: 28,
  color,
  font: 'mono',
  spacing: 6,
  opacity: 0.8,
})

const head = (text: string, color: string, size = 76): LabelLine => ({ text, size, color })

/**
 * The sector's advertising. Copy stays inside the fiction — services, routes and
 * operators — so the city reads as somewhere that runs rather than somewhere decorated.
 */
const ADS: {
  position: [number, number, number]
  rotation?: [number, number, number]
  size: [number, number]
  tint: string
  lines: LabelLine[]
}[] = [
  {
    position: [-74, 62, -46],
    rotation: [0, 0.42, 0],
    size: [24, 12],
    tint: '#56e9ff',
    lines: [meta('NEURAL SYSTEMS'), head('COMPUTE', '#ffffff'), meta('AI / EDGE / FUTURE', '#56e9ff')],
  },
  {
    position: [76, 70, -118],
    rotation: [0, -0.5, 0],
    size: [26, 13],
    tint: '#ff3d9a',
    lines: [meta('ORBITAL'), head('BUILD BEYOND', '#ffffff', 58), meta('LIFT WINDOW 04:20', '#ff3d9a')],
  },
  {
    position: [-78, 54, -206],
    rotation: [0, 0.55, 0],
    size: [22, 11],
    tint: '#ffb25c',
    lines: [meta('SECTOR 09 TRANSIT'), head('ROUTE 51', '#ffffff'), meta('ALL LANES NOMINAL', '#ffb25c')],
  },
  {
    position: [72, 76, -284],
    rotation: [0, -0.38, 0],
    size: [25, 12.5],
    tint: '#8f7bff',
    lines: [meta('PRANAV'), head('DIGITAL SYSTEMS', '#ffffff', 52), meta('OPERATOR · SECTOR 09', '#8f7bff')],
  },
  {
    position: [-70, 62, -358],
    rotation: [0, 0.3, 0],
    size: [21, 10.5],
    tint: '#56e9ff',
    lines: [meta('RELAY UPLINK'), head('OPEN', '#ffffff'), meta('AWAITING TRANSMISSION', '#56e9ff')],
  },
]

export function Billboards({ count, activation }: BillboardsProps) {
  return (
    <group>
      {ADS.slice(0, count).map((ad, index) => (
        <Billboard key={index} {...ad} seed={index * 3.7} activation={activation} />
      ))}
    </group>
  )
}
