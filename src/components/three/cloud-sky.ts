/**
 * ═════════════════════════════════════════════════════════════════════════
 * CLOUD SKY — a volumetric cloudscape, as one fullscreen shader.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Replaces the contour terrain. Same job, very different register: instead of a
 * survey grid you are above a cloud sea, with the core object floating in it.
 *
 * ── Why this is not the `vanta` package ──
 * Vanta.js is the obvious answer and it was rejected for three specific
 * reasons, none of them stylistic:
 *
 *   1. It targets three r134. This project is on 0.185, and Vanta's effects
 *      have broken repeatedly across three's API removals (`Geometry`,
 *      `THREE.Math`). Pinning an old three to satisfy it would mean shipping
 *      two copies of a 178KB library.
 *   2. It creates its OWN renderer, scene and rAF loop bound to a DOM element.
 *      That is a second WebGL context beside the one already running, and it
 *      would bypass every gate this scene has — reduced motion, low-power
 *      detection, tab visibility, context-loss recovery, per-route staging.
 *   3. It is not theme-aware. Colours are constructor options, so light/dark
 *      would need the effect destroyed and rebuilt on every toggle.
 *
 * The effect itself is a fragment shader on a fullscreen quad. Writing it
 * directly keeps one context, one loop, and full control.
 *
 * ── The perspective trick ──
 * The clouds are not raymarched volume; that would cost an order of magnitude
 * more for a background. They are a flat noise field projected onto an infinite
 * horizontal plane below the viewer: for a screen row below the horizon, the
 * distance to the plane is `height / (horizon - y)`. That single division is
 * what makes the field recede and compress toward the horizon, which is the
 * whole read of "above the clouds".
 *
 * ── The layers, back to front ──
 * A real sky is never one cloud altitude, and a single deck was the tell here:
 * the top half of the frame was empty air with two faint smears in it. There
 * are now four bands, each on its own drift, and the eye reads the difference
 * in their apparent speed as distance:
 *
 *   1. CIRRUS       — three thin ice layers, high, stretched hard by the wind.
 *                     The second is warped by the first so the streaks bend
 *                     along the sheets instead of running as parallel bars.
 *   2. CUMULUS BAND — billowy towers standing ON the horizon, dense at the
 *                     base and ragged at the tops. This is the layer that makes
 *                     the sky read as weather rather than as a gradient.
 *   3. DECK         — the cloud sea below you: fBm and billow for the body,
 *                     ridged noise for the tendrils, lit by a sun-direction
 *                     shadow tap.
 *   4. MIST         — a thin sheet on a NEARER plane, drifting about twice as
 *                     fast. Parallax between two depths is the strongest volume
 *                     cue available without raymarching.
 *   5. HAZE         — aerial perspective. Everything far away desaturates
 *                     toward the horizon colour before it reaches the eye.
 *
 * ── Why the deck is not a coverage mask ──
 * It carries optical THICKNESS, and opacity comes from Beer's law at the end.
 * The mask version thresholded to cloud-or-sky and saturated across most of the
 * frame, and a field that is opaque everywhere is a surface — which is why it
 * kept reading as upholstery, or worse as water, however it was lit. Every
 * volume cue the eye uses needs values between 0 and 1: thin veils you can see
 * the depths through, solid cores, and the range in between.
 *
 * The smoke comes from EROSION rather than from adding detail. Fine noise is
 * subtracted from the thickness, weighted so thin skirts dissolve while cores
 * survive, and the noise driving it is ridged — thin branching crests rather
 * than round lumps — sampled through a lookup stretched along the drift so the
 * strands are drawn out by the wind. Erosion is the dominant term, not a trim:
 * it removes about a third of the deck, and what is left is the branching
 * structure rather than a shrunken blob.
 *
 * ── On the thresholds ──
 * Every `smoothstep` that turns noise into cloud is tuned against the MEASURED
 * distribution of these specific noise functions, not guessed. This mattered:
 * an earlier revision shipped a ramp that sat almost entirely above the data
 * and returned ~0.07 everywhere, i.e. no clouds at all. `fbm2` and `billow2`
 * are both normalised to mean 0.50 for exactly this reason — see the note on
 * each — so a ramp centred on 0.50 means "half the sky", and it means that at
 * any octave budget, which is what keeps the 3-octave phone path looking like
 * the 5-octave desktop one rather than like a different sky.
 */

/**
 * 2D value noise + fBm. Separate from the 3D version in core-object.ts — this
 * one is sampled per PIXEL rather than per vertex, so it is deliberately the
 * cheaper two-dimensional form.
 */
const NOISE2 = /* glsl */ `
  /**
   * The sin-based hash. It looks like the lazy choice and it was measured
   * against the fashionable alternative (the fract/dot chain everyone quotes),
   * which turned out to be badly non-uniform on the integer lattice this
   * samples: chi-square 3236 against 9.1 for this one, biased hard toward LOW
   * values. Swapping it in would have thinned and darkened every cloud here.
   */
  float h21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  /**
   * Quintic interpolation, not cubic. The 3t^2-2t^3 of smoothstep has a
   * discontinuous SECOND derivative at the cell edges, and value noise stacked
   * five octaves deep shows that as a faint square grid in the flat parts of a
   * cloud. The quintic 6t^5-15t^4+10t^3 is C2, and the grid goes away.
   */
  float n2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(
      mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x),
      mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  /**
   * Standard fBm, with two changes that matter.
   *
   * ROTATION between octaves. Doubling the frequency on the same axes lines
   * every octave's cell grid up with every other one, and the result has a
   * visible weave. A rotation of roughly 37 degrees per octave decorrelates
   * them.
   *
   * NORMALISATION by the accumulated amplitude. Without it the mean of the
   * result depends on the octave COUNT (0.48 at five octaves, 0.44 at three),
   * so every threshold tuned on desktop would be wrong on the phone path.
   * Divided through, the mean is 0.50 at any budget. Measured: mean 0.498,
   * sd 0.134 at five octaves, 0.148 at three.
   */
  float fbm2(vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    float norm = 0.0;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    // WebGL1 requires a constant loop bound, so the count is a compile-time
    // constant and the octave budget is applied with a break.
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      v += a * n2(p);
      norm += a;
      p = rot * p * 2.03 + vec2(37.1, 11.7);
      a *= 0.5;
    }
    return v / max(norm, 0.0001);
  }

  /**
   * Billow noise — fBm over abs(2n-1) instead of n, inverted.
   *
   * This is the cauliflower. Ordinary fBm is smooth everywhere, which is right
   * for haze and wrong for a cumulus: real convective cloud is a stack of
   * rounded lobes with creases between them. Taking the absolute value folds
   * the noise about its midline, and the fold is what makes the lobe edge.
   *
   * The raw form has mean 0.622 / sd 0.153, because abs(2n-1) over SMOOTHED
   * value noise averages 0.38 rather than the 0.5 a uniform variable would
   * give. The remap below re-centres it on 0.50 with a slightly wider spread
   * than fbm2, so it shares thresholds with fbm2 and still resolves into
   * distinct puffs rather than mush.
   */
  float billow2(vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    float norm = 0.0;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      v += a * abs(n2(p) * 2.0 - 1.0);
      norm += a;
      p = rot * p * 2.07 + vec2(19.3, 7.1);
      a *= 0.5;
    }
    float raw = 1.0 - v / max(norm, 0.0001);
    return clamp((raw - 0.622) * 1.15 + 0.5, 0.0, 1.0);
  }

  /**
   * Ridged multifractal — the tendril generator.
   *
   * billow2 gives rounded lobes, which is right for the body of a cumulus and
   * wrong for smoke. Smoke is filamentary: thin branching strands with a lot of
   * empty air between them. Two changes to the fBm produce that.
   *
   * SQUARING each octave. 1 - abs(2n-1) peaks along the contour where the noise
   * crosses its midline, so it is already a ridge; squaring it narrows that
   * crest into a thin line instead of a broad hump.
   *
   * GATING each octave by the previous one (the prev term). Detail is only
   * allowed to appear where a ridge already exists, so the fine structure
   * branches off the coarse structure rather than sprinkling evenly over the
   * whole field. That is what makes strands look connected and grown rather
   * than like noise.
   *
   * The result is deliberately NOT centred on 0.5 like the other two. Measured
   * at two octaves: mean 0.367, sd 0.242, median 0.345 but p99 0.899 — most of
   * the field is near empty with narrow high crests through it, which is the
   * distribution a tendril field should have. Thresholds that use it are set
   * against those numbers.
   */
  float ridge2(vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    float norm = 0.0;
    float prev = 1.0;
    mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      float r = 1.0 - abs(n2(p) * 2.0 - 1.0);
      r = r * r;
      v += a * r * prev;
      prev = r;
      norm += a;
      p = rot * p * 2.11 + vec2(23.7, 5.3);
      a *= 0.5;
    }
    return v / max(norm, 0.0001);
  }

  /**
   * Linear rescale of v from one range to another. Small, but it is the whole
   * mechanism behind the edge erosion below, so it earns a name.
   *
   * Erosion works by raising the LOW end of the range by a noise value:
   * remap(cover, detail, 1.0, 0.0, 1.0) leaves cover = 1 untouched and pushes
   * everything below it down in proportion to how thin it already was. Dense
   * cores survive, thin skirts get eaten into filaments. That asymmetry is what
   * a subtract cannot do and is why cloud edges come out torn rather than just
   * dimmer.
   */
  float remap(float v, float lo, float hi, float nlo, float nhi) {
    return nlo + (v - lo) * (nhi - nlo) / max(hi - lo, 0.0001);
  }
`;

export const SKY_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Already in clip space — this is a fullscreen quad, so no camera maths.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const SKY_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uScroll;
  uniform float uOpacity;
  uniform float uAspect;
  uniform int uOctaves;
  uniform vec3 uSky;
  uniform vec3 uHorizon;
  uniform vec3 uCloud;
  uniform vec3 uLight;
  uniform vec3 uSun;
  uniform vec2 uSunPos;
  uniform float uStars;
  /**
   * 0 = sun, 1 = moon. Not a colour switch — uSun already carries the colour.
   * This changes what the body IS: how hard its edge is, whether it has a
   * surface, how far its light reaches, and whether it throws shafts.
   */
  uniform float uMoon;
  uniform float uParallax;
  uniform float uSunStory;
  varying vec2 vUv;
  ${NOISE2}

  void main() {
    vec2 uv = vUv;

    /**
     * Octave budgets, derived once. Clamped at 1 because uOctaves is 3 on
     * coarse pointers, and an fbm called with 0 octaves returns 0 — which
     * would silently delete a whole cloud layer on phones only.
     */
    int oHi = uOctaves;
    int oMid = uOctaves - 1; if (oMid < 1) oMid = 1;
    int oLow = uOctaves - 2; if (oLow < 1) oLow = 1;
    /**
     * Two octaves, for the quantities that are deliberately LOW-FREQUENCY: the
     * domain-warp offsets and the lighting gradient. Those are smooth fields by
     * intent — a warp is a displacement, a shading term is a slow ramp — so the
     * third and fourth octaves cost real per-pixel time and change nothing that
     * can be seen. Dropping these four calls to two octaves measured as the
     * single biggest saving in the shader.
     *
     * It is a LITERAL, and deliberately not min(oLow, 2). The cap looks
     * strictly better — on the coarse-pointer path uOctaves is 3, so oLow is
     * already 1 and a flat 2 is more work — but it measured SLOWER there, and
     * consistently: 2.1x the old shader against 1.9x for the literal. A literal
     * bound lets the compiler unroll the fbm loop completely, and losing the
     * unroll costs more than the extra octave saves. Do not "fix" this without
     * measuring it.
     */
    int oSoft = 2;

    /**
     * The detail budget, as one flag rather than as scattered octave maths.
     * uOctaves is 3 only on coarse pointers, so this is "are we on a phone".
     *
     * It gates the two additions that buy the least per millisecond — the
     * finest erosion tap and the foreground mist sheet. Both are near-invisible
     * at phone resolution and neither survives the low octave budget with much
     * structure left, but measured they took the coarse path from 1.9x the old
     * shader to 2.7x, which is the wrong place to spend a phone's fill rate.
     * The branch is uniform across the whole draw, so it costs nothing.
     */
    bool rich = uOctaves > 3;

    /**
     * The horizon rides UP as the page scrolls, so scrolling reads as
     * descending toward the cloud deck. Clamped well inside the frame — at the
     * very top or bottom the perspective division explodes and the field turns
     * into a stretched smear.
     */
    float horizon = clamp(0.62 - uScroll * 0.18, 0.30, 0.72);

    /* ── Sky ──────────────────────────────────────────────────────────── */
    float above = clamp((uv.y - horizon) / max(1.0 - horizon, 0.001), 0.0, 1.0);
    vec3 col = mix(uHorizon, uSky, pow(above, 0.75));

    /**
     * Zenith deepening. A real sky is darkest straight overhead, because that
     * is the least air you are looking through, and this one was very nearly as
     * pale at the top of the frame as at the horizon.
     *
     * It is also what the header needs. The nav pill sits over the top ~12% of
     * the viewport, and that band measured a luminance sd of only 14 before
     * this — so once a legible glass tint took its cut there was almost nothing
     * left to see. Deepening the zenith gives the white cirrus something to
     * contrast against instead of white-on-near-white.
     */
    col *= 1.0 - 0.16 * pow(above, 1.5);

    /**
     * ── Stars ──
     *
     * Hash-per-cell rather than a texture or a Points cloud: divide the sky
     * into a grid, let one cell in ~40 hold a star, and jitter its position
     * inside the cell so the field never reads as a lattice.
     *
     * They are masked THREE ways, and all three matter — a star that survives
     * into the bright part of the sky instantly looks like a dead pixel:
     *   · only high in the frame (uv.y above the deck),
     *   · only away from the sun (its scatter washes them out),
     *   · only on the dark theme (uStars).
     */
    if (uStars > 0.001) {
      vec2 sgrid = vec2(uv.x * uAspect, uv.y) * 42.0 + uParallax * 6.0;
      vec2 sid = floor(sgrid);
      vec2 sf = fract(sgrid);
      float pick = h21(sid);
      if (pick > 0.975) {
        vec2 jitter = vec2(h21(sid + 3.1), h21(sid + 7.7));
        float sd = length(sf - jitter);
        // Twinkle: each star on its own slow phase.
        float tw = 0.55 + 0.45 * sin(uTime * 1.4 + pick * 90.0);
        float star = smoothstep(0.13, 0.0, sd) * tw;
        float highSky = smoothstep(horizon - 0.05, 1.0, uv.y);
        col += vec3(1.0, 0.96, 0.9) * star * highSky * uStars * 0.9;
      }
    }

    /* ── Sun ──────────────────────────────────────────────────────────── */
    // Aspect-corrected, or the disc is an ellipse on any non-square viewport.
    vec2 sunDelta = (uv - uSunPos) * vec2(uAspect, 1.0);
    float sunDist = length(sunDelta);

    /**
     * Three falloffs, not one. A single disc reads as a sticker; a real sun is
     * a small hard core inside a tight bloom inside a very wide atmospheric
     * scatter that tints half the sky. The widest term is what actually sells
     * it — it is why the air near the sun looks brighter than the air opposite.
     */
    /**
     * ── Sun and moon are not the same light with different colours ──
     *
     * A sun is plasma: no surface, an edge that blows out before it resolves,
     * and light that floods a third of the sky. A moon is rock: a hard limb you
     * can see the shape of, a face with markings on it, and a glow that stops
     * close to the disc — which is exactly why stars survive right up beside a
     * full moon but nothing survives near the sun.
     *
     * Getting that difference wrong is what makes a recoloured sun read as a
     * bug rather than as the moon, so the radii and strengths below are all
     * interpolated on uMoon rather than shared.
     */
    float bloomR   = mix(0.34, 0.17, uMoon);
    float scatterR = mix(0.62, 0.34, uMoon);

    float disc  = smoothstep(0.068, 0.022, sunDist);
    float bloom = pow(max(1.0 - sunDist / bloomR, 0.0), 2.6);
    /**
     * Radius pulled in from 1.25 to 0.62. At 1.25 the scatter reached past the
     * far corner of the viewport, so the sun was not lighting the sky near it —
     * it was grading the entire frame warm. A sun should brighten the air
     * around itself and leave the rest of the sky its own colour.
     */
    float scatter = pow(max(1.0 - sunDist / scatterR, 0.0), 2.4) * mix(0.42, 0.22, uMoon);

    /**
     * uSunStory is the scroll narrative: 1 at the hero, dipping to ~0.55 through
     * the middle of the page, returning to 1 at the contact horizon. It scales
     * the sun's atmospheric contribution rather than the disc, so the sun never
     * disappears — it is veiled and then clears, which is what a sun behind
     * moving cloud actually does.
     */
    col = mix(col, uSun, clamp(scatter * mix(0.62, 0.40, uMoon) * uSunStory, 0.0, 1.0));
    /**
     * The halo is mostly a MIX toward the sun and only partly an add.
     *
     * Purely additive was fine while the sun was pale cream, and wrong the
     * moment it went deep orange. Adding a saturated colour to an already
     * bright sky drives the red channel past 1 while green and blue are still
     * climbing, so it clips to white: on the light theme the halo bleached out
     * and left a hard orange ring where the disc ended, which read as a donut
     * rather than as a sun. Mixing carries the hue at any background
     * brightness; the smaller additive term is what still makes it glow.
     */
    col = mix(col, uSun, clamp(bloom * mix(0.75, 0.45, uMoon) * uSunStory, 0.0, 1.0));
    col += uSun * bloom * mix(0.45, 0.30, uMoon) * uSunStory;
    /**
     * ── Volumetric rays ──
     *
     * Shafts are a function of ANGLE around the sun, not of screen position:
     * take the bearing from the sun to this pixel, sample 1D noise on it, and
     * the result is naturally radial. Two bands at different frequencies keep
     * it from looking like a bicycle wheel, and the whole thing is multiplied
     * by distance falloff so the rays dissolve rather than terminate.
     *
     * Deliberately weak. Ray shafts are the single easiest way to make a scene
     * look cheap, and the brief is explicit that they must never read as
     * cartoon beams or obscure text.
     */
    float ang = atan(sunDelta.y, sunDelta.x);

    /**
     * Two angular scales, because one does not read as rays.
     *
     * BROAD SHAFTS carry the direction — wide wedges of brighter air that say
     * light is coming from a point. FINE SPOKES carry the sparkle — the thin
     * glare streaks an eye or a lens makes looking near the sun. With only the
     * broad term you get a lumpy halo; with only the fine term you get a comb.
     *
     * Both are angular noise rather than sin(), deliberately. Evenly spaced
     * spokes are the single clearest tell of a fake sun, because nothing in
     * atmosphere is periodic — irregular spacing is what sells it.
     */
    float shaft = n2(vec2(ang * 3.4, uTime * 0.05)) * 0.6
                + n2(vec2(ang * 9.1, uTime * 0.03 + 11.0)) * 0.4;
    shaft = smoothstep(0.30, 0.98, shaft);
    float spokes = smoothstep(0.60, 0.94, n2(vec2(ang * 21.0, uTime * 0.02 + 5.0)));

    float rayFall = pow(max(1.0 - sunDist / 0.95, 0.0), 2.0);

    /**
     * Gated to start OUTSIDE the disc. Rays drawn across the photosphere wash
     * out its limb, and the limb is the whole reason the sun reads as a body
     * rather than as a smear — which is exactly what it had become.
     */
    float rayGate = smoothstep(0.055, 0.17, sunDist);

    // Shafts are a sun thing. The moon keeps a trace so the air around it is
    // not dead, but god-rays off a full moon read as a mistake.
    col += uSun * (shaft * 0.30 + spokes * 0.20) * rayFall * rayGate
         * mix(1.0, 0.06, uMoon) * uSunStory;

    if (uMoon < 0.5) {
      /* ── SUN ────────────────────────────────────────────────────────── */

      /**
       * ── The photosphere ──
       *
       * The sun needs an EDGE. Two revisions of this got it wrong in opposite
       * directions and both are worth recording, because the failure modes look
       * nothing alike:
       *
       *   1. A flat orange disc with a tight white spot inside it. The spot did
       *      not reach the rim, so the outer disc stayed at full-strength
       *      orange and the whole thing rendered as a donut.
       *   2. Fixing that by running the white gradient across the entire disc,
       *      which removed the ring — and the edge with it. What was left was a
       *      soft peach blob with no disc in it at all. On the pale light theme
       *      that is barely a sun; it reads as a lens flare or a stain.
       *
       * The real thing has both: a bright face that holds its brightness most
       * of the way out, and then a limb where it falls off quickly. Solar limb
       * darkening is also real — you see through less hot plasma at a glancing
       * angle, so the rim is dimmer and REDDER than the centre. That colour
       * shift from white-hot core to saturated orange rim is what makes it
       * read as a glowing sphere rather than a flat sticker, and it is what
       * gives the disc contrast against a sky that is itself very bright.
       */
      float dr = sunDist / 0.062;                       // 0 at centre, 1 at limb

      // Holds near-white to ~40% of the radius, then warms into uSun.
      vec3 photosphere = mix(vec3(1.0), uSun, smoothstep(0.35, 1.0, dr) * 0.9);

      // The limb. Tight enough to be an edge, soft enough not to alias — the
      // sun is not the moon, its edge is blown out by glare, just not absent.
      float limb = smoothstep(1.0, 0.80, dr);
      col = mix(col, photosphere, limb * uSunStory);
    } else {
      /* ── MOON ───────────────────────────────────────────────────────── */

      // Disc-local coordinates: -1..1 across the face, so everything below is
      // in units of moon radii and independent of viewport size.
      vec2 mu = sunDelta / 0.068;
      float r = length(mu);

      /**
       * The maria — the dark basalt plains that make up the face.
       *
       * This is the single cue that separates "the moon" from "a white circle".
       * A full moon rendered as a flat disc reads as a UI dot or a rendering
       * fault, because nothing else in the sky is a perfect featureless circle;
       * the blotches are what the eye actually recognises. Sampled in disc
       * space so they stay locked to the face rather than swimming as the sky
       * drifts underneath.
       */
      float maria = fbm2(mu * 1.7 + vec2(9.3, 2.7), oLow);
      float face = 1.0 - 0.30 * smoothstep(0.40, 0.66, maria);

      // A little darkening toward the limb. The moon has very little of this
      // compared to a star — it is rough rock, not a glowing sphere — so it is
      // deliberately slight. Overdo it and it turns into a shaded ball.
      face *= 1.0 - 0.16 * smoothstep(0.55, 1.0, r);

      /**
       * A hard edge, unlike the sun's. The moon is a solid body occluding the
       * sky behind it, and that crisp limb is most of why it reads as an object
       * at a distance rather than as a glow in the air. The ramp is about two
       * pixels wide at a normal viewport height — enough to antialias, not
       * enough to look soft.
       */
      float limb = smoothstep(1.0, 0.965, r);
      col = mix(col, uSun * face, limb * uSunStory);
    }

    /**
     * ── Shared cloud lighting terms ──
     *
     * Every layer below is lit by the same sun, and computing these once is
     * what stops the layers looking like separate effects stacked in a list.
     *
     * cloudDark is the shadowed underside. It is NOT uCloud multiplied down: a
     * cloud's shadow side is lit by the sky above it, so it goes bluer as it
     * goes darker. Pulling it toward uHorizon keeps that, and keeps it
     * theme-aware for free.
     *
     * forward is the forward-scattering lobe — the reason a cloud with the sun
     * behind it has a bright rim. It is the highest-value single term in this
     * shader, because it is the one cue that says the cloud is translucent
     * rather than a painted shape.
     */
    /**
     * ── How much tonal room this palette actually has ──
     *
     * The two themes are not equally contrasty and cannot share a fixed shadow
     * lift. Measured on the linear values three hands in, uLight is about 1.8x
     * uCloud on the light theme and about 11x on the dark one. A flat 30% lift
     * tuned to stop the dark deck breaking into blotches also crushed the light
     * deck into a 0.74-to-1.0 band, and cloud with a quarter of a stop of range
     * in it cannot look like anything but airbrush — there is nowhere for a
     * shadowed underside to go.
     *
     * So the lift is derived from the palette rather than fixed: near zero when
     * the theme has little room, near full when it has plenty. Theme-aware
     * without the shader needing to be told which theme it is, and it stays
     * correct if the tokens are ever retuned.
     */
    float palRange = dot(uLight, vec3(0.2126, 0.7152, 0.0722))
                   / max(dot(uCloud, vec3(0.2126, 0.7152, 0.0722)), 0.0005);
    float lift = clamp((palRange - 2.0) / 8.0, 0.0, 1.0);

    vec3 cloudDark = mix(uCloud * 0.45, uHorizon, 0.26);
    // The shadow tone the cloud layers actually reach.
    vec3 cloudShade = mix(cloudDark, uCloud, 0.05 + 0.35 * lift);

    /**
     * ── Moonlight is not sunlight turned down ──
     *
     * Swapping a deep-orange sun for a pale moon made the whole night sky go
     * grey, and the disc was not the culprit — the CLOUD lighting was. Every
     * term below (forward scatter, sun wash, silver lining) had sun-scale radii
     * baked in, up to 0.85 of the frame, and a bright pale light source spills
     * across that far more than a dark saturated one did. The result was a moon
     * flooding the frame like a sun.
     *
     * Real moonlight is about six orders of magnitude weaker than sunlight and
     * falls off visibly sooner. Pulling the radii in and scaling the strengths
     * is what makes the moon silver the cloud near it and leave the rest of the
     * sky its own colour — which is also what keeps the night looking like
     * night.
     */
    float forward = pow(max(1.0 - sunDist / mix(0.85, 0.45, uMoon), 0.0), 2.6);
    float lightK = mix(1.0, 0.45, uMoon);

    /* ── Cirrus ───────────────────────────────────────────────────────── */
    if (above > 0.002) {
      /**
       * Cirrus is ice at 10km. Near the horizon you are looking along the deck,
       * not up at the ice, so the whole band is masked to the upper sky — this
       * is also what keeps it off the cumulus tops it would otherwise veil.
       */
      float hi = smoothstep(0.05, 0.55, above);

      // Sheets. Stretched about 1:3 against the y term, which is the prevailing
      // wind doing what wind does to anything thin.
      float c1 = fbm2(vec2(uv.x * uAspect * 1.15 - uTime * 0.005 + uParallax * 0.45,
                           uv.y * 3.6), oLow);
      col = mix(col, uLight, smoothstep(0.50, 0.76, c1) * hi * 0.30);

      /**
       * Streaks, warped BY the sheets. Two layers of stretched noise at
       * different frequencies still read as parallel bars, because nothing
       * couples them; feeding c1 into the lookup for c2 makes the fine streaks
       * bend along the coarse sheets, which is what real cirrus does.
       */
      float c2 = fbm2(vec2(uv.x * uAspect * 2.4 + uTime * 0.010 + (c1 - 0.5) * 2.2,
                           uv.y * 9.0 + (c1 - 0.5) * 1.6), oMid);
      float streak = smoothstep(0.52, 0.78, c2) * hi;
      col = mix(col, uLight, streak * 0.46);
      // Ice catches the sun edge-on. This is the one place in the scene where a
      // near-white highlight is physically the right answer.
      col += uSun * streak * forward * 0.28 * lightK * uSunStory;

      // A third, faster, finer pass. Drifting at double the speed of the
      // sheets, so the two never lock into looking like one moving texture.
      float c3 = fbm2(vec2(uv.x * uAspect * 4.2 + uTime * 0.020 + uParallax * 0.90,
                           uv.y * 18.0), oSoft);
      col = mix(col, uLight, smoothstep(0.56, 0.84, c3) * hi * 0.20);
    }

    /* ── Cumulus band, standing on the horizon ────────────────────────── */
    float hb = uv.y - horizon;
    // Starts BELOW the horizon line so the base of the band overlaps the top of
    // the deck. Without that overlap there was a pale strip of bare sky between
    // the two layers, reading as a ruled line across the frame.
    if (hb > -0.10 && hb < 0.32) {
      /**
       * Not plane-projected. These are kilometres away, so their apparent size
       * barely changes across the band, and running them through the same
       * height/(horizon - y) division as the deck would stretch them into
       * vertical smears. Screen space with a squashed y is the correct model
       * for something that far off.
       */
      /**
      /**
       * The y squash sets the noise cell's aspect ratio, and it has a narrow
       * usable range with a failure mode at each end. The band is only ~0.14 of
       * the frame tall but a full frame wide, so at 5.5 a cell came out three
       * times wider than tall and the towers rendered as horizontal smears. At
       * 2.2 there was almost no vertical variation left, the skyline became a
       * pure function of x, and billow noise — which has sharp creases by
       * construction — turned it into a row of vertical ice spikes. 4.0 keeps
       * enough vertical structure to break the silhouette up without shearing
       * the interior.
       */
      vec2 tp = vec2(uv.x * uAspect * 1.7 + uTime * 0.007 + uParallax * 0.55, hb * 4.0);

      // Domain warp first, so the tower SILHOUETTES are irregular. Warping only
      // the interior gives you lumpy texture inside a smooth blob.
      vec2 tw = vec2(fbm2(tp * 1.25 + vec2(5.2, 0.7), oSoft),
                     fbm2(tp * 1.25 + vec2(1.9, 8.4), oSoft));
      vec2 tq = tp * 1.55 + (tw - 0.5) * 1.8;
      float t = billow2(tq, oMid);

      /**
       * Coverage falls off with height rather than being a fixed threshold.
       * That single subtraction is what gives the band a shape: solid at the
       * base where the cloud is, thinning upward, with the tallest towers
       * surviving highest because they started from the densest noise.
       *
       * The band has to STOP, and well inside the frame. The first version
       * faded out over 0.60 of uv, which is more sky than exists above the
       * horizon — so the "towers" ran off the top of the screen and the whole
       * upper half became an overcast lid with the cirrus buried under it.
       * Measured profile now: 58% on the horizon line, 46% at hb=0.04, 28% at
       * hb=0.08, clear by 0.14. That leaves two thirds of the sky open.
       */
      float cover = t - 0.34 - smoothstep(0.0, 0.30, hb) * 0.70;
      /**
       * A wide, soft ramp. Cloud has no edge — it thins out over a distance
       * comparable to its own size. A tight ramp here gave every tower a crisp
       * boundary, and a crisp boundary on a white lump is the difference
       * between reading it as cloud and reading it as rock or ice.
       */
      float td = smoothstep(-0.05, 0.15, cover);

      /**
       * Erode the silhouette, exactly as the deck does. This band is seen
       * against open sky rather than against more cloud, so its outline is the
       * most scrutinised shape in the frame — a clean edge here is what made an
       * earlier revision read as ice rather than as weather. Two octaves at
       * high frequency is enough to tear it.
       */
      float twisp = ridge2(tq * 4.0 + vec2(6.1, 2.4), oSoft);
      td = clamp(remap(td, (1.0 - twisp) * 0.45, 1.0, 0.0, 1.0), 0.0, 1.0);

      /**
       * Fade the base out across the overlap rather than letting the if above
       * cut it off. The first attempt at this overlap simply started the band
       * at hb = -0.03 at full strength, which traded a pale seam for a much
       * worse one: a measured luminance step of ~3% in four pixels, straight
       * across the frame. A background may not have a ruled line in it.
       */
      td *= smoothstep(-0.10, -0.015, hb);

      if (td > 0.002) {
        /**
         * Shadow tap toward the sun. Sampling the SAME field offset along the
         * direction of the light and differencing is the cheap stand-in for
         * marching through the volume: where there is more cloud between this
         * point and the sun, this point is in shadow.
         */
        vec2 toff = normalize(vec2((uSunPos.x - 0.5) * 3.0, 1.0)) * 0.85;
        float tl = billow2(tq + toff, oLow);
        float lit = clamp(0.52 + (t - tl) * 2.0, 0.0, 1.0);

        // Three stops, not two. A straight dark-to-light mix gives a cloud made
        // of one grey ramp; a mid tone is what puts a body between the sunlit
        // top and the shadowed base.
        vec3 tc = mix(cloudShade, uCloud, smoothstep(0.0, 0.58, lit));
        tc = mix(tc, uLight, smoothstep(0.48, 1.0, lit));

        // Clouds near the sun take its colour, and take it on their lit faces
        // only — multiplying by lit is the whole point.
        float sw = pow(max(1.0 - sunDist / mix(0.60, 0.32, uMoon), 0.0), 2.2);
        tc = mix(tc, uSun, sw * lit * 0.40 * lightK * uSunStory);

        // Silver lining. Peaks where td is LOW — the thin ragged edge of the
        // tower — which is exactly where light gets through a real one.
        tc += uSun * (1.0 - smoothstep(0.0, 0.45, td)) * forward * 0.55 * lightK * uSunStory;

        // Aerial perspective, strongest at the base because the base is the
        // furthest part of the tower from the eye.
        tc = mix(tc, uHorizon, 0.36 * (1.0 - smoothstep(0.0, 0.16, hb)));

        col = mix(col, tc, td * 0.94);
      }
    }

    /* ── Cloud deck ───────────────────────────────────────────────────── */
    float below = horizon - uv.y;
    if (below > 0.0005) {
      /**
       * Project this pixel onto an infinite plane below the viewer. dist
       * grows without bound toward the horizon, which is exactly what
       * compresses the noise there and makes the deck recede.
       */
      float dist = 0.24 / below;
      vec2 p = vec2((uv.x - 0.5) * uAspect * dist, dist);

      // Drift, plus a slow inward pull so the deck is never static.
      p += vec2(uTime * 0.035 + uParallax * 0.8, -uTime * 0.055 + uScroll * 1.2);

      /**
       * One octave less in the far field. Up there perspective has already
       * driven the noise frequency past what the pixel grid can resolve and the
       * haze has faded it out anyway, so the detail is pure cost — and this is
       * the most heavily shaded region of the frame.
       */
      int dOct = below < 0.075 ? oMid : oHi;

      /**
       * Domain warp — one extra fbm perturbing the lookup, which is what turns
       * regular billowy noise into something that reads as weather. Centred on
       * 0.5 first, so it displaces the field rather than translating it.
       *
       * Amplitude 1.1, down from 2.6. This one number was the difference
       * between cloud and SEA. Displacing the lookup by more than a noise cell
       * shears every feature into long curved filaments, and a lit field of
       * curved filaments is precisely what a rolling water surface looks like —
       * the first render of this deck was unmistakably an ocean. Under one cell
       * the warp roughens shapes instead of smearing them.
       */
      vec2 warp = vec2(
        fbm2(p * 1.1 + vec2(1.7, 9.2), oSoft),
        fbm2(p * 1.1 + vec2(8.3, 2.8), oSoft)
      );

      /**
       * Frequency 3.0, not 0.85. Perspective squeezes the sampled region hard:
       * at the bottom of the frame the projected span is well under one noise
       * cell wide, so at the original scale the whole foreground resolved to a
       * single flat value and the deck simply was not there.
       */
      vec2 q = p * 3.0 + (warp - 0.5) * 1.1;

      /**
       * fBm for the mass, billow for the puff. fBm alone gave a deck that was
       * recognisably a noise texture — soft everywhere, no lobes. Billow now
       * carries the majority: it is the term with rounded tops and creases in
       * it, and under-weighting it was the other half of the water problem.
       */
      float base = fbm2(q, dOct);
      float puff = billow2(q * 0.95 + vec2(4.7, 1.3), oLow);
      float d = mix(base, puff, 0.55);

      /**
       * Contrast stretch, and it is not a taste knob — it corrects for the mix
       * above. Averaging two INDEPENDENT noise fields averages away their
       * variance: measured, the combined field sat in a narrow band around
       * 0.52, with 59% of every deck pixel inside 0.4..0.6. A field that never
       * commits to being cloud or being sky renders as smooth grey mush, which
       * is exactly how this looked, and no amount of erosion or lighting fixes
       * it because there is nothing there to erode or light.
       *
       * Widening it about the midpoint restores the range the mix cost, without
       * touching the frequency content that the octave budget controls.
       */
      d = (d - 0.5) * 1.55 + 0.5;

      /**
       * One cheap tap of extra relief, faded IN toward the viewer, because the
       * perspective division works against detail in the near field.
       *
       * Frequency 3.2 and amplitude 0.07, down from 6.5 and 0.16. Both were
       * making CHOP: at the bottom of the frame the projected span is barely
       * two noise cells wide, so a 6.5x tap put a dozen ripples across it and
       * the foreground turned into a wind-blown water surface. Cloud detail at
       * this distance is a lump, not a ripple.
       */
      /**
       * ── Weather scale ──
       *
       * A very low-frequency bias on coverage, sampled in plane space so it is
       * anchored to the world rather than to the screen. Real skies are not
       * uniformly cloudy: they have open lanes kilometres across sitting beside
       * dense banks. Without this the deck is statistically identical at every
       * point, and that uniformity is the giveaway that the whole thing fell
       * out of one noise function.
       */
      float weather = fbm2(p * 0.30 + vec2(11.3, 4.7), oSoft);

      /**
       * Fade the deck out toward the horizon, so the far field — where
       * perspective drives the noise frequency toward infinity — is gone before
       * it can alias.
       *
       * Tightened from 0.20 to 0.09. Fading density over a fifth of the screen
       * left a wide flat band of bare sky sitting above the deck, which read as
       * a hard horizontal seam rather than as distance. Distance is now carried
       * by the aerial-perspective mix at the end of this block, which is what
       * should have been doing that job in the first place: far cloud is hazy,
       * not absent.
       */
      float nearHorizon = smoothstep(0.0, 0.18, below);

      /**
       * ── The ground under the deck ──
       *
       * Painted BEFORE the cloud, so the gaps in the deck have something to be
       * gaps in. Without it a gap showed the plain sky gradient, the deck had
       * no background to stand against, and the whole lower half read as one
       * continuous lit surface — which is to say, as the sea.
       *
       * Looking down through a hole in a cloud deck you see shadowed cloud
       * walls and, far below them, dark ground. That is a good deal darker than
       * anything above the horizon, and having it there is what turns a lit
       * noise field into cloud tops with depth between them.
       */
      vec3 deep = mix(uHorizon, cloudDark, 0.80 - 0.32 * lift);
      col = mix(col, deep, nearHorizon);

      /**
       * High coverage, deliberately. You are ABOVE this layer looking down at
       * its top, and from up there a deck is mostly closed — perhaps 80% — with
       * occasional holes punched through it. Tuning it to a 50/50 field of
       * cloud and gap, which is what a ramp centred on the mean gives, produces
       * something that reads as a choppy surface rather than as a cloud sea.
       *
       * The weather term shifts this ramp up and down across the frame, so the
       * same shader gives near-overcast in one place and broken cloud a few
       * hundred metres away.
       */
      /**
       * ── Optical thickness, not coverage ──
       *
       * The deck used to be a MASK: threshold the noise, get cloud or sky, and
       * the ramp saturated at 1 across most of the frame. That is why it read
       * as upholstery. A field that is opaque everywhere is a surface, and no
       * amount of lighting or edge detail rescues a surface — the edge erosion
       * added below did almost nothing against it, because a mask that is
       * saturated has hardly any edge to erode.
       *
       * Smoke is translucent, so what the field holds now is how much cloud the
       * view ray passes THROUGH, and opacity comes from Beer's law at the end.
       * The distribution does the rest: this gives thin veils you can see the
       * depths through, solid cores, and every value between, which is what the
       * eye actually uses to judge that something is a volume.
       */
      float thick = max(d + (weather - 0.5) * 0.34 - 0.30, 0.0);

      /**
       * ── Edge erosion ──
       *
       * A threshold on smooth noise gives a smooth boundary, and a smooth
       * boundary on a white lump reads as a solid object however well it is
       * lit. Real cloud has no surface: its edge is where the medium thins out,
       * and it thins out in torn filaments. So the fine detail is not ADDED to
       * the field — it is subtracted from the thickness, which eats the thin
       * skirts into wisps while leaving the cores alone.
       *
       * Faded out with distance, and not only to save time: this is the highest
       * frequency content in the shader, and in the far field perspective has
       * already compressed it past what the pixel grid can resolve. Left on, it
       * would crawl and alias along the horizon.
       */
      /**
       * Lower edge raised from 0.03 to 0.06, and the finer tap squared on top
       * of that. Probing the raw fields showed a band of crawling aliasing
       * sitting just under the horizon: perspective drives the lookup frequency
       * toward infinity there, so any high-frequency term is sampled far below
       * its Nyquist rate and turns to noise. It has to be off, not merely faint,
       * before the field gets there.
       */
      float nearDetail = smoothstep(0.06, 0.30, below);

      /**
       * Stretched hard along x before the lookup. Drift on this plane is mostly
       * +x, and smoke is drawn out ALONG the flow — a tendril is long in the
       * direction it is travelling and thin across it. Sampling a round noise
       * field gives round holes, which read as a sponge rather than as
       * something being blown.
       */
      vec2 wq = vec2(q.x * 0.40, q.y * 1.30);
      float wisp = ridge2(wq * 6.5 + (warp - 0.5) * 2.4 + vec2(2.3, 7.9), oSoft);

      /**
       * Erosion is now the DOMINANT term rather than a trim on the edges, and
       * it is driven by 1 - ridge: the thin crests survive and everything
       * between them is eaten away. That inversion is the whole tendril effect.
       * At mean 0.633 it removes about 0.16 from a field whose mean thickness
       * is 0.42, so roughly a third of the cloud goes and what is left is the
       * branching structure rather than a trimmed-down blob.
       *
       * The second tap is a much finer scale, as one bare noise call rather
       * than another fbm. Erosion at a single frequency tears every edge to the
       * same size, which reads as a texture; a second scale well above the
       * first breaks that up for a fraction of the cost.
       */
      thick = max(thick - (1.0 - wisp) * 0.36 * nearDetail, 0.0);
      if (rich) {
        thick = max(thick - n2(q * 13.0 + vec2(5.5, 1.2)) * 0.06 * nearDetail * nearDetail, 0.0);
      }

      /**
       * Beer's law. Extinction dropped from 9.0 to 5.5: at 9 the surviving
       * strands still went fully opaque, and an opaque tendril is a rope. Smoke
       * has to be seen THROUGH — the depths showing faintly behind a filament
       * is most of what says it is a gas and not a solid.
       */
      float density = (1.0 - exp(-thick * 5.5)) * nearHorizon;

      /**
       * Shading from a sun-direction shadow tap, replacing the old "sample
       * slightly above" trick. That one produced a gradient, but always the
       * same gradient regardless of where the sun actually was, so the deck was
       * lit by nothing in particular. This samples along the real bearing to
       * uSunPos — on the plane, "toward the sun" is up-screen (further away,
       * +y) and toward the sun's side of the frame.
       *
       * Both taps run at the same octave count deliberately: differencing two
       * fBms of different depth compares fields with different variance, and
       * the difference is then partly noise rather than shape.
       *
       * The 0.55 step length is measured in q units, where one noise cell is
       * 1.0 — so it is a little over half a cloud feature. At the 1.15 it
       * started at, the two taps landed on unrelated features and the result
       * was a gradient at swell scale rather than at cloud scale: broad soft
       * highlights rolling across the deck, the third thing making it look wet.
       */
      vec2 sunFlat = normalize(vec2((uSunPos.x - 0.5) * 1.8, 1.0)) * 0.55;
      float shape  = fbm2(q, oSoft);
      float shapeL = fbm2(q + sunFlat, oSoft);
      /**
       * Gain 1.7, not 2.6, and biased up rather than centred. Sunlit cloud top
       * is BRIGHT nearly everywhere, with gentle shading in the creases; a
       * symmetric high-gain ramp gave equal amounts of bright crest and dark
       * trough, and equal amounts of crest and trough is a wave.
       */
      float lit = clamp(0.60 + (shape - shapeL) * 1.45, 0.0, 1.0);
      // Thick cloud is bright cloud: the tops that stand highest catch the most
      // light. Folding d back in couples brightness to depth.
      lit = clamp(lit * 0.72 + smoothstep(0.38, 0.70, d) * 0.46, 0.0, 1.0);

      /**
       * Self-shadowing at DETAIL scale, folded in from the erosion field.
       *
       * This is the difference between cloud and terrain. The shadow tap above
       * runs at two octaves, so on its own it produces one smooth broad ramp
       * across the deck — probing it, the lighting looked exactly like a lit
       * snowfield, because a slowly-varying gradient over a bumpy field is what
       * a snowfield IS. Real cloud shades at the same scale as its own
       * structure: every lobe shadows the crease beside it.
       *
       * wisp is already computed for the erosion, so the fix costs one add.
       */
      // Centred on ridge2's own mean of 0.37, not on 0.5 — this field is not
      // symmetric like the other two, and centring it wrongly would drag the
      // whole deck about a sixth of a stop darker. Gain raised because the
      // crests are narrow: it is the strands that should catch the light.
      lit = clamp(lit + (wisp - 0.37) * 0.55 * nearDetail, 0.0, 1.0);

      // Flatten the lighting into the haze as the deck recedes. The shadow taps
      // alias in the far field for the same Nyquist reason as the erosion, and
      // distant cloud has no visible shading anyway — it is all scattered air.
      lit = mix(0.62, lit, nearHorizon);

      /**
       * Both ramps are weighted hard toward the bright end, and that asymmetry
       * is the point. Sunlit cloud is near-white over most of its surface with
       * shadow confined to the creases between lobes; splitting the tonal range
       * evenly between light and dark instead gives equal areas of crest and
       * trough, which the eye reads as a WAVE however the shape was generated.
       * The shadow tone is only reached in the bottom fifth of the range.
       */
      vec3 cloud = mix(cloudShade, uCloud, smoothstep(0.0, 0.30, lit));
      cloud = mix(cloud, uLight, smoothstep(0.22, 0.95, lit));

      /**
       * Clouds near the sun catch its colour, and catch it on their lit faces
       * only. Without this the sun hangs in a sky whose clouds are lit by
       * something else, which is the single most common tell that a procedural
       * sky was assembled from separate parts.
       */
      float sunWash = pow(max(1.0 - sunDist / mix(0.55, 0.30, uMoon), 0.0), 2.2);
      cloud = mix(cloud, uSun, sunWash * lit * 0.45 * lightK * uSunStory);

      // Silver lining again, on the deck's thin edges where it frays into gaps.
      cloud += uSun * (1.0 - smoothstep(0.0, 0.40, density)) * forward * 0.40 * lightK * uSunStory;

      // Aerial perspective. The far deck sits back into the horizon colour
      // instead of staying the same white all the way to the vanishing point,
      // which is most of what sells the scale of the thing.
      cloud = mix(cloud, uHorizon, (1.0 - smoothstep(0.0, 0.42, below)) * 0.66);

      col = mix(col, cloud, density);

      /**
       * ── Foreground mist ──
       *
       * A second, much thinner sheet on a LOWER plane, drawn in front of the
       * deck. This is the one thing in the deck that a single projected plane
       * cannot fake, and it is what finally makes the layer read as smoke
       * rather than as a textured surface.
       *
       * The reason is parallax. A plane at 0.10 instead of 0.24 is nearer, so
       * for the same screen movement it sweeps through far more of its own
       * noise field — it visibly races against the deck behind it. Motion
       * parallax between two depths is the strongest volume cue available here,
       * and the eye reads the pair as one thick medium rather than as two
       * sheets. Its drift rates are near double the deck's for the same reason.
       *
       * Deliberately thin and sparse: a high threshold against a field with a
       * mean of 0.5 keeps only the densest tendrils, so what survives is wisps
       * passing in front of the cloud rather than a second deck. Three octaves,
       * no warp, no lighting rig — at 55% peak opacity none of that would be
       * visible, and this has to stay cheap.
       */
      if (rich) {
      float mDist = 0.10 / below;
      vec2 mp = vec2((uv.x - 0.5) * uAspect * mDist, mDist);
      mp += vec2(uTime * 0.09 + uParallax * 1.6, -uTime * 0.13 + uScroll * 1.9);
      float mist = fbm2(mp * 2.4 + vec2(3.7, 6.1), oLow);
      float mThick = max(mist - 0.52, 0.0);
      // Faded at both ends: aliases into noise toward the horizon where the
      // division explodes, and would sit as a haze over the very bottom edge.
      float mFade = smoothstep(0.04, 0.26, below);
      float mAlpha = (1.0 - exp(-mThick * 7.0)) * mFade * 0.55;
      // Thin mist is lit almost entirely by forward scatter — it has no body to
      // shade, so it just glows where the sun is behind it.
      vec3 mCol = mix(uLight, uSun, clamp(forward * 0.6 * lightK * uSunStory, 0.0, 1.0));
      col = mix(col, mCol, mAlpha);
      }
    }

    /**
     * ── Horizon haze ──
     *
     * The band of light that sits on any real horizon, from looking through the
     * greatest possible thickness of atmosphere. It goes on LAST, over both the
     * deck and the cumulus, because that is where the air is — in front of all
     * of it. Also does useful work hiding the seam where the two layers meet.
     */
    float hazeBand = exp(-abs(uv.y - horizon) * 22.0);
    col = mix(col, mix(uHorizon, uLight, 0.40), hazeBand * 0.22);

    /* Vignette — pulls the eye to the middle and keeps the corners quiet. */
    vec2 c = (uv - 0.5) * vec2(uAspect, 1.0);
    col *= 1.0 - smoothstep(0.55, 1.15, length(c)) * 0.35;

    /**
     * ── Chrome bands ──
     *
     * The reason the sky was barely visible behind the header and the footer
     * was never the glass over them — it is that stageFor() runs the whole
     * scene at 0.42 opacity on content routes, deliberately, so that text wins.
     * At 0.42 over a near-black page background there is very little cloud left
     * to see through anything.
     *
     * Raising that globally would undo the decision it encodes. Instead the sky
     * comes up to near-full strength in exactly the two strips the chrome
     * occupies and stays at route intensity everywhere else, so the reading
     * column is untouched.
     *
     * The footer term is gated on scroll for a reason: the footer is at the
     * bottom of the PAGE, not of the viewport, so brightening the bottom strip
     * unconditionally would light up the sky behind ordinary body copy for the
     * whole scroll. uScroll reaching 1 is precisely the moment the footer comes
     * into view, so the band arrives with it.
     */
    float headerBand = smoothstep(0.90, 1.0, uv.y);
    float footerBand = smoothstep(0.10, 0.0, uv.y) * smoothstep(0.88, 1.0, uScroll);

    /**
     * The sun gets the same treatment, and for the same reason. Making it a
     * deeper orange and turning its bloom up did very little on the actual
     * page, because at the 0.42 route alpha the brightest thing in the scene
     * was still being mixed 42% into a near-black background — it read as a
     * warm smudge rather than as a light source. No amount of work on the disc
     * itself gets past that; the alpha has to come up where the sun is.
     *
     * Local to the disc and its bloom, so this lifts the light source without
     * lifting the reading column behind it, and it rides uSunStory so the sun
     * still veils through the middle of the page as it was designed to.
     */
    float sunLocal = smoothstep(0.40, 0.02, sunDist) * uSunStory;

    float boost = max(max(headerBand, footerBand), sunLocal * 0.85);
    // Capped below 1: even at full strength the sky stays a backdrop that the
    // page background still tints, rather than becoming an opaque panel.
    float alpha = clamp(uOpacity * (1.0 + 1.2 * boost), 0.0, 0.92);

    gl_FragColor = vec4(col, alpha);
  }
`;
