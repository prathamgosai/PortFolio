"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

type Accent = "cyan" | "green" | "magenta" | "amber" | "violet" | "blue";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(cb: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Reduced-motion as an external store rather than effect-driven state — the
 * media query IS external state, so this is the right primitive: it stays in
 * sync with OS-level changes without a cascading render on mount. Server
 * snapshot is `true`, so SSR emits the still, accessible variant and motion is
 * added only once the client confirms it's wanted.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => true,
  );
}

/**
 * A slab of liquid glass.
 *
 * Two effects are driven from here rather than from CSS alone:
 *  - `--mx/--my`: cursor position in panel space, which the `.glass::after`
 *    radial gradient uses as its specular light source.
 *  - `tilt`: a small perspective rotation toward the cursor, so the panel
 *    catches light like a physical sheet.
 *
 * Both are written straight to the node's style (no React state) so pointer
 * movement never triggers a re-render — this is what keeps 60fps with a dozen
 * panels on screen.
 */
export function Glass({
  children,
  className = "",
  accent = "cyan",
  tilt = false,
  lift = true,
  as: Tag = "div",
  maxTilt = 6,
}: {
  children: ReactNode;
  className?: string;
  accent?: Accent;
  tilt?: boolean;
  lift?: boolean;
  as?: "div" | "section" | "article" | "li" | "aside";
  maxTilt?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (tilt && !reduced) {
      const rx = ((y / r.height - 0.5) * -2 * maxTilt).toFixed(2);
      const ry = ((x / r.width - 0.5) * 2 * maxTilt).toFixed(2);
      el.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  }

  function onLeave() {
    const el = ref.current;
    if (el && tilt) el.style.transform = "";
  }

  return (
    <Tag
      ref={ref as never}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`glass glass-${accent} ${lift ? "glass-lift" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

/**
 * Scroll-in settle. One IntersectionObserver instance per element is wasteful
 * at scale, but there are ~40 of these and the observer is unobserved on first
 * hit, so it stays cheap and the code stays local.
 */
export function Settle({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "true";
          io.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`settle ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Counts up when scrolled into view. Keeps the suffix (e.g. "+") intact. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.unobserve(el);
      const start = performance.now();
      const dur = 1100;
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        // easeOutExpo — fast arrival, long settle. Reads as a meter locking on.
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setN(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduced]);

  return (
    <span ref={ref}>
      {reduced ? value : n}
      {suffix}
    </span>
  );
}

/**
 * Typewriter for headings. `count` drives how much is revealed, so the reduced
 * -motion path is a pure render decision (show everything) rather than an
 * effect that has to correct state after the fact.
 */
export function Typewriter({ text, className = "" }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [text, reduced]);

  const shown = reduced ? text : text.slice(0, count);

  return (
    <span className={className}>
      <span aria-hidden>{shown}</span>
      {/* The heading must always be complete for assistive tech and for the
          crawler, regardless of how far the animation has got. */}
      <span className="sr-only">{text}</span>
    </span>
  );
}
