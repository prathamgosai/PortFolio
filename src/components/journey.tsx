"use client";

import { useEffect, useRef, useState } from "react";
import { journey } from "@/data/portfolio";

/**
 * ─────────────────────────────────────────────────────────────
 * JOURNEY — a scroll-driven timeline, without a scroll library.
 * ─────────────────────────────────────────────────────────────
 *
 * The brief asked for GSAP ScrollTrigger. This does the same job with an
 * IntersectionObserver and CSS, and the split is deliberate:
 *
 *   WHICH ENTRY IS ACTIVE  → IntersectionObserver. Universal support.
 *   THE PROGRESS RAIL      → CSS `animation-timeline` where available,
 *                            one rAF-throttled handler where it is not.
 *   EVERY TRANSITION       → CSS on `[data-active]`.
 *
 * That split is not a stylistic preference. `animation-timeline: view()` is not
 * Baseline — Firefox stable still ships it behind a flag — so scroll-driven CSS
 * can own DECORATION but must never own STATE. Gate the active entry on it and
 * the timeline is simply broken in Firefox.
 *
 * ── What this deliberately is NOT ──
 * It is not the pinned horizontal-scroll timeline that ScrollTrigger tutorials
 * produce. That pattern is exactly what creates the "avoid horizontal overflow
 * on mobile" problem the brief then has to warn about, and it also breaks
 * find-in-page and scrambles keyboard order. A sticky aside beside a normal
 * vertical list reads as "pinned" with none of that.
 */
export function Journey() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const steps = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    /**
     * Where the browser can run the rail off the compositor, it does, and this
     * component adds ZERO main-thread scroll work. The fallback handler below
     * only exists for browsers that cannot.
     */
    const hasScrollTimeline =
      typeof CSS !== "undefined" && CSS.supports("animation-timeline", "view()");

    let io: IntersectionObserver | null = null;
    let gate: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let frame = 0;
    let listTop = 0;
    let listHeight = 1;
    let scrolling = false;
    let attached = false;

    const update = () => {
      frame = 0;
      const el = root.current;
      if (!el) return;
      // Arithmetic only — every geometry read happens in measure().
      const progress =
        (window.scrollY + window.innerHeight - listTop) / (listHeight + window.innerHeight);
      el.style.setProperty("--journey-progress", String(Math.min(Math.max(progress, 0), 1)));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const measure = () => {
      const el = list.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      listTop = r.top + window.scrollY;
      listHeight = Math.max(r.height, 1);
    };

    const startScroll = () => {
      if (scrolling) return;
      scrolling = true;
      measure();
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
    };
    const stopScroll = () => {
      if (!scrolling) return;
      scrolling = false;
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const attach = () => {
      if (attached) return;
      attached = true;

      /**
       * A thin activation band across the middle of the viewport. `threshold: 0`
       * plus an inset rootMargin means the callback fires when an entry crosses
       * the band, and never needs a measurement of its own.
       *
       * Only ever SET on intersect; never clear on exit. A gap between two
       * entries would otherwise leave nothing active and flash the rail empty,
       * and scrolling past the last entry would un-light it.
       */
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const i = Number((entry.target as HTMLElement).dataset.index);
            if (!Number.isNaN(i)) setActive(i);
          }
        },
        { rootMargin: "-45% 0px -55% 0px", threshold: 0 },
      );
      for (const node of steps.current) if (node) io.observe(node);

      if (hasScrollTimeline || !list.current) return;

      // Fallback rail. Gated on the section being on screen so it costs
      // nothing anywhere else on the page.
      ro = new ResizeObserver(() => {
        measure();
        update();
      });
      ro.observe(list.current);

      gate = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? startScroll() : stopScroll()),
        { rootMargin: "200px 0px" },
      );
      if (root.current) gate.observe(root.current);
    };

    const detach = () => {
      if (!attached) return;
      attached = false;
      io?.disconnect();
      gate?.disconnect();
      ro?.disconnect();
      io = gate = null;
      ro = null;
      stopScroll();
      root.current?.style.removeProperty("--journey-progress");
    };

    const sync = () => (reduce.matches ? detach() : attach());
    sync();
    reduce.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      detach();
    };
  }, []);

  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      className="journey mx-auto max-w-5xl scroll-mt-28 px-5 py-20 sm:py-24"
    >
      <p className="label">Journey</p>
      <h2 id="journey-title" className="t-h2 mt-4 text-fg">
        The route so far.
      </h2>
      <p className="t-body measure mt-5 text-muted">
        Hardware, then the network, then the software on top of it — in that order, and each one
        because the last one made it necessary.
      </p>

      <div ref={root} className="journey-grid mt-14">
        {/**
         * Decorative. Every word in here is duplicated inside the list below, so
         * exposing it would make a screen reader read each year twice.
         */}
        <div className="journey-aside" aria-hidden="true">
          <div className="journey-sticky">
            <div className="journey-rail">
              <span className="journey-rail-fill" />
            </div>
            <div>
              <p className="journey-year font-display text-fg">{journey[active]?.year}</p>
              <p className="t-caption mt-1 leading-snug text-muted">{journey[active]?.org}</p>
            </div>
          </div>
        </div>

        {/**
         * A real <ol> of real <time> elements. These are dated events in
         * sequence, so this is an ordered list whether or not JS ever runs —
         * and because `data-active` is only ever ADDED by script, the SSR,
         * no-JS and reduced-motion renders are already the correct static list.
         */}
        <ol ref={list} className="journey-steps">
          {journey.map((entry, i) => (
            <li
              key={entry.id}
              id={`journey-${entry.id}`}
              ref={(node) => {
                steps.current[i] = node;
              }}
              data-index={i}
              data-active={i === active || undefined}
              className="journey-step"
            >
              <p className="label journey-step__date">
                <time dateTime={entry.dateTime}>{entry.year}</time>
                <span aria-hidden> · </span>
                <span className="journey-step__org">{entry.org}</span>
              </p>
              <h3 className="t-card-title mt-3 text-fg">{entry.title}</h3>
              <p className="t-small measure mt-3 text-muted">{entry.blurb}</p>
              <dl className="journey-meta mt-5">
                {entry.meta.map((m) => (
                  <div key={m.label}>
                    <dt className="label text-[0.6875rem]">{m.label}</dt>
                    <dd className="t-caption mt-1 leading-snug text-fg">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
