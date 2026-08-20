import type { ElementType, ReactNode } from "react";

/**
 * ─────────────────────────────────────────────────────────────
 * BENTO GRID PRIMITIVES
 * ─────────────────────────────────────────────────────────────
 *
 * The surface styling — bevel, rim light, tilt, press — all lives in
 * `.bento-tile` in globals.css. This file owns only the LAYOUT half of the
 * pattern, which is the half people usually get wrong.
 *
 * A bento grid is not "cards with rounded corners". Its entire premise is that
 * tiles are deliberately unequal, and that the inequality is the information:
 * the biggest tile is the most important thing on the page, and a reader knows
 * that before reading a single word. A twelve-column grid where every tile is
 * four columns wide has thrown that away and kept only the aesthetic.
 *
 * So spans are a closed set of named presets rather than an open `span={7}`
 * prop. Two reasons, and the second is the real one:
 *
 *   1. Tailwind v4 scans source text for class names, so `col-span-${n}` never
 *      generates any CSS. Every span class has to appear as a literal string
 *      somewhere — which this map is.
 *   2. An open numeric prop invites a grid that adds up to 11 or 13 on some
 *      breakpoint and quietly reflows. A closed set of presets that are
 *      designed to combine means the compositions that exist are the ones that
 *      were drawn on purpose.
 */

/**
 * The grid is 6 columns on mobile and 12 on desktop — a 2:1 ratio, so a tile
 * can halve its share of the row at the breakpoint without any preset needing a
 * middle value. Every preset below names its mobile span first and its desktop
 * span second, and they are meant to be read as that pair.
 */
const SPAN = {
  /** Full width, both breakpoints. Section-spanning statements. */
  full: "col-span-6 lg:col-span-12",
  /** Half the desktop row; still full width on mobile. */
  half: "col-span-6 lg:col-span-6",
  /** A third of the desktop row. The default for a set of three peers. */
  third: "col-span-6 lg:col-span-4",
  /** Two thirds — pairs with `third` to fill a row asymmetrically. */
  twoThirds: "col-span-6 lg:col-span-8",
  /**
   * Compact metric tile. The only preset that stays subdivided on mobile: four
   * of these read as a 2×2 block of numbers on a phone, which is the correct
   * shape for a stat bar and wrong for anything with a paragraph in it.
   */
  stat: "col-span-3 lg:col-span-4",
  /**
   * The tall anchor tile — a third of the row, two rows deep. This is the piece
   * that makes a bento grid look like one: without at least one tile breaking
   * the row rhythm, the layout is just a card grid with mixed widths.
   */
  panel: "col-span-6 lg:col-span-4 lg:row-span-2",
} as const;

const PAD = {
  tight: "p-4 sm:p-5",
  default: "p-5 sm:p-6",
  loose: "p-6 sm:p-8",
} as const;

export function Bento({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** "ul" when the tiles are a genuine list — tiles then render as <li>. */
  as?: Extract<ElementType, "div" | "ul">;
}) {
  return (
    <Tag
      className={`grid grid-cols-6 gap-3 sm:gap-3.5 lg:grid-cols-12 lg:gap-4 ${className}`}
    >
      {children}
    </Tag>
  );
}

export function BentoTile({
  children,
  span = "third",
  pad = "default",
  className = "",
  /**
   * Tilt amplitude in degrees, read by PremiumInteractions off `data-tilt`.
   * Larger tiles want LESS of it, not more: rotation is angular, so the far
   * corner of a wide tile travels much further than the far corner of a small
   * one for the same angle, and a uniform amplitude makes big tiles look like
   * they are flapping while small ones barely move.
   */
  tilt,
  as: Tag = "div",
}: {
  children: ReactNode;
  span?: keyof typeof SPAN;
  pad?: keyof typeof PAD;
  className?: string;
  tilt?: number;
  as?: Extract<ElementType, "div" | "li" | "article" | "section">;
}) {
  return (
    <Tag
      data-tilt={tilt}
      className={`bento-tile ${SPAN[span]} ${PAD[pad]} ${className}`}
    >
      {children}
    </Tag>
  );
}
