"use client";

import { useEffect } from "react";

/**
 * This site ships no service worker. But `localhost:3000` (and any deployed
 * origin) can carry a stale service worker left behind by a *different* project
 * that once ran here — it keeps intercepting requests and serving cached, old
 * JS chunks, which shows up as a hydration mismatch (client renders stale text
 * the current server never sent). This unregisters any such worker, drops its
 * caches, and reloads once so the fresh bundle takes over. A sessionStorage
 * flag prevents a reload loop.
 */
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) return;

      Promise.all(registrations.map((r) => r.unregister()))
        .then(() =>
          "caches" in window
            ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
            : undefined,
        )
        .then(() => {
          if (!sessionStorage.getItem("sw-cleaned")) {
            sessionStorage.setItem("sw-cleaned", "1");
            window.location.reload();
          }
        });
    });
  }, []);

  return null;
}
