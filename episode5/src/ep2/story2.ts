import words from '../data/words2.json';
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION2 = 126.73; // озвучка 125.23 с (оригинал, без вырезов) + 1.5 с финального экрана
export const TOTAL2 = Math.round(DURATION2 * FPS);
export type Word = {text: string; s: number; e: number};
export const WORDS2 = words as Word[];
const w = (i: number) => WORDS2[i].s;
/** Ключевые события — из реальных таймкодов слов (индексы в words2.json) */
export const E2 = {
  vote: w(4), phoneNoExit: w(27), handIn: w(34), turn0: w(45), turn1: w(51), flick: w(64), handGone: w(77), print1: w(83),
  refl: w(93), reflLook: w(102), fingerUp: w(125), fingerLips: w(128), stand: w(134), knock: w(148), glass: w(154),
  msgA: w(162), lift: w(170), mirror: w(173), mirrorFace: w(179), toDoor: w(185), typing: w(203), msgB: w(206),
  lightsOut: w(216), creak: w(220), lightsOn: w(230), print2: w(240), voice: w(246), key: w(256), engine: w(257), doors: w(260),
  reach: w(267), palm: w(274), q: w(277), opt1: w(280), opt2: w(284), banner: w(296),
};
export type Shot2 = {id: string; a: number; b: number};
export const SHOTS2: Shot2[] = [
  {id: 'vote', a: 0, b: 5.24},
  {id: 'recall1', a: 5.24, b: 8.3},
  {id: 'recall2', a: 8.3, b: 10.4},
  {id: 'recall3', a: 10.4, b: 12.84},
  {id: 'handBack', a: 12.84, b: 18.5},
  {id: 'turn', a: 18.5, b: 21.9},
  {id: 'aisle', a: 21.9, b: 28.33},
  {id: 'vanish', a: 28.33, b: 32.05},
  {id: 'print1', a: 32.05, b: 35.22},
  {id: 'reflSeat', a: 35.22, b: 43.4},
  {id: 'driverKnees', a: 43.4, b: 47.13},
  {id: 'call', a: 47.13, b: 49.5},
  {id: 'shush', a: 49.5, b: 52.41},
  {id: 'stand', a: 52.41, b: 55.59},
  {id: 'recoil', a: 55.59, b: 58.2},
  {id: 'knock', a: 58.2, b: 62.23},
  {id: 'msgA', a: 62.23, b: 65.56},
  {id: 'drvLift', a: 65.56, b: 68.49},
  {id: 'mirror', a: 68.49, b: 73.21},
  {id: 'toDoor', a: 73.21, b: 76.45},
  {id: 'step', a: 76.45, b: 79.0},
  {id: 'typing', a: 79.0, b: 81.98},
  {id: 'msgB', a: 81.98, b: 85.38},
  {id: 'lightsOut', a: 85.38, b: 87.25},
  {id: 'dark', a: 87.25, b: 91.47},
  {id: 'lightsOn', a: 91.47, b: 94.67},
  {id: 'print2', a: 94.67, b: 99.21},
  {id: 'voice', a: 99.21, b: 104.57},
  {id: 'key', a: 104.57, b: 109.31},
  {id: 'reach', a: 109.31, b: 111.9},
  {id: 'palm', a: 111.9, b: 114.8},
  {id: 'final', a: 114.8, b: DURATION2},
];
export const XFADE = 5;
