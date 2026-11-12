#!/usr/bin/env node
/** Проверка всех кадров на падение resvg (в дочерних процессах: паника не ловится). */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd();
const step = Number(process.argv[2] || 30);
const entry = path.join(ROOT, '.build/bundle.mjs');
const fails = [];
const mod = await import(`file://${entry}?t=${Date.now()}`);
const total = Math.round(mod.DURATION * mod.FPS);
for (let f = 0; f < total; f += step) {
  const t = f / mod.FPS;
  const svg = mod.frameAt(t);
  const tmp = `/tmp/scan_${f}.svg`;
  fs.writeFileSync(tmp, svg);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/_one.mjs'), tmp], {encoding: 'utf8'});
  if (r.status !== 0) fails.push(t.toFixed(2));
  fs.unlinkSync(tmp);
}
console.log('checked upto', (total / mod.FPS).toFixed(1), 's; fails:', fails.join(',') || 'нет');
