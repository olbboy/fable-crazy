// ---- rendering (browser, injected after the model) ----
const COLORS = { 'delegate': 'var(--red)', 'convert': 'var(--yellow)', 'double-down': 'var(--green)' };
const BUCKETS = [
  ['delegate', '🤖 Delegate to AI', 'Stop doing these by hand — keep ~30% of the hours as the reviewer.'],
  ['convert', '🔁 Convert your position', 'Same domain, new position: from doing the work to owning it.'],
  ['double-down', '🏰 Double down', 'This is the 40%. Pour the freed hours here.'],
];
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function halfLifeBanner(tasks) {
  const hl = survivalHalfLife(tasks);
  if (hl === 0) return '<div class="banner" style="border-left-color:var(--red)"><b>☠ Already past.</b> The majority of your week is automatable today. Reposition now, not later.</div>';
  if (hl == null) return '<div class="banner" style="border-left-color:var(--green)"><b>🏰 Half-life beyond the 15-year horizon.</b> Your week outlives the projection. Rare.</div>';
  return `<div class="banner"><b>☠ Career half-life: ~${halfLifeDate(tasks)}</b> (${hl.toFixed(1)} years)<br>
  <span class="muted">the date when &gt;50% of your current week becomes automatable, if you change nothing</span></div>`;
}

function horizonSvg(tasks) {
  const w = 680, h = 170, pad = 26;
  const pts = [];
  for (let y = 0; y <= 10; y += 0.5) {
    const s = survivalAt(tasks, y);
    pts.push([pad + (y / 10) * (w - 2 * pad), h - pad - (s / 100) * (h - 2 * pad)]);
  }
  const line = pts.map((p) => p.join(',')).join(' ');
  const y50 = h - pad - 0.5 * (h - 2 * pad);
  const hl = survivalHalfLife(tasks);
  const marker = hl != null && hl <= 10
    ? `<circle cx="${pad + (hl / 10) * (w - 2 * pad)}" cy="${y50}" r="5" fill="var(--red)"/>` : '';
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="survival projection">
    <line x1="${pad}" y1="${y50}" x2="${w - pad}" y2="${y50}" stroke="#374151" stroke-dasharray="5 5"/>
    <text x="${w - pad}" y="${y50 - 6}" fill="#6b7280" font-size="11" text-anchor="end">50% — half-life threshold</text>
    <polyline points="${line}" fill="none" stroke="var(--blue)" stroke-width="2.5"/>${marker}
    <text x="${pad}" y="${h - 8}" fill="#6b7280" font-size="11">now</text>
    <text x="${w / 2}" y="${h - 8}" fill="#6b7280" font-size="11" text-anchor="middle">+5y</text>
    <text x="${w - pad}" y="${h - 8}" fill="#6b7280" font-size="11" text-anchor="end">+10y</text>
  </svg>`;
}

function renderTaskList() {
  const el = document.querySelector('#task-list');
  el.innerHTML = state.tasks.map((t, i) => {
    const risk = taskRisk(t.scores);
    return `<div class="task-card"><span class="name">${escHtml(t.name)} <span class="muted">${t.hours}h/wk</span></span>
      <span class="chip" style="color:${COLORS[classify(risk)]}">${risk}</span>
      <button class="del" data-del="${i}" title="remove">✕</button></div>`;
  }).join('') || '<p class="muted">No tasks yet — add your week above, or load the sample to see how this works.</p>';
}

function renderResults() {
  const el = document.querySelector('#results');
  if (!state.tasks.length) { el.innerHTML = ''; return; }
  const s = survivalScore(state.tasks);
  const gaugeColor = s >= 65 ? 'var(--green)' : s >= 35 ? 'var(--yellow)' : 'var(--red)';
  const sorted = [...state.tasks].sort((a, b) => taskRisk(b.scores) - taskRisk(a.scores));

  const bars = sorted.map((t) => {
    const risk = taskRisk(t.scores);
    return `<div class="bar-row"><span class="name">${escHtml(t.name)}</span>
      <span class="track"><span class="fill" style="width:${risk}%;background:${COLORS[classify(risk)]}"></span></span>
      <span class="val">${risk}</span></div>`;
  }).join('');

  const buckets = BUCKETS.map(([key, title, note]) => {
    const items = sorted.filter((t) => classify(taskRisk(t.scores)) === key);
    if (!items.length) return '';
    const lis = items.map((t) => {
      const extra = key === 'convert'
        ? `<br><span class="play">${CONVERSION_PLAYBOOK[dominantMoat(t.scores).key]}</span>`
        : key === 'delegate'
          ? ` <span class="muted">(${t.hours}h/wk → keep ~${Math.round(t.hours * 3) / 10}h as reviewer)</span>` : '';
      return `<li>${escHtml(t.name)}${extra}</li>`;
    }).join('');
    return `<div class="bucket"><h3 style="color:${COLORS[key]}">${title}</h3><p class="note">${note}</p><ul>${lis}</ul></div>`;
  }).join('');

  el.innerHTML = `<h2>2 · Verdict</h2>
    <div class="gauge" style="color:${gaugeColor}">${s}<small>/100 survival</small></div>
    <p class="muted">100 = your week is untouchable by the next model · 0 = fully automatable</p>
    ${halfLifeBanner(state.tasks)}
    <h3>Task risk (AI-replaceability, today)</h3>${bars}
    <h3>Survival projection — capability creep + moat decay</h3>${horizonSvg(state.tasks)}
    ${buckets}
    <h3>Share your number</h3>
    <textarea class="share" readonly>${escHtml(shareText())}</textarea>
    <p><button data-action="copy-share" class="primary">copy</button></p>`;
}

function renderAssetAdvice() {
  const el = document.querySelector('#assets-advice');
  const ratings = state.assets?.ratings ?? {};
  if (!Object.keys(ratings).length) { el.innerHTML = ''; return; }
  const weakest = [...ASSET_CLASSES].sort((a, b) => (ratings[a.key] ?? 0) - (ratings[b.key] ?? 0)).slice(0, 2);
  el.innerHTML = `<div class="bucket"><h3 style="color:var(--blue)">⚡ Weakest moats — compound here first</h3>
    ${weakest.map((a) => `<p><b>${a.label}</b></p><ul>${a.actions.map((x) => `<li>${x}</li>`).join('')}</ul>`).join('')}</div>`;
}

function renderAll() { renderTaskList(); renderResults(); renderIncome(); renderAssetAdvice(); }
