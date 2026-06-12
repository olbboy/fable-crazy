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
  ]) {
    assert.ok(html.includes(marker), `missing: ${marker}`);
  }
  assert.ok(!/^import /m.test(html), 'cross-file imports must be stripped');
  assert.ok(!html.includes('{{'), 'no unreplaced template placeholders');
});
