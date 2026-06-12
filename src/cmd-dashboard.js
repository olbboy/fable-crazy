// Generate a self-contained dark-mode HTML dashboard (zero deps, inline SVG)
// and open it in the browser.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { taskRisk, classify } from './scoring-model.js';
import { ASSET_CLASSES } from './cmd-assets.js';
import { load, latestAudit, DATA_DIR } from './storage.js';

const CLS_COLOR = { 'delegate': '#f87171', 'convert': '#fbbf24', 'double-down': '#4ade80' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function trendSvg(audits) {
  if (audits.length < 2) return '<p class="dim">run more audits over time to see your survival trend</p>';
  const w = 640, h = 120, pad = 10;
  const xs = audits.map((_, i) => pad + (i * (w - 2 * pad)) / (audits.length - 1));
  const ys = audits.map((a) => h - pad - (a.survival / 100) * (h - 2 * pad));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const dots = xs.map((x, i) =>
    `<circle cx="${x}" cy="${ys[i]}" r="4" fill="#4ade80"/><text x="${x}" y="${ys[i] - 8}" fill="#9ca3af" font-size="11" text-anchor="middle">${audits[i].survival}</text>`
  ).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%"><polyline points="${pts}" fill="none" stroke="#4ade80" stroke-width="2"/>${dots}</svg>`;
}

function taskRows(tasks) {
  return [...tasks]
    .sort((a, b) => taskRisk(b.scores) - taskRisk(a.scores))
    .map((t) => {
      const risk = taskRisk(t.scores);
      const color = CLS_COLOR[classify(risk)];
      return `<div class="row"><span class="name">${esc(t.name)} <span class="dim">${t.hours}h/wk</span></span>
        <span class="track"><span class="fill" style="width:${risk}%;background:${color}"></span></span>
        <span class="val" style="color:${color}">${risk}</span></div>`;
    }).join('\n');
}

function assetRows(assets) {
  if (!assets) return '<p class="dim">run `moat assets` to inventory your moat capital</p>';
  return ASSET_CLASSES.map((a) => {
    const r = assets.ratings[a.key] ?? 0;
    return `<div class="row"><span class="name">${a.label}</span>
      <span class="track"><span class="fill" style="width:${r * 25}%;background:#60a5fa"></span></span>
      <span class="val">${r}/4</span></div>`;
  }).join('\n');
}

export function runDashboard() {
  const data = load();
  const audit = latestAudit(data);
  if (!audit) {
    console.log('no audit yet — run `moat audit` or `moat demo` first');
    return;
  }
  const s = audit.survival;
  const gaugeColor = s >= 65 ? '#4ade80' : s >= 35 ? '#fbbf24' : '#f87171';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>MOAT dashboard</title><style>
  body{background:#0b0f17;color:#e5e7eb;font:15px/1.5 -apple-system,system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px}
  h1{font-size:22px} h2{font-size:15px;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-top:36px}
  .gauge{font-size:64px;font-weight:800;color:${gaugeColor}} .dim{color:#6b7280;font-size:13px}
  .row{display:flex;align-items:center;gap:12px;margin:7px 0}
  .name{flex:0 0 320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .track{flex:1;height:10px;background:#1f2937;border-radius:5px;overflow:hidden}
  .fill{display:block;height:100%;border-radius:5px}
  .val{flex:0 0 36px;text-align:right;font-variant-numeric:tabular-nums}
  .legend span{margin-right:18px;font-size:13px}
  </style></head><body>
  <h1>🏰 MOAT — anti-obsolescence dashboard <span class="dim">${audit.date}</span></h1>
  <div class="gauge">${s}<span style="font-size:24px;color:#6b7280">/100 survival</span></div>
  <p class="dim">100 = your week is untouchable by the next model · 0 = fully automatable</p>
  <h2>Task risk (AI-replaceability)</h2>
  <p class="legend"><span style="color:#f87171">■ delegate to AI</span><span style="color:#fbbf24">■ convert position</span><span style="color:#4ade80">■ double down</span></p>
  ${taskRows(audit.tasks)}
  <h2>Survival trend</h2>
  ${trendSvg(data.audits)}
  <h2>Moat assets</h2>
  ${assetRows(data.assets)}
  </body></html>`;

  const out = join(DATA_DIR, 'moat-dashboard.html');
  writeFileSync(out, html);
  console.log(`dashboard written → ${out}`);
  if (process.platform === 'darwin') execFile('open', [out]);
}
