// JSON persistence for audits, asset inventory, and score history.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DATA_DIR = join(ROOT, 'data');
const DATA_FILE = join(DATA_DIR, 'moat-data.json');

const EMPTY = { audits: [], assets: null };

export function load() {
  if (!existsSync(DATA_FILE)) return structuredClone(EMPTY);
  try {
    return { ...structuredClone(EMPTY), ...JSON.parse(readFileSync(DATA_FILE, 'utf8')) };
  } catch {
    console.error('warn: data file corrupt, starting fresh');
    return structuredClone(EMPTY);
  }
}

export function save(data) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function latestAudit(data) {
  return data.audits.at(-1) ?? null;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
