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
 * The effect itself is a fragment shader on a fullscreen quad — perhaps 80
 * lines. Writing it directly keeps one context, one loop, and full control.
 *
 * ── The perspective trick ──
 * The clouds are not raymarched volume; that would cost an order of magnitude
 * more for a background. They are a flat noise field projected onto an infinite
 * horizontal plane below the viewer: for a screen row below the horizon, the
 * distance to the plane is `height / (horizon - y)`. That single division is
 * what makes the field recede and compress toward the horizon, which is the
 * whole read of "above the clouds".
 */

/**
 * 2D value noise + fBm. Separate from the 3D version in core-object.ts — this
 * one is sampled per PIXEL rather than per vertex, so it is deliberately the
 * cheaper two-dimensional form.
 */
const NOISE2 = /* glsl */ `
  float h21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float n2(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(h21(i), h21(i + vec2(1.0, 0.0)), u.x),
      mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm2(vec2 p, int octaves) {
    float v = 0.0;
    float a = 0.5;
    // WebGL1 requires a constant loop bound, so the count is a compile-time
    // constant and the octave budget is applied with a break.
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      v += a * n2(p);
      p = p * 2.02 + vec2(37.1, 11.7);
      a *= 0.5;
    }
    return v;
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
  uniform float uParallax;
  uniform float uSunStory;
  varying vec2 vUv;
  ${NOISE2}

  void main() {
    vec2 uv = vUv;

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
    float disc  = smoothstep(0.068, 0.022, sunDist);
    float bloom = pow(max(1.0 - sunDist / 0.34, 0.0), 2.6);
    /**
     * Radius pulled in from 1.25 to 0.62. At 1.25 the scatter reached past the
     * far corner of the viewport, so the sun was not lighting the sky near it —
     * it was grading the entire frame warm. A sun should brighten the air
     * around itself and leave the rest of the sky its own colour.
     */
    float scatter = pow(max(1.0 - sunDist / 0.62, 0.0), 2.4) * 0.42;

    /**
     * uSunStory is the scroll narrative: 1 at the hero, dipping to ~0.55 through
     * the middle of the page, returning to 1 at the contact horizon. It scales
     * the sun's atmospheric contribution rather than the disc, so the sun never
     * disappears — it is veiled and then clears, which is what a sun behind
     * moving cloud actually does.
     */
    col = mix(col, uSun, clamp(scatter * 0.5 * uSunStory, 0.0, 1.0));
    col += uSun * bloom * 0.55 * uSunStory;
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
    float rays = n2(vec2(ang * 3.4, uTime * 0.05)) * 0.6
               + n2(vec2(ang * 9.1, uTime * 0.03 + 11.0)) * 0.4;
    /**
     * Softened from a 0.42→0.95 ramp at 0.30 strength, which produced defined
     * spokes — precisely the cartoon beams the art direction rules out. A wider
     * ramp blurs the shaft edges and the lower strength keeps them as light in
     * the air rather than as geometry.
     */
    rays = smoothstep(0.34, 1.05, rays);
    float rayFall = pow(max(1.0 - sunDist / 0.95, 0.0), 2.0);
    col += uSun * rays * rayFall * 0.17 * uSunStory;

    col = mix(col, uSun, disc);

    // High wisps, well above the deck. Stretched hard in x so they read as
    // drawn out by wind rather than as a second layer of the same clouds.
    float wisp = fbm2(vec2(uv.x * uAspect * 2.2 + uTime * 0.010, uv.y * 7.0), uOctaves - 1);
    col = mix(col, uLight, smoothstep(0.55, 0.95, wisp) * above * 0.28);

    /**
     * A second, higher band drifting the OTHER way at half the speed. One layer
     * moving one direction reads as a texture scrolling; two at different rates
     * and directions read as depth, because the eye picks up the relative
     * motion between them. This is the cheapest parallax in the scene.
     */
    float high = fbm2(vec2(uv.x * uAspect * 1.3 - uTime * 0.005 + uParallax * 0.4,
                           uv.y * 4.2), uOctaves - 2);
    col = mix(col, uLight, smoothstep(0.62, 1.0, high) * above * 0.16);

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
      p += vec2(uTime * 0.035, -uTime * 0.055 + uScroll * 1.2);

      // Domain warp — one extra fbm perturbing the lookup. This is what turns
      // regular billowy noise into something that reads as weather.
      vec2 warp = vec2(
        fbm2(p * 1.1 + vec2(1.7, 9.2), uOctaves - 2),
        fbm2(p * 1.1 + vec2(8.3, 2.8), uOctaves - 2)
      );

      /**
       * Frequency 3.0, not 0.85. Perspective squeezes the sampled region hard:
       * at the bottom of the frame the projected span is well under one noise
       * cell wide, so at the original scale the whole foreground resolved to a
       * single flat value and the deck simply was not there.
       */
      float d = fbm2(p * 3.0 + warp * 1.2, uOctaves);

      // Fade the deck out toward the horizon so it meets the sky in haze rather
      // than at a hard edge — and so the far field, where perspective drives
      // the noise frequency toward infinity, is gone before it can alias.
      float nearHorizon = smoothstep(0.0, 0.20, below);

      /**
       * Thresholds matched to the actual distribution of this fBm. Value noise
       * summed over five halving octaves has a mean near 0.48 and rarely passes
       * 0.75 — so the original smoothstep(0.42, 0.78) sat almost entirely above
       * the data and returned ~0.07 nearly everywhere. Centring the ramp on the
       * mean is what makes the clouds exist at all.
       */
      float density = smoothstep(0.34, 0.66, d) * nearHorizon;

      /**
       * Fake self-shadowing. Sampling the field again slightly "above" gives a
       * cheap gradient: where the cloud thickens upward the top is lit and the
       * underside stays dark. No light rig, one extra fbm.
       */
      float lift = fbm2(p * 3.0 + warp * 1.2 + vec2(0.0, -0.30), uOctaves - 1);
      float lit = clamp((lift - d) * 2.4 + 0.5, 0.0, 1.0);

      vec3 cloud = mix(uCloud, uLight, lit);

      /**
       * Clouds near the sun catch its colour, and catch it on their lit faces
       * only. Without this the sun hangs in a sky whose clouds are lit by
       * something else, which is the single most common tell that a procedural
       * sky was assembled from separate parts.
       */
      float sunWash = pow(max(1.0 - sunDist / 0.55, 0.0), 2.2);
      cloud = mix(cloud, uSun, sunWash * lit * 0.45);

      col = mix(col, cloud, density);
    }

    /* Vignette — pulls the eye to the middle and keeps the corners quiet. */
    vec2 c = (uv - 0.5) * vec2(uAspect, 1.0);
    col *= 1.0 - smoothstep(0.55, 1.15, length(c)) * 0.35;

    gl_FragColor = vec4(col, uOpacity);
  }
`;
