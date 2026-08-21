"use client";

import { useEffect, useRef } from "react";

/**
 * ═════════════════════════════════════════════════════════════════════════
 * THE DIGITAL FIELD — the persistent environment behind /lab.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * One Canvas 2D layer, one rAF loop, for the whole page. Canvas rather than
 * WebGL is a deliberate choice, not a limitation: this field is a few thousand
 * points and some lines between them, which Canvas draws comfortably at 60fps
 * while costing zero new dependencies, having no context-loss failure mode to
 * handle, and no shader compile stall on first paint. WebGL would buy real
 * depth and post-processing; it would also buy a ~150KB download, a fallback
 * path, and a class of device where it simply fails. For this content, that
 * trade does not pay.
 *
 * ── It is decoration, and it is marked as such ──
 * `aria-hidden`, `pointer-events: none`, and NOTHING is rendered here that is
 * not also in the HTML above it. The canvas is the visual layer; the document
 * is the information layer. A crawler, a screen reader, or a visitor whose GPU
 * gave up all still get the entire site.
 *
 * ── Theme ──
 * Both themes are supported, which changes the art direction rather than just
 * the colours. On dark the field is ADDITIVE — bright points, glow, light
 * accumulating out of black. On light that reads as grey mud, so the field
 * inverts to SUBTRACTIVE: ink-dark points, no glow, thinner lines, lower
 * opacity. Same simulation, opposite material.
 *
 * Colours are read from the CSS custom properties rather than hardcoded, so
 * the field cannot drift away from the design tokens, and a MutationObserver on
 * <html> re-reads them the instant next-themes flips the class.
 */

/**
 * Field modes. Each section of /lab sets one, and the simulation reshapes
 * itself — the environment is the narration, not just a backdrop.
 */
export type FieldMode =
  /** Free drift. The resting state. */
  | "drift"
  /** Points pull toward a regular grid — infrastructure, order, topology. */
  | "lattice"
  /** Points pull toward one centre — a single system, converged. */
  | "converge"
  /** Directional flow, left to right — data moving through a pipeline. */
  | "stream"
  /** Slow, sparse, low-contrast — a resting end state. */
  | "calm";

type Point = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0..1 — parallax depth. Near points are bigger, brighter and move more. */
  z: number;
  /** Lattice home, recomputed on resize. */
  hx: number;
  hy: number;
  accent: boolean;
};

type Palette = {
  dark: boolean;
  ink: string;
  accent: string;
  tech: string;
  link: string;
};

const LINK_DIST = 132;

function readPalette(): Palette {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const dark = root.classList.contains("dark");
  return {
    dark,
    // On dark the points are light; on light they are ink. Same role, inverted.
    ink: dark ? "#f5f7fa" : "#0f1620",
    accent: v("--accent", "#e39a2c"),
    tech: v("--tech", dark ? "#4fd3ec" : "#0e7f96"),
    link: dark ? "255, 255, 255" : "15, 22, 32",
  };
}

export function DigitalField({ mode = "drift" }: { mode?: FieldMode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  /**
   * The loop reads mode from a ref so a section change never tears down and
   * restarts the simulation — points keep their positions and velocities, and
   * the field visibly *reshapes* between sections instead of snapping.
   *
   * Synced in an effect rather than assigned during render: React 19 forbids
   * writing refs while rendering, and it is not pedantry — under concurrent
   * rendering a render can be thrown away, so a value written there may reflect
   * a mode that was never committed.
   */
  const modeRef = useRef<FieldMode>(mode);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");

    let palette = readPalette();
    let points: Point[] = [];
    let w = 0;
    let h = 0;
    let cols = 0;
    let raf = 0;
    let running = false;
    /** Eased pointer, so the field follows rather than snaps. */
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let scrollNorm = 0;

    /* ── Sizing ────────────────────────────────────────────────────────── */

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      // DPR capped at 1.75. Past that the fill-rate cost is real and the
      // visible gain on 1px dots is not.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      /**
       * Count scales with area but is hard-capped, and phones get a much
       * sparser field. Link-finding is O(n²) over a spatial cap, so this number
       * is the single biggest lever on frame time — it is deliberately
       * conservative rather than "as many as look nice on a desktop GPU".
       */
      const target = coarse.matches
        ? Math.min(34, Math.round((w * h) / 26000))
        : Math.min(120, Math.round((w * h) / 14000));

      cols = Math.max(4, Math.round(Math.sqrt(target * (w / Math.max(h, 1)))));
      const rows = Math.max(3, Math.ceil(target / cols));

      points = Array.from({ length: target }, (_, i) => {
        const cx = ((i % cols) + 0.5) * (w / cols);
        const cy = (Math.floor(i / cols) + 0.5) * (h / rows);
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          z: 0.3 + Math.random() * 0.7,
          hx: cx,
          hy: cy,
          // A minority carry the accent; a field where everything is the brand
          // colour has no brand colour.
          accent: Math.random() > 0.86,
        };
      });
    }

    /* ── Simulation ────────────────────────────────────────────────────── */

    function step() {
      const m = modeRef.current;
      // Ease the pointer toward its target — the field lags the cursor
      // slightly, which is what makes it feel like a medium rather than a menu.
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;

      const calm = m === "calm";
      const speed = calm ? 0.35 : 1;

      for (const p of points) {
        if (m === "lattice") {
          // Spring toward the grid home. Infrastructure snapping into topology.
          p.vx += (p.hx - p.x) * 0.0016;
          p.vy += (p.hy - p.y) * 0.0016;
          p.vx *= 0.94;
          p.vy *= 0.94;
        } else if (m === "converge") {
          const cx = w * 0.5;
          const cy = h * 0.5;
          p.vx += (cx - p.x) * 0.0007;
          p.vy += (cy - p.y) * 0.0007;
          p.vx *= 0.96;
          p.vy *= 0.96;
        } else if (m === "stream") {
          // Directional bias — a pipeline, not a cloud.
          p.vx += (0.55 - p.vx) * 0.02;
          p.vy *= 0.97;
        } else {
          p.vx *= 0.995;
          p.vy *= 0.995;
        }

        // Pointer repulsion. Near points get pushed, and pushed harder the
        // nearer they are — the cursor displaces the medium.
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 26000 && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const force = (1 - d / 162) * 0.55 * p.z;
          p.vx += (dx / d) * force;
          p.vy += (dy / d) * force;
        }

        p.x += p.vx * speed * p.z;
        p.y += p.vy * speed * p.z;

        // Wrap rather than bounce: a bounce reads as a wall, and there is no
        // wall in this fiction.
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }
    }

    /* ── Drawing ───────────────────────────────────────────────────────── */

    function draw() {
      const m = modeRef.current;
      ctx!.clearRect(0, 0, w, h);

      const dark = palette.dark;
      // Scroll shifts the whole field a little — a cheap parallax that makes
      // the environment feel like it sits behind the page rather than on it.
      const shift = scrollNorm * 40;

      /* Links */
      const linkAlpha = dark ? 0.5 : 0.34;
      ctx!.lineWidth = dark ? 0.7 : 0.6;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const d = Math.sqrt(d2);

          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const near = Math.hypot(mx - pointer.x, my - pointer.y);
          const boost = near < 210 ? 1 - near / 210 : 0;

          const base = (1 - d / LINK_DIST) * (dark ? 0.16 : 0.13);
          ctx!.strokeStyle = `rgba(${palette.link}, ${(base + boost * linkAlpha).toFixed(3)})`;
          ctx!.beginPath();
          ctx!.moveTo(a.x, a.y - shift * a.z);
          ctx!.lineTo(b.x, b.y - shift * b.z);
          ctx!.stroke();
        }
      }

      /* Points */
      for (const p of points) {
        const near = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        const glow = near < 190 ? 1 - near / 190 : 0;
        const y = p.y - shift * p.z;

        const colour = p.accent ? palette.accent : m === "stream" ? palette.tech : palette.ink;

        /**
         * Glow is dark-mode only. On a near-white canvas `shadowBlur` around a
         * dark dot produces a grey halo that reads as a rendering artefact, not
         * as light — and it is the single most expensive operation in this
         * loop, so skipping it on light is both prettier and cheaper.
         */
        if (dark) {
          ctx!.shadowBlur = 6 + glow * 18;
          ctx!.shadowColor = colour;
        }

        const alphaBase = dark ? 0.28 : 0.3;
        ctx!.globalAlpha = Math.min(1, (alphaBase + glow * 0.6) * (0.45 + p.z * 0.55));
        ctx!.fillStyle = colour;
        ctx!.beginPath();
        ctx!.arc(p.x, y, (dark ? 1.1 : 1.25) * p.z + glow * 1.7, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.shadowBlur = 0;
      ctx!.globalAlpha = 1;
    }

    function frame() {
      step();
      draw();
      raf = requestAnimationFrame(frame);
    }

    /* ── Lifecycle ─────────────────────────────────────────────────────── */

    function start() {
      if (running || reduceQuery.matches) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function onPointerMove(e: PointerEvent) {
      pointer.tx = e.clientX;
      pointer.ty = e.clientY;
    }
    function onScroll() {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollNorm = Math.min(window.scrollY / max, 1);
    }
    /** A hidden tab must not burn a frame budget it cannot show. */
    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }

    function applyStatic() {
      // Reduced motion: one composed frame, then nothing. The field still gives
      // the page depth; it simply stops being animate.
      stop();
      step();
      draw();
    }

    function syncMotion() {
      if (reduceQuery.matches) applyStatic();
      else start();
    }

    resize();
    onScroll();
    // Seed a few steps so the first painted frame is a settled field rather
    // than the uniform random scatter it starts from.
    for (let i = 0; i < 40; i++) step();
    draw();

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduceQuery.addEventListener("change", syncMotion);

    // next-themes flips a class on <html>; re-read the tokens when it does.
    const themeObserver = new MutationObserver(() => {
      palette = readPalette();
      if (reduceQuery.matches) draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    syncMotion();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceQuery.removeEventListener("change", syncMotion);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-[1] h-full w-full"
    />
  );
}
