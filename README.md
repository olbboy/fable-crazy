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

## Quick start

```bash
node bin/moat.js demo        # seed sample data (a typical software engineer's week)
node bin/moat.js plan        # see the reallocation plan
node bin/moat.js dashboard   # visual dashboard in your browser
node bin/moat.js audit       # the real thing: audit YOUR week (~10 min)
node bin/moat.js assets      # inventory your durable career capital
node bin/moat.js coach       # pipe your data to `claude` for a brutal strategy session
```

Or `npm link` once, then just `moat <command>`.

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
  your survival strategist, fed with your real audit data.

## Data

Everything stays local in `data/moat-data.json`. No telemetry, no cloud.
