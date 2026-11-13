import words from '../data/words4.json';
import cuesJson from '../data/cues4.json';
import {clamp, ease} from '../common';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export type Word = {text: string; s: number; e: number};
export const WORDS4 = words as Word[];
/** Все события — из реальных таймкодов слов озвучки после монтажа (scripts/build_audio4.py). */
export const C = cuesJson.cues as unknown as Record<string, number>;
export const CI = cuesJson.idx as unknown as Record<string, number>;
export const DURATION4 = C.end;
export const TOTAL4 = Math.ceil(DURATION4 * FPS);

/** 0→1 между a и b, сглажено */
export const sm = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));
/** окно: нарастает a..b, держится, спадает c..d */
export const win = (t: number, a: number, b: number, c: number, d: number) => Math.min(sm(t, a, b), 1 - sm(t, c, d));

/** открытие рта на словах реплики (индексы слов from..to включительно) */
export const talk = (t: number, from: number, to: number, amp = 1) => {
  for (let i = from; i <= to; i++) {
    const w = WORDS4[i];
    if (t >= w.s && t <= w.e) return amp * (0.35 + 0.65 * Math.abs(Math.sin((t - w.s) * 15)));
  }
  return 0;
};
