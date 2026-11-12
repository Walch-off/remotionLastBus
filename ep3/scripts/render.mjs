#!/usr/bin/env node
/**
 * Рендер без Remotion/Chrome: кадр -> SVG (esbuild-бандл) -> PNG (resvg) -> ffmpeg.
 *
 *   node scripts/render.mjs --stills 3,12.5 [--only shotId] [--out out/stills]
 *   node scripts/render.mjs --video [--from 0] [--to 20] [--out out/video.mp4]
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import * as esbuild from 'esbuild';
import {Resvg} from '@resvg/resvg-js';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

const ROOT = process.cwd();
const FONTS = ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'];

const args = process.argv.slice(2);
const arg = (k, def) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : def;
};
const has = (k) => args.includes(k);

async function bundle(force = false) {
  const out = path.join(ROOT, '.build/bundle.mjs');
  if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs > Date.now() - 3000) {
    // не пересобираем чаще, чем раз в 3 с (внутри одного процесса не нужно)
  }
  fs.mkdirSync(path.dirname(out), {recursive: true});
  await esbuild.build({
    entryPoints: [path.join(ROOT, 'src3/render-entry.tsx')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: out,
    jsx: 'automatic',
    jsxImportSource: 'src3/engine',
    alias: {'src3/engine': path.join(ROOT, 'src3/engine')},
    absWorkingDir: ROOT,
    logLevel: 'error',
    external: ['node:*'],
  });
  return out;
}

function png(svg) {
  const r = new Resvg(svg, {
    fitTo: {mode: 'width', value: 1080},
    font: {fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'DejaVu Sans'},
  });
  return r.render().asPng();
}

const mode = has('--video') ? 'video' : 'stills';
const entry = await bundle();

if (mode === 'stills') {
  const times = (arg('--stills', '1') || '1').split(',').map(Number);
  const only = arg('--only', undefined) || undefined;
  const outDir = path.join(ROOT, arg('--out', 'out/stills'));
  fs.mkdirSync(outDir, {recursive: true});
  const mod = await import(`file://${entry}?t=${Date.now()}`);
  for (const t of times) {
    const t0 = Date.now();
    const svg = mod.frameAt(t, only);
    if (has('--svgout')) fs.writeFileSync(arg('--svgout', '/tmp/frame.svg'), svg);
    const buf = png(svg);
    const file = path.join(outDir, `f_${t.toFixed(2)}.png`);
    fs.writeFileSync(file, buf);
    console.log(`${file}  svg=${Math.round(svg.length / 1024)}KB png=${Math.round(buf.length / 1024)}KB  ${Date.now() - t0}ms`);
  }
} else {
  const from = Number(arg('--from', '0'));
  const total = Number(arg('--frames', '0'));
  const fps = 30;
  const outFile = path.join(ROOT, arg('--out', 'out/video.mp4'));
  fs.mkdirSync(path.dirname(outFile), {recursive: true});
  const mod = await import(`file://${entry}?t=${Date.now()}`);
  const DURATION = mod.DURATION;
  const to = Number(arg('--to', String(DURATION)));
  const f0 = Math.round(from * fps);
  const f1 = total ? f0 + total : Math.round(to * fps);
  console.log(`render ${f0}..${f1} frames (${((f1 - f0) / fps).toFixed(1)} s)`);
  const only = arg('--only', undefined) || undefined;

  const ff = spawn(ffmpegPath.path, [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(fps),
    '-i', '-',
    '-i', path.join(ROOT, 'public/audio3/mix.wav'),
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    '-ss', String(from),
    outFile,
  ], {stdio: ['pipe', 'inherit', 'inherit']});

  const write = (buf) =>
    new Promise((res, rej) => {
      if (!ff.stdin.write(buf)) ff.stdin.once('drain', res);
      else res();
    });

  for (let f = f0; f < f1; f++) {
    const t = f / fps;
    const svg = mod.frameAt(t, only);
    await write(png(svg));
    if (f % 60 === 0) console.log(`frame ${f}/${f1}  t=${t.toFixed(2)}s`);
  }
  ff.stdin.end();
  await new Promise((res) => ff.on('close', res));
  console.log('done', outFile);
}
