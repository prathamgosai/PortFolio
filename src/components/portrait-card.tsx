import Image from "next/image";
import { ArrowUpRight, MapPin, ShieldCheck } from "lucide-react";
import prathamPhoto from "@/../public/pratham-portrait.jpeg";
import { certificationCount, identity } from "@/data/portfolio";

/**
 * ─────────────────────────────────────────────────────────────
 * THE PORTRAIT — a spatial object, not an image slot.
 * ─────────────────────────────────────────────────────────────
 *
 * The rationale for the mat, the vignette and the invented light source is
 * written out at `.portrait-stage` in globals.css — read that first; this file
 * is the assembly, not the design.
 *
 * The structural decision worth repeating here, because it constrains the JSX:
 * the mat clips (it has to — that is what makes the photograph an inset rather
 * than a pasted rectangle), and `overflow: hidden` flattens its own 3D subtree.
 * So anything that needs to genuinely float ABOVE the photograph — the hero's
 * two HUD chips — must be a SIBLING of the mat, positioned against the frame.
 * That is also why they hang over the frame's edge: a chip fully inside the
 * frame reads as a sticker on the photo; a chip breaking the boundary reads as
 * an object in front of it.
 */

/**
 * The photograph in its mat — the part that is actually about making a formal
 * studio headshot sit correctly on this page. Shared rather than duplicated,
 * because it was duplicated once already: /about rendered the same file as a
 * bare `rounded-3xl` <Image>, so the studio backdrop terminated at a hard grey
 * edge against a near-white column while the homepage version dissolved into
 * its frame. One photo cannot have two opinions about its own background.
 *
 * `eager` marks the instance that is the page's LCP candidate. `priority` is
 * deprecated as of Next.js 16; the documented replacement is eager loading plus
 * a high fetch priority, which states the two intentions separately.
 */
export function PortraitMat({
  sizes,
  eager = false,
  children,
}: {
  sizes: string;
  eager?: boolean;
  /** Overlay content — rendered above the vignette and the rim light. */
  children?: React.ReactNode;
}) {
  return (
    // The scrim rides with the caption, not with the mat — see
    // `.portrait-mat--captioned` in globals.css.
    <div
      className={`portrait-mat aspect-[4/5] w-full ${children ? "portrait-mat--captioned" : ""}`}
    >
      <Image
        src={prathamPhoto}
        alt={`${identity.name} — portrait`}
        placeholder="blur"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        fill
        sizes={sizes}
        className="portrait-photo object-cover"
      />
      {/* The invented light source — warm rim right, coral floor glow. */}
      <div aria-hidden className="portrait-rim" />
      {children}
    </div>
  );
}

/**
 * The hero portrait: mat, plus the HUD chips and status rail that make it read
 * as a piece of instrumentation rather than a photo in a frame.
 */
export function PortraitCard() {
  return (
    <div className="portrait-stage w-full">
      {/**
       * data-tilt is 9 rather than the 6 the bento tiles use. This is the one
       * element on the page that is supposed to feel handled — it is a single
       * focal object rather than one of twelve peers, and it is small enough
       * that the far-corner travel at 9° is still well short of distortion.
       */}
      <div className="portrait-card portrait-frame relative p-3.5" data-tilt={9}>
        <PortraitMat eager sizes="(min-width: 1024px) 384px, 90vw">
          {/* Sits above both the vignette and the rim, hence the explicit z. */}
          <div className="absolute inset-x-4 bottom-4 z-[2]">
            <p className="font-display text-xl font-bold tracking-tight text-white">
              {identity.name}
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-white/75">
              <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0 text-accent" />
              {identity.openTo}
            </p>
          </div>
        </PortraitMat>

        {/**
         * ── HUD chips ──
         *
         * `--pz` is how far in front of the frame each chip floats; `--pdx`/
         * `--pdy` are how far it drifts against the pointer. They are set
         * together and asymmetrically on purpose — a nearer object must also
         * travel further, because matched depth with unmatched parallax is
         * exactly the cue that reads as "fake 3D".
         */}
        <div
          aria-hidden
          className="portrait-chip parallax absolute -right-3 top-6 flex items-center gap-2 px-3 py-1.5"
          style={{ "--pz": "58px", "--pdx": "22px", "--pdy": "16px" } as React.CSSProperties}
        >
          <span className="status-pulse-emerald shrink-0" />
          <span className="t-mono-badge text-[0.6875rem] text-fg">Available</span>
        </div>

        {/* bottom-1/3, not a fixed offset: the mat's bottom strip is occupied by
            the name and location overlay, and a fixed `bottom-16` landed the
            chip directly on top of it at desktop width. A fractional inset
            tracks the mat's height instead of guessing at it. */}
        <div
          className="portrait-chip parallax absolute -left-3 bottom-1/3 flex items-center gap-2 px-3 py-1.5"
          style={{ "--pz": "38px", "--pdx": "14px", "--pdy": "10px" } as React.CSSProperties}
        >
          <ShieldCheck aria-hidden className="h-3.5 w-3.5 shrink-0 text-accent-ink" />
          <span className="t-mono-badge text-[0.6875rem] text-fg">
            {certificationCount} Certs
          </span>
        </div>

        {/* Footer rail — the card's own status line, on the frame not the mat. */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1.5 pb-0.5">
          <span className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="status-pulse-cyan" /> L1–L3 Active
          </span>
          <a
            href={identity.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-accent-ink hover:underline"
          >
            GitHub <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * The quiet variant, for a body column (/about). Same material and the same
 * tilt, none of the instrumentation: on a page that is already a first-person
 * essay, a status rail and two floating HUD chips would be repeating in
 * telemetry what the prose beside them is saying in sentences.
 *
 * The tilt is gentler than the hero's for the same reason the wide bento tiles
 * are gentler than the small ones — this instance is rendered large, and
 * rotation is angular, so the far corner of a 30rem portrait travels much
 * further per degree than the far corner of a 24rem one.
 */
export function PortraitPanel() {
  return (
    <div className="portrait-stage w-full">
      <div className="portrait-card portrait-frame p-3" data-tilt={5}>
        <PortraitMat eager sizes="(min-width: 1024px) 30rem, 100vw" />
      </div>
    </div>
  );
}
