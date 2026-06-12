// Moat asset inventory: the compounding, non-automatable capital you own.
// Each asset class comes with concrete compounding actions.
import { load, save, today } from './storage.js';
import { ASSET_CLASSES } from './strategy-playbook.js';
import { openPrompt, closePrompt, askScale, bold, dim, cyan, bar, green } from './prompts.js';

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
