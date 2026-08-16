import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/portfolio";
import { getAllPosts } from "@/lib/posts";

/**
 * Every URL used to be stamped with `new Date()`, which told crawlers the whole
 * site changed on every deploy — that's noise, and repeated often enough it
 * teaches Google to ignore lastModified here. Posts now carry their own
 * publication date, and the static pages share one date that only moves when
 * their content actually does.
 */
const PAGES_LAST_MODIFIED = new Date("2026-08-09");

const ROUTES: { path: string; priority: number; changeFrequency: "monthly" | "yearly" }[] = [
  { path: "", priority: 1, changeFrequency: "monthly" },
  { path: "/projects/workforceiq", priority: 0.9, changeFrequency: "yearly" },
  { path: "/projects", priority: 0.8, changeFrequency: "monthly" },
  { path: "/experience", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/blog", priority: 0.7, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: PAGES_LAST_MODIFIED,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...pages, ...posts];
}
