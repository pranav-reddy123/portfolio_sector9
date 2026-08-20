import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { TOWERS, type SectionId, type TowerDef } from '../../data/towers'
import { createCityMaterial } from '../shaders/windows'
import { TowerShell } from './TowerShell'
import { Tower01Work } from './Tower01Work'
import { Tower02About } from './Tower02About'
import { Tower03Lab } from './Tower03Lab'
import { Tower04Contact } from './Tower04Contact'

interface TowersProps {
  onSelect: (id: SectionId) => void
  activation: React.MutableRefObject<number>
}

const HITBOX: Record<SectionId, [number, number, number]> = {
  work: [15, 40, 14],
  about: [13, 38, 13],
  lab: [14, 34, 14],
  contact: [12, 38, 12],
  intro: [0, 0, 0],
  outro: [0, 0, 0],
}

const LABEL_HEIGHT: Record<string, number> = {
  work: 46,
  about: 58,
  lab: 58,
  contact: 56,
}

/** The four destinations. Each is a building first and a menu item second. */
export function Towers({ onSelect, activation }: TowersProps) {
  // Towers share the skyline's facade material so their windows match the city's.
  const material = useMemo(() => createCityMaterial({ color: '#0d1524', roughness: 0.7 }), [])

  useEffect(() => () => material.dispose(), [material])

  useFrame((state) => {
    const uniforms = material.userData.uniforms
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uWindowIntensity.value = activation.current * 1.0
  })

  const handleSelect = (tower: TowerDef) => onSelect(tower.id)

  return (
    <group>
      {TOWERS.map((tower) => (
        <TowerShell
          key={tower.id}
          tower={tower}
          onSelect={handleSelect}
          hitbox={HITBOX[tower.id]}
          labelHeight={LABEL_HEIGHT[tower.id]}
        >
          {tower.id === 'work' && <Tower01Work material={material} />}
          {tower.id === 'about' && <Tower02About material={material} />}
          {tower.id === 'lab' && <Tower03Lab />}
          {tower.id === 'contact' && <Tower04Contact material={material} />}
        </TowerShell>
      ))}
    </group>
  )
}
