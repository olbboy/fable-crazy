// Rank the venture playbooks against YOUR moat profile — built from the
// hours-weighted moat scores of your latest audit plus your asset inventory.
import { MOATS } from './scoring-model.js';
import { PLAYBOOKS } from './venture-playbooks.js';

// 0-4 value per dimension key (moats + asset classes). Neutral 2s when no data.
// Pure on purpose (no storage import) so it runs in the browser bundle too.
export function moatProfile(data) {
  const profile = {};
  const audit = data.audits?.at(-1) ?? null;
  if (audit) {
    const totalHours = audit.tasks.reduce((a, t) => a + t.hours, 0) || 1;
    for (const d of MOATS) {
      profile[d.key] =
        audit.tasks.reduce((a, t) => a + (t.scores[d.key] ?? 0) * t.hours, 0) / totalHours;
    }
  }
  for (const [k, v] of Object.entries(data.assets?.ratings ?? {})) profile[k] = v;
  return { profile, personalized: !!(audit || data.assets) };
}

// Ventures sorted by fit (0-100) with a human-readable reason.
export function rankVentures(data) {
  const { profile, personalized } = moatProfile(data);
  const ranked = Object.values(PLAYBOOKS).map((pb) => {
    const dims = Object.entries(pb.moatFit);
    const max = dims.reduce((a, [, w]) => a + w * 4, 0);
    const score = dims.reduce((a, [k, w]) => a + w * (profile[k] ?? 2), 0);
    const strongest = dims
      .filter(([k]) => (profile[k] ?? 0) >= 2.5)
      .sort((a, b) => b[1] * (profile[b[0]] ?? 0) - a[1] * (profile[a[0]] ?? 0))
      .slice(0, 2)
      .map(([k]) => k);
    const reason = personalized
      ? strongest.length
        ? `matches your ${strongest.join(' + ')}`
        : 'no strong moat match — viable but uphill'
      : 'run `moat audit` + `moat assets` for a personalized match';
    return { pb, fit: Math.round((100 * score) / max), reason };
  });
  return ranked.sort((a, b) => b.fit - a.fit);
}
