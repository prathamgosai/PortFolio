import { certificationCount, identity, workforceiq } from "@/data/portfolio";

/**
 * FAQPage structured data. Two jobs: (1) it can earn an FAQ rich result under
 * the listing, and (2) every answer repeats "Pratham Gosai" in a Google-readable
 * way, reinforcing the name entity. Answers are verified facts from portfolio.ts.
 */
const FAQS: { q: string; a: string }[] = [
  {
    q: "Who is Pratham Gosai?",
    a: `Pratham Gosai (full name Pratham Dharmeshbharti Gosai) is an IT & network engineer turned AI-automation and full-stack builder based in ${identity.location}. He shipped WorkforceIQ, a workforce platform for 370+ restaurant staff.`,
  },
  {
    q: "What is WorkforceIQ?",
    a: `${workforceiq.tagline} Pratham designed and built it end to end — auto-scheduling, six-role access control, attendance and leave, WhatsApp notifications, and a FastAPI service that forecasts staffing demand.`,
  },
  {
    q: "What technologies does Pratham Gosai work with?",
    a: `Infrastructure and networking (L1/L2 desktop support, Windows, LAN/WAN, firewalls, NAS), full-stack development (TypeScript, Next.js, React, NestJS, PostgreSQL, Redis), and AI automation with the Claude API and Python/FastAPI.`,
  },
  {
    q: "What certifications does Pratham Gosai hold?",
    a: `${certificationCount} certifications across Anthropic (Claude API development and AI Fluency), Cisco Networking Academy, Microsoft, and Meta.`,
  },
  {
    q: "Is Pratham Gosai available for hire?",
    a: `Yes. Pratham is based in ${identity.locationShort} and open to on-site, hybrid, and remote roles.`,
  },
];

export function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
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
