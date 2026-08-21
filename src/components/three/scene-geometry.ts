/**
 * ═════════════════════════════════════════════════════════════════════════
 * SCENE GEOMETRY + SHADERS — the topographic survey.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Split out of the component so the visual language can be rewritten without
 * touching the lifecycle, the gates, the fallback or the theme plumbing — all
 * of which are hard-won and none of which care what is being drawn.
 *
 * ── Why a wireframe terrain and not a particle field ──
 * The first version was a particle constellation: scattered points with lines
 * between near neighbours. It is the single most common WebGL background on the
 * internet, and it has a specific failure that matters here — it is RANDOM, so
 * behind body copy it reads as noise rather than as design. There is no
 * structure for the eye to resolve, so it just competes.
 *
 * A contour grid is the opposite. It is regular, so the eye parses it instantly
 * as one surface and then ignores it; it has a horizon, so it creates real
 * depth rather than scattered parallax; and it is on-brand rather than generic —
 * PORTFOLIO_BLUEPRINT.md states the visual language is "engineering
 * documentation: rack hardware, schematic paper". A topographic survey drifting
 * in space is that language in three dimensions, and it reads as terrain and
 * topology, which is what a network engineer actually works on.
 */

/** Grid extents in world units. Deep enough that the far edge is pure fog. */
export const TERRAIN = {
  width: 4200,
  depth: 4200,
  /**
   * How far the grid extends BEHIND the camera. Without this the geometry stops
   * in front of the viewer and the bottom of the frame is empty — the surface
   * reads as a ribbon floating across the middle instead of as ground you are
   * standing over. Starting it behind the camera means the foreground runs off
   * the bottom edge, which is what makes it a landscape.
   */
  near: 900,
  /** Segment counts. Halved on coarse pointers — see `buildTerrain`. */
  segX: 96,
  segZ: 84,
};

/**
 * Builds the line grid as ROWS AND COLUMNS ONLY.
 *
 * `THREE.WireframeGeometry` on a plane would be the one-liner, and it is wrong:
 * a plane is triangulated, so wireframing it draws the diagonal of every quad
 * and the result is a mesh of triangles, not a survey grid. Drawing the two
 * axes by hand is a few lines and gives clean orthogonal contours.
 */
export function buildTerrain(coarse: boolean) {
  const segX = coarse ? Math.round(TERRAIN.segX / 2) : TERRAIN.segX;
  const segZ = coarse ? Math.round(TERRAIN.segZ / 2) : TERRAIN.segZ;
  const halfW = TERRAIN.width / 2;

  const positions: number[] = [];
  const push = (x: number, z: number) => positions.push(x, 0, z);
  const zAt = (i: number) => TERRAIN.near - (i / segZ) * TERRAIN.depth;

  // Rows: lines running across the view.
  for (let iz = 0; iz <= segZ; iz++) {
    const z = zAt(iz);
    for (let ix = 0; ix < segX; ix++) {
      const x0 = -halfW + (ix / segX) * TERRAIN.width;
      const x1 = -halfW + ((ix + 1) / segX) * TERRAIN.width;
      push(x0, z);
      push(x1, z);
    }
  }
  // Columns: lines running away toward the horizon.
  for (let ix = 0; ix <= segX; ix++) {
    const x = -halfW + (ix / segX) * TERRAIN.width;
    for (let iz = 0; iz < segZ; iz++) {
      const z0 = zAt(iz);
      const z1 = zAt(iz + 1);
      push(x, z0);
      push(x, z1);
    }
  }

  return new Float32Array(positions);
}

/**
 * Value noise + fBm, in GLSL.
 *
 * Hand-rolled rather than pulled from a library: it is ~20 lines, it runs per
 * vertex (not per pixel) so it is cheap here, and a dependency for this would be
 * absurd. Four octaves is enough for a landform read; more just costs vertices.
 */
const NOISE = /* glsl */ `
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p *= 2.03;
      a *= 0.5;
    }
    return v;
  }
`;

export const TERRAIN_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uAmp;
  uniform float uSharp;
  uniform float uFar;
  varying float vHeight;
  varying float vFog;
  varying float vEdge;
  ${NOISE}

  void main() {
    vec3 p = position;

    /**
     * The terrain scrolls toward the viewer rather than the camera flying over
     * it. Same apparent motion, but the geometry never runs out and the camera
     * stays put — so nothing has to be recycled and the horizon never moves.
     */
    float t = uTime * 0.012 + uScroll * 1.6;
    vec2 uv = vec2(p.x * 0.00085, p.z * 0.00085 + t);

    // uSharp raises the frequency and drops the amplitude, taking the surface
    // from rolling landform toward something closer to a machined lattice.
    float freq = mix(1.0, 2.4, uSharp);
    float h = fbm(uv * freq) - 0.5;

    p.y += h * 430.0 * uAmp;

    vHeight = h;

    // Fade both ends: into fog at the horizon, and out just in front of the
    // camera so the grid never visibly terminates at a hard edge.
    float d = -(modelViewMatrix * vec4(p, 1.0)).z;
    vFog = smoothstep(uFar, uFar * 0.12, d) * smoothstep(30.0, 210.0, d);

    // Fade the left and right extremes so the grid dissolves rather than
    // stopping at a rectangle.
    vEdge = 1.0 - smoothstep(0.72, 1.0, abs(p.x) / ${(TERRAIN.width / 2).toFixed(1)});

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const TERRAIN_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vHeight;
  varying float vFog;
  varying float vEdge;

  void main() {
    /**
     * Ridges catch the accent. Only the upper part of the height range picks up
     * amber, so the colour marks the high ground the way a contour map marks
     * elevation — it is information, not a tint sprayed over everything.
     */
    float ridge = smoothstep(0.10, 0.34, vHeight);
    vec3 c = mix(uInk, uAccent, ridge * 0.9);

    // Low ground fades further back, which is what gives the surface its form:
    // without it every line is equally present and the relief disappears.
    float relief = 0.32 + smoothstep(-0.28, 0.32, vHeight) * 0.68;

    gl_FragColor = vec4(c, vFog * vEdge * relief * uOpacity);
  }
`;
