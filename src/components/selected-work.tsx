import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { projects, learningInPublic } from "@/data/portfolio";

/**
 * ─────────────────────────────────────────────────────────────
 * SELECTED WORK — editorial rows, not cards.
 * ─────────────────────────────────────────────────────────────
 *
 * Rows rather than a card grid, and that follows from the content rather than
 * from fashion. There are two shipped projects. A three-across card grid built
 * for two items either leaves a hole or stretches them to fill it, and in both
 * cases the layout is visibly waiting for projects that do not exist. A stacked
 * row owns the full width at any count, so one project looks deliberate and six
 * would need no redesign.
 *
 * `data-cursor` is how a row talks to <CustomCursor/> — the cursor component
 * knows nothing about projects, it just reads the nearest annotated ancestor.
 *
 * ── The study-repo boundary ──
 * `learningInPublic` renders in its own block, under its own heading, in a
 * visibly quieter treatment. §1 is explicit that study repos are NEVER
 * presented as original work, and the reliable way to honour that is structural:
 * they are not in the `projects` array, so no future change to the row
 * component can accidentally promote them.
 */
export function SelectedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="mx-auto max-w-5xl scroll-mt-28 px-5 py-20 sm:py-24"
    >
      <p className="label label-signal">Selected work</p>
      <h2 id="work-title" className="t-h2 mt-4 text-fg">
        Things I designed, built and shipped.
      </h2>
      <p className="t-body measure mt-5 text-muted">
        One deeply-documented platform rather than a thin archive of many. The case study covers the
        architecture, the security decisions, and what I would change.
      </p>

      <ol className="work-list mt-14">
        {projects.map((project, i) => {
          const href = project.caseStudy ?? project.live ?? project.repo;
          const isInternal = Boolean(project.caseStudy);

          return (
            <li key={project.slug} className="work-row" data-cursor={href ? "View" : undefined}>
              <div className="work-row__index">
                <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              </div>

              <div className="work-row__body">
                <div className="work-row__head">
                  <h3 className="work-row__title text-fg">
                    {href ? (
                      /**
                       * Stretched link. The accessible name stays the project
                       * title rather than becoming "view project", while the hit
                       * target is the whole row.
                       */
                      isInternal ? (
                        <Link href={href} className="work-row__link">
                          {project.name}
                        </Link>
                      ) : (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="work-row__link"
                        >
                          {project.name}
                        </a>
                      )
                    ) : (
                      project.name
                    )}
                  </h3>
                  <p className="label work-row__meta">
                    {project.category}
                    <span aria-hidden> · </span>
                    {project.year}
                  </p>
                </div>

                <p className="t-small measure mt-4 text-muted">{project.tagline}</p>

                <ul className="work-row__stack mt-5">
                  {project.stack.map((tech) => (
                    <li key={tech} className="chip rounded-full px-2.5 py-1 font-mono text-xs">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="work-row__cta" aria-hidden>
                {isInternal ? (
                  <ArrowRight className="h-5 w-5" />
                ) : href ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* ── Study repos. Separate array, separate heading, quieter treatment. ── */}
      {learningInPublic.length > 0 ? (
        <div className="mt-20">
          <h3 className="label">Learning in public</h3>
          <p className="t-caption measure mt-3 text-muted">
            Study repositories and collected reading — not products I built. They are here because
            what someone is currently learning says something useful about them.
          </p>
          <ul className="study-list mt-7">
            {learningInPublic.map((repo) => (
              /**
               * The kind label sits ABOVE the name as an eyebrow, not beside it.
               * Inline, it collided the moment a repo name wrapped — and one of
               * them ("kali-linux-CyberSecurity") always wraps at this column
               * width. Stacking also puts "Study repo" first in the reading
               * order, which is where §1 wants it.
               */
              <li key={repo.name} className="study-row" data-cursor="Open">
                <p className="label text-[0.6875rem]">{repo.kind}</p>
                <a
                  href={repo.href}
                  target="_blank"
                  rel="noreferrer"
                  className="study-row__link mt-2"
                >
                  <span className="font-display font-bold leading-tight text-fg">{repo.name}</span>
                  <ArrowUpRight aria-hidden className="ml-3 mt-0.5 h-4 w-4 shrink-0 text-muted" />
                </a>
                <p className="t-caption mt-2.5 leading-snug text-muted">{repo.body}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
