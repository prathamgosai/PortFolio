import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * Only two third parties are reachable from this site, and both are known:
 *  - Google Translate, loaded lazily by <LanguagePicker/>. It pulls element.js
 *    from translate.google.com, then CSS/fonts/images from translate.googleapis.com
 *    and gstatic, and it injects inline styles — hence 'unsafe-inline' on style-src.
 *  - Web3Forms, a single POST from <ContactForm/> to api.web3forms.com.
 *
 * 'unsafe-inline' on script-src is required by Next itself (the inline bootstrap
 * and the next-themes no-flash script) and by Google's widget. Tightening that
 * to a nonce means giving up static prerendering on every route, which is a bad
 * trade for a site with no authentication and no user-generated content.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://www.gstatic.com https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://translate.googleapis.com https://www.gstatic.com https://www.google.com",
  "connect-src 'self' https://api.web3forms.com https://translate.googleapis.com",
  "frame-src 'self' https://translate.google.com",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Response security headers. Applied by `next start` (Render runs the Node
 * server) and by @netlify/plugin-nextjs on Netlify.
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Isolates this browsing context from anything it opens or that opens it.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework/version to attackers.
  poweredByHeader: false,

  // Serve AVIF (then WebP) where the browser supports it — smaller LCP images.
  images: { formats: ["image/avif", "image/webp"] },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
