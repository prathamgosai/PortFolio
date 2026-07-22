import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section, ChipRow, ButtonLink } from "@/components/ui";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { learningInPublic, workforceiq } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "WorkforceIQ — a workforce management platform for 370+ restaurant staff — plus what I'm currently learning in public.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
        ]}
      />
      <Section
        label="Projects"
        title="Work I can walk you through in detail."
        intro="One project I designed and shipped end to end, and an honest account of what I'm still learning."
      >
        <article className="glass glass-hover mt-8 rounded-xl p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="t-h3 text-fg">{workforceiq.name}</h3>
            <p className="label">{workforceiq.period}</p>
          </div>
          <p className="t-body measure mt-4 text-muted">{workforceiq.tagline}</p>

          <ul className="mt-6 space-y-3">
            {workforceiq.outcomes.map((outcome) => (
              <li key={outcome} className="flex gap-3 t-small text-fg">
                <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-accent" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <ChipRow items={workforceiq.stack} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={`/projects/${workforceiq.slug}`}>
              Read the case study
              <ArrowRight className="ml-1.5 inline h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={workforceiq.repo} variant="secondary" external>
              View repo
              <ArrowUpRight className="ml-1 inline h-4 w-4" />
            </ButtonLink>
          </div>
        </article>
      </Section>

      <Section
        label="Learning in public"
        title="What I'm working through."
        intro="These are study repositories and collected reading — not products I built. They're here because what someone is currently learning says something useful about them."
      >
        <ul className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-3">
          {learningInPublic.map((item) => (
            <li key={item.name} className="bg-bg p-6 transition-colors hover:bg-surface">
              <p className="label">{item.kind}</p>
              <h3 className="mt-2 font-mono text-base font-medium text-fg">{item.name}</h3>
              <p className="t-small mt-2 text-muted">{item.body}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 t-small font-medium text-link hover:underline"
              >
                GitHub
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
