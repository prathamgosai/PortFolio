import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ServiceWorkerCleanup } from "@/components/sw-cleanup";
import { SITE_URL, identity } from "@/data/portfolio";
import "./globals.css";

// Primary UI/body type — modern SaaS grotesque with excellent readability.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Display face for headings — geometric, confident, dominates the page.
const sora = Sora({
  variable: "--font-plex-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
  keywords: [
    "Pratham Gosai",
    "Pratham Dharmeshbharti Gosai",
    "Pratham Gosai Surat",
    "Pratham Gosai portfolio",
    "Pratham Gosai developer",
    "Pratham Gosai IT engineer",
    "IT support engineer Surat",
    "desktop support engineer",
    "network engineer Gujarat",
    "firewall support",
    "NAS storage support",
    "AI automation engineer",
    "Claude API developer",
    "full-stack TypeScript developer India",
    "workforce management platform",
    "FastAPI demand forecasting",
  ],
  authors: [{ name: identity.name, url: SITE_URL }],
  creator: identity.name,
  publisher: identity.name,
  category: "technology",
  // Paste the token from Google Search Console → Settings → Ownership
  // verification → HTML tag. Leaving it empty is harmless.
  verification: { google: "" },
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
  alternates: { canonical: "/" },
};

/** Split out of `metadata` — themeColor/viewport there is deprecated since 14. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1620" },
  ],
};

/**
 * Person + WebSite structured data. This is what tells Google that this domain
 * is the authoritative page about the person "Pratham Gosai" — the `sameAs`
 * links tie the social profiles to one entity, which is exactly what a
 * name-search wants to resolve. Rendered as JSON-LD in <head>.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: identity.name,
  alternateName: identity.fullName,
  url: SITE_URL,
  image: `${SITE_URL}${identity.photo.src}`,
  jobTitle: identity.jobTitle,
  description: identity.oneLine,
  email: identity.email ? `mailto:${identity.email}` : undefined,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    addressCountry: "IN",
  },
  sameAs: [identity.linkedin, identity.github, identity.instagram],
  knowsAbout: [
    "IT support",
    "Network engineering",
    "AI automation",
    "Full-stack TypeScript development",
    "Claude API",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: `${identity.name} — Portfolio`,
  publisher: { "@id": `${SITE_URL}/#person` },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${jakarta.variable} ${sora.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-fg antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ServiceWorkerCleanup />
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface focus:px-4 focus:py-2 focus:text-fg"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
