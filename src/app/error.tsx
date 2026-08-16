"use client";

import { useEffect } from "react";
import { Section, ButtonLink } from "@/components/ui";
import { identity } from "@/data/portfolio";

/**
 * Route-level error boundary. Keeps the site chrome (navbar, footer) around it,
 * so a failure on one page doesn't look like the whole site fell over.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // No analytics or error reporting is wired up yet, so the console is the
    // only place this can go. Replace with a real sink when one exists.
    console.error("Route error:", error);
  }, [error]);

  return (
    <Section
      label="Error"
      title="Something broke on this page."
      titleAs="h1"
      intro="This one is on me, not you. Trying again usually clears it — if it doesn't, I'd genuinely like to know."
    >
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={reset}
          className="btn-primary magnetic inline-flex cursor-pointer items-center rounded-2xl bg-fg px-6 py-3.5 text-[1.0625rem] font-semibold tracking-[0.01em] text-bg hover:opacity-95"
        >
          Try again
        </button>
        <ButtonLink href="/" variant="secondary">
          Back to the home page
        </ButtonLink>
      </div>

      {error.digest ? (
        <p className="t-small mt-8 text-muted">
          If you report this, quoting <code className="font-mono text-accent-ink">{error.digest}</code> tells me
          exactly which failure it was
          {identity.email ? (
            <>
              {" — "}
              <a href={`mailto:${identity.email}`} className="text-link hover:underline">
                {identity.email}
              </a>
            </>
          ) : null}
          .
        </p>
      ) : null}
    </Section>
  );
}
