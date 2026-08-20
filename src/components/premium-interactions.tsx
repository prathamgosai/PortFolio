"use client";

import { useEffect } from "react";

/**
 * A single delegated pointer handler powering the "liquid glass" feel:
 *  • Spatial surfaces — `.glass-hover` cards, `.bento-tile`s and the
 *    `.portrait-card` — get a 3D tilt plus a cursor-following light reflection.
 *    JS only writes CSS vars (--rx/--ry/--gx/--gy/--px/--py); every transform
 *    lives in the stylesheet, so the motion can be redefined or switched off
 *    entirely in CSS without touching this file.
 *  • `.magnetic` elements (buttons) drift a few px toward the cursor.
 *
 * Transform/opacity only (GPU, 60fps). One passive listener, rAF-throttled, with
 * all geometry reads batched before any style writes (no forced-sync layout).
 * Fully disabled under prefers-reduced-motion — and it reacts to the setting
 * changing mid-session.
 */

/**
 * Every surface that wants a pointer-driven tilt. One selector rather than one
 * handler per surface language: the cost of this whole system is a single
 * `closest()` per pointermove, and that cost does not grow when a new kind of
 * card is added to the list.
 */
const TILT_SELECTOR = ".glass-hover, .bento-tile, .portrait-card";

/** Default tilt amplitude in degrees; per-element override via `data-tilt`. */
const TILT_DEG = 6;

export function PremiumInteractions() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    let card: HTMLElement | null = null;
    let mag: HTMLElement | null = null;
    let frame = 0;
    let lastX = 0;
    let lastY = 0;
    let attached = false;

    const resetCard = (el: HTMLElement) => {
      el.style.removeProperty("--rx");
      el.style.removeProperty("--ry");
      el.style.removeProperty("--gx");
      el.style.removeProperty("--gy");
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    };
    const resetMag = (el: HTMLElement) => {
      el.style.transform = "";
    };

    const onMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      const target = e.target as HTMLElement | null;
      const nextCard = target?.closest<HTMLElement>(TILT_SELECTOR) ?? null;
      const nextMag = target?.closest<HTMLElement>(".magnetic") ?? null;

      if (nextCard !== card) {
        if (card) resetCard(card);
        card = nextCard;
      }
      if (nextMag !== mag) {
        if (mag) resetMag(mag);
        mag = nextMag;
      }
      if (!card && !mag) return;

      if (frame) return; // one update per animation frame
      frame = requestAnimationFrame(() => {
        frame = 0;
        // Batch ALL reads before ANY writes to avoid layout thrash.
        const rCard = card ? card.getBoundingClientRect() : null;
        const rMag = mag ? mag.getBoundingClientRect() : null;
        if (card && rCard) {
          const px = (lastX - rCard.left) / rCard.width;
          const py = (lastY - rCard.top) / rCard.height;
          // `dataset` is a plain attribute read — no style recalc, so this is
          // safe to do inside the frame alongside the geometry reads.
          const amp = Number(card.dataset.tilt) || TILT_DEG;
          card.style.setProperty("--gx", `${px * 100}%`);
          card.style.setProperty("--gy", `${py * 100}%`);
          card.style.setProperty("--ry", `${(px - 0.5) * amp}deg`);
          card.style.setProperty("--rx", `${(0.5 - py) * amp}deg`);
          // Normalised to -0.5…0.5 and unitless, so `.parallax` children can
          // multiply it by their own travel budget in calc().
          card.style.setProperty("--px", `${px - 0.5}`);
          card.style.setProperty("--py", `${py - 0.5}`);
        }
        if (mag && rMag) {
          const dx = lastX - (rMag.left + rMag.width / 2);
          const dy = lastY - (rMag.top + rMag.height / 2);
          mag.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
        }
      });
    };

    const onLeave = () => {
      if (card) resetCard(card);
      if (mag) resetMag(mag);
      card = mag = null;
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    };
    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      document.removeEventListener("pointerleave", onLeave);
      onLeave();
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const sync = () => (mq.matches ? detach() : attach());
    sync();
    mq.addEventListener("change", sync);

    return () => {
      mq.removeEventListener("change", sync);
      detach();
    };
  }, []);

  return null;
}
