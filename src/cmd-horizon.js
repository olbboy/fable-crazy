// Capability-creep projection: per-task risk now / +2y / +5y / +10y,
// week survival trajectory, and the career half-life date.
import { taskRisk } from './scoring-model.js';
import {
  taskRiskAt, survivalAt, survivalHalfLife, halfLifeDate, HORIZON_YEARS,
} from './horizon-model.js';
import { load, latestAudit } from './storage.js';
import { bold, dim, cyan, riskColor } from './prompts.js';

const YEARS = [0, 2, 5, 10];

export function runHorizon() {
  const data = load();
  const audit = latestAudit(data);
  if (!audit) {
    console.log('no audit yet — run `moat audit` or `moat demo` first');
    return;
  }

  console.log(bold('\n⏳ MOAT — capability-creep projection\n'));
  console.log(dim('assumes the frontier closes ~half of each task\'s automation gap every 5 years'));
  console.log(dim('and each moat decays at its own rate — argue with src/horizon-model.js\n'));

  const name = (s) => (s.length > 38 ? s.slice(0, 37) + '…' : s).padEnd(39);
  console.log(dim('  task'.padEnd(41) + YEARS.map((y) => (y ? `+${y}y` : 'now').padStart(6)).join('')));
  const sorted = [...audit.tasks].sort((a, b) => taskRisk(b.scores) - taskRisk(a.scores));
  for (const t of sorted) {
    const cells = YEARS.map((y) => {
      const r = taskRiskAt(t.scores, y);
      return riskColor(r)(String(r).padStart(6));
    }).join('');
    console.log(`  ${name(t.name)}${cells}`);
  }

  console.log(bold('\n  week survival'.padEnd(41)) + YEARS.map((y) => {
    const s = survivalAt(audit.tasks, y);
    return riskColor(100 - s)(String(s).padStart(6));
  }).join(''));

  const hl = survivalHalfLife(audit.tasks);
  if (hl === 0) {
    console.log(bold('\n  ☠ your week is ALREADY majority-automatable. Reposition now, not later.'));
  } else if (hl != null) {
    const date = halfLifeDate(audit.tasks);
    console.log(bold(`\n  ☠ CAREER HALF-LIFE: ~${date}`) + dim(` (${hl.toFixed(1)} years)`));
    console.log(dim('  the date when >50% of your current week becomes automatable, if you change nothing'));
    console.log(cyan(`\n  share it: "My career half-life is ${date}. Audited mine with MOAT — what's yours?"`));
  } else {
    console.log(bold(`\n  🏰 half-life beyond the ${HORIZON_YEARS}-year horizon.`) + dim(' Your week outlives the projection. Rare.'));
  }
  console.log(dim('\n  every `moat audit` you run moves this date — that is the game.\n'));
}
