/**
 * ═════════════════════════════════════════════════════════════════════════
 * BIRDS — a flock, as one draw call.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Every bird is two triangles (a left wing and a right wing) sharing a spine.
 * All of them live in a single BufferGeometry and a single draw call; the
 * vertex shader places each one on its own path and flaps its own wings from
 * per-vertex attributes.
 *
 * ── Why not one Object3D per bird ──
 * The obvious version is N meshes updated from JavaScript each frame. At 40
 * birds that is 40 matrix updates, 40 draw calls, and a per-frame CPU cost that
 * scales with the flock. Here the CPU does nothing at all after setup — the
 * flock is static geometry and time is the only uniform that changes. Adding
 * birds costs vertices, not frames.
 *
 * ── They are silhouettes ──
 * No shading, no colour of their own: birds against a bright sky are dark
 * shapes, and anything else immediately reads as a sprite pasted over the
 * background. The only variation is that distant birds fade into the haze.
 */

/** Kept low deliberately — a sky with forty birds in it is a hitchcock film. */
export const BIRD_COUNT = 26;

/** Vertices per bird: two triangles sharing the spine. */
const VERTS_PER_BIRD = 6;

/**
 * Builds the flock.
 *
 * Local vertex layout, before the shader moves anything:
 *   aSide  -1 = left wingtip, +1 = right wingtip, 0 = body
 *   aTip    1 at a wingtip (this vertex flaps), 0 at the body (it does not)
 */
export function buildFlock() {
  const count = BIRD_COUNT * VERTS_PER_BIRD;
  const position = new Float32Array(count * 3);
  const side = new Float32Array(count);
  const tip = new Float32Array(count);
  const phase = new Float32Array(count);
  const speed = new Float32Array(count);
  const scale = new Float32Array(count);
  const path = new Float32Array(count * 3);

  for (let b = 0; b < BIRD_COUNT; b++) {
    // Per-bird constants, written to all six of its vertices so the shader can
    // read them without an instanced draw.
    const bPhase = Math.random() * Math.PI * 2;
    const bSpeed = 0.35 + Math.random() * 0.5;
    const bScale = 0.55 + Math.random() * 0.9;
    // Path: horizontal band, altitude, and a depth that also drives haze.
    const pathY = 0.18 + Math.random() * 0.5;
    const pathZ = Math.random();
    const pathDrift = (Math.random() - 0.5) * 0.16;

    for (let v = 0; v < VERTS_PER_BIRD; v++) {
      const i = b * VERTS_PER_BIRD + v;

      // Triangle 1: body → left wingtip → body-back.
      // Triangle 2: body → right wingtip → body-back.
      const isLeft = v < 3;
      const local = v % 3;
      // local 0 = leading body point, 1 = wingtip, 2 = trailing body point.
      const lx = local === 1 ? (isLeft ? -1 : 1) : 0;
      const lz = local === 0 ? 0.5 : local === 2 ? -0.5 : -0.1;

      position[i * 3] = lx;
      position[i * 3 + 1] = 0;
      position[i * 3 + 2] = lz;

      side[i] = isLeft ? -1 : 1;
      tip[i] = local === 1 ? 1 : 0;
      phase[i] = bPhase;
      speed[i] = bSpeed;
      scale[i] = bScale;
      path[i * 3] = pathY;
      path[i * 3 + 1] = pathZ;
      path[i * 3 + 2] = pathDrift;
    }
  }

  return { position, side, tip, phase, speed, scale, path };
}

export const BIRD_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  attribute float aSide;
  attribute float aTip;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aScale;
  attribute vec3 aPath;
  varying float vHaze;

  void main() {
    float pathY = aPath.x;
    float pathZ = aPath.y;
    float drift = aPath.z;

    // Depth: near birds are bigger, faster and darker. One value drives all
    // three, which is what keeps the flock reading as one space.
    float depth = mix(0.35, 1.0, pathZ);

    /**
     * Travel wraps in normalised screen space rather than looping a path in 3D.
     * The flock only ever crosses the frame, so a wrap is indistinguishable
     * from an infinite journey and costs one fract().
     */
    float t = fract(uTime * aSpeed * 0.035 + aPhase * 0.159);
    float x = mix(-1.35, 1.35, t);
    float y = pathY + sin(uTime * aSpeed * 0.6 + aPhase) * 0.035 + drift * (t - 0.5);

    /**
     * Wing flap. Only the wingtip vertices move (aTip), so the body stays a
     * fixed spine and the wings hinge off it — flapping every vertex would
     * scale the whole bird rather than beat its wings.
     */
    float flap = sin(uTime * aSpeed * 7.0 + aPhase) * 0.55 + 0.25;
    vec3 p = position;
    p.y += aTip * flap * 0.85;
    // Wings sweep back slightly at the top of the beat.
    p.z -= aTip * abs(flap) * 0.25;

    float s = 0.016 * aScale * depth;
    // Screen-space placement: x is aspect-corrected so birds are not stretched.
    vec2 pos = vec2(x + p.x * s / uAspect, y + p.y * s + p.z * s * 0.4);

    vHaze = depth;
    gl_Position = vec4(pos.x * 1.0, pos.y * 2.0 - 1.0, 0.0, 1.0);
  }
`;

export const BIRD_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform float uOpacity;
  varying float vHaze;

  void main() {
    // Distant birds dissolve into the haze rather than staying crisp — the
    // cheapest possible aerial perspective, and the thing that stops a flock
    // looking like decals on glass.
    gl_FragColor = vec4(uInk, vHaze * vHaze * uOpacity);
  }
`;

/* ── Atmospheric dust ───────────────────────────────────────────────────── */

/**
 * Motes drifting in the foreground — the layer closest to the viewer.
 *
 * Same one-draw-call construction as the flock, and the same reason: the CPU
 * does nothing per frame. These are the top layer of the depth stack, so they
 * move MORE with the pointer than anything behind them, which is what sells the
 * parallax as depth rather than as a wobble.
 *
 * Very low opacity by design. Dust that you can clearly see is not dust, it is
 * confetti, and the brief is explicit that particles must never clutter.
 */
export const DUST_COUNT = 90;

export function buildDust() {
  const position = new Float32Array(DUST_COUNT * 3);
  const seed = new Float32Array(DUST_COUNT);
  const size = new Float32Array(DUST_COUNT);
  const depth = new Float32Array(DUST_COUNT);

  for (let i = 0; i < DUST_COUNT; i++) {
    position[i * 3] = Math.random();
    position[i * 3 + 1] = Math.random();
    position[i * 3 + 2] = 0;
    seed[i] = Math.random();
    size[i] = 1 + Math.random() * 2.6;
    depth[i] = Math.random();
  }
  return { position, seed, size, depth };
}

export const DUST_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uDpr;
  uniform vec2 uParallax2;
  attribute float aSeed;
  attribute float aSize;
  attribute float aDepth;
  varying float vFade;

  void main() {
    // Slow upward drift with a lateral sway, wrapped in normalised space.
    float t = uTime * (0.006 + aSeed * 0.010);
    float x = fract(position.x + sin(uTime * 0.05 + aSeed * 20.0) * 0.02);
    float y = fract(position.y + t);

    // Nearer motes react more to the pointer. This is the depth cue.
    vec2 par = uParallax2 * mix(0.004, 0.030, aDepth);

    vec2 p = vec2(x + par.x, y + par.y);
    gl_Position = vec4(p.x * 2.0 - 1.0, p.y * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = aSize * uDpr * mix(0.7, 1.9, aDepth);
    vFade = mix(0.25, 1.0, aDepth);
  }
`;

export const DUST_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uTint;
  uniform float uOpacity;
  varying float vFade;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uTint, soft * vFade * uOpacity);
  }
`;
