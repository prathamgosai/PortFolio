/**
 * ═════════════════════════════════════════════════════════════════════════
 * THE CORE — the signature object.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Two previous passes at this scene were backdrops: a particle constellation,
 * then a contour terrain. Both were restrained on purpose, to protect body
 * copy — and both were correctly called flat, because a backdrop is by
 * definition something you do not look at. What makes the sites this is being
 * measured against feel expensive is not their background. It is that they have
 * ONE OBJECT you look at.
 *
 * So this is that object: a geodesic lattice shell around a displaced inner
 * body, lit by fresnel and shaded with a tuned iridescence.
 *
 * ── Iridescence, but on-palette ──
 * The usual thin-film shader cycles the full spectrum, which looks like a soap
 * bubble and would drop a rainbow into a site whose entire identity is amber on
 * ink. This one interpolates across the site's OWN tokens — `--accent` amber
 * through `--coral` (sampled from the portrait) to `--tech` cyan — driven by
 * the fresnel term. The result reads as an iridescent material while never
 * showing a colour the design system does not already own.
 *
 * ── Why fresnel does the heavy lifting ──
 * There are no lights in this scene. Fresnel — how grazing the viewing angle is
 * against the surface normal — gives edge-lit rim glow for free, which is what
 * makes a shape read as glass or energy rather than as flat plastic. It costs
 * one dot product and needs no light rig, no shadow map, and no environment
 * texture to download.
 */

export const CORE = {
  /** World radius. Sized to read as a hero element, not an ornament. */
  radius: 150,
  /**
   * Right and HIGH. The first placement sat at y=150 and the object landed
   * squarely on the metrics row, blotting out a statistic — a background that
   * eats content is worse than no background. This clears the text column on
   * the left and the metric row underneath.
   */
  position: [360, 265, -190] as const,
};

const NOISE3 = /* glsl */ `
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
             dot(p, vec3(269.5, 183.3, 246.1)),
             dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float snoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
              dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
          mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
              dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
      mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
              dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
          mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
              dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
      u.z);
  }
`;

/* ── Inner body ─────────────────────────────────────────────────────────── */

export const CORE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vDisp;
  ${NOISE3}

  void main() {
    // Breathe the surface with 3D noise so it is a living body rather than a
    // sphere. Two octaves is enough — the silhouette does the rest.
    float n = snoise(normal * 1.9 + vec3(0.0, 0.0, uTime * 0.22));
    n += 0.5 * snoise(normal * 4.1 - vec3(0.0, uTime * 0.16, 0.0));
    float disp = n * 0.16 * uPulse;

    vec3 p = position * (1.0 + disp);
    vDisp = disp;

    // Normal matrix keeps lighting correct under the object's own rotation.
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const CORE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uAccent;
  uniform vec3 uCoral;
  uniform vec3 uTech;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vDisp;

  void main() {
    // Fresnel: 0 facing the viewer, 1 at grazing angles. This one term is what
    // turns a solid shape into something that looks lit from within.
    float fres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0), 3.0);

    /**
     * Iridescence, weighted hard toward amber.
     *
     * The first version drove the whole ramp off fres * 1.35, which saturated
     * almost everywhere and rendered the object a flat cyan ball — the accent
     * colour never appeared at all. Cyan is now reserved for the extreme
     * grazing edge, so the object reads amber (the brand) with a coral mid-tone
     * and only a thin cool rim, which is what makes it look like a material
     * rather than a colour.
     */
    vec3 c = mix(uAccent, uCoral, smoothstep(0.18, 0.55, fres + vDisp * 0.5));
    c = mix(c, uTech, smoothstep(0.66, 0.96, fres));

    /**
     * Hollow. Alpha is driven almost entirely by fresnel, so the centre is
     * effectively invisible and only the rim glows. This is also what stops the
     * object obscuring anything behind it — you read text straight through the
     * middle of it.
     */
    float alpha = fres * 0.72 * uOpacity;
    gl_FragColor = vec4(c, alpha);
  }
`;

/* ── Lattice shell ──────────────────────────────────────────────────────── */

export const LATTICE_VERT = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  ${NOISE3}

  void main() {
    // Breathes on the same clock as the body but at a lower amplitude, so the
    // shell floats around it instead of clipping through it.
    float n = snoise(normalize(position) * 1.9 + vec3(0.0, 0.0, uTime * 0.22));
    vec3 p = position * (1.0 + n * 0.05);

    vNormal = normalize(normalMatrix * normalize(position));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const LATTICE_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float fres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0), 2.2);
    // Edges of the cage catch the accent; the front face stays near-neutral so
    // the shell never obscures the body glowing behind it.
    vec3 c = mix(uInk, uAccent, fres);
    gl_FragColor = vec4(c, (0.04 + fres * 0.4) * uOpacity);
  }
`;

/* ── Halo ───────────────────────────────────────────────────────────────── */

/**
 * A single camera-facing billboard behind the core, drawn as a radial falloff.
 *
 * This is the cheap stand-in for bloom, and it is deliberately not real
 * post-processing. A bloom pass means an EffectComposer, two render targets and
 * a full-screen blur every frame — a large, permanent cost on every device, to
 * light one object. One additive quad gets ~90% of the read for one draw call
 * and no extra buffers.
 *
 * It is what stops the object looking like a wireframe ball: a luminous body
 * spills light into the space around it, and without that spill the eye reads
 * the shape as line-art rather than as something glowing.
 */
export const HALO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const HALO_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uAccent;
  uniform vec3 uCoral;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5) * 2.0;
    // Two falloffs: a tight bright core and a wide soft spill. A single
    // smoothstep gives a flat disc with a visible edge; the sum reads as light.
    float inner = pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
    float outer = pow(1.0 - clamp(d, 0.0, 1.0), 1.6) * 0.35;
    vec3 c = mix(uCoral, uAccent, inner);
    gl_FragColor = vec4(c, (inner + outer) * uOpacity);
  }
`;

/* ── Orbiting nodes ─────────────────────────────────────────────────────── */

/** Count is small on purpose — these are punctuation, not a particle system. */
export const ORBIT_COUNT = 54;

/**
 * Builds per-point orbital parameters. Each node gets its own radius, speed,
 * phase and orbital plane, so no two ever share a path and the cloud never
 * resolves into visible rings.
 */
export function buildOrbits(radius: number) {
  const radii = new Float32Array(ORBIT_COUNT);
  const speeds = new Float32Array(ORBIT_COUNT);
  const phases = new Float32Array(ORBIT_COUNT);
  const axes = new Float32Array(ORBIT_COUNT * 3);
  const sizes = new Float32Array(ORBIT_COUNT);

  for (let i = 0; i < ORBIT_COUNT; i++) {
    radii[i] = radius * (1.25 + Math.random() * 0.75);
    // Signed, so roughly half the nodes counter-rotate. Everything orbiting the
    // same way reads as a mechanism; mixed directions read as a field.
    speeds[i] = (0.08 + Math.random() * 0.22) * (Math.random() > 0.5 ? 1 : -1);
    phases[i] = Math.random() * Math.PI * 2;
    sizes[i] = 1.6 + Math.random() * 3.4;

    // Random axis on the unit sphere — the orbital plane's normal.
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    axes[i * 3] = r * Math.cos(th);
    axes[i * 3 + 1] = u;
    axes[i * 3 + 2] = r * Math.sin(th);
  }

  return { radii, speeds, phases, axes, sizes };
}

export const ORBIT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uDpr;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  attribute vec3 aAxis;
  varying float vTwinkle;

  void main() {
    float a = uTime * aSpeed + aPhase;

    // Two vectors spanning the orbital plane. The nudge avoids a degenerate
    // cross product when the axis happens to be near-parallel to up.
    vec3 axis = normalize(aAxis);
    vec3 u = normalize(cross(axis, vec3(0.0, 1.0, 0.0)) + vec3(0.0001, 0.0, 0.0));
    vec3 v = normalize(cross(axis, u));

    vec3 p = (u * cos(a) + v * sin(a)) * aRadius;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uDpr * (200.0 / max(-mv.z, 1.0));

    // Nodes on the far side of the orbit dim, which is what gives the cloud
    // depth rather than reading as a flat ring of dots.
    vTwinkle = 0.35 + 0.65 * smoothstep(-aRadius, aRadius, p.z);
  }
`;

export const ORBIT_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(uAccent, soft * vTwinkle * uOpacity);
  }
`;
