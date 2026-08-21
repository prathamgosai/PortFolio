"use client";

import type { FieldMode } from "@/components/lab/digital-field";

/**
 * ─────────────────────────────────────────────────────────────
 * SCENE MODE — a one-value store shared by the 3D field and its 2D fallback.
 * ─────────────────────────────────────────────────────────────
 *
 * The environment moved from being a component inside /lab to being a single
 * persistent layer in the root layout, which broke the direct prop that used to
 * carry the section mode. Context would restore it, but at a real cost: the
 * provider would sit above every route, and every mode change would re-render
 * the entire tree to deliver a value that only two consumers want — one of
 * which is an imperative rAF loop that cannot use a React value at all.
 *
 * So: a module-level value with subscribers.
 *
 *   • The WebGL loop calls `getSceneMode()` once per frame. No React involved,
 *     no re-render, no allocation.
 *   • The Canvas 2D fallback subscribes through `useSyncExternalStore`, because
 *     it IS a React component and needs to re-render.
 *
 * `useSyncExternalStore` rather than an effect + state because this is exactly
 * what it is for: an external mutable value that React must stay consistent
 * with, including during concurrent rendering.
 */

let mode: FieldMode = "drift";
const listeners = new Set<() => void>();

export function setSceneMode(next: FieldMode) {
  if (next === mode) return;
  mode = next;
  for (const listener of listeners) listener();
}

export function getSceneMode(): FieldMode {
  return mode;
}

export function subscribeSceneMode(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * The server never renders the field at all (it is effect-mounted), but
 * `useSyncExternalStore` still demands a server snapshot. "drift" is the
 * resting state, which is also what every route other than /lab wants.
 */
export function getSceneModeServer(): FieldMode {
  return "drift";
}
