"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faqs } from "@/data/portfolio";

/**
 * Visible FAQ accordion. Shares its content with the FAQPage JSON-LD via the
 * single `faqs` source in portfolio.ts, so structured data always matches what
 * users see (a Google requirement). Accessible: each row is a real <button>
 * with aria-expanded/aria-controls; the panel is a labelled region.
 *
 * The open/close animation is the CSS `grid-template-rows: 0fr → 1fr` trick, so
 * height animates to auto with no JS measuring and no library. The panel stays
 * mounted and is hidden with `hidden="until-found"` semantics via `inert`-free
 * markup, which keeps the answers in the DOM for in-page find and for crawlers.
 */
export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="mt-10 flex flex-col gap-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        const panelId = `faq-panel-${i}`;
        const btnId = `faq-btn-${i}`;
        return (
          <li key={f.q} className="faq-card glass overflow-hidden rounded-2xl" data-open={isOpen}>
            <h3 className="relative z-[1]">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
              >
                <span className="t-card-title text-fg">{f.q}</span>
                <span
                  aria-hidden
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border border-hairline text-accent-ink transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isOpen ? "rotate-45 bg-accent/15" : ""
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              data-open={isOpen}
              className="collapse relative z-[1]"
            >
              <div className="collapse-inner">
                <p className="t-small px-5 pb-5 text-muted sm:px-6">{f.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
