import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

/**
 * Future post ideas:
 *  - WhatsApp via the Meta Graph API: what the docs don't tell you
 *  - Single-use refresh-token rotation, explained
 *  - Demand forecasting with FastAPI
 *  - From Cisco firewall basics to API rate limiting
 */

const POSTS_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

export type Post = PostMeta & { html: string };

function readPostFile(slug: string) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), "utf8");
  return matter(raw);
}

function toMeta(slug: string, data: Record<string, unknown>): PostMeta {
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
  };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

/** Newest first. */
export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => toMeta(slug, readPostFile(slug).data))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!getPostSlugs().includes(slug)) return null;
  const { data, content } = readPostFile(slug);
  const processed = await remark().use(html).process(content);
  return { ...toMeta(slug, data), html: processed.toString() };
}
