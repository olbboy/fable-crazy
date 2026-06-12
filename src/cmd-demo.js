// Seed the sample week + asset inventory so the tool can be explored
// instantly without the 10-minute interview.
import { load, save, today } from './storage.js';
import { survivalScore } from './scoring-model.js';
import { DEMO_TASKS, DEMO_ASSETS } from './demo-week-data.js';

export function runDemo() {
  const data = load();
  data.audits.push({ date: today(), tasks: DEMO_TASKS, survival: survivalScore(DEMO_TASKS) });
  data.assets = { date: today(), ratings: DEMO_ASSETS };
  save(data);
  console.log('demo data seeded — try: moat plan · moat horizon · moat dashboard · moat coach');
}
