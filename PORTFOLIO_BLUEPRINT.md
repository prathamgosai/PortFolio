# Portfolio Blueprint

> This document describes what the site is actually built to do. An earlier
> version of it targeted a generic "software engineer portfolio" positioning
> that the site never adopted — the two now agree.

## Positioning

- **Primary identity: IT & network engineer who also builds the software layer.**
  The differentiator is the combination, not either half alone: someone who has
  taken L1/L2 tickets *and* shipped a production platform is rare, and it is the
  reason the reliability claims are credible rather than aspirational.
- Lead with proof — real systems, real scale, verifiable certifications. Never
  with adjectives.
- Calm confidence over hype. The visual language is engineering documentation:
  rack hardware, schematic paper, an amber status LED.

## Core pages

| Route | Job it does |
| --- | --- |
| `/` | Position, proof bar, featured work, credibility strip, FAQ, CTA |
| `/about` | The narrative — server room → production software |
| `/projects` | WorkforceIQ, plus an honest "learning in public" section |
| `/projects/workforceiq` | The deep case study: problem, architecture, security, what I'd change |
| `/experience` | Timeline, education, all certifications with verification links |
| `/blog` | Evidence of thinking, not just doing |
| `/contact` | The conversion point |

`/noc` is an experimental alternate homepage. It is `noindex`, unlinked from
navigation, and not part of this blueprint.

## SEO direction

- **Primary entity:** `Pratham Gosai` / `Pratham Dharmeshbharti Gosai`. The goal
  is to own the name query and build a Knowledge Graph entity, which is why
  `sameAs` on the `Person` node lists every verified off-site profile.
- **Primary keywords:** IT support engineer Surat · network engineer Gujarat ·
  AI automation engineer · Claude API developer.
- **Secondary:** workforce management platform · FastAPI demand forecasting ·
  full-stack TypeScript developer India.
- **Title pattern:** `Pratham Gosai — IT & Network Engineer · AI Automation`,
  with `%s · Pratham Gosai` for sub-pages.
- Structured data is centralised: one canonical `Person` and `WebSite`, declared
  on the home page and referenced by `@id` everywhere else.

## Content strategy

- Concise hero messaging, proof-driven sections, one deeply-documented project
  rather than a thin archive of many.
- Publish short, high-signal articles that show judgement — the decisions and
  the trade-offs, not tutorials.
- Every post is also a social card and a feed item; link back to the site from
  GitHub and LinkedIn when one goes out.

## Conversion strategy

- The contact CTA is visible on every page (navbar "Hire me", footer, page CTAs).
- Trust is built from things that can be checked: certification IDs with verify
  links, named employers, a named repo. Not logos, not claims.
- `testimonials` stays empty until real quotes exist. **The strongest available
  win here is two or three genuine LinkedIn recommendations** — that section is
  built and hidden, waiting for them.

## Technical direction

- Next.js App Router, TypeScript strict, Tailwind CSS v4.
- **No animation library** — CSS plus a small `IntersectionObserver`. Motion is a
  refinement, so it is gated on `prefers-reduced-motion` and on JS being
  available at all.
- **One exception: `lenis`** (~5.5 kB gz), for smooth wheel scrolling. It is the
  only runtime dependency added for presentation, and it earns the exception by
  not being an animation library in the sense meant above: it does not own any
  element's motion, it changes how the *page* scrolls. Everything animated is
  still CSS reacting to state that an observer sets.
  It is also fenced. `<SmoothScroll/>` lazy-imports it, and only after passing
  two media-query gates — `(pointer: fine)` and `prefers-reduced-motion:
  no-preference` — so touch devices and anyone who has asked for less motion
  never download it at all. Both gates are live; flipping the OS setting
  mid-session creates or destroys the instance.
  If a future change makes something else depend on Lenis for its animation,
  that is the signal the exception has stopped holding.
- Semantic design tokens; both themes contrast-checked to WCAG AA.
- Static-first: every route prerenders at build time.
- Security headers including a CSP ship from `next.config.ts`.
- CI runs lint → typecheck → build on every push.

## Known open items

- No analytics, so conversion is currently unmeasurable.
- Render's free plan sleeps the instance; a cold visitor waits 30–60s.
- `gray-matter` pins `js-yaml` 3.x, which has an unpatched advisory. It only
  ever parses this repo's own frontmatter at build time, so it is accepted
  rather than fixed — revisit if `gray-matter` is ever used on untrusted input.
