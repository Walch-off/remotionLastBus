/** Монтажный лист: 13 сцен + эпилог-голосование. Тайминги — из выравнивания words3.json. */
export type CamKey = {t: number; cx: number; cy: number; zoom: number};
export type Shot = {id: string; name: string; a: number; b: number; cam: CamKey[]};

export const SHOTS: Shot[] = [
  {
    id: 'choice',
    name: '1. Голосование: остаться в автобусе',
    a: 0.0,
    b: 7.4,
    cam: [
      {t: 0.0, cx: 540, cy: 1010, zoom: 1.12},
      {t: 3.6, cx: 520, cy: 980, zoom: 1.24},
      {t: 7.4, cx: 500, cy: 940, zoom: 1.34},
    ],
  },
  {
    id: 'depart',
    name: '2. Двери закрываются, автобус едет',
    a: 7.4,
    b: 13.6,
    cam: [
      {t: 7.4, cx: 560, cy: 960, zoom: 1.3},
      {t: 10.2, cx: 620, cy: 930, zoom: 1.16},
      {t: 13.6, cx: 600, cy: 980, zoom: 1.08},
    ],
  },
  {
    id: 'emptystops',
    name: '3. Пустые остановки за стеклом',
    a: 13.6,
    b: 21.8,
    cam: [
      {t: 13.6, cx: 540, cy: 900, zoom: 1.04},
      {t: 17.4, cx: 600, cy: 880, zoom: 1.18},
      {t: 21.8, cx: 520, cy: 900, zoom: 1.12},
    ],
  },
  {
    id: 'drivermirror',
    name: '4. Водитель смотрит только в зеркало',
    a: 21.8,
    b: 32.6,
    cam: [
      {t: 21.8, cx: 540, cy: 900, zoom: 1.05},
      {t: 27.0, cx: 545, cy: 830, zoom: 1.22},
      {t: 32.6, cx: 545, cy: 810, zoom: 1.28},
    ],
  },
  {
    id: 'notyou',
    name: '5. В зеркале не ты / фонарь гаснет',
    a: 32.6,
    b: 37.9,
    cam: [
      {t: 32.6, cx: 545, cy: 810, zoom: 1.28},
      {t: 36.0, cx: 540, cy: 880, zoom: 1.16},
      {t: 37.9, cx: 540, cy: 920, zoom: 1.0},
    ],
  },
  {
    id: 'return',
    name: '6. Автобус возвращается к той же остановке',
    a: 37.9,
    b: 46.6,
    cam: [
      {t: 37.9, cx: 540, cy: 940, zoom: 1.0},
      {t: 42.0, cx: 470, cy: 940, zoom: 1.16},
      {t: 46.6, cx: 560, cy: 960, zoom: 1.1},
    ],
  },
  {
    id: 'doublestop',
    name: '7. Та же остановка, двойник улыбается',
    a: 46.6,
    b: 61.0,
    cam: [
      {t: 46.6, cx: 540, cy: 980, zoom: 1.0},
      {t: 52.0, cx: 540, cy: 990, zoom: 1.02},
      {t: 57.0, cx: 550, cy: 980, zoom: 1.05},
      {t: 61.0, cx: 575, cy: 960, zoom: 1.1},
    ],
  },
  {
    id: 'threefingers',
    name: '8. Три пальца → два → один',
    a: 61.0,
    b: 66.2,
    cam: [
      {t: 61.0, cx: 600, cy: 980, zoom: 1.0},
      {t: 63.4, cx: 640, cy: 860, zoom: 1.18},
      {t: 66.2, cx: 650, cy: 820, zoom: 1.26},
    ],
  },
  {
    id: 'lightsout',
    name: '8. Свет гаснет, мокрые шаги, поручень',
    a: 66.2,
    b: 83.6,
    cam: [
      {t: 66.2, cx: 555, cy: 960, zoom: 1.08},
      {t: 70.0, cx: 540, cy: 980, zoom: 1.0},
      {t: 74.0, cx: 530, cy: 980, zoom: 1.02},
      {t: 79.0, cx: 545, cy: 950, zoom: 1.1},
      {t: 83.6, cx: 552, cy: 930, zoom: 1.16},
    ],
  },
  {
    id: 'reflection',
    name: '9. Отражение поднимает руку',
    a: 83.6,
    b: 90.3,
    cam: [
      {t: 83.6, cx: 552, cy: 930, zoom: 1.16},
      {t: 87.0, cx: 545, cy: 700, zoom: 1.3},
      {t: 90.3, cx: 545, cy: 660, zoom: 1.38},
    ],
  },
  {
    id: 'glasstext',
    name: '10. «НЕ ОТВЕЧАЙ ЕМУ» на стекле',
    a: 90.3,
    b: 101.0,
    cam: [
      {t: 90.3, cx: 540, cy: 900, zoom: 1.02},
      {t: 95.0, cx: 540, cy: 880, zoom: 1.08},
      {t: 101.0, cx: 540, cy: 930, zoom: 1.0},
    ],
  },
  {
    id: 'question',
    name: '11. «Скажи, как тебя зовут»',
    a: 101.0,
    b: 113.5,
    cam: [
      {t: 101.0, cx: 540, cy: 950, zoom: 1.0},
      {t: 106.0, cx: 535, cy: 880, zoom: 1.14},
      {t: 110.0, cx: 540, cy: 920, zoom: 1.04},
      {t: 113.5, cx: 545, cy: 980, zoom: 1.0},
    ],
  },
  {
    id: 'onefinger',
    name: '12. Один палец и стук по стеклу',
    a: 113.5,
    b: 123.3,
    cam: [
      {t: 113.5, cx: 540, cy: 940, zoom: 1.02},
      {t: 118.0, cx: 620, cy: 900, zoom: 1.3},
      {t: 123.3, cx: 600, cy: 880, zoom: 1.46},
    ],
  },
  {
    id: 'smilekey',
    name: '13. Улыбка в зеркале vs лицо без улыбки, ключ',
    a: 123.3,
    b: 139.9,
    cam: [
      {t: 123.3, cx: 540, cy: 960, zoom: 1.04},
      {t: 128.0, cx: 540, cy: 900, zoom: 1.12},
      {t: 134.0, cx: 540, cy: 940, zoom: 1.06},
      {t: 139.9, cx: 540, cy: 980, zoom: 1.0},
    ],
  },
  {
    id: 'final',
    name: 'Эпилог. Голосование',
    a: 139.9,
    b: 153.469,
    cam: [
      {t: 139.9, cx: 540, cy: 980, zoom: 1.0},
      {t: 146.0, cx: 540, cy: 960, zoom: 1.06},
      {t: 153.469, cx: 540, cy: 950, zoom: 1.1},
    ],
  },
];

export const DURATION = 153.469;

export const shotAt = (t: number): Shot => {
  for (let i = 0; i < SHOTS.length; i++) if (t < SHOTS[i].b) return SHOTS[i];
  return SHOTS[SHOTS.length - 1];
};

export const sceneStart: Record<string, number> = Object.fromEntries(SHOTS.map((s) => [s.id, s.a]));
