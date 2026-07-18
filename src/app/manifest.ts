import type { MetadataRoute } from "next";
import { identity } from "@/data/portfolio";

/**
 * Web app manifest — lets the site be installed/added to a home screen and
 * gives search engines a canonical name + theme. Icons reuse the app icon route.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${identity.name} — Portfolio`,
    short_name: identity.name,
    description: identity.oneLine,
    start_url: "/",
    display: "standalone",
    background_color: "#0f1620",
    theme_color: "#0f1620",
    icons: [
      { src: "/icon", sizes: "any", type: "image/png" },
    ],
  };
}
