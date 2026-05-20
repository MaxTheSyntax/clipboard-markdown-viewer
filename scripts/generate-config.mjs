// Reads amplify_outputs.json (produced by `ampx pipeline-deploy` / `ampx sandbox`)
// and emits config.js so the static index.html can pick up the function URL.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const outputsPath = resolve(root, 'amplify_outputs.json');
const configPath = resolve(root, 'config.js');

if (!existsSync(outputsPath)) {
  console.warn('[generate-config] amplify_outputs.json not found — writing empty config.');
  writeFileSync(configPath, 'window.APP_CONFIG = {};\n');
  process.exit(0);
}

const outputs = JSON.parse(readFileSync(outputsPath, 'utf8'));
const custom = outputs.custom ?? {};
const notesApiUrl = custom.notesApiUrl ?? '';

const body = `window.APP_CONFIG = ${JSON.stringify({ notesApiUrl }, null, 2)};\n`;
writeFileSync(configPath, body);
console.log(`[generate-config] wrote ${configPath}`);
console.log(`  notesApiUrl=${notesApiUrl || '(missing)'}`);
