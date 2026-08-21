"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import type { FieldMode } from "@/components/lab/digital-field";
import { setSceneMode } from "@/components/three/scene-mode";
import { labSections } from "@/data/lab";
import { identity } from "@/data/portfolio";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

/**
 * ═════════════════════════════════════════════════════════════════════════
 * LAB SHELL — the environment, the HUD, and the menu.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * The only client component wrapping /lab. The page content itself stays a
 * server component: this owns the canvas, the section observer and the menu,
 * and renders `children` untouched. That split matters — it means every word
 * on /lab is server-rendered HTML, and this file adds behaviour to it rather
 * than replacing it with a canvas.
 *
 * ── Why the corners instead of a navigation bar ──
 * A conventional bar pins a heavy horizontal object across the top of an
 * environment that is supposed to feel continuous. Four small anchored markers
 * read as instrumentation on a view rather than chrome over a document, and
 * they leave the whole centre of the screen to the work. The full route list
 * is one keystroke away in the menu, and the site's own command palette still
 * works everywhere.
 */
export function LabShell({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<FieldMode>("drift");
  const [current, setCurrent] = useState(labSections[0]!.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /**
   * Section observer. Sets both the field mode and the HUD readout from one
   * observer over the section elements the server rendered.
   *
   * The band is inset well into the viewport so the state changes when a
   * section is genuinely the thing being read, not the instant its top edge
   * clips the bottom of the screen. As in the journey timeline, entries are
   * only ever SET on intersect and never cleared, so a gap between sections
   * holds the last state rather than flickering back to a default.
   */
  useEffect(() => {
    const targets = labSections
      .map((section) => {
        const el = document.getElementById(section.id);
        return el ? { el, section } : null;
      })
      .filter(Boolean) as { el: HTMLElement; section: (typeof labSections)[number] }[];

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const match = targets.find((t) => t.el === entry.target);
          if (!match) continue;
          setMode(match.section.mode);
          setCurrent(match.section.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    for (const { el } of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Menu: escape to close, scroll lock, focus return ──────────────── */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setMenuOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    lockScroll();
    return () => {
      document.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [menuOpen]);

  /**
   * Publish the section mode to the scene. Reset to "drift" on unmount —
   * without that, navigating away from /lab mid-section would leave every other
   * route's background stuck in whatever shape the last section asked for.
   */
  useEffect(() => {
    setSceneMode(mode);
  }, [mode]);

  useEffect(() => {
    return () => setSceneMode("drift");
  }, []);

  const index = Math.max(
    0,
    labSections.findIndex((s) => s.id === current),
  );

  return (
    <div className="lab-root">
      {/**
       * The field used to be rendered here. It now lives once in the root
       * layout as <ImmersiveScene/>, so it persists across navigation instead
       * of being torn down and rebuilt whenever someone leaves /lab and comes
       * back. This shell publishes the section mode to it and owns nothing else
       * about the environment.
       */}
      {children}

      {/* ── HUD ──────────────────────────────────────────────────────── */}
      <div className="lab-hud" aria-hidden={menuOpen}>
        <Link href="/" className="lab-hud__mark" data-cursor="Exit">
          <span className="lab-hud__mark-pg">PG.</span>
          <span className="lab-hud__mark-back">Back to site</span>
        </Link>

        <div className="lab-hud__right">
          <ThemeSwitch />
          <button
            ref={toggleRef}
            type="button"
            className="lab-hud__menu"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="lab-menu"
            data-cursor="Open"
          >
            Menu
          </button>
        </div>

        {/* Progress readout. Decorative — the same information is the page. */}
        <p className="lab-hud__scroll">
          <span className="lab-hud__index">
            {String(index + 1).padStart(2, "0")}/{String(labSections.length).padStart(2, "0")}
          </span>
          <span className="lab-hud__section">{labSections[index]?.label}</span>
        </p>

        <p className="lab-hud__status">
          <span className="status-pulse-emerald" />
          Online · {identity.locationShort}
        </p>
      </div>

      {/* ── Fullscreen menu ──────────────────────────────────────────── */}
      <nav
        id="lab-menu"
        className="lab-menu"
        aria-label="Sections"
        data-open={menuOpen}
        hidden={!menuOpen}
      >
        <button
          type="button"
          className="lab-menu__close"
          onClick={() => {
            setMenuOpen(false);
            toggleRef.current?.focus();
          }}
          data-cursor="Close"
        >
          Close
          <span aria-hidden className="lab-menu__esc">esc</span>
        </button>

        <ul className="lab-menu__list">
          {labSections.map((section, i) => (
            <li
              key={section.id}
              className="lab-menu__item"
              style={{ transitionDelay: `${0.05 + i * 0.03}s` }}
            >
              <a
                href={`#${section.id}`}
                onClick={() => setMenuOpen(false)}
                aria-current={section.id === current ? "location" : undefined}
                className="lab-menu__link"
                data-cursor="Go"
              >
                <span aria-hidden className="lab-menu__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <div
          className="lab-menu__foot lab-menu__item"
          style={{ transitionDelay: `${0.05 + labSections.length * 0.03}s` }}
        >
          <Link href="/" className="lab-menu__out" onClick={() => setMenuOpen(false)}>
            Return to the main site
          </Link>
          <div className="lab-menu__socials">
            {[
              { href: identity.github, label: "GitHub" },
              { href: identity.linkedin, label: "LinkedIn" },
              identity.email ? { href: `mailto:${identity.email}`, label: "Email" } : null,
            ]
              .filter(Boolean)
              .map((social) => {
                const s = social as { href: string; label: string };
                return (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                    {s.label}
                  </a>
                );
              })}
          </div>
        </div>
      </nav>
    </div>
  );
}

/**
 * The lab supports both themes rather than being dark-only.
 *
 * That is a harder constraint than it sounds — a particle field is an additive
 * medium, so the naive light version is grey soup. The field inverts its whole
 * material instead (see `readPalette` in digital-field.tsx). This control is
 * here because the site's own navbar is hidden on this route, and a visitor who
 * chose light everywhere else should not be forced out of it to see this page.
 */
function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="lab-hud__theme"
      onClick={() => setTheme(dark ? "light" : "dark")}
      /**
       * A static label on purpose. The usual `mounted` flag exists to avoid a
       * hydration mismatch on a theme-dependent string — but the mismatch only
       * exists because the string names the DESTINATION. "Switch theme" is true
       * before and after hydration in both themes, so the flag, its state and
       * its effect all disappear. The icon is swapped by CSS off the `.dark`
       * class, which never mismatches because the server never rendered it.
       */
      aria-label="Switch theme"
      data-cursor="Switch"
    >
      {/* Both icons render; CSS shows one. Avoids a hydration mismatch without
          blocking the button on mount. */}
      <Sun aria-hidden className="lab-hud__icon lab-hud__icon--sun" />
      <Moon aria-hidden className="lab-hud__icon lab-hud__icon--moon" />
    </button>
  );
}
