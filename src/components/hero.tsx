"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin, MousePointer2 } from "lucide-react";
import prathamPhoto from "../../public/pratham.jpeg";
import { ButtonLink } from "@/components/ui";
import { AnimatedStat } from "@/components/animated-stat";
import { hero, identity, stats, workforceiq } from "@/data/portfolio";

const EASE = [0.22, 1, 0.36, 1] as const;
// Words that get the amber signature gradient (the phrase "AI-powered systems").
const GRADIENT_WORDS = new Set(["AI-powered", "systems"]);

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const raf = useRef(0);

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 22, filter: reduce ? "blur(0px)" : "blur(8px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
  };

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
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm text-fg">
              <span className="live-dot" />
              <span className="relative z-[1]">Open to work · {identity.locationShort}</span>
            </span>
          </motion.div>

          <h1 className="t-hero mt-6 text-fg">
            {words.map((w, i) => {
              const bare = w.replace(/[^\w-]/g, "");
              return (
                <motion.span key={i} variants={item} className="inline-block">
                  <span className={GRADIENT_WORDS.has(bare) ? "text-gradient" : undefined}>{w}</span>
                  {i < words.length - 1 ? " " : null}
                </motion.span>
              );
            })}
          </h1>

          <motion.p variants={item} className="t-body measure mt-6 font-medium text-fg/85">
            {hero.sub}
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href={`/projects/${workforceiq.slug}`}>
              Read the WorkforceIQ case study
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Contact me
            </ButtonLink>
          </motion.div>
        </motion.div>

        {/* ── Floating profile card ── */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.15 }}
          className="mx-auto w-full max-w-sm lg:mx-0"
        >
          <div className="glass glass-hover rounded-3xl p-4">
            <div className="relative z-[1] aspect-[4/5] w-full overflow-hidden rounded-2xl">
              <Image
                src={prathamPhoto}
                alt={`${identity.name} — portrait`}
                placeholder="blur"
                priority
                fill
                sizes="(min-width: 1024px) 384px, 90vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 glass rounded-full px-2.5 py-1 font-mono text-xs text-fg">
                <span className="relative z-[1]">{identity.jobTitle.split("·")[0].trim()}</span>
              </span>
              <div className="absolute inset-x-3 bottom-3">
                <p className="font-display text-lg font-bold text-white">{identity.name}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/80">
                  <MapPin className="h-3.5 w-3.5" /> {identity.location}
                </p>
              </div>
            </div>
            <div className="relative z-[1] mt-3 flex items-center justify-between px-1">
              <span className="flex items-center gap-2 text-sm text-muted">
                <span className="live-dot" /> Available now
              </span>
              <a
                href={identity.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent-ink hover:underline"
              >
                GitHub <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Animated stat tiles ── */}
      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {stats.map((s) => (
          <motion.li key={s.label} variants={item} className="glass glass-hover rounded-2xl p-4">
            <div className="relative z-[1]">
              <span aria-hidden className="block h-0.5 w-6 bg-accent" />
              <AnimatedStat
                value={s.value}
                className="mt-2 font-display text-3xl font-extrabold tracking-tight text-accent-ink tabular-nums sm:text-4xl"
              />
              <p className="mt-1 text-sm leading-snug text-muted">{s.label}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      {/* ── Scroll cue ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="mt-14 flex items-center justify-center gap-2 text-muted"
      >
        <MousePointer2 className="scroll-bob h-4 w-4" />
        <span className="label">Scroll to explore</span>
      </motion.div>
    </section>
  );
}
