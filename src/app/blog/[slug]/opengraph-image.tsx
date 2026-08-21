import { ImageResponse } from "next/og";
import { getAllPosts, getPostSlugs } from "@/lib/posts";
import { identity } from "@/data/portfolio";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Blog post by Pratham Gosai";

/** Prerender one card per post at build time, same as the pages themselves. */
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

/**
 * Per-post social card. Every post used to share the generic site card, so a
 * link to any article looked identical in a Slack/LinkedIn/WhatsApp preview.
 *
 * Satori supports flexbox only — no grid — and caps the bundle at 500KB, so
 * this stays deliberately plain: no custom fonts, no images.
 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);

  const title = post?.title ?? "Writing";
  const date = post?.date ?? "";
  const tags = post?.tags.slice(0, 4) ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f1620 0%, #16202c 60%, #101a24 100%)",
          padding: "68px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "62px",
                height: "62px",
                borderRadius: "16px",
                background: "#ffb84d",
                color: "#0f1620",
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              PG
            </div>
            <div style={{ display: "flex", marginLeft: 22, fontSize: 26, color: "#eef2f6", fontWeight: 600 }}>
              {identity.name}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#a3b0bd", letterSpacing: "0.14em" }}>
            {date.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", width: "64px", height: "6px", background: "#ffb84d", marginBottom: 26 }} />
          <div
            style={{
              display: "flex",
              // Long headlines have to stay inside the card, so the type scale
              // steps down once the title gets past a comfortable length.
              fontSize: title.length > 72 ? 50 : title.length > 48 ? 58 : 66,
              fontWeight: 700,
              color: "#eef2f6",
              letterSpacing: "-0.02em",
              lineHeight: 1.14,
              maxWidth: "1010px",
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                marginRight: 14,
                padding: "8px 18px",
                borderRadius: 999,
                border: "1px solid #2c3a4a",
                fontSize: 20,
                color: "#a3b0bd",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
