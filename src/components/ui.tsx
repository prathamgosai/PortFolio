import Link from "next/link";
import { stats } from "@/data/portfolio";
import { AnimatedStat } from "@/components/animated-stat";

/**
 * Vertical rhythm.
 *
 * Every section on the site used to be `py-20 sm:py-24` — identical spacing from
 * the hero all the way to the footer. Uniform gaps mean the page has no pacing:
 * nothing reads as a pause, nothing reads as a group, and a visitor scrolling
 * gets an unbroken sequence of evenly-spaced blocks with no sense of where one
 * idea ends and the next begins.
 *
 * Three steps is enough to fix that. `tight` pulls a section up against the one
 * before it (a strip that belongs to what it follows), `loose` gives a moment
 * room to breathe (the featured project, the closing CTA).
 */
const SECTION_SPACE = {
  tight: "py-10 sm:py-12",
  default: "py-20 sm:py-24",
  loose: "py-28 sm:py-36",
} as const;

export function Section({
  label,
  labelTone = "muted",
  title,
  intro,
  children,
  className = "",
  titleAs = "h2",
  space = "default",
}: {
  label?: string;
  /** "signal" paints the eyebrow amber. Reserve it for section-defining moments. */
  labelTone?: "muted" | "signal";
  title?: string;
  intro?: string;
  children?: React.ReactNode;
  className?: string;
  /** Use "h1" for a page's top section so every page has exactly one h1. */
  titleAs?: "h1" | "h2";
  space?: keyof typeof SECTION_SPACE;
}) {
  const Title = titleAs;
  return (
    <section className={`mx-auto max-w-5xl px-5 ${SECTION_SPACE[space]} ${className}`}>
      {label ? <p className={`label ${labelTone === "signal" ? "label-signal" : ""}`}>{label}</p> : null}
      {title ? <Title className="t-h2 mt-4 text-fg">{title}</Title> : null}
      {intro ? <p className="t-body measure mt-5 text-muted">{intro}</p> : null}
      {children}
    </section>
  );
}

/**
 * ─────────────────────────────────────────────────────────────
 * THE surface primitive. One card language, used everywhere.
 * ─────────────────────────────────────────────────────────────
 *
 * The site was running two of these side by side. Half the content sat in
 * translucent `rounded-3xl` glass panels that tilt and glow on hover; the other
 * half sat in flat square-cornered `gap-px border-rule bg-rule` hairline grids.
 * Scrolling the homepage alternated between them — glass, flat, glass, glass,
 * flat, glass — which doesn't read as deliberate contrast, it reads as two
 * design passes that never got reconciled.
 *
 * Glass won, because it is the more distinctive of the two and it is what the
 * hero, the CTA and the whole ambient background are already built around. The
 * hairline grid survives in exactly one role: dense reference tables where a
 * dozen rows of short facts genuinely do read better in a tight ruled grid than
 * as a dozen floating panels (the skills matrix, the certification lists). That
 * is a deliberate exception, not a second default — and it now always sits
 * *inside* a Card, so even the exception is framed by the primary language.
 *
 * `tone`:
 *   "default" — the standard panel.
 *   "feature" — heavier framing for the one element that should dominate a page.
 */
export function Card({
  children,
  className = "",
  tone = "default",
  interactive = true,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "feature";
  /** Set false for panels that aren't clickable — no tilt, no lift. */
  interactive?: boolean;
  as?: Extract<React.ElementType, "div" | "li" | "article" | "section">;
}) {
  const radius = tone === "feature" ? "rounded-[1.75rem]" : "rounded-3xl";
  const pad = tone === "feature" ? "p-6 sm:p-9 lg:p-11" : "p-6 sm:p-7";
  const ring = tone === "feature" ? "ring-1 ring-accent/25" : "";
  return (
    <Tag className={`glass ${interactive ? "glass-hover" : ""} ${radius} ${pad} ${ring} ${className}`}>
      {children}
    </Tag>
  );
}

/** Even grid of Cards. The default layout for any "N of the same thing" set. */
export function CardGrid({
  children,
  cols = 3,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
  className?: string;
  /** Use "ul" when the cards are a real list — cards then render as <li>. */
  as?: Extract<React.ElementType, "div" | "ul">;
}) {
  const at = cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return <Tag className={`grid gap-4 ${at} ${className}`}>{children}</Tag>;
}

/**
 * Dense reference grid — the demoted hairline language, now always framed by a
 * Card. Use only for short-fact tables (skills, education, credentials).
 */
export function DenseGrid({
  children,
  cols = 3,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
  /** "ul" when the cells are a real list (cells become <li>); "dl" for a
   *  term/definition table, where each cell holds its own <dt>/<dd> pair. */
  as?: Extract<React.ElementType, "div" | "ul" | "dl">;
}) {
  const at = cols === 1 ? "" : cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <div className="glass overflow-hidden rounded-3xl">
      <Tag className={`grid gap-px bg-hairline ${at} ${className}`}>{children}</Tag>
    </div>
  );
}

/** A cell inside a DenseGrid. Opaque so the 1px seams between cells read. */
export function DenseCell({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: Extract<React.ElementType, "div" | "li">;
}) {
  return <Tag className={`bg-surface p-6 transition-colors hover:bg-wash ${className}`}>{children}</Tag>;
}

/** Colour + border are owned by `.chip` in globals.css — see the cascade note
 *  there before adding `text-*` or `border-*` utilities back onto this span. */
export function Chip({ children }: { children: React.ReactNode }) {
  return <span className="chip rounded-md px-2.5 py-1 font-mono text-[0.8125rem]">{children}</span>;
}

export function ChipRow({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <Chip>{item}</Chip>
        </li>
      ))}
    </ul>
  );
}

/**
 * The four approved stats (§3), as the proof beat directly under the hero.
 *
 * One glass panel divided by hairlines rather than four separate cards: the
 * numbers are a single claim in four parts, and four floating tiles read as four
 * unrelated facts. The amber rule above each is the LED motif, and this is one
 * of the few places it still earns the accent — these are the proof.
 */
export function StatBar() {
  return (
    <section aria-label="By the numbers" className="mx-auto max-w-5xl px-5">
      <div className="stitch-glass blueprint-grid overflow-hidden rounded-3xl p-1 sm:p-2">
        {/* gap-px over a hairline-coloured track draws the dividers; the cells
            are opaque --surface so the 1px seams actually read. */}
        <ul className="grid grid-cols-2 gap-px bg-hairline rounded-2xl overflow-hidden lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <li key={stat.label} className="stitch-hud-card border-none rounded-none bg-surface/90 px-5 py-7 sm:px-6 sm:py-8 transition-all hover:bg-surface">
              <div className="flex items-center justify-between">
                <span aria-hidden className="block h-1 w-6 rounded-full bg-accent" />
                <div className="flex items-center gap-1.5">
                  <span className={idx % 2 === 0 ? "status-pulse-amber" : "status-pulse-cyan"} />
                  <span className="t-mono-badge text-[0.6875rem] text-muted">LIVE</span>
                </div>
              </div>
              <AnimatedStat
                value={stat.value}
                className="mt-3 font-mono text-3xl font-extrabold tracking-tight text-fg tabular-nums sm:text-4xl"
              />
              <p className="mt-1.5 text-sm leading-snug text-muted font-medium">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CTABlock({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass glass-hover rounded-3xl p-8 sm:p-10">
      <h2 className="t-h2 text-fg">{title}</h2>
      <p className="t-body measure mt-5 text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap gap-4">{children}</div>
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  external?: boolean;
}) {
  // Transitions come from the `.magnetic` class (covers transform/shadow/border/
  // opacity) — no Tailwind transition utility here, so the transform tween isn't
  // dropped now that .magnetic sits in @layer components.
  // `.magnetic` also carries the :active press (an independent `scale`, so it
  // composes with the inline transform the magnet JS writes). See globals.css.
  const base =
    "magnetic relative inline-flex items-center rounded-2xl px-6 py-3.5 text-[1.0625rem] font-semibold tracking-[0.01em] cursor-pointer hover:opacity-95 focus-visible:-translate-y-0.5";
  const cls =
    variant === "primary"
      ? `${base} btn-primary bg-fg text-bg`
      : `${base} glass text-fg hover:border-accent`;

  // Wrap in an element (not a bare text node) so `.glass > *` lifts the label
  // above the sheen — otherwise text on the glass (secondary) variant paints under it.
  const inner = <span className="relative z-[1] inline-flex items-center gap-1.5">{children}</span>;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
