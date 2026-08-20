import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { Hero } from "@/components/hero";
import { Faq } from "@/components/faq";
import { Testimonials } from "@/components/testimonials";
import { SystemBento } from "@/components/system-bento";
import { AboutTeaser } from "@/components/about-teaser";
import { Journey } from "@/components/journey";
import { SelectedWork } from "@/components/selected-work";
import { Capabilities } from "@/components/capabilities";
import { TechStack } from "@/components/tech-stack";
import { FinalCta } from "@/components/final-cta";
import { PersonJsonLd } from "@/components/person-jsonld";
import { FaqJsonLd } from "@/components/faq-jsonld";
import { getAllPosts } from "@/lib/posts";
import { experience } from "@/data/portfolio";

/**
 * ─────────────────────────────────────────────────────────────
 * HOME — one long editorial scroll.
 * ─────────────────────────────────────────────────────────────
 *
 * The order is an argument, and each beat exists because the one before it
 * raises a question:
 *
 *   Hero            the claim
 *   SystemBento     the numbers behind it            → "says who?"
 *   AboutTeaser     who is making the claim          → "how did you get here?"
 *   Journey         the dated route                  → "so what have you built?"
 *   SelectedWork    the shipped thing                → "what else can you do?"
 *   Capabilities    the full scope + how to engage   → "with what?"
 *   TechStack       the tools
 *   Experience      where the work happened
 *   Writing         evidence of thinking, not just doing
 *   Testimonials    self-hiding until real quotes exist
 *   FAQ             the objections
 *   FinalCta        the ask
 *
 * Sections carry `id`s and `scroll-mt-28` so the nav can anchor into them. The
 * anchors are deliberately native — Lenis's own anchor handling is disabled
 * (see smooth-scroll.tsx), so `scroll-margin-top` is what clears the fixed
 * navbar, and it does so with JS off and under reduced motion too.
 */
export default function HomePage() {
  const posts = getAllPosts().slice(0, 2);

  return (
    <>
      <PersonJsonLd />
      <FaqJsonLd />

      <Hero />

      {/* Proof — status, the four approved numbers, certifications. */}
      <SystemBento />

      <AboutTeaser />

      <Journey />

      <SelectedWork />

      <Capabilities />

      <TechStack />

      {/* Experience preview */}
      <Section label="Experience" title="Where I've done the work.">
        {/* The left rule lives in `.row-hover`, not as a border utility here —
            see the cascade note above `.chip` in globals.css. */}
        <ul className="mt-8 space-y-3">
          {experience.map((role) => (
            <li key={role.company} className="row-hover rounded-xl py-3 pl-5 pr-4">
              <p className="label">{role.period}</p>
              <h3 className="t-card-title mt-2 text-fg">{role.role}</h3>
              <p className="t-small text-muted">{role.company}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/experience"
          className="mt-7 inline-flex items-center gap-1.5 t-small font-semibold text-link hover:underline"
        >
          Full timeline, education &amp; certifications
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>

      {/* Latest writing */}
      {posts.length > 0 ? (
        <Section label="Writing" title="Latest posts">
          <ul className="write-list mt-10">
            {posts.map((post, i) => (
              <Reveal key={post.slug} as="li" delay={i * 0.05} className="write-row">
                <p className="label">{post.date}</p>
                <h3 className="t-card-title mt-2.5 text-fg">
                  {/* Stretched link: the accessible name stays the post title. */}
                  <Link href={`/blog/${post.slug}`} className="write-row__link">
                    {post.title}
                  </Link>
                </h3>
                <p className="t-small measure mt-3 text-muted">{post.excerpt}</p>
              </Reveal>
            ))}
          </ul>
          <Link
            href="/blog"
            className="mt-8 inline-flex items-center gap-1.5 t-small font-semibold text-link hover:underline"
          >
            All posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Section>
      ) : null}

      {/* Testimonials (self-hides until real quotes exist) */}
      <Testimonials />

      {/* FAQ — visible content mirrors the FAQPage structured data */}
      <Section label="FAQ" title="Questions, answered.">
        <Faq />
      </Section>

      <FinalCta />
    </>
  );
}
