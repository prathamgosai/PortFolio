import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Section, ButtonLink } from "@/components/ui";
import { CERTS_URL, certificationCount, certificationGroups, education, experience, identity } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Desktop & network engineer at Premware Services India LLP, and AI automation at K. Girdharlal International / Bookends Hospitality. Anthropic-certified in the Claude API and AI Fluency.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <Section
        label="Experience"
        title="Where I've done the work."
        intro="Ten-plus months keeping desktops and networks running, alongside automating live hotel operations and building the software the group runs on."
      >
        {identity.resumePdf ? (
          <div className="mt-6">
            <ButtonLink href={identity.resumePdf} variant="secondary" external>
              Download resume (PDF)
            </ButtonLink>
          </div>
        ) : null}

        <ol className="mt-8">
          {experience.map((role) => (
            <li key={role.company} className="relative border-l border-rule pb-10 pl-6 last:pb-0">
              <span
                aria-hidden
                className={`absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full ${
                  role.current ? "bg-accent" : "bg-rule"
                }`}
              />
              <p className="label">
                {role.period} · {role.employment}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-fg">{role.role}</h2>
              <p className="mt-0.5 text-sm text-muted">
                {role.company} · {role.location}
              </p>
              <ul className="mt-4 space-y-2">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm leading-relaxed text-muted">
                    <span aria-hidden className="mt-2.5 h-px w-2.5 shrink-0 bg-rule" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section label="Education & training" title="How I got here.">
        <ul className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2">
          {education.map((item) => (
            <li key={item.title} className="bg-bg p-5">
              <h3 className="font-display text-base font-semibold text-fg">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.org}</p>
              <p className="label mt-2">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        label="Certifications"
        title={`${certificationCount} certifications.`}
        intro="From Anthropic, Cisco Networking Academy, Microsoft, and Meta."
      >
        <div className="mt-8 space-y-10">
          {certificationGroups.map((group) => (
            <div key={group.issuer}>
              <div className="flex items-baseline gap-3">
                <span aria-hidden className="h-0.5 w-6 shrink-0 bg-accent" />
                <h3 className="font-display text-lg font-semibold text-fg">{group.issuer}</h3>
                <span className="label">{group.items.length}</span>
              </div>

              <ul className="mt-4 space-y-px border border-rule bg-rule">
                {group.items.map((cert) => (
                  <li key={cert.name} className="bg-bg p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="max-w-2xl font-medium text-fg">{cert.name}</h4>
                      {cert.date ? <p className="label shrink-0">{cert.date}</p> : null}
                    </div>
                    {cert.detail ? (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{cert.detail}</p>
                    ) : null}
                    {cert.credentialId || cert.verifyUrl ? (
                      <p className="label mt-2">
                        {cert.credentialId ? <>Credential ID {cert.credentialId}</> : null}
                        {cert.verifyUrl ? (
                          <>
                            {cert.credentialId ? " · " : null}
                            <a
                              href={cert.verifyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-link underline-offset-2 hover:underline"
                            >
                              Verify
                            </a>
                          </>
                        ) : null}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <a
          href={CERTS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-link hover:underline"
        >
          Verify on LinkedIn
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </Section>
    </>
  );
}
