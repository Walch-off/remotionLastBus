#!/usr/bin/env node
/** Контактный лист: рендерит N кадров и склеивает их в сетку (для просмотра). */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import * as esbuild from 'esbuild';
import {Resvg} from '@resvg/resvg-js';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

const ROOT = process.cwd();
const times = (process.argv[2] || '').split(',').filter(Boolean).map(Number);
const cols = Number(process.argv[3] || 6);
const W = Number(process.argv[4] || 300);
const outFile = process.argv[5] || 'out/strip.png';
const FONTS = ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'];
const out = path.join(ROOT, '.build/bundle.mjs');
await esbuild.build({
  entryPoints: [path.join(ROOT, 'src3/render-entry.tsx')],
  bundle: true, format: 'esm', platform: 'node', outfile: out, jsx: 'automatic',
  jsxImportSource: 'src3/engine', alias: {'src3/engine': path.join(ROOT, 'src3/engine')},
  absWorkingDir: ROOT, logLevel: 'error', external: ['node:*'],
});
const mod = await import(`file://${out}?t=${Date.now()}`);
const dir = path.join(ROOT, 'out/strip-frames');
fs.rmSync(dir, {recursive: true, force: true});
fs.mkdirSync(dir, {recursive: true});
times.forEach((t, i) => {
  const svg = mod.frameAt(t);
  const png = new Resvg(svg, {fitTo: {mode: 'width', value: W}, font: {fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'DejaVu Sans'}}).render().asPng();
  fs.writeFileSync(path.join(dir, `f${String(i).padStart(3, '0')}.png`), png);
});
const rows = Math.ceil(times.length / cols);
const r = spawnSync(ffmpegPath.path, [
  '-y', '-framerate', '1', '-i', path.join(dir, 'f%03d.png'),
  '-vf', `scale=${W}:-1,tile=${cols}x${rows}:padding=4:color=0x111111`,
  '-frames:v', '1', outFile,
], {encoding: 'utf8'});
if (r.status !== 0) console.error(r.stderr.slice(-800));
else console.log('strip:', outFile, times.join(' '));
