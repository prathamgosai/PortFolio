import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { CERTS_URL, certificationCount, certificationGroups } from "@/data/portfolio";

/**
 * Credibility strip shown right below the hero. Instead of fabricated "trusted
 * by" client logos, it surfaces the REAL certifying bodies (issuer names only —
 * no trademarked logos) plus the verified count, linking out to proof.
 */
export function CertTrust() {
  const issuers = certificationGroups.map((g) => g.issuer);

  return (
    <section className="mx-auto max-w-5xl px-5 py-8" aria-label="Certifications">
      <div className="glass rounded-3xl px-6 py-6 sm:px-8">
        <div className="relative z-[1] flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="shrink-0">
            <p className="label">Certified &amp; verified</p>
            <p className="t-small mt-1.5 text-muted">
              <span className="font-display text-lg font-bold text-accent-ink">{certificationCount}</span>{" "}
              professional certifications
            </p>
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {issuers.map((name) => (
              <li key={name} className="flex items-center gap-2 text-fg/85">
                <BadgeCheck aria-hidden className="h-4 w-4 shrink-0 text-accent-ink" />
                <span className="font-display text-sm font-semibold tracking-tight">{name}</span>
              </li>
            ))}
          </ul>

          <a
            href={CERTS_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-80"
          >
            Verify <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
