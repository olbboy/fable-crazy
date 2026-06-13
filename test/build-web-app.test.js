import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildWebApp } from '../src/build-web-app.js';

test('web app build inlines model, render, ui and styles', () => {
  const html = readFileSync(buildWebApp(), 'utf8');
  for (const marker of [
    'export function taskRisk', // scoring model injected
    'export function survivalHalfLife', // horizon model injected
    'CONVERSION_PLAYBOOK', // strategy playbook injected
    'DEMO_TASKS', // sample week injected
    'function renderResults', // render layer injected
    'buildTaskForm();', // ui bootstrap injected
    '--bg: #0b0f17', // styles injected
    'export function buildSprint', // sprint engine injected
    'export function rankVentures', // venture matcher injected
    'function renderIncome', // income engine UI injected
  ]) {
    assert.ok(html.includes(marker), `missing: ${marker}`);
  }
  assert.ok(!/^import /m.test(html), 'cross-file imports must be stripped');
  assert.ok(!/from '\.\/[\w-]+\.js'/.test(html), 'no orphaned multi-line import tails');
  assert.ok(!html.includes('{{'), 'no unreplaced template placeholders');
});

test('built module script parses as valid JavaScript', async () => {
  const html = readFileSync(buildWebApp(), 'utf8');
  const src = html.split('<script type="module">')[1].split('</script>')[0];
  // new Function() rejects `export`/top-level syntax errors differently —
  // strip export keywords (browser-only) and parse the rest for sanity.
  const parseable = src.replace(/^export /gm, '');
  assert.doesNotThrow(() => new Function(parseable));
});
