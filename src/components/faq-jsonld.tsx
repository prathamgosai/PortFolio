import { faqs } from "@/data/portfolio";

/**
 * FAQPage structured data. Two jobs: (1) it can earn an FAQ rich result under
 * the listing, and (2) every answer repeats "Pratham Gosai" in a Google-readable
 * way, reinforcing the name entity. Content is shared with the visible <Faq/>
 * accordion via the single `faqs` source in portfolio.ts (they must match).
 */
export function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <script
      type="application/ld+json"
      // Build-time constant from our own data file, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
