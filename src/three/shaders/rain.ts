export const rainVertex = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uSlant;
  uniform vec3 uOrigin;
  uniform float uArea;
  uniform float uHeight;

  attribute float aSeed;
  attribute float aSpeed;
  attribute float aLength;

  varying float vAlpha;
  varying float vLength;

  void main() {
    // Each drop lives in a box that travels with the camera, wrapping as it falls, so
    // a few thousand points cover the whole city.
    float fall = mod(uTime * aSpeed + aSeed * uHeight, uHeight);
    vec3 pos = position;
    pos.x = mod(pos.x + uOrigin.x + uArea * 0.5, uArea) - uArea * 0.5 + uOrigin.x;
    pos.z = mod(pos.z + uOrigin.z + uArea * 0.5, uArea) - uArea * 0.5 + uOrigin.z;
    pos.y = uOrigin.y + uHeight * 0.5 - fall;

    // Wind pushes the whole column sideways; scroll velocity adds to it.
    pos.x += fall * uSlant * 0.16;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float dist = -mvPosition.z;
    gl_PointSize = clamp((aLength * 900.0) / dist, 1.5, 16.0);

    // Drops fade in the distance and out at the very bottom of the column.
    float depthFade = smoothstep(280.0, 26.0, dist);
    float groundFade = smoothstep(0.0, 0.12, fall / uHeight);
    vAlpha = depthFade * groundFade * uIntensity;
    vLength = aLength;
  }
`

export const rainFragment = /* glsl */ `
  precision mediump float;

  uniform vec3 uColor;
  varying float vAlpha;
  varying float vLength;

  void main() {
    // A narrow vertical band down the sprite, soft at both ends: one falling streak.
    vec2 uv = gl_PointCoord - 0.5;
    float core = smoothstep(0.16, 0.0, abs(uv.x));
    float ends = smoothstep(0.5, 0.22, abs(uv.y));
    float streak = core * ends;
    float alpha = streak * vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor * (0.6 + vLength * 0.6), alpha);
  }
`
