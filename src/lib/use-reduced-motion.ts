"use client";

import { useSyncExternalStore } from "react";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Reduced-motion as an external store rather than effect-driven state — the
 * media query IS external state, so this is the right primitive: it stays in
 * sync with OS-level changes without a cascading render on mount.
 *
 * The server snapshot is `true`, so SSR emits the still, accessible variant and
 * motion is only added once the client confirms it's wanted. That ordering
 * matters: a crawler or a JS-disabled visitor gets fully-formed content, never
 * an element parked at `opacity: 0` waiting for an animation that never runs.
 */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => true,
  );
}
