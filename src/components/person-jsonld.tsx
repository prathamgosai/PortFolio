import { SITE_URL, identity } from "@/data/portfolio";

/**
 * Structured data for Google's Knowledge Graph. Two graphs:
 *  - ProfilePage → Person: tells Google this site IS Pratham Gosai, with every
 *    verified off-site profile in `sameAs` so the identity is corroborated.
 *  - WebSite: names the site so it can win a sitelinks/name box for the query.
 * Every field is a build-time constant from portfolio.ts — never user input.
 */
export function PersonJsonLd() {
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#pratham`,
    name: identity.name,
    legalName: identity.fullName,
    alternateName: [identity.fullName, "Pratham Gosai", "Pratham"],
    description: identity.oneLine,
    jobTitle: identity.jobTitle,
    url: SITE_URL,
    image: `${SITE_URL}${identity.photo.src}`,
    email: identity.email ? `mailto:${identity.email}` : undefined,
    sameAs: [identity.linkedin, identity.github, identity.instagram],
    worksFor: {
      "@type": "Organization",
      name: "K. Girdharlal International Ltd. / Bookends Hospitality",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    homeLocation: {
      "@type": "Place",
      name: "Surat, Gujarat, India",
    },
    nationality: { "@type": "Country", name: "India" },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Bhagwan Mahavir University" },
      { "@type": "EducationalOrganization", name: "PureSkill IT Training Academy" },
    ],
    knowsAbout: [
      "IT Support",
      "Network Engineering",
      "Firewall Security",
      "NAS Storage",
      "Cybersecurity",
      "Cloud Computing",
      "AI Automation",
      "Claude API",
      "TypeScript",
      "Next.js",
      "PostgreSQL",
      "FastAPI",
    ],
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: `${identity.name} — Portfolio`,
        mainEntity: { "@id": `${SITE_URL}/#pratham` },
      },
      person,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: identity.name,
        description: identity.oneLine,
        publisher: { "@id": `${SITE_URL}/#pratham` },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Content is a build-time constant from our own data file, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
