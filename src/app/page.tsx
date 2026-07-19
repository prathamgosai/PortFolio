import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import prathamPhoto from "../../public/pratham.jpeg";
import { Section, StatBar, ChipRow, ButtonLink, CTABlock } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { FadeIn } from "@/components/fade-in";
import { PersonJsonLd } from "@/components/person-jsonld";
import { FaqJsonLd } from "@/components/faq-jsonld";
import { getAllPosts } from "@/lib/posts";
import { experience, hero, identity, whatIDo, workforceiq } from "@/data/portfolio";

export default function HomePage() {
  const posts = getAllPosts().slice(0, 2);

  return (
    <>
      <PersonJsonLd />
      <FaqJsonLd />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-5 pb-14 pt-14 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="max-w-2xl">
            <FadeIn>
              <p className="label">{identity.availability}</p>
            </FadeIn>
            <FadeIn delay={0.06}>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-fg sm:text-5xl lg:text-6xl">
                {hero.headline}
              </h1>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{hero.sub}</p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <div className="mt-7 flex flex-wrap gap-3">
                <ButtonLink href={`/projects/${workforceiq.slug}`}>
                  Read the WorkforceIQ case study
                  <ArrowRight className="ml-1.5 inline h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary">
                  Contact me
                </ButtonLink>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.1}>
            <div className="relative mx-auto aspect-[4/5] w-56 overflow-hidden rounded-lg border border-rule bg-surface sm:w-64 lg:w-full lg:max-w-xs">
              <Image
                src={prathamPhoto}
                alt={`${identity.name} — portrait`}
                placeholder="blur"
                priority
                sizes="(min-width: 1024px) 320px, 256px"
                className="h-full w-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <StatBar />

      {/* What I do */}
      <Section label="What I do" title="Three layers, one job: make things work.">
        <div className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-3">
          {whatIDo.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.05}>
              <div className="h-full bg-bg p-6 transition-colors hover:bg-surface">
                <span aria-hidden className="block h-0.5 w-6 bg-accent" />
                <h3 className="mt-3 font-display text-lg font-semibold text-fg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Featured work */}
      <Section label="Featured work" title="WorkforceIQ">
        <Reveal>
          <article className="mt-6 rounded border border-rule bg-surface p-6 transition-colors hover:border-accent sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-muted">{workforceiq.tagline}</p>
                <ul className="mt-5 space-y-2.5">
                  {workforceiq.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-3 text-sm leading-relaxed text-fg">
                      <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-accent" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink href={`/projects/${workforceiq.slug}`}>Read the case study</ButtonLink>
                  <ButtonLink href={workforceiq.repo} variant="secondary" external>
                    View repo
                    <ArrowUpRight className="ml-1 inline h-4 w-4" />
                  </ButtonLink>
                </div>
              </div>
              <div className="border-t border-rule pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <p className="label">Stack</p>
                <div className="mt-3">
                  <ChipRow items={workforceiq.stack} />
                </div>
                <p className="label mt-6">Built</p>
                <p className="mt-2 text-sm text-muted">
                  {workforceiq.period} · at {workforceiq.builtAt}
                </p>
              </div>
            </div>
          </article>
        </Reveal>
      </Section>

      {/* Experience preview */}
      <Section label="Experience" title="Where I've done the work.">
        <ul className="mt-8 space-y-6">
          {experience.map((role) => (
            <li key={role.company} className="border-l border-rule pl-5">
              <p className="label">{role.period}</p>
              <h3 className="mt-1.5 font-display text-lg font-semibold text-fg">{role.role}</h3>
              <p className="text-sm text-muted">{role.company}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/experience"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-link hover:underline"
        >
          Full timeline, education & certifications
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Section>

      {/* Latest writing */}
      {posts.length > 0 ? (
        <Section label="Writing" title="Latest posts">
          <div className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-bg p-6 transition hover:bg-surface">
                <p className="label">{post.date}</p>
                <h3 className="mt-2 font-display text-lg font-semibold text-fg group-hover:text-accent-ink">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{post.excerpt}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-link hover:underline"
          >
            All posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Section>
      ) : null}

      {/* Contact CTA */}
      <Section>
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
            <ArrowUpRight className="ml-1 inline h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={identity.github} variant="secondary" external>
            GitHub
            <ArrowUpRight className="ml-1 inline h-4 w-4" />
          </ButtonLink>
          <ButtonLink href={identity.instagram} variant="secondary" external>
            Instagram
            <ArrowUpRight className="ml-1 inline h-4 w-4" />
          </ButtonLink>
        </CTABlock>
      </Section>
    </>
  );
}
