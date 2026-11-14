// Быстрый просмотр: рендерит выбранные моменты (секунды) в PNG и склеивает лист.
// node scripts/stills.mjs out/sheet.jpg 1.0 2.5 ...   (COMP=LastBusPart4 SCALE=0.34)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {spawnSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const [outFile, ...times] = process.argv.slice(2);
const comp = process.env.COMP ?? 'LastBusPart4';
const scale = Number(process.env.SCALE ?? 0.34);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: comp});
fs.mkdirSync('out/st', {recursive: true});
const files = [];
for (const [i, s] of times.entries()) {
  const f = `out/st/${String(i).padStart(3, '0')}.png`;
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * 30));
  await renderStill({serveUrl, composition, output: f, frame, scale});
  const lab = `out/st/${String(i).padStart(3, '0')}_l.png`;
  spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', f, '-vf', `drawtext=text='${s}':x=8:y=8:fontsize=26:fontcolor=yellow:box=1:boxcolor=black`, lab]);
  files.push(fs.existsSync(lab) ? lab : f);
}
const cols = Math.min(6, files.length);
const layout = files.map((_, i) => {
  const c = i % cols, r = Math.floor(i / cols);
  const x = c ? Array.from({length: c}, (_, k) => `w${k}`).join('+') : '0';
  const y = r ? Array.from({length: r}, (_, k) => `h${k * cols}`).join('+') : '0';
  return `${x}_${y}`;
}).join('|');
const args = ['-loglevel', 'error', '-y'];
files.forEach((f) => args.push('-i', f));
args.push('-filter_complex', `xstack=inputs=${files.length}:layout=${layout}:fill=black`, outFile);
const r = spawnSync('ffmpeg', args, {stdio: 'inherit'});
console.log('sheet', outFile, files.length, r.status);
