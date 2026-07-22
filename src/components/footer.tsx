import Link from "next/link";
import { identity } from "@/data/portfolio";

export function Footer() {
  return (
    <footer className="glass mt-24 border-x-0 border-b-0">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="t-card-title text-fg">{identity.name}</p>
          <p className="t-small mt-2 max-w-sm text-muted">{identity.oneLine}</p>
        </div>

        <div className="flex flex-col gap-3 text-base sm:items-end">
          <div className="flex flex-wrap gap-5">
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
          <p className="text-xs text-muted">
            Built by Pratham Gosai — also visit{" "}
            <a
              href="https://wifiplus.prathamgosai.in/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent-ink underline decoration-accent/40 underline-offset-2 transition-colors hover:text-fg"
            >
              wifiplus.prathamgosai.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
