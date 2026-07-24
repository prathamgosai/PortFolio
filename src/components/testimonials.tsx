import Image from "next/image";
import { Quote } from "lucide-react";
import { Section } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { testimonials } from "@/data/portfolio";

/**
 * Testimonials — real quotes only. Renders NOTHING when the data array is empty,
 * so the page never shows fabricated or placeholder social proof. Populate
 * `testimonials` in portfolio.ts with genuine recommendations to switch it on.
 */
export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <Section label="Testimonials" title="What people say.">
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {testimonials.map((t, i) => (
          <Reveal key={`${t.name}-${i}`} delay={i * 0.05}>
            <figure className="glass glass-hover flex h-full flex-col rounded-3xl p-6 sm:p-7">
              <Quote aria-hidden className="relative z-[1] h-6 w-6 text-accent-ink" />
              <blockquote className="relative z-[1] mt-4 flex-1">
                <p className="t-body text-fg/90">“{t.quote}”</p>
              </blockquote>
              <figcaption className="relative z-[1] mt-6 flex items-center gap-3">
                {t.avatar ? (
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <span
                    aria-hidden
                    className="grid h-11 w-11 place-items-center rounded-full bg-accent/15 font-display text-sm font-bold text-accent-ink ring-1 ring-white/10"
                  >
                    {t.name.charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-display text-[0.95rem] font-semibold text-fg">
                    {t.name}
                  </span>
                  <span className="block truncate text-sm text-muted">
                    {t.role}
                    {t.company ? ` · ${t.company}` : ""}
                  </span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
