/**
 * SINGLE SOURCE OF TRUTH.
 *
 * Every fact rendered on this site comes from this file, and every fact here is
 * real. Do not add metrics, employers, dates, clients, testimonials, or logos
 * that are not confirmed. If something is unknown, leave it null and let the
 * consuming component omit the element — never invent a placeholder.
 */

/** Live domain. Drives metadataBase, canonicals, JSON-LD, sitemap, and robots. */
export const SITE_URL = "https://prathamgosai.in";

/**
 * Web3Forms access key (public by design — safe to expose). Set
 * NEXT_PUBLIC_WEB3FORMS_KEY in the host env to enable async contact-form
 * submission. When empty, the contact form gracefully falls back to opening
 * the visitor's email client via mailto — so it always works.
 */
export const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY ?? "";

export const identity = {
  name: "Pratham Gosai",
  /** Full legal name — used for SEO/structured data only; display stays `name`. */
  fullName: "Pratham Dharmeshbharti Gosai",
  pronouns: "he/him",
  oneLine: "IT & network engineer turned AI-automation and full-stack builder.",
  jobTitle: "IT Support & Network Engineer · AI Automation",
  location: "Surat, Gujarat, India",
  locationShort: "Surat, India",
  /** Markets open to work in — drives the hero availability badge. */
  openTo: "Dubai, UAE · Surat, India",
  availability: "Dubai, UAE · Surat, India · open to on-site, hybrid, remote",
  linkedin: "https://www.linkedin.com/in/pratham-gosai-066789312",
  github: "https://github.com/prathamgosai",
  instagram: "https://www.instagram.com/pratham__gosai_",
  email: "prathamgosai2004@gmail.com" as string | null,
  /** Generated from resume/resume.html — see that file's header to rebuild. */
  resumePdf: "/Pratham-Gosai-Resume.pdf" as string | null,
  /** Intrinsic dimensions of public/pratham-portrait.jpeg — must match the file
   *  exactly, or <Image> reserves the wrong box and the portrait crops/shifts.
   *  The filename carries the version: swapping the photo in place kept the
   *  /_next/image URL identical, so browsers and the CDN went on serving the
   *  old headshot. Rename the file when the photo changes. */
  photo: { src: "/pratham-portrait.jpeg", width: 1161, height: 1354 },
};

export const hero = {
  headline: "I build AI-powered systems — and I know what keeps them running.",
  sub: "Desktop & network engineer turned full-stack builder in Surat, India. I built WorkforceIQ — an AI-assisted workforce platform for 370+ restaurant staff — and I automate real operations with the Claude API.",
};

/**
 * §3: approved proof-bar stats. These four only.
 *
 * `kind` and `note` were added when these became bento tiles. A tile in that
 * grid is stretched to the height of the two-row anchor tile beside it, and a
 * bare figure-plus-caption does not fill that box — it left a third of each
 * tile empty, which reads as content that failed to load rather than as
 * restraint.
 *
 * NOTHING NEW IS CLAIMED HERE. Every `note` is a restatement of a fact already
 * confirmed elsewhere in this file, and the source is named so it stays
 * checkable:
 *   370+ → workforceiq.outcomes[0]
 *   10+  → experience[1].bullets (Premware: Windows, printers, LAN/WAN)
 *   14   → certificationGroups[0] (Anthropic: Claude API, AI Fluency, Claude 101)
 *   6    → workforceiq.features "Role-based access control"
 * If a note is ever edited, edit it back to its source — do not let it drift
 * into a new claim.
 */
export const stats = [
  {
    kind: "Scale",
    value: "370+",
    label: "staff on a platform I built end-to-end",
    note: "Across multiple brands and outlets.",
  },
  {
    kind: "Field time",
    value: "10+",
    label: "months of hands-on L1/L2 desktop & network support",
    note: "Windows machines, printers, peripherals, LAN/WAN.",
  },
  {
    kind: "Certified",
    value: "14",
    label: "certifications from Anthropic, Cisco, Microsoft & Meta",
    note: "Three from Anthropic, including Claude API development.",
  },
  {
    kind: "Access control",
    value: "6",
    label: "account roles in a live permission system",
    note: "Live-editable, not hardcoded and redeployed.",
  },
];

export const whatIDo = [
  {
    title: "Keep systems running",
    body: "I've spent 10+ months on L1/L2 desktop and network support — Windows machines, printers, peripherals, and the LAN/WAN they sit on. I diagnose hardware, software, and connectivity faults, manage user accounts and system configuration, and document incidents so the next person doesn't start from zero.",
  },
  {
    title: "Build the software layer",
    body: "I taught myself the stack above the network and shipped WorkforceIQ to production: a TypeScript monorepo with a NestJS API over PostgreSQL, a Next.js frontend, and Redis job queues. I write raw parameterized SQL and reversible migrations because I want to know exactly what runs against the database.",
  },
  {
    title: "Automate with AI",
    body: "I automate live hotel reservation and admin work with the Claude API, and I'm certified by Anthropic in both Claude API development and AI Fluency. In WorkforceIQ I went further and built a Python/FastAPI microservice that forecasts staffing demand.",
  },
];

export type Experience = {
  role: string;
  company: string;
  employment: string;
  period: string;
  location: string;
  current: boolean;
  bullets: string[];
};

/** §10 Q4 answered: Premware is ongoing — both roles are concurrent. */
export const experience: Experience[] = [
  {
    role: "AI Automation / Reservationist",
    company: "K. Girdharlal International Ltd. / Bookends Hospitality",
    employment: "Full-time · On-site",
    period: "Jun 2026 – Present",
    location: "Surat, India",
    current: true,
    bullets: [
      "Automated repetitive reservation and administrative tasks using AI workflows built on the Claude API.",
      "Managed website content and booking updates.",
      "Improved response times through AI-based workflows.",
      "Coordinated with hotel and operations teams, and maintained accurate customer records.",
      "Built WorkforceIQ, the group's restaurant workforce platform, covering 370+ staff.",
    ],
  },
  {
    role: "Desktop Engineer & Network Engineer",
    company: "Premware Services India LLP",
    employment: "Full-time · On-site",
    period: "Sep 2025 – Present",
    location: "Surat, India",
    current: true,
    bullets: [
      "L1/L2 desktop and network support for end users.",
      "Installed, configured, and maintained Windows desktops, laptops, printers, and peripherals.",
      "Diagnosed hardware, software, and network connectivity issues.",
      "Managed user accounts, system configurations, and software installations.",
      "Supported LAN/WAN infrastructure and basic network security.",
      "Ran preventive maintenance and system updates, and documented incidents.",
    ],
  },
];

/** §10 Q5 answered: graduated. Year not supplied — omitted per §10 defaults. */
export const education = [
  {
    title: "B.Sc. IT (Infrastructure Management Services)",
    org: "Bhagwan Mahavir University",
    detail: "Graduated",
  },
  {
    title: "Cloud Computing & Cybersecurity track",
    org: "PureSkill IT Training Academy",
    detail: "Cisco Firewall Security · Ethical Hacking",
  },
];

export type Certification = {
  name: string;
  date: string | null;
  credentialId?: string;
  verifyUrl?: string;
  detail?: string;
};

/**
 * Transcribed from the certificate PDFs themselves — titles are verbatim from
 * each document, not from memory. Where a certificate shows no issue date, the
 * date is null and the UI omits it rather than guessing.
 */
export const certificationGroups: { issuer: string; items: Certification[] }[] = [
  {
    issuer: "Anthropic",
    items: [
      {
        // Certificate reads "Claude with the Anthropic API" — NOT
        // "Building with the Claude API". Title kept verbatim.
        name: "Claude with the Anthropic API",
        date: "Mar 2026",
        credentialId: "ayzsae3o38ec",
        verifyUrl: "https://verify.skilljar.com/c/ayzsae3o38ec",
        detail: "Claude API integration, prompt design, automating workflows, and building AI features.",
      },
      {
        name: "AI Fluency: Framework & Foundations",
        date: "Mar 2026",
        credentialId: "e6ub7n6v2w95",
        detail: "Responsible AI use and the 4 Ds framework — Delegation, Description, Discernment, Diligence.",
      },
      { name: "Claude 101", date: null },
    ],
  },
  {
    issuer: "Cisco Networking Academy",
    items: [
      {
        name: "Networking Basics",
        date: "Aug 2025",
        detail: "Network types and components, standards and protocols, Ethernet, IPv4 and IPv6 addressing, routing, and connectivity troubleshooting.",
      },
      { name: "Introduction to Internet of Things", date: "Jul 2025" },
      {
        name: "Introduction to Cybersecurity",
        date: "Oct 2024",
        detail: "Common threats, attacks, and vulnerabilities, and how organisations defend against them.",
      },
      { name: "Introduction to Data Science", date: "Oct 2024" },
      {
        name: "Computer Hardware Basics",
        date: "Oct 2024",
        detail: "Building, repairing, and upgrading PCs; device hardware and preventive maintenance.",
      },
    ],
  },
  {
    issuer: "Microsoft",
    items: [
      { name: "Design security solutions aligned with the Cloud Adoption Framework (CAF) and Well-Architected Framework (WAF)", date: "Feb 2026" },
      { name: "Introduction to Zero Trust and best practice frameworks", date: "Feb 2026" },
      { name: "Manage Microsoft Entra Identity Protection", date: "Feb 2026" },
      { name: "Introduction to GitHub Advanced Security", date: "Feb 2026" },
    ],
  },
  {
    issuer: "Meta Blueprint",
    items: [
      { name: "Technical implementation of the Meta Pixel", date: "Feb 2026" },
      { name: "Get started with product catalogs on Meta technologies", date: "Feb 2026" },
    ],
  },
];

export const certificationCount = certificationGroups.reduce((n, g) => n + g.items.length, 0);

export const CERTS_URL = `${identity.linkedin}/details/certifications/`;

export const workforceiq = {
  slug: "workforceiq",
  name: "WorkforceIQ",
  tagline: "Workforce management for a multi-brand restaurant group — 370+ staff, end to end.",
  period: "Jun – Jul 2026",
  builtAt: "K. Girdharlal International Ltd. / Bookends Hospitality",
  role: "Designed and built it",
  repo: "https://github.com/prathamgosai/staff-management",
  /** §10 Q6 answered: architecture diagram only. No screenshots, no demo URL. */
  screenshots: [] as string[],
  demoUrl: null as string | null,
  outcomes: [
    "Covers the complete employee lifecycle for 370+ staff across multiple brands and outlets.",
    "Auto-generates weekly rosters from 3 rotating shift templates, with manual overrides that survive future rotations.",
    "Runs a live-editable role→permission matrix across 6 account types.",
  ],
  features: [
    {
      title: "Auto-scheduling engine",
      body: "Generates weekly rosters from three rotating shift templates across seven days. Per-staff manual overrides survive future rotations, so a one-off arrangement isn't silently overwritten next week.",
    },
    {
      title: "Role-based access control",
      body: "A database-backed role→permission matrix across six account types, editable live rather than hardcoded and redeployed.",
    },
    {
      title: "Attendance, leave & allocation",
      body: "Modules covering attendance, leave requests, staff allocation, and a performance dashboard — the day-to-day operations of the group.",
    },
    {
      title: "WhatsApp & email notifications",
      body: "Rosters and updates reach staff on WhatsApp via the Meta Graph API, with email as the second channel.",
    },
    {
      title: "Demand forecasting service",
      body: "A Python/FastAPI microservice that forecasts staffing demand with ML, so scheduling can be planned against expected load.",
    },
    {
      title: "Light/dark theming",
      body: "Full light and dark theming built on semantic design tokens rather than one-off color values.",
    },
  ],
  stack: [
    "TypeScript",
    "Next.js",
    "React",
    "NestJS",
    "Node.js",
    "PostgreSQL",
    "Redis",
    "Python",
    "FastAPI",
    "Tailwind CSS",
    "TanStack Query",
    "Turborepo",
  ],
};

/**
 * §1: study repos and curated collections. NEVER presented as original work.
 * Repos with unconfirmed descriptions (WifiPlus, Cost-Crafting-Restaurant-,
 * AI-Agent) are deliberately absent — §10 Q7 is unanswered. Do not add them
 * until Pratham supplies honest one-line descriptions.
 */
export const learningInPublic = [
  {
    name: "Scratch-LLM",
    kind: "Study repo",
    body: "Working through building a large language model from scratch, following a public book.",
    href: "https://github.com/prathamgosai/Scratch-LLM",
  },
  {
    name: "Hands-on-LLM",
    kind: "Study repo",
    body: "Working through hands-on LLM fine-tuning exercises from a public course.",
    href: "https://github.com/prathamgosai/Hands-on-LLM",
  },
  {
    name: "kali-linux-CyberSecurity",
    kind: "Curated collection",
    body: "A curated collection of 30+ cybersecurity reports and whitepapers (CrowdStrike, IBM X-Force, ENISA, HackerOne, and others).",
    href: "https://github.com/prathamgosai/kali-linux-CyberSecurity",
  },
];

export const skills = [
  {
    group: "Infrastructure & Networking",
    items: ["Desktop support (L1/L2)", "Windows administration", "LAN/WAN", "Network troubleshooting", "NAS storage"],
  },
  {
    group: "Security",
    items: ["Cisco firewall basics", "System & network security", "Ethical hacking fundamentals", "Auth hardening (token rotation, rate limiting)"],
  },
  {
    group: "AI & Automation",
    items: ["Claude API", "Prompt design", "Workflow automation", "ML demand forecasting (FastAPI)"],
  },
  {
    group: "Full-Stack",
    items: ["TypeScript", "Next.js", "React", "NestJS", "Node.js", "PostgreSQL", "Redis", "Tailwind CSS", "TanStack Query", "Turborepo"],
  },
  {
    group: "Practices",
    items: ["Documentation", "Incident handling", "Reversible SQL migrations", "Monorepo tooling"],
  },
];

/**
 * FAQs — single source of truth for BOTH the visible FAQ accordion and the
 * FAQPage JSON-LD (faq-jsonld.tsx). Google requires the structured data to
 * match visible content, so they must never drift; keep them here only.
 */
export const faqs: { q: string; a: string }[] = [
  {
    q: "Who is Pratham Gosai?",
    a: `Pratham Gosai (full name Pratham Dharmeshbharti Gosai) is an IT & network engineer turned AI-automation and full-stack builder based in ${identity.location}. He shipped WorkforceIQ, a workforce platform for 370+ restaurant staff.`,
  },
  {
    q: "What is WorkforceIQ?",
    a: `${workforceiq.tagline} Pratham designed and built it end to end — auto-scheduling, six-role access control, attendance and leave, WhatsApp notifications, and a FastAPI service that forecasts staffing demand.`,
  },
  {
    q: "What technologies does Pratham Gosai work with?",
    a: `Infrastructure and networking (L1/L2 desktop support, Windows, LAN/WAN, firewalls, NAS), full-stack development (TypeScript, Next.js, React, NestJS, PostgreSQL, Redis), and AI automation with the Claude API and Python/FastAPI.`,
  },
  {
    q: "What certifications does Pratham Gosai hold?",
    a: `${certificationCount} certifications across Anthropic (Claude API development and AI Fluency), Cisco Networking Academy, Microsoft, and Meta.`,
  },
  {
    q: "Is Pratham Gosai available for hire?",
    a: `Yes. Pratham is based in ${identity.locationShort} and open to work in ${identity.openTo} — on-site, hybrid, or remote.`,
  },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company?: string;
  /** Optional public path, e.g. "/testimonials/name.jpg". */
  avatar?: string;
  /** Optional link — e.g. the LinkedIn recommendation. */
  href?: string;
};

/**
 * Real testimonials only. Empty by default so the section stays hidden until
 * genuine quotes are added — never fabricate social proof.
 */
export const testimonials: Testimonial[] = [];

/**
 * ─────────────────────────────────────────────────────────────
 * JOURNEY — the dated arc, for the scroll-driven timeline.
 * ─────────────────────────────────────────────────────────────
 *
 * NOT a new set of claims. Every entry below is assembled from dates that
 * already exist in this file, and the `source` field names where each one comes
 * from so it stays checkable:
 *
 *   2024-10 · 2025-07 · 2025-08 -> certificationGroups (Cisco Networking Academy)
 *   2025-09                     -> experience[1] (Premware Services India LLP)
 *   2026-02                     -> certificationGroups (Microsoft, Meta Blueprint)
 *   2026-03                     -> certificationGroups (Anthropic)
 *   2026-06                     -> experience[0] (K. Girdharlal / Bookends)
 *   2026-06 to 2026-07          -> workforceiq.period
 *
 * The B.Sc. IT is deliberately ABSENT. Its year was never supplied (§10 Q5), and
 * a timeline is the one component that cannot render an undated item honestly —
 * placing it anywhere would mean guessing. It stays on /experience, which does
 * not need a date to list it.
 *
 * `dateTime` must stay a valid <time datetime> value (YYYY-MM); that attribute
 * is what makes this list machine-readable rather than decorative.
 */
export type JourneyEntry = {
  id: string;
  /** Display label, e.g. "Oct 2024". */
  year: string;
  /** Machine-readable YYYY-MM for <time datetime>. */
  dateTime: string;
  org: string;
  title: string;
  blurb: string;
  /** Where in this file the entry is derived from — keep it accurate. */
  source: string;
  meta: { label: string; value: string }[];
};

export const journey: JourneyEntry[] = [
  {
    id: "foundations",
    year: "Oct 2024",
    dateTime: "2024-10",
    org: "Cisco Networking Academy",
    title: "Foundations",
    blurb:
      "Started at the bottom of the stack: how machines are built, how they break, and how attackers think about them.",
    source: "certificationGroups -> Cisco Networking Academy",
    meta: [
      { label: "Certified", value: "Introduction to Cybersecurity" },
      { label: "Also", value: "Computer Hardware Basics · Data Science" },
    ],
  },
  {
    id: "networking",
    year: "Aug 2025",
    dateTime: "2025-08",
    org: "Cisco Networking Academy",
    title: "The network layer",
    blurb:
      "Network types and components, standards and protocols, Ethernet, IPv4 and IPv6 addressing, routing, and connectivity troubleshooting.",
    source: "certificationGroups -> Networking Basics (Aug 2025), IoT (Jul 2025)",
    meta: [
      { label: "Certified", value: "Networking Basics" },
      { label: "Also", value: "Introduction to Internet of Things" },
    ],
  },
  {
    id: "premware",
    year: "Sep 2025",
    dateTime: "2025-09",
    org: "Premware Services India LLP",
    title: "Into the server room",
    blurb:
      "L1/L2 desktop and network support for end users: Windows machines, printers, peripherals, and the LAN/WAN they sit on. The job that makes the reliability claims credible rather than aspirational.",
    source: "experience[1]",
    meta: [
      { label: "Role", value: "Desktop & Network Engineer" },
      { label: "Status", value: "Ongoing" },
    ],
  },
  {
    id: "platform-security",
    year: "Feb 2026",
    dateTime: "2026-02",
    org: "Microsoft · Meta",
    title: "Identity, Zero Trust and platform",
    blurb:
      "Zero Trust and best-practice frameworks, Entra Identity Protection, GitHub Advanced Security, and security design aligned with the Cloud Adoption and Well-Architected Frameworks.",
    source: "certificationGroups -> Microsoft (4), Meta Blueprint (2)",
    meta: [
      { label: "Certified", value: "6 across Microsoft & Meta" },
      { label: "Focus", value: "Identity · Zero Trust · Supply chain" },
    ],
  },
  {
    id: "anthropic",
    year: "Mar 2026",
    dateTime: "2026-03",
    org: "Anthropic",
    title: "Building with Claude",
    blurb:
      "Claude API integration, prompt design, automating workflows and building AI features, plus the 4 Ds framework for using them responsibly.",
    source: "certificationGroups -> Anthropic",
    meta: [
      { label: "Certified", value: "Claude with the Anthropic API" },
      { label: "Also", value: "AI Fluency: Framework & Foundations" },
    ],
  },
  {
    id: "automation",
    year: "Jun 2026",
    dateTime: "2026-06",
    org: "K. Girdharlal International Ltd. / Bookends Hospitality",
    title: "Automating live operations",
    blurb:
      "Automating repetitive reservation and administrative work with AI workflows built on the Claude API, against a real hotel operation with real customers.",
    source: "experience[0]",
    meta: [
      { label: "Role", value: "AI Automation / Reservationist" },
      { label: "Status", value: "Ongoing" },
    ],
  },
  {
    id: "workforceiq",
    year: "Jun – Jul 2026",
    dateTime: "2026-06",
    org: "WorkforceIQ",
    title: "Shipped to production",
    blurb:
      "Designed and built the group's workforce platform end to end: 370+ staff, auto-generated rosters, a live role-to-permission matrix, and a FastAPI service that forecasts staffing demand.",
    source: "workforceiq",
    meta: [
      { label: "Scale", value: "370+ staff" },
      { label: "Stack", value: "TypeScript · NestJS · PostgreSQL · Python" },
    ],
  },
];

/**
 * CAPABILITIES — "What I build".
 *
 * Eight items, and every one is a re-cut of something already in this file
 * (`skills`, `whatIDo`, `experience[].bullets`, `workforceiq.features`). The
 * `source` field names which. Nothing here is a new capability claim; if a row
 * cannot name its source, it does not belong on the site.
 */
export type Capability = {
  title: string;
  body: string;
  tags: string[];
  source: string;
};

export const capabilities: Capability[] = [
  {
    title: "Desktop & endpoint support",
    body: "Installing, configuring and maintaining Windows desktops, laptops, printers and peripherals, and diagnosing them when they fail.",
    tags: ["Windows", "L1/L2", "Peripherals"],
    source: "experience[1].bullets",
  },
  {
    title: "Network operations",
    body: "Supporting LAN/WAN infrastructure, troubleshooting connectivity end to end, and keeping NAS storage available.",
    tags: ["LAN/WAN", "Troubleshooting", "NAS"],
    source: "skills[0]",
  },
  {
    title: "Security & access control",
    body: "Cisco firewall basics, system and network security, and auth hardening — token rotation and rate limiting — plus a live six-role permission matrix in production.",
    tags: ["Firewalls", "RBAC", "Auth hardening"],
    source: "skills[1] + workforceiq.features",
  },
  {
    title: "Full-stack web development",
    body: "TypeScript across the stack: Next.js and React on the front, NestJS and Node on the back, in a Turborepo monorepo.",
    tags: ["TypeScript", "Next.js", "NestJS"],
    source: "skills[3] + whatIDo[1]",
  },
  {
    title: "Databases & migrations",
    body: "Raw parameterised SQL and reversible migrations over PostgreSQL, because I want to know exactly what runs against the database.",
    tags: ["PostgreSQL", "SQL", "Migrations"],
    source: "whatIDo[1] + skills[4]",
  },
  {
    title: "AI automation",
    body: "Automating real operational work with the Claude API: prompt design, workflow automation, and the judgement to know what not to automate.",
    tags: ["Claude API", "Prompt design", "Workflows"],
    source: "skills[2] + experience[0].bullets",
  },
  {
    title: "ML services",
    body: "A Python/FastAPI microservice that forecasts staffing demand, so scheduling can be planned against expected load rather than guessed.",
    tags: ["Python", "FastAPI", "Forecasting"],
    source: "skills[2] + workforceiq.features",
  },
  {
    title: "Documentation & incident handling",
    body: "Writing incidents down so the next person does not start from zero, and running preventive maintenance before it becomes an incident.",
    tags: ["Runbooks", "Incidents", "Maintenance"],
    source: "skills[4] + experience[1].bullets",
  },
];

/**
 * WAYS OF WORKING.
 *
 * This is the "how do we work together" slot. It is NOT a services or pricing
 * section and must not become one: asked directly what he wanted to offer,
 * Pratham selected full-time employment only — no freelance builds, no retail
 * packages. Every mode here is read straight out of `identity.availability`
 * ("Dubai, UAE · Surat, India · open to on-site, hybrid, remote").
 *
 * If that ever changes, change `identity` first and let this follow.
 */
export const waysOfWorking = [
  {
    mode: "On-site",
    body: "In the building, on the floor, hands on the hardware. How the L1/L2 work has always been done.",
  },
  {
    mode: "Hybrid",
    body: "On-site for the infrastructure that needs a person in the room, remote for the software layer.",
  },
  {
    mode: "Remote",
    body: "Full-stack and AI automation work, delivered against a real backlog with real deadlines.",
  },
];

/**
 * PROJECT REGISTRY.
 *
 * The "selected work" surface reads from here rather than from JSX, so adding a
 * project is a data edit. Two entries, and the constraint that keeps it at two
 * is documented rather than implied:
 *
 *  - WifiPlus is now INCLUDED. §10 Q7 blocked it because no honest description
 *    existed; the description below is taken from the live site's own copy and
 *    feature list (wifiplus.prathamgosai.in) and the public repo, both read
 *    directly rather than recalled. Its `year` is null because neither source
 *    states one — see the note on the type.
 *  - Cost-Crafting-Restaurant- and AI-Agent remain ABSENT. §10 Q7 is still
 *    unanswered for those two, and nothing has been supplied or published that
 *    would let a description be written honestly.
 *  - `learningInPublic` stays a separate array on purpose. §1: study repos are
 *    NEVER presented as original work, and the way to guarantee that is to keep
 *    them out of the structure that renders "work".
 *
 * `caseStudy` is null when no deep write-up exists. A null must render as an
 * absent link, never as a dead one.
 */
export type Project = {
  slug: string;
  name: string;
  /** Null when the year is not confirmed — the row omits it rather than guess. */
  year: string | null;
  category: string;
  tagline: string;
  stack: string[];
  /** Internal case-study route, or null when none exists yet. */
  caseStudy: string | null;
  repo: string | null;
  live: string | null;
};

export const projects: Project[] = [
  {
    slug: workforceiq.slug,
    name: workforceiq.name,
    year: "2026",
    category: "Workforce platform",
    tagline: workforceiq.tagline,
    stack: workforceiq.stack.slice(0, 6),
    caseStudy: `/projects/${workforceiq.slug}`,
    repo: workforceiq.repo,
    live: workforceiq.demoUrl,
  },
  {
    slug: "wifiplus",
    name: "WifiPlus",
    // Neither the live site nor the repo states a build year. Omitted, not guessed.
    year: null,
    category: "Network diagnostics",
    tagline:
      "Browser-based network diagnostics: download and upload speed, ping, jitter, packet loss, DNS latency and bufferbloat grading — measured, graded, and compared against an ISP database by region.",
    // The stack the site itself publishes, narrowed to the load-bearing six so
    // the row carries the same visual weight as the others.
    stack: ["TypeScript", "Next.js", "React", "Node.js", "PostgreSQL", "Redis"],
    caseStudy: null,
    repo: "https://github.com/prathamgosai/WifiPlus",
    live: "https://wifiplus.prathamgosai.in/",
  },
  {
    slug: "portfolio",
    name: "This site",
    year: "2026",
    category: "Personal site",
    tagline:
      "The site you are reading. Next.js App Router, a hand-built design system on Tailwind v4 tokens, dual themes checked to WCAG AA, a strict Content-Security-Policy, and no animation library.",
    stack: ["TypeScript", "Next.js", "React", "Tailwind CSS", "CSS", "Vercel Analytics"],
    caseStudy: null,
    repo: null,
    live: SITE_URL,
  },
];
