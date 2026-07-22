import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { ChipRow, ButtonLink } from "@/components/ui";
import { Architecture } from "@/components/architecture";
import { BreadcrumbJsonLd } from "@/components/breadcrumb-jsonld";
import { identity, workforceiq } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "WorkforceIQ — a workforce platform for 370+ restaurant staff",
  description:
    "Case study: how I designed and built WorkforceIQ — auto-scheduling, six-role RBAC, WhatsApp notifications, and a FastAPI demand-forecasting service.",
  alternates: { canonical: "/projects/workforceiq" },
  openGraph: {
    type: "article",
    title: "WorkforceIQ — a workforce platform for 370+ restaurant staff",
    description:
      "Case study: auto-scheduling, six-role RBAC, WhatsApp notifications, and a FastAPI demand-forecasting service.",
    url: "/projects/workforceiq",
  },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="t-h2 mt-16 text-fg">{children}</h2>;
}

export default function WorkforceIQPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-20 sm:py-24">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Projects", path: "/projects" },
          { name: workforceiq.name, path: `/projects/${workforceiq.slug}` },
        ]}
      />
      <Link href="/projects" className="inline-flex items-center gap-1.5 t-small text-muted hover:text-fg">
        <ArrowLeft className="h-4 w-4" />
        All projects
      </Link>

      <header className="mt-8">
        <p className="label">Case study · {workforceiq.period}</p>
        <h1 className="t-hero mt-4 text-fg">{workforceiq.name}</h1>
        <p className="t-body measure mt-5 text-muted">{workforceiq.tagline}</p>
      </header>

      {/* TL;DR */}
      <dl className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2">
        {[
          { k: "What it is", v: "A full-stack workforce management platform" },
          { k: "For", v: "A multi-brand, multi-outlet restaurant group" },
          { k: "Scale", v: "370+ staff, complete employee lifecycle" },
          { k: "My role", v: workforceiq.role },
          { k: "Timeline", v: workforceiq.period },
          { k: "Built at", v: workforceiq.builtAt },
        ].map((row) => (
          <div key={row.k} className="bg-bg p-4">
            <dt className="label">{row.k}</dt>
            <dd className="t-small mt-1.5 text-fg">{row.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href={workforceiq.repo} external>
          View the repo
          <ArrowUpRight className="ml-1 inline h-4 w-4" />
        </ButtonLink>
        <ButtonLink href={identity.linkedin} variant="secondary" external>
          LinkedIn
          <ArrowUpRight className="ml-1 inline h-4 w-4" />
        </ButtonLink>
      </div>

      <div className="post mt-4">
        <H2>The problem</H2>
        <p>
          The group runs several restaurant brands across multiple outlets, and employs more than 370 people between
          them. When I arrived, the work of running that workforce was manual. Rosters were built by hand each week
          from the previous week&rsquo;s sheet. Staff records lived scattered across whatever file or notebook had
          been convenient at the time. Attendance, leave, and allocation each had their own informal process.
        </p>
        <p>
          That approach doesn&rsquo;t fail loudly. It fails quietly — a person rostered in two places, a day off that
          gets lost between versions, a new hire nobody adds to the sheet. Every one of those becomes someone&rsquo;s
          problem at the start of a shift, which is the worst possible time to discover it.
        </p>
        <p>
          I designed and built WorkforceIQ to cover the whole lifecycle in one place: directory, shift scheduling,
          attendance, leave, allocation, and demand forecasting.
        </p>

        <H2>What I built</H2>
        <ul>
          {workforceiq.features.map((feature) => (
            <li key={feature.title}>
              <strong>{feature.title}.</strong> {feature.body}
            </li>
          ))}
        </ul>

        <H2>Architecture</H2>
        <p>
          It&rsquo;s a pnpm + Turborepo monorepo: a NestJS API, a Next.js 14 + React 18 frontend, and a shared
          TypeScript package so both sides derive the same types and logic from one source. Redis handles job queues,
          and a separate Python/FastAPI microservice does the demand forecasting.
        </p>
      </div>

      <Architecture />

      <div className="post mt-4">
        <p>
          Two decisions in there are worth explaining, because they were choices rather than defaults.
        </p>
        <p>
          <strong>Raw parameterized SQL on PostgreSQL 16, rather than an ORM.</strong>{" "}Scheduling queries get
          genuinely complicated, and I wanted to read the exact query that runs rather than infer it from an
          abstraction. Parameterized means the safety is still there. When something is slow or wrong, I&rsquo;m
          debugging SQL I wrote, not SQL a library generated.
        </p>
        <p>
          <strong>Forecasting as a separate FastAPI service, rather than inside the API.</strong>{" "}The ML tooling lives
          in Python, and I didn&rsquo;t want model changes coupled to API deploys. The API asks the service what next
          week looks like; the scheduling engine plans against the answer. The two move independently.
        </p>
        <p>
          It&rsquo;s deployed to production on Render — API, web, and Redis — with PostgreSQL hosted on Supabase.
        </p>

        <H2>Security</H2>
        <p>
          This system holds records for hundreds of real people, so the auth work wasn&rsquo;t decoration.
        </p>
        <ul>
          <li>
            <strong>Single-use refresh-token rotation, SHA-256 hashed.</strong>{" "}A refresh token works exactly once and
            is replaced on use. Tokens are stored hashed, so a database read doesn&rsquo;t hand over usable
            credentials. If a stolen token is replayed, the reuse is detectable rather than silent.
          </li>
          <li>
            <strong>Rate limiting.</strong>{" "}The login endpoint is on the public internet. Rate limiting an API and
            writing a firewall rule are the same instinct in different vocabulary — decide what&rsquo;s allowed,
            decide how much, and assume something will try more.
          </li>
          <li>
            <strong>Forced password change on first login.</strong>{" "}Admin-set initial passwords get shared over
            WhatsApp and never changed. Forcing the change closes that window, at the cost of mild annoyance once.
          </li>
          <li>
            <strong>Audit trails on migrations.</strong>{" "}When someone asks why a record looks the way it does, the
            system can answer without archaeology.
          </li>
        </ul>

        <H2>Data honesty</H2>
        <p>
          WorkforceIQ was built for my employer and holds real employee data. I imported and cleaned that data through
          numbered, reversible SQL migrations with audit trails — not a one-off script run from a laptop. Numbered, so
          the order is knowable. Reversible, because &ldquo;we need to undo that import&rdquo; is a real sentence and
          the answer should never be that we can&rsquo;t.
        </p>
        <p>
          For the same reason, this case study covers architecture and features only. There are no screenshots and no
          demo link here, because that data isn&rsquo;t mine to show.
        </p>

        <H2>What I&rsquo;d improve next</H2>
        <p>
          Three things I&rsquo;d change, in the order I&rsquo;d do them:
        </p>
        <ul>
          <li>
            <strong>Model scheduling overrides as an append-only log from day one.</strong>{" "}I retrofitted audit
            trails, and retrofitting history onto a table that&rsquo;s been mutated in place means the history starts
            the day you added it — not the day the data started mattering.
          </li>
          <li>
            <strong>Move shared logic into the shared package earlier.</strong>{" "}Roster generation lived in the API
            longer than it should have, which meant the frontend couldn&rsquo;t preview a roster without a round trip.
          </li>
          <li>
            <strong>Put real integration tests around the notification path.</strong>{" "}WhatsApp delivery via the Meta
            Graph API is the part most likely to fail silently in production, and silent failure in a system people
            rely on for their shift times is the worst kind.
          </li>
        </ul>
      </div>

      <div className="mt-12 border-t border-rule pt-8">
        <p className="label">Stack</p>
        <div className="mt-3">
          <ChipRow items={workforceiq.stack} />
        </div>
      </div>
    </article>
  );
}
