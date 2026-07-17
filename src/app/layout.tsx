import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SITE_URL, identity } from "@/data/portfolio";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexCondensed = IBM_Plex_Sans_Condensed({
  variable: "--font-plex-condensed",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexCondensed.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-fg antialiased">
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
