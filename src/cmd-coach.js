// The crazy part: use the very AI that threatens your job as your
// survival coach. Builds a strategist prompt from your audit data and
// pipes it to the local `claude` CLI. Falls back to printing the prompt.
import { spawn } from 'node:child_process';
import { taskRisk, classify } from './scoring-model.js';
import { survivalHalfLife, halfLifeDate } from './horizon-model.js';
import { ASSET_CLASSES } from './strategy-playbook.js';
import { load, latestAudit } from './storage.js';
import { dim } from './prompts.js';

function buildPrompt(data) {
  const audit = latestAudit(data);
  const taskLines = audit.tasks.map((t) =>
    `- "${t.name}" — ${t.hours}h/week, automation risk ${taskRisk(t.scores)}/100, bucket: ${classify(taskRisk(t.scores))}`
  ).join('\n');
  const assetLines = data.assets
    ? ASSET_CLASSES.map((a) => `- ${a.label}: ${data.assets.ratings[a.key] ?? 0}/4`).join('\n')
    : '(no asset inventory yet)';

  return `You are a brutally honest career strategist preparing a knowledge worker for a world where frontier AI models can do most cognitive work. No platitudes, no "AI won't replace you, people using AI will" clichés.

Their current week (from an automation-risk audit, risk 0-100):
${taskLines}

Hours-weighted survival score: ${audit.survival}/100.
Projected career half-life (date when >50% of their week becomes automatable under capability-creep assumptions): ${(() => {
    const hl = survivalHalfLife(audit.tasks);
    if (hl === 0) return 'ALREADY PAST — their week is majority-automatable today';
    return hl == null ? 'beyond 15 years' : `${halfLifeDate(audit.tasks)} (~${hl.toFixed(1)} years away)`;
  })()}.

Their durable career assets (0-4):
${assetLines}

Give them:
1. The single most dangerous pattern you see in this data.
2. A concrete 90-day repositioning move — specific enough to start Monday.
3. One income stream they could build where AI is the workforce and they own the margin.
4. The hardest question they are avoiding.

Be specific to THIS data. Under 400 words.`;
}

export function runCoach() {
  const data = load();
  if (!latestAudit(data)) {
    console.log('no audit yet — run `moat audit` or `moat demo` first');
    return;
  }
  const prompt = buildPrompt(data);
  console.log(dim('asking the machine how to survive the machine...\n'));

  const child = spawn('claude', ['-p', prompt], { stdio: ['ignore', 'inherit', 'inherit'] });
  child.on('error', () => {
    console.log('`claude` CLI not found — paste this into any frontier model:\n');
    console.log(prompt);
  });
}
