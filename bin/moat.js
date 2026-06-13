#!/usr/bin/env node
// MOAT — anti-obsolescence engine. Command router.
import { runAudit, printAuditSummary } from '../src/cmd-audit.js';
import { runAssets, printAssets } from '../src/cmd-assets.js';
import { runPlan } from '../src/cmd-plan.js';
import { runHorizon } from '../src/cmd-horizon.js';
import { runDashboard } from '../src/cmd-dashboard.js';
import { runCoach } from '../src/cmd-coach.js';
import { runWeb } from '../src/cmd-web.js';
import { runDemo } from '../src/cmd-demo.js';
import { runGoal } from '../src/cmd-goal.js';
import { runSprint } from '../src/cmd-sprint.js';
import { runLog, runCurve } from '../src/cmd-ledger.js';
import { load, latestAudit } from '../src/storage.js';
import { bold, dim } from '../src/prompts.js';

const HELP = `
${bold('🏰 MOAT')} — survive the next model release
${dim('scores your working week by AI-replaceability, then tells you where to move')}

  ${bold('moat audit')}      interview: score each weekly task on 9 dimensions
  ${bold('moat plan')}       reallocation plan: delegate / convert / double down
  ${bold('moat horizon')}    capability-creep projection + your career half-life date
  ${bold('moat assets')}     inventory your durable career capital (6 classes)
  ${bold('moat dashboard')}  self-contained HTML dashboard with trend
  ${bold('moat coach')}      pipe your data to \`claude\` for a brutal strategy session
  ${bold('moat web')}        build the single-file web app (share it with anyone)
  ${bold('moat status')}     latest survival score + assets at a glance
  ${bold('moat demo')}       seed sample data to explore instantly

${dim('income engine — from goal to weekly atomic tasks:')}
  ${bold('moat goal')}       set $/month + growth %, pick the venture that fits your moats
  ${bold('moat sprint')}     this week's tasks: quotas, AI prompts, human-only parts
  ${bold('moat log')}        record real revenue (\`moat log 300 first client\`)
  ${bold('moat curve')}      target vs reality, drift lag, reforecast
`;

function runStatus() {
  const data = load();
  const audit = latestAudit(data);
  if (!audit) return console.log('no data yet — run `moat audit` or `moat demo`');
  printAuditSummary(audit);
  if (data.assets) printAssets(data.assets);
}

const commands = {
  audit: runAudit,
  plan: runPlan,
  horizon: runHorizon,
  assets: runAssets,
  dashboard: runDashboard,
  coach: runCoach,
  web: runWeb,
  status: runStatus,
  demo: runDemo,
  goal: runGoal,
  sprint: runSprint,
  log: runLog,
  curve: runCurve,
};

const cmd = process.argv[2];
if (commands[cmd]) {
  await commands[cmd](process.argv.slice(3));
} else {
  console.log(HELP);
}
