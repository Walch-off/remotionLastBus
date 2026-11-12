/**
 * Субтитры: короткие фразы по правилам эп2 (флеш на ≥5 слов / >25 символов /
 * пунктуации), не больше двух строк, крупный контрастный текст, активное слово
 * подсвечено. Позиция — baseY 1432, чтобы не задевать лица, руки и интерфейс.
 */
export type Word = {text: string; s: number; e: number; i: number};
export type Cue = {s: number; e: number; words: Word[]};

const MAX_WORDS = 5;
const MAX_CHARS = 22;
const PUNCT = /[.!?,…:;—]$/;

export const buildCues = (words: Word[]): Cue[] => {
  const cues: Cue[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    cues.push({s: cur[0].s, e: cur[cur.length - 1].e, words: cur});
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0);
    if (cur.length >= MAX_WORDS || chars > MAX_CHARS || PUNCT.test(w.text)) flush();
  }
  flush();
  // склеиваем слишком короткие хвосты
  const out: Cue[] = [];
  for (const c of cues) {
    if (out.length && c.e - c.s < 0.42) {
      const prev = out[out.length - 1];
      if (prev.words.length + c.words.length <= MAX_WORDS + 1) {
        prev.words = prev.words.concat(c.words);
        prev.e = c.e;
        continue;
      }
    }
    out.push(c);
  }
  return out;
};

/** Две строки, если фраза длинная: балансируем по символам. */
export const splitLines = (words: Word[]): Word[][] => {
  const total = words.reduce((n, w) => n + w.text.length + 1, 0);
  if (total <= 17) return [words];
  let best = 1;
  let bestDiff = Infinity;
  for (let k = 1; k < words.length; k++) {
    const a = words.slice(0, k).reduce((n, w) => n + w.text.length + 1, 0);
    const b = total - a;
    const diff = Math.abs(a - b);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = k;
    }
  }
  return [words.slice(0, best), words.slice(best)];
};
