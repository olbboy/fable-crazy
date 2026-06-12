// Time is the missing axis of any automation-risk snapshot. A task that is
// safe today is not safe forever: frontier capability creeps into harder
// shapes, and every human moat decays at its own rate. This module projects
// risk forward and finds your "career half-life" — the moment >50% of your
// current week becomes automatable.
//
// The constants below are EXPLICIT, ARGUABLE ASSUMPTIONS (per year).
// Disagree? Change them — that is the point of making them visible.
import { MOATS, accelScore, taskRisk } from './scoring-model.js';

// Frontier closes roughly half of a task's remaining "automation-shape gap"
// every ~5 years: gap(t) = gap0 · e^(-CAPABILITY_CREEP·t).
export const CAPABILITY_CREEP = 0.14;

// Per-moat annual decay rates: how fast each defense erodes.
export const MOAT_DECAY = {
  accountability: 0.03, // regulation and liability move slowest of all
  trust: 0.06, // AI personas slowly erode relationship premiums
  embodied: 0.12, // robotics is the fastest-moving frontier
  taste: 0.08, // models acquire taste; persistent personal brands hold longer
  access: 0.05, // institutions guard their gates, but APIs creep in
};

export const HORIZON_YEARS = 15;

export function taskRiskAt(scores, years) {
  if (years <= 0) return taskRisk(scores);
  const gap = 1 - accelScore(scores);
  const accel = 1 - gap * Math.exp(-CAPABILITY_CREEP * years);
  const totalW = MOATS.reduce((a, d) => a + d.weight, 0);
  const moat =
    MOATS.reduce(
      (a, d) =>
        a +
        ((scores[d.key] ?? 0) / 4) * d.weight * Math.exp(-MOAT_DECAY[d.key] * years),
      0
    ) / totalW;
  return Math.round(100 * accel * (1 - moat));
}

// Hours-weighted survival of the whole week at time t.
export function survivalAt(tasks, years) {
  const totalHours = tasks.reduce((a, t) => a + t.hours, 0);
  if (!totalHours) return 0;
  const risk =
    tasks.reduce((a, t) => a + taskRiskAt(t.scores, years) * t.hours, 0) / totalHours;
  return Math.round(100 - risk);
}

// Years until survival first drops below 50 (monthly resolution).
// 0 = already there. null = outlives the 15-year projection horizon.
export function survivalHalfLife(tasks) {
  for (let m = 0; m <= HORIZON_YEARS * 12; m++) {
    if (survivalAt(tasks, m / 12) < 50) return m / 12;
  }
  return null;
}

// Calendar date (YYYY-MM) of the half-life, or null if beyond horizon.
export function halfLifeDate(tasks, from = new Date()) {
  const yrs = survivalHalfLife(tasks);
  if (yrs == null) return null;
  const d = new Date(from.getTime());
  d.setMonth(d.getMonth() + Math.round(yrs * 12));
  return d.toISOString().slice(0, 7);
}
