import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LabShell } from "@/components/lab/lab-shell";
import { SystemGraph } from "@/components/lab/system-graph";
import { TechConstellation } from "@/components/lab/tech-constellation";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import {
  systemNodes,
  systemEdges,
  workforceNodes,
  workforceEdges,
} from "@/data/lab";
import {
  certificationCount,
  certificationGroups,
  experience,
  identity,
  stats,
  whatIDo,
  workforceiq,
} from "@/data/portfolio";
import { getAllPosts } from "@/lib/posts";
import "./lab.css";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "An interactive view of the systems behind the work — network, infrastructure, application and AI, as one connected environment.",
  alternates: { canonical: "/lab" },
};

/**
 * ═════════════════════════════════════════════════════════════════════════
 * /lab — the immersive surface.
 * ═════════════════════════════════════════════════════════════════════════
 *
 * A second, experimental presentation of the same facts the main site carries.
 * It does NOT replace the portfolio: the editorial site stays the thing a
 * recruiter reads, and this is the thing that shows what the person reading
 * about can actually build. Both are indexed, both are canonical to themselves.
 *
 * ── This page is a server component, deliberately ──
 * Everything below is server-rendered HTML. `<LabShell/>` wraps it and adds the
 * canvas, the section observer and the menu, but it never owns the content.
 * That is the rule the whole surface is built on: WebGL/canvas is the visual
 * layer, the document is the information layer. Nothing here is only visible if
 * a canvas initialises — which is what keeps it indexable, screen-readable, and
 * intact on a device where the graphics stack gives up.
 *
 * Every fact is read from `portfolio.ts`. See `data/lab.ts` for why the
 * diagrams may not name a technology the data file does not already claim.
 */
export default function LabPage() {
  const posts = getAllPosts();
  const current = experience.filter((role) => role.current);

  return (
    <LabShell>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Lab", path: "/lab" },
        ]}
      />

      {/* ── 01 · IDENTITY ─────────────────────────────────────────────── */}
      <section id="identity" className="lab-section lab-section--hero">
        <p className="lab-eyebrow">
          <span className="status-pulse-emerald" />
          {identity.jobTitle}
        </p>

        <h1 className="lab-display">
          <span>I build systems</span>
          <span>that work in the</span>
          <span>real world.</span>
        </h1>

        <p className="lab-lede">{identity.oneLine}</p>

        <ul className="lab-metrics">
          {stats.map((stat) => (
            <li key={stat.label}>
              <span className="lab-metric__value">{stat.value}</span>
              <span className="lab-metric__label">{stat.label}</span>
            </li>
          ))}
        </ul>

        <p className="lab-hint" aria-hidden>
          Scroll to explore
        </p>
      </section>

      {/* ── 02 · LAYERS ───────────────────────────────────────────────── */}
      <section id="layers" className="lab-section" aria-labelledby="layers-title">
        <p className="lab-label">02 — Layers</p>
        <h2 id="layers-title" className="lab-statement">
          <span>Three layers.</span>
          <span>One job.</span>
        </h2>

        <ol className="lab-layers">
          {whatIDo.map((item, i) => (
            <li key={item.title} className="lab-layer">
              <span aria-hidden className="lab-layer__num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="lab-layer__title">{item.title}</h3>
                <p className="lab-layer__body">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 03 · SYSTEM ───────────────────────────────────────────────── */}
      <section id="system" className="lab-section" aria-labelledby="system-title">
        <p className="lab-label">03 — System</p>
        <h2 id="system-title" className="lab-statement">
          <span>The whole path,</span>
          <span>endpoint to automation.</span>
        </h2>
        <p className="lab-lede lab-lede--tight">
          Most people work at one altitude. This is the range I actually cover — the cable, the box,
          the service on it, and the model calling that service.
        </p>

        <SystemGraph
          nodes={systemNodes}
          edges={systemEdges}
          caption="Endpoints through network and security to the application layer, and on to AI-driven automation."
          description="A system diagram. Endpoints connect to the network, which connects both to security (firewalls and identity) and to the API. The API connects to a PostgreSQL database, a Redis queue, and the Next.js interface, and also to the Claude API. Both the AI layer and the Redis queue feed automation of live operations."
        />
      </section>

      {/* ── 04 · WORKFORCEIQ ──────────────────────────────────────────── */}
      <section id="workforceiq" className="lab-section" aria-labelledby="wiq-title">
        <p className="lab-label label-signal">04 — Featured build</p>

        <div className="lab-wiq-head">
          <h2 id="wiq-title" className="lab-display lab-display--sm">
            <span>WorkforceIQ</span>
          </h2>
          <p className="lab-wiq-figure">
            <span className="lab-wiq-figure__value">370+</span>
            <span className="lab-wiq-figure__label">staff, end to end</span>
          </p>
        </div>

        <p className="lab-lede lab-lede--tight">{workforceiq.tagline}</p>

        <SystemGraph
          nodes={workforceNodes}
          edges={workforceEdges}
          caption="The WorkforceIQ architecture — web, API, data, forecasting and delivery."
          description="The WorkforceIQ architecture. A Next.js web client calls a NestJS API. The API writes to PostgreSQL, pushes background work to Redis, and calls a Python FastAPI forecasting service, which in turn reads history from PostgreSQL. The Redis queue dispatches notifications to WhatsApp via the Meta Graph API and to email as a second channel."
        />

        <ul className="lab-outcomes">
          {workforceiq.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>

        <p className="lab-actions">
          <Link href={`/projects/${workforceiq.slug}`} className="lab-action" data-cursor="Read">
            Read the full case study
            <ArrowUpRight aria-hidden />
          </Link>
          <a
            href={workforceiq.repo}
            target="_blank"
            rel="noreferrer"
            className="lab-action lab-action--quiet"
            data-cursor="Open"
          >
            View repository
            <ArrowUpRight aria-hidden />
          </a>
        </p>
      </section>

      {/* ── 05 · AUTOMATION ───────────────────────────────────────────── */}
      <section id="automation" className="lab-section" aria-labelledby="auto-title">
        <p className="lab-label">05 — Automation</p>
        <h2 id="auto-title" className="lab-statement">
          <span>Automate the work,</span>
          <span>not the judgement.</span>
        </h2>

        <div className="lab-flow" role="list" aria-label="Automation pipeline">
          {[
            { step: "Input", body: "Reservation and administrative work arriving from a live operation." },
            { step: "Claude API", body: "Prompt-designed workflows that read the request and draft the action." },
            { step: "Discernment", body: "The 4 Ds framework — what gets delegated, and what does not." },
            { step: "Action", body: "Records updated, responses sent, content and bookings kept current." },
          ].map((stage, i) => (
            <div key={stage.step} role="listitem" className="lab-flow__stage">
              <span aria-hidden className="lab-flow__index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="lab-flow__title">{stage.step}</h3>
              <p className="lab-flow__body">{stage.body}</p>
            </div>
          ))}
        </div>

        <p className="lab-note">
          Certified by Anthropic in both Claude API development and AI Fluency. The forecasting
          service in WorkforceIQ is the same instinct applied to scheduling — plan against expected
          load rather than guess.
        </p>
      </section>

      {/* ── 06 · STACK ────────────────────────────────────────────────── */}
      <section id="stack" className="lab-section" aria-labelledby="stack-title">
        <p className="lab-label">06 — Stack</p>
        <h2 id="stack-title" className="lab-statement">
          <span>Everything I operate</span>
          <span>and everything I build with.</span>
        </h2>
        <TechConstellation />
      </section>

      {/* ── 07 · RECORD ───────────────────────────────────────────────── */}
      <section id="record" className="lab-section" aria-labelledby="record-title">
        <p className="lab-label">07 — Record</p>
        <h2 id="record-title" className="lab-statement">
          <span>Verifiable,</span>
          <span>not asserted.</span>
        </h2>

        <div className="lab-record">
          <div>
            <h3 className="lab-record__head">Currently</h3>
            <ul className="lab-record__list">
              {current.map((role) => (
                <li key={role.company}>
                  <p className="lab-record__role">{role.role}</p>
                  <p className="lab-record__org">{role.company}</p>
                  <p className="lab-record__meta">
                    {role.period} · {role.location}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="lab-record__head">
              {certificationCount} certifications
            </h3>
            <ul className="lab-record__issuers">
              {certificationGroups.map((group) => (
                <li key={group.issuer}>
                  <span className="lab-record__issuer">{group.issuer}</span>
                  <span className="lab-record__count">{group.items.length}</span>
                </li>
              ))}
            </ul>
            <Link href="/experience" className="lab-inline-link" data-cursor="Read">
              Every credential, with verification links
              <ArrowUpRight aria-hidden />
            </Link>
          </div>

          {posts.length > 0 ? (
            <div>
              <h3 className="lab-record__head">Writing</h3>
              <ul className="lab-record__posts">
                {posts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`} data-cursor="Read">
                      <span className="lab-record__date">{post.date}</span>
                      <span className="lab-record__title">{post.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── 08 · CONTACT ──────────────────────────────────────────────── */}
      <section id="contact" className="lab-section lab-section--end" aria-labelledby="contact-title">
        <p className="lab-label">08 — Contact</p>
        <h2 id="contact-title" className="lab-display lab-display--sm">
          <span>Build something</span>
          <span>that matters.</span>
        </h2>

        <p className="lab-availability">
          Available for <strong>on-site</strong>, <strong>hybrid</strong> and <strong>remote</strong>{" "}
          — {identity.openTo}.
        </p>

        <ul className="lab-channels">
          {[
            identity.email
              ? { label: "Email", value: identity.email, href: `mailto:${identity.email}` }
              : null,
            { label: "LinkedIn", value: "pratham-gosai", href: identity.linkedin },
            { label: "GitHub", value: "prathamgosai", href: identity.github },
          ]
            .filter(Boolean)
            .map((channel) => {
              const c = channel as { label: string; value: string; href: string };
              const external = !c.href.startsWith("mailto:");
              return (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    data-cursor="Open"
                  >
                    <span className="lab-channel__label">{c.label}</span>
                    <span className="lab-channel__value">{c.value}</span>
                    <ArrowUpRight aria-hidden />
                  </a>
                </li>
              );
            })}
        </ul>

        <footer className="lab-foot">
          <p>
            {identity.name} — {identity.locationShort}
          </p>
          <Link href="/" className="lab-inline-link" data-cursor="Exit">
            Return to the main site
            <ArrowUpRight aria-hidden />
          </Link>
        </footer>
      </section>
    </LabShell>
  );
}
