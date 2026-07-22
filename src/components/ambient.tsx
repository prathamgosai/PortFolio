/**
 * Cinematic aurora background — a few large blurred orbs of warm amber/ember
 * light drifting behind everything, plus a film-grain overlay. Pure CSS
 * (GPU transforms), no JS, and the drift pauses under prefers-reduced-motion.
 * Rendered once in the root layout as a fixed z-[-1] layer.
 */
export function Ambient() {
  return (
    <div aria-hidden className="ambient">
      <div className="ambient-orb ambient-orb--amber" />
      <div className="ambient-orb ambient-orb--ember" />
      <div className="ambient-orb ambient-orb--cool" />
      <div className="ambient-grain" />
    </div>
  );
}
