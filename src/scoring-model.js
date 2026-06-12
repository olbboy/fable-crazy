// The core thesis: post-AGI, the bottleneck for remaining human work is NOT
// intelligence. A task survives automation when it is hard to specify, hard to
// verify, physically embodied, or gated by accountability/trust/access that
// machines cannot legally or socially carry.

// Automation accelerators — the higher, the faster a frontier model eats this task.
export const ACCELERATORS = [
  {
    key: 'codified',
    label: 'Codifiability',
    question: 'Could a complete written spec let a stranger do this task?',
    hint: '0 = calming a furious client mid-crisis · 4 = expense reports: an intern with a checklist nails it',
  },
  {
    key: 'digital',
    label: 'Digital I/O',
    question: 'Does this task happen entirely inside a computer?',
    hint: '0 = surgery, site visits · 4 = code, docs, spreadsheets',
  },
  {
    key: 'verifiable',
    label: 'Cheap verification',
    question: 'Can the output be checked right/wrong cheaply or automatically?',
    hint: '0 = "is this strategy right?" — experts disagree · 4 = tests pass, numbers reconcile',
  },
  {
    key: 'repetitive',
    label: 'Repetition',
    question: 'How similar is each instance of this task to the previous one?',
    hint: '0 = every instance is a new puzzle · 4 = same motion every day',
  },
];

// Human moats — the higher, the longer this task stays human.
// Weights reflect durability: liability and trust decay slowest.
export const MOATS = [
  {
    key: 'accountability',
    label: 'Accountability',
    weight: 1.25,
    question: 'Must a human legally/professionally own the outcome (signature, license, liability)?',
    hint: '0 = nobody signs anything · 4 = engineer-of-record, auditor, surgeon',
  },
  {
    key: 'trust',
    label: 'Personal trust',
    weight: 1.25,
    question: 'Does it depend on people trusting YOU specifically, built over years?',
    hint: '0 = clients would switch vendors for 5% off · 4 = they follow YOU across companies',
  },
  {
    key: 'embodied',
    label: 'Embodiment',
    weight: 1.0,
    question: 'Does it require physical presence, hands, or being in the room?',
    hint: '0 = doable from a beach forever · 4 = hands, rooms, hard hats',
  },
  {
    key: 'taste',
    label: 'Taste under ambiguity',
    weight: 1.0,
    question: 'Is "good" contested here — judgment calls with no objective answer?',
    hint: '0 = one correct answer exists · 4 = your selection IS the product',
  },
  {
    key: 'access',
    label: 'Privileged access',
    weight: 1.1,
    question: 'Does it need privileged access — people, capital, confidential context, an institutional seat?',
    hint: '0 = anyone with a laptop can do it · 4 = boardroom seats, confidential context, capital',
  },
];

export const ALL_DIMENSIONS = [...ACCELERATORS, ...MOATS];

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

// 0..1, how exposed the task shape is to automation
export function accelScore(scores) {
  return mean(ACCELERATORS.map((d) => scores[d.key] ?? 0)) / 4;
}

// 0..1, weighted strength of human moats around the task
export function moatScore(scores) {
  const totalW = MOATS.reduce((a, d) => a + d.weight, 0);
  const sum = MOATS.reduce((a, d) => a + (scores[d.key] ?? 0) * d.weight, 0);
  return sum / (4 * totalW);
}

// 0..100. Moats multiply risk down: a fully-moated task is safe even if codified.
export function taskRisk(scores) {
  return Math.round(100 * accelScore(scores) * (1 - moatScore(scores)));
}

export function classify(risk) {
  if (risk >= 65) return 'delegate'; // AI does it; you review or stop doing it
  if (risk >= 35) return 'convert'; // reposition: own/curate/front the task
  return 'double-down'; // genuine moat work: pour freed hours here
}

export const CLASS_META = {
  'delegate': { label: 'DELEGATE TO AI', color: '\x1b[31m', emoji: '🤖' },
  'convert': { label: 'CONVERT', color: '\x1b[33m', emoji: '🔁' },
  'double-down': { label: 'DOUBLE DOWN', color: '\x1b[32m', emoji: '🏰' },
};

// Hours-weighted survival score for a whole week: 100 = untouchable, 0 = fully exposed.
export function survivalScore(tasks) {
  const totalHours = tasks.reduce((a, t) => a + t.hours, 0);
  if (!totalHours) return 0;
  const weightedRisk =
    tasks.reduce((a, t) => a + taskRisk(t.scores) * t.hours, 0) / totalHours;
  return Math.round(100 - weightedRisk);
}

// Strongest moat dimension of a task — drives the conversion playbook.
export function dominantMoat(scores) {
  return MOATS.reduce((best, d) =>
    (scores[d.key] ?? 0) * d.weight > (scores[best.key] ?? 0) * best.weight ? d : best
  );
}
