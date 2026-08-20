export const streetVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * The wet-street pass: neon smeared down the asphalt, puddles that catch it, and lane
 * markings. Additive over the road so it costs one transparent quad, not a reflection
 * probe — real reflections are reserved for the top quality tier only.
 */
export const streetFragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uWet;
  uniform vec3 uIce;
  uniform vec3 uSignal;
  uniform vec3 uSodium;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    // vUv.y runs along the avenue, vUv.x across it.
    float across = vUv.x * 2.0 - 1.0;

    // Kerb-side neon spill: two soft bands hugging the building line.
    float leftSpill = smoothstep(0.34, 0.0, abs(across + 0.62));
    float rightSpill = smoothstep(0.34, 0.0, abs(across - 0.62));

    // Vertical streaks, stretched along the avenue like reflections on wet tarmac.
    float streak = noise(vec2(across * 26.0, vUv.y * 6.0 - uTime * 0.02));
    streak = pow(streak, 2.4);

    // Puddles: slow, broad noise that only catches light where it is above threshold.
    float puddle = noise(vec2(across * 5.0, vUv.y * 40.0));
    puddle = smoothstep(0.56, 0.9, puddle);
    float ripple = 0.5 + 0.5 * sin(uTime * 1.6 + puddle * 24.0 + vUv.y * 180.0);

    vec3 color = vec3(0.0);
    color += uIce * leftSpill * streak * 0.85;
    color += uSignal * rightSpill * streak * 0.55;
    color += uSodium * puddle * (0.25 + 0.35 * ripple) * streak;

    // Centre line, dashed, fading with distance down the avenue.
    float dash = step(0.62, fract(vUv.y * 220.0));
    float centre = smoothstep(0.012, 0.0, abs(across)) * dash;
    color += uSodium * centre * 0.4;

    float alpha = clamp(length(color) * uWet, 0.0, 1.0);
    gl_FragColor = vec4(color * uWet, alpha);
    #include <colorspace_fragment>
  }
`
