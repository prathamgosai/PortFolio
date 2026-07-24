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
  photo: { src: "/pratham.jpeg", width: 960, height: 1068 },
};

export const hero = {
  headline: "I build AI-powered systems — and I know what keeps them running.",
  sub: "Desktop & network engineer turned full-stack builder in Surat, India. I built WorkforceIQ — an AI-assisted workforce platform for 370+ restaurant staff — and I automate real operations with the Claude API.",
};

/** §3: approved proof-bar stats. These four only. */
export const stats = [
  { value: "370+", label: "staff on a platform I built end-to-end" },
  { value: "10+", label: "months of hands-on L1/L2 desktop & network support" },
  { value: "14", label: "certifications from Anthropic, Cisco, Microsoft & Meta" },
  { value: "6", label: "role RBAC system running in production" },
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
