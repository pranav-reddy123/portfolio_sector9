import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Euler, MathUtils, Quaternion, Vector3 } from 'three'
import { remapTravel, sampleCamera, STILL_VIEWS } from '../../animation/cameraPath'
import { store, travel } from '../../hooks/useStore'

interface RigCameraProps {
  reducedMotion: boolean
  /** Phones fly the same route with the turns and banking taken out. */
  calm?: boolean
}

const _position = new Vector3()
const _target = new Vector3()
const _look = new Vector3()
const _quat = new Quaternion()
const _euler = new Euler()

/**
 * Drives the default camera from the authored path. Reads the scroll value out of the
 * mutable travel object, so this runs every frame without React knowing anything about it.
 */
export function RigCamera({ reducedMotion, calm = false }: RigCameraProps) {
  const roll = useRef(0)

  useFrame(({ camera }, delta) => {
    const damp = 1 - Math.pow(0.0015, delta)

    if (reducedMotion) {
      // No flight. Compose a still frame per district and cross-fade between them.
      const view = STILL_VIEWS[store.getState().section] ?? STILL_VIEWS.intro
      _position.set(...view.position)
      _target.set(...view.target)
      camera.position.lerp(_position, Math.min(1, delta * 1.6))
      _look.lerp(_target, Math.min(1, delta * 1.6))
      camera.lookAt(_look)
      return
    }

    // Scroll is linear; the flight is not. The dwell mapping happens here.
    travel.eased = remapTravel(travel.progress)
    const sample = sampleCamera(travel.eased)
    _position.copy(sample.position)
    _target.copy(sample.target)

    // Pointer parallax: enough to make the city feel handheld, not enough to notice.
    const parallax = calm ? 0.35 : 1
    _position.x += travel.pointerX * 1.6 * parallax
    _position.y += -travel.pointerY * 1.1 * parallax

    if (travel.snap) {
      // Arrive immediately: used by direct navigation and the dev route inspector.
      camera.position.copy(_position)
      _look.copy(_target)
      travel.snap = false
    } else {
      camera.position.lerp(_position, damp)
      _look.lerp(_target, damp)
    }
    camera.lookAt(_look)

    // Bank into turns, plus a hint of lean from scroll velocity. Rotation is what makes
    // a phone screen uncomfortable, so the calm variant leaves it out.
    const targetRoll = calm ? 0 : sample.roll + travel.velocity * 0.012
    roll.current = MathUtils.lerp(roll.current, targetRoll, Math.min(1, delta * 3))
    _euler.set(0, 0, roll.current)
    _quat.setFromEuler(_euler)
    camera.quaternion.multiply(_quat)
  })

  return null
}
