"use client";

import { getLenis } from "@/components/smooth-scroll";

/**
 * REF-COUNTED BODY SCROLL LOCK.
 *
 * Two things on this site lock the page: the command palette and (once it goes
 * fullscreen) the mobile menu. Both used to write `document.body.style.overflow`
 * directly, which is fine in isolation and wrong the moment they overlap —
 * whichever closes first restores scrolling while the other is still open.
 *
 * The depth counter fixes that: only the outermost lock writes, only the
 * outermost unlock restores, and the original value is captured rather than
 * assumed to be "" (a future `overflow` on body would otherwise be destroyed).
 *
 * It also has a second job that did not exist before Lenis. `overflow: hidden`
 * on <body> does NOT stop Lenis — Lenis listens for wheel events on the window
 * and scrolls programmatically, so the page would keep gliding behind an open
 * overlay. Lenis has to be told to stop, and told by the same call that does the
 * locking, or the two will drift apart.
 */

let depth = 0;
let previousOverflow = "";

export function lockScroll() {
  if (depth === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // No-ops on touch and under reduced motion, where no instance is created.
    getLenis()?.stop();
  }
  depth += 1;
}

export function unlockScroll() {
  depth -= 1;
  if (depth <= 0) {
    // Clamp rather than trust the caller. An unbalanced unlock (an unmount
    // racing a close handler) must not drive this negative and leave the next
    // lock a no-op — a page that can never be locked again is a worse bug than
    // one that unlocks a frame early.
    depth = 0;
    document.body.style.overflow = previousOverflow;
    getLenis()?.start();
  }
}
