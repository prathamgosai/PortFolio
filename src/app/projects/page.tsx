import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section, ChipRow, ButtonLink, Card, CardGrid } from "@/components/ui";
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
        titleAs="h1"
        intro="One project I designed and shipped end to end, and an honest account of what I'm still learning."
      >
        <Card tone="feature" as="article" className="mt-8">
          <div className="relative z-[1]">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="t-h2 text-fg">{workforceiq.name}</h2>
              <p className="label">{workforceiq.period}</p>
            </div>
            <p className="t-body measure mt-4 text-fg/90">{workforceiq.tagline}</p>

            <ul className="mt-7 space-y-3.5">
              {workforceiq.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 t-small text-fg">
                  <span aria-hidden className="mt-2.5 h-px w-3.5 shrink-0 bg-accent" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 border-t border-hairline pt-6">
              <p className="label">Stack</p>
              <div className="mt-3">
                <ChipRow items={workforceiq.stack} />
              </div>
            </div>

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
        </Card>
      </Section>

      <Section
        label="Learning in public"
        title="What I'm working through."
        intro="These are study repositories and collected reading — not products I built. They're here because what someone is currently learning says something useful about them."
      >
        <CardGrid as="ul" className="mt-10">
          {learningInPublic.map((item) => (
            <Card key={item.name} as="li" className="group h-full list-none">
              <div className="relative z-[1]">
                <p className="label">{item.kind}</p>
                <h3 className="mt-2 font-mono t-small font-medium text-fg">
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="after:absolute after:inset-0"
                  >
                    {item.name}
                  </a>
                </h3>
                <p className="t-small mt-2 text-muted">{item.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 t-small font-medium text-link">
                  GitHub
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Card>
          ))}
        </CardGrid>
      </Section>
    </>
  );
}
