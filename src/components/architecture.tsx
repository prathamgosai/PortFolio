/**
 * WorkforceIQ architecture, as inline SVG (§5 — no screenshots are cleared).
 * Next.js web → NestJS API → PostgreSQL / Redis / FastAPI ML → WhatsApp + email.
 */

function Box({
  x,
  y,
  w = 132,
  h = 46,
  title,
  sub,
  accent = false,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  title: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="3"
        fill="var(--surface)"
        stroke={accent ? "var(--signal)" : "var(--rule)"}
        strokeWidth="1"
      />
      <text x={x + w / 2} y={sub ? y + 20 : y + 27} textAnchor="middle" fill="var(--fg)" fontSize="12" fontWeight="600">
        {title}
      </text>
      {sub ? (
        <text x={x + w / 2} y={y + 34} textAnchor="middle" fill="var(--fg-muted)" className="font-mono" fontSize="9">
          {sub}
        </text>
      ) : null}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--wire)" strokeWidth="1" markerEnd="url(#arrowhead)" />;
}

export function Architecture() {
  return (
    <figure className="mt-6 rounded border border-rule bg-bg p-4 sm:p-6">
      <svg viewBox="0 0 620 330" role="img" aria-labelledby="arch-title arch-desc" className="h-auto w-full">
        <title id="arch-title">WorkforceIQ architecture diagram</title>
        <desc id="arch-desc">
          A Next.js web frontend calls a NestJS API. The API reads and writes PostgreSQL 16, queues jobs in Redis,
          and calls a Python FastAPI service for demand forecasting. Redis job workers send notifications out over
          WhatsApp via the Meta Graph API, and over email.
        </desc>

        <defs>
          <marker id="arrowhead" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto">
            <path d="M0,0 L6,2.5 L0,5 z" fill="var(--fg-muted)" />
          </marker>
        </defs>

        <Box x={16} y={140} title="Web" sub="NEXT.JS 14 · REACT 18" />
        <Arrow x1={148} y1={163} x2={236} y2={163} />

        <Box x={240} y={140} title="API" sub="NESTJS · NODE.JS" accent />

        {/* Data layer */}
        <Arrow x1={306} y1={140} x2={306} y2={94} />
        <Box x={240} y={46} title="PostgreSQL 16" sub="RAW PARAMETERIZED SQL" />

        {/* Forecasting */}
        <Arrow x1={372} y1={155} x2={456} y2={125} />
        <Box x={460} y={100} title="Forecasting" sub="PYTHON · FASTAPI" />

        {/* Queues */}
        <Arrow x1={372} y1={175} x2={456} y2={205} />
        <Box x={460} y={182} title="Redis" sub="JOB QUEUES" />

        {/* Notifications */}
        <Arrow x1={526} y1={228} x2={526} y2={264} />
        <Box x={460} y={268} title="WhatsApp" sub="META GRAPH API" />

        <Arrow x1={460} y1={228} x2={330} y2={276} />
        <Box x={240} y={268} title="Email" sub="NOTIFICATIONS" />

        <text x={16} y={318} className="font-mono" fill="var(--fg-muted)" fontSize="9" letterSpacing="1.2">
          PNPM + TURBOREPO MONOREPO · SHARED TS PACKAGE
        </text>
      </svg>
    </figure>
  );
}
