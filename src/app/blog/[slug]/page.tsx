import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChipRow } from "@/components/ui";
import { getAllPosts, getPost, getPostSlugs } from "@/lib/posts";

/** Plain objects — generateStaticParams does NOT take async params. */
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

/** params IS a Promise in Next 16 — sync access was removed. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      url: `/blog/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-5 py-14">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" />
        All posts
      </Link>

      <header className="mt-8 border-b border-rule pb-8">
        <p className="label">{post.date}</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
          {post.title}
        </h1>
        {post.tags.length > 0 ? (
          <div className="mt-5">
            <ChipRow items={post.tags} />
          </div>
        ) : null}
      </header>

      <div
        className="post mt-8"
        // Content is our own markdown from content/blog, not user input.
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );
}
