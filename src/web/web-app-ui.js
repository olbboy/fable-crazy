// ---- state + interactions (browser, injected after render) ----
const LS_KEY = 'moat-web-v1';
let state = loadState();

function loadState() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY));
    if (d && Array.isArray(d.tasks)) {
      return {
        tasks: d.tasks, assets: d.assets ?? { ratings: {} },
        goal: d.goal ?? null, venture: d.venture ?? null,
        ledger: d.ledger ?? [], doneTasks: d.doneTasks ?? {},
      };
    }
  } catch { /* corrupt local data: start fresh */ }
  return { tasks: [], assets: { ratings: {} }, goal: null, venture: null, ledger: [], doneTasks: {} };
}
const persist = () => localStorage.setItem(LS_KEY, JSON.stringify(state));

function dimRow(d, value, dataAttr) {
  return `<label class="dim-row"><span class="q">${d.question}<small>${d.hint}</small></span>
    <input type="range" min="0" max="4" step="1" value="${value}" ${dataAttr}><output>${value}</output></label>`;
}

function buildTaskForm() {
  const rows = (dims) => dims.map((d) => dimRow(d, 2, `data-dim="${d.key}"`)).join('');
  document.querySelector('#task-form').innerHTML = `
    <div class="field-row">
      <input type="text" id="t-name" placeholder="task name — e.g. weekly client reporting" maxlength="80">
      <input type="number" id="t-hours" min="0.5" step="0.5" value="4" title="hours per week">
    </div>
    <div class="dim-group">how automatable is the shape of this task</div>${rows(ACCELERATORS)}
    <div class="dim-group">how strong are the human moats around it</div>${rows(MOATS)}
    <p style="margin:14px 0 2px"><button data-action="add-task" class="primary">+ add task</button></p>`;
}

function buildAssetSliders() {
  const ratings = state.assets?.ratings ?? {};
  document.querySelector('#assets-sliders').innerHTML = ASSET_CLASSES.map((a) =>
    dimRow({ question: `${a.label} — ${a.question}`, hint: a.hint }, ratings[a.key] ?? 0, `data-asset="${a.key}"`)
  ).join('');
}

function addTask() {
  const name = document.querySelector('#t-name').value.trim();
  if (!name) { document.querySelector('#t-name').focus(); return; }
  const hours = Math.max(0.5, Number(document.querySelector('#t-hours').value) || 4);
  const scores = {};
  document.querySelectorAll('#task-form input[type=range]').forEach((r) => { scores[r.dataset.dim] = Number(r.value); });
  state.tasks.push({ name, hours, scores });
  persist();
  buildTaskForm();
  renderAll();
  document.querySelector('#t-name').focus();
}

function shareText() {
  const s = survivalScore(state.tasks);
  const hl = survivalHalfLife(state.tasks);
  const when = hl === 0 ? 'already past' : hl == null ? 'beyond 15 years' : `~${halfLifeDate(state.tasks)}`;
  const sorted = [...state.tasks].sort((a, b) => taskRisk(b.scores) - taskRisk(a.scores));
  const top = sorted[0], safe = sorted[sorted.length - 1];
  return `🏰 My MOAT survival score: ${s}/100
☠ Career half-life: ${when} — the date >50% of my week becomes automatable
Most exposed: ${top.name} (${taskRisk(top.scores)}/100) · strongest moat: ${safe.name} (${taskRisk(safe.scores)}/100)
Audited with MOAT — free, local, no signup. What's yours?`;
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'moat-data.json' });
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJson(file) {
  file.text().then((txt) => {
    const d = JSON.parse(txt);
    if (!Array.isArray(d.tasks)) throw new Error('bad shape');
    state = {
      tasks: d.tasks, assets: d.assets ?? { ratings: {} },
      goal: d.goal ?? null, venture: d.venture ?? null,
      ledger: d.ledger ?? [], doneTasks: d.doneTasks ?? {},
    };
    persist(); buildAssetSliders(); renderAll();
  }).catch(() => alert('That file is not a valid MOAT export.'));
}

document.addEventListener('input', (e) => {
  if (!e.target.matches('input[type=range]')) return;
  e.target.parentElement.querySelector('output').textContent = e.target.value;
  if (e.target.dataset.asset) {
    state.assets.ratings[e.target.dataset.asset] = Number(e.target.value);
    persist(); renderAssetAdvice();
  }
});

// Venture radio: sync price/niche/offer defaults without a disruptive re-render.
document.addEventListener('change', (e) => {
  if (e.target.matches('input[name=venture]')) {
    const pb = PLAYBOOKS[e.target.value];
    document.querySelector('#g-price').value = pb.price.default;
    document.querySelector('#g-niche').placeholder = `who exactly do you serve? e.g. ${pb.nicheExample}`;
    return;
  }
  if (e.target.dataset.done) {
    state.doneTasks[e.target.dataset.done] = e.target.checked;
    persist(); renderIncome();
  }
});

document.addEventListener('click', (e) => {
  const t = e.target;
  if (t.dataset.del !== undefined) { state.tasks.splice(Number(t.dataset.del), 1); persist(); renderAll(); return; }
  if (t.dataset.copyPrompt !== undefined) {
    const prompt = lastSprint?.tasks[Number(t.dataset.copyPrompt)]?.aiPrompt ?? '';
    navigator.clipboard.writeText(prompt).then(() => { t.textContent = 'copied ✓'; setTimeout(() => { t.textContent = 'copy'; }, 1500); });
    return;
  }
  switch (t.dataset.action) {
    case 'add-task': addTask(); break;
    case 'sample':
      state = {
        ...state, tasks: structuredClone(DEMO_TASKS), assets: { ratings: { ...DEMO_ASSETS } },
      };
      persist(); buildAssetSliders(); renderAll(); break;
    case 'export': exportJson(); break;
    case 'import': document.querySelector('#import-file').click(); break;
    case 'copy-share':
      navigator.clipboard.writeText(shareText()).then(() => { t.textContent = 'copied ✓'; setTimeout(() => { t.textContent = 'copy'; }, 1500); });
      break;
    case 'start-engine': startEngine(); break;
    case 'log-revenue': logRevenue(); break;
    case 'change-goal':
      if (confirm('Reset goal, venture and revenue log? (Audit & assets are kept.)')) {
        state.goal = null; state.venture = null; state.ledger = []; state.doneTasks = {};
        persist(); renderIncome();
      }
      break;
    case 'reset':
      if (confirm('Erase all locally stored MOAT data?')) {
        state = { tasks: [], assets: { ratings: {} }, goal: null, venture: null, ledger: [], doneTasks: {} };
        persist(); buildAssetSliders(); renderAll();
      }
      break;
  }
});

document.querySelector('#import-file').addEventListener('change', (e) => {
  if (e.target.files[0]) importJson(e.target.files[0]);
  e.target.value = '';
});

buildTaskForm();
buildAssetSliders();
renderAll();
