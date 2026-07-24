import { Section, ChipRow } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { skills } from "@/data/portfolio";

/**
 * Homepage tech-stack overview — the real `skills` groups as glass cards.
 * A conversion + entity-SEO snapshot; the full breakdown lives on /about.
 */
export function TechStack() {
  return (
    <Section label="Tech stack" title="The tools I build and operate with.">
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((group, i) => (
          <Reveal key={group.group} delay={i * 0.04}>
            <div className="glass glass-hover h-full rounded-3xl p-6">
              <div className="relative z-[1]">
                <span aria-hidden className="block h-0.5 w-6 bg-accent" />
                <h3 className="t-card-title mt-3 text-fg">{group.group}</h3>
                <div className="mt-4">
                  <ChipRow items={group.items} />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
