import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Section, ButtonLink, Card, CardGrid, DenseGrid, DenseCell } from "@/components/ui";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { PageJsonLd } from "@/components/page-jsonld";
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
      <PageJsonLd
        type="WebPage"
        path="/experience"
        name={`${identity.fullName} — experience, education & certifications`}
        description={`Work history, education, and ${certificationCount} verified certifications from Anthropic, Cisco Networking Academy, Microsoft, and Meta.`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Experience", path: "/experience" },
        ]}
      />
      <Section
        label="Experience"
        title="Where I've done the work."
        titleAs="h1"
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
              {/* Amber eyebrow here is earned: `current` roles are live status,
                  which is exactly what the signal colour is reserved for. */}
              <p className={`label ${role.current ? "label-signal" : ""}`}>
                {role.period} · {role.employment}
              </p>
              <h2 className="t-card-title mt-2 text-fg">{role.role}</h2>
              <p className="t-small mt-1 text-muted">
                {role.company} · {role.location}
              </p>
              <ul className="mt-5 space-y-2.5">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 t-small text-muted">
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
        <CardGrid as="ul" cols={2} className="mt-10">
          {education.map((item) => (
            <Card key={item.title} as="li" className="h-full list-none">
              <div className="relative z-[1]">
                <h3 className="t-card-title text-fg">{item.title}</h3>
                <p className="t-small mt-1.5 text-muted">{item.org}</p>
                <p className="label mt-3">{item.detail}</p>
              </div>
            </Card>
          ))}
        </CardGrid>
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
                <h3 className="t-card-title text-fg">{group.issuer}</h3>
                <span className="label">{group.items.length}</span>
              </div>

              {/* Reference content — the deliberate dense-grid exception, framed
                  by the same glass shell as every other panel on the site. */}
              <DenseGrid as="ul" cols={1} className="mt-4">
                {group.items.map((cert) => (
                  <DenseCell key={cert.name} as="li">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="measure t-small font-semibold text-fg">{cert.name}</h4>
                      {cert.date ? <p className="label shrink-0">{cert.date}</p> : null}
                    </div>
                    {cert.detail ? (
                      <p className="t-small measure mt-2 text-muted">{cert.detail}</p>
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
                  </DenseCell>
                ))}
              </DenseGrid>
            </div>
          ))}
        </div>
        <a
          href={CERTS_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 t-small font-semibold text-link hover:underline"
        >
          Verify on LinkedIn
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </Section>
    </>
  );
}
