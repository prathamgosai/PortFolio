"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowUpRight,
  Copy,
  FileText,
  Home,
  Layers,
  Mail,
  Moon,
  PenLine,
  Sun,
  User,
  Briefcase,
} from "lucide-react";
import { identity } from "@/data/portfolio";

export const OPEN_COMMAND_PALETTE = "open-command-palette";

type Group = "Navigate" | "Actions" | "Links";

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: Group;
  keywords?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
};

const GROUP_ORDER: Group[] = ["Navigate", "Actions", "Links"];

export function CommandPalette() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  /** The element that had focus before we opened, so we can hand it back. */
  const returnFocusTo = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => {
      close();
      router.push(href);
    };
    const ext = (href: string) => () => {
      close();
      window.open(href, "_blank", "noopener,noreferrer");
    };
    const list: Item[] = [
      { id: "home", label: "Home", group: "Navigate", icon: Home, run: go("/") },
      { id: "about", label: "About", group: "Navigate", icon: User, run: go("/about") },
      { id: "projects", label: "Projects", group: "Navigate", icon: Layers, run: go("/projects") },
      { id: "experience", label: "Experience", group: "Navigate", icon: Briefcase, run: go("/experience") },
      { id: "blog", label: "Blog", group: "Navigate", icon: PenLine, run: go("/blog") },
      { id: "contact", label: "Contact", group: "Navigate", icon: Mail, run: go("/contact") },
      {
        id: "theme",
        label: resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        group: "Actions",
        keywords: "dark light mode appearance",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        run: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
      },
    ];
    if (identity.email) {
      list.push({
        id: "copy-email",
        label: "Copy email address",
        hint: identity.email,
        group: "Actions",
        keywords: "mail contact",
        icon: Copy,
        run: () => {
          navigator.clipboard?.writeText(identity.email as string);
          close();
        },
      });
    }
    if (identity.resumePdf) {
      list.push({
        id: "resume",
        label: "Download résumé (PDF)",
        group: "Actions",
        keywords: "cv resume",
        icon: FileText,
        run: ext(identity.resumePdf),
      });
    }
    list.push(
      { id: "github", label: "GitHub", hint: "@prathamgosai", group: "Links", icon: ArrowUpRight, run: ext(identity.github) },
      { id: "linkedin", label: "LinkedIn", group: "Links", icon: ArrowUpRight, run: ext(identity.linkedin) },
      { id: "instagram", label: "Instagram", group: "Links", icon: ArrowUpRight, run: ext(identity.instagram) },
    );
    return list;
  }, [router, resolvedTheme, setTheme, close]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.keywords ?? ""} ${i.group}`.toLowerCase().includes(q));
  }, [items, query]);

  /** Flat index → element id, so aria-activedescendant can point at the row. */
  const optionId = (i: number) => `cmdk-option-${i}`;

  // Global open shortcut (⌘K / Ctrl+K) + custom event from the navbar button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_COMMAND_PALETTE, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_COMMAND_PALETTE, onOpen);
    };
  }, []);

  // Focus the input on open, lock body scroll, and hand focus back on close.
  useEffect(() => {
    if (!open) {
      returnFocusTo.current?.focus?.();
      returnFocusTo.current = null;
      return;
    }
    returnFocusTo.current = document.activeElement as HTMLElement | null;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a + 1) % filtered.length : 0));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (filtered.length ? (a - 1 + filtered.length) % filtered.length : 0));
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(filtered.length - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
      return;
    }
    // Focus trap: the input is the only tab stop, so Tab must not escape into
    // the page behind the dialog.
    if (e.key === "Tab") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  if (!open) return null;

  // Flat index is what the keyboard walks; the visual grouping is layered on top.
  let flatIndex = -1;

  return (
    <div className="cmdk-overlay fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh]">
      <div aria-hidden className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="cmdk-panel glass relative w-full max-w-xl overflow-hidden rounded-3xl shadow-[var(--shadow-lg)]"
      >
        <div className="relative z-[1] flex items-center gap-3 border-b border-hairline px-5 py-4">
          <span aria-hidden className="label text-accent-ink">
            ⌘K
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search or jump to…"
            aria-label="Search commands"
            role="combobox"
            aria-expanded
            aria-controls="cmdk-listbox"
            aria-autocomplete="list"
            aria-activedescendant={filtered.length ? optionId(active) : undefined}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-base text-fg placeholder:text-muted focus:outline-none"
          />
        </div>

        <div ref={listRef} className="relative z-[1] max-h-[52vh] overflow-y-auto p-2">
          <div id="cmdk-listbox" role="listbox" aria-label="Commands">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">No matches.</p>
            ) : (
              GROUP_ORDER.map((group) => {
                const rows = filtered.filter((i) => i.group === group);
                if (rows.length === 0) return null;
                return (
                  <div key={group} role="group" aria-label={group}>
                    <p aria-hidden className="label px-3 pb-1 pt-3 text-muted">
                      {group}
                    </p>
                    {rows.map((item) => {
                      flatIndex += 1;
                      const i = flatIndex;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          id={optionId(i)}
                          role="option"
                          aria-selected={i === active}
                          onMouseMove={() => setActive(i)}
                          onClick={() => item.run()}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                            i === active ? "bg-accent/15 text-fg" : "text-muted"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0 text-accent-ink" />
                          <span className="flex-1 text-[0.95rem] text-fg">{item.label}</span>
                          {item.hint ? <span className="font-mono text-xs text-muted">{item.hint}</span> : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
