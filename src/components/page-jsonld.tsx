import { SITE_URL, identity } from "@/data/portfolio";

/**
 * Page-level structured data for the non-article routes.
 *
 * Every page on the site was previously an untyped `WebPage` as far as Google
 * was concerned — only the home page (ProfilePage), the case study and the blog
 * posts declared what kind of thing they were. That leaves the crawler to infer
 * the site's shape from markup alone.
 *
 * The important part is not the `@type` string on its own, it's the wiring: each
 * page points `isPartOf` at the single canonical WebSite node and `about` at the
 * single canonical Person node, both declared once on the home page. That turns
 * a set of loosely-related URLs into one entity with several pages describing
 * it, which is what a person-name query is actually resolving.
 *
 * Never mint a second Person or WebSite node here — referencing the existing
 * @id is the whole point. Two competing Person nodes dilute the entity.
 */
export function PageJsonLd({
  type,
  path,
  name,
  description,
}: {
  type: "AboutPage" | "ContactPage" | "CollectionPage" | "WebPage";
  /** Route path, leading slash, no trailing slash. */
  path: string;
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${path}`;
  const data = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#page`,
    url,
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#pratham` },
    // The person is also the author/publisher of every page here — it's a
    // single-author personal site, and saying so explicitly reinforces it.
    author: { "@id": `${SITE_URL}/#pratham` },
    publisher: { "@id": `${SITE_URL}/#pratham` },
    primaryImageOfPage: `${SITE_URL}${identity.photo.src}`,
  };

  return (
    <script
      type="application/ld+json"
      // Build-time constants from our own data file, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
