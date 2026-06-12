import test from 'node:test';
import assert from 'node:assert/strict';
import { taskRisk } from '../src/scoring-model.js';
import {
  taskRiskAt, survivalAt, survivalHalfLife, halfLifeDate,
} from '../src/horizon-model.js';
import { DEMO_TASKS } from '../src/demo-week-data.js';

const S = (c, d, v, r, acc, tr, e, ta, ax) => ({
  codified: c, digital: d, verifiable: v, repetitive: r,
  accountability: acc, trust: tr, embodied: e, taste: ta, access: ax,
});

const MIXED = S(2, 3, 2, 2, 2, 3, 1, 3, 2);

test('projection at t=0 equals the static risk score', () => {
  for (const s of [MIXED, S(4, 4, 4, 4, 0, 0, 0, 0, 0), S(0, 0, 0, 0, 4, 4, 4, 4, 4)]) {
    assert.equal(taskRiskAt(s, 0), taskRisk(s));
  }
});

test('risk is monotonically non-decreasing over time', () => {
  let prev = -1;
  for (const y of [0, 1, 2, 5, 10, 15]) {
    const r = taskRiskAt(MIXED, y);
    assert.ok(r >= prev, `risk fell from ${prev} to ${r} at year ${y}`);
    prev = r;
  }
});

test('moats slow the creep: moated task stays safer at +10y', () => {
  const exposed = taskRiskAt(S(2, 2, 2, 2, 0, 0, 0, 0, 0), 10);
  const moated = taskRiskAt(S(2, 2, 2, 2, 4, 4, 4, 4, 4), 10);
  assert.ok(moated < exposed);
});

test('already-exposed week has a half-life of 0', () => {
  const week = [{ hours: 10, scores: S(4, 4, 4, 4, 0, 0, 0, 0, 0) }];
  assert.equal(survivalHalfLife(week), 0);
});

test('heavily moated week has a half-life beyond 5 years', () => {
  const week = [{ hours: 10, scores: S(0, 0, 0, 0, 4, 4, 4, 4, 4) }];
  const hl = survivalHalfLife(week);
  assert.ok(hl === null || hl > 5, `expected distant half-life, got ${hl}`);
});

test('demo week has a finite, near-term half-life', () => {
  const hl = survivalHalfLife(DEMO_TASKS);
  assert.ok(hl !== null && hl > 0 && hl < 10, `expected 0<hl<10, got ${hl}`);
});

test('half-life date is a YYYY-MM string anchored to the from date', () => {
  const week = [{ hours: 10, scores: S(4, 4, 4, 4, 0, 0, 0, 0, 0) }];
  assert.equal(halfLifeDate(week, new Date('2026-01-15T00:00:00Z')), '2026-01');
});

test('week survival declines over the horizon', () => {
  assert.ok(survivalAt(DEMO_TASKS, 10) < survivalAt(DEMO_TASKS, 0));
});
