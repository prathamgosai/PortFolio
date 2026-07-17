import Link from "next/link";
import { identity } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-base font-semibold text-fg">{identity.name}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">{identity.oneLine}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm sm:items-end">
          <div className="flex flex-wrap gap-4">
            <a href={identity.github} target="_blank" rel="noreferrer" className="text-muted transition hover:text-fg">
              GitHub
            </a>
            <a href={identity.linkedin} target="_blank" rel="noreferrer" className="text-muted transition hover:text-fg">
              LinkedIn
            </a>
            <a href={identity.instagram} target="_blank" rel="noreferrer" className="text-muted transition hover:text-fg">
              Instagram
            </a>
            {identity.email ? (
              <a href={`mailto:${identity.email}`} className="text-muted transition hover:text-fg">
                Email
              </a>
            ) : null}
            <Link href="/contact" className="text-muted transition hover:text-fg">
              Contact
            </Link>
          </div>
          <p className="label">© 2026 {identity.name}</p>
        </div>
      </div>
    </footer>
  );
}
