import words from '../data/words3.json';
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION3 = 154.97; // озвучка 153.47 с (оригинал, без вырезов) + 1.5 с финального экрана
export const TOTAL3 = Math.round(DURATION3 * FPS);
export type Word = {text: string; s: number; e: number};
export const WORDS3 = words as Word[];
const w = (i: number) => WORDS3[i].s;
/** Ключевые события — из реальных таймкодов слов (индексы в words3.json) */
export const E3 = {
  vote: w(3), doors: w(13), grin: w(18), wrongSmile: w(22), palm: w(26), start: w(43), left: w(51), shrink: w(60), lampOut: w(66),
  lampOn: w(70), bench: w(78), lamp: w(80), noSmile: w(93), raise: w(97), three: w(102), fold: w(105), two: w(108), rush: w(110),
  mirrorFace: w(120), eyes: w(123), notRoad: w(125), onMe: w(129), askWhy: w(132), asked: w(138), silent: w(140), lightsOff: w(146), lights: w(147),
  step1: w(156), step2: w(157), step3: w(158), flash: w(168), beam: w(171), prints: w(180), back: w(187), bump: w(189),
  stopped: w(193), refl: w(203), behind: w(205), point: w(218), fog: w(226), write: w(230), blink: w(234), gone: w(237),
  speaks: w(241), asks: w(248), name: w(254), openMouth: w(257), remember: w(261), stopAgain: w(268), oneFinger: w(284), flicker: w(286),
  smileMirror: w(291), direct: w(298), blankFace: w(301), voice: w(310), shatter: w(311), turn: w(321), key: w(327),
  q: w(330), opt1: w(333), opt2: w(336), banner: w(347),
};
export type Shot3 = {id: string; a: number; b: number};
export const SHOTS3: Shot3[] = [
  {id: 'chosen', a: 0, b: 3.16},
  {id: 'doorClose', a: 3.16, b: 5.6},
  {id: 'grinStart', a: 5.6, b: 7.57},
  {id: 'smileWrong', a: 7.57, b: 10.95},
  {id: 'palmGlass', a: 10.95, b: 13.7},
  {id: 'ask1', a: 13.7, b: 16.55},
  {id: 'busGoes', a: 16.55, b: 19.62},
  {id: 'leaves', a: 19.62, b: 21.9},
  {id: 'recede', a: 21.9, b: 24.71},
  {id: 'lampOut', a: 24.71, b: 26.64},
  {id: 'stopAhead', a: 26.64, b: 30.69},
  {id: 'bench', a: 30.69, b: 32.0},
  {id: 'lamp', a: 32.0, b: 33.04},
  {id: 'doubleStands', a: 33.04, b: 35.7},
  {id: 'notSmiling', a: 35.7, b: 38.04},
  {id: 'hand3', a: 38.04, b: 40.9},
  {id: 'count3', a: 40.9, b: 42.2},
  {id: 'bend', a: 42.2, b: 43.39},
  {id: 'two', a: 43.39, b: 44.68},
  {id: 'rush', a: 44.68, b: 46.39},
  {id: 'mirror1', a: 46.39, b: 53.51},
  {id: 'ask2', a: 53.51, b: 56.67},
  {id: 'noAnswer', a: 56.67, b: 58.16},
  {id: 'lightsOff', a: 58.16, b: 60.85},
  {id: 'steps', a: 60.85, b: 69.08},
  {id: 'flashlight', a: 69.08, b: 73.29},
  {id: 'prints', a: 73.29, b: 78.52},
  {id: 'retreat', a: 78.52, b: 81.25},
  {id: 'floor', a: 81.25, b: 83.6},
  {id: 'reflection', a: 83.6, b: 90.55},
  {id: 'point', a: 90.55, b: 94.96},
  {id: 'fog', a: 94.96, b: 101.82},
  {id: 'talks1', a: 101.82, b: 103.96},
  {id: 'likeMine', a: 103.96, b: 106.63},
  {id: 'question', a: 106.63, b: 110.07},
  {id: 'hesitate', a: 110.07, b: 113.68},
  {id: 'stopAgain', a: 113.68, b: 116.69},
  {id: 'windowStop', a: 116.69, b: 119.23},
  {id: 'oneFinger', a: 119.23, b: 123.06},
  {id: 'blink', a: 123.06, b: 124.21},
  {id: 'smileMirror', a: 124.21, b: 126.47},
  {id: 'direct', a: 126.47, b: 130.85},
  {id: 'aisleVoice', a: 130.85, b: 134.5},
  {id: 'react', a: 134.5, b: 136.0},
  {id: 'mirrorWords', a: 136.0, b: 137.83},
  {id: 'driverTurn', a: 137.83, b: 140.53},
  {id: 'keyClose', a: 140.53, b: 142.93},
  {id: 'final', a: 142.93, b: DURATION3},
];
export const XFADE = 5;
