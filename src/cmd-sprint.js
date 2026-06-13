// Render this week's sprint: header with curve position, then each atomic
// task with hours, the copy-paste AI prompt, and the human-only part.
import { buildSprint } from './sprint-engine.js';
import { PLAYBOOKS } from './venture-playbooks.js';
import { load } from './storage.js';
import { bold, dim, cyan, green, yellow, red } from './prompts.js';

export function runSprint() {
  const data = load();
  if (!data.goal || !data.venture) {
    console.log('no income goal yet — run `moat goal` first');
    return;
  }
  const pb = PLAYBOOKS[data.venture.key];
  const s = buildSprint(data);

  console.log(bold(`\n🗓 SPRINT — month ${s.month}, week ${s.week} · ${pb.label}\n`));
  const pace = s.actual >= s.target ? green : s.behind ? red : yellow;
  console.log(`  month target $${s.target} · booked ${pace(`$${s.actual}`)}` +
    (s.retained ? dim(` · ${s.retained} ${pb.unitName}(s) retained`) : ''));
  console.log(`  to close: ${bold(String(s.unitsLeft))} ${pb.unitName}(s) → this week: ` +
    bold(`${s.leadsThisWeek} touches`) + ` → ~${s.callsThisWeek} calls` +
    dim(` · ~${s.totalHours}h of work\n`));

  s.tasks.forEach((t, i) => {
    console.log(bold(`  ${i + 1}. ${t.title}`) + dim(` (~${t.hours}h)`));
    console.log(`     ${t.detail}`);
    console.log(cyan('     🤖 paste to your AI: ') + dim(`"${t.aiPrompt}"`));
    console.log(green('     🧍 only you: ') + t.humanEdge + '\n');
  });

  console.log(dim('  log every dollar with `moat log <amount>` — quotas recalibrate around reality.\n'));
}
