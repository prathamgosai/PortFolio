import type { Metadata } from "next";
import { BootScreen, NocFooter, NocNav } from "@/components/noc/chrome";
import { NetworkCanvas } from "@/components/noc/network-canvas";
import { Contact, Hero, Layer1, Layer2, Layer3, Layer4, Layer5, StatsBar } from "@/components/noc/sections";
import { getAllPosts } from "@/lib/posts";
import { identity } from "@/data/portfolio";
import "./noc.css";

export const metadata: Metadata = {
  title: "NOC — Liquid Glass",
  description: `${identity.name} — network operations centre view: infrastructure, security, cloud & AI engineering.`,
  alternates: { canonical: "/noc" },
  // Experimental surface, not the canonical portfolio — keep it out of search
  // until it's promoted to the homepage.
  robots: { index: false, follow: true },
};

export default function NocPage() {
  const posts = getAllPosts();

  return (
    <div className="noc-root">
      <BootScreen />
      <div className="rack-bloom" aria-hidden />
      <div className="alert-beacon" aria-hidden />
      <NetworkCanvas />

      <NocNav />
      <Hero />
      <StatsBar />
      <Layer1 />
      <Layer2 />
      <Layer3 />
      <Layer4 />
      <Layer5 posts={posts} />
      <Contact />
      <NocFooter />
    </div>
  );
}
