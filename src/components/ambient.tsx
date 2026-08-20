/**
 * Cinematic aurora background — two large blurred orbs of warm light drifting
 * behind everything, plus a film-grain overlay. Pure CSS (GPU transforms), no
 * JS, and the drift pauses under prefers-reduced-motion. Rendered once in the
 * root layout as a fixed z-[-1] layer.
 *
 * Two orbs, not three. The third was cool `--cable` blue sitting between the
 * amber and the ember, which put all three points of the palette on screen at
 * once behind every panel — the background stopped reading as a single warm
 * light source and started reading as noise. Amber and ember are the same
 * light at two temperatures, so they blend into one glow instead of competing.
 *
 * The grid is the newest layer and it is here rather than on `body::before` for
 * one reason: `.ambient` is already `position: fixed` with `contain: strict`, so
 * adding a child costs one paint layer inside an existing containment boundary
 * instead of a second full-viewport fixed element the compositor has to track
 * separately. See `.tech-grid` in globals.css for why the light theme needs it.
 */
export function Ambient() {
  return (
    <div aria-hidden className="ambient">
      <div className="ambient-orb ambient-orb--amber" />
      <div className="ambient-orb ambient-orb--ember" />
      <div className="tech-grid" />
      <div className="ambient-grain" />
    </div>
  );
}
