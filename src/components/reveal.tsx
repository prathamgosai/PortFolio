"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Gentle scroll-in reveal. CSS does the animating; this only flips
 * `data-shown` when the element first enters the viewport.
 *
 * The hidden start state lives behind `@media (scripting: enabled)` in
 * globals.css, so a visitor with JS disabled — or a crawler that doesn't run
 * it — sees fully-rendered content instead of an element parked at opacity 0
 * waiting for an observer that will never fire.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  cursor,
}: {
  children: ReactNode;
  /** Stagger, in seconds. */
  delay?: number;
  className?: string;
  /** Render as something other than a div — e.g. "li" inside a real list. */
  as?: Extract<ElementType, "div" | "li" | "section" | "article">;
  /**
   * Emits `data-cursor`, read by <CustomCursor/>.
   *
   * Exists so a revealed element can carry the label itself. The alternative —
   * wrapping the content in another div — broke layout: the row it wraps is a
   * grid, and an intervening `display: contents` element stops `.work-row > *`
   * matching the real children, which is what lifts them above the hover wash.
   */
  cursor?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fires immediately for anything already on screen, so a deep link or a
    // restored scroll position never leaves content stuck hidden.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.shown = "true";
        io.disconnect();
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-cursor={cursor}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
