import test from 'node:test';
import assert from 'node:assert/strict';
import { rankVentures, moatProfile } from '../src/venture-match.js';

const S = (acc, tr, e, ta, ax) =>
  ({ codified: 2, digital: 2, verifiable: 2, repetitive: 2, accountability: acc, trust: tr, embodied: e, taste: ta, access: ax });

test('high trust + context profile ranks consulting above micro-product', () => {
  const data = {
    audits: [{ date: 'x', tasks: [{ hours: 10, scores: S(3, 4, 0, 2, 2) }], survival: 50 }],
    assets: { ratings: { context: 4, reputation: 3, audience: 0, network: 2, credentials: 2, capital: 0 } },
  };
  const ranked = rankVentures(data);
  const pos = (k) => ranked.findIndex((r) => r.pb.key === k);
  assert.ok(pos('consulting-sprint') < pos('micro-product'));
  assert.match(ranked[0].reason, /matches your/);
});

test('embodied-heavy profile surfaces the local venture', () => {
  const data = {
    audits: [{ date: 'x', tasks: [{ hours: 10, scores: S(1, 2, 4, 1, 3) }], survival: 50 }],
    assets: { ratings: { audience: 0, reputation: 0, network: 1, credentials: 0, context: 1, capital: 0 } },
  };
  const ranked = rankVentures(data);
  assert.equal(ranked[0].pb.key, 'local-embodied');
});

test('no data falls back to neutral profile with an audit nudge', () => {
  const ranked = rankVentures({ audits: [], assets: null });
  assert.equal(ranked.length, 5);
  assert.match(ranked[0].reason, /moat audit/);
});

test('moat profile is hours-weighted across audit tasks', () => {
  const data = {
    audits: [{
      date: 'x',
      tasks: [
        { hours: 9, scores: S(0, 4, 0, 0, 0) },
        { hours: 1, scores: S(0, 0, 0, 0, 0) },
      ],
      survival: 50,
    }],
    assets: null,
  };
  const { profile } = moatProfile(data);
  assert.equal(profile.trust, 3.6); // 4·0.9 + 0·0.1
});
