// Reallocation plan: which tasks to hand to AI, which to reposition,
// which to pour the freed hours into. Conversion advice keyed by the
// task's strongest human moat.
import {
  taskRisk, classify, dominantMoat, CLASS_META,
} from './scoring-model.js';
import { load, latestAudit } from './storage.js';
import { printAuditSummary } from './cmd-audit.js';
import { bold, dim, red, yellow, green, cyan } from './prompts.js';

// What "convert" means depending on which moat is (or could be) strongest.
const CONVERSION_PLAYBOOK = {
  accountability:
    'Become the signer. Let AI produce the work; you own the outcome, carry the liability, and charge for the guarantee — not the labor.',
  trust:
    'Become the face. Clients should buy "you, amplified by AI" — keep every relationship touchpoint human, automate everything behind it.',
  embodied:
    'Anchor it in the physical. Pair the digital part (automate it) with on-site presence, hardware, or hands-on delivery that no API can ship.',
  taste:
    'Become the curator. Generate 20 options with AI, but be the person whose selection people pay for. Publish your taste so it becomes a brand.',
  access:
    'Become the gateway. Your privileged context, data, or seat at the table is the input AI cannot get — sell the access, automate the processing.',
};

export function runPlan() {
  const data = load();
  const audit = latestAudit(data);
  if (!audit) {
    console.log('no audit yet — run `moat audit` (or `moat demo` to try with sample data)');
    return;
  }

  printAuditSummary(audit);
  const groups = { 'delegate': [], 'convert': [], 'double-down': [] };
  for (const t of audit.tasks) groups[classify(taskRisk(t.scores))].push(t);

  const freedHours = groups['delegate'].reduce((a, t) => a + t.hours * 0.7, 0)
    + groups['convert'].reduce((a, t) => a + t.hours * 0.4, 0);

  console.log(bold('═══ reallocation plan ═══\n'));

  if (groups['delegate'].length) {
    console.log(red(bold(`🤖 ${CLASS_META['delegate'].label}`)) + dim(' — stop doing these by hand. This is where the next model eats first.'));
    for (const t of groups['delegate'].sort((a, b) => b.hours - a.hours)) {
      console.log(`   • ${t.name} ${dim(`(${t.hours}h/wk → keep ~${Math.round(t.hours * 0.3 * 10) / 10}h as reviewer)`)}`);
    }
    console.log('');
  }

  if (groups['convert'].length) {
    console.log(yellow(bold(`🔁 ${CLASS_META['convert'].label}`)) + dim(' — same domain, new position: from doing the work to owning it.'));
    for (const t of groups['convert']) {
      const moat = dominantMoat(t.scores);
      console.log(`   • ${t.name} ${dim(`(strongest moat: ${moat.label})`)}`);
      console.log(`     ${cyan(CONVERSION_PLAYBOOK[moat.key])}`);
    }
    console.log('');
  }

  if (groups['double-down'].length) {
    console.log(green(bold(`🏰 ${CLASS_META['double-down'].label}`)) + dim(' — this is the 40%. Pour the freed hours here.'));
    for (const t of groups['double-down']) console.log(`   • ${t.name} ${dim(`(${t.hours}h/wk)`)}`);
    console.log('');
  } else {
    console.log(red(bold('⚠ zero moat tasks in your week.')) + ' Every hour you work is automatable shape. Build moat work before reallocating anything.\n');
  }

  console.log(bold(`⏱ hours freed by delegation: ~${Math.round(freedHours * 10) / 10}h/week`));
  console.log(dim('   reinvest split: 50% moat tasks above · 30% weakest moat assets (`moat assets`) · 20% learning to operate frontier AI better than peers\n'));
}
