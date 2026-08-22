"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { DigitalField } from "@/components/lab/digital-field";
import {
  getSceneMode,
  getSceneModeServer,
  subscribeSceneMode,
} from "@/components/three/scene-mode";
import { SKY_FRAG, SKY_VERT } from "@/components/three/cloud-sky";
import {
  BIRD_FRAG,
  BIRD_VERT,
  buildDust,
  buildFlock,
  DUST_COUNT,
  DUST_FRAG,
  DUST_VERT,
} from "@/components/three/birds";

/**
 * ═════════════════════════════════════════════════════════════════════════
 * IMMERSIVE SCENE — one persistent WebGL field behind the whole site.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Mounted once in the root layout, so it survives client-side navigation. That
 * persistence is the entire point of putting it in the layout rather than in a
 * page: the scene is a place the site sits inside, and re-initialising WebGL on
 * every route change would both break that illusion and pay the setup cost
 * repeatedly.
 *
 * ── The rule this file must never break ──
 * NOTHING readable is rendered here. Every word on this site stays HTML. The
 * scene is a backdrop, `aria-hidden`, `pointer-events: none`, at `z-index: -1`.
 * A crawler, a screen reader, a browser with WebGL blocked, or a visitor who
 * asked for reduced motion all get the complete site with nothing missing —
 * they simply get it without the depth.
 *
 * ── Four gates before a single byte of Three.js is fetched ──
 *   1. `prefers-reduced-motion` — a moving camera is a vestibular trigger.
 *   2. WebGL support — probed with a throwaway context, not assumed.
 *   3. Device memory / core count — a cheap proxy for "will this be 15fps?".
 *   4. Tab visibility — a hidden tab renders nothing.
 * Failing 1–3 renders <DigitalField/>, the Canvas 2D field, instead. That is
 * not a degraded placeholder; it is the thing that shipped last week and it
 * looks deliberate on its own.
 *
 * ── Intensity is per-route, deliberately ──
 * This site's job is to get someone hired. On the editorial routes the field is
 * held right back so it never competes with body copy for attention or
 * contrast; on /lab, which exists to be looked at, it runs at full strength.
 * One scene, two registers.
 */

/**
 * Per-route presence. Now that the scene is a sky rather than an object, this
 * is a single number: how strongly the environment paints. /lab gets the full
 * cloudscape; the editorial routes get it at 42%, where it reads as weather
 * behind the page and never competes with body copy for contrast.
 */
type Stage = { intensity: number };

function stageFor(pathname: string): Stage {
  if (pathname.startsWith("/lab")) return { intensity: 1 };
  if (pathname.startsWith("/noc")) return { intensity: 0 };
  // Editorial routes: present, never loud. Text wins.
  return { intensity: 0.42 };
}


/** Probe rather than assume. Some browsers report the API but fail to create. */
function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return false;
    // Release immediately — this context exists only to answer the question.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Cheap "is this machine going to cope" heuristic. Both hints are optional. */
function lowPowered() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory <= 2) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 2)
    return true;
  return false;
}

function readTokens() {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const dark = root.classList.contains("dark");
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  return {
    dark,
    ink: dark ? "#f5f7fa" : "#0f1620",
    accent: v("--accent", "#ffb84d"),
    /**
     * Cloudscape palette. Tinted to the site rather than to a photographic
     * blue sky — the reference is a blue daylight scene, and dropping that
     * behind an amber-on-schematic identity would read as a stock background
     * someone pasted in. Dark is a night deck lit amber from below the horizon;
     * light is a pale overcast on the existing paper tone.
     */
    /**
     * The first dark palette was every value between #05 and #1c — technically
     * a night sky, visually a black rectangle. A night cloudscape still needs
     * cloud FORMS to read, so the deck sits well above the page background and
     * the horizon carries a real amber glow to light it from below.
     */
    sky: dark ? "#080d18" : "#ccd9e6",
    /**
     * Dark horizon is dusk-violet, not the brown it was. A warm horizon plus a
     * warm sun made the whole night sky read orange — the exact thing the
     * palette was moved off. Cooling the sky lets the sun stay warm as a LOCAL
     * light source, which is what a sun should be, without tinting everything.
     */
    /**
     * Both horizons are now COOL. The light one was a warm cream (#f3e3cb) that
     * filled the lower half of the frame and tinted the entire page tan — a
     * golden-hour sky is lovely in isolation and wrong as a permanent
     * background for a portfolio. Warmth now comes only from the sun itself,
     * as a local light rather than a global grade.
     */
    horizon: dark ? "#363c54" : "#e4ebf1",
    /**
     * ── The dark deck was being crushed twice, not once ──
     *
     * #222c3d is a perfectly reasonable night cloud in isolation. On the page
     * it was not visible, and the reason is that the sky is composited at the
     * route's 0.42 over a #05070a background: #222c3d lands at about #10161f
     * and the sky behind it at about #06090f. Nine levels of separation between
     * cloud and sky, across the whole frame — the forms were there and there
     * was nothing left to see them by.
     *
     * The tokens have to carry that reduction themselves, because the alpha is
     * a deliberate decision about body copy and is not the thing to trade. Both
     * are raised together so the light-to-cloud ratio the shader reads as
     * `palRange` stays near 10 and the shadow lift it derives does not change
     * character — raising only the cloud would have flattened the deck into one
     * tone at the same time as making it visible.
     */
    cloud: dark ? "#38455d" : "#b9c6d4",
    light: dark ? "#a4b2c8" : "#ffffff",
    /**
     * The sun is warm in both themes and deliberately NOT the brand accent.
     * A blue sun is absurd; a sun the colour of the UI turns a light source
     * into a logo.
     *
     * DEEP ORANGE, on an explicit request, replacing the pale gold/cream this
     * used to be. Worth knowing why the pale version existed: an earlier
     * palette paired a warm horizon with a warm sun and the entire night sky
     * came out orange, so both were cooled. Only the horizon needed to be — the
     * sun is a LOCAL light, and the shader has since pulled its scatter radius
     * in from 1.25 to 0.62 so its warmth stays near the disc instead of grading
     * the whole frame. That is what makes a saturated sun safe again.
     *
     * Still distinct from --accent (#ffb84d): this is redder and deeper, so the
     * sun never reads as the brand mark. The disc itself is not this colour on
     * screen — the shader burns a near-white core into it, because a bright sun
     * with a deep-orange halo is exactly what a low sun looks like.
     *
     * DARK IS A MOON, not a dimmer sun. The two are different objects and the
     * shader draws them differently (see uMoon) — this token only carries the
     * colour. Cool pale white rather than the photographic ivory a full moon
     * actually is, because against a near-black sky the eye reads a neutral
     * disc as warm; biasing it blue is what makes it look like moonlight.
     *
     * It is also roughly twice the luminance of the orange sun, which is the
     * right way round: a full moon is the brightest thing in a night sky by a
     * wide margin, and the sky it sits in is dark enough to take it.
     */
    sun: dark ? "#e8eef8" : "#ffa757",
    // The iridescence interpolates across these — all three are existing
    // design tokens, so the object can never show an off-palette colour.
    coral: v("--coral", dark ? "#ff8d99" : "#dd6f7c"),
    tech: v("--tech", dark ? "#4fd3ec" : "#0e7f96"),
  };
}

export function ImmersiveScene() {
  const pathname = usePathname();
  /**
   * Only the fallback needs this as React state — the WebGL loop reads the
   * store directly. Subscribing here costs one re-render per section change and
   * only while the 2D field is the thing on screen.
   */
  const fallbackMode = useSyncExternalStore(
    subscribeSceneMode,
    getSceneMode,
    getSceneModeServer,
  );
  const mount = useRef<HTMLDivElement>(null);
  /** null = still deciding; true = WebGL running; false = use the 2D fallback. */
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const stageRef = useRef<Stage>(stageFor(pathname));

  useEffect(() => {
    stageRef.current = stageFor(pathname);
  }, [pathname]);

  useEffect(() => {
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    let disposed = false;
    let cleanup: (() => void) | null = null;

    async function boot() {
      if (reduceQuery.matches || !webglAvailable() || lowPowered()) {
        setWebgl(false);
        return;
      }

      /**
       * Dynamic import, so Three.js is a separate chunk that is fetched only
       * after the document is interactive — and never at all on a device that
       * failed a gate above. This is what keeps the editorial routes fast for
       * the person who is only here to read a CV.
       */
      const THREE = await import("three");
      if (disposed || !mount.current) return;

      const host = mount.current;
      let tokens = readTokens();

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      // DPR capped at 1.5: this is a field of soft dots, and the fill-rate cost
      // of a 3x retina buffer buys nothing you can see.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearAlpha(0);
      renderer.autoClear = false;
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 1, 900);
      camera.position.set(0, 0, 120);

      /* ── Sky ──────────────────────────────────────────────────────── */

      /**
       * Its own scene and camera. The cloudscape is a fullscreen quad already
       * in clip space, so it needs no camera transform at all — but Three still
       * requires a camera to render, and giving it a dedicated pass means the
       * perspective scene above can be cleared and drawn independently.
       */
      const skyScene = new THREE.Scene();
      const skyCamera = new THREE.Camera();

      const uniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uOpacity: { value: 0 },
        uAspect: { value: window.innerWidth / Math.max(window.innerHeight, 1) },
        // Octave budget is the single biggest lever on fill cost here, and this
        // shader runs per pixel across the whole viewport. Phones get three.
        uOctaves: { value: coarse.matches ? 3 : 5 },
        uSky: { value: new THREE.Color(tokens.sky) },
        uHorizon: { value: new THREE.Color(tokens.horizon) },
        uCloud: { value: new THREE.Color(tokens.cloud) },
        uLight: { value: new THREE.Color(tokens.light) },
        uSun: { value: new THREE.Color(tokens.sun) },
        // Upper left, above the deck. Off-centre so the sky has a direction —
        // a sun dead centre flattens the whole scene into a target.
        uSunPos: { value: new THREE.Vector2(0.22, 0.80) },
        // Stars belong to the night sky only — on the light theme they would
        // read as dust on the screen.
        uStars: { value: tokens.dark ? 1 : 0 },
        /**
         * Which body is in the sky: 0 = sun, 1 = moon. Shares its source with
         * uStars — both are "is it night" — but stays a separate uniform,
         * because they are separate decisions. A daytime moon is a real thing
         * and starless night is a plausible art direction; collapsing the two
         * into one flag would make either impossible to express.
         */
        uMoon: { value: tokens.dark ? 1 : 0 },
        uParallax: { value: 0 },
        uSunStory: { value: 1 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });
      const geometry = new THREE.PlaneGeometry(2, 2);
      skyScene.add(new THREE.Mesh(geometry, material));

      /* ── Birds ────────────────────────────────────────────────────── */

      /**
       * The glowing core object that used to sit here is gone. It was a
       * signature element for a scene that no longer exists: against a sky with
       * a sun in it, a luminous lattice sphere read as a second, competing
       * light source with no reason to be there. The sky is the subject now.
       */
      const flock = buildFlock();
      const birdGeo = new THREE.BufferGeometry();
      birdGeo.setAttribute("position", new THREE.BufferAttribute(flock.position, 3));
      // vec2: (travel offset along the crossing, wingbeat phase). They are two
      // unrelated clocks and sharing one attribute for both, as this did, meant
      // a bird's position in the sky decided where its wings were.
      birdGeo.setAttribute("aPhase", new THREE.BufferAttribute(flock.phase, 2));
      birdGeo.setAttribute("aSpeed", new THREE.BufferAttribute(flock.speed, 1));
      birdGeo.setAttribute("aScale", new THREE.BufferAttribute(flock.scale, 1));
      birdGeo.setAttribute("aPath", new THREE.BufferAttribute(flock.path, 3));
      // Positions are computed in the shader, so the derived bounding sphere
      // would be a point at the origin and the whole flock would be culled.
      birdGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);

      const birdUniforms = {
        uTime: uniforms.uTime,
        uAspect: uniforms.uAspect,
        // Birds are silhouettes: dark on the light sky, and still dark on the
        // night sky, where they read against the lit cloud tops.
        uInk: { value: new THREE.Color(tokens.dark ? "#0a0e16" : "#2b3644") },
        uOpacity: { value: 0 },
        /**
         * Drawing-buffer height. The birds' antialias width is derived from how
         * many pixels each one actually covers, and that cannot be known
         * without it — a fixed feather looks crisp on the near birds and
         * dissolves the far ones.
         */
        uHeight: { value: renderer.domElement.height },
      };
      const birdMat = new THREE.ShaderMaterial({
        uniforms: birdUniforms,
        vertexShader: BIRD_VERT,
        fragmentShader: BIRD_FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      // Drawn in the sky pass — they belong to the backdrop, not to the
      // perspective scene, and their vertex shader already emits clip space.
      skyScene.add(new THREE.Mesh(birdGeo, birdMat));

      /* ── Atmospheric dust ─────────────────────────────────────────── */

      const dust = buildDust();
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dust.position, 3));
      dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dust.seed, 1));
      dustGeo.setAttribute("aSize", new THREE.BufferAttribute(dust.size, 1));
      dustGeo.setAttribute("aDepth", new THREE.BufferAttribute(dust.depth, 1));
      dustGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);

      const dustUniforms = {
        uTime: uniforms.uTime,
        uDpr: { value: renderer.getPixelRatio() },
        uParallax2: { value: new THREE.Vector2() },
        uTint: { value: new THREE.Color(tokens.dark ? "#fff7e6" : "#8a5410") },
        uOpacity: { value: 0 },
      };
      const dustMat = new THREE.ShaderMaterial({
        uniforms: dustUniforms,
        vertexShader: DUST_VERT,
        fragmentShader: DUST_FRAG,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        // Motes are lit specks on the dark theme, so they add light there and
        // composite normally on the light one.
        blending: tokens.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const dustPoints = new THREE.Points(dustGeo, dustMat);
      // Drawn last in the sky pass: this is the foreground layer.
      dustPoints.renderOrder = 2;
      skyScene.add(dustPoints);
      void DUST_COUNT;

      /* ── Drive ────────────────────────────────────────────────────── */

      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      let scrollNorm = 0;
      let targetScroll = 0;
      let raf = 0;
      let running = false;
      /**
       * Hand-rolled clock rather than THREE.Clock (deprecated in 0.185 in
       * favour of THREE.Timer) or THREE.Timer itself. `performance.now()` needs
       * neither, and it lets the per-frame delta be CLAMPED — which matters:
       * returning to a backgrounded tab hands you a delta of many seconds, and
       * an unclamped one teleports the whole field instead of resuming it.
       */
      let elapsed = 0;
      let lastFrame = 0;

      function applyTokens() {
        tokens = readTokens();
        uniforms.uSky.value.set(tokens.sky);
        uniforms.uHorizon.value.set(tokens.horizon);
        uniforms.uCloud.value.set(tokens.cloud);
        uniforms.uLight.value.set(tokens.light);
        uniforms.uSun.value.set(tokens.sun);
        birdUniforms.uInk.value.set(tokens.dark ? "#0a0e16" : "#2b3644");
        uniforms.uStars.value = tokens.dark ? 1 : 0;
        uniforms.uMoon.value = tokens.dark ? 1 : 0;
        dustUniforms.uTint.value.set(tokens.dark ? "#fff7e6" : "#8a5410");
        const blend = tokens.dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        dustMat.blending = blend;
        dustMat.needsUpdate = true;
        material.needsUpdate = true;
      }

      function frame() {
        raf = requestAnimationFrame(frame);
        const now = performance.now();
        // 100ms ceiling: a long pause resumes, it does not fast-forward.
        elapsed += Math.min((now - lastFrame) / 1000, 0.1);
        lastFrame = now;
        uniforms.uTime.value = elapsed;

        // Ease everything. Raw scroll and raw pointer both feel mechanical, and
        // on a background layer that reads as jitter rather than as response.
        scrollNorm += (targetScroll - scrollNorm) * 0.05;
        pointer.x += (pointer.tx - pointer.x) * 0.04;
        pointer.y += (pointer.ty - pointer.y) * 0.04;
        uniforms.uScroll.value = scrollNorm;

        /**
         * Pointer moves the CAMERA, not the terrain. Small numbers on purpose —
         * this is a backdrop, and a background that swings about behind body
         * copy is the thing that makes people close the tab.
         */
        camera.position.x = pointer.x * 40;
        camera.position.y = -pointer.y * 26;
        camera.lookAt(pointer.x * 12, -pointer.y * 8, -600);

        /**
         * Mode weights, read straight from the module store — no React in this
         * loop. /lab's sections reshape the landform: `lattice` sharpens it
         * toward a machined grid, `converge` and `calm` flatten it, `stream`
         * runs it faster.
         */
        const active = getSceneMode();
        const ease = (u: { value: number }, to: number) => {
          u.value += (to - u.value) * 0.03;
        };
        // The sky has no per-section morph; /lab's modes are expressed by the
        // page itself now, so the store is read only to keep the fallback in
        // sync. `active` stays referenced deliberately — see the 2D field.
        void active;
        void ease;

        const target = stageRef.current.intensity;

        /**
         * The sky is the page's backdrop, not an overlay on it, so its ceiling
         * is 1 — at 0.5 it half-blended with --bg underneath and the cloud
         * forms washed out to nothing. Route intensity still scales it, which
         * is what keeps it an atmospheric hint on the editorial pages.
         */
        uniforms.uOpacity.value += (target - uniforms.uOpacity.value) * 0.035;
        // Birds fade in behind the sky so they never arrive before the air does.
        birdUniforms.uOpacity.value += (target - birdUniforms.uOpacity.value) * 0.03;
        // Dust is the faintest layer in the stack, by a wide margin.
        dustUniforms.uOpacity.value += (target * 0.5 - dustUniforms.uOpacity.value) * 0.03;

        /**
         * Layered parallax. Each layer gets a different multiplier off the same
         * eased pointer, which is what produces depth rather than a uniform
         * wobble: stars barely move, the sky moves a little, dust moves most.
         */
        uniforms.uParallax.value = pointer.x * 0.06;

        /**
         * The sun's arc across the page. `sin(progress * PI)` is 0 at both ends
         * and 1 in the middle, so subtracting it gives full sun at the hero,
         * softest through the body, and full sun again as the reader reaches
         * the contact section — the horizon they started from.
         */
        uniforms.uSunStory.value = 1 - 0.45 * Math.sin(scrollNorm * Math.PI);
        dustUniforms.uParallax2.value.set(pointer.x, -pointer.y);

        /**
         * Two passes, one context. The sky (and the flock, which shares its
         * clip-space pass) is drawn first with depth testing off; the depth
         * buffer is then cleared so anything in the perspective scene
         * composites over it. `autoClear` is off so pass two does not wipe one.
         */
        renderer.clear();
        renderer.render(skyScene, skyCamera);
        renderer.clearDepth();
        renderer.render(scene, camera);
      }

      function start() {
        if (running) return;
        running = true;
        lastFrame = performance.now();
        raf = requestAnimationFrame(frame);
      }
      function stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }

      function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Aspect feeds both the sky's sun placement and the birds' scaling —
        // miss it and the sun becomes an ellipse and the flock stretches.
        uniforms.uAspect.value = window.innerWidth / Math.max(window.innerHeight, 1);
        dustUniforms.uDpr.value = renderer.getPixelRatio();
        // Drawing-buffer pixels, not CSS pixels — this feeds an antialias width
        // and has to follow the device pixel ratio, not the layout.
        birdUniforms.uHeight.value = renderer.domElement.height;
      }
      function onScroll() {
        const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        targetScroll = Math.min(window.scrollY / max, 1);
      }
      function onPointer(e: PointerEvent) {
        pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
      }
      function onVisibility() {
        if (document.hidden) stop();
        else start();
      }
      /**
       * A lost context is not a crash to let bubble — the GPU can reclaim one
       * at any time, especially on mobile. Tear down and hand over to the 2D
       * field rather than leaving a dead black canvas over the page.
       */
      function onLost(e: Event) {
        e.preventDefault();
        stop();
        setWebgl(false);
      }

      window.addEventListener("resize", onResize, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      renderer.domElement.addEventListener("webglcontextlost", onLost);

      const themeObserver = new MutationObserver(applyTokens);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      const onReduce = () => {
        if (reduceQuery.matches) {
          stop();
          setWebgl(false);
        }
      };
      reduceQuery.addEventListener("change", onReduce);

      onScroll();
      start();
      setWebgl(true);
      // Lets CSS know a live field is running, so the static aurora orbs can
      // step back rather than competing with it. See `.scene-layer` in
      // globals.css.
      document.documentElement.dataset.scene = "on";

      cleanup = () => {
        stop();
        delete document.documentElement.dataset.scene;
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointer);
        document.removeEventListener("visibilitychange", onVisibility);
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        reduceQuery.removeEventListener("change", onReduce);
        themeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        birdGeo.dispose();
        birdMat.dispose();
        dustGeo.dispose();
        dustMat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }

    void boot();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <>
      <div ref={mount} aria-hidden className="scene-layer" />
      {/* The Canvas 2D field covers reduced motion, no WebGL, low-power devices
          and context loss. Rendered only once that decision is made, so the two
          never paint at the same time. */}
      {webgl === false ? <DigitalField mode={fallbackMode} /> : null}
    </>
  );
}
