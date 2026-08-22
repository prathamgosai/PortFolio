"use client";

import { useEffect, useState } from "react";

/**
 * The pointer-following page spotlight.
 *
 * Gated the same way custom-cursor.tsx is, and for a harder reason than taste:
 * this listens to mousemove, which never fires on touch devices — so on phones
 * the un-gated version sat as a 600px glow permanently parked in the top-left
 * corner (position never left {0,0}), costing a full-viewport composited layer
 * on exactly the hardware that can least afford one. No pointer, no spotlight.
 *
 * The media queries are live: plugging a mouse into a tablet attaches the
 * listener, unplugging it detaches and unmounts the layer.
 */
export function CursorSpotlight() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const sync = () => {
      const on = fine.matches && !reduce.matches;
      setEnabled(on);
      window.removeEventListener("mousemove", updatePosition);
      if (on) window.addEventListener("mousemove", updatePosition);
    };
    sync();
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="cursor-spotlight pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, var(--glow-pointer), transparent 40%)`,
      }}
    />
  );
}
