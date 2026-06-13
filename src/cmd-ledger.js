// Revenue ledger: `moat log <amount> [note]` records reality;
// `moat curve` compares it against the growth curve and reforecasts.
import { load, save } from './storage.js';
import { monthTarget, monthIndex, monthKey, ledgerTotal, curveLag } from './goal-math.js';
import { bold, dim, cyan, green, red, yellow, bar } from './prompts.js';

export function runLog(args) {
  const data = load();
  if (!data.goal) return console.log('no income goal yet — run `moat goal` first');
  const amount = Number(args[0]);
  if (!Number.isFinite(amount) || amount === 0) {
    return console.log('usage: moat log <amount> [note]   (e.g. `moat log 300 first client`)');
  }
  const month = monthKey(data.goal.startDate, Math.max(1, monthIndex(data.goal.startDate)));
  data.ledger = data.ledger ?? [];
  data.ledger.push({ month, amount, note: args.slice(1).join(' ') || undefined });
  save(data);
  const total = ledgerTotal(data.ledger, month);
  console.log(green(`✓ logged $${amount} for ${month}`) + dim(` — month total $${total}`));
  console.log(dim('check position: `moat curve` · next tasks: `moat sprint`'));
}

export function runCurve() {
  const data = load();
  if (!data.goal) return console.log('no income goal yet — run `moat goal` first');
  const { goal, ledger = [] } = data;
  const current = Math.max(1, monthIndex(goal.startDate));

  console.log(bold('\n📈 MOAT — the curve vs reality\n'));
  const months = Math.max(current, 6);
  for (let m = 1; m <= months; m++) {
    const target = monthTarget(goal, m);
    const key = monthKey(goal.startDate, m);
    const actual = ledgerTotal(ledger, key);
    const future = m > current;
    const pct = Math.min(100, Math.round((actual / target) * 100));
    const c = future ? dim : actual >= target ? green : actual >= target * 0.7 ? yellow : red;
    const marker = m === current ? bold('→') : ' ';
    console.log(
      `  ${marker} m${String(m).padEnd(2)} ${key}  target $${String(target).padEnd(6)} ` +
      (future ? dim('—') : c(`${bar(pct, 100, 16)} $${actual} (${pct}%)`))
    );
  }

  const actualNow = ledgerTotal(ledger, monthKey(goal.startDate, current));
  const lag = curveLag(goal, current, actualNow);
  console.log('');
  if (actualNow >= monthTarget(goal, current)) {
    console.log(green(bold('  ✓ ON or AHEAD of the curve.')) + ' Raise prices before raising volume.');
  } else if (actualNow <= 0) {
    console.log(red(bold('  ✗ $0 booked so far.')) + ' The curve has not started — `moat sprint` and ship the first sale. Nothing else matters.');
  } else {
    console.log(yellow(bold(`  ⚠ running ~${lag} month(s) behind the curve.`)) +
      ` At current pace, month-${current} target lands ~${lag} month(s) late.`);
    console.log(dim('  `moat sprint` includes a drift-correction task while you are behind.'));
  }
  console.log('');
}
