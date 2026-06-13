// ---- income engine UI (browser, injected after render) ----
// Goal setup → moat-matched venture picker → weekly sprint with copyable
// AI prompts → revenue log → curve vs reality. All localStorage, no server.
let lastSprint = null; // cache so copy-prompt buttons can look up prompt text

// Adapt web state to the {audits, assets} shape the matcher expects.
function matcherData() {
  const hasAssets = Object.values(state.assets?.ratings ?? {}).some((v) => v > 0);
  return {
    audits: state.tasks.length ? [{ tasks: state.tasks }] : [],
    assets: hasAssets ? state.assets : null,
  };
}

function ventureOptionsHtml(selectedKey) {
  return rankVentures(matcherData()).map((r, i) => `
    <label class="venture-option">
      <input type="radio" name="venture" value="${r.pb.key}" ${(selectedKey ? r.pb.key === selectedKey : i === 0) ? 'checked' : ''}>
      <span><b>${r.pb.label}</b> <span class="fit">fit ${r.fit}%</span><br>
      <small>${r.reason} · ${r.pb.pitch}</small></span>
    </label>`).join('');
}

function goalSetupHtml() {
  return `<div class="card">
    <p class="muted">Honesty first: no tool can <em>guarantee</em> revenue. This one guarantees
    <b>detection</b> — falsifiable weekly quotas, drift correction when you slip, and kill
    criteria that force a pivot before you waste a quarter.</p>
    <div class="field-row">
      <label class="inline">$/month to start <input type="number" id="g-base" value="1000" min="50" step="50"></label>
      <label class="inline">growth %/month <input type="number" id="g-growth" value="20" min="0" max="100"></label>
    </div>
    <div class="dim-group">income engines, ranked against your moat profile</div>
    <div id="venture-options">${ventureOptionsHtml()}</div>
    <div class="field-row" style="margin-top:12px">
      <label class="inline">price per unit ($) <input type="number" id="g-price" value="${rankVentures(matcherData())[0].pb.price.default}" min="5"></label>
    </div>
    <input type="text" id="g-niche" placeholder="who exactly do you serve? e.g. ${rankVentures(matcherData())[0].pb.nicheExample}" style="width:100%;margin:6px 0">
    <input type="text" id="g-offer" placeholder="your offer in one line (leave empty for a sensible default)" style="width:100%;margin:6px 0">
    <p><button data-action="start-engine" class="primary">🚀 start the engine</button></p>
  </div>`;
}

function curveHtml() {
  const current = Math.max(1, monthIndex(state.goal.startDate));
  const rows = [];
  for (let m = 1; m <= Math.max(current, 6); m++) {
    const target = monthTarget(state.goal, m);
    const actual = ledgerTotal(state.ledger, monthKey(state.goal.startDate, m));
    const pct = Math.min(100, Math.round((actual / target) * 100));
    const future = m > current;
    const color = actual >= target ? 'var(--green)' : pct >= 70 ? 'var(--yellow)' : 'var(--red)';
    rows.push(`<div class="bar-row"><span class="name">${m === current ? '→ ' : ''}m${m} · target $${target}</span>
      <span class="track">${future ? '' : `<span class="fill" style="width:${pct}%;background:${color}"></span>`}</span>
      <span class="val">${future ? '—' : `$${actual}`}</span></div>`);
  }
  const actualNow = ledgerTotal(state.ledger, monthKey(state.goal.startDate, current));
  const lag = curveLag(state.goal, current, actualNow);
  const verdict = actualNow >= monthTarget(state.goal, current)
    ? '<span style="color:var(--green)">✓ ON or AHEAD of the curve — raise prices before raising volume.</span>'
    : actualNow <= 0
      ? '<span style="color:var(--red)">✗ $0 booked this month — ship the first sale, nothing else matters.</span>'
      : `<span style="color:var(--yellow)">⚠ running ~${lag} month(s) behind the curve — the quotas below already recalibrate around the gap.</span>`;
  return `<h3>The curve vs reality</h3>${rows.join('')}<p>${verdict}</p>`;
}

function sprintHtml() {
  lastSprint = buildSprint(state);
  const s = lastSprint;
  const doneKey = (i) => `${s.month}-${s.week}-${i}`;
  const cards = s.tasks.map((t, i) => {
    const done = state.doneTasks?.[doneKey(i)];
    return `<div class="card task-sprint ${done ? 'done' : ''}">
      <label class="task-head"><input type="checkbox" data-done="${doneKey(i)}" ${done ? 'checked' : ''}>
        <b>${i + 1}. ${t.title}</b> <span class="muted">~${t.hours}h</span></label>
      <p>${t.detail}</p>
      <div class="prompt-box"><div class="prompt-label">🤖 paste to your AI
        <button class="copy-btn" data-copy-prompt="${i}">copy</button></div>
        <pre class="prompt">${t.aiPrompt.replace(/</g, '&lt;')}</pre></div>
      <p class="human-edge">🧍 <b>only you:</b> ${t.humanEdge}</p>
    </div>`;
  }).join('');
  return `<h3>This week's sprint — month ${s.month}, week ${s.week} <span class="muted">~${s.totalHours}h total</span></h3>
    <p class="muted">to close: <b>${s.unitsLeft}</b> unit(s) → <b>${s.leadsThisWeek}</b> touches → ~${s.callsThisWeek} calls this week</p>
    ${cards}`;
}

function renderIncome() {
  const el = document.querySelector('#income');
  if (!state.goal) { el.innerHTML = goalSetupHtml(); return; }
  el.innerHTML = `<div class="card">
      <b>${state.venture.offer}</b><br>
      <span class="muted">$${state.venture.price}/unit · serving ${state.venture.niche} ·
      goal $${state.goal.base}/mo +${Math.round(state.goal.growth * 100)}%/mo since ${state.goal.startDate}</span>
      <p style="margin:10px 0 0"><button data-action="change-goal" class="danger">change goal (resets income data)</button></p>
    </div>
    ${curveHtml()}
    <div class="card field-row">
      <input type="number" id="log-amount" placeholder="revenue $" min="1" style="width:120px">
      <input type="text" id="log-note" placeholder="note (e.g. first client)" style="flex:1">
      <button data-action="log-revenue" class="primary">log it</button>
    </div>
    ${sprintHtml()}`;
}

function startEngine() {
  const base = Math.max(50, Number(document.querySelector('#g-base').value) || 1000);
  const growth = Math.max(0, Number(document.querySelector('#g-growth').value) || 20) / 100;
  const key = document.querySelector('input[name=venture]:checked')?.value;
  const pb = PLAYBOOKS[key];
  if (!pb) return;
  const price = Math.max(5, Number(document.querySelector('#g-price').value) || pb.price.default);
  const niche = document.querySelector('#g-niche').value.trim() || pb.nicheExample;
  const offer = document.querySelector('#g-offer').value.trim() || fill(pb.offerExample, { niche, price });
  state.goal = { base, growth, startDate: new Date().toISOString().slice(0, 10) };
  state.venture = { key, price, niche, offer };
  state.ledger = state.ledger ?? [];
  state.doneTasks = {};
  persist(); renderIncome();
  document.querySelector('#income').scrollIntoView({ behavior: 'smooth' });
}

function logRevenue() {
  const amount = Number(document.querySelector('#log-amount').value);
  if (!Number.isFinite(amount) || amount === 0) return;
  const note = document.querySelector('#log-note').value.trim() || undefined;
  const month = monthKey(state.goal.startDate, Math.max(1, monthIndex(state.goal.startDate)));
  state.ledger.push({ month, amount, note });
  persist(); renderIncome();
}
