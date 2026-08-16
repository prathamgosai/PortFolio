"use client";

import { useEffect, useRef } from "react";

/**
 * A thin gradient reading-progress bar pinned to the very top of the viewport.
 * GPU-only (transform: scaleX) and rAF-throttled — no layout thrash on scroll.
 * Hidden from assistive tech; it's pure decoration.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let attached = false;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    };
    const detach = () => {
      if (!attached) return;
      attached = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      bar.style.transform = "scaleX(0)"; // reduced-motion: keep it hidden
    };

    // Gate on reduced-motion, and react if the user toggles it mid-session.
    const sync = () => (mq.matches ? detach() : attach());
    sync();
    mq.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      detach();
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left scale-x-0 bg-gradient-to-r from-cable via-accent to-cable"
      ref={ref}
    />
  );
}
