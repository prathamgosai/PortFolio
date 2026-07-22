import type { Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Writing on workforce scheduling at scale, IT support, network engineering, and building with the Claude API.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <Section
      label="Blog"
      title="Writing"
      intro="Notes on the systems I build and the systems I keep running."
    >
      {posts.length === 0 ? (
        <p className="mt-8 text-muted">No posts yet.</p>
      ) : (
        <ul className="mt-8 border-t border-rule">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-rule">
              <Link href={`/blog/${post.slug}`} className="group block py-8">
                <p className="label">{post.date}</p>
                <h2 className="t-h3 mt-3 text-fg transition-colors group-hover:text-accent-ink">
                  {post.title}
                </h2>
                <p className="t-body measure mt-3 text-muted">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
