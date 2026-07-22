"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, X } from "lucide-react";
import { LanguagePicker } from "@/components/language-picker";

const NAV = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // Both icons render; CSS picks one off the .dark class. This avoids a
  // mounted flag (and the hydration mismatch it exists to paper over)
  // entirely — the server can't know the theme, but it doesn't need to.
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Switch between light and dark theme"
      className="rounded border border-rule p-2 text-muted transition hover:text-fg"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="border-b border-rule/60">
        <p className="mx-auto max-w-5xl px-5 py-1 text-center text-[11px] text-muted">
          Built by Pratham Gosai — also visit{" "}
          <a
            href="https://wifiplus.prathamgosai.in/"
            target="_blank"
            rel="noreferrer"
            className="underline transition hover:text-fg"
          >
            wifiplus.prathamgosai.in
          </a>
        </p>
      </div>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-fg">
          Pratham Dharmeshbharti Gosai
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`text-[1.0625rem] font-semibold tracking-[0.01em] transition ${
                isActive(item.href) ? "text-fg" : "text-muted hover:text-fg"
              }`}
            >
              {item.label}
              {isActive(item.href) ? (
                <span aria-hidden className="mt-1 block h-px bg-accent" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguagePicker />
          <ThemeToggle />
          <Link
            href="/contact"
            className="hidden rounded-xl bg-fg px-5 py-2.5 text-[1.0625rem] font-semibold text-bg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md sm:inline-block"
          >
            Hire me
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="rounded border border-rule p-2 text-muted transition hover:text-fg md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-rule bg-bg md:hidden">
          <ul className="mx-auto max-w-5xl px-5 py-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block border-b border-rule py-3.5 text-[1.0625rem] font-semibold last:border-0 ${
                    isActive(item.href) ? "text-accent-ink" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
