import type { GraphEdge, GraphNode } from "@/components/lab/system-graph";

/**
 * ─────────────────────────────────────────────────────────────
 * /lab — DIAGRAM STRUCTURE.
 * ─────────────────────────────────────────────────────────────
 *
 * Layout and topology only. Every technology named here is one that already
 * appears in `portfolio.ts` (`skills`, `workforceiq.stack`, `workforceiq.
 * features`, `experience[].bullets`) — this file decides where a box sits and
 * what connects to what, never what is true.
 *
 * The rule to keep: if a node names a capability that `portfolio.ts` does not
 * already claim, the node is wrong, not the data file. Adding "Kubernetes" here
 * because the diagram looks unbalanced would be inventing a skill.
 *
 * Coordinates are in the graph's 1000×560 viewBox space.
 */

/* ── The stack: endpoint → network → application → AI ─────────────────── */

export const systemNodes: GraphNode[] = [
  {
    id: "endpoints",
    label: "Endpoints",
    kind: "Hardware",
    detail:
      "Windows desktops, laptops, printers and peripherals — installed, configured, maintained and diagnosed when they fail.",
    x: 100,
    y: 280,
    primary: true,
  },
  {
    id: "network",
    label: "Network",
    kind: "LAN / WAN",
    detail:
      "The LAN and WAN those machines sit on. Connectivity troubleshooting end to end, plus NAS storage.",
    x: 292,
    y: 280,
    primary: true,
  },
  {
    id: "security",
    label: "Security",
    kind: "Perimeter & identity",
    detail:
      "Cisco firewall basics and network security, extended by Zero Trust and Entra Identity Protection.",
    x: 292,
    y: 92,
  },
  {
    id: "api",
    label: "API",
    kind: "NestJS · Node.js",
    detail:
      "The service layer. A TypeScript monorepo with a NestJS API, written against raw parameterised SQL rather than an ORM.",
    x: 500,
    y: 280,
    primary: true,
  },
  {
    id: "database",
    label: "Database",
    kind: "PostgreSQL",
    detail: "Reversible migrations and parameterised SQL, so what runs against the database is known.",
    x: 712,
    y: 100,
  },
  {
    id: "queue",
    label: "Queue",
    kind: "Redis",
    detail: "Background jobs — the work that must survive a request finishing.",
    x: 712,
    y: 280,
  },
  {
    id: "interface",
    label: "Interface",
    kind: "Next.js · React",
    detail: "The front end, with full light and dark theming built on semantic design tokens.",
    x: 712,
    y: 462,
  },
  {
    id: "ai",
    label: "AI",
    kind: "Claude API",
    detail:
      "Claude API integration and prompt design, certified by Anthropic in both API development and AI Fluency.",
    x: 892,
    y: 182,
    primary: true,
  },
  {
    id: "automation",
    label: "Automation",
    kind: "Live operations",
    detail:
      "Reservation and administrative work automated against a real hotel operation with real customers.",
    x: 892,
    y: 382,
    primary: true,
  },
];

export const systemEdges: GraphEdge[] = [
  { from: "endpoints", to: "network" },
  { from: "network", to: "security" },
  { from: "network", to: "api" },
  { from: "api", to: "database" },
  { from: "api", to: "queue" },
  { from: "api", to: "interface" },
  { from: "api", to: "ai" },
  { from: "ai", to: "automation" },
  { from: "queue", to: "automation" },
];

/* ── WorkforceIQ architecture ─────────────────────────────────────────── */

export const workforceNodes: GraphNode[] = [
  {
    id: "web",
    label: "Web",
    kind: "Next.js · TanStack Query",
    detail: "The staff and management interface, in a Turborepo monorepo with the API.",
    x: 110,
    y: 280,
    primary: true,
  },
  {
    id: "api",
    label: "API",
    kind: "NestJS",
    detail:
      "Auto-scheduling, attendance, leave, staff allocation, and a live role-to-permission matrix across six account types.",
    x: 336,
    y: 280,
    primary: true,
  },
  {
    id: "db",
    label: "PostgreSQL",
    kind: "System of record",
    detail:
      "The full employee lifecycle for 370+ staff across multiple brands and outlets. Raw SQL, reversible migrations.",
    x: 566,
    y: 110,
    primary: true,
  },
  {
    id: "queue",
    label: "Redis",
    kind: "Job queues",
    detail: "Roster generation and notification dispatch, off the request path.",
    x: 566,
    y: 280,
  },
  {
    id: "forecast",
    label: "Forecasting",
    kind: "Python · FastAPI",
    detail:
      "A microservice that forecasts staffing demand with ML, so scheduling is planned against expected load rather than guessed.",
    x: 566,
    y: 450,
    primary: true,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    kind: "Meta Graph API",
    detail: "Rosters and updates reach staff where they already are.",
    x: 838,
    y: 190,
  },
  {
    id: "email",
    label: "Email",
    kind: "Second channel",
    detail: "The fallback delivery path when WhatsApp is not an option.",
    x: 838,
    y: 386,
  },
];

export const workforceEdges: GraphEdge[] = [
  { from: "web", to: "api" },
  { from: "api", to: "db" },
  { from: "api", to: "queue" },
  { from: "api", to: "forecast" },
  { from: "db", to: "forecast" },
  { from: "queue", to: "whatsapp" },
  { from: "queue", to: "email" },
];

/**
 * The scroll narrative. Each entry is a section of /lab and the state the
 * environment takes while it is on screen — see `FieldMode` in digital-field.tsx.
 * Order here is the order of the page.
 */
export const labSections = [
  { id: "identity", label: "Identity", mode: "drift" as const },
  { id: "layers", label: "Layers", mode: "lattice" as const },
  { id: "system", label: "System", mode: "lattice" as const },
  { id: "workforceiq", label: "WorkforceIQ", mode: "converge" as const },
  { id: "automation", label: "Automation", mode: "stream" as const },
  { id: "stack", label: "Stack", mode: "drift" as const },
  { id: "record", label: "Record", mode: "drift" as const },
  { id: "contact", label: "Contact", mode: "calm" as const },
];
