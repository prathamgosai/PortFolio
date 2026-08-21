"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { DigitalField } from "@/components/lab/digital-field";
import {
  getSceneMode,
  getSceneModeServer,
  subscribeSceneMode,
} from "@/components/three/scene-mode";
import {
  buildTerrain,
  TERRAIN_FRAG,
  TERRAIN_VERT,
} from "@/components/three/scene-geometry";
import {
  buildOrbits,
  CORE,
  CORE_FRAG,
  CORE_VERT,
  HALO_FRAG,
  HALO_VERT,
  LATTICE_FRAG,
  LATTICE_VERT,
  ORBIT_COUNT,
  ORBIT_FRAG,
  ORBIT_VERT,
} from "@/components/three/core-object";

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
 * Per-route staging. Not just an opacity — the object is a different SIZE and
 * sits in a different place depending on what the page needs from it.
 *
 * On /lab the hero is a left-aligned column with an entirely empty right half,
 * so the core can be a genuine hero element at 1.6x. On the editorial routes
 * that same region holds the portrait card and body copy, so it shrinks and
 * pulls back to a halo behind them. Sizing one object for both would mean it is
 * too small to matter on one and in the way on the other.
 */
type Stage = { intensity: number; scale: number; x: number; y: number };

function stageFor(pathname: string): Stage {
  if (pathname.startsWith("/lab")) {
    /**
     * 1.15x, not the 1.6x this was first set to. At 1.6 the object genuinely
     * read as a hero element — and also sat squarely on the metrics row and
     * clipped off the right edge of the viewport. Big enough to be the subject,
     * small enough to own its own space beside the text rather than under it.
     */
    return { intensity: 1, scale: 1.15, x: 314, y: 300 };
  }
  if (pathname.startsWith("/noc")) {
    return { intensity: 0, scale: 1, x: CORE.position[0], y: CORE.position[1] };
  }
  // Editorial routes: present, never loud. Text wins.
  return { intensity: 0.42, scale: 0.8, x: CORE.position[0], y: CORE.position[1] };
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
    accent: v("--accent", "#e39a2c"),
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
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 1, 900);
      camera.position.set(0, 0, 120);

      /* ── Geometry ─────────────────────────────────────────────────── */

      const gridPositions = buildTerrain(coarse.matches);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(gridPositions, 3));

      const uniforms = {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uAmp: { value: 1 },
        uSharp: { value: 0 },
        uFar: { value: 3600 },
        uInk: { value: new THREE.Color(tokens.ink) },
        uAccent: { value: new THREE.Color(tokens.accent) },
        uOpacity: { value: 0 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: TERRAIN_VERT,
        fragmentShader: TERRAIN_FRAG,
        transparent: true,
        depthWrite: false,
        /**
         * Additive on dark so crossing contours accumulate into brighter
         * ridges, the way a light source would. On a near-white canvas additive
         * blows straight out to white, so light composites normally and the
         * lines read as ink instead.
         */
        blending: tokens.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });

      const terrain = new THREE.LineSegments(geometry, material);
      scene.add(terrain);

      /* ── The Core ─────────────────────────────────────────────────── */

      const coreUniforms = {
        uTime: uniforms.uTime,
        uPulse: { value: 1 },
        uAccent: { value: new THREE.Color(tokens.accent) },
        uCoral: { value: new THREE.Color(tokens.coral) },
        uTech: { value: new THREE.Color(tokens.tech) },
        uOpacity: { value: 0 },
      };

      /**
       * Detail 4 on a coarse pointer would be ~5k triangles for an object that
       * is a third of the size on screen. The silhouette is what reads; the
       * tessellation only has to be fine enough that the noise displacement
       * does not facet.
       */
      const coreGeo = new THREE.IcosahedronGeometry(CORE.radius, coarse.matches ? 3 : 5);
      const coreMat = new THREE.ShaderMaterial({
        uniforms: coreUniforms,
        vertexShader: CORE_VERT,
        fragmentShader: CORE_FRAG,
        transparent: true,
        depthWrite: false,
        /**
         * FrontSide, not DoubleSide. With additive blending, DoubleSide draws
         * the back of the shell and then the front on top of it, and the two
         * fresnel terms sum — which saturated alpha across the whole silhouette
         * and turned a hollow rim-lit shell into an opaque ball. One face only.
         */
        side: THREE.FrontSide,
        blending: tokens.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);

      const latticeUniforms = {
        uTime: uniforms.uTime,
        uInk: uniforms.uInk,
        uAccent: coreUniforms.uAccent,
        uOpacity: { value: 0 },
      };
      // Low detail on purpose: a geodesic cage wants to read as struts, and
      // subdividing it turns the shell into a solid grey ball.
      // 1.08x, not 1.22x: the cage should hug the body like a containment
      // shell. Further out it stops reading as related to the object at all and
      // becomes a separate spiky polygon floating nearby.
      const latticeGeo = new THREE.WireframeGeometry(
        new THREE.IcosahedronGeometry(CORE.radius * 1.08, 2),
      );
      const latticeMat = new THREE.ShaderMaterial({
        uniforms: latticeUniforms,
        vertexShader: LATTICE_VERT,
        fragmentShader: LATTICE_FRAG,
        transparent: true,
        depthWrite: false,
        blending: tokens.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const lattice = new THREE.LineSegments(latticeGeo, latticeMat);

      /* Halo — the light the body spills. Drawn first, behind everything. */
      const haloUniforms = {
        uAccent: coreUniforms.uAccent,
        uCoral: coreUniforms.uCoral,
        uOpacity: { value: 0 },
      };
      const haloGeo = new THREE.PlaneGeometry(CORE.radius * 6.4, CORE.radius * 6.4);
      const haloMat = new THREE.ShaderMaterial({
        uniforms: haloUniforms,
        vertexShader: HALO_VERT,
        fragmentShader: HALO_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        // Always additive, both themes. A halo is light; on the light canvas it
        // simply reads as a warm bloom rather than a grey disc.
        blending: THREE.AdditiveBlending,
      });
      /**
       * The halo is a SIBLING of the core group, not a child, and that is
       * structural rather than tidiness.
       *
       * To face the camera it needs its world quaternion set to the camera's.
       * As a child of a group that is itself rotating on two axes, setting its
       * local quaternion would be composed with the parent's — so it would
       * tumble with the object instead of facing front, and a billboard that
       * tumbles reveals itself as a flat quad. Kept as a sibling, its local
       * space IS world space and the copy is exact. Its transform is synced to
       * the group each frame.
       */
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.renderOrder = -1;
      scene.add(halo);

      /* Orbiting nodes. */
      const orbits = buildOrbits(CORE.radius);
      const orbitGeo = new THREE.BufferGeometry();
      // `position` is required by Three even though the vertex shader computes
      // the real location from the orbital parameters — it is never read.
      orbitGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(ORBIT_COUNT * 3), 3));
      orbitGeo.setAttribute("aRadius", new THREE.BufferAttribute(orbits.radii, 1));
      orbitGeo.setAttribute("aSpeed", new THREE.BufferAttribute(orbits.speeds, 1));
      orbitGeo.setAttribute("aPhase", new THREE.BufferAttribute(orbits.phases, 1));
      orbitGeo.setAttribute("aSize", new THREE.BufferAttribute(orbits.sizes, 1));
      orbitGeo.setAttribute("aAxis", new THREE.BufferAttribute(orbits.axes, 3));
      // The computed positions leave the default bounding sphere at radius 0,
      // so frustum culling would drop the whole cloud the moment the group's
      // origin left the view.
      orbitGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), CORE.radius * 2.2);

      const orbitUniforms = {
        uTime: uniforms.uTime,
        uDpr: { value: renderer.getPixelRatio() },
        uAccent: coreUniforms.uAccent,
        uOpacity: { value: 0 },
      };
      const orbitMat = new THREE.ShaderMaterial({
        uniforms: orbitUniforms,
        vertexShader: ORBIT_VERT,
        fragmentShader: ORBIT_FRAG,
        transparent: true,
        depthWrite: false,
        blending: tokens.dark ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      const orbitNodes = new THREE.Points(orbitGeo, orbitMat);

      const coreGroup = new THREE.Group();
      coreGroup.add(core, lattice, orbitNodes);
      coreGroup.position.set(CORE.position[0], CORE.position[1], CORE.position[2]);
      scene.add(coreGroup);

      /**
       * Camera sits above the surface looking along it, which is what produces
       * a horizon. A top-down view would show the noise but none of the relief;
       * the low angle is the entire reason this reads as landscape.
       */
      /**
       * Pitched UP, not down. A camera aimed at the ground puts the horizon
       * high in the frame and the surface then runs straight through the body
       * copy. Aiming above the horizon drops it to roughly three-quarters down,
       * which leaves the whole upper frame clean for type and turns the terrain
       * into a base the content sits on. Geometry unchanged — this is purely
       * where it is pointed.
       */
      camera.position.set(0, 130, 520);
      camera.lookAt(0, 520, -1400);

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
      // Eased toward the route's stage each frame — see the frame loop.
      let stageScale = stageRef.current.scale;
      let stageX = stageRef.current.x;
      let stageY = stageRef.current.y;

      function applyTokens() {
        tokens = readTokens();
        uniforms.uInk.value.set(tokens.ink);
        uniforms.uAccent.value.set(tokens.accent);
        coreUniforms.uAccent.value.set(tokens.accent);
        coreUniforms.uCoral.value.set(tokens.coral);
        coreUniforms.uTech.value.set(tokens.tech);
        const blend = tokens.dark ? THREE.AdditiveBlending : THREE.NormalBlending;
        material.blending = blend;
        coreMat.blending = blend;
        latticeMat.blending = blend;
        orbitMat.blending = blend;
        orbitMat.needsUpdate = true;
        material.needsUpdate = true;
        coreMat.needsUpdate = true;
        latticeMat.needsUpdate = true;
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
        camera.position.y = 130 - pointer.y * 22;
        camera.lookAt(pointer.x * 12, 520, -1400);

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
        ease(uniforms.uSharp, active === "lattice" ? 1 : 0);
        ease(
          uniforms.uAmp,
          active === "converge" ? 0.45 : active === "calm" ? 0.3 : 1,
        );

        /**
         * Everything the route controls is EASED, never assigned. A client-side
         * navigation between /lab and an editorial page therefore reads as the
         * object growing and settling into its new place, which is the whole
         * payoff for the scene living in the layout instead of the page.
         */
        const stage = stageRef.current;
        const target = stage.intensity;
        stageScale += (stage.scale - stageScale) * 0.045;
        stageX += (stage.x - stageX) * 0.045;
        stageY += (stage.y - stageY) * 0.045;

        // Fade to the route's ceiling rather than snapping — this also covers
        // the first frames after boot, so the scene arrives instead of popping.
        const ceiling = (tokens.dark ? 0.5 : 0.42) * target;
        uniforms.uOpacity.value += (ceiling - uniforms.uOpacity.value) * 0.035;

        /**
         * The core rotates on two axes at unrelated rates, so it never returns
         * to the same pose and never reads as a looping GIF. Scroll adds a slow
         * drift so it stays alive on a page that is not being moused over.
         */
        coreGroup.rotation.y = elapsed * 0.07 + scrollNorm * 1.5;
        coreGroup.rotation.x = Math.sin(elapsed * 0.05) * 0.22 + scrollNorm * 0.5;
        lattice.rotation.y = -elapsed * 0.05;
        lattice.rotation.z = elapsed * 0.03;
        // Rises slightly and drifts back as the page scrolls, so it belongs to
        // the same space the terrain does.
        coreGroup.position.y = stageY + scrollNorm * 140 - pointer.y * 18;
        coreGroup.position.x = stageX + pointer.x * 26;
        coreGroup.scale.setScalar(stageScale);

        // Billboard: face the camera exactly, and track the core's transform.
        halo.position.copy(coreGroup.position);
        halo.quaternion.copy(camera.quaternion);
        halo.scale.setScalar(stageScale);

        // The core is the subject, so it is allowed to be far more present than
        // the terrain — and it holds that presence on the editorial routes too,
        // where `intensityRef` still scales it back.
        const coreCeil = (tokens.dark ? 0.95 : 0.75) * target;
        coreUniforms.uOpacity.value += (coreCeil - coreUniforms.uOpacity.value) * 0.03;
        latticeUniforms.uOpacity.value += (coreCeil * 0.7 - latticeUniforms.uOpacity.value) * 0.03;
        orbitUniforms.uOpacity.value += (coreCeil * 0.85 - orbitUniforms.uOpacity.value) * 0.03;
        // The halo is held well down — it is spill light, and at full strength
        // it washes the body it is supposed to be lighting.
        haloUniforms.uOpacity.value +=
          ((tokens.dark ? 0.2 : 0.12) * target - haloUniforms.uOpacity.value) * 0.03;

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
        orbitUniforms.uDpr.value = renderer.getPixelRatio();
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
        coreGeo.dispose();
        coreMat.dispose();
        latticeGeo.dispose();
        latticeMat.dispose();
        haloGeo.dispose();
        haloMat.dispose();
        orbitGeo.dispose();
        orbitMat.dispose();
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
