// Set the income goal, pick the venture that fits YOUR moats, define the
// offer. Everything downstream (sprints, quotas, curve) derives from this.
import { load, save, today } from './storage.js';
import { ladder } from './goal-math.js';
import { rankVentures } from './venture-match.js';
import { fill } from './sprint-engine.js';
import {
  openPrompt, closePrompt, ask, askNumber, askChoice, bold, dim, cyan, green,
} from './prompts.js';

export async function runGoal() {
  const data = load();
  openPrompt();
  console.log(bold('\n💰 MOAT — income engine setup\n'));
  console.log(dim('honesty first: no tool can GUARANTEE revenue. this one guarantees'));
  console.log(dim('detection — falsifiable weekly quotas, drift correction when you slip,'));
  console.log(dim('and kill criteria that force a pivot before you waste a quarter.\n'));
  if (data.goal) console.log(dim(`(overwriting existing goal of $${data.goal.base}/mo set ${data.goal.startDate})\n`));

  const base = await askNumber('monthly income target to start ($)', 1000);
  const growthPct = await askNumber('monthly growth rate (%)', 20);
  const goal = { base, growth: growthPct / 100, startDate: today() };

  const steps = ladder(goal, 12);
  console.log(cyan('\n  the curve you just signed up for:'));
  console.log('  ' + steps.map((s) => `m${s.month}:$${s.target}`).join('  ') + '\n');

  console.log(bold('income engines, ranked against your moat profile:\n'));
  const ranked = rankVentures(data);
  const idx = await askChoice(
    '\nwhich engine?',
    ranked.map((r) => ({ label: `${r.pb.label} (fit ${r.fit}%)`, note: `${r.reason} · ${r.pb.pitch}` }))
  );
  const pb = ranked[idx].pb;

  const price = await askNumber(`price per ${pb.unitName} ($)`, pb.price.default);
  const niche = (await ask(`who exactly do you serve? (e.g. ${pb.nicheExample}): `)) || pb.nicheExample;
  const offer = (await ask('your offer in one line (enter = sensible default): '))
    || fill(pb.offerExample, { niche, price });
  closePrompt();

  data.goal = goal;
  data.venture = { key: pb.key, price, niche, offer };
  data.ledger = data.ledger ?? [];
  save(data);

  console.log(green(`\n✓ locked in: "${offer}" at $${price}/${pb.unitName}, serving ${niche}`));
  console.log(`\n  month 1 needs ~${Math.ceil(base / price)} ${pb.unitName}(s).`);
  console.log(bold('\n  next: `moat sprint` — this week\'s tasks, quotas and AI prompts.\n'));
}
