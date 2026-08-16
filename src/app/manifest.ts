import type { MetadataRoute } from "next";
import { identity } from "@/data/portfolio";

/**
 * Web app manifest — lets the site be installed/added to a home screen and
 * gives search engines a canonical name + theme.
 *
 * Icons are static PNGs in public/icons rather than the `/icon` route: that
 * route renders at 32×32, and an install prompt needs 192 and 512. A manifest
 * whose only icon is 32px is silently ignored by Chrome on Android.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${identity.name} — Portfolio`,
    short_name: identity.name,
    description: identity.oneLine,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0f1620",
    theme_color: "#0f1620",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Full-bleed variant so Android can crop it to any device mask shape.
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
