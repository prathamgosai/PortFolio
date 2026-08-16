---
title: "What 10 months of L1/L2 support taught me about building software people can operate"
date: "2026-07-15"
excerpt: "Before I wrote the software, I was the person you called when it broke. That job decided how I built WorkforceIQ's permissions, audit trails, and password flow."
tags: ["IT Support", "WorkforceIQ", "RBAC", "Security"]
---

For the last ten months I've been doing L1/L2 desktop and network support: Windows machines, laptops, printers, peripherals, and the LAN/WAN they all sit on. Someone's machine won't join the domain. Someone's printer is "not working" in one of nine possible ways. Someone can't reach a share they could reach yesterday.

Then I built WorkforceIQ, a workforce platform now covering 370+ staff. Almost every design decision in it traces back to something I learned taking tickets.

## Support teaches you who actually uses software

Developers imagine a user. Support engineers meet them.

The person using WorkforceIQ at 11pm to fix tomorrow's roster is not a developer. They are a manager who has been on their feet for nine hours, is using a phone, and needs one specific thing to work right now. They will not read a tooltip. They will not open documentation. If the software is confusing, they will not file a well-written bug report — they'll call someone, and eventually that someone is me.

That reframes what "good software" means. It's not the software with the most features. It's the software that a tired person can operate correctly on the first try.

## Lesson 1: permissions are an operations problem, not a code problem

The first version of my role system was an enum in the codebase. Six roles, hardcoded, checked at each endpoint. Clean, typed, and completely wrong for how the business actually behaves.

Because here's what happens in real operations: someone gets promoted on a Tuesday. A manager needs to approve leave this week while a colleague is away. An outlet reorganises and suddenly a role means something slightly different than it did last month.

With permissions hardcoded, every one of those is a code change, a review, and a deploy. In support terms: every one of those is a ticket, and the ticket sits with *me* — the person who can push the deploy — for as long as it takes. I'd become the bottleneck on someone else's Tuesday.

So the role→permission matrix moved into the database, live-editable, across six account types. An admin changes what a role can do without waiting for me. That's not a technical improvement. It's the difference between the software serving the business and the business waiting on the software.

I only knew to build it that way because I'd been the bottleneck before.

## Lesson 2: "it just stopped working" is a data problem

The single hardest class of support ticket is the one with no history. A user says it worked yesterday. It doesn't work today. Nothing in between is recorded. You are now doing archaeology with a torch.

Nine times out of ten, *something* changed — a setting, a permission, an account. But without a record, you can't prove it, and you rebuild the state from guesses.

I did not want to build a system that produced that ticket. So:

- Every override in the scheduling engine records who created it and when.
- Employee data was imported through **numbered, reversible SQL migrations with audit trails** — not a one-off script someone ran on their laptop and then lost.
- The migrations are reversible because "we need to undo Tuesday's import" is a sentence I have genuinely heard, and the answer should never be "we can't."

When a manager asks why someone is off on Thursday, the system can answer. That question comes up constantly, and every time it's answered without me, that's a ticket that never existed.

## Lesson 3: the security control users hate exists because of what support sees

Support is where you learn how credentials really work in the field. Shared logins. Passwords written where they're convenient. Accounts still active for people who left. Not because anyone is careless — because the system made the secure path the inconvenient one, and people are trying to do their jobs.

So WorkforceIQ has a forced password-change flow on first login. Users find it mildly annoying. I built it anyway, because I know what the alternative looks like: an initial password that was set by an admin, shared over WhatsApp, and never changed — attached to an account that can see 370 people's records.

The same instinct drove the rest of the auth hardening:

- **Single-use refresh-token rotation, SHA-256 hashed.** A refresh token works once. Use it, and it's replaced. If a stolen token gets replayed, the reuse is detectable rather than invisible.
- **Rate limiting**, because the login endpoint is on the public internet and the internet is not polite.

Interestingly, this is the point where the two halves of my work meet. Rate limiting an API and configuring a firewall rule are the same instinct in different vocabulary: decide what's allowed, decide how much, and assume something out there will try more.

## Lesson 4: write it down, or explain it forever

Documenting incidents is the part of support that feels like overhead until the third time you solve the same problem from scratch.

Same in software. The reason the codebase uses raw parameterized SQL rather than hiding queries behind an ORM is partly this: when something is slow or wrong at 11pm, I want to read the query that ran. Not infer it. An abstraction that saves me typing but costs me an hour of debugging is a bad trade — and support is where you learn to price that trade honestly.

## The thing I actually took from it

Ten months of tickets gave me something a tutorial can't: I know what it costs when software doesn't work, because I've been the person paying that cost.

Most developers ship a feature and move on. I've been on the other end of the phone. It changes what you build.
