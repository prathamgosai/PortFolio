"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: "Navigate" | "Actions" | "Links";
  keywords?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
};

export function CommandPalette() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  // Focus the input on open; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[active]?.run();
    }
  };

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            aria-label="Close command palette"
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onKeyDown={onKeyDown}
            className="glass relative w-full max-w-xl overflow-hidden rounded-3xl shadow-[var(--shadow-lg)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative z-[1] flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <span className="label text-accent-ink">⌘K</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search or jump to…"
                aria-label="Search commands"
                className="w-full bg-transparent text-base text-fg placeholder:text-muted focus:outline-none"
              />
            </div>
            <div ref={listRef} role="listbox" aria-label="Commands" className="relative z-[1] max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">No matches.</p>
              ) : (
                filtered.map((item, i) => {
                  const showGroup = item.group !== lastGroup;
                  lastGroup = item.group;
                  const Icon = item.icon;
                  return (
                    <div key={item.id}>
                      {showGroup ? (
                        <p className="label px-3 pb-1 pt-3 text-muted">{item.group}</p>
                      ) : null}
                      <button
                        data-idx={i}
                        role="option"
                        aria-selected={i === active}
                        onMouseMove={() => setActive(i)}
                        onClick={() => item.run()}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                          i === active ? "bg-accent/15 text-fg" : "text-muted hover:text-fg"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-accent-ink" />
                        <span className="flex-1 text-[0.95rem] text-fg">{item.label}</span>
                        {item.hint ? <span className="font-mono text-xs text-muted">{item.hint}</span> : null}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
