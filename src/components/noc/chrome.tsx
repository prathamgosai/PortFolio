"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/noc/glass";
import { identity } from "@/data/portfolio";

const NAV = [
  { href: "#layer1", label: "./infrastructure" },
  { href: "#layer2", label: "./workforceiq" },
  { href: "#layer3", label: "./cloud-ai" },
  { href: "#layer4", label: "./certs" },
  { href: "#layer5", label: "./logs" },
  { href: "#contact", label: "./contact" },
];

/**
 * Boot overlay. Sits above everything for ~1.4s, then fades.
 *
 * It renders unconditionally on the server so there is no flash of the site
 * before it mounts; it is removed from the tree (not just hidden) once gone,
 * so its fixed layer can't intercept pointer events afterwards.
 */
export function BootScreen() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"boot" | "fading" | "done">("boot");

  useEffect(() => {
    const a = setTimeout(() => setPhase("fading"), 1250);
    const b = setTimeout(() => setPhase("done"), 1850);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  // Reduced motion skips the sequence entirely — a full-screen overlay that
  // animates away is exactly the kind of thing that setting exists to prevent.
  if (reduced || phase === "done") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#020203] transition-opacity duration-500 ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="mono w-[min(90vw,26rem)] text-[13px] leading-relaxed text-[#00ff88]">
        <p>INITIALIZING SYSTEM...</p>
        <p className="text-[#64748b]">Loading modules...</p>
        <div className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-white/10">
          <div className="boot-bar h-full rounded-full bg-[#00f0ff] shadow-[0_0_14px_#00f0ff]" />
        </div>
        <p className="mt-3 text-[#e2e8f0]">
          prathamgosai.in v2.0 — <span className="text-[#00ff88]">READY</span>
        </p>
      </div>
      <style>{`
        .boot-bar { width: 0; animation: bootfill 1.2s cubic-bezier(.3,.9,.3,1) forwards; }
        @keyframes bootfill { to { width: 100%; } }
      `}</style>
    </div>
  );
}

/** Sticky glass navbar with a terminal-prompt wordmark. */
export function NocNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav className="glass glass-cyan mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="mono cursor-blink text-[13px] font-medium text-[#00f0ff]">
          pratham@gosai:~$
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="mono text-[12px] text-[#64748b] transition-colors hover:text-[#00f0ff] hover:[text-shadow:0_0_14px_rgba(0,240,255,.7)]"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mono rounded-full px-4 py-1.5 text-[12px] text-[#ff006e] shadow-[inset_0_0_0_1px_rgba(255,0,110,.4),0_0_22px_-6px_rgba(255,0,110,.9)] transition hover:bg-[#ff006e]/10"
          >
            [ HIRE ME ]
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="mono min-h-11 px-2 text-[12px] text-[#00f0ff] lg:hidden"
        >
          {open ? "[ X ]" : "[ MENU ]"}
        </button>
      </nav>

      {open && (
        <div className="glass glass-cyan mx-auto mt-2 max-w-6xl p-4 lg:hidden">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="mono flex min-h-11 items-center text-[13px] text-[#e2e8f0]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

export function NocFooter() {
  return (
    <footer className="relative mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6">
      <div className="glass glass-cyan flex flex-col items-center gap-4 px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="mono text-[12px] text-[#64748b]">© 2026 {identity.name}</p>
        <p className="mono text-[12px] text-[#64748b]">
          <span className="pulse-dot mr-2 inline-block h-2 w-2 rounded-full bg-[#00ff88] align-middle" />
          uptime nominal · {identity.locationShort}
        </p>
        <div className="mono flex gap-4 text-[12px]">
          <a href={identity.github} target="_blank" rel="noreferrer" className="text-[#64748b] hover:text-[#00f0ff]">
            github
          </a>
          <a href={identity.linkedin} target="_blank" rel="noreferrer" className="text-[#64748b] hover:text-[#00f0ff]">
            linkedin
          </a>
          <Link href="/" className="text-[#64748b] hover:text-[#00f0ff]">
            classic site
          </Link>
        </div>
      </div>
    </footer>
  );
}
