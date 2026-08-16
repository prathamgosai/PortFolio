import { SITE_URL, certificationGroups, experience, identity, skills } from "@/data/portfolio";

/**
 * Structured data for Google's Knowledge Graph. Two graphs:
 *  - ProfilePage → Person: tells Google this site IS Pratham Gosai, with every
 *    verified off-site profile in `sameAs` so the identity is corroborated.
 *  - WebSite: names the site so it can win a sitelinks/name box for the query.
 * Every field is a build-time constant from portfolio.ts — never user input.
 */
/**
 * Every certification as an EducationalOccupationalCredential.
 *
 * This is the strongest corroboration signal the site has: 14 credentials from
 * four named issuers, several with a public verification URL. It tells Google
 * that the Person entity is attested by third parties it already knows
 * (Anthropic, Cisco, Microsoft, Meta) rather than only by his own website —
 * which is precisely the distinction that decides a name query between a
 * personal site and the LinkedIn profile competing with it.
 *
 * Fields are omitted rather than guessed when the source data has them null;
 * `undefined` values disappear in JSON.stringify, which is the behaviour we want.
 */
function credentials() {
  return certificationGroups.flatMap((group) =>
    group.items.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      name: cert.name,
      credentialCategory: "certificate",
      recognizedBy: { "@type": "Organization", name: group.issuer },
      dateCreated: cert.date ?? undefined,
      identifier: cert.credentialId ?? undefined,
      url: cert.verifyUrl ?? undefined,
    })),
  );
}

export function PersonJsonLd() {
  const person = {
    "@type": "Person",
    "@id": `${SITE_URL}/#pratham`,
    name: identity.name,
    givenName: "Pratham",
    familyName: "Gosai",
    legalName: identity.fullName,
    alternateName: [identity.fullName, "Pratham Gosai", "Pratham"],
    description: identity.oneLine,
    jobTitle: identity.jobTitle,
    url: SITE_URL,
    mainEntityOfPage: { "@id": `${SITE_URL}/#profilepage` },
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}${identity.photo.src}`,
      width: identity.photo.width,
      height: identity.photo.height,
    },
    email: identity.email ? `mailto:${identity.email}` : undefined,
    sameAs: [identity.linkedin, identity.github, identity.instagram],
    knowsLanguage: [
      { "@type": "Language", name: "English" },
      { "@type": "Language", name: "Hindi" },
      { "@type": "Language", name: "Gujarati" },
    ],
    // Both roles are concurrent (see the note in portfolio.ts). Listing only one
    // employer understated the entity and contradicted the visible timeline.
    worksFor: experience
      .filter((role) => role.current)
      .map((role) => ({ "@type": "Organization", name: role.company })),
    hasOccupation: experience.map((role) => ({
      "@type": "Occupation",
      name: role.role,
      occupationLocation: { "@type": "City", name: role.location },
    })),
    hasCredential: credentials(),
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
    // Derived from the same `skills` source the /about page renders, so the
    // structured data can never drift from the visible content the way a
    // hand-maintained duplicate list does.
    knowsAbout: Array.from(new Set(skills.flatMap((group) => group.items))),
  };

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: `${identity.fullName} — Portfolio`,
        description: identity.oneLine,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#pratham` },
        mainEntity: { "@id": `${SITE_URL}/#pratham` },
        primaryImageOfPage: `${SITE_URL}${identity.photo.src}`,
      },
      person,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        // `name` is what Google may show as the site name in results. The short
        // display name is the one people actually type; `alternateName` carries
        // the full legal name so both spellings resolve to this site.
        name: identity.name,
        alternateName: [identity.fullName, `${identity.name} Portfolio`],
        description: identity.oneLine,
        publisher: { "@id": `${SITE_URL}/#pratham` },
        copyrightHolder: { "@id": `${SITE_URL}/#pratham` },
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
