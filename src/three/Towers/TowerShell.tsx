import { createContext, useContext, useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, FrontSide, MathUtils, type Mesh } from 'three'
import { store, travel } from '../../hooks/useStore'
import type { TowerDef } from '../../data/towers'
import { createLabelTexture } from '../shaders/labelTexture'
import { createGlowTexture } from '../shaders/glowTexture'

export const ACCENT_HEX: Record<TowerDef['accent'], string> = {
  ice: '#56e9ff',
  signal: '#ff3d9a',
  sodium: '#ffb25c',
  haze: '#8f7bff',
}

/**
 * How focused this tower is, 0..1. Proximity along the route does most of the work;
 * hovering or keyboard-focusing its HUD node lifts it the rest of the way. Kept in a ref
 * because it changes every frame.
 */
export function useTowerFocus(tower: TowerDef) {
  const focus = useRef(0)

  useFrame((_, delta) => {
    const distance = Math.abs(travel.progress - tower.progress)
    const proximity = MathUtils.clamp(1 - distance / 0.16, 0, 1)
    const hovered = store.getState().hoveredTower === tower.id ? 1 : 0
    const target = Math.max(proximity, hovered * 0.85)
    focus.current = MathUtils.damp(focus.current, target, 4, delta)
  })

  return focus
}

/** Lets a tower's own geometry read the focus value the shell already computes. */
const TowerFocusContext = createContext<MutableRefObject<number> | null>(null)

export function useFocusValue(): MutableRefObject<number> {
  const focus = useContext(TowerFocusContext)
  if (!focus) throw new Error('Tower geometry must be rendered inside a TowerShell')
  return focus
}

interface TowerShellProps {
  tower: TowerDef
  onSelect: (tower: TowerDef) => void
  /** Half-extents of the clickable volume around the tower. */
  hitbox: [number, number, number]
  labelHeight: number
  children: ReactNode
}

/**
 * Everything the four towers share: the click/hover volume, the neon sign, and the
 * pool of light the tower casts on the wet street beneath it.
 */
export function TowerShell({ tower, onSelect, hitbox, labelHeight, children }: TowerShellProps) {
  const focus = useTowerFocus(tower)
  const signRef = useRef<Mesh>(null)
  const poolRef = useRef<Mesh>(null)
  const accent = ACCENT_HEX[tower.accent]

  const glow = useMemo(() => createGlowTexture(), [])

  const texture = useMemo(
    () =>
      createLabelTexture(
        [
          { text: `TOWER ${tower.index}`, size: 34, color: accent, font: 'mono', spacing: 8 },
          { text: tower.label.toUpperCase(), size: 92, color: '#ffffff' },
          { text: tower.role.toUpperCase(), size: 26, color: '#c9d6e4', font: 'mono', spacing: 6, opacity: 0.75 },
        ],
        { width: 512, height: 256, align: 'center' },
      ),
    [tower, accent],
  )

  useEffect(() => {
    return () => {
      texture.dispose()
      glow.dispose()
    }
  }, [texture, glow])

  useFrame(({ clock }) => {
    const f = focus.current
    if (signRef.current) {
      const material = signRef.current.material as { opacity: number }
      // Neon strike: the sign flickers awake rather than fading up cleanly.
      const flicker = 0.9 + 0.1 * Math.sin(clock.elapsedTime * 9.0 + tower.progress * 40)
      material.opacity = MathUtils.clamp(f * 1.15, 0, 1) * flicker
    }
    if (poolRef.current) {
      const material = poolRef.current.material as { opacity: number }
      material.opacity = 0.14 + f * 0.34
    }
  })

  return (
    <group position={tower.position}>
      <TowerFocusContext.Provider value={focus}>{children}</TowerFocusContext.Provider>

      {/* Clickable volume — invisible, generous, and the reason the tower is navigation. */}
      {/* Fully transparent rather than `visible={false}`: invisible objects can be
          skipped by the raycaster, and this volume is what makes the tower clickable. */}
      <mesh
        position={[0, hitbox[1], 0]}
        onPointerOver={(event) => {
          event.stopPropagation()
          store.setHoveredTower(tower.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          store.setHoveredTower(null)
          document.body.style.cursor = ''
        }}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(tower)
        }}
      >
        <boxGeometry args={[hitbox[0] * 2, hitbox[1] * 2, hitbox[2] * 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Neon sign, turned to face the point on the route where the camera stops. */}
      <mesh
        ref={signRef}
        position={[
          Math.sin(tower.signYaw) * (hitbox[2] + 6),
          labelHeight,
          Math.cos(tower.signYaw) * (hitbox[2] + 6),
        ]}
        rotation={[0, tower.signYaw, 0]}
      >
        <planeGeometry args={[26, 13]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          side={FrontSide}
        />
      </mesh>

      {/* Light pooling on the street below. */}
      <mesh ref={poolRef} rotation-x={-Math.PI / 2} position={[0, 0.08, 0]}>
        <planeGeometry args={[hitbox[0] * 6, hitbox[2] * 6]} />
        <meshBasicMaterial
          map={glow}
          color={new Color(accent)}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
