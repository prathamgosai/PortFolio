import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Section, ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page doesn't exist. Here's the way back.",
  robots: { index: false, follow: true },
};

const ELSEWHERE = [
  { href: "/projects/workforceiq", label: "The WorkforceIQ case study" },
  { href: "/experience", label: "Experience, education & certifications" },
  { href: "/blog", label: "Writing" },
  { href: "/contact", label: "Get in touch" },
];

export default function NotFound() {
  return (
    <Section
      label="404"
      title="That page doesn't exist."
      titleAs="h1"
      intro="The link is either out of date or slightly mistyped. Nothing here is behind a login, so it's most likely just gone."
    >
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/">Back to the home page</ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Report a broken link
        </ButtonLink>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <p className="label">Or try one of these</p>
        <ul className="mt-4 flex flex-col gap-2">
          {ELSEWHERE.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex items-center gap-1.5 t-small font-medium text-link hover:underline"
              >
                {item.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
