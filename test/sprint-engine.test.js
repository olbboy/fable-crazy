import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSprint, fill } from '../src/sprint-engine.js';
import { PLAYBOOKS } from '../src/venture-playbooks.js';

const baseData = (overrides = {}) => ({
  goal: { base: 1000, growth: 0.2, startDate: '2026-06-01' },
  venture: { key: 'ai-service', price: 300, niche: 'dental clinics', offer: 'Done-for-you content, $300/mo' },
  ledger: [],
  ...overrides,
});

test('template fill replaces placeholders and leaves unknown ones visible', () => {
  assert.equal(fill('send {q} to {niche}', { q: 25, niche: 'dentists' }), 'send 25 to dentists');
  assert.equal(fill('keep {unknown}', {}), 'keep {unknown}');
});

test('month 1 week 1 is build-first: build tasks present, no sell task yet', () => {
  const s = buildSprint(baseData(), new Date('2026-06-03'));
  assert.equal(s.month, 1);
  assert.equal(s.week, 1);
  const titles = s.tasks.map((t) => t.title).join(' | ');
  assert.match(titles, /guaranteed outcome/i);
  assert.ok(!titles.includes('Touch '), 'selling starts week 2');
});

test('month 1 week 2 adds the sell task with concrete quotas', () => {
  const s = buildSprint(baseData(), new Date('2026-06-10'));
  const sell = s.tasks.find((t) => t.title.startsWith('Touch '));
  assert.ok(sell, 'sell task expected');
  assert.match(sell.title, /\d+ prospects in dental clinics/);
  assert.ok(s.leadsThisWeek > 0 && s.callsThisWeek > 0);
});

test('no placeholders leak into rendered tasks', () => {
  const s = buildSprint(baseData(), new Date('2026-06-10'));
  for (const t of s.tasks) {
    for (const field of [t.title, t.detail, t.aiPrompt]) {
      assert.ok(!/\{(niche|offer|price|q|calls|clients|units)\}/.test(field), `leaked placeholder in: ${field}`);
    }
  }
});

test('retainer retention: last month $600 at 5% churn retains 1 client', () => {
  const data = baseData({ ledger: [{ month: '2026-06', amount: 600 }] });
  const s = buildSprint(data, new Date('2026-07-10'));
  assert.equal(s.retained, 1); // floor(600·0.95/300)
  // month 2 target $1200 → 4 clients − 1 retained = 3 new
  assert.equal(s.unitsLeft, 3);
  assert.ok(s.tasks.some((t) => t.title.includes('Deliver')), 'deliver task for retained client');
  assert.ok(s.tasks.some((t) => t.title.startsWith('Compound')), 'compound task from month 2');
});

test('behind pace in week 3 with no revenue triggers drift correction', () => {
  const s = buildSprint(baseData(), new Date('2026-06-18'));
  assert.ok(s.behind);
  assert.ok(s.tasks.some((t) => t.title.includes('DRIFT CORRECTION')));
});

test('target already hit: no sell task, surplus task instead', () => {
  const data = baseData({ ledger: [{ month: '2026-06', amount: 1200 }] });
  const s = buildSprint(data, new Date('2026-06-18'));
  assert.equal(s.unitsLeft, 0);
  assert.ok(!s.behind);
  assert.ok(s.tasks.some((t) => t.title.includes('bank the surplus')));
  assert.ok(!s.tasks.some((t) => t.title.startsWith('Touch ')));
});

test('kill criteria appear in the review task during months 1-2', () => {
  const s = buildSprint(baseData(), new Date('2026-06-10'));
  const review = s.tasks.at(-1);
  assert.match(review.humanEdge, /KILL CHECK/);
});

test('every playbook task template carries an AI prompt and a human edge', () => {
  for (const pb of Object.values(PLAYBOOKS)) {
    const all = [...pb.build, pb.sell, pb.deliver, pb.compound].filter(Boolean);
    for (const t of all) {
      assert.ok(t.aiPrompt?.length > 40, `${pb.key}/${t.title}: aiPrompt too thin`);
      assert.ok(t.humanEdge?.length > 20, `${pb.key}/${t.title}: humanEdge missing`);
      assert.ok(t.hours > 0);
    }
    assert.match(pb.kill, /KILL CHECK/);
  }
});
