import { CubicBezierCurve3, Vector3 } from 'three'

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)

/**
 * Traffic lanes above the avenue. They are read as routes rather than roads: each one
 * runs corner to corner across the sector, well clear of the camera's own path.
 */
export const VEHICLE_ROUTES: CubicBezierCurve3[] = [
  new CubicBezierCurve3(v(-160, 58, 40), v(-60, 66, -80), v(60, 62, -160), v(150, 70, -300)),
  new CubicBezierCurve3(v(150, 44, 20), v(50, 52, -60), v(-40, 48, -180), v(-150, 56, -340)),
  new CubicBezierCurve3(v(-140, 88, -400), v(-40, 80, -260), v(50, 92, -120), v(140, 84, 30)),
  new CubicBezierCurve3(v(120, 34, -420), v(30, 40, -300), v(-40, 36, -200), v(-120, 42, -60)),
  new CubicBezierCurve3(v(-90, 108, 60), v(0, 112, -120), v(40, 104, -260), v(110, 116, -420)),
]
