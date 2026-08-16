import { Section, ChipRow, Card, CardGrid } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { skills } from "@/data/portfolio";

/**
 * Homepage tech-stack overview — the real `skills` groups as cards.
 * A conversion + entity-SEO snapshot; the full breakdown lives on /about.
 *
 * The amber tick rule that used to head every one of these six cards is gone.
 * Amber marks proof and primary action; a stack listing is neither, and six more
 * amber marks on one screen was a large part of why the accent had stopped
 * meaning anything. The heading carries the card on its own.
 */
export function TechStack() {
  return (
    <Section label="Tech stack" title="The tools I build and operate with.">
      <CardGrid className="mt-10">
        {skills.map((group, i) => (
          <Reveal key={group.group} delay={i * 0.04}>
            <div className="stitch-hud-card h-full rounded-2xl p-6 transition-all hover:scale-[1.01]">
              <div className="relative z-[1]">
                <div className="flex items-center justify-between">
                  <h3 className="t-card-title text-fg font-bold">{group.group}</h3>
                  <span className="status-pulse-amber" />
                </div>
                <div className="mt-4">
                  <ChipRow items={group.items} />
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </CardGrid>
    </Section>
  );
}
