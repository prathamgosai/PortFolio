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
 */
export function Ambient() {
  return (
    <div aria-hidden className="ambient">
      <div className="ambient-orb ambient-orb--amber" />
      <div className="ambient-orb ambient-orb--ember" />
      <div className="ambient-grain" />
    </div>
  );
}
