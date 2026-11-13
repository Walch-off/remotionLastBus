/**
 * ЛИСТ ПРЕЕМСТВЕННОСТИ эпизода 4 — единственный источник состояния сцены.
 * Каждый кадр (общий, средний, крупный) берёт отсюда положение героев и предметов по абсолютному времени t,
 * поэтому предметы не могут «прыгнуть» между планами.
 *
 * Герой: стоит в проходе рядом с кабиной водителя (мир x=650, ступни y=1720).
 * Водитель: в кабине слева, лицом к герою, лицо — лицо героя, фуражка.
 * Двойник: снаружи, на остановке за окном (между столбом и дверью), под фонарём. Не входит в автобус.
 * Молоток: на стойке у окна → в ЛЕВОЙ руке героя (схватил) → удар → в левой руке → положен на пол у кабины (крупный план) → лежит на полу до конца.
 * Ключ: у водителя в правой руке → падает на пол → герой поднимает ЛЕВОЙ рукой → в левой руке до финального выбора.
 * Телефон: в кармане толстовки → загорается → ПРАВАЯ рука достаёт → в правой руке до конца.
 * Зеркало: целое → разбито ударом → остаётся разбитым до конца.
 * Мокрые следы в проходе: видны → исчезают, когда глохнет двигатель.
 * Мокрые отпечатки на плечах (a — правое плечо зрителя, b — левое): проявляются на «проступила вода» и остаются.
 * Свет: салон — тусклый холодный, всё время; фонарь снаружи — горит, гаснет на «погас фонарь».
 * Двери: закрыты всё время; шипят, но не открываются.
 */
import {C, sm, win, talk, WORDS4, CI} from './story4';
import {reach, Face} from '../components/Hero';
import {fistPoint, fistWorldRot, HAMMER_TIP} from './props4';
import {lerp, clamp} from '../common';

export const HERO = {x: 650, y: 1720, s: 1};
export const DRV = {x: 215, y: 1370, s: 0.95}; // якорь — пояс (505,575)
export const MIRROR = {x: 235, y: 770, w: 400, h: 170};
export const HAMMER_HOOK = {x: 465, y: 930};
export const KEY_FLOOR = {x: 418, y: 1752};
export const HAMMER_FLOOR = {x: 492, y: 1748};
export const PALM0 = {x: 470, y: 1330};

/** координаты героя → мир */
export const heroW = (hx: number, hy: number): [number, number] => [HERO.x + (hx - 505) * HERO.s, HERO.y + (hy - 930) * HERO.s];
export const worldHero = (wx: number, wy: number): [number, number] => [(wx - HERO.x) / HERO.s + 505, (wy - HERO.y) / HERO.s + 930];
export const drvW = (hx: number, hy: number): [number, number] => [DRV.x + (hx - 505) * DRV.s, DRV.y + (hy - 575) * DRV.s];
export const worldDrv = (wx: number, wy: number): [number, number] => [(wx - DRV.x) / DRV.s + 505, (wy - DRV.y) / DRV.s + 575];

/** ключевые точки [t, x, y] — плавная интерполяция */
type KP = [number, number, number][];
const path = (t: number, k: KP): [number, number] => {
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
const num = (t: number, k: [number, number][]) => path(t, k.map(([a, v]) => [a, v, 0]))[0];

// ---------- удар: поза в момент контакта и точка трещины ----------
const [hookHX, hookHY] = worldHero(HAMMER_HOOK.x, HAMMER_HOOK.y);
const RAISED: [number, number] = [392, 66];
const IMPACT_GRIP: [number, number] = [292, 128];
const ROT_RAISED = 200, ROT_IMPACT = 128, ROT_HANG = 96;
const impactArm = reach('L', IMPACT_GRIP[0], IMPACT_GRIP[1], 1);
const tipH = fistPoint('L', impactArm.arm, impactArm.elbow, HAMMER_TIP[0], HAMMER_TIP[1], ROT_IMPACT);
const tipW = heroW(tipH[0], tipH[1]);
/** точка удара в локальных координатах зеркала (от центра) — следствие позы руки, а не подгонка */
export const IMPACT = {x: tipW[0] - MIRROR.x, y: tipW[1] - MIRROR.y};

export type HeroState = {
  armL: number; elbowL: number; armR: number; elbowR: number;
  itemL: 'none' | 'hammer' | 'key'; itemR: 'none' | 'phone';
  hammerRot: number; worldRotL: number; worldRotR: number; keySqueeze: number; keySlip: number;
  face: Face; face2?: Face; faceMix: number; look: [number, number]; turn: number; tilt: number;
  dx: number; bob: number; wet: number; prints: {a: number; b: number}; pocketGlow: number; phoneGlow: number;
};

const REST_L: [number, number] = [404, 664];
const REST_R: [number, number] = [606, 664];

export const heroState = (t: number): HeroState => {
  // ----- левая рука: молоток, затем ключ -----
  const L: KP = [
    [0, ...REST_L], [C.grab - 0.05, ...REST_L],
    [C.grab + 0.4, hookHX + 4, hookHY + 6], [C.grab + 0.6, hookHX + 4, hookHY + 6],
    [C.grab + 0.95, 330, 240], [C.swing + 0.5, ...RAISED],
    [C.strike - 0.28, ...RAISED], [C.strike, ...IMPACT_GRIP], [C.strike + 0.22, ...IMPACT_GRIP],
    [C.strike + 0.8, 352, 470], [C.recoil, 352, 470], [C.recoil + 0.6, 396, 640],
    // 43.4–45.3: крупный план пола (герой присел) — на общих планах не показывается
    [C.pick + 2.0, 396, 640], [C.engine, 404, 560], [C.quiet + 0.4, 404, 560], [C.quiet + 1.5, 410, 630],
    [C.grip - 0.1, 410, 630], [C.grip + 0.35, 470, 540], [C.end, 470, 540],
  ];
  const hasHammer = t >= C.grab + 0.5 && t < C.pick;
  const hasKey = t >= C.pick + 1.5;
  const [lx, ly] = path(t, L);
  const aL = reach('L', lx, ly, 1);
  const hammerRot = num(t, [[C.grab + 0.5, ROT_HANG - 30], [C.grab + 0.95, 150], [C.swing + 0.5, ROT_RAISED], [C.strike - 0.28, ROT_RAISED], [C.strike, ROT_IMPACT], [C.strike + 0.8, 110], [C.recoil + 0.6, ROT_HANG]]);

  // ----- правая рука: телефон из кармана -----
  const R: KP = [
    [0, ...REST_R], [C.phone + 0.1, ...REST_R], [C.phone + 0.5, 520, 512], [C.phone + 0.75, 520, 512], [C.phone + 1.4, 548, 440],
    [C.lookUp - 0.1, 548, 440], [C.lookUp + 0.6, 590, 560], [C.vib - 0.1, 590, 560], [C.vib + 0.5, 548, 440],
    [C.palmOpen - 0.2, 548, 440], [C.palmOpen + 0.6, 594, 560], [C.end, 594, 560],
  ];
  const [rx, ry] = path(t, R);
  const aR = reach('R', rx, ry, 1);
  const hasPhone = t >= C.phone + 0.6;

  // ----- лицо и взгляд -----
  let face: Face = 'worried', face2: Face | undefined, faceMix = 0, look: [number, number] = [-0.6, 0], turn = -0.3, tilt = 0;
  const seg = (a: number, b: number) => t >= a && t < b;
  if (seg(C.look, C.grab + 0.9)) { look = [-1, -0.35]; turn = -0.65; }
  if (seg(C.grab + 0.9, C.strike)) { face = 'worried'; look = [-0.9, -0.8]; turn = -0.5; tilt = -3; }
  if (seg(C.strike, C.then)) { face = 'surprised'; look = [-0.9, -0.8]; turn = -0.5; }
  if (seg(C.then, C.recoil)) { face = 'scared'; look = [-0.9, -0.9]; turn = -0.5; }
  if (seg(C.recoil, C.drop)) { face = 'scared'; look = [-0.8, -0.5]; turn = -0.4; tilt = 6 * win(t, C.recoil, C.recoil + 0.3, C.recoil + 1.2, C.drop); }
  if (seg(C.drop, C.pick)) { face = 'surprised'; look = [-0.9, 0.1]; turn = -0.4; }
  if (seg(C.pick, C.quiet)) { face = 'worried'; look = [-0.4, 0.8]; turn = -0.2; }
  if (seg(C.quiet, C.knockPre)) { face = 'tired'; look = [-0.2, 0.5]; turn = -0.1; }
  if (seg(C.knockPre, C.water)) { face = 'scared'; look = [-0.9, -0.9]; turn = -0.5; }
  if (seg(C.stood, C.notIt + 0.6)) { face = 'scared'; look = [-0.9, -0.9]; turn = -0.5; tilt = -4 * sm(t, C.stood, C.stood + 0.6); }
  if (seg(C.water, C.bang)) { face = 'scared'; look = t < C.wetShoulders ? [0.5, 0.9] : [lerp(0.7, -0.7, sm(t, C.wetShoulders + 0.4, C.wetShoulders + 1.2)), 0.9]; turn = 0; }
  if (seg(C.bang, C.turn)) { face = 'scared'; look = [0.4, 0]; turn = 0.1; }
  if (seg(C.turn, C.lookBack)) { face = 'scared'; look = [1, -0.1]; turn = 0.85 * sm(t, C.turn, C.turn + 0.35); }
  if (seg(C.lookBack, C.inhale)) { face = 'scared'; look = [-0.9, -0.8]; turn = lerp(0.85, -0.5, sm(t, C.lookBack, C.lookBack + 0.4)); }
  if (seg(C.inhale, C.ask)) { face = 'surprised'; look = [-0.9, 0]; turn = -0.4; }
  if (seg(C.ask, C.drvLook)) { face = 'worried'; face2 = 'scared'; faceMix = talk(t, CI.ask, CI.ask + 3, 0.8); look = [-0.9, 0]; turn = -0.4; }
  if (seg(C.drvLook, C.voiceNear)) { face = 'worried'; look = [-0.9, 0.1]; turn = -0.4; }
  if (seg(C.voiceNear, C.rock)) { face = 'scared'; look = [-1, 0.3]; turn = -0.2; }
  if (seg(C.rock, C.phone)) { face = 'scared'; look = [0.9, -0.2]; turn = 0.45; }
  if (seg(C.phone, C.lookUp)) { face = 'worried'; look = [0.35, 0.8]; turn = 0.05; }
  if (seg(C.lookUp, C.palmNear)) { face = 'worried'; look = [-0.9, -0.1]; turn = -0.4; }
  if (seg(C.palmNear, C.vib)) { face = 'scared'; look = [-0.8, 0.9]; turn = -0.3; }
  if (seg(C.vib, C.palmOpen)) { face = 'scared'; look = [0.35, 0.8]; turn = 0.05; }
  if (t >= C.palmOpen) { face = 'scared'; look = [-0.5, 0.6]; turn = -0.2; }

  // отшатнулся: корпус уходит вправо, от зеркала (ступни на месте — средний план без ног)
  const dx = 26 * win(t, C.recoil, C.recoil + 0.35, C.drop + 0.3, C.drop + 1.2);
  const bob = -10 * win(t, C.inhale - 0.2, C.inhale - 0.05, C.inhale + 0.15, C.inhale + 0.5) - 8 * win(t, C.bang, C.bang + 0.08, C.bang + 0.2, C.bang + 0.6);

  return {
    armL: aL.arm, elbowL: aL.elbow, armR: aR.arm, elbowR: aR.elbow,
    itemL: hasHammer ? 'hammer' : hasKey ? 'key' : 'none', itemR: hasPhone ? 'phone' : 'none',
    hammerRot, worldRotL: fistWorldRot('L', aL.arm, aL.elbow), worldRotR: fistWorldRot('R', aR.arm, aR.elbow),
    keySqueeze: sm(t, C.grip, C.grip + 0.3),
    keySlip: win(t, C.almost, C.almost + 0.18, C.almost + 0.45, C.almost + 0.8),
    face, face2, faceMix, look, turn, tilt, dx, bob,
    wet: sm(t, C.water, C.water + 1.6),
    prints: {a: sm(t, C.wetShoulders, C.wetShoulders + 1.0), b: sm(t, C.wetShoulders + 0.5, C.wetShoulders + 1.5)},
    pocketGlow: win(t, C.phone, C.phone + 0.2, C.phone + 0.5, C.phone + 0.75),
    phoneGlow: t < C.phone ? 0 : 1,
  };
};

// ---------- водитель ----------
export type DriverState = {armL: number; elbowL: number; armR: number; elbowR: number; armsFront: boolean; holdsKey: boolean; face: Face; face2?: Face; faceMix: number; look: [number, number]; turn: number; tilt: number};
const KEY_HAND: [number, number] = [752, 470];
export const driverState = (t: number): DriverState => {
  const releaseT = C.drop + 0.3;
  const R: KP = [[0, ...KEY_HAND], [releaseT, ...KEY_HAND], [C.grabFace, 700, 470], [C.grabFace + 0.5, 552, 262], [C.inhale - 0.3, 552, 262], [C.inhale + 0.35, 600, 560], [C.end, 600, 560]];
  const L: KP = [[0, 420, 560], [C.grabFace, 420, 560], [C.grabFace + 0.5, 458, 262], [C.inhale - 0.3, 458, 262], [C.inhale + 0.35, 420, 560], [C.end, 420, 560]];
  const [rx, ry] = path(t, R), [lx, ly] = path(t, L);
  const aR = reach('R', rx, ry, 1), aL = reach('L', lx, ly, 1);
  const front = t >= C.grabFace + 0.15 && t < C.inhale + 0.1;
  let face: Face = 'blank', face2: Face | undefined, faceMix = 0, look: [number, number] = [0.85, 0], turn = 0.45, tilt = 0;
  if (t >= C.shoutPre && t < C.late) { face = 'blank'; face2 = 'shout'; faceMix = t < C.shout - 0.1 ? 0.15 : 0.45 + talk(t, CI.shout, CI.shout + 3, 0.55); }
  if (t >= C.late && t < C.drop) { face = 'scared'; look = [0.8, -0.6]; }
  if (t >= C.drop && t < C.inhale) { face = t < C.freeze ? 'scared' : 'blank'; look = t < C.freeze ? [0.3, -0.4] : [-0.35, -0.55]; turn = lerp(0.45, 0, sm(t, C.drop, C.freeze)); }
  if (t >= C.inhale && t < C.drvLook) { face = 'surprised'; look = [0.3, -0.2]; turn = 0.2; tilt = -4 * win(t, C.inhale - 0.2, C.inhale, C.inhale + 0.3, C.inhale + 1); }
  if (t >= C.drvLook && t < C.voiceNear) { face = 'worried'; face2 = 'scared'; faceMix = talk(t, CI.drvSay, CI.drvSay + 4, 0.35); look = [0.85, 0.1]; turn = 0.45; }
  if (t >= C.voiceNear) { face = 'blank'; look = [-0.2, -0.3]; turn = 0.1; }
  if (t >= C.drvStill) { face = 'blank'; look = [0, -0.35]; turn = 0; }
  return {armL: aL.arm, elbowL: aL.elbow, armR: aR.arm, elbowR: aR.elbow, armsFront: front, holdsKey: t < releaseT, face, face2, faceMix, look, turn, tilt};
};

/** ключ: в руке водителя / падает / на полу / у героя */
export const keyFall = (t: number) => {
  const r = C.drop + 0.3;
  const [hx, hy] = drvW(...(fistPointDriver()));
  if (t < r) return {mode: 'driver' as const};
  if (t >= C.pick) return {mode: t >= C.pick + 1.5 ? 'hero' as const : 'floorCU' as const};
  const u = clamp((t - r) / 0.5);
  const y = lerp(hy, KEY_FLOOR.y, u * u);
  const bounce = t > r + 0.5 ? Math.max(0, Math.sin(((t - r - 0.5) / 0.22) * Math.PI)) * 18 * Math.exp(-(t - r - 0.5) * 6) : 0;
  return {mode: 'fall' as const, x: lerp(hx, KEY_FLOOR.x, u), y: y - bounce, rot: lerp(-30, 160, u)};
};
const fistPointDriver = (): [number, number] => {
  const a = reach('R', KEY_HAND[0], KEY_HAND[1], 1);
  return fistPoint('R', a.arm, a.elbow, -6, 30);
};

// ---------- зеркало ----------
export const mirrorState = (t: number) => {
  const broken = t >= C.strike;
  const knock = (k: number) => Math.exp(-Math.max(0, t - k) * 7) * (t >= k ? 1 : 0);
  return {
    broken,
    crack: broken ? lerp(0.32, 1, sm(t, C.cracked, C.lines + 1.6)) : 0,
    impactFlash: win(t, C.strike, C.strike + 0.03, C.strike + 0.05, C.strike + 0.35),
    knock: knock(C.k1) + knock(C.k2) + knock(C.k3),
    screamPulse: t >= C.then && t < C.recoil ? 0.5 + 0.5 * Math.sin((t - C.then) * 22) : 0,
    reflection: 1 - sm(t, C.strike, C.strike + 0.15),
    faceOp: win(t, C.between, C.between + 1.4, C.point, C.point + 0.8),
    palmUp: sm(t, C.palmIn, C.palmTouch),
    palmPress: sm(t, C.palmTouch, C.palmTouch + 0.4),
    palmOp: win(t, C.palmIn, C.palmIn + 0.4, C.point, C.point + 0.8),
    printOp: sm(t, C.point + 0.4, C.point + 1.2),
    drip: sm(t, C.butNow, C.inhale - 0.4),
    dropFall: clamp((t - (C.inhale - 0.75)) / 0.45),
  };
};

// ---------- окружение ----------
export const envState = (t: number) => {
  const lampFlicker = t > C.lampOut && t < C.lampOut + 0.6 ? (Math.sin(t * 70) > 0.2 ? 0.6 : 0.1) : 1;
  const lamp = t < C.lampOut ? 1 : t < C.lampOut + 0.6 ? lampFlicker * (1 - (t - C.lampOut) / 0.6) : 0;
  const rockT = t - (C.rock - 0.15);
  return {
    lamp,
    engine: t < C.engine ? 1 : 0,
    stepsVis: (k: number, n: number) => 1 - sm(t, C.wetSteps + (k / n) * 1.2, C.wetSteps + (k / n) * 1.2 + 0.45),
    rock: rockT > 0 && rockT < 2.4 ? 1.5 * Math.sin(rockT * 5.2) * Math.exp(-rockT * 1.8) : 0,
    doorShake: t > C.hiss && t < C.hiss + 0.8 ? Math.sin((t - C.hiss) * 60) * 2.2 * (1 - (t - C.hiss) / 0.8) : 0,
    steam: win(t, C.hiss - 0.1, C.hiss + 0.2, C.hiss + 0.9, C.hiss + 2.2),
    hammerOnHook: t < C.grab + 0.5,
    hammerOnFloor: t >= C.pick,
    palmAppear: sm(t, C.palmNear + 0.6, C.palmAppear + 1.2),
    palmOpen: sm(t, C.palmOpen, C.palmOpen + 1.1),
    palmPos: path(t, [[0, PALM0.x, PALM0.y], [C.give, PALM0.x, PALM0.y], [C.give + 1.5, 488, 1316], [C.palmOpen, 488, 1316], [C.palmOpen + 1.1, 520, 1260]]),
  };
};

// ---------- двойник снаружи ----------
export const doubleState = (t: number) => {
  const shake = t >= C.shake && t < C.point + 0.3 ? Math.sin((t - C.shake) * 17) * 0.75 * win(t, C.shake, C.shake + 0.15, C.point, C.point + 0.3) : 0;
  const pointing = sm(t, C.point, C.point + 0.4);
  const vis = 1 - sm(t, C.lampOut + 0.4, C.dark + 0.5);
  return {
    bangArm: win(t, C.bang - 0.25, C.bang + 0.05, C.bang + 0.7, C.bang + 1.2),
    shake, pointing: pointing * (1 - sm(t, C.lookBack + 1.5, C.lookBack + 2.5)),
    face: (t >= C.bang - 0.4 ? 'scared' : 'blank') as Face,
    vis,
    printOnGlass: sm(t, C.bang + 0.05, C.bang + 0.2) * (1 - sm(t, C.dark, C.dark + 1)),
  };
};

export const _words = WORDS4;
