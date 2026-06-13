// Minimal readline helpers for interactive CLI flows. Zero dependencies.
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

let rl = null;
let isClosed = false;
const lineQueue = [];
let waiter = null;

// Lines are buffered in a queue so piped input (which can arrive between
// questions) is never dropped, and stdin EOF resolves as an empty answer
// instead of hanging the pending question forever.
export function openPrompt() {
  rl = createInterface({ input: stdin, output: stdout });
  isClosed = false;
  lineQueue.length = 0;
  rl.on('line', (line) => {
    if (waiter) {
      const w = waiter;
      waiter = null;
      w(line);
    } else lineQueue.push(line);
  });
  rl.once('close', () => {
    isClosed = true;
    if (waiter) {
      const w = waiter;
      waiter = null;
      w('');
    }
  });
  return rl;
}

export function closePrompt() {
  if (rl && !isClosed) rl.close();
  rl = null;
}

export async function ask(question) {
  process.stdout.write(question);
  if (lineQueue.length) {
    const line = lineQueue.shift();
    process.stdout.write(`${line}\n`);
    return line.trim();
  }
  if (isClosed || !rl) {
    process.stdout.write('\n');
    return '';
  }
  const line = await new Promise((resolve) => {
    waiter = resolve;
  });
  return line.trim();
}

// Ask for an integer in [0, 4]; re-asks on bad input, Enter defaults to def.
export async function askScale(question, hint, def = 2) {
  while (true) {
    const raw = await ask(`  ${question}\n  (${hint}) [0-4, enter=${def}]: `);
    if (raw === '') return def;
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 0 && n <= 4) return n;
    console.log('  please enter a whole number between 0 and 4');
  }
}

// Numbered pick from a list; Enter selects the first option. Returns index.
export async function askChoice(question, options) {
  options.forEach((o, i) => console.log(`  ${i + 1}. ${o.label}${o.note ? dim(` — ${o.note}`) : ''}`));
  while (true) {
    const raw = await ask(`${question} [1-${options.length}, enter=1]: `);
    if (raw === '') return 0;
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 1 && n <= options.length) return n - 1;
    console.log('pick a number from the list');
  }
}

export async function askNumber(question, def) {
  while (true) {
    const raw = await ask(`${question} [enter=${def}]: `);
    if (raw === '') return def;
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return n;
    console.log('please enter a positive number');
  }
}

export const bold = (s) => `\x1b[1m${s}\x1b[0m`;
export const dim = (s) => `\x1b[2m${s}\x1b[0m`;
export const green = (s) => `\x1b[32m${s}\x1b[0m`;
export const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
export const red = (s) => `\x1b[31m${s}\x1b[0m`;
export const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

export function bar(value, max = 100, width = 24) {
  const filled = Math.round((value / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function riskColor(risk) {
  if (risk >= 65) return red;
  if (risk >= 35) return yellow;
  return green;
}
