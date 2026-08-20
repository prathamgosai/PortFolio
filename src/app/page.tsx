import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section, ChipRow, ButtonLink, CTABlock, Card, CardGrid } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { Hero } from "@/components/hero";
import { Faq } from "@/components/faq";
import { Testimonials } from "@/components/testimonials";
import { SystemBento } from "@/components/system-bento";
import { TechStack } from "@/components/tech-stack";
import { PersonJsonLd } from "@/components/person-jsonld";
import { FaqJsonLd } from "@/components/faq-jsonld";
import { getAllPosts } from "@/lib/posts";
import { experience, identity, workforceiq } from "@/data/portfolio";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 2);

  return (
    <>
      <PersonJsonLd />
      <FaqJsonLd />

      <Hero />

      {/**
       * Overview bento.
       *
       * This one grid absorbs what used to be three consecutive full-width
       * strips — <StatBar/>, <CertTrust/> and the "What I do" card grid — each
       * of which made the same kind of claim at the same visual weight, one
       * after another, for roughly three screens of scroll. The bento ranks them
       * by tile size instead of by scroll order, which is both shorter and
       * legible before anything is read. Rationale in system-bento.tsx.
       */}
      <SystemBento />

      {/* Tech stack */}
      <TechStack />

      {/**
       * Featured work — the single heaviest element on the page.
       *
       * This card used to be styled identically to a tech-stack tile: same
       * radius, same padding, same weight. The one project the whole site is
       * built to sell had no more visual authority than a list of framework
       * names. It now gets `tone="feature"` (deeper padding, an amber ring),
       * `space="loose"` around it, and a headline treatment of its own.
       */}
      <Section label="Featured work" labelTone="signal" title="WorkforceIQ" space="loose">
        <Reveal>
          <Card tone="feature" as="article" className="mt-8">
            <div className="relative z-[1] grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="t-body text-fg/90">{workforceiq.tagline}</p>
                <ul className="mt-7 space-y-3.5">
                  {workforceiq.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3 t-small text-fg">
                      <span aria-hidden className="mt-2.5 h-px w-3.5 shrink-0 bg-accent" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href={`/projects/${workforceiq.slug}`}>
                    Read the case study
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href={workforceiq.repo} variant="secondary" external>
                    View repo
                    <ArrowUpRight className="h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>
              <div className="border-t border-hairline pt-7 lg:border-l lg:border-t-0 lg:pl-9 lg:pt-0">
                <p className="label">Stack</p>
                <div className="mt-3">
                  <ChipRow items={workforceiq.stack} />
                </div>
                <p className="label mt-7">Built</p>
                <p className="t-small mt-2 text-muted">
                  {workforceiq.period} · at {workforceiq.builtAt}
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </Section>

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
          <CardGrid cols={2} className="mt-10">
            {posts.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.05}>
                {/* Stretched-link card: the anchor stays on the title (so its
                    accessible name is the post title, not "read more"), and its
                    ::after covers the panel to make the whole card clickable. */}
                <Card as="article" className="group h-full">
                  <div className="relative z-[1]">
                    <p className="label">{post.date}</p>
                    <h3 className="t-card-title mt-3 text-fg transition-colors group-hover:text-accent-ink">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="t-small mt-3 text-muted">{post.excerpt}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 t-small font-semibold text-link">
                      Read post
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Card>
              </Reveal>
            ))}
          </CardGrid>
          <Link
            href="/blog"
            className="mt-7 inline-flex items-center gap-1.5 t-small font-semibold text-link hover:underline"
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

      {/* Contact CTA */}
      <Section space="loose">
        <CTABlock
          title="Looking for someone who can build it and keep it running?"
          body={`I'm in ${identity.locationShort} and open to on-site, hybrid, or remote roles. I reply fastest on email and LinkedIn.`}
        >
          {identity.email ? (
            <ButtonLink href={`mailto:${identity.email}`} external>
              Email me
            </ButtonLink>
          ) : null}
          <ButtonLink href={identity.linkedin} variant={identity.email ? "secondary" : "primary"} external>
            LinkedIn
            <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={identity.github} variant="secondary" external>
            GitHub
            <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={identity.instagram} variant="secondary" external>
            Instagram
            <ArrowUpRight className="h-4 w-4" />
          </ButtonLink>
        </CTABlock>
      </Section>
    </>
  );
}
