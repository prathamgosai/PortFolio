import Link from "next/link";
import { stats } from "@/data/portfolio";
import { AnimatedStat } from "@/components/animated-stat";

export function Section({
  label,
  title,
  intro,
  children,
  className = "",
  titleAs = "h2",
}: {
  label?: string;
  title?: string;
  intro?: string;
  children?: React.ReactNode;
  className?: string;
  /** Use "h1" for a page's top section so every page has exactly one h1. */
  titleAs?: "h1" | "h2";
}) {
  const Title = titleAs;
  return (
    <section className={`mx-auto max-w-5xl px-5 py-20 sm:py-24 ${className}`}>
      {label ? <p className="label">{label}</p> : null}
      {title ? <Title className="t-h2 mt-4 text-fg">{title}</Title> : null}
      {intro ? <p className="t-body measure mt-5 text-muted">{intro}</p> : null}
      {children}
    </section>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-rule px-2.5 py-1 font-mono text-[0.8125rem] text-muted">{children}</span>
  );
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

/** The four approved stats (§3). Amber rule above each — the LED motif. */
export function StatBar() {
  return (
    <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-px border-y border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <li key={stat.label} className="bg-bg px-6 py-8">
          <span aria-hidden className="block h-0.5 w-6 bg-accent" />
          <AnimatedStat value={stat.value} />
          <p className="t-small mt-2 leading-snug text-muted">{stat.label}</p>
        </li>
      ))}
    </ul>
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
