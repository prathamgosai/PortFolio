import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Statement } from "@/components/statement";
import { identity, certificationCount } from "@/data/portfolio";

/**
 * ─────────────────────────────────────────────────────────────
 * ABOUT TEASER — the editorial beat between proof and work.
 * ─────────────────────────────────────────────────────────────
 *
 * A teaser, not a second /about page. It carries the thesis in one statement and
 * four pieces of metadata, then hands off. Restating the full narrative here
 * would give the site two canonical versions of the same story, and the moment
 * one is edited they disagree.
 *
 * The metadata values are all live references — `identity` and a derived count —
 * so this block cannot drift out of date independently of the data file.
 */
export function AboutTeaser() {
  const meta = [
    { label: "Location", value: identity.locationShort },
    { label: "Specialisation", value: "Infrastructure + the software on top of it" },
    { label: "Current focus", value: "AI automation with the Claude API" },
    { label: "Certifications", value: `${certificationCount}, all verifiable` },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto max-w-5xl scroll-mt-28 px-5 py-20 sm:py-24"
    >
      <p className="label">About</p>

      <Statement
        as="h2"
        id="about-title"
        className="mt-6 text-fg"
        lines={["More than", "code."]}
      />

      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="t-body text-fg/90">
            I started in the server room — desktops, printers, the LAN and WAN they sit on, firewall
            rules, NAS boxes, and real users with real problems on the other end of the phone.
          </p>
          <p className="t-body mt-5 text-muted">
            Then I taught myself the layer above it and shipped a platform to production. The two
            halves inform each other more than people expect: rate limiting an API and writing a
            firewall rule are the same instinct, and so are reversible migrations and documented
            incidents. I build software the way I would want to support it at 11pm, because I have
            been the person doing that.
          </p>
          <Link
            href="/about"
            className="mt-7 inline-flex items-center gap-1.5 t-small font-semibold text-link hover:underline"
          >
            Read the full story
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>

        <dl className="about-meta">
          {meta.map((item) => (
            <div key={item.label}>
              <dt className="label text-[0.6875rem]">{item.label}</dt>
              <dd className="t-small mt-1.5 leading-snug text-fg">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
