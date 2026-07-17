import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui";
import { Topology } from "@/components/topology";
import { identity, skills } from "@/data/portfolio";

export const metadata: Metadata = {
  title: "About",
  description:
    "I started in the server room — desktops, LAN/WAN, firewalls, NAS. Then I learned the software layer and shipped WorkforceIQ. Based in Surat, India.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Section label="About" title="From the server room to production software.">
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="post">
            <p>
              I started in the server room. Desktops, laptops, printers, the LAN and WAN they sit on, firewall rules,
              NAS boxes — and real users with real problems on the other end of the phone. That job teaches you
              something a tutorial can&rsquo;t: what it actually costs when a system goes down, and how people behave
              when it does.
            </p>
            <p>
              Then I taught myself the layer above it. I built WorkforceIQ, a workforce platform now covering 370+
              staff across a multi-brand restaurant group — auto-scheduling, six-role RBAC, attendance and leave,
              WhatsApp notifications, and a FastAPI service that forecasts staffing demand. I designed it and shipped
              it to production.
            </p>
            <p>
              These days I also automate live hotel reservation and admin work with the Claude API, and I&rsquo;m
              certified by Anthropic in both Claude API development and AI Fluency.
            </p>
            <p>
              The two halves inform each other more than people expect. Rate limiting an API and writing a firewall
              rule are the same instinct. Reversible migrations and documented incidents are the same instinct. I
              build software the way I&rsquo;d want to support it at 11pm, because I&rsquo;ve been the person doing
              that.
            </p>
            <p>
              <strong>What I want next:</strong>{" "}a team where reliability and shipping both matter.
            </p>
          </div>

          <div>
            {identity.photo ? (
              <Image
                src={identity.photo.src}
                width={identity.photo.width}
                height={identity.photo.height}
                alt={`${identity.name}, ${identity.oneLine}`}
                sizes="(min-width: 1024px) 30rem, 100vw"
                className="mb-8 w-full rounded border border-rule object-cover"
              />
            ) : null}
            <Topology />
            <div className="mt-8 rounded border border-rule bg-surface p-5">
              <p className="label">Based in</p>
              <p className="mt-1.5 text-sm text-fg">{identity.location}</p>
              <p className="label mt-4">Availability</p>
              <p className="mt-1.5 text-sm text-fg">Open to on-site, hybrid, or remote roles</p>
            </div>
          </div>
        </div>
      </Section>

      <Section label="Skills" title="What I work with.">
        <div className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group) => (
            <div key={group.group} className="bg-bg p-5">
              <h3 className="font-display text-base font-semibold text-fg">{group.group}</h3>
              <ul className="mt-3 space-y-1.5">
                {group.items.map((item) => (
                  <li key={item} className="font-mono text-xs leading-relaxed text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
