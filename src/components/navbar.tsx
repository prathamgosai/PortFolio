"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { Command, Menu, Moon, Sun, X } from "lucide-react";
import { OPEN_COMMAND_PALETTE } from "@/components/command-palette";
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
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Switch between light and dark theme"
      className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-white/8 hover:text-fg"
    >
      <Moon className="h-4 w-4 dark:hidden" />
      <Sun className="hidden h-4 w-4 dark:block" />
    </button>
  );
}

function openPalette() {
  window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE));
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Hide on scroll down, reveal on scroll up — but never hide near the top.
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (open) return;
    if (y > 120 && y > prev) setHidden(true);
    else setHidden(false);
  });

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-4 pt-3"
      initial={false}
      animate={{ y: hidden && !reduce ? "-160%" : "0%" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <a
        href="https://wifiplus.prathamgosai.in/"
        target="_blank"
        rel="noreferrer"
        className="glass pointer-events-auto rounded-full px-3 py-1 text-[11px] tracking-wide text-muted transition-colors hover:text-fg"
      >
        <span className="relative z-[1]">
          <span className="hidden sm:inline">Built by Pratham Gosai — also visit </span>
          <span className="font-medium text-accent-ink">wifiplus.prathamgosai.in</span>
        </span>
      </a>

      <nav
        aria-label="Main"
        className="glass pointer-events-auto flex w-full max-w-3xl items-center gap-1 rounded-full py-1.5 pl-2 pr-1.5 shadow-[var(--shadow-md)] lg:max-w-5xl"
      >
        <Link
          href="/"
          aria-label="Pratham Dharmeshbharti Gosai — home"
          className="relative z-[1] ml-1 mr-1 shrink-0 whitespace-nowrap rounded-full px-2 py-1 font-display text-[0.7rem] font-bold tracking-tight text-fg sm:text-sm lg:text-[0.95rem]"
        >
          Pratham Dharmeshbharti Gosai
        </Link>

        <div className="relative z-[1] hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors lg:px-3.5 ${
                  active ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {active ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-[1] rounded-full bg-white/8 ring-1 ring-white/10"
                    style={{ boxShadow: "0 0 24px -6px var(--glow)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                ) : null}
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="relative z-[1] ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            className="hidden items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-fg lg:flex"
          >
            <Command className="h-3.5 w-3.5" />
            <span className="font-mono">K</span>
          </button>
          <LanguagePicker />
          <ThemeToggle />
          <Link
            href="/contact"
            className="btn-primary magnetic hidden rounded-full bg-fg px-4 py-2 text-sm font-semibold text-bg hover:opacity-95 sm:inline-block"
          >
            Hire me
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-white/8 hover:text-fg md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            className="glass pointer-events-auto absolute left-4 right-4 top-[6.25rem] z-40 overflow-hidden rounded-3xl p-2 shadow-[var(--shadow-lg)] md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="relative z-[1]">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block rounded-2xl px-4 py-3 text-[1.0625rem] font-medium transition-colors ${
                      isActive(item.href) ? "bg-white/8 text-fg" : "text-muted hover:text-fg"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 flex items-center gap-2 px-2 pb-1 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openPalette();
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-white/10 py-2.5 text-sm text-muted"
                >
                  <Command className="h-3.5 w-3.5" /> Command menu
                </button>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-2xl bg-fg py-2.5 text-center text-sm font-semibold text-bg"
                >
                  Hire me
                </Link>
              </li>
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
