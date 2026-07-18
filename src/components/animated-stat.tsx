"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Counts a stat value up from zero when it scrolls into view. The value can
 * carry a non-numeric suffix ("370+", "10+"), which is preserved. SSR (and the
 * first client render) show the real final value, so the number is correct with
 * JS disabled and for crawlers; suppressHydrationWarning covers the count-up.
 */
export function AnimatedStat({ value }: { value: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const started = useRef(false);
  const [display, setDisplay] = useState(value);

  const match = value.match(/^(\d[\d,]*)(.*)$/);
  const target = match ? parseInt(match[1].replace(/,/g, ""), 10) : null;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (reduced || target === null) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started.current) continue;
          started.current = true;

          const duration = 1100;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setDisplay(Math.round(eased * target).toLocaleString() + suffix);
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplay(target.toLocaleString() + suffix);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, target, suffix]);

  return (
    <p
      ref={ref}
      suppressHydrationWarning
      className="mt-3 font-display text-3xl font-bold tracking-tight text-fg tabular-nums"
    >
      {display}
    </p>
  );
}
