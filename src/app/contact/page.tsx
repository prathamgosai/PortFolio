import type { Metadata } from "next";
import { ArrowUpRight, Mail } from "lucide-react";
import { Section } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { identity } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Pratham Gosai — IT & network engineer and AI-automation builder. Open to work in Dubai, UAE and Surat, India — on-site, hybrid, and remote.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { email, linkedin, github, instagram } = identity;

  const socials = [
    { label: "LinkedIn", href: linkedin },
    { label: "GitHub", href: github },
    { label: "Instagram", href: instagram },
  ];

  return (
    <Section
      label="Contact"
      title="Let's talk."
      titleAs="h1"
      intro="Tell me about the role or project — I reply fastest on email and LinkedIn, usually within a day."
    >
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        {/* Left — the form */}
        <ContactForm />

        {/* Right — direct methods + availability */}
        <div className="flex flex-col gap-4">
          <div className="glass rounded-3xl p-6 sm:p-7">
            <div className="relative z-[1]">
              <p className="label">Reach me directly</p>
              <ul className="mt-4 flex flex-col divide-y divide-white/10">
                {email ? (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="flex items-center gap-3 py-3 text-fg transition-colors hover:text-accent-ink"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-accent-ink" />
                      <span className="min-w-0 flex-1 truncate">{email}</span>
                    </a>
                  </li>
                ) : null}
                {socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3 py-3 text-fg transition-colors hover:text-accent-ink"
                    >
                      <span>{s.label}</span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 sm:p-7">
            <div className="relative z-[1] grid grid-cols-2 gap-5">
              <div>
                <p className="label">Based in</p>
                <p className="t-small mt-1.5 text-fg">{identity.location}</p>
              </div>
              <div>
                <p className="label">Open to</p>
                <p className="t-small mt-1.5 text-fg">{identity.openTo}</p>
              </div>
              <div className="col-span-2">
                <p className="label">Ways of working</p>
                <p className="t-small mt-1.5 text-fg">On-site, hybrid, or remote</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
