/**
 * Signature element (§6): the domains Pratham works across, wired to a center
 * node. Inline SVG, no dependency. One edge carries an amber pulse; it is
 * disabled under prefers-reduced-motion via the CSS in globals.css.
 *
 * Geometry notes:
 *  - Nodes sit at 45/135/180/0/-45/-135°. Nothing is placed straight above or
 *    below the hub, so no edge can ever cross the "PRATHAM" label beneath it.
 *  - Every edge is trimmed at BOTH ends (see `edge()`) so lines stop cleanly at
 *    the node dot and at the hub ring instead of running underneath them.
 */

const CENTER = { x: 300, y: 120 };

const HUB_RING = 16; // outer ring radius
const NODE_DOT = 4;
const GAP = 5; // breathing room between a line end and the thing it points at

type Node = { id: string; label: string; x: number; y: number };

const NODES: Node[] = [
  { id: "desktops", label: "Desktops", x: 152, y: 52 },
  { id: "firewall", label: "Firewall", x: 448, y: 52 },
  { id: "network", label: "Network", x: 86, y: 120 },
  { id: "claude", label: "Claude", x: 514, y: 120 },
  { id: "nas", label: "NAS", x: 152, y: 188 },
  { id: "apis", label: "APIs", x: 448, y: 188 },
];

/** Trim the segment so it runs from the node's edge to the hub's ring. */
function edge(node: Node) {
  const dx = CENTER.x - node.x;
  const dy = CENTER.y - node.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;

  const startOffset = NODE_DOT + GAP;
  const endOffset = HUB_RING + GAP;

  return {
    x1: node.x + ux * startOffset,
    y1: node.y + uy * startOffset,
    x2: CENTER.x - ux * endOffset,
    y2: CENTER.y - uy * endOffset,
  };
}

export function Topology({ className = "" }: { className?: string }) {
  return (
    <figure className={className}>
      <svg
        viewBox="0 0 600 240"
        role="img"
        aria-labelledby="topology-title topology-desc"
        className="h-auto w-full"
      >
        <title id="topology-title">Pratham Gosai&rsquo;s work, drawn as a network topology</title>
        <desc id="topology-desc">
          Six nodes — Desktops, Firewall, Network, Claude, NAS, and APIs — each connected to a central node
          labelled Pratham.
        </desc>

        {NODES.map((node) => {
          const isPulse = node.id === "claude";
          const { x1, y1, x2, y2 } = edge(node);
          return (
            <line
              key={`edge-${node.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isPulse ? "var(--signal)" : "var(--wire)"}
              strokeWidth={isPulse ? 1.5 : 1}
              className={isPulse ? "topology-pulse" : undefined}
            />
          );
        })}

        {NODES.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r={NODE_DOT} fill="var(--cable)" />
            <text
              x={node.x}
              y={node.y - 13}
              textAnchor="middle"
              fill="var(--fg-muted)"
              className="font-mono"
              fontSize="10"
              letterSpacing="1.4"
            >
              {node.label.toUpperCase()}
            </text>
          </g>
        ))}

        <circle cx={CENTER.x} cy={CENTER.y} r="8" fill="var(--signal)" />
        <circle
          cx={CENTER.x}
          cy={CENTER.y}
          r={HUB_RING}
          fill="none"
          stroke="var(--signal)"
          strokeWidth="1"
          opacity="0.45"
        />
        <text
          x={CENTER.x}
          y={CENTER.y + 40}
          textAnchor="middle"
          fill="var(--fg)"
          className="font-mono"
          fontSize="11"
          letterSpacing="1.4"
        >
          PRATHAM
        </text>
      </svg>
    </figure>
  );
}
