import test from 'node:test';
import assert from 'node:assert/strict';
import {
  monthTarget, ladder, monthIndex, monthKey, weekOfMonth,
  unitsForTarget, leadsForUnits, curveLag, ledgerTotal,
} from '../src/goal-math.js';

const GOAL = { base: 1000, growth: 0.2, startDate: '2026-06-13' };

test('the 20% curve: month 1 = $1000, month 2 = $1200, month 12 ≈ $7430', () => {
  assert.equal(monthTarget(GOAL, 1), 1000);
  assert.equal(monthTarget(GOAL, 2), 1200);
  assert.equal(monthTarget(GOAL, 12), 7430);
  assert.equal(ladder(GOAL, 12).length, 12);
});

test('month index and calendar keys track the goal start date', () => {
  assert.equal(monthIndex(GOAL.startDate, new Date('2026-06-20')), 1);
  assert.equal(monthIndex(GOAL.startDate, new Date('2026-08-01')), 3);
  assert.equal(monthKey(GOAL.startDate, 1), '2026-06');
  assert.equal(monthKey(GOAL.startDate, 3), '2026-08');
  assert.equal(monthKey(GOAL.startDate, 8), '2027-01'); // year rollover
});

test('week of month caps at 4 (week 4 absorbs days 22-31)', () => {
  assert.equal(weekOfMonth(new Date('2026-06-01')), 1);
  assert.equal(weekOfMonth(new Date('2026-06-15')), 3);
  assert.equal(weekOfMonth(new Date('2026-06-30')), 4);
});

test('units math: retained recurring revenue reduces new units needed', () => {
  assert.equal(unitsForTarget(1000, 300), 4);
  assert.equal(unitsForTarget(1000, 300, 2), 2);
  assert.equal(unitsForTarget(1000, 300, 9), 0); // never negative
});

test('funnel math: 4 closes through 12% × 30% needs 112 leads', () => {
  assert.equal(leadsForUnits(4, { leadToCall: 0.12, callToClose: 0.3 }), 112);
  assert.equal(leadsForUnits(0, { leadToCall: 0.12, callToClose: 0.3 }), 0);
});

test('curve lag: on-curve revenue lags 0, half revenue lags positive', () => {
  assert.equal(curveLag(GOAL, 3, monthTarget(GOAL, 3)), 0);
  assert.ok(curveLag(GOAL, 3, 600) > 1);
  assert.equal(curveLag(GOAL, 2, 0), 2); // nothing booked = fully behind
});

test('ledger sums entries per month key', () => {
  const ledger = [
    { month: '2026-06', amount: 300 },
    { month: '2026-06', amount: 150 },
    { month: '2026-07', amount: 999 },
  ];
  assert.equal(ledgerTotal(ledger, '2026-06'), 450);
  assert.equal(ledgerTotal(ledger, '2026-09'), 0);
});
