/**
 * ═════════════════════════════════════════════════════════════════════════
 * BIRDS — a flock, as one draw call.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Every bird is ONE QUAD, and the silhouette is drawn inside it by the fragment
 * shader as a signed distance field. All of them live in a single
 * BufferGeometry and a single draw call.
 *
 * ── Why the triangle mesh had to go ──
 * The previous version modelled the bird as real geometry: a body dart and two
 * wings of four triangles each, bending at the wrist. The kinematics were right
 * and it still read as fake, and after two rounds of tuning the reason turned
 * out to be the one thing tuning could not reach — SIZE.
 *
 * A background bird is about twenty pixels across. At that size a wing panel is
 * a two-pixel sliver, and a two-pixel sliver drawn as a hard-edged triangle is
 * a staircase, not an edge. Worse, the panels overlap at the shoulder and the
 * material is transparent, so every overlap double-blends into a dark knot with
 * pale slivers radiating off it. The result looks less like a bird than like an
 * insect or a scratch on the lens, and no amount of work on the flap fixes it,
 * because the problem is that the shape is being sampled at roughly one sample
 * per feature.
 *
 * A distance field has no such limit. The wing is a curve with a width, the
 * coverage of a pixel is a smooth function of its distance to that curve, and
 * a two-pixel-wide wingtip antialiases correctly and stays a wingtip. Nothing
 * overlaps, because the whole bird is ONE field, so there is no double-blend
 * and no knot. It is also less geometry, not more: 6 vertices per bird against
 * 27.
 *
 * ── Why not one Object3D per bird ──
 * The obvious version is N meshes updated from JavaScript each frame. At 46
 * birds that is 46 matrix updates, 46 draw calls, and a per-frame CPU cost that
 * scales with the flock. Here the CPU does nothing at all after setup — the
 * flock is static geometry and time is the only uniform that changes.
 *
 * ── They are silhouettes ──
 * No shading, no colour of their own: birds against a bright sky are dark
 * shapes, and anything else immediately reads as a sprite pasted over the
 * background. The variation is in haze, in per-bird darkness, and in a wing
 * outline that differs from bird to bird.
 *
 * ── What makes the motion read as alive ──
 * Recorded because each of these was a separate fix and each one mattered:
 *
 *   1. NO RULED PATHS. Nothing alive moves in a straight line, and a flock does
 *      not all go one way. Tracks undulate on two incommensurate sines and
 *      about 40% of the skeins fly right to left.
 *   2. NO METRONOME. A real wingbeat is a fast, deep downstroke and a slack
 *      recovery — a phase-modulated sine, not a plain one. And birds beat in
 *      BURSTS and glide between them; continuous flapping is the loudest tell
 *      in the whole effect.
 *   3. THE WING BENDS. The beat starts at the shoulder and travels outboard, so
 *      the hand always lags the arm, and the visible span foreshortens as the
 *      wing rises out of the horizontal.
 *   4. THEY BANK. Birds roll into every change of direction. The roll here is
 *      taken from the derivative of the bird's own track, so it banks into its
 *      own undulation rather than wobbling to a separate clock.
 *   5. THEY ARE IN SKEINS. Rolling every parameter independently per bird gives
 *      a statistically even field of unrelated specks, which is exactly what a
 *      flock is not.
 */

/**
 * The old note here said forty birds is a hitchcock film. It is not the count
 * that does that, it is how many of them are NEAR — a far bird is small, slow,
 * pale and quiet, and a dozen of those cost the eye nothing.
 */
export const BIRD_COUNT = 46;

/** One quad. The bird itself is drawn inside it by the fragment shader. */
const VERTS_PER_BIRD = 6;

/**
 * Quad corners, in bird-local units where the wingtips sit at x = ±1.
 *
 * The box has to contain the bird at the TOP of its stroke, not at rest — the
 * wings swing well above the shoulder line and a box sized to the glide pose
 * clips them off square at the peak of every beat.
 */
const HALF_X = 1.18;
const HALF_Y = 1.05;
const QUAD: number[] = [
  -1, -1, 1, -1, 1, 1,
  -1, -1, 1, 1, -1, 1,
];

/**
 * Builds the flock.
 *
 * ── Birds are not scattered, they are in skeins ──
 * Birds travelling together share a heading, a speed, a rough altitude and a
 * depth, and string out behind each other. So the loop below builds GROUPS of
 * one to six, rolls the flight parameters once per group, and gives each member
 * a small offset from it. Groups of one are left in on purpose: a sky of
 * nothing but tidy skeins is its own kind of artificial.
 */
export function buildFlock() {
  const count = BIRD_COUNT * VERTS_PER_BIRD;
  const position = new Float32Array(count * 3);
  /** vec2 per vertex: (travel offset 0..1, wingbeat phase). */
  const phase = new Float32Array(count * 2);
  /** Signed — the SIGN is the direction of travel, the magnitude is the speed. */
  const speed = new Float32Array(count);
  const scale = new Float32Array(count);
  const path = new Float32Array(count * 3);

  let b = 0;
  while (b < BIRD_COUNT) {
    const size = Math.min(BIRD_COUNT - b, 1 + Math.floor(Math.random() * 6));

    // Rolled once for the whole skein.
    const gDir = Math.random() < 0.42 ? -1 : 1;
    const gY = 0.16 + Math.random() * 0.5;
    const gZ = Math.random();
    const gSpeed = 0.35 + Math.random() * 0.45;
    const gTravel = Math.random();
    const gDrift = (Math.random() - 0.5) * 0.14;

    for (let k = 0; k < size; k++) {
      // Fanned out from the middle of the skein rather than stacked upward, so
      // a group reads as a loose echelon instead of a staircase.
      const rank = k - (size - 1) / 2;

      const bScale = 0.55 + Math.random() * 0.9;
      const pathY = gY + rank * 0.02 + (Math.random() - 0.5) * 0.02;
      // Same depth BAND, not the same depth — a skein has thickness.
      const pathZ = Math.min(1, Math.max(0, gZ + (Math.random() - 0.5) * 0.22));
      // Trailing: each bird sits a little behind the one ahead of it.
      const travel = gTravel + k * 0.03 + (Math.random() - 0.5) * 0.012;
      // Wingbeats are NOT synchronised. Birds in a real skein drift in and out
      // of phase with each other, and locked beats read as a machine.
      const beat = Math.random() * Math.PI * 2;
      const bSpeed = (gSpeed + (Math.random() - 0.5) * 0.05) * gDir;

      for (let v = 0; v < VERTS_PER_BIRD; v++) {
        const i = (b + k) * VERTS_PER_BIRD + v;

        position[i * 3] = QUAD[v * 2] * HALF_X;
        position[i * 3 + 1] = QUAD[v * 2 + 1] * HALF_Y;
        position[i * 3 + 2] = 0;

        phase[i * 2] = travel;
        phase[i * 2 + 1] = beat;
        speed[i] = bSpeed;
        scale[i] = bScale;
        path[i * 3] = pathY;
        path[i * 3 + 1] = pathZ;
        path[i * 3 + 2] = gDrift + (Math.random() - 0.5) * 0.03;
      }
    }

    b += size;
  }

  return { position, phase, speed, scale, path };
}

export const BIRD_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAspect;
  /** Drawing-buffer height in pixels. Feeds the per-bird antialias width. */
  uniform float uHeight;
  attribute vec2 aPhase;
  attribute float aSpeed;
  attribute float aScale;
  attribute vec3 aPath;
  varying vec2 vP;
  varying float vFlap;
  varying float vHaze;
  varying float vInk;
  varying float vAA;
  varying float vShape;

  #define TAU 6.2831853

  void main() {
    float pathY = aPath.x;
    float pathZ = aPath.y;
    float drift = aPath.z;

    float travel = aPhase.x;
    float beatPh = aPhase.y;

    // The sign of aSpeed is the heading; the magnitude is the speed.
    float dir = aSpeed >= 0.0 ? 1.0 : -1.0;
    float spd = abs(aSpeed);

    /**
     * Depth: near birds are bigger, faster and darker. One value drives all
     * three, which is what keeps the flock reading as one space.
     *
     * The floor is 0.55 rather than 0 because this is raised to a power on the
     * way to alpha AND multiplied by the route's own opacity — reductions
     * stack, and a low floor is not aerial perspective, it is deletion.
     */
    float depth = mix(0.55, 1.0, pathZ);

    /**
     * Travel wraps in normalised screen space rather than looping a path in 3D.
     * The flock only ever crosses the frame, so a wrap is indistinguishable
     * from an infinite journey and costs one fract().
     */
    float t = fract(uTime * spd * 0.030 + travel);
    float x = mix(-1.35, 1.35, t) * dir;

    /**
     * ── The track is not a ruled line ──
     *
     * Two undulations at incommensurate frequencies, so the path never repeats
     * within a crossing and no two birds ever trace the same curve. The
     * amplitudes are small on purpose: this is a background, and a bird that
     * visibly swoops pulls the eye off the page.
     */
    float wob = beatPh * 0.61;
    float glideY = sin(t * TAU * 1.5 + wob) * 0.042
                 + sin(t * TAU * 3.7 + wob * 2.3) * 0.016;

    /**
     * ── Not every bird is the same bird ──
     *
     * One outline for the whole flock is the quiet reason a field of them still
     * reads as a repeated asset however well each one moves. A single hashed
     * value per bird slides the silhouette along a real axis: slender, sharply
     * raked wings on a short body at one end, broad deep wings on a longer body
     * at the other.
     *
     * The beat rate comes from the SAME value rather than being rolled
     * separately, because in a bird those two things are not independent: a
     * long broad wing cannot be flapped quickly.
     */
    vShape = fract(beatPh * 0.19 + 0.41);

    float beatHz = mix(9.5, 4.0, vShape)
                 * mix(1.15, 0.85, clamp((aScale - 0.55) / 0.9, 0.0, 1.0));
    float a = uTime * beatHz * (0.6 + 0.4 * spd) + beatPh;

    /**
     * ── Flap in bursts, then glide ──
     *
     * Birds do not beat continuously: they take a few strokes, then hold the
     * wings out and coast. Two slow drivers at unrelated rates gate the
     * amplitude, so each bird spends real time near zero — wings held in a
     * shallow dihedral, not flat — and the flock never falls into a collective
     * rhythm.
     */
    float burstDrive = sin(uTime * 0.21 * spd + beatPh * 2.9)
                     + 0.6 * sin(uTime * 0.13 * spd + beatPh * 5.7);
    float burst = smoothstep(-0.15, 0.75, burstDrive);

    /**
     * ── An asymmetric stroke ──
     *
     * sin(a + k*sin(a)) is a phase-modulated sine: same range, same period, but
     * the wave moves fast through one half and slowly through the other. That
     * is a wingbeat — a hard, quick downstroke that does the work and a slack
     * recovery that does not. A plain sine spends equal time in both and reads
     * as a mechanism.
     *
     * The outboard LAG lives in the fragment shader now, where it belongs: the
     * wing curve is evaluated per point along the span, so the phase can be
     * offset per point instead of per vertex.
     */
    float stroke = sin(a + 0.65 * sin(a));
    // Held out in a shallow V while gliding — never flat, which reads as dead.
    vFlap = mix(0.30, 0.03, burst) + mix(0.10, 1.0, burst) * stroke;

    /**
     * ── Bank ──
     *
     * A bird changes direction by rolling, not by yawing flat, and the rolled
     * silhouette is most of what the eye reads as flying. The roll is taken
     * from the CLIMB RATE — the derivative of the track above — so the bird
     * banks into its own undulation instead of wobbling to a separate clock,
     * plus a slow independent term so it is never perfectly level.
     */
    float climb = cos(t * TAU * 1.5 + wob) * TAU * 1.5 * 0.042
                + cos(t * TAU * 3.7 + wob * 2.3) * TAU * 3.7 * 0.016;
    float roll = clamp(-climb * 0.30, -0.55, 0.55) * dir
               + sin(t * TAU * 1.1 + beatPh * 0.7) * 0.10;

    // The body rises on the downstroke — the bird is pushing itself up. Small,
    // and phase-shifted off the beat, because lift peaks after the stroke does.
    float y = pathY + glideY + drift * (t - 0.5)
            + sin(a - 1.2) * 0.0035 * burst;

    // The quad is built around the bird; the fragment shader gets the UNROTATED
    // local coordinate, so the silhouette is always drawn in the bird's own
    // frame and the roll is applied to the quad instead.
    vP = position.xy;

    float cb = cos(roll);
    float sb = sin(roll);
    vec2 o = vec2(vP.x * cb - vP.y * sb, vP.x * sb + vP.y * cb);

    float s = 0.030 * aScale * depth;

    /**
     * The 0.5 on y is not a taste adjustment, it is a projection fix. pos.y is
     * doubled on the way to clip space below and pos.x is not, so a unit of o.y
     * covered twice the pixels a unit of o.x did — the silhouette was stretched
     * along the very axis the wings beat on, and the flap swung through twice
     * its true arc. Halved here, x_px and y_px per local unit both come out at
     * s * uHeight / 2.
     */
    vec2 pos = vec2(x + o.x * s / uAspect, y + o.y * s * 0.5);

    vHaze = depth;
    // Not every bird is the same shade — plumage varies, and so does how much
    // air is in front of it.
    vInk = 0.72 + 0.28 * fract(beatPh * 0.31 + 0.13);

    /**
     * Antialias width, in LOCAL units, derived from how many pixels this bird
     * actually covers. It has to be per-bird: the flock spans a 5x range of
     * apparent size, and a fixed feather that looks crisp on the near birds
     * dissolves the far ones into smudges. fwidth() would do this too, but it
     * needs OES_standard_derivatives on WebGL1 and this costs one divide.
     */
    vAA = 1.35 / max(s * uHeight * 0.5, 1.5);

    gl_Position = vec4(pos.x, pos.y * 2.0 - 1.0, 0.0, 1.0);
  }
`;

export const BIRD_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uInk;
  uniform float uOpacity;
  varying vec2 vP;
  varying float vFlap;
  varying float vHaze;
  varying float vInk;
  varying float vAA;
  varying float vShape;

  void main() {
    /**
     * ── One wing, mirrored ──
     *
     * abs() on the span axis folds the bird about its own spine, so everything
     * below evaluates a SINGLE wing and gets the other one for nothing. That is
     * what keeps a per-pixel polyline affordable: six segments, not twelve.
     */
    vec2 q = vec2(abs(vP.x), vP.y);

    float f = vFlap;

    /**
     * The span you SEE is the true span projected onto the horizontal, so a
     * wing high in its arc looks shorter. Taking this from the flap rather than
     * animating it separately is what stops the beat looking like the bird is
     * growing and shrinking.
     */
    float sx = 1.0 - 0.26 * abs(f);

    /**
     * ── Chord, and why it has to be this thin ──
     *
     * The first distance-field pass used a wide root and a taper exponent above
     * 1, which keeps the wing broad through the middle of the span and only
     * pinches it right at the tip. That draws a delta: a solid triangle from
     * the body to the wingtip, and the flock came out looking like manta rays
     * or paper planes. A bird seen from below is nearly all SPAN — two slender
     * arms and a knot where they meet — and the chord at half span is on the
     * order of a tenth of the span, not a quarter.
     *
     * So the taper is written as a decay from the root instead: pow(1 - t, k)
     * drops fast where the old form stayed fat. Same two endpoints, completely
     * different wing.
     */
    float wRoot = mix(0.135, 0.100, vShape);
    float wTip  = mix(0.020, 0.010, vShape);
    float rake  = mix(1.5, 2.2, vShape);

    float d = 1e9;
    vec2 prev = vec2(0.0, 0.0);
    float wPrev = wRoot;

    for (int i = 1; i <= 6; i++) {
      float t = float(i) / 6.0;

      /**
       * ── The wing bends, and the bend travels outboard ──
       *
       * The stroke reaches the shoulder before the hand, so the hand is always
       * behind the arm — subtracting a span-proportional lag from the phase is
       * the whole trick, and it is what makes the wing look like it is made of
       * something rather than machined from one piece. Evaluating it HERE,
       * per point along the curve, is the thing the old vertex-attribute
       * version could only approximate at four fixed stations.
       *
       * The lag is applied to the amplitude rather than re-evaluating the sine,
       * which costs one multiply instead of a transcendental per segment and is
       * indistinguishable at this size.
       */
      float lag = 1.0 - 0.28 * t;
      // Amplitude grows faster than linearly along the span: the shoulder
      // barely moves, the hand sweeps through most of the arc.
      float arc = 0.30 * t + 0.70 * t * t;
      /**
       * The negative term is the resting droop, and it carries more weight than
       * its size suggests. Without it a gliding bird is a dead straight
       * horizontal bar with a stem under it, which is a paper dart, not a bird.
       * With it the same pose is a shallow M — the shape the eye actually
       * recognises at this distance — because the tips fall away from the
       * shoulder line even when nothing is being flapped.
       */
      vec2 cur = vec2(t * sx, f * arc * lag * 0.62 - 0.115 * t * t);
      float wCur = wTip + (wRoot - wTip) * pow(1.0 - t, rake);

      // Distance to the SEGMENT, with the width interpolated along it. A ring
      // of discs at the sample points would bead visibly at this thickness.
      vec2 pa = q - prev;
      vec2 ba = cur - prev;
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
      d = min(d, length(pa - ba * h) - mix(wPrev, wCur, h));

      prev = cur;
      wPrev = wCur;
    }

    /**
     * Tail and body: one short tapered segment down the spine. At this size a
     * bird shows almost no body — the wings are the whole silhouette and the
     * body is the dark knot where they meet — so this is deliberately little
     * more than a stub.
     */
    {
      vec2 a = vec2(0.0, -0.05);
      vec2 bb = vec2(0.0, mix(-0.42, -0.30, vShape));
      vec2 pa = q - a;
      vec2 ba = bb - a;
      float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
      // Short and thin. A long stem below the wings is the other half of what
      // made these read as aircraft — it becomes a fuselage, and a bird at this
      // range has almost no visible tail at all.
      d = min(d, length(pa - ba * h) - mix(0.062, 0.016, h));
    }

    /**
     * Coverage from distance. This is the whole reason for the rewrite: a
     * wingtip two pixels wide gets a correct partial-coverage edge instead of
     * a staircase, at every size in the flock.
     */
    float alpha = smoothstep(vAA, -vAA, d);
    if (alpha < 0.004) discard;

    /**
     * Distant birds dissolve into the haze rather than staying crisp — the
     * cheapest possible aerial perspective, and the thing that stops a flock
     * looking like decals on glass. The exponent is 1.5, not 2: the flock is
     * already drawn at a route opacity of 0.42 on the editorial pages, and
     * squaring on top of that took the far half of it below visibility.
     */
    gl_FragColor = vec4(uInk, alpha * pow(vHaze, 1.5) * vInk * uOpacity);
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
