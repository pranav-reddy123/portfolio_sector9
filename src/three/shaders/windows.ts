import { BufferAttribute, Color, MeshStandardMaterial, type BufferGeometry, type IUniform } from 'three'

/**
 * Windows are drawn in the fragment shader, not built from geometry. The whole skyline
 * is a handful of instanced boxes; this is what makes it breathe without draw calls.
 *
 * Injected into MeshStandardMaterial rather than replacing it, so the neon point lights
 * around the city still light these surfaces properly.
 */
const VERTEX_DECLARATIONS = /* glsl */ `
  attribute vec3 aSize;
  attribute float aSeed;
  varying vec3 vSize;
  varying float vSeed;
  varying vec3 vLocalPos;
  varying vec3 vLocalNormal;
`

const VERTEX_BODY = /* glsl */ `
  vSize = aSize;
  vSeed = aSeed;
  vLocalPos = position;
  vLocalNormal = normal;
`

const FRAGMENT_DECLARATIONS = /* glsl */ `
  uniform float uTime;
  uniform float uWindowIntensity;
  uniform vec3 uWarm;
  uniform vec3 uCool;
  varying vec3 vSize;
  varying float vSeed;
  varying vec3 vLocalPos;
  varying vec3 vLocalNormal;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
`

/**
 * Cell the facade into a window grid in local space so cells stay square whatever the
 * instance is scaled to. A per-cell hash decides lit/unlit, colour temperature, and
 * which handful of cells flicker on a slow cycle.
 */
const FRAGMENT_BODY = /* glsl */ `
  vec3 n = normalize(vLocalNormal);
  float facade = step(0.5, 1.0 - abs(n.y));

  // Local position is -0.5..0.5 on the unit box; scale back up to world units.
  vec2 facadeUv = abs(n.x) > 0.5
    ? vec2(vLocalPos.z * vSize.z, vLocalPos.y * vSize.y)
    : vec2(vLocalPos.x * vSize.x, vLocalPos.y * vSize.y);

  const float CELL_W = 1.85;
  const float CELL_H = 2.35;
  vec2 cell = floor(facadeUv / vec2(CELL_W, CELL_H));
  vec2 within = fract(facadeUv / vec2(CELL_W, CELL_H));

  // Window pane inside its cell, leaving a mullion of dark facade around it.
  float pane = step(0.22, within.x) * step(within.x, 0.66) *
               step(0.26, within.y) * step(within.y, 0.68);

  float r = hash21(cell + vSeed * 37.0);
  // Only about a third of any facade is occupied at this hour.
  float lit = step(0.66, r);

  // Floors read as floors: whole storeys go dark together on some bands.
  float floorHash = hash21(vec2(cell.y, vSeed * 11.0));
  lit *= step(0.18, floorHash);

  // A small share of cells breathe; a smaller share blinks off entirely.
  float breathe = 0.72 + 0.28 * sin(uTime * (0.4 + r) + r * 28.0);
  float blink = step(0.965, fract(r * 91.7 + floor(uTime * 0.18 + r * 10.0) * 0.37));
  lit *= mix(1.0, 0.0, blink);

  // Overwhelmingly sodium-warm, with the occasional cold office floor.
  vec3 windowColor = mix(uWarm, uCool, step(0.92, r));
  float amount = facade * pane * lit * breathe * uWindowIntensity;

  totalEmissiveRadiance += windowColor * amount;
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.55, facade * (1.0 - pane));
`

export interface WindowUniforms {
  uTime: IUniform<number>
  uWindowIntensity: IUniform<number>
  uWarm: IUniform<Color>
  uCool: IUniform<Color>
}

export interface CityMaterial extends MeshStandardMaterial {
  userData: { uniforms: WindowUniforms }
}

/** Builds the shared facade material. One instance covers the entire skyline. */
export function createCityMaterial(options?: { color?: string; roughness?: number }): CityMaterial {
  const material = new MeshStandardMaterial({
    color: options?.color ?? '#0b1220',
    roughness: options?.roughness ?? 0.82,
    metalness: 0.12,
  }) as CityMaterial

  const uniforms: WindowUniforms = {
    uTime: { value: 0 },
    uWindowIntensity: { value: 0 },
    uWarm: { value: new Color('#ffb25c') },
    uCool: { value: new Color('#56e9ff') },
  }
  material.userData.uniforms = uniforms

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_DECLARATIONS}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERTEX_BODY}`)

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_DECLARATIONS}`)
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>\n${FRAGMENT_BODY}`,
      )
  }

  return material
}

/**
 * Towers are single meshes rather than instances, so they need the same two attributes
 * the facade shader reads — constant across the geometry.
 */
export function attachFacadeAttributes(
  geometry: BufferGeometry,
  size: [number, number, number],
  seed: number,
) {
  const count = geometry.attributes.position.count
  const sizes = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  for (let i = 0; i < count; i += 1) {
    sizes[i * 3] = size[0]
    sizes[i * 3 + 1] = size[1]
    sizes[i * 3 + 2] = size[2]
    seeds[i] = seed
  }
  geometry.setAttribute('aSize', new BufferAttribute(sizes, 3))
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1))
  return geometry
}
