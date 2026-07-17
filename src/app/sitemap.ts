import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/portfolio";
import { getPostSlugs } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = ["", "/about", "/projects", "/projects/workforceiq", "/experience", "/blog", "/contact"].map(
    (route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: route === "" ? 1 : route === "/projects/workforceiq" ? 0.9 : 0.7,
    }),
  );

  const posts = getPostSlugs().map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...routes, ...posts];
}
