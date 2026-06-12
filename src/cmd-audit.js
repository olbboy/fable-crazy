// Interactive weekly task audit: score every task on 9 dimensions,
// compute risk + survival score, persist a dated snapshot.
import {
  ACCELERATORS, MOATS, taskRisk, classify, survivalScore,
} from './scoring-model.js';
import { load, save, today } from './storage.js';
import {
  openPrompt, closePrompt, ask, askScale, askNumber,
  bold, dim, cyan, bar, riskColor,
} from './prompts.js';

export async function runAudit() {
  openPrompt();
  console.log(bold('\n🏰 MOAT — weekly task audit\n'));
  console.log(dim('List the tasks that fill your working week. For each one you will'));
  console.log(dim('answer 9 quick questions (0-4). Empty task name = finish.\n'));
  console.log(dim('calibration: most people overrate their trust & taste by 1-2 points.'));
  console.log(dim('if nobody has ever paid extra specifically for YOURS, subtract one.\n'));

  const tasks = [];
  while (true) {
    const name = await ask(bold(`Task #${tasks.length + 1} name (enter to finish): `));
    if (!name) break;
    const hours = await askNumber('  hours per week on this', 4);

    const scores = {};
    console.log(cyan('\n  — how automatable is the shape of this task —'));
    for (const d of ACCELERATORS) scores[d.key] = await askScale(d.question, d.hint);
    console.log(cyan('\n  — how strong are the human moats around it —'));
    for (const d of MOATS) scores[d.key] = await askScale(d.question, d.hint);

    const risk = taskRisk(scores);
    const cls = classify(risk);
    tasks.push({ name, hours, scores });
    console.log(`\n  → risk ${riskColor(risk)(String(risk))}/100  [${cls}]\n`);
  }
  closePrompt();

  if (!tasks.length) {
    console.log('no tasks recorded, nothing saved');
    return;
  }

  const data = load();
  const snapshot = { date: today(), tasks, survival: survivalScore(tasks) };
  data.audits.push(snapshot);
  save(data);
  printAuditSummary(snapshot);
  console.log(dim('\nnext: `moat plan` for your reallocation plan, `moat dashboard` for the visual.\n'));
}

export function printAuditSummary(snapshot) {
  console.log(bold(`\n═══ audit ${snapshot.date} ═══\n`));
  const sorted = [...snapshot.tasks].sort((a, b) => taskRisk(b.scores) - taskRisk(a.scores));
  for (const t of sorted) {
    const risk = taskRisk(t.scores);
    const c = riskColor(risk);
    console.log(
      `  ${c(bar(risk))} ${String(risk).padStart(3)}  ${t.name} ${dim(`(${t.hours}h/wk)`)}`
    );
  }
  const s = snapshot.survival;
  console.log(bold(`\n  SURVIVAL SCORE: ${riskColor(100 - s)(`${s}/100`)}`));
  console.log(dim('  100 = your week is untouchable, 0 = fully automatable\n'));
}
