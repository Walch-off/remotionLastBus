import words from '../data/words5.json';
import cuesJson from '../data/cues5.json';
import {clamp, ease} from '../common';

export const FPS = 30;
export const W = 1080;
export const H = 1920;
export type Word = {text: string; s: number; e: number};
export const WORDS5 = words as Word[];
/** События — из реальных таймкодов слов озвучки после монтажа (scripts/build_audio5.py). */
export const C = cuesJson.cues as unknown as Record<string, number> & {steps: number[]; runSteps: number[]; taps: number[]; lands: number[]};
export const CI = cuesJson.idx as unknown as Record<string, number>;
export const DURATION5 = C.end;
export const TOTAL5 = Math.ceil(DURATION5 * FPS);

export const sm = (t: number, a: number, b: number) => ease(clamp((t - a) / (b - a)));
export const win = (t: number, a: number, b: number, c: number, d: number) => Math.min(sm(t, a, b), 1 - sm(t, c, d));
/** открытие рта на словах реплики (индексы слов from..to включительно) */
export const talk = (t: number, from: number, to: number, amp = 1) => {
  for (let i = from; i <= to; i++) {
    const w = WORDS5[i];
    if (w && t >= w.s && t <= w.e) return amp * (0.35 + 0.65 * Math.abs(Math.sin((t - w.s) * 15)));
  }
  return 0;
};
/** индекс слова, начинающегося не раньше t */
export const wordAt = (t: number) => WORDS5.findIndex((w) => w.s >= t - 0.01);
