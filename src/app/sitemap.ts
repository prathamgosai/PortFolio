import type { MetadataRoute } from "next";
import { SITE_URL, projects } from "@/data/portfolio";
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
  { path: "/projects", priority: 0.8, changeFrequency: "monthly" },
  { path: "/experience", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/blog", priority: 0.7, changeFrequency: "monthly" },
];

/**
 * Case-study URLs are DERIVED from the project registry rather than typed out
 * here. `/projects/workforceiq` used to be a hardcoded string in this array, so
 * the sitemap was one more place that had to be remembered when a project was
 * added — and the failure mode is silent: a new case study simply never gets
 * crawled, with nothing failing to warn you.
 *
 * `caseStudy` is null for projects that have no deep write-up, and those are
 * filtered out. A sitemap entry pointing at a route that does not exist is
 * worse than no entry at all.
 */
const CASE_STUDIES = projects
  .filter((project) => project.caseStudy)
  .map((project) => ({
    path: project.caseStudy as string,
    priority: 0.9,
    changeFrequency: "yearly" as const,
  }));

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...ROUTES, ...CASE_STUDIES].map((route) => ({
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
