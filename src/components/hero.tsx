"use client";

import { Fragment, useRef } from "react";
import { ArrowRight, Download, MousePointer2 } from "lucide-react";
import { ButtonLink } from "@/components/ui";
import { PortraitCard } from "@/components/portrait-card";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { hero, identity, workforceiq } from "@/data/portfolio";

// Words that get the amber signature gradient (the phrase "AI-powered systems").
const GRADIENT_WORDS = new Set(["AI-powered", "systems"]);

/** Entrance stagger, in seconds — mirrors the old framer-motion variants. */
const STEP = 0.055;
const LEAD = 0.08;

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const raf = useRef(0);

  // Cursor-reactive amber glow — writes --mx/--my on the hero root, rAF-throttled.
  const onMove = (e: React.PointerEvent) => {
    if (raf.current) return;
    const el = ref.current;
    if (!el) return;
    const x = e.clientX;
    const y = e.clientY;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((x - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((y - r.top) / r.height) * 100}%`);
    });
  };

  const words = hero.headline.split(" ");
  /** Entrance animations are pure CSS — this just sets each element's turn. */
  const step = (i: number) => ({ animationDelay: `${LEAD + i * STEP}s` });

  return (
    <section
      ref={ref}
      onPointerMove={reduce ? undefined : onMove}
      className="hero-cinematic mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-5 pb-16 pt-28 sm:pt-32"
    >
      <div aria-hidden className="hero-glow" />
      <div aria-hidden className="hero-orb hero-orb--1" />
      <div aria-hidden className="hero-orb hero-orb--2" />

      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        {/* ── Text column ── */}
        <div>
          <div className="hero-in" style={step(0)}>
            <span className="stitch-glass inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs text-fg sm:text-sm shadow-sm">
              <span className="status-pulse-emerald shrink-0" />
              <span className="relative z-[1] font-mono font-medium tracking-wide">SYSTEM ONLINE · {identity.openTo}</span>
            </span>
          </div>

          <h1 className="t-hero mt-6 text-fg">
            {words.map((w, i) => {
              const bare = w.replace(/[^\w-]/g, "");
              return (
                <Fragment key={i}>
                  <span className="hero-in inline-block" style={step(i + 1)}>
                    <span className={GRADIENT_WORDS.has(bare) ? "text-gradient" : undefined}>{w}</span>
                  </span>
                  {i < words.length - 1 ? " " : null}
                </Fragment>
              );
            })}
          </h1>

          <p className="hero-in t-body measure mt-6 font-medium text-fg/85" style={step(words.length + 1)}>
            {hero.sub}
          </p>

          <div className="hero-in mt-8 flex flex-wrap gap-3" style={step(words.length + 2)}>
            <ButtonLink href={`/projects/${workforceiq.slug}`}>
              Read WorkforceIQ Case Study
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            {identity.resumePdf ? (
              <ButtonLink href={identity.resumePdf} variant="secondary" external>
                <Download className="h-4 w-4" />
                Download CV
              </ButtonLink>
            ) : null}
            <ButtonLink href="/contact" variant="secondary">
              Contact Me
            </ButtonLink>
          </div>
        </div>

        {/**
         * ── Portrait ──
         *
         * The flat glass panel that used to live here (a rounded box, a
         * `hover:scale-105` on the image, a black-to-transparent scrim) has been
         * replaced by <PortraitCard/>, which treats the photograph as a lit
         * object in space rather than as a picture in a frame. The reasoning —
         * why the mat is dark in both themes, where the light is coming from,
         * and why the HUD chips hang off the frame's edge — is documented at
         * `.portrait-stage` in globals.css.
         *
         * `mx-auto lg:mx-0` still lives out here rather than inside the card:
         * the card owns its own material, the hero owns where it sits.
         *
         * `w-full` is NOT redundant next to `mx-auto`, and dropping it is what
         * broke this once already. This div is a grid item, and an `auto` inline
         * margin on a grid item overrides `justify-self: stretch` — the item
         * stops filling its track and shrink-wraps its contents instead. On
         * mobile that collapsed the whole portrait to ~206px, which in turn
         * dropped the HUD chip onto the name overlay. `w-full` pins the track
         * width back, `max-w-sm` caps it, and `mx-auto` then only centres.
         */}
        <div className="hero-in mx-auto w-full max-w-sm lg:mx-0" style={{ animationDelay: "0.15s" }}>
          <PortraitCard />
        </div>
      </div>

      {/**
       * The four proof stats used to live here, inside the hero, which put badge
       * + headline + sub + three CTAs + portrait card + four stat tiles + scroll
       * cue all inside one 92vh screen. Nothing in that stack could dominate
       * because everything was competing. They now render as their own <StatBar>
       * strip immediately below — same content, same position in the scroll, but
       * the hero gets to be a hero and the numbers get to be a beat of their own.
       */}

      {/* ── Scroll cue ── */}
      <div className="hero-in mt-16 flex items-center justify-center gap-2 text-muted" style={{ animationDelay: "0.95s" }}>
        <MousePointer2 className="scroll-bob h-4 w-4" />
        <span className="label">Scroll to explore</span>
      </div>
    </section>
  );
}
