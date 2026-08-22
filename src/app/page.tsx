import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { Hero } from "@/components/hero";
import { Faq } from "@/components/faq";
import { Testimonials } from "@/components/testimonials";
import { SystemBento } from "@/components/system-bento";
import { SystemGraph } from "@/components/lab/system-graph";
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
import {
  systemNodes,
  systemEdges,
  workforceNodes,
  workforceEdges,
} from "@/data/lab";

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
 *   SelectedWork    the shipped thing                → "how is it put together?"
 *     └ diagram      the WorkforceIQ architecture     → "what else can you do?"
 *   Capabilities    the full scope + how to engage   → "with what?"
 *   TechStack       the tools                        → "at what altitude?"
 *     └ diagram      endpoint → network → app → AI
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

      {/**
       * The architecture behind the thing SelectedWork just described.
       *
       * Both of these diagrams also appear on /lab, and the duplication is the
       * point rather than an oversight: /lab is where someone goes who already
       * wants the detail, and most visitors never get there. The claim that the
       * work is real is much harder to make in prose than by showing the parts
       * and what talks to what, so the evidence belongs on the page that has to
       * do the convincing.
       *
       * Placed HERE, immediately after the project, because it answers the
       * question that section raises — not held back to a systems section of
       * its own, where it would be a diagram in search of a subject.
       */}
      <Section
        label="Architecture"
        title="How WorkforceIQ is put together."
        intro="The same platform, as parts and the paths between them. Select any node for what it does."
        className="cine-enter cine-exit"
      >
        <Reveal className="reveal--card">
          <SystemGraph
            nodes={workforceNodes}
            edges={workforceEdges}
            caption="The WorkforceIQ architecture — web, API, data, forecasting and delivery."
            description="The WorkforceIQ architecture. A Next.js web client calls a NestJS API. The API writes to PostgreSQL, pushes background work to Redis, and calls a Python FastAPI forecasting service, which in turn reads history from PostgreSQL. The Redis queue dispatches notifications to WhatsApp via the Meta Graph API and to email as a second channel."
          />
        </Reveal>
      </Section>

      <Capabilities />

      <TechStack />

      {/**
       * TechStack names the tools; this says at what ALTITUDE they are used,
       * which is the part of the claim a list of logos cannot make. It follows
       * the tools for that reason.
       */}
      <Section
        label="System"
        title="The whole path, endpoint to automation."
        intro="Most people work at one altitude. This is the range I actually cover — the cable, the box, the service on it, and the model calling that service."
        className="cine-enter cine-exit"
      >
        <Reveal className="reveal--card">
          <SystemGraph
            nodes={systemNodes}
            edges={systemEdges}
            caption="Endpoints through network and security to the application layer, and on to AI-driven automation."
            description="A system diagram. Endpoints connect to the network, which connects both to security (firewalls and identity) and to the API. The API connects to a PostgreSQL database, a Redis queue, and the Next.js interface, and also to the Claude API. Both the AI layer and the Redis queue feed automation of live operations."
          />
        </Reveal>
      </Section>

      {/* Experience preview */}
      <Section label="Experience" title="Where I've done the work." className="cine-enter cine-exit">
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
        <Section label="Writing" title="Latest posts" className="cine-enter cine-exit">
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
      <Section label="FAQ" title="Questions, answered." className="cine-enter cine-exit">
        <Faq />
      </Section>

      <FinalCta />
    </>
  );
}
