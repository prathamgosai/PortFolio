"use client";

import { useEffect } from "react";

/**
 * A single delegated pointer handler powering the "liquid glass" feel:
 *  • `.glass-hover` cards get a subtle 3D tilt + a cursor-following light
 *    reflection (via --rx/--ry/--gx/--gy CSS vars — the transform lives in CSS).
 *  • `.magnetic` elements (buttons) drift a few px toward the cursor.
 *
 * Transform/opacity only (GPU, 60fps). One passive listener, rAF-throttled, with
 * all geometry reads batched before any style writes (no forced-sync layout).
 * Fully disabled under prefers-reduced-motion — and it reacts to the setting
 * changing mid-session.
 */
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
    };
    const resetMag = (el: HTMLElement) => {
      el.style.transform = "";
    };

    const onMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      const target = e.target as HTMLElement | null;
      const nextCard = target?.closest<HTMLElement>(".glass-hover") ?? null;
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
          card.style.setProperty("--gx", `${px * 100}%`);
          card.style.setProperty("--gy", `${py * 100}%`);
          card.style.setProperty("--ry", `${(px - 0.5) * 6}deg`);
          card.style.setProperty("--rx", `${(0.5 - py) * 6}deg`);
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
