// Build the single-file web app and open it in the browser. The resulting
// dist/moat-web.html is the whole product: host it anywhere or email it.
import { execFile } from 'node:child_process';
import { buildWebApp } from './build-web-app.js';

export function runWeb() {
  const out = buildWebApp();
  console.log(`web app built → ${out}`);
  console.log('single file, fully local — host it anywhere (GitHub Pages, S3) or just send the file');
  if (process.platform === 'darwin') execFile('open', [out]);
}
