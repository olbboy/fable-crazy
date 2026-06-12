// Assemble the single-file web app: inject the SAME model source the CLI
// uses (scoring, horizon, playbook, sample week) into the HTML template,
// so web and CLI can never drift apart.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// Modules are concatenated into one <script type="module"> scope, so
// cross-file imports are dropped; `export` declarations remain valid.
const stripImports = (src) => src.replace(/^import .*$/gm, '');

export function buildWebApp() {
  const model = ['src/scoring-model.js', 'src/horizon-model.js', 'src/strategy-playbook.js', 'src/demo-week-data.js']
    .map((p) => stripImports(read(p)))
    .join('\n');

  const html = read('src/web/web-app-template.html')
    .replace('/*{{STYLES}}*/', () => read('src/web/web-app-styles.css'))
    .replace('/*{{MODEL}}*/', () => model)
    .replace('/*{{RENDER}}*/', () => read('src/web/web-app-render.js'))
    .replace('/*{{UI}}*/', () => read('src/web/web-app-ui.js'));

  const outDir = join(ROOT, 'dist');
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, 'moat-web.html');
  writeFileSync(out, html);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`web app built → ${buildWebApp()}`);
}
