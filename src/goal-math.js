// Pure reverse-math for the income goal: from "X $/month growing g%/month"
// down to units to sell and leads to touch. All testable, no I/O.

// Target revenue for month N (1-based): base · (1+g)^(N-1)
export function monthTarget(goal, monthIdx) {
  return Math.round(goal.base * Math.pow(1 + goal.growth, monthIdx - 1));
}

export function ladder(goal, months = 12) {
  return Array.from({ length: months }, (_, i) => ({ month: i + 1, target: monthTarget(goal, i + 1) }));
}

// 1-based month index of `now` relative to the goal start date.
export function monthIndex(startDate, now = new Date()) {
  const s = new Date(startDate);
  return (now.getFullYear() - s.getFullYear()) * 12 + (now.getMonth() - s.getMonth()) + 1;
}

// Calendar key (YYYY-MM) of the Nth goal month.
export function monthKey(startDate, monthIdx) {
  const s = new Date(startDate);
  return new Date(Date.UTC(s.getFullYear(), s.getMonth() + monthIdx - 1, 1)).toISOString().slice(0, 7);
}

// Week 1..4 within the current calendar month (week 4 absorbs days 22-31).
export function weekOfMonth(now = new Date()) {
  return Math.min(4, Math.ceil(now.getDate() / 7));
}

// New units to sell this month after retained recurring revenue.
export function unitsForTarget(target, price, retained = 0) {
  return Math.max(0, Math.ceil(target / price) - retained);
}

// Leads needed to close `units` through a two-step funnel.
export function leadsForUnits(units, funnel) {
  return Math.ceil(units / (funnel.leadToCall * funnel.callToClose));
}

// How many months behind the curve actual revenue is (negative = ahead).
export function curveLag(goal, monthIdx, actual) {
  if (actual <= 0) return monthIdx;
  const effectiveMonth = Math.log(actual / goal.base) / Math.log(1 + goal.growth) + 1;
  return Math.round((monthIdx - effectiveMonth) * 10) / 10 || 0; // normalize -0

}

// Sum ledger entries for a calendar month key.
export function ledgerTotal(ledger = [], key) {
  return ledger.filter((e) => e.month === key).reduce((a, e) => a + e.amount, 0);
}
