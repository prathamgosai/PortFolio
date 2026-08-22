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
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

/**
 * Anchor entries point at `/#id`, not `#id`. That matters on every page that is
 * not the homepage: a bare hash would look for the section on the current page
 * and silently do nothing, whereas `/#journey` navigates home and then anchors.
 *
 * `desktop: false` keeps an item out of the floating pill while leaving it in
 * the fullscreen mobile menu. The pill has room for five before it starts
 * crowding the wordmark; the mobile menu has a whole screen, so it carries the
 * complete set rather than a truncated one.
 */
const NAV = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Work" },
  { href: "/#journey", label: "Journey" },
  { href: "/#capabilities", label: "Capabilities", desktop: false },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact", desktop: false },
];

const DESKTOP_NAV = NAV.filter((item) => item.desktop !== false);

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Switch between light and dark theme"
      className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-wash hover:text-fg md:h-9 md:w-9"
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

  /**
   * Anchors are excluded outright. `/#journey` is a location on a page, not a
   * page, so marking it aria-current="page" would tell a screen reader the user
   * is on a different page than they are — and the visual pill would light up a
   * second item alongside the real current route.
   */
  const isActive = (href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

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
    /**
     * The menu is fullscreen now, so the page behind it must not scroll. This
     * also stops Lenis — `overflow: hidden` on <body> does not, because Lenis
     * scrolls programmatically off its own wheel listener.
     */
    lockScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown, true);
      unlockScroll();
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
      {/**
       * `relative z-40` is load-bearing. <header> is z-50 and therefore its own
       * stacking context; inside it, the fullscreen menu below carries z-30.
       * Without an explicit z here the pill would be z-auto and the menu would
       * paint over it — taking the close button with it, leaving the menu
       * dismissable only by Escape. On a phone, that means not at all.
       */}
      <nav
        aria-label="Main"
        className="glass glass-sky pointer-events-auto relative z-40 flex w-full max-w-3xl items-center gap-1 rounded-full py-1.5 pl-2 pr-1.5 shadow-[var(--shadow-md)] lg:max-w-5xl"
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
          {DESKTOP_NAV.map((item) => {
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
            className="grid h-11 w-11 place-items-center rounded-full text-muted transition-colors hover:bg-wash hover:text-fg md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/**
       * FULLSCREEN MOBILE MENU.
       *
       * Was a small dropdown panel hanging off the pill. Fullscreen is not a
       * style change — a dropdown over live content invites a tap on whatever
       * is behind it, and on a page this long it also left the menu floating
       * over a moving background. Covering the viewport makes the menu the only
       * thing on screen, which is what it should be.
       *
       * `hidden` is what keeps it out of the tab order and the accessibility
       * tree while closed; the CSS transition alone would leave every link
       * focusable behind an invisible overlay.
       *
       * The stagger is an inline `transitionDelay` per item rather than a
       * keyframe animation, so closing reverses cleanly instead of replaying
       * the entrance backwards.
       */}
      <nav
        ref={menuRef}
        id="mobile-nav"
        aria-label="Mobile"
        data-open={open}
        hidden={!open}
        className="mobile-sheet pointer-events-auto fixed inset-0 z-30 flex flex-col overflow-y-auto overscroll-contain bg-bg px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 md:hidden"
      >
        <ul className="flex flex-col">
          {NAV.map((item, i) => (
            <li
              key={item.href}
              className="mobile-sheet__item border-b border-hairline"
              style={{ transitionDelay: `${0.04 + i * 0.035}s` }}
            >
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-baseline gap-4 py-4 font-display text-3xl font-bold tracking-tight transition-colors ${
                  isActive(item.href) ? "text-fg" : "text-muted"
                }`}
              >
                <span aria-hidden className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div
          className="mobile-sheet__item mt-auto pt-8"
          style={{ transitionDelay: `${0.04 + NAV.length * 0.035}s` }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openPalette();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl border border-hairline py-3 text-sm text-muted"
            >
              <Command className="h-3.5 w-3.5" /> Command menu
            </button>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-2xl bg-fg py-3 text-center text-sm font-semibold text-bg"
            >
              Hire me
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {[
              { href: identity.github, label: "GitHub" },
              { href: identity.linkedin, label: "LinkedIn" },
              { href: identity.instagram, label: "Instagram" },
            ].map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="label text-[0.6875rem] hover:text-fg"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="t-caption mt-4 text-muted">{identity.availability}</p>
        </div>
      </nav>

    </header>
  );
}
