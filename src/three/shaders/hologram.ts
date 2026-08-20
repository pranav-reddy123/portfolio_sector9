export const hologramVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * Billboard surface treatment: scanlines, a slow roll, occasional dropout, and a small
 * chroma split. Kept subtle on purpose — the effect should read as a projection with a
 * fault, not as a glitch filter.
 */
export const hologramFragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uTint;
  uniform float uSeed;

  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vec2 uv = vUv;

    // Horizontal tear: a narrow band that slips sideways every few seconds.
    float tearBand = step(0.97, hash(floor(uTime * 2.0 + uSeed) + floor(uv.y * 14.0)));
    uv.x += tearBand * (hash(floor(uTime * 6.0) + uSeed) - 0.5) * 0.05;

    // Chroma split, a fraction of a texel.
    float split = 0.0016 + tearBand * 0.004;
    float r = texture2D(uMap, uv + vec2(split, 0.0)).r;
    vec4 g = texture2D(uMap, uv);
    float b = texture2D(uMap, uv - vec2(split, 0.0)).b;
    vec3 color = vec3(r, g.g, b) * uTint;

    // Scanlines plus a slow vertical roll.
    float scan = 0.82 + 0.18 * sin((uv.y + uTime * 0.06) * 620.0);
    float roll = 0.94 + 0.06 * sin((uv.y - uTime * 0.22) * 6.2831);

    // Projection falls off toward the edges of the panel.
    float edge = smoothstep(0.0, 0.08, uv.x) * smoothstep(1.0, 0.92, uv.x) *
                 smoothstep(0.0, 0.06, uv.y) * smoothstep(1.0, 0.94, uv.y);

    // Rare full-panel dropout.
    float dropout = step(0.994, hash(floor(uTime * 3.0 + uSeed * 7.0)));

    float alpha = g.a * uOpacity * scan * roll * edge * (1.0 - dropout * 0.75);
    if (alpha < 0.004) discard;

    gl_FragColor = vec4(color * scan * roll, alpha);
    #include <colorspace_fragment>
  }
`
