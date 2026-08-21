"use client";

import { useId, useState } from "react";

/**
 * ═════════════════════════════════════════════════════════════════════════
 * SYSTEM GRAPH — an interactive node diagram that is a list underneath.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * Used twice on /lab with different data: once for the infrastructure→software
 * stack, once for the WorkforceIQ architecture. One component, because they are
 * the same object — a set of named parts and the paths between them.
 *
 * ── The structural idea ──
 * The NODES ARE REAL DOM. Each one is a `<button>` inside a `<ul>`, carrying
 * its own text. The SVG behind them draws only the connectors. That inversion
 * is what makes the whole thing work at once for:
 *
 *   • keyboard      — nodes are buttons, so Tab and Enter already work
 *   • screen reader — it is a list of named items, not an opaque canvas
 *   • crawlers      — every label is indexable text
 *   • mobile        — drop the absolute positioning and it is already a list
 *
 * A canvas or a pure-SVG version would have needed hit-testing, a parallel
 * accessible tree, and a separate mobile layout. This needs none of them.
 *
 * ── Coordinate space ──
 * Nodes are positioned as percentages of a container locked to the same aspect
 * ratio as the SVG viewBox, so the two coordinate systems agree exactly with no
 * measurement, no ResizeObserver, and no layout thrash. `meet` (not `none`)
 * keeps the scaling uniform, which is what keeps the flow dots circular.
 */

const VW = 1000;
const VH = 560;

export type GraphNode = {
  id: string;
  label: string;
  kind: string;
  detail: string;
  /** Coordinates in the 1000×560 viewBox space. */
  x: number;
  y: number;
  /** Marks the spine of the diagram — drawn heavier. */
  primary?: boolean;
};

export type GraphEdge = { from: string; to: string };

export function SystemGraph({
  nodes,
  edges,
  caption,
  description,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Short label under the diagram. */
  caption: string;
  /** The full prose alternative — what a screen reader gets for the SVG. */
  description: string;
}) {
  const uid = useId().replace(/:/g, "");
  const [active, setActive] = useState<string | null>(null);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  const activeNode = active ? byId.get(active) : null;

  /** An edge is lit when either end is the active node. */
  const isLit = (edge: GraphEdge) => active !== null && (edge.from === active || edge.to === active);

  return (
    <div className="sysgraph">
      <div className="sysgraph__stage">
        <svg
          className="sysgraph__svg"
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-labelledby={`${uid}-t ${uid}-d`}
        >
          <title id={`${uid}-t`}>{caption}</title>
          <desc id={`${uid}-d`}>{description}</desc>

          {edges.map((edge) => {
            const a = byId.get(edge.from);
            const b = byId.get(edge.to);
            if (!a || !b) return null;
            const lit = isLit(edge);
            /**
             * A cubic with horizontal control points. Straight lines between
             * boxes read as a flowchart; an eased curve reads as a signal path,
             * which is the register this diagram is written in.
             */
            const dx = (b.x - a.x) * 0.5;
            const d = `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={d}
                  className={`sysgraph__edge${lit ? " is-lit" : ""}`}
                  vectorEffect="non-scaling-stroke"
                />
                {/**
                 * Flow dot. `offset-path` moves it along the same curve with no
                 * per-frame JavaScript — the compositor animates one property.
                 * The stagger is a negative delay so the dots are already
                 * distributed along the paths on the first frame instead of all
                 * setting off together.
                 */}
                <circle
                  r={4}
                  className={`sysgraph__flow${lit ? " is-lit" : ""}`}
                  style={{
                    offsetPath: `path("${d}")`,
                    animationDelay: `${(a.x / VW) * -2.4}s`,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/**
         * The real content. `aria-describedby` is not used here — each button's
         * accessible name is its own label plus kind, and the detail is revealed
         * in the readout below, which is a live region only while a node is
         * genuinely selected.
         */}
        <ul className="sysgraph__nodes">
          {nodes.map((node) => (
            <li
              key={node.id}
              className="sysgraph__node-slot"
              style={{
                left: `${(node.x / VW) * 100}%`,
                top: `${(node.y / VH) * 100}%`,
              }}
            >
              <button
                type="button"
                className={`sysgraph__node${node.primary ? " is-primary" : ""}${
                  active === node.id ? " is-active" : ""
                }`}
                onPointerEnter={() => setActive(node.id)}
                onFocus={() => setActive(node.id)}
                onPointerLeave={() => setActive((cur) => (cur === node.id ? null : cur))}
                onBlur={() => setActive((cur) => (cur === node.id ? null : cur))}
                onClick={() => setActive((cur) => (cur === node.id ? null : node.id))}
                aria-pressed={active === node.id}
                data-cursor="Inspect"
              >
                <span className="sysgraph__node-label">{node.label}</span>
                <span className="sysgraph__node-kind">{node.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/**
       * Readout. Reserves its own height so hovering nodes never reflows the
       * page — a diagram that shoves the layout every time the pointer crosses
       * it is unusable, and the jump is far more distracting than the text is
       * informative.
       */}
      <p className="sysgraph__readout" aria-live="polite">
        {activeNode ? (
          <>
            <span className="sysgraph__readout-label">{activeNode.label}</span>
            <span className="sysgraph__readout-detail">{activeNode.detail}</span>
          </>
        ) : (
          <span className="sysgraph__readout-hint">{caption}</span>
        )}
      </p>
    </div>
  );
}
