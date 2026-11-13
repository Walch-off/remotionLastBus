import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {WORDS2 as WORDS, E2 as EV, Word} from './story2';

// Слова, которые в интерактивном финале показываются графикой (вопрос, варианты, плашка), а не обычными субтитрами —
// чтобы не дублировать один и тот же текст двумя слоями.
const HIDDEN = new Set<number>([3, 4, 5, 277, 278, 279, 296, 297, 298, 299]);
const PUNCT = /[.,?!…:—»]$/;

type Chunk = {words: {w: Word; i: number}[]; s: number; e: number};
const build = (): Chunk[] => {
  const chunks: Chunk[] = [];
  let cur: {w: Word; i: number}[] = [];
  const flush = () => {
    if (cur.length) chunks.push({words: cur, s: cur[0].w.s, e: cur[cur.length - 1].w.e});
    cur = [];
  };
  WORDS.forEach((w, i) => {
    if (HIDDEN.has(i)) { flush(); return; }
    const len = cur.reduce((a, c) => a + c.w.text.length + 1, 0) + w.text.length;
    if (cur.length && (cur.length >= 5 || len > 25 || (cur.length >= 2 && PUNCT.test(cur[cur.length - 1].w.text)))) flush();
    cur.push({w, i});
    if (/[.?!…]$/.test(w.text.replace(/[»"]/g, ''))) flush();
  });
  flush();
  return chunks;
};
export const CHUNKS = build();

export const Subtitles2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const idx = CHUNKS.findIndex((c, k) => {
    const next = CHUNKS[k + 1];
    const end = Math.min(c.e + 0.28, next ? next.s - 0.02 : 1e9);
    return t >= c.s - 0.04 && t < end;
  });
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  // перенос на две строки, если длинно
  const text = c.words.map((x) => x.w.text).join(' ');
  let lines: typeof c.words[] = [c.words];
  if (text.length > 17 && c.words.length > 2) {
    const half = text.length / 2; let acc = 0, cut = 1;
    c.words.forEach((x, k) => { acc += x.w.text.length + 1; if (acc < half + 2) cut = k + 1; });
    lines = [c.words.slice(0, cut), c.words.slice(cut)];
  }
  const baseY = 1432, lh = 92;
  const enter = Math.min(1, (t - (c.s - 0.04)) / 0.08);
  return (
    <g opacity={enter}>
      {lines.map((ln, li) => (
        <text key={li} x={500} y={baseY - (lines.length - 1 - li) * lh} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={76}
          style={{paintOrder: 'stroke', stroke: '#05070f', strokeWidth: 16, strokeLinejoin: 'round'}}>
          {ln.map((x, k) => {
            const active = t >= x.w.s - 0.02 && t < x.w.e + 0.06;
            return <tspan key={x.i} fill={active ? '#ffd23f' : '#ffffff'}>{(k ? ' ' : '') + x.w.text}</tspan>;
          })}
        </text>
      ))}
    </g>
  );
};
export const _EV = EV;
