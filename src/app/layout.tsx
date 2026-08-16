import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ServiceWorkerCleanup } from "@/components/sw-cleanup";
import { PremiumInteractions } from "@/components/premium-interactions";
import { ScrollProgress } from "@/components/scroll-progress";
import { Ambient } from "@/components/ambient";
import { CursorSpotlight } from "@/components/cursor-spotlight";
import { CommandPalette } from "@/components/command-palette";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL, identity } from "@/data/portfolio";
import "./globals.css";

// Primary UI/body type — modern SaaS grotesque with excellent readability.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Display face for headings — geometric, futuristic, dominates the page.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-plex-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// Retained for the eyebrow/label "cable-tag" motif — a brand signature.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pratham Gosai — IT & Network Engineer · AI Automation",
    template: "%s · Pratham Gosai",
  },
  description:
    "Desktop & network engineer in Surat, India, building AI-powered systems — shipped WorkforceIQ, a workforce platform for 370+ restaurant staff.",
  // Google has ignored this since 2009; Bing gives it minimal weight. Kept
  // short and name-focused rather than as a keyword dump.
  keywords: [
    "Pratham Gosai",
    "Pratham Dharmeshbharti Gosai",
    "IT support engineer Surat",
    "network engineer Gujarat",
    "AI automation engineer",
    "Claude API developer",
  ],
  authors: [{ name: identity.name, url: SITE_URL }],
  creator: identity.name,
  publisher: identity.name,
  category: "technology",
  // Set GSC_VERIFICATION in the host env (Render → Environment) to the token
  // from Google Search Console → Settings → Ownership → HTML tag. Unset = omitted.
  verification: { google: process.env.GSC_VERIFICATION || undefined },
  /**
   * Crawler directives.
   *
   * Without these, Google applies its conservative defaults: text snippets get
   * truncated to a short length and image previews are capped at a thumbnail.
   * For a name query — where the result that wins is usually the one with a
   * face, a full description and sitelinks — those defaults actively work
   * against us. `max-image-preview: large` is also a stated prerequisite for
   * several rich-result types.
   *
   * `-1` means "no limit" for snippet and video preview length.
   */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: identity.name,
    url: SITE_URL,
    title: "Pratham Gosai — IT & Network Engineer · AI Automation",
    description:
      "Desktop & network engineer in Surat, India, building AI-powered systems — shipped WorkforceIQ, a workforce platform for 370+ restaurant staff.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pratham Gosai — IT & Network Engineer · AI Automation",
    description:
      "Desktop & network engineer in Surat, India, building AI-powered systems — shipped WorkforceIQ, a workforce platform for 370+ restaurant staff.",
  },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: `${identity.name} — Writing` }] },
  },
};

/** Split out of `metadata` — themeColor/viewport there is deprecated since 14. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1620" },
  ],
};

// NOTE: Person + WebSite structured data lives in a single canonical <PersonJsonLd/>
// (@graph with ProfilePage → Person → WebSite) rendered on the home page. Do not
// duplicate it here — two Person/WebSite nodes with conflicting @ids dilute the entity.

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${jakarta.variable} ${spaceGrotesk.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-fg antialiased">
        <Ambient />
        <CursorSpotlight />
        <ServiceWorkerCleanup />
        <ScrollProgress />
        <PremiumInteractions />
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:text-fg"
          >
            Skip to content
          </a>
          <Navbar />
          <CommandPalette />
          <main id="main" className="pt-6">
            {children}
          </main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
