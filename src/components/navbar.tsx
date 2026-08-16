"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Command, Menu, Moon, Sun, X } from "lucide-react";
import { OPEN_COMMAND_PALETTE } from "@/components/command-palette";
import { LanguagePicker } from "@/components/language-picker";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { identity } from "@/data/portfolio";

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
      className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-wash hover:text-fg"
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

  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Hide on scroll down, reveal on scroll up — but never hide near the top, and
  // never while the mobile menu is open. rAF-throttled, passive, one listener.
  //
  // `open` is a real dependency rather than a ref read inside the handler:
  // re-subscribing a single passive listener when the menu toggles costs
  // nothing, and reading a ref that was written during render is not safe under
  // concurrent rendering.
  useEffect(() => {
    // Under reduced motion we simply never attach the listener. No need to
    // reset `hidden` — the reduced-motion CSS neutralises the transform, so a
    // stale `true` cannot strand the header off-screen.
    if (reduce || open) return;

    let frame = 0;
    let prev = window.scrollY;

    const read = () => {
      frame = 0;
      const y = window.scrollY;
      setHidden(y > 120 && y > prev);
      prev = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce, open]);

  // NOTE: the menu is closed on navigation by each link's own onClick, not by
  // an effect watching `pathname` — same result, one less render cascade.

  // Escape to close, click/tap outside to close, and return focus to the button
  // that opened it — none of which the menu did before.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    // Capture phase, so a link inside the menu still gets its own click first.
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [open]);

  /**
   * One floating bar, not two.
   *
   * A second pill used to sit above this one advertising wifiplus. Two stacked
   * floating bars over a 92vh hero meant the first ~7rem of every page was
   * chrome, and the promo — the least important link on the site — was
   * physically the topmost element on it. That link now lives in the footer,
   * which is where a "see my other site" cross-link belongs.
   */
  return (
    <header
      data-hidden={hidden && !reduce}
      className="site-header pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center px-4 pt-3"
    >
      <nav
        aria-label="Main"
        className="glass pointer-events-auto flex w-full max-w-3xl items-center gap-1 rounded-full py-1.5 pl-2 pr-1.5 shadow-[var(--shadow-md)] lg:max-w-5xl"
      >
        {/**
         * Full legal name as the wordmark, per an explicit request.
         *
         * The constraint worth respecting is that it must not TRUNCATE — an
         * 11px string cut off mid-word reads as a layout bug. So instead of
         * `truncate` on one line, it wraps to two tight lines on narrow screens
         * and straightens out to a single line from `sm` up.
         *
         * Two lines costs no vertical space: the icon buttons beside it are
         * h-9 (2.25rem), and two lines at 0.72rem/1.05 plus padding come to
         * ~2rem — so the pill height, and the mobile menu offset below that
         * depends on it, are both unchanged.
         */}
        <Link
          href="/"
          aria-label={`${identity.fullName} — home`}
          className="relative z-[1] ml-1 mr-2 min-w-0 rounded-full px-2 py-1 font-display text-[0.72rem] font-bold leading-[1.05] tracking-tight text-fg sm:whitespace-nowrap sm:text-sm sm:leading-normal lg:text-[0.95rem]"
        >
          {identity.fullName}
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
                  <span
                    aria-hidden
                    className="absolute inset-0 -z-[1] rounded-full bg-wash ring-1 ring-hairline"
                    style={{ boxShadow: "0 0 24px -6px var(--glow)" }}
                  />
                ) : null}
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="relative z-[1] ml-auto flex shrink-0 items-center gap-1 md:ml-0">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command palette"
            className="hidden items-center gap-1.5 rounded-full border border-hairline px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-fg lg:flex"
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
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-wash hover:text-fg md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <nav
        ref={menuRef}
        id="mobile-nav"
        aria-label="Mobile"
        data-open={open}
        hidden={!open}
        /* top offset tracks the single bar above it: pt-3 (0.75rem) + the pill's
           own ~3rem height + a 0.5rem gap. It was 6.25rem while the promo bar
           existed; leaving it there would have floated the menu detached. */
        className="mobile-nav glass pointer-events-auto absolute left-4 right-4 top-[4.25rem] z-40 overflow-hidden rounded-3xl p-2 shadow-[var(--shadow-lg)] md:hidden"
      >
        <ul className="relative z-[1]">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`block rounded-2xl px-4 py-3 text-[1.0625rem] font-medium transition-colors ${
                  isActive(item.href) ? "bg-wash text-fg" : "text-muted hover:text-fg"
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
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-hairline py-2.5 text-sm text-muted"
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
      </nav>
    </header>
  );
}
