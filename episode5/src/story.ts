import words from './data/words.json';
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const DURATION_SEC = 115.72; // = смонтированная озвучка (оригинал 114.52 c + 1.2 c финальный экран)
export const TOTAL_FRAMES = Math.round(DURATION_SEC * FPS);
export type Word = {text: string; s: number; e: number};
export const WORDS = words as Word[];
export const wordAt = (i: number) => WORDS[i];
// Ключевые события — берутся из реальных таймкодов слов (индексы в words.json)
export const EV = {
  pharmacy1: wordAt(43).s, stop1: wordAt(46).s, lamp1: wordAt(49).s,
  pharmacy2: wordAt(58).s, lamp2: wordAt(63).s,
  figure: wordAt(88).s, stopBus: wordAt(100).s, lightOnFace: wordAt(104).s,
  phoneRaise: wordAt(138).s, msg1: wordAt(150).s, // «выходи»
  driverSays: wordAt(157).s, doorOpen: wordAt(159).s,
  shake: wordAt(185).s, typing: wordAt(190).s, msg2: wordAt(193).s,
  reflection: wordAt(227).s, handWord: wordAt(237).s,
  q: wordAt(255).s, one: wordAt(272).s, two: wordAt(274).s, cont: wordAt(277).s,
};
export type Shot = {id: string; a: number; b: number};
export const SHOTS: Shot[] = [
  {id: 'intro', a: 0, b: 6.57},
  {id: 'seat', a: 6.57, b: 14.71},
  {id: 'window1', a: 14.71, b: 20.92},
  {id: 'window2', a: 20.92, b: 26.23},
  {id: 'circle', a: 26.23, b: 28.71},
  {id: 'lookDriver', a: 28.71, b: 30.45},
  {id: 'driver1', a: 30.45, b: 33.45},
  {id: 'figure', a: 33.45, b: 36.54},
  {id: 'hoodieFig', a: 36.54, b: 38.41},
  {id: 'hoodieHero', a: 38.41, b: 40.03},
  {id: 'reveal', a: 40.03, b: 43.86},
  {id: 'chill', a: 43.86, b: 46.11},
  {id: 'compare', a: 46.11, b: 48.95},
  {id: 'stain', a: 48.95, b: 52.81},
  {id: 'stare', a: 52.81, b: 54.89},
  {id: 'phoneRaise', a: 54.89, b: 58.38},
  {id: 'phone1', a: 58.38, b: 61.39},
  {id: 'driver2', a: 61.39, b: 64.79},
  {id: 'door', a: 64.79, b: 66.25},
  {id: 'standLook', a: 66.25, b: 67.67},
  {id: 'hands', a: 67.67, b: 72.47},
  {id: 'shake', a: 72.47, b: 75.45},
  {id: 'typing', a: 75.45, b: 77.3},
  {id: 'phone2', a: 77.3, b: 79.91},
  {id: 'empty', a: 79.91, b: 84.64},
  {id: 'reflection', a: 84.64, b: 93.37},
  {id: 'shoulder', a: 93.37, b: 95.97},
  {id: 'whisper', a: 95.97, b: 102.4},
  {id: 'final', a: 102.4, b: DURATION_SEC},
];
export const XFADE = 5; // кадров перекрытия между планами (без чёрных кадров — нижний план остаётся под верхним)
