"use client";

import Image from "next/image";
import Link from "next/link";
import { CountUp, Glass, Settle, Typewriter } from "@/components/noc/glass";
import {
  certificationCount,
  certificationGroups,
  education,
  experience,
  hero,
  identity,
  skills,
  stats,
  whatIDo,
  workforceiq,
} from "@/data/portfolio";
import type { PostMeta } from "@/lib/posts";

/** Section header rendered as a shell command — the recurring NOC motif. */
function Cmd({ children }: { children: string }) {
  return (
    <p className="mono mb-6 text-[13px] text-[#00ff88]">
      <span className="text-[#64748b]">$ </span>
      {children}
    </p>
  );
}

function Chip({ label, accent = "#00f0ff" }: { label: string; accent?: string }) {
  return (
    <span
      className="mono rounded-full px-2.5 py-1 text-[11px] text-[#e2e8f0]"
      style={{ boxShadow: `inset 0 0 0 1px ${accent}44, inset 0 1px 0 rgba(255,255,255,.12)` }}
    >
      {label}
    </span>
  );
}

/* ── HERO ──────────────────────────────────────────────────────────────── */

export function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[100svh] max-w-6xl items-center px-4 pb-16 pt-28 sm:px-6">
      <Glass accent="cyan" tilt maxTilt={5} lift={false} className="w-full px-6 py-10 sm:px-10 sm:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="mono flex items-center gap-2 text-[12px] text-[#00ff88]">
              <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[#00ff88]" />
              &gt; SYSTEM STATUS: ONLINE
            </p>

            <h1 className="etched mt-5 text-[clamp(1.9rem,4.6vw,3.35rem)] font-bold leading-[1.08] tracking-tight text-[#e2e8f0]">
              <Typewriter text={hero.headline} />
            </h1>

            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[#94a3b8]">{hero.sub}</p>

            <dl className="mono mt-7 space-y-1 text-[12px] text-[#64748b]">
              <div>
                <span className="text-[#0078d4]">OPERATOR</span> :: {identity.name.toUpperCase()}
              </div>
              <div>
                <span className="text-[#8b5cf6]">CLEARANCE</span> :: MULTI-PLATFORM SYSADMIN / AI ARCHITECT
              </div>
              <div>
                <span className="text-[#00f0ff]">NODE</span> :: SURAT, IN // STATUS:{" "}
                <span className="text-[#00ff88]">DEPLOY READY</span>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#layer2"
                className="glass glass-cyan mono flex min-h-11 items-center rounded-full px-5 text-[13px] text-[#00f0ff] transition hover:bg-[#00f0ff]/10"
              >
                [ ACCESS PORTFOLIO <span className="cursor-blink" /> ]
              </a>
              <a
                href="#contact"
                className="glass glass-magenta mono flex min-h-11 items-center rounded-full px-5 text-[13px] text-[#ff006e] transition hover:bg-[#ff006e]/10"
              >
                [ CONTACT ]
              </a>
            </div>
          </div>

          {/* Portrait as a network node — hexagonal, edge-lit. */}
          <div className="relative mx-auto w-[min(78vw,20rem)]">
            <div className="hex overflow-hidden bg-[#0078d4]/25 p-[2px]">
              <div className="hex overflow-hidden">
                <Image
                  src={identity.photo.src}
                  alt={`${identity.name}, ${identity.jobTitle}`}
                  width={identity.photo.width}
                  height={identity.photo.height}
                  priority
                  sizes="(max-width: 640px) 78vw, 20rem"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="mono mt-5 flex flex-wrap justify-center gap-2 text-[11px]">
              <Chip label={`${certificationCount} CERTS`} accent="#ffb800" />
              <Chip label="370+ STAFF" accent="#00ff88" />
              <Chip label="10+ MONTHS" accent="#0078d4" />
            </div>
          </div>
        </div>
      </Glass>
    </section>
  );
}

/* ── STATS ─────────────────────────────────────────────────────────────── */

const STAT_ACCENTS = ["#00ff88", "#0078d4", "#ffb800", "#8b5cf6"] as const;

export function StatsBar() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <Settle>
        <Glass accent="blue" lift={false} className="grid gap-6 px-6 py-7 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const num = parseInt(s.value, 10);
            const suffix = s.value.replace(/^\d+/, "");
            return (
              <div key={s.label}>
                <p
                  className="etched text-[2.1rem] font-bold leading-none"
                  style={{ color: STAT_ACCENTS[i], textShadow: `0 0 26px ${STAT_ACCENTS[i]}66` }}
                >
                  <CountUp value={num} suffix={suffix} />
                </p>
                <p className="mt-2 text-[13px] leading-snug text-[#64748b]">{s.label}</p>
              </div>
            );
          })}
        </Glass>
      </Settle>
    </section>
  );
}

/* ── LAYER 1: capabilities / physical infrastructure ───────────────────── */

const PILLARS = [
  {
    accent: "cyan" as const,
    color: "#00f0ff",
    terminal: "ping 192.168.1.1 ... OK",
    tags: skills[0].items,
  },
  {
    accent: "magenta" as const,
    color: "#ff006e",
    terminal: "firewall --status ... ACTIVE",
    tags: skills[1].items,
  },
  {
    accent: "green" as const,
    color: "#00ff88",
    terminal: "claude-api --automate ... RUNNING",
    tags: skills[2].items,
  },
];

export function Layer1() {
  return (
    <section id="layer1" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Cmd>cat capabilities.md</Cmd>
      <div className="grid gap-5 lg:grid-cols-3">
        {whatIDo.map((pillar, i) => {
          const p = PILLARS[i];
          return (
            <Settle key={pillar.title} delay={i * 90}>
              <Glass accent={p.accent} tilt className="h-full px-6 py-7">
                <p className="mono text-[11px]" style={{ color: p.color }}>
                  {`0${i + 1} //`}
                </p>
                <h3 className="etched noc-caps mt-3 text-[15px] font-semibold text-[#e2e8f0]">{pillar.title}</h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[#94a3b8]">{pillar.body}</p>

                <p
                  className="mono mt-5 rounded-lg px-3 py-2 text-[11px]"
                  style={{
                    color: p.color,
                    boxShadow: `inset 0 0 0 1px ${p.color}33`,
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  <span className="text-[#64748b]">$ </span>
                  {p.terminal}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <Chip key={t} label={t} accent={p.color} />
                  ))}
                </div>
              </Glass>
            </Settle>
          );
        })}
      </div>

      {/* Certification seal — a red medallion pooling light on the void. */}
      <Settle delay={140}>
        <div className="mt-8 flex justify-center">
          <Glass accent="magenta" lift={false} className="flex items-center gap-5 px-7 py-5">
            <span
              className="etched text-[2.6rem] font-bold leading-none text-[#ff006e]"
              style={{ textShadow: "0 0 34px rgba(255,0,110,.8)" }}
            >
              {certificationCount}
            </span>
            <span className="mono text-[11px] leading-relaxed text-[#64748b]">
              CERTIFICATIONS SEALED
              <br />
              ANTHROPIC · CISCO · MICROSOFT · META
            </span>
          </Glass>
        </div>
      </Settle>
    </section>
  );
}

/* ── LAYER 2: WorkforceIQ ──────────────────────────────────────────────── */

export function Layer2() {
  return (
    <section id="layer2" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Cmd>ls projects/ → workforceiq.ts</Cmd>

      <Settle>
        <Glass accent="green" tilt maxTilt={4} lift={false} className="px-6 py-9 sm:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h2 className="etched text-[clamp(1.6rem,3vw,2.3rem)] font-bold tracking-tight text-[#e2e8f0]">
                {workforceiq.name}
              </h2>
              <p className="mono mt-2 text-[12px] text-[#64748b]">
                {workforceiq.period} · {workforceiq.builtAt}
              </p>
              <p className="mt-4 text-[16px] leading-relaxed text-[#94a3b8]">{workforceiq.tagline}</p>

              <ul className="mono mt-6 space-y-2 text-[13px] leading-relaxed text-[#94a3b8]">
                {workforceiq.outcomes.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="shrink-0 text-[#00ff88]">&gt;</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {workforceiq.stack.map((t) => (
                  <Chip key={t} label={t} accent="#00ff88" />
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={workforceiq.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="glass glass-green mono flex min-h-11 items-center rounded-full px-5 text-[13px] text-[#00ff88]"
                >
                  [ REPOSITORY ]
                </a>
                <Link
                  href={`/projects/${workforceiq.slug}`}
                  className="glass glass-cyan mono flex min-h-11 items-center rounded-full px-5 text-[13px] text-[#00f0ff]"
                >
                  [ CASE STUDY ]
                </Link>
              </div>
            </div>

            {/* Feature stack at varying Z-depth — the architectural blueprint. */}
            <ul className="space-y-3">
              {workforceiq.features.map((f, i) => (
                <li
                  key={f.title}
                  className="glass glass-cyan glass-lift scan px-5 py-4"
                  style={{ marginLeft: `${(i % 3) * 10}px` }}
                >
                  <p className="mono text-[11px] text-[#00f0ff]">MODULE_{String(i + 1).padStart(2, "0")}</p>
                  <p className="etched mt-1 text-[14px] font-semibold text-[#e2e8f0]">{f.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748b]">{f.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Glass>
      </Settle>
    </section>
  );
}

/* ── LAYER 3: cloud & AI shards + experience timeline ──────────────────── */

export function Layer3() {
  return (
    <section id="layer3" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Cmd>git log --oneline</Cmd>

      <ol className="relative space-y-5 border-l border-[#00f0ff]/25 pl-6 sm:pl-8">
        {experience.map((role, i) => (
          <Settle key={role.role} delay={i * 90}>
            <li className="relative">
              <span
                className="pulse-dot absolute -left-[31px] top-6 h-2.5 w-2.5 rounded-full bg-[#00f0ff] sm:-left-[39px]"
                aria-hidden
              />
              <Glass accent="violet" tilt className="px-6 py-6">
                <p className="mono text-[11px] text-[#8b5cf6]">
                  [{role.period.replace(/\s/g, "")}] {role.current && <span className="text-[#00ff88]">· ACTIVE</span>}
                </p>
                <h3 className="etched mt-2 text-[17px] font-semibold text-[#e2e8f0]">{role.role}</h3>
                <p className="mt-1 text-[13px] text-[#64748b]">
                  {role.company} · {role.employment} · {role.location}
                </p>
                <ul className="mono mt-4 space-y-1.5 text-[13px] leading-relaxed text-[#94a3b8]">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="shrink-0 text-[#00f0ff]">→</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </Glass>
            </li>
          </Settle>
        ))}
      </ol>

      <div className="mt-14">
        <Cmd>cat education.log</Cmd>
        <div className="grid gap-4 sm:grid-cols-2">
          {education.map((e, i) => (
            <Settle key={e.title} delay={i * 90}>
              <Glass accent="blue" tilt className="scan h-full px-6 py-5">
                <p className="etched text-[15px] font-semibold text-[#e2e8f0]">{e.title}</p>
                <p className="mt-1 text-[13px] text-[#64748b]">{e.org}</p>
                <p className="mono mt-2 text-[11px] text-[#0078d4]">{e.detail}</p>
              </Glass>
            </Settle>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <Cmd>neofetch --skills</Cmd>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <Settle key={group.group} delay={i * 70}>
              <Glass accent="violet" tilt className="h-full px-5 py-5">
                <p className="mono noc-caps text-[11px] text-[#8b5cf6]">{group.group}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((s) => (
                    <Chip key={s} label={s} accent="#8b5cf6" />
                  ))}
                </div>
              </Glass>
            </Settle>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── LAYER 4: certification vault ──────────────────────────────────────── */

const ISSUER_COLOR: Record<string, string> = {
  Anthropic: "#8b5cf6",
  "Cisco Networking Academy": "#ffb800",
  Microsoft: "#0078d4",
  "Meta Blueprint": "#00f0ff",
};

export function Layer4() {
  return (
    <section id="layer4" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Cmd>{`ls certifications/ | wc -l → ${certificationCount}`}</Cmd>

      <div className="space-y-10">
        {certificationGroups.map((group) => {
          const color = ISSUER_COLOR[group.issuer] ?? "#00f0ff";
          return (
            <div key={group.issuer}>
              <p className="mono noc-caps mb-4 text-[11px]" style={{ color }}>
                ── {group.issuer} · {group.items.length}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((cert, i) => (
                  <Settle key={cert.name} delay={i * 60}>
                    <Glass accent="amber" tilt className="scan h-full px-5 py-5" >
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className="mt-1 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                          aria-hidden
                        />
                        <p className="mono text-[10px] text-[#00ff88]">AUTHENTICATED</p>
                      </div>
                      <p className="etched mt-3 text-[14px] font-semibold leading-snug text-[#e2e8f0]">{cert.name}</p>
                      {cert.date && <p className="mono mt-1.5 text-[11px] text-[#64748b]">{cert.date}</p>}
                      {cert.detail && (
                        <p className="mt-2 text-[12.5px] leading-relaxed text-[#64748b]">{cert.detail}</p>
                      )}
                      {cert.credentialId && (
                        <p className="mono mt-3 text-[10px] text-[#64748b]">ID :: {cert.credentialId}</p>
                      )}
                      {cert.verifyUrl && (
                        <a
                          href={cert.verifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mono mt-3 inline-flex min-h-11 items-center text-[11px] text-[#00f0ff] hover:underline"
                        >
                          → verify()
                        </a>
                      )}
                    </Glass>
                  </Settle>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── LAYER 5: transmission log ─────────────────────────────────────────── */

export function Layer5({ posts }: { posts: PostMeta[] }) {
  return (
    <section id="layer5" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Cmd>{`tail -n ${posts.length} blog.log`}</Cmd>

      <Settle>
        <Glass accent="cyan" lift={false} className="fiber max-h-[34rem] overflow-y-auto px-6 py-7">
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="glass glass-cyan glass-lift scan block px-5 py-4">
                  <p className="mono text-[12px] text-[#00ff88]">
                    [ OK ] <span className="text-[#64748b]">{post.date}</span>
                  </p>
                  <p className="etched mt-1.5 text-[15px] font-semibold text-[#e2e8f0]">{post.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748b]">{post.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/blog" className="mono mt-5 inline-flex min-h-11 items-center text-[12px] text-[#00f0ff]">
            all posts →
          </Link>
        </Glass>
      </Settle>
    </section>
  );
}

/* ── CONTACT: handshake protocol ───────────────────────────────────────── */

const CHANNELS = [
  { label: "EMAIL", value: identity.email, href: `mailto:${identity.email}`, color: "#00ff88" },
  { label: "LINKEDIN", value: "in/pratham-gosai", href: identity.linkedin, color: "#0078d4" },
  { label: "GITHUB", value: "prathamgosai", href: identity.github, color: "#00f0ff" },
  { label: "INSTAGRAM", value: "pratham__gosai_", href: identity.instagram, color: "#ff006e" },
];

export function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <Cmd>./handshake --init</Cmd>

      <Settle>
        <Glass accent="magenta" tilt maxTilt={4} lift={false} className="px-6 py-10 text-center sm:px-10">
          <h2 className="etched mx-auto max-w-2xl text-[clamp(1.5rem,3.2vw,2.3rem)] font-bold leading-tight text-[#e2e8f0]">
            Looking for someone who can build it — and keep it running?
          </h2>
          <p className="mono mt-4 text-[13px] text-[#64748b]">{identity.availability}</p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHANNELS.map((c) => (
              <a
                key={c.label}
                href={c.href ?? undefined}
                target={c.href?.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="glass glass-lift scan flex min-h-11 flex-col items-center gap-1 px-4 py-5"
                style={{ ["--tint" as string]: `${c.color}88` }}
              >
                <span className="mono text-[10px]" style={{ color: c.color }}>
                  {c.label}
                </span>
                <span className="mono text-[12px] text-[#e2e8f0]">{c.value}</span>
              </a>
            ))}
          </div>

          {identity.resumePdf && (
            <a
              href={identity.resumePdf}
              className="glass glass-amber mono mt-8 inline-flex min-h-11 items-center rounded-full px-6 text-[13px] text-[#ffb800]"
            >
              [ DOWNLOAD RESUME ]
            </a>
          )}
        </Glass>
      </Settle>
    </section>
  );
}
