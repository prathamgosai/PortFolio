"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";

/**
 * ─────────────────────────────────────────────────────────────
 * SMOOTH SCROLL — the site's one and only new dependency.
 * ─────────────────────────────────────────────────────────────
 *
 * Lenis performs REAL native scrolls (`window.scrollTo({ behavior: 'instant' })`)
 * once per frame — it is not a transform-translate library. That single fact is
 * why the rest of the site needs no rewiring: `scroll-progress.tsx`,
 * `navbar.tsx` and every IntersectionObserver keep receiving genuine scroll
 * events and genuine geometry. Do NOT move them onto `lenis.on('scroll')`; that
 * would couple them to an instance which deliberately does not exist on touch
 * or under reduced motion.
 *
 * The instance is exposed through a module-level handle rather than context —
 * same idiom as the exported `OPEN_COMMAND_PALETTE` constant — because its only
 * consumer is `scroll-lock.ts`, which is called from event handlers rather than
 * from render.
 */

let instance: Lenis | null = null;

/** The live Lenis instance, or null on touch / reduced motion / before mount. */
export function getLenis() {
  return instance;
}

export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    /**
     * Touch is gated OUT entirely, and not merely left un-smoothed.
     *
     * Lenis's `syncTouch` defaults to false, so touch scrolling is native
     * either way — but instantiating anyway would still ship 5.5KB to the
     * devices least able to afford it, and would arm the wheel listener on
     * 2-in-1s. Native touch scroll runs on the compositor thread; nothing here
     * is worth moving it to the main thread.
     */
    const fine = window.matchMedia("(pointer: fine)");
    let cancelled = false;

    const teardown = () => {
      instance?.destroy();
      instance = null;
    };

    const setup = async () => {
      if (instance || cancelled) return;
      // Lazy: the chunk is never fetched on touch or under reduced motion.
      const { default: Lenis } = await import("lenis");
      // The import can resolve AFTER cleanup ran (React 19 StrictMode mounts,
      // unmounts and remounts). Both guards are load-bearing.
      if (cancelled || instance) return;

      instance = new Lenis({
        /**
         * Lenis owns its own rAF and cancels it in destroy(). The tutorial
         * pattern — a self-perpetuating `requestAnimationFrame(raf)` whose id is
         * never stored — cannot be cancelled, so StrictMode leaves two loops
         * running forever and every HMR update adds another.
         */
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        /**
         * NEVER true. Lenis's anchor handler does not call preventDefault(), so
         * on an in-page `#hash` link it races the browser's native jump AND the
         * App Router's own hash handling: instant jump, snap back, slow glide.
         * It also never moves focus, which makes it an accessibility regression
         * over the native behaviour it replaces. Anchors stay native; the fixed
         * navbar is cleared with `scroll-margin-top` instead, which also works
         * with JS off and under reduced motion.
         */
        anchors: false,
        /**
         * Guards the nastiest failure mode. Next's router scroll reset is a real
         * native `scrollTop = 0`, but Lenis ignores external scrolls while it is
         * mid-glide (`isScrolling === 'smooth'`), so navigating during a glide
         * would load the new page at the top and then scroll it back down. This
         * makes a same-host link click reset the inertia first.
         */
        stopInertiaOnNavigate: true,
        lerp: 0.1,
        overscroll: true,
      });
    };

    const sync = () => {
      if (reduce.matches || !fine.matches) teardown();
      else void setup();
    };

    sync();
    reduce.addEventListener("change", sync);
    fine.addEventListener("change", sync);

    return () => {
      cancelled = true;
      reduce.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
      teardown();
    };
  }, []);

  /**
   * `stopInertiaOnNavigate` only covers real link clicks. Programmatic
   * `router.push()` and the back/forward button take a different path, so this
   * re-syncs Lenis to wherever the router actually left the page. `resize()` is
   * the public equivalent of the private `reset()`: it snaps animatedScroll and
   * targetScroll to the real scroll position.
   */
  useEffect(() => {
    const id = requestAnimationFrame(() => instance?.resize());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
