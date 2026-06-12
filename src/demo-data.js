// Seed a realistic sample audit + asset inventory so the tool can be
// explored instantly without a 10-minute interview.
import { load, save, today } from './storage.js';
import { survivalScore } from './scoring-model.js';

const s = (codified, digital, verifiable, repetitive, accountability, trust, embodied, taste, access) =>
  ({ codified, digital, verifiable, repetitive, accountability, trust, embodied, taste, access });

const DEMO_TASKS = [
  { name: 'Writing CRUD features & glue code', hours: 14, scores: s(4, 4, 3, 3, 1, 0, 0, 1, 0) },
  { name: 'Writing status reports & docs', hours: 4, scores: s(4, 4, 2, 4, 1, 1, 0, 1, 0) },
  { name: 'Debugging production issues', hours: 5, scores: s(2, 4, 3, 2, 2, 1, 0, 1, 2) },
  { name: 'Code review & production sign-off', hours: 6, scores: s(2, 4, 2, 2, 4, 2, 0, 2, 2) },
  { name: 'Architecture decisions with trade-offs', hours: 5, scores: s(1, 3, 1, 1, 3, 2, 0, 4, 2) },
  { name: 'Client meetings & requirement negotiation', hours: 6, scores: s(1, 2, 0, 1, 3, 4, 2, 3, 3) },
  { name: 'Incident response & war-room calls', hours: 3, scores: s(1, 3, 2, 0, 4, 3, 1, 3, 4) },
  { name: 'Mentoring juniors & hiring interviews', hours: 3, scores: s(1, 2, 0, 1, 2, 4, 2, 3, 2) },
];

const DEMO_ASSETS = {
  reputation: 2, network: 1, audience: 0, credentials: 1, context: 3, capital: 1,
};

export function runDemo() {
  const data = load();
  data.audits.push({ date: today(), tasks: DEMO_TASKS, survival: survivalScore(DEMO_TASKS) });
  data.assets = { date: today(), ratings: DEMO_ASSETS };
  save(data);
  console.log('demo data seeded — try: moat plan · moat dashboard · moat coach');
}
