import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Section, ButtonLink } from "@/components/ui";
import { identity } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Pratham Gosai — IT & network engineer and AI-automation builder in Surat, India. Open to on-site, hybrid, and remote roles.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { email, linkedin, github, instagram } = identity;

  return (
    <Section
      label="Contact"
      title="Let's talk."
      intro={email ? "I reply fastest on email and LinkedIn." : "I reply fastest on LinkedIn."}
    >
      <div className="mt-8 flex flex-wrap gap-3">
        {email ? (
          <ButtonLink href={`mailto:${email}`} external>
            Email me
          </ButtonLink>
        ) : null}
        <ButtonLink href={linkedin} variant={email ? "secondary" : "primary"} external>
          LinkedIn
          <ArrowUpRight className="ml-1 inline h-4 w-4" />
        </ButtonLink>
        <ButtonLink href={github} variant="secondary" external>
          GitHub
          <ArrowUpRight className="ml-1 inline h-4 w-4" />
        </ButtonLink>
        <ButtonLink href={instagram} variant="secondary" external>
          Instagram
          <ArrowUpRight className="ml-1 inline h-4 w-4" />
        </ButtonLink>
      </div>

      <dl className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-2">
        <div className="bg-bg p-5">
          <dt className="label">Based in</dt>
          <dd className="mt-1.5 text-sm text-fg">{identity.location}</dd>
        </div>
        <div className="bg-bg p-5">
          <dt className="label">Availability</dt>
          <dd className="mt-1.5 text-sm text-fg">Open to on-site, hybrid, or remote roles</dd>
        </div>
      </dl>
    </Section>
  );
}
