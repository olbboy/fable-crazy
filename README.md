# 🏰 MOAT — anti-obsolescence engine

> If the next model can do 50%+ of all cognitive work, the question is no longer
> "what can AI do?" — it's "which 40% of work will still need a human, and how do
> I move my week there before the layoff wave does it for me?"

MOAT is a zero-dependency CLI that audits your working week, scores every task by
**AI-replaceability**, and generates a reallocation plan toward work the next model
cannot take from you.

## The thesis

What survives a smarter model is **not harder thinking** — the model thinks better
than you. What survives is work where the bottleneck isn't intelligence:

| Moat | Why a model can't hold it |
|---|---|
| **Accountability** | An AI cannot be sued, licensed, or struck off. Someone must sign. |
| **Personal trust** | People hire people they trust. Trust transfers at human speed. |
| **Embodiment** | Atoms still beat APIs. Presence, hands, rooms. |
| **Taste under ambiguity** | Where "good" is contested there is no verifier — so RL can't optimize it, and a human's curation is the product. |
| **Privileged access** | Confidential context, capital, institutional seats, relationships — inputs no API can fetch. |

And what accelerates automation: tasks that are **codifiable**, **fully digital**,
**cheaply verifiable**, and **repetitive**. MOAT scores every task on all 9
dimensions: `risk = 100 × automatable-shape × (1 − moat-strength)`.

## ☠ Career half-life

A snapshot is not enough — risk moves. MOAT projects every task forward assuming:

- **Capability creep**: the frontier closes ~half of each task's remaining
  "automation-shape gap" every 5 years.
- **Moat decay**: each defense erodes at its own annual rate — accountability
  3%/yr (regulation moves slowest), access 5%, trust 6%, taste 8%,
  embodiment 12% (robotics is the fastest frontier).

The output is your **career half-life: the calendar date when >50% of your
current week becomes automatable if you change nothing**. Every constant is an
explicit, editable assumption in [horizon-model.js](src/horizon-model.js) —
argue with it, then move your hours. Every re-audit moves the date. That is the game.

## Quick start

```bash
node bin/moat.js demo        # seed sample data (a typical software engineer's week)
node bin/moat.js plan        # see the reallocation plan
node bin/moat.js horizon     # capability-creep projection + your half-life date
node bin/moat.js dashboard   # visual dashboard in your browser
node bin/moat.js audit       # the real thing: audit YOUR week (~10 min)
node bin/moat.js assets      # inventory your durable career capital
node bin/moat.js coach       # pipe your data to `claude` for a brutal strategy session
node bin/moat.js web         # build the single-file web app
```

Or `npm link` once, then just `moat <command>`.

## 🌍 For the whole world: the single-file web app

`moat web` builds **`dist/moat-web.html`** — the entire tool in one HTML file,
generated from the *same* model source the CLI uses (so they can never drift).
No install, no build, no server, no signup; data lives in `localStorage` with
JSON export/import and a copy-paste share card. Host it on GitHub Pages, S3,
or just send the file to someone whose job you worry about.

## What you get

- **Survival score** (0–100): hours-weighted exposure of your entire week.
- **Three buckets per task**:
  - 🤖 **Delegate** — stop doing it by hand; keep ~30% of hours as the reviewer.
  - 🔁 **Convert** — same domain, new position: from doing the work to *owning* it
    (signer, face, curator, gateway — playbook keyed to your strongest moat).
  - 🏰 **Double down** — the 40%. Pour freed hours here.
- **Moat asset inventory** — 6 classes of capital that survive any model release
  (reputation, network, audience, licenses, proprietary context, equity), with
  compounding actions for your weakest two.
- **Trend tracking** — re-audit monthly; the dashboard plots whether your week is
  getting safer or more exposed.
- **`moat coach`** — the crazy bit: uses the very AI that threatens your job as
  your survival strategist, fed with your real audit data and half-life date.

## 💰 Income engine — from "$1000/mo +20%" to this week's tasks

**Fully available in the web app UI** (section 3 — no command line needed):
set the goal, pick a moat-matched venture, get this week's sprint with per-task
copy buttons for the AI prompts, check tasks off, log revenue, watch the curve.
Equivalent CLI for terminal people:

```bash
node bin/moat.js goal     # set target + growth, pick the venture that fits YOUR moats
node bin/moat.js sprint   # this week's atomic tasks: quotas, AI prompts, human-only parts
node bin/moat.js log 300  # record real revenue ("moat log 300 first client")
node bin/moat.js curve    # target vs reality, drift lag, reforecast
```

How it works, honestly:

1. **Reverse math.** $1000/mo growing 20% means month 12 = $7,430/mo. The engine
   converts each month's target into units to sell, then leads to touch, through
   deliberately conservative funnel numbers — so quotas are honest, not hopium.
2. **Moat-matched ventures.** Five playbooks (AI-operated service, expert sprint,
   curation engine, micro-product, local AI setup) ranked against the moat profile
   from your own audit — the venture you pick is the one your defenses support.
3. **Atomic tasks with AI leverage.** Every weekly task ships three parts: what to
   do, a **copy-paste delegation prompt** so AI does ~70% of it, and the human-only
   part (hit send yourself, make the verdict, walk in the door).
4. **A control loop, not a promise.** No tool can *guarantee* revenue — anyone who
   says otherwise is selling you something. MOAT guarantees **detection**: log real
   dollars, and when you drift below pace it injects gap-closing tasks; miss the
   **kill criteria** (e.g. "<3 paying conversations by day 30") and it tells you to
   pivot before you waste a quarter.

## Accuracy & honesty

- Every 0–4 question ships with **calibration anchors** (concrete examples for
  0 and 4) because everyone overrates their own taste and trust.
- The scoring engine, horizon model, goal math, venture matching and sprint
  engine are covered by tests: `npm test` (38 assertions on formula edges,
  classification thresholds, monotonic decay, half-life math, funnel math,
  retention, drift correction, and the web build).
- The horizon constants are forecasts, not facts. They are deliberately exposed
  as code, not buried in weights — disagreement is a feature.

## Data

Everything stays local in `data/moat-data.json` (CLI) or `localStorage` (web).
No telemetry, no cloud.
