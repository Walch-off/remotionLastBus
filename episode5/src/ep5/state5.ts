/**
 * ЛИСТ ПРЕЕМСТВЕННОСТИ эпизода 5 — единственный источник состояния. Все планы читают его по абсолютному времени t.
 *
 * Начальное состояние (конец части 4): герой у кабины (x=650), ключ в ЛЕВОЙ руке, телефон в ПРАВОЙ;
 * зеркало разбито (трещины из точки удара части 4) и на нашей стороне стекла — мокрый отпечаток;
 * молоток лежит на полу у кабины; мокрые следы на плечах (два отпечатка) и намокшая толстовка; фонарь снаружи погас;
 * двери закрыты; водитель (с лицом героя, в фуражке) неподвижно сидит за рулём.
 *
 * Ключ:     левая рука → (вырвался) карман толстовки (видна красная бирка) → «достал ключ» левой рукой → замок у двери
 *           (вставлен, поворачивается трижды) → вынут, когда двери распахнулись → на улице: замок снаружи → забран → в левой руке до конца.
 * Телефон:  в правой руке всё время; поднимается к лицу для сообщений.
 * Двойник:  снаружи под погасшим фонарём; сначала его нет, появляется к «поднял глаза к окну», указывает на дверь и на карман.
 *           После побега на остановке его нет — в стекле двери видно обычное отражение героя.
 * Фигура:   видна ТОЛЬКО в зеркале (идёт по проходу, оказывается за спиной, тянет руку); в салоне её нет.
 * Мокрая ладонь: без владельца; хватает руку (начало), касается плеча, хватает плечо; после побега — внутри зеркала, стучит.
 * Двери:    закрыты → приоткрываются и застревают → распахиваются → снаружи закрыты ключом.
 * Свет:     в салоне — тусклые холодные лампы; фонарь снаружи погас и загорается только на «Фонарь над нами загорелся».
 */
import {C, sm, win, talk, CI} from './story5';
import {reach, Face} from '../components/Hero';
import {fistPoint} from '../ep4/props4';
import {lerp, clamp} from '../common';

export const HERO_IN = {x: 650, xDoor: 1205, y: 1720};
export const DRV = {x: 215, y: 1370, s: 0.95};
export const MIRROR = {x: 235, y: 770, w: 400, h: 170};
export const LOCK_IN = {x: 1104, y: 1290};
export const HAMMER_FLOOR = {x: 492, y: 1748};
export const EXT = {hero: {x: 540, y: 1800, s: 0.95}, drv: {x: 822, y: 1800, s: 0.95}, door: {x0: 150, x1: 392, y0: 770, y1: 1410}, lock: {x: 420, y: 1330}};

type KP = [number, number, number][];
export const path = (t: number, k: KP): [number, number] => {
  if (t <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 1; i < k.length; i++) {
    if (t <= k[i][0]) {
      const u = sm(t, k[i - 1][0], k[i][0]);
      return [lerp(k[i - 1][1], k[i][1], u), lerp(k[i - 1][2], k[i][2], u)];
    }
  }
  const l = k[k.length - 1];
  return [l[1], l[2]];
};
export const num = (t: number, k: [number, number][]) => path(t, k.map(([a, v]) => [a, v, 0]))[0];

const REST_L: [number, number] = [404, 664];
const REST_R: [number, number] = [606, 664];
const GRIP_L: [number, number] = [388, 640];
const IN_POCKET: [number, number] = [470, 512];
const POCKET_EDGE: [number, number] = [436, 500];
const OUT_POCKET: [number, number] = [430, 524];

export const heroInX = (t: number) => lerp(HERO_IN.x, HERO_IN.xDoor, sm(t, C.rush + 0.05, C.rush + 1.0));
/** точка замка в координатах героя, когда он стоит у двери */
const LOCK_H: [number, number] = [LOCK_IN.x - HERO_IN.xDoor + 505, LOCK_IN.y - HERO_IN.y + 930];

export type HeroState = {
  x: number; armL: number; elbowL: number; armR: number; elbowR: number;
  itemL: 'none' | 'key' | 'keyGrip'; keyAngle: number; keySqueeze: number; pocketOver: boolean; pocketKey: number;
  face: Face; face2?: Face; faceMix: number; look: [number, number]; turn: number; tilt: number; bob: number;
};

export const keyAngleIn = (t: number) => num(t, [
  [C.turn1 + 0.15, 0], [C.turn1 + 0.5, 30], [C.nothing + 0.05, 30], [C.nothing + 0.45, 0],
  [C.turn2 + 0.15, 0], [C.turn2 + 0.65, 65], [C.grip + 0.45, 65], [C.turnFull + 0.2, 100],
]);
export const keyInsertIn = (t: number) => sm(t, C.insert, C.insert + 0.55) * (1 - sm(t, C.doorsOpen + 0.15, C.doorsOpen + 0.45));

export const heroIn = (t: number): HeroState => {
  const tug = t < C.yank ? 5 * Math.sin(t * 7.5) : 0;
  const L: KP = [
    [0, GRIP_L[0] + tug, GRIP_L[1]], [C.yank, GRIP_L[0], GRIP_L[1]], [C.yank + 0.3, 330, 420],
    [C.pocket + 0.25, ...POCKET_EDGE], [C.pocket + 0.6, ...IN_POCKET], [C.pocket + 0.9, ...IN_POCKET], [C.pocket + 1.2, ...OUT_POCKET], [C.pocket + 1.7, ...REST_L],
    [C.takeOut, ...REST_L], [C.takeOut + 0.3, ...POCKET_EDGE], [C.takeOut + 0.55, ...IN_POCKET], [C.takeOut + 0.75, ...IN_POCKET], [C.takeOut + 1.05, ...OUT_POCKET],
    [C.takeOut + 1.5, 420, 470], [C.rush, 420, 470], [C.rush + 0.5, 400, 560], [C.keyhole + 0.4, 400, 560],
    [C.insert - 0.1, LOCK_H[0] + 8, LOCK_H[1] + 30], [C.insert + 0.5, ...LOCK_H], [C.doorsOpen + 0.15, ...LOCK_H], [C.doorsOpen + 0.6, 380, 600], [C.end, 380, 600],
  ];
  const [lx, ly] = t < C.yank ? [GRIP_L[0] + tug, GRIP_L[1]] : path(t, L);
  const aL = reach('L', lx, ly, 1);
  const R: KP = [[0, ...REST_R], [C.msgPhone, ...REST_R], [C.msgPhone + 0.6, 548, 440], [C.lookWin, 548, 440], [C.lookWin + 0.5, ...REST_R], [C.end, ...REST_R]];
  const [rx, ry] = path(t, R);
  const aR = reach('R', rx, ry, 1);
  const keyFirst = t < C.pocket + 0.7;
  const keyBack = t >= C.takeOut + 0.65;
  const pocketOver = (t >= C.pocket + 0.2 && t < C.pocket + 1.15) || (t >= C.takeOut + 0.25 && t < C.takeOut + 1.0);
  const pocketKey = t >= C.pocket + 0.7 && t < C.takeOut + 0.65 ? 1 : 0;

  let face: Face = 'scared', face2: Face | undefined, faceMix = 0, look: [number, number] = [-0.5, 0.9], turn = -0.2, tilt = 0;
  const seg = (a: number, b: number) => t >= a && t < b;
  if (seg(C.yank, C.palmGone)) { look = [-0.2, 1]; turn = -0.1; }
  if (seg(C.palmGone, C.voice)) { face = 'worried'; look = [-0.6, 0.4]; }
  if (seg(C.voice, C.doorsHiss)) { face = 'scared'; look = [1, 0]; turn = 0.55; }
  if (seg(C.doorsHiss, C.window)) { face = 'worried'; look = [1, 0.1]; turn = 0.6; }
  if (seg(C.window, C.turnDrv)) { face = 'worried'; look = [0.7, -0.4]; turn = 0.35; }
  if (seg(C.turnDrv, C.lookMirror)) { face = 'worried'; look = [-1, 0]; turn = -0.6 * sm(t, C.turnDrv, C.turnDrv + 0.4); }
  if (seg(C.ask1, C.raiseHead)) { face = 'worried'; face2 = 'surprised'; faceMix = talk(t, CI.ask1, CI.ask1 + 7, 0.9); }
  if (seg(C.stayHere, C.ask2)) face = 'scared';
  if (seg(C.ask2, C.pause)) { face = 'worried'; face2 = 'surprised'; faceMix = talk(t, CI.ask2, CI.ask2 + 2, 0.9); }
  if (seg(C.lookMirror, C.turnBack)) { face = t < C.someone ? 'worried' : 'scared'; look = [-0.9, -0.9]; turn = -0.5; }
  if (seg(C.turnBack, C.msgPhone)) { face = 'scared'; look = [1, 0]; turn = 0.75 * sm(t, C.turnBack, C.turnBack + 0.2); }
  if (seg(C.msgPhone, C.lookWin)) { face = 'worried'; look = [0.35, 0.85]; turn = 0.05; }
  if (seg(C.lookWin, C.askKey)) { face = 'surprised'; look = [0.6, -0.5]; turn = 0.3; }
  if (seg(C.askKey, C.takeOut)) { face = 'worried'; look = [-1, 0]; turn = -0.55; if (t < C.yes) { face2 = 'surprised'; faceMix = talk(t, CI.askKey, CI.askKey + 2, 0.9); } }
  if (seg(C.takeOut, C.figBehind + 0.5)) { face = 'worried'; look = [-0.4, 0.9]; turn = -0.1; }
  if (seg(C.figBehind + 0.5, C.touch)) { face = 'scared'; look = [-0.9, -0.9]; turn = -0.5; }
  if (seg(C.touch, C.rush)) { face = 'scared'; look = [0.9, 0.3]; turn = 0.35; }
  if (seg(C.rush, C.creak)) { face = 'worried'; look = [-0.6, 0.6]; turn = -0.3; }
  if (seg(C.nothing, C.creak)) face = 'scared';
  if (seg(C.creak, C.turn2)) { face = 'scared'; look = [-1, -0.6]; turn = -0.8; }
  if (seg(C.turn2, C.run)) { face = 'worried'; look = [-0.6, 0.6]; turn = -0.3; }
  if (seg(C.run, C.jump)) { face = 'worried'; face2 = 'shout'; faceMix = t < C.run + 0.9 ? 0.6 + talk(t, CI.run, CI.run, 0.4) : 0; look = [-1, -0.2]; turn = -0.8; }
  if (seg(C.jump, C.grab2)) { face = 'scared'; look = [-0.6, 0.5]; turn = -0.3; }
  if (seg(C.grab2, C.grip)) { face = 'scared'; look = [0.9, 0.4]; turn = 0.35; }
  if (seg(C.grip, C.doorsOpen)) { face = 'worried'; look = [-0.6, 0.6]; turn = -0.3; tilt = -3; }
  if (t >= C.doorsOpen) { face = 'surprised'; look = [0.8, 0]; turn = 0.5; }

  const bob = -9 * win(t, C.yank, C.yank + 0.08, C.yank + 0.2, C.yank + 0.6)
    - 7 * win(t, C.touch + 0.1, C.touch + 0.18, C.touch + 0.3, C.touch + 0.7)
    - 7 * win(t, C.grab2 + 0.05, C.grab2 + 0.13, C.grab2 + 0.25, C.grab2 + 0.7)
    + (t >= C.rush && t < C.rush + 1.0 ? -6 * Math.abs(Math.sin((t - C.rush) * Math.PI / 0.26)) : 0);
  return {
    x: heroInX(t), armL: aL.arm, elbowL: aL.elbow, armR: aR.arm, elbowR: aR.elbow,
    itemL: keyFirst ? (t < C.yank ? 'keyGrip' : 'key') : keyBack ? 'key' : 'none',
    keyAngle: keyAngleIn(t) * keyInsertIn(t), keySqueeze: sm(t, C.grip, C.grip + 0.3) * (1 - sm(t, C.doorsOpen, C.doorsOpen + 0.3)),
    pocketOver, pocketKey, face, face2, faceMix, look, turn, tilt, bob,
  };
};

/** точка хвата призрачной ладони на предплечье (локально в кулаке) и её положение в мире в момент рывка */
export const GRIP_LOCAL: [number, number] = [0, -72];
export const gripWorldAtYank = (): [number, number] => {
  const a = reach('L', GRIP_L[0], GRIP_L[1], 1);
  const p = fistPoint('L', a.arm, a.elbow, GRIP_LOCAL[0], GRIP_LOCAL[1]);
  return [HERO_IN.x + (p[0] - 505), HERO_IN.y + (p[1] - 930)];
};

// ---------- водитель (в салоне) ----------
export type DriverState = {x: number; y: number; armL: number; elbowL: number; armR: number; elbowR: number; face: Face; face2?: Face; faceMix: number; look: [number, number]; turn: number; tilt: number; bob: number};
export const driverIn = (t: number): DriverState => {
  const rise = sm(t, C.jump, C.jump + 0.45);
  const R = reach('R', lerp(600, 606, rise), lerp(560, 664, rise), 1);
  const L = reach('L', lerp(420, 404, rise), lerp(560, 664, rise), 1);
  let face: Face = 'blank', face2: Face | undefined, faceMix = 0, look: [number, number] = [0.1, 0.75], turn = 0.1, tilt = 0;
  const raised = sm(t, C.raiseHead + 0.2, C.raiseHead + 1.8);
  let bob = 12 * (1 - raised);
  if (t >= C.raiseHead) { look = [lerp(0.1, 0.85, raised), lerp(0.75, 0, raised)]; turn = lerp(0.1, 0.45, raised); }
  if (t >= C.drvAns && t < C.ask2) { face = 'blank'; face2 = 'worried'; faceMix = 0.4 + talk(t, CI.drvAns, CI.drvAns + 16, 0.6); }
  if (t >= C.ask2 && t < C.once) { face = 'tired'; look = [0.4, 0.6]; turn = 0.25; }
  if (t >= C.once && t < C.lookMirror) { face = 'tired'; face2 = 'worried'; faceMix = 0.3 + talk(t, CI.once, CI.once + 10, 0.6); look = [0.6, 0.3]; turn = 0.35; }
  if (t >= C.lookMirror && t < C.yes) { face = 'tired'; look = [0.85, 0]; turn = 0.45; }
  if (t >= C.yes && t < C.takeOut) { face = 'worried'; face2 = 'surprised'; faceMix = talk(t, CI.yes, CI.yes + 8, 0.8); look = [0.85, 0]; turn = 0.45; }
  if (t >= C.takeOut && t < C.jump) { face = 'worried'; look = [0.85, 0.1]; turn = 0.45; }
  if (t >= C.jump) { face = 'scared'; look = [1, 0]; turn = 0.8; bob = 0; }
  return {x: DRV.x + 30 * rise, y: DRV.y - 58 * rise, armL: L.arm, elbowL: L.elbow, armR: R.arm, elbowR: R.elbow, face, face2, faceMix, look, turn, tilt, bob};
};

// ---------- зеркало ----------
export const mirror5 = (t: number) => {
  const walk = sm(t, C.someone + 0.2, C.walking + 0.6);
  const stepPhase = C.steps.reduce((acc, s) => (t >= s ? acc + 1 : acc), 0) + clamp((t - (C.steps.find((s) => s > t) ?? t) + 0.62) / 0.62);
  let fig = 0, d = 0, reachA = 0, figX = 0;
  if (t >= C.someone && t < C.turnBack + 0.1) { fig = sm(t, C.someone, C.someone + 0.6); d = 0.08 + 0.4 * walk; figX = -150; }
  if (t >= C.figBehind + 0.45 && t < C.rush + 0.4) { fig = sm(t, C.figBehind + 0.45, C.figBehind + 0.75) * (1 - sm(t, C.rush, C.rush + 0.4)); d = 1; figX = -70; }
  if (t >= C.sawMirror && t < C.exit) { fig = sm(t, C.sawMirror, C.sawMirror + 0.5) * (1 - sm(t, C.doorsOpen + 0.3, C.exit)); d = 0.82; figX = -60; reachA = sm(t, C.sawMirror + 0.5, C.reach + 0.9); }
  return {
    fig, d, figX, reachA,
    bob: Math.abs(Math.sin(stepPhase * Math.PI)) * 4,
    palm: sm(t, C.palmMirror, C.palmMirror + 0.8),
    tapPush: C.taps.reduce((acc, s) => acc + (t >= s - 0.12 && t < s + 0.25 ? Math.sin(clamp((t - (s - 0.12)) / 0.37) * Math.PI) : 0), 0),
    tapRipple: C.taps.reduce((acc, s) => (t >= s && t < s + 0.6 ? Math.max(acc, 1 - (t - s) / 0.6) : acc), 0),
  };
};

// ---------- двери, замок, окружение ----------
export const doorIn = (t: number) => num(t, [[C.doorsStart, 0], [C.stopped - 0.15, 0.38], [C.doorsOpen, 0.38], [C.doorsOpen + 0.35, 1]])
  + (t > C.stopped - 0.15 && t < C.stopped + 0.5 ? Math.sin((t - C.stopped) * 50) * 0.012 * (1 - (t - C.stopped + 0.15) / 0.65) : 0);
export const lockLed = (t: number) => (t < C.turn2 + 0.4 ? 'red' : t < C.doorsOpen ? 'amber' : 'green');
export const steamIn = (t: number) => Math.max(win(t, C.doorsHiss, C.doorsHiss + 0.3, C.doorsHiss + 0.9, C.doorsHiss + 2.0), win(t, C.doorsStart, C.doorsStart + 0.3, C.doorsStart + 1.2, C.doorsStart + 2.4), win(t, C.doorsOpen - 0.05, C.doorsOpen + 0.2, C.doorsOpen + 0.8, C.doorsOpen + 1.8));

/** призрачная ладонь в мире (после рывка, на плече) */
export const ghostHands = (t: number, heroX: number) => {
  const [gx, gy] = gripWorldAtYank();
  const out: {id: string; x: number; y: number; rot: number; appear: number; open: number; scale: number}[] = [];
  const left = (t >= C.yank && t < C.palmGone + 1.2);
  if (left) out.push({id: 'gh1', x: gx - 20 - 30 * sm(t, C.yank, C.palmGone), y: gy - 40, rot: -14, appear: 1 - sm(t, C.palmGone - 0.1, C.palmGone + 0.9), open: 1, scale: 0.6});
  const sh = (a: number, b: number) => t >= a && t < b;
  // ладонь на правом плече (сзади, пальцы свисают вперёд)
  if (sh(C.touch, C.rush + 0.3)) out.push({id: 'gh2', x: heroX + 84, y: 1152, rot: 172, appear: sm(t, C.touch, C.touch + 0.5) * (1 - sm(t, C.rush - 0.05, C.rush + 0.25)), open: 0.3, scale: 0.55});
  if (sh(C.grab2, C.doorsOpen + 0.4)) out.push({id: 'gh3', x: heroX + 84, y: 1148, rot: 172, appear: sm(t, C.grab2, C.grab2 + 0.25) * (1 - sm(t, C.doorsOpen, C.doorsOpen + 0.4)), open: 0.15, scale: 0.58});
  return out;
};

export const dblIn = (t: number) => ({
  vis: t >= C.lookWin ? 1 : 0,
  pointDoor: sm(t, C.pointDoor, C.pointDoor + 0.6) * (1 - sm(t, C.pointPocket - 0.1, C.pointPocket + 0.3)),
  pointPocket: sm(t, C.pointPocket, C.pointPocket + 0.5),
});

// ---------- снаружи ----------
export const keyAngleOut = (t: number) => num(t, [[C.close + 0.35, 0], [C.close + 0.75, -90], [C.takeKey - 0.1, -90], [C.takeKey + 0.2, 0]]);
export const keyInsertOut = (t: number) => sm(t, C.close - 0.1, C.close + 0.3) * (1 - sm(t, C.takeKey, C.takeKey + 0.35));
export const doorOut = (t: number) => (t < C.close + 0.5 ? 1 : 1 - sm(t, C.close + 0.5, C.close + 1.15));
export const busOut = (t: number) => {
  const j = t - C.busJerk - 0.05;
  return {
    present: t < C.busWord - 0.05,
    jerk: j > 0 && j < 1.4 ? 22 * Math.sin(j * 11) * Math.exp(-j * 3.2) : 0,
    lamp: t < C.lampOn ? 0 : t < C.lampOn + 0.6 ? (Math.sin(t * 60) > 0 ? 0.8 : 0.25) * sm(t, C.lampOn, C.lampOn + 0.6) + 0.2 : 1,
  };
};

export type OutPose = {armL: number; elbowL: number; armR: number; elbowR: number; hasKey: boolean; keyAngle: number; face: Face; face2?: Face; faceMix: number; look: [number, number]; turn: number; tilt: number; bob: number; stranger: number};
const LOCK_OUT_H: [number, number] = [(EXT.lock.x - EXT.hero.x) / EXT.hero.s + 505, (EXT.lock.y - EXT.hero.y) / EXT.hero.s + 930];
export const heroOut = (t: number): OutPose => {
  const L: KP = [[0, 400, 620], [C.close - 0.2, 400, 620], [C.close + 0.3, ...LOCK_OUT_H], [C.takeKey, ...LOCK_OUT_H], [C.takeKey + 0.5, 404, 640], [C.end, 404, 640]];
  const [lx, ly] = path(t, L);
  const aL = reach('L', lx, ly, 1);
  const R: KP = [[0, ...REST_R], [C.vib, ...REST_R], [C.vib + 0.6, 548, 440], [C.end, 548, 440]];
  const [rx, ry] = path(t, R);
  const aR = reach('R', rx, ry, 1);
  let face: Face = 'surprised', face2: Face | undefined, faceMix = 0, look: [number, number] = [0.3, 0], turn = 0.1, tilt = 0;
  const seg = (a: number, b: number) => t >= a && t < b;
  if (seg(C.lookBack, C.close)) { face = 'scared'; look = [-0.85, -0.5]; turn = -0.75; }
  if (seg(C.close, C.busJerk)) { face = 'worried'; look = [-0.7, 0.4]; turn = -0.4; }
  if (seg(C.busJerk, C.drvStood)) { face = 'scared'; look = [-0.6, -0.5]; turn = -0.6; }
  if (seg(C.drvStood, C.lampOn)) { face = t < C.faceNot ? 'worried' : 'surprised'; look = [1, 0]; turn = 0.5; }
  if (seg(C.lampOn, C.road)) { face = 'surprised'; look = [0.2, -1]; turn = 0; }
  if (seg(C.road, C.thought)) { face = t < C.busWord ? 'worried' : 'surprised'; look = [-0.75, -0.3]; turn = -0.6; }
  if (seg(C.thought, C.vib)) { face = 'tired'; look = [0.2, 0.1]; turn = 0.05; }
  if (seg(C.vib, C.q)) { face = 'worried'; look = [0.35, 0.85]; turn = 0.05; }
  if (t >= C.q) { face = 'worried'; look = [0, 0]; turn = 0; }
  const breathe = t < C.lookBack ? -5 * Math.abs(Math.sin((t - C.exit) * 3.2)) : 0;
  return {armL: aL.arm, elbowL: aL.elbow, armR: aR.arm, elbowR: aR.elbow, hasKey: true, keyAngle: keyAngleOut(t) * keyInsertOut(t), face, face2, faceMix, look, turn, tilt, bob: breathe, stranger: 0};
};
export const driverOut = (t: number): OutPose => {
  const aL = reach('L', 404, 664, 1), aR = reach('R', 606, 664, 1);
  let face: Face = 'scared', face2: Face | undefined, faceMix = 0, look: [number, number] = [-0.3, 0], turn = -0.2, tilt = 0;
  const seg = (a: number, b: number) => t >= a && t < b;
  if (seg(C.lookBack, C.faceNot)) { face = 'blank'; look = [-0.5, -0.4]; turn = -0.45; }
  if (seg(C.faceNot, C.lookBus)) { face = 'calm'; look = [-1, 0]; turn = -0.5; }
  if (seg(C.lookBus, C.lampOn)) { face = 'calm'; look = [-0.5, -0.5]; turn = -0.4; if (t >= C.thanks) { face2 = 'surprised'; faceMix = talk(t, CI.thanks, CI.thanks, 0.6); } }
  if (seg(C.lampOn, C.road)) { face = 'calm'; look = [0, -1]; turn = 0; }
  if (t >= C.road) { face = 'calm'; look = [-0.7, -0.1]; turn = -0.35; }
  const breathe = t < C.lookBack ? -5 * Math.abs(Math.sin((t - C.exit) * 3.0 + 1)) : 0;
  return {armL: aL.arm, elbowL: aL.elbow, armR: aR.arm, elbowR: aR.elbow, hasKey: false, keyAngle: 0, face, face2, faceMix, look, turn, tilt, bob: breathe,
    stranger: sm(t, C.faceNot + 0.25, C.faceNot + 1.9)};
};
