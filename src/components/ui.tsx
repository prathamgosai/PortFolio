import Link from "next/link";
import { stats } from "@/data/portfolio";
import { AnimatedStat } from "@/components/animated-stat";

export function Section({
  label,
  title,
  intro,
  children,
  className = "",
}: {
  label?: string;
  title?: string;
  intro?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-5xl px-5 py-20 sm:py-24 ${className}`}>
      {label ? <p className="label">{label}</p> : null}
      {title ? <h2 className="t-h2 mt-4 text-fg">{title}</h2> : null}
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
    <div className="glass glass-hover rounded-2xl p-8 sm:p-10">
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
  const base =
    "inline-flex items-center gap-1.5 rounded-xl px-6 py-3.5 text-[1.0625rem] font-semibold tracking-[0.01em] transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 focus-visible:-translate-y-0.5";
  const cls =
    variant === "primary"
      ? `${base} bg-fg text-bg shadow-sm hover:opacity-90 hover:shadow-lg`
      : `${base} border border-rule text-fg hover:border-accent hover:bg-surface`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
