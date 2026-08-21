import { capabilities, waysOfWorking, identity } from "@/data/portfolio";

/**
 * ─────────────────────────────────────────────────────────────
 * CAPABILITIES + WAYS OF WORKING
 * ─────────────────────────────────────────────────────────────
 *
 * Eight numbered rows. The hover treatment is a background wash and a rule that
 * grows from the left — no image reveal, no card lift, nothing that moves the
 * text. Eight rows that each jump on hover turns a reference list into a
 * fairground, and this list's job is to be read quickly.
 *
 * ── Ways of working is NOT a services section ──
 * It carries no prices, no packages and no deliverables, because Pratham
 * selected full-time employment only when asked directly what he wanted to
 * offer. Every mode is read out of `identity.availability`. If this ever grows
 * a "starting at" figure, something has gone wrong — see the note on
 * `waysOfWorking` in portfolio.ts.
 */
export function Capabilities() {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-title"
      className="cine-exit mx-auto max-w-5xl scroll-mt-28 px-5 py-20 sm:py-24"
    >
      <p className="label">Capabilities</p>
      <h2 id="capabilities-title" className="t-h2 mt-4 text-fg">
        What I build, and what I keep running.
      </h2>

      <ol className="cap-list mt-12">
        {capabilities.map((cap, i) => (
          <li key={cap.title} className="cap-row">
            <span aria-hidden className="cap-row__index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="cap-row__body">
              <h3 className="t-card-title text-fg">{cap.title}</h3>
              <p className="t-small measure mt-2.5 text-muted">{cap.body}</p>
            </div>
            <ul className="cap-row__tags" aria-label={`${cap.title} technologies`}>
              {cap.tags.map((tag) => (
                <li key={tag} className="font-mono text-xs text-muted">
                  {tag}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* ── Ways of working ── */}
      <div id="ways" className="mt-24 scroll-mt-28">
        <p className="label">Ways of working</p>
        <h3 className="t-h3 mt-4 text-fg">Open to {identity.openTo}.</h3>

        <ul className="ways-grid mt-10">
          {waysOfWorking.map((way) => (
            <li key={way.mode} className="bento-tile p-6 sm:p-7" data-tilt={5}>
              <div className="depth-1 flex items-center gap-2.5">
                <span aria-hidden className="status-pulse-emerald shrink-0" />
                <h4 className="t-mono-badge text-fg">{way.mode}</h4>
              </div>
              <p className="depth-1 t-small mt-4 text-muted">{way.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
