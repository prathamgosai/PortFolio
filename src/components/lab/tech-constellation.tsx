"use client";

import { useMemo, useState } from "react";
import { skills, workforceiq } from "@/data/portfolio";

/**
 * ═════════════════════════════════════════════════════════════════════════
 * TECHNOLOGY CONSTELLATION
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Every technology from `skills`, in one field, sized by how load-bearing it
 * is rather than listed in five equal boxes. Hovering one dims the rest and
 * names its group; the entries that WorkforceIQ actually runs on are marked,
 * so the field doubles as an answer to "which of these have you shipped with?".
 *
 * ── Not a physics simulation ──
 * The obvious version of this is floating nodes on springs. It was not built,
 * because the useful information here is grouping and provenance, and drifting
 * text is measurably harder to read and to click than text that stays put.
 * The interaction that helps is the one that answers a question about a
 * technology, so that is the only one implemented.
 *
 * Sizing is derived, not authored: a technology that WorkforceIQ ships is
 * displayed larger. That means the emphasis cannot drift away from the facts —
 * change the stack in portfolio.ts and this reweights itself.
 */
export function TechConstellation() {
  const [active, setActive] = useState<string | null>(null);

  const items = useMemo(() => {
    const shipped = new Set(workforceiq.stack.map((s) => s.toLowerCase()));
    return skills.flatMap((group) =>
      group.items.map((item) => ({
        name: item,
        group: group.group,
        shipped: shipped.has(item.toLowerCase()),
      })),
    );
  }, []);

  const activeItem = active ? items.find((i) => i.name === active) : null;

  return (
    <div className="constellation">
      {/* Mouse-only guards, same reason as system-graph: on touch the
          enter/leave pair fires within the tap and defeats click's toggle. */}
      <ul className="constellation__field" onPointerLeave={(e) => { if (e.pointerType === "mouse") setActive(null); }}>
        {items.map((item) => (
          <li key={`${item.group}-${item.name}`}>
            <button
              type="button"
              className={`constellation__item${item.shipped ? " is-shipped" : ""}${
                active === item.name ? " is-active" : ""
              }`}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setActive(item.name); }}
              onFocus={(e) => { if (e.target.matches(":focus-visible")) setActive(item.name); }}
              onBlur={() => setActive((cur) => (cur === item.name ? null : cur))}
              onClick={() => setActive((cur) => (cur === item.name ? null : item.name))}
              aria-pressed={active === item.name}
              data-cursor="Inspect"
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Fixed-height readout so hovering the field never reflows the page. */}
      <div className="constellation__readout" aria-live="polite">
        {activeItem ? (
          <>
            <p className="constellation__readout-name">{activeItem.name}</p>
            <p className="constellation__readout-meta">
              {activeItem.group}
              {activeItem.shipped ? (
                <>
                  <span aria-hidden> · </span>
                  <span className="constellation__shipped">Shipped in WorkforceIQ</span>
                </>
              ) : null}
            </p>
          </>
        ) : (
          <p className="constellation__readout-hint">
            {items.length} technologies · highlighted entries ship in WorkforceIQ
          </p>
        )}
      </div>
    </div>
  );
}
