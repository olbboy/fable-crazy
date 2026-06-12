// Pure sample data (a typical software engineer's week) shared by the CLI
// demo command and the web app's "load sample week" button.

const s = (codified, digital, verifiable, repetitive, accountability, trust, embodied, taste, access) =>
  ({ codified, digital, verifiable, repetitive, accountability, trust, embodied, taste, access });

export const DEMO_TASKS = [
  { name: 'Writing CRUD features & glue code', hours: 14, scores: s(4, 4, 3, 3, 1, 0, 0, 1, 0) },
  { name: 'Writing status reports & docs', hours: 4, scores: s(4, 4, 2, 4, 1, 1, 0, 1, 0) },
  { name: 'Debugging production issues', hours: 5, scores: s(2, 4, 3, 2, 2, 1, 0, 1, 2) },
  { name: 'Code review & production sign-off', hours: 6, scores: s(2, 4, 2, 2, 4, 2, 0, 2, 2) },
  { name: 'Architecture decisions with trade-offs', hours: 5, scores: s(1, 3, 1, 1, 3, 2, 0, 4, 2) },
  { name: 'Client meetings & requirement negotiation', hours: 6, scores: s(1, 2, 0, 1, 3, 4, 2, 3, 3) },
  { name: 'Incident response & war-room calls', hours: 3, scores: s(1, 3, 2, 0, 4, 3, 1, 3, 4) },
  { name: 'Mentoring juniors & hiring interviews', hours: 3, scores: s(1, 2, 0, 1, 2, 4, 2, 3, 2) },
];

export const DEMO_ASSETS = {
  reputation: 2, network: 1, audience: 0, credentials: 1, context: 3, capital: 1,
};
