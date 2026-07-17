import { SITE_URL, identity } from "@/data/portfolio";

export function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.name,
    jobTitle: identity.jobTitle,
    url: SITE_URL,
    sameAs: [identity.linkedin, identity.github, identity.instagram],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    alumniOf: "Bhagwan Mahavir University",
    knowsAbout: [
      "IT Support",
      "Network Engineering",
      "Firewall Security",
      "NAS Storage",
      "AI Automation",
      "Claude API",
      "TypeScript",
      "Next.js",
      "PostgreSQL",
      "FastAPI",
    ],
    ...(identity.email ? { email: `mailto:${identity.email}` } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // Content is a build-time constant from our own data file, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
