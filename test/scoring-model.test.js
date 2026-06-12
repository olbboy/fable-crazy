import test from 'node:test';
import assert from 'node:assert/strict';
import {
  taskRisk, classify, survivalScore, dominantMoat, accelScore, moatScore,
} from '../src/scoring-model.js';

const S = (c, d, v, r, acc, tr, e, ta, ax) => ({
  codified: c, digital: d, verifiable: v, repetitive: r,
  accountability: acc, trust: tr, embodied: e, taste: ta, access: ax,
});

test('fully automatable shape with zero moats scores 100', () => {
  assert.equal(taskRisk(S(4, 4, 4, 4, 0, 0, 0, 0, 0)), 100);
});

test('zero automatable shape scores 0 regardless of moats', () => {
  assert.equal(taskRisk(S(0, 0, 0, 0, 0, 0, 0, 0, 0)), 0);
  assert.equal(taskRisk(S(0, 0, 0, 0, 4, 4, 4, 4, 4)), 0);
});

test('full moats neutralize even a fully automatable shape', () => {
  assert.equal(taskRisk(S(4, 4, 4, 4, 4, 4, 4, 4, 4)), 0);
});

test('accel and moat scores are normalized to [0,1]', () => {
  assert.equal(accelScore(S(4, 4, 4, 4, 0, 0, 0, 0, 0)), 1);
  assert.equal(moatScore(S(0, 0, 0, 0, 4, 4, 4, 4, 4)), 1);
});

test('classification thresholds: 65 delegates, 35 converts, 34 doubles down', () => {
  assert.equal(classify(65), 'delegate');
  assert.equal(classify(64), 'convert');
  assert.equal(classify(35), 'convert');
  assert.equal(classify(34), 'double-down');
});

test('survival score is hours-weighted', () => {
  const tasks = [
    { hours: 1, scores: S(4, 4, 4, 4, 0, 0, 0, 0, 0) }, // risk 100
    { hours: 3, scores: S(0, 0, 0, 0, 0, 0, 0, 0, 0) }, // risk 0
  ];
  assert.equal(survivalScore(tasks), 75);
});

test('survival score of empty week is 0, not NaN', () => {
  assert.equal(survivalScore([]), 0);
});

test('dominant moat respects weights', () => {
  // embodied 4 (w 1.0 → 4.0) beats trust 3 (w 1.25 → 3.75)
  assert.equal(dominantMoat(S(0, 0, 0, 0, 0, 3, 4, 0, 0)).key, 'embodied');
  // tie on raw score: accountability wins on weight over taste
  assert.equal(dominantMoat(S(0, 0, 0, 0, 3, 0, 0, 3, 0)).key, 'accountability');
});

test('missing dimensions default to 0 instead of crashing', () => {
  assert.equal(taskRisk({ codified: 4, digital: 4, verifiable: 4, repetitive: 4 }), 100);
});
