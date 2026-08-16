import { SITE_URL, identity } from "@/data/portfolio";
import { getAllPosts } from "@/lib/posts";

/** Escape the five XML entities. Post titles/excerpts are ours, but an
 *  apostrophe or ampersand in one would still produce invalid XML. */
function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * RSS 2.0 feed at /feed.xml. Statically generated with the rest of the site —
 * there is no request-time work here, the posts come from the filesystem at
 * build time exactly as they do for /blog. Route Handlers default to dynamic,
 * so this has to say so explicitly or every feed reader poll runs the handler.
 */
export const dynamic = "force-static";

export function GET() {
  const posts = getAllPosts();
  const updated = posts[0]?.date ? new Date(posts[0].date) : new Date("2026-08-09");

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${xml(post.excerpt)}</description>
${post.tags.map((tag) => `      <category>${xml(tag)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(identity.name)} — Writing</title>
    <link>${SITE_URL}/blog</link>
    <description>Notes on the systems I build and the systems I keep running.</description>
    <language>en</language>
    <lastBuildDate>${updated.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
