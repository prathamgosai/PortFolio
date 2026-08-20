import { ArrowUpRight } from "lucide-react";
import { Statement } from "@/components/statement";
import { ButtonLink } from "@/components/ui";
import { identity } from "@/data/portfolio";

/**
 * ─────────────────────────────────────────────────────────────
 * FINAL CTA — the closing statement.
 * ─────────────────────────────────────────────────────────────
 *
 * Dramatic through scale and space rather than through decoration: one very
 * large statement, one primary action, and the channels underneath as plain
 * rules. No panel, no gradient, no glass — this is the last thing on the page
 * and it should feel like the end of a document, not another card.
 *
 * The availability line is read from `identity`, so a change of status is a
 * one-line data edit rather than a hunt through JSX.
 */
export function FinalCta() {
  const channels = [
    identity.email ? { label: "Email", value: identity.email, href: `mailto:${identity.email}` } : null,
    { label: "LinkedIn", value: "pratham-gosai", href: identity.linkedin },
    { label: "GitHub", value: "prathamgosai", href: identity.github },
  ].filter(Boolean) as { label: string; value: string; href: string }[];

  return (
    <section
      id="contact"
      aria-labelledby="cta-title"
      className="mx-auto max-w-5xl scroll-mt-28 px-5 pb-24 pt-20 sm:pb-32 sm:pt-24"
    >
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="status-pulse-emerald shrink-0" />
        <p className="t-mono-badge text-fg">Available · {identity.openTo}</p>
      </div>

      <Statement
        as="h2"
        id="cta-title"
        className="mt-8 text-fg"
        lines={["Got something", "worth building?"]}
      />

      <p className="t-body measure mt-8 text-muted">
        I reply fastest on email and LinkedIn. Tell me about the role or the system — what it has to
        do, and what happens when it stops doing it.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        {identity.email ? (
          <ButtonLink href={`mailto:${identity.email}`} external>
            Let&rsquo;s talk
            <ArrowUpRight aria-hidden className="h-4 w-4" />
          </ButtonLink>
        ) : null}
        <ButtonLink href="/contact" variant="secondary">
          Send a message
        </ButtonLink>
        {identity.resumePdf ? (
          <ButtonLink href={identity.resumePdf} variant="secondary" external>
            Download CV
          </ButtonLink>
        ) : null}
      </div>

      <dl className="cta-channels mt-16">
        {channels.map((channel) => (
          <div key={channel.label} className="cta-channel" data-cursor="Open">
            <dt className="label text-[0.6875rem]">{channel.label}</dt>
            <dd className="mt-2">
              <a
                href={channel.href}
                target={channel.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={channel.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="cta-channel__link t-small font-medium text-fg"
              >
                {channel.value}
                <ArrowUpRight aria-hidden className="ml-1.5 inline h-3.5 w-3.5 text-muted" />
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
