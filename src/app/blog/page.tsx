import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, Card } from "@/components/ui";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL, identity } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing on workforce scheduling at scale, IT support, network engineering, and building with the Claude API.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  /**
   * A `Blog` node whose `blogPost` entries reference the same @ids the
   * individual post pages declare. That lets Google resolve the archive and the
   * posts as one authored body of work by the canonical Person, rather than as
   * unrelated URLs that happen to share a path prefix.
   */
  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: `${identity.name} — Writing`,
    description: "Notes on the systems I build and the systems I keep running.",
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#pratham` },
    publisher: { "@id": `${SITE_URL}/#pratham` },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": `${SITE_URL}/blog/${post.slug}#post`,
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
      author: { "@id": `${SITE_URL}/#pratham` },
    })),
  };

  return (
    <Section
      label="Blog"
      title="Writing"
      titleAs="h1"
      intro="Notes on the systems I build and the systems I keep running."
    >
      <script
        type="application/ld+json"
        // Build-time constants from our own content directory, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ]}
      />
      {posts.length === 0 ? (
        <p className="mt-8 text-muted">No posts yet.</p>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {posts.map((post) => (
            <Card key={post.slug} as="li" className="group list-none">
              <div className="relative z-[1]">
                <p className="label">{post.date}</p>
                <h2 className="t-h3 mt-3 text-fg transition-colors group-hover:text-accent-ink">
                  <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                    {post.title}
                  </Link>
                </h2>
                <p className="t-body measure mt-3 text-muted">{post.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 t-small font-semibold text-link">
                  Read post
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Card>
          ))}
        </ul>
      )}
    </Section>
  );
}
