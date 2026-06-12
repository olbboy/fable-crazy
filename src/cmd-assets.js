// Moat asset inventory: the compounding, non-automatable capital you own.
// Each asset class comes with concrete compounding actions.
import { load, save, today } from './storage.js';
import { openPrompt, closePrompt, askScale, bold, dim, cyan, bar, green } from './prompts.js';

export const ASSET_CLASSES = [
  {
    key: 'reputation',
    label: 'Reputation',
    question: 'Public track record people can verify (shipped work, reviews, talks)?',
    hint: '0 = invisible, 4 = known name in your niche',
    actions: [
      'Publish one verifiable artifact per month under your own name',
      'Attach your name to outcomes, not tasks ("I shipped X", not "I wrote code")',
    ],
  },
  {
    key: 'network',
    label: 'Network',
    question: 'People who would take your call and vouch for you?',
    hint: '0 = none, 4 = 50+ who would refer you work',
    actions: [
      'One real conversation per week with someone outside your company',
      'Make 2 introductions per month — referral debt compounds',
    ],
  },
  {
    key: 'audience',
    label: 'Audience / distribution',
    question: 'Direct channel to people who listen (list, followers, community)?',
    hint: '0 = zero reach, 4 = you can reach thousands on demand',
    actions: [
      'Own the channel: email list or community you control, not rented feeds',
      'Teach what you automate — operators of AI need guides they trust',
    ],
  },
  {
    key: 'credentials',
    label: 'Licenses & credentials',
    question: 'Legal permissions to sign, certify, or practice (PE, CPA, MD, bar...)?',
    hint: '0 = none, 4 = licensed gatekeeper in a regulated field',
    actions: [
      'Acquire one signing authority in your domain — AI cannot hold a license',
      'Position as the accountable reviewer of AI output in regulated work',
    ],
  },
  {
    key: 'context',
    label: 'Proprietary context',
    question: 'Knowledge that exists nowhere in writing (org history, client quirks, tacit craft)?',
    hint: '0 = all your knowledge is googleable, 4 = years of untranscribed context',
    actions: [
      'Sit where context accumulates: client-facing, incident response, negotiations',
      'Become the human index: the person who knows who/why, not just how',
    ],
  },
  {
    key: 'capital',
    label: 'Capital & equity',
    question: 'Ownership of things that earn without your labor (equity, products, property)?',
    hint: '0 = pure wage income, 4 = assets could cover your living costs',
    actions: [
      'Convert labor income into ownership: equity over salary where possible',
      'Own one small product/service operated BY AI, margin flows to you',
    ],
  },
];

export async function runAssets() {
  openPrompt();
  console.log(bold('\n🏦 MOAT — asset inventory\n'));
  console.log(dim('Rate the capital that survives any model release. 0-4 each.\n'));

  const ratings = {};
  for (const a of ASSET_CLASSES) {
    console.log(cyan(`  ${a.label}`));
    ratings[a.key] = await askScale(a.question, a.hint);
  }
  closePrompt();

  const data = load();
  data.assets = { date: today(), ratings };
  save(data);
  printAssets(data.assets);
}

export function printAssets(assets) {
  console.log(bold(`\n═══ moat assets ${assets.date} ═══\n`));
  const ranked = [...ASSET_CLASSES].sort(
    (a, b) => (assets.ratings[a.key] ?? 0) - (assets.ratings[b.key] ?? 0)
  );
  for (const a of ranked) {
    const r = assets.ratings[a.key] ?? 0;
    console.log(`  ${bar(r, 4, 12)} ${r}/4  ${a.label}`);
  }
  const weakest = ranked.slice(0, 2);
  console.log(bold('\n  ⚡ weakest moats — compound here first:'));
  for (const a of weakest) {
    console.log(green(`\n  ${a.label}:`));
    for (const act of a.actions) console.log(`    • ${act}`);
  }
  console.log('');
}
