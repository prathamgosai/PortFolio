import type { ElementType, ReactNode } from "react";
import { Reveal } from "@/components/reveal";

/**
 * A large multi-line statement with a per-line mask reveal.
 *
 * Each line gets its own clipping box and slides up into it. This is the one
 * text effect on the site, and it earns its place because it reads as
 * typesetting rather than as animation — the words arrive the way a printing
 * press would deliver them, not the way a slideshow would.
 *
 * The stagger is an inline `transitionDelay` per line, so the whole thing is one
 * <Reveal> and one IntersectionObserver rather than one per line. All the actual
 * animation lives in `.statement-line` in globals.css, behind the same
 * `scripting: enabled` gate as `.reveal` — with JS off the lines are simply
 * visible instead of parked below their masks forever.
 *
 * Lines are passed as an array rather than as a string with newlines because
 * where a statement breaks is a typographic decision, not a rendering accident.
 */
export function Statement({
  lines,
  as: Tag = "p",
  className = "",
  id,
}: {
  lines: ReactNode[];
  /** React 19 removed the global JSX namespace — narrow ElementType instead,
   *  the same way <Reveal> does. */
  as?: Extract<ElementType, "h2" | "h3" | "p">;
  className?: string;
  id?: string;
}) {
  return (
    <Reveal>
      <Tag id={id} className={`statement statement-lines ${className}`}>
        {lines.map((line, i) => (
          <span key={i} className="statement-line">
            <span style={i ? { transitionDelay: `${i * 0.08}s` } : undefined}>{line}</span>
          </span>
        ))}
      </Tag>
    </Reveal>
  );
}
