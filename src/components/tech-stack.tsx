import { Section, ChipRow } from "@/components/ui";
import { Bento, BentoTile } from "@/components/bento";
import { Reveal } from "@/components/reveal";
import { skills } from "@/data/portfolio";

/**
 * Homepage tech-stack overview — the real `skills` groups as a bento.
 * A conversion + entity-SEO snapshot; the full breakdown lives on /about.
 *
 * This was five identical cards in a three-column grid, which had the same
 * problem the old proof strip did: five groups shown at identical weight claim
 * that infrastructure, security, AI, the full stack and working practices are
 * five equally central things, and they are not — nor are they the same SIZE,
 * since "Practices" is four short phrases and "Full-Stack" is ten framework
 * names that wrapped to three lines inside a tile sized for one.
 *
 * ── How the spans were chosen ──
 *
 * Not by importance, which was the first attempt and produced a grid full of
 * holes. These tiles hold WRAPPING CHIP LISTS, and a chip list's height is a
 * function of tile width: the same four items that fit on two lines at eight
 * columns take five at four columns. Grid rows stretch to their tallest member,
 * so pairing a short-content wide tile with a long-content narrow one leaves
 * the wide one with a third of its face empty.
 *
 * (Pinning the heading to the top and the chips to the bottom with `mt-auto` —
 * the trick that fixes the stat tiles in the overview bento — does not work
 * here. It moves the gap between the heading and its own list, which severs the
 * one relationship the tile exists to show. The stat tiles can take it because
 * a number and its caption stay glued together as a pair; a heading and a chip
 * list cannot be separated without reading as two unrelated things.)
 *
 * So spans are assigned by how much each group has to say at a given width, and
 * the result happens to fall out in source order:
 *
 *   Infrastructure  12  — five medium chips on one line. A wide, shallow opener,
 *                         and the group the whole site is arguing he is.
 *   Security         8  — four chips, one of them very long. Needs the width to
 *                         stay at two lines rather than five.
 *   AI & Automation  4  — four medium chips, three lines. Matches Security.
 *   Full-Stack       8  — twelve short chips. Two lines at eight columns; six
 *                         at four, which is why it can never be the narrow one.
 *   Practices        4  — four medium chips, three lines. Matches Full-Stack.
 *
 * Every row now pairs tiles within one chip-line of each other.
 *
 * The amber tick rule that used to head every one of these cards is still gone.
 * Amber marks proof and primary action; a stack listing is neither. The LEDs
 * here cycle the three-colour accent set instead — same rotation as the
 * capability tiles in the overview bento, so the two grids read as one system.
 */

/** Static strings — Tailwind v4 scans source text, so no interpolation. */
const LEDS = ["status-pulse-amber", "status-pulse-coral", "status-pulse-cyan"] as const;

/** Wider tiles get a gentler tilt — see the `tilt` note in bento.tsx. */
const SHAPE = [
  { span: "full", tilt: 3 },
  { span: "twoThirds", tilt: 4 },
  { span: "third", tilt: 6 },
  { span: "twoThirds", tilt: 4 },
  { span: "third", tilt: 6 },
] as const;

export function TechStack() {
  return (
    <Section label="Tech stack" title="The tools I build and operate with.">
      <Reveal className="mt-10">
        <Bento as="ul">
          {skills.map((group, i) => {
            const shape = SHAPE[i % SHAPE.length];
            return (
              <BentoTile
                key={group.group}
                as="li"
                span={shape.span}
                tilt={shape.tilt}
                pad="loose"
                className="flex flex-col"
              >
                <div className="depth-2 flex items-center justify-between gap-4">
                  <h3 className="t-card-title font-bold text-fg">{group.group}</h3>
                  <span aria-hidden className={`${LEDS[i % LEDS.length]} shrink-0`} />
                </div>
                <div className="depth-1 mt-5">
                  <ChipRow items={group.items} />
                </div>
              </BentoTile>
            );
          })}
        </Bento>
      </Reveal>
    </Section>
  );
}
