import { ArrowUpRight, BadgeCheck } from "lucide-react";
import { Bento, BentoTile } from "@/components/bento";
import { Reveal } from "@/components/reveal";
import { AnimatedStat } from "@/components/animated-stat";
import {
  CERTS_URL,
  certificationGroups,
  experience,
  identity,
  stats,
} from "@/data/portfolio";

/**
 * ─────────────────────────────────────────────────────────────
 * SYSTEM OVERVIEW — the homepage bento.
 * ─────────────────────────────────────────────────────────────
 *
 * This replaces three consecutive full-width strips that used to run between
 * the hero and the featured project: <StatBar/>, <CertTrust/>, and the "What I
 * do" card grid. All three said the same kind of thing — here is evidence that
 * I am what the headline claims — and all three said it at the same visual
 * weight, one after another, each in its own container with its own padding.
 * A visitor scrolling through got three full screens of equally-important
 * evidence and no way to tell which part of it mattered.
 *
 * A bento grid is the right answer to precisely that problem, because unequal
 * tiles ARE a ranking. The composition reads, in order of size:
 *
 *   1. Availability (tall anchor, two rows) — the one thing a recruiter came
 *      to find out, and the only tile that breaks the row rhythm.
 *   2. The four proof numbers — evidence, subordinate to the claim above.
 *   3. The three capability tiles — the argument, at peer weight.
 *   4. Certifications + verification — the footnote, and the widest/narrowest
 *      pairing on the grid so it reads as a closing strip.
 *
 * Roughly one screen instead of three, and the hierarchy is legible before a
 * word is read.
 *
 * ── Accent rotation ──
 * The three capability tiles cycle amber → coral → tech. That is not
 * decoration: coral is sampled from the portrait's shirt and the whole point of
 * putting it here is that by the time a visitor scrolls past the headshot they
 * have already seen that colour used deliberately three times, so it reads as
 * the palette rather than as something the photograph dragged in. See the
 * portrait palette note in globals.css.
 */

/** Static class strings — Tailwind v4 scans source text, so no interpolation. */
const ACCENTS = [
  { rule: "bg-accent", led: "status-pulse-amber" },
  { rule: "bg-coral", led: "status-pulse-coral" },
  { rule: "bg-tech", led: "status-pulse-cyan" },
] as const;

export function SystemBento() {
  const current = experience.filter((role) => role.current);
  const issuers = certificationGroups.map((group) => group.issuer);

  return (
    <section aria-label="Overview" className="mx-auto max-w-5xl px-5 py-14 sm:py-16">
      {/**
       * One Reveal around the whole grid rather than a per-tile stagger. The
       * stagger was the obvious move and it was wrong: a bento grid's unequal
       * tiles only communicate their ranking once they are all on screen
       * together, so revealing them in sequence makes the reader watch a list
       * assemble itself instead of seeing a composition.
       */}
      <Reveal>
        <Bento>
        {/* ── 1. Availability — the anchor tile ── */}
        <BentoTile span="panel" pad="loose" tilt={4} className="flex flex-col">
          <div className="depth-1">
            <p className="label">Status</p>
            <p className="mt-4 flex items-center gap-2.5">
              <span className="status-pulse-emerald shrink-0" />
              <span className="t-mono-badge text-fg">Open to work</span>
            </p>
          </div>

          <p className="depth-2 t-h3 mt-5 text-fg">{identity.openTo}</p>

          <div className="depth-1 mt-7 border-t border-hairline pt-6">
            <p className="label">Currently</p>
            <ul className="mt-4 space-y-4">
              {current.map((role) => (
                <li key={role.company}>
                  <p className="t-small font-semibold leading-snug text-fg">{role.role}</p>
                  <p className="t-caption mt-0.5 leading-snug text-muted">{role.company}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* mt-auto pins this to the bottom of a tile whose height is set by
              the two stat rows beside it, not by its own content. */}
          <p className="depth-1 mt-auto pt-7 font-mono text-xs text-muted">
            On-site · Hybrid · Remote
          </p>
        </BentoTile>

        {/* ── 2. Proof numbers ── */}
        {stats.map((stat, i) => (
          <BentoTile key={stat.label} span="stat" tilt={7} className="flex flex-col">
            <div className="depth-1 flex items-center justify-between">
              <span aria-hidden className={`block h-1 w-6 rounded-full ${ACCENTS[i % 3].rule}`} />
              <span aria-hidden className={ACCENTS[i % 3].led} />
            </div>
            {/**
             * These four tiles are stretched to the height of the two-row
             * anchor tile beside them, so a bare figure-plus-caption does not
             * fill the box. `mt-auto` alone did not solve that — it only moved
             * the empty third from below the caption to above the figure, which
             * is the same hole in a different place.
             *
             * The fix is content, not alignment: a category above and a
             * grounding detail below give the tile two masses that hold its top
             * and bottom edges, and the space between them then reads as
             * deliberate. `mt-auto` still separates them, but now it is spacing
             * two things rather than propping up one.
             */}
            <p className="depth-1 label mt-4 text-[0.6875rem]">{stat.kind}</p>

            <div className="depth-2 mt-auto pt-5">
              <AnimatedStat
                value={stat.value}
                className="font-mono text-[2rem] font-extrabold leading-none tracking-tight text-fg tabular-nums sm:text-[2.75rem]"
              />
            </div>
            <p className="depth-1 t-caption mt-2.5 leading-snug text-fg/85">{stat.label}</p>
            <p className="depth-1 mt-2 border-t border-hairline pt-2.5 font-mono text-[0.6875rem] leading-snug text-muted">
              {stat.note}
            </p>
          </BentoTile>
        ))}

        {/* ── 4. Certifications strip ── */}
        <BentoTile span="twoThirds" pad="loose" tilt={4}>
          <div className="depth-1 flex items-center gap-2">
            <span className="status-pulse-emerald shrink-0" />
            <p className="t-mono-badge text-accent-ink">Certified &amp; verified</p>
          </div>
          <ul className="depth-2 mt-5 flex flex-wrap items-center gap-2">
            {issuers.map((name) => (
              <li
                key={name}
                className="flex items-center gap-2 rounded-full border border-hairline bg-wash px-3 py-1.5"
              >
                <BadgeCheck aria-hidden className="h-4 w-4 shrink-0 text-accent-ink" />
                <span className="font-display text-xs font-bold tracking-tight text-fg">{name}</span>
              </li>
            ))}
          </ul>
        </BentoTile>

        {/**
         * This tile deliberately does NOT repeat the certification count. It
         * used to lead with the same "14" that the third proof tile above
         * already carries, and putting a number twice inside one grid — where
         * both instances are on screen simultaneously — reads as a mistake
         * rather than as emphasis. The count is evidence and lives up there;
         * this tile is the invitation to go and check it.
         */}
        <BentoTile span="third" pad="loose" tilt={6} className="flex flex-col justify-between">
          <div className="depth-2">
            <p className="label">Proof</p>
            <p className="t-small mt-4 leading-snug text-fg">
              Each one is listed in public, with its issuer and date.
            </p>
          </div>
          {/* A plain visible link, deliberately not a stretched one — see the
              note above `.depth-1` in globals.css for why a stretched anchor
              cannot be a direct child of a tile. */}
          <a
            href={CERTS_URL}
            target="_blank"
            rel="noreferrer"
            className="depth-1 -my-2.5 mt-6 inline-flex items-center gap-1.5 py-2.5 font-mono text-xs font-bold text-accent-ink hover:underline"
          >
            Verify credentials <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </a>
        </BentoTile>
        </Bento>
      </Reveal>
    </section>
  );
}
