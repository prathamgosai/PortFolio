---
title: "Auto-rostering 370+ staff: how WorkforceIQ's scheduling engine works"
date: "2026-07-10"
excerpt: "Three shift templates, seven days, and one rule that shaped the whole design: a manual override must survive every future rotation."
tags: ["WorkforceIQ", "Scheduling", "PostgreSQL", "TypeScript"]
---

When I started building WorkforceIQ for our restaurant group, rosters were made by hand. Someone sat down each week with the previous week's sheet, shuffled names around, and sent it out. With 370+ staff across multiple brands and outlets, that job takes hours, and it goes wrong in quiet ways — a person scheduled in two places, a day off silently lost, a new hire missed entirely.

The scheduling engine was the first thing I built. It sounds like the simple part. It wasn't.

## The shape of the problem

The group runs three rotating shift templates across a seven-day week. Each staff member belongs to a rotation, and each rotation advances week over week. Generating next week's roster is, at its core, applying the templates forward one step.

If that were the whole story, this would be a `for` loop. The complication is that reality constantly interrupts the rotation. Someone asks for a fixed Tuesday off for a class. A manager pins a senior server to Friday nights. A new hire starts mid-cycle. Every one of those is a manual override on top of the generated pattern.

## The rule that shaped everything

Here's the mistake I made first: I generated the roster, let managers edit it, and stored the result. It worked for exactly one week. The next generation ran, produced a fresh roster from the templates, and every manual edit vanished.

That's the bug that taught me the actual requirement:

> **An override is not an edit to a roster. It's a standing fact about a person that every future generation has to respect.**

So I stopped storing "the roster" as the source of truth. The generated pattern and the overrides are stored separately, and the roster you see is the pattern with overrides applied on top. Generating next week re-derives the pattern and re-applies the same standing overrides. Nothing to lose, because the edit was never living inside the generated output.

Roughly:

```ts
function buildWeek(staff: Staff[], weekStart: Date, overrides: Override[]) {
  // 1. Derive the base pattern from each person's rotation + template.
  const base = staff.flatMap((person) =>
    daysOfWeek(weekStart).map((day) => ({
      staffId: person.id,
      day,
      shift: shiftFor(person.rotation, person.templateId, day, weekStart),
    })),
  );

  // 2. Apply standing overrides last — they always win.
  return base.map((slot) => {
    const override = overrides.find(
      (o) => o.staffId === slot.staffId && appliesTo(o, slot.day),
    );
    return override ? { ...slot, shift: override.shift, overridden: true } : slot;
  });
}
```

The `appliesTo` check is where the real complexity sits, because overrides aren't all the same kind of thing. Some are one-off ("this Thursday only"). Some are recurring ("every Tuesday"). Some are bounded ("until the end of the month"). Modelling those as one table with a nullable date range, rather than three separate features, kept the application step to a single pass.

## Edge cases that cost me the most time

**Rotation drift across generations.** The rotation index has to be derived from a fixed anchor date, not incremented on each run. If you increment, one accidental double-run of the generator advances everyone by two weeks and the whole schedule quietly desynchronises. Deriving it from the anchor makes generation idempotent — running it twice produces the same roster, which is exactly what you want from something that sends WhatsApp messages to 370 people.

**Staff who join mid-rotation.** A new hire has no rotation history, so `shiftFor` had nothing to anchor to. They get an explicit rotation start date on their record, and the pattern derives from that.

**Overrides that outlive their reason.** A fixed Tuesday off for a class that ended three months ago is now just a hole in the roster nobody remembers creating. Overrides carry the user who created them and when — which is a small thing to store and the first thing a manager asks about.

**The double-booking check.** Across multiple outlets, the same person can be rostered twice for the same slot by two different managers. That's a constraint at the database level, not a check in the application. Raw parameterized SQL over PostgreSQL 16 means I know exactly what runs and where the unique constraint bites.

## Why I generate ahead of demand, not just from templates

The templates say what the rotation *is*. They don't say what the week actually *needs*. A quiet Tuesday and a fully booked Saturday get the same staffing from a naive rotation.

That's why there's a separate Python/FastAPI microservice forecasting staffing demand. It's deliberately a separate service: the forecasting is Python's home turf, the ML libraries are there, and I didn't want that work sitting inside the NestJS API where it would couple model changes to API deploys. The API asks it what next week looks like; the scheduling engine plans against that answer.

## What I'd do differently

Two things.

First, I'd model overrides as an append-only log from the start rather than a mutable table. I retrofitted audit trails, and retrofitting history onto a table that has been mutated in place means the history starts the day you added it — not the day the data started mattering.

Second, I'd put the roster-generation logic in the shared TypeScript package earlier than I did. It lived in the API for too long, which meant the frontend couldn't preview a roster without a round trip. Moving it into shared code let both sides derive the same pattern from the same source.

The engine now generates weekly rosters for 370+ staff, and the overrides survive. Which was the whole point.
