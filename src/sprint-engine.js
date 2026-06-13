// Turns (goal, venture, revenue ledger, today) into this week's atomic
// task list: exact quotas, a ready-to-paste AI delegation prompt per task,
// the human-only part, drift correction when behind, and kill criteria.
import { PLAYBOOKS } from './venture-playbooks.js';
import {
  monthTarget, monthIndex, monthKey, weekOfMonth,
  unitsForTarget, leadsForUnits, ledgerTotal,
} from './goal-math.js';

export const fill = (tpl, ctx) =>
  tpl.replace(/\{(\w+)\}/g, (m, k) => (ctx[k] !== undefined ? String(ctx[k]) : m));

const instantiate = (t, ctx) => ({
  title: fill(t.title, ctx),
  detail: fill(t.detail, ctx),
  hours: t.hours,
  aiPrompt: fill(t.aiPrompt, ctx),
  humanEdge: fill(t.humanEdge, ctx),
});

export function buildSprint(data, now = new Date()) {
  const { goal, venture, ledger = [] } = data;
  const pb = PLAYBOOKS[venture.key];
  const month = Math.max(1, monthIndex(goal.startDate, now));
  const week = weekOfMonth(now);
  const target = monthTarget(goal, month);
  const actual = ledgerTotal(ledger, monthKey(goal.startDate, month));
  const prev = ledgerTotal(ledger, monthKey(goal.startDate, month - 1));

  // Recurring revenue carried into this month, then the gap left to close.
  const retained = pb.model === 'retainer' ? Math.floor((prev * (1 - pb.churn)) / venture.price) : 0;
  const unitsNeeded = unitsForTarget(target, venture.price, retained);
  const unitsSoFar = Math.floor(actual / venture.price);
  const unitsLeft = Math.max(0, unitsNeeded - unitsSoFar);
  const weeksLeft = Math.max(1, 5 - week);
  const leadsThisWeek = Math.ceil(leadsForUnits(unitsLeft, pb.funnel) / weeksLeft);
  const callsThisWeek = unitsLeft === 0 ? 0 : Math.max(1, Math.round(leadsThisWeek * pb.funnel.leadToCall));
  // Month 1 gets a build-phase grace period before drift correction kicks in.
  const graceWeek = month === 1 ? 3 : 2;
  const behind = week >= graceWeek && actual < target * Math.min(1, week / 4) * 0.7;

  const ctx = {
    niche: venture.niche, offer: venture.offer, price: venture.price,
    q: leadsThisWeek, calls: callsThisWeek,
    clients: retained + unitsSoFar, units: unitsLeft, unitName: pb.unitName,
  };

  const tasks = [];
  if (month === 1 && week <= 2) for (const t of pb.build) tasks.push(instantiate(t, ctx));
  if (unitsLeft > 0 && !(month === 1 && week === 1)) tasks.push(instantiate(pb.sell, ctx));
  if (unitsLeft === 0) {
    tasks.push({
      title: 'Month target already hit — bank the surplus', hours: 2,
      detail: `You have ${unitsSoFar + retained} ${pb.unitName}(s) against a target of ${Math.ceil(target / venture.price)}. Use the slack to pre-fill next month's pipeline (lighter outreach) and improve delivery speed.`,
      aiPrompt: fill('Audit my delivery pipeline for {offer}: where are the 3 biggest time sinks, and which step can be further automated before volume doubles next month?', ctx),
      humanEdge: 'Rest is also a strategy — burnout is the one failure mode this tool cannot correct.',
    });
  }
  if (ctx.clients > 0 && pb.deliver) tasks.push(instantiate(pb.deliver, ctx));
  if (month >= 2 && pb.compound) tasks.push(instantiate(pb.compound, ctx));
  if (behind) {
    tasks.push({
      title: `⚠ DRIFT CORRECTION — ${Math.max(0, target - actual)}$ gap with ${weeksLeft} week(s) left`, hours: 3,
      detail: fill('You are off the curve. Add {q} EXTRA touches this week, warm network only (2-3× cold conversion), and offer a fast-action incentive (first week free / 48h delivery).', ctx),
      aiPrompt: fill('I\'m behind on revenue for {offer}. Draft: (1) a warm-network reactivation message to past contacts, (2) a 1-week fast-action incentive that doesn\'t cheapen the ${price} price, (3) a follow-up to every prospect who went silent.', ctx),
      humanEdge: 'Call — don\'t text — the 3 warmest prospects. Voice converts what text cannot.',
    });
  }
  tasks.push({
    title: 'Friday reality check (20 min)', hours: 0.5,
    detail: `Log every dollar with \`moat log <amount>\`. Quota check: did you hit ${leadsThisWeek} touches / ${callsThisWeek} calls? Misses are data, not shame — they recalibrate next week's quotas.`,
    aiPrompt: 'Here are my numbers this week (touches, calls, closes, revenue) vs quota. Diagnose the weakest funnel stage, give me ONE experiment to run next week, and tell me one thing to STOP doing.',
    humanEdge: month <= 2 ? pb.kill : 'Compare against the curve with `moat curve` — the trend matters more than the week.',
  });

  return {
    month, week, target, actual, retained, unitsNeeded, unitsLeft,
    leadsThisWeek, callsThisWeek, behind, totalHours: tasks.reduce((a, t) => a + t.hours, 0), tasks,
  };
}
