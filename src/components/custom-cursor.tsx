"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ─────────────────────────────────────────────────────────────
 * CUSTOM CURSOR — a dot that reads the thing under it.
 * ─────────────────────────────────────────────────────────────
 *
 * Desktop only, and gated three ways: `(pointer: fine)` so it never appears on
 * touch, `prefers-reduced-motion` so it can be switched off, and `scripting`
 * is implicit (no JS, no cursor, native pointer untouched).
 *
 * The label comes from a `data-cursor` attribute on any ancestor of the hover
 * target, so a component opts in declaratively — `data-cursor="View"` on a
 * project row — and nothing here needs to know what a project is.
 *
 * ── Why this owns a listener when PremiumInteractions already has one ──
 * That handler is rAF-throttled to ONE update per frame and batches all its
 * geometry reads before any writes, which is exactly right for tilt but wrong
 * here: a cursor that updates on the same frame budget as a card tilt visibly
 * lags the real pointer, and lag is the one thing a cursor cannot have. This
 * writes two CSS custom properties directly in the event, does no geometry
 * reads at all, and therefore cannot thrash layout. The interpolation toward
 * the pointer is done in CSS by a transition, not by a JS lerp loop, so there
 * is no second rAF loop on the page either.
 */

/** Native cursor is hidden only while ours is actually live. */
const HIDE_CLASS = "has-custom-cursor";

export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    /**
     * Must mirror the CSS gate (@media (hover: none) hides the dot): a
     * fine-pointer device without hover — some stylus setups — used to pass
     * the JS check and hide the NATIVE cursor while CSS hid ours, leaving no
     * cursor at all. JS and CSS now answer the same question.
     */
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let attached = false;

    const onMove = (e: PointerEvent) => {
      const el = dot.current;
      if (!el) return;
      // Two custom-property writes. No reads, so no forced synchronous layout.
      el.style.setProperty("--cx", `${e.clientX}px`);
      el.style.setProperty("--cy", `${e.clientY}px`);
      setVisible(true);

      const target = e.target as HTMLElement | null;
      const owner = target?.closest<HTMLElement>("[data-cursor]");
      const next = owner?.dataset.cursor ?? null;
      // Only re-render when the label actually changes — not every pointermove.
      setLabel((prev) => (prev === next ? prev : next));
    };

    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    const onLeave = () => setVisible(false);

    const attach = () => {
      if (attached) return;
      attached = true;
      document.documentElement.classList.add(HIDE_CLASS);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      document.documentElement.classList.remove(HIDE_CLASS);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      setVisible(false);
      setLabel(null);
    };

    const sync = () => (reduce.matches || !fine.matches ? detach() : attach());
    sync();
    reduce.addEventListener("change", sync);
    fine.addEventListener("change", sync);

    return () => {
      reduce.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
      detach();
    };
  }, []);

  return (
    <div
      ref={dot}
      aria-hidden
      className="cursor-dot"
      data-visible={visible || undefined}
      data-labelled={label ? true : undefined}
      data-down={down || undefined}
    >
      <span className="cursor-dot__label">{label}</span>
    </div>
  );
}
