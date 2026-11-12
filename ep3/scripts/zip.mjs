#!/usr/bin/env node
/** Упаковка исходника эп3: только исходники/конфиг/ассеты, без node_modules, кэшей и промежуточных файлов. */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const ROOT = process.cwd();
const OUT = process.argv[2] || path.join(ROOT, 'out/part3-source.zip');
const INCLUDE = [
  'package.json', 'package-lock.json', 'tsconfig.json', 'README.md', '.gitignore',
  'src3', 'scripts', 'assets', 'public/audio3/voice3_original.wav', 'public/audio3/mix.wav',
];
const items = INCLUDE.filter((p) => fs.existsSync(path.join(ROOT, p)));
const r = spawnSync('zip', ['-r', '-q', OUT, ...items, '-x', '*/node_modules/*', '*/.build/*', '*/out/*'], {
  cwd: ROOT, encoding: 'utf8',
});
if (r.status !== 0) { console.error(r.stderr || r.error); process.exit(1); }
const st = fs.statSync(OUT);
console.log(`zip: ${OUT} ${(st.size / 1048576).toFixed(1)} MB, files: ${items.join(' ')}`);
