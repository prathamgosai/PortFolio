import Link from "next/link";
import { stats } from "@/data/portfolio";

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
    <section className={`mx-auto max-w-5xl px-5 py-14 ${className}`}>
      {label ? <p className="label">{label}</p> : null}
      {title ? (
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h2>
      ) : null}
      {intro ? <p className="mt-3 max-w-2xl text-muted">{intro}</p> : null}
      {children}
    </section>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-rule px-2 py-1 font-mono text-xs text-muted">{children}</span>
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
        <li key={stat.label} className="bg-bg px-5 py-6">
          <span aria-hidden className="block h-0.5 w-6 bg-accent" />
          <p className="mt-3 font-display text-3xl font-bold tracking-tight text-fg">{stat.value}</p>
          <p className="mt-1 text-sm leading-snug text-muted">{stat.label}</p>
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
    <div className="rounded border border-rule bg-surface p-8">
      <h2 className="font-display text-2xl font-bold tracking-tight text-fg">{title}</h2>
      <p className="mt-3 max-w-xl text-muted">{body}</p>
      <div className="mt-6 flex flex-wrap gap-3">{children}</div>
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
  const cls =
    variant === "primary"
      ? "rounded bg-fg px-4 py-2.5 text-sm font-medium text-bg transition hover:opacity-90"
      : "rounded border border-rule px-4 py-2.5 text-sm font-medium text-fg transition hover:border-accent";

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
