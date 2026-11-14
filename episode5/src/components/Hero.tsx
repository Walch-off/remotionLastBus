import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SKIN, lerp} from '../common';

/**
 * Герой нарисован целиком кодом (SVG), без картинок.
 * Система координат совпадает с референсом 1024×1024: центр головы (505,200), шея y≈305,
 * плечи (434,372)/(574,372), пояс y≈575, ступни y≈930.
 */
export type Face = 'calm' | 'tired' | 'surprised' | 'worried' | 'scared' | 'grin' | 'blank' | 'scream' | 'shout';
const EXPR: Record<Face, any> = {
  calm: {lid: 0.12, eye: 1, iris: 9.5, browY: 0, k: 1, mw: 30, mc: 0, open: 0, sweat: 0},
  tired: {lid: 0.4, eye: 0.98, iris: 9.5, browY: 3, k: 3, mw: 26, mc: -2, open: 0, sweat: 0},
  surprised: {lid: 0, eye: 1.18, iris: 9, browY: -12, k: 0, mw: 12, mc: 0, open: 0.6, sweat: 0},
  worried: {lid: 0.1, eye: 1.05, iris: 9, browY: -3, k: 8, mw: 28, mc: -5, open: 0, sweat: 0},
  scared: {lid: 0, eye: 1.28, iris: 7.2, browY: -10, k: 10, mw: 24, mc: 0, open: 1, sweat: 1},
  grin: {lid: 0, eye: 1.14, iris: 7, browY: -5, k: -3, mw: 30, mc: 0, open: 0, sweat: 0, smile: 1},
  blank: {lid: 0.2, eye: 1, iris: 6.4, browY: 1, k: 0, mw: 26, mc: 0, open: 0, sweat: 0},
  scream: {lid: 0, eye: 1.3, iris: 6.6, browY: -12, k: 12, mw: 44, mc: 0, open: 2.2, sweat: 0},
  shout: {lid: 0, eye: 1.12, iris: 8, browY: 4, k: -9, mw: 40, mc: 0, open: 1.6, sweat: 0},
};
const mixE = (a: Face, b: Face, t: number) => {
  const A = {smile: 0, ...EXPR[a]}, B = {smile: 0, ...EXPR[b]}, o: any = {};
  for (const k of Object.keys(A)) o[k] = lerp(A[k], B[k], t);
  return o;
};

export type HeroProps = {
  id: string;
  x: number; y: number; scale?: number;
  anchor?: [number, number];
  armL?: number; armR?: number;      // градусы вниз от горизонтали (0 = руки в стороны, 90 = вдоль тела)
  elbowL?: number; elbowR?: number;  // сгиб локтя: + внутрь к телу, − наружу/вверх
  face?: Face; face2?: Face; faceMix?: number;
  look?: [number, number]; tilt?: number;
  shade?: number; shadeColor?: [number, number, number];
  legs?: boolean; stain?: boolean; stainGlow?: number;
  flip?: boolean; opacity?: number; tint?: boolean;
  blinkSeed?: number;
  extraArmR?: React.ReactNode;       // предмет в правой кисти (рисуется в координатах героя, в позиции кисти)
  bodyBob?: number;
  cap?: boolean;                     // фуражка водителя
  turn?: number;                     // поворот головы: −1 влево … +1 вправо (на экране)
  prints?: {a?: number; b?: number}; // мокрые следы ладони: a — на правом плече зрителя, b — на левом
  itemL?: React.ReactNode; itemR?: React.ReactNode; // предмет в кисти, в системе предплечья (кисть ≈ (0,166))
  printGlow?: 'a' | 'b';
  armsFront?: boolean;               // руки поверх головы (например, ладони у лица)
  wet?: number;                      // намокшая толстовка 0…1
  stranger?: number;                 // 0 — лицо героя, 1 — собственное лицо водителя (седой, усы, морщины)
  pocketOver?: boolean;              // карман толстовки поверх рук (кисть «в кармане»)
  pocketKey?: number;                // ключ лежит в кармане: видна красная бирка
};

const HOOD = {base: '#5470a6', light: '#6482b9', dark: '#445f95', deep: '#3a5287'};
const HAIR = {base: '#8a5230', dark: '#6f4023', light: '#9c6139'};
const hx2 = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixC = (a: string, b: string, t: number) => '#' + hx2(a).map((v, i) => Math.round(v + (hx2(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');

export const StainBlob: React.FC<{glow?: number; frame?: number}> = ({glow = 0, frame = 0}) => (
  <g>
    <ellipse cx={0} cy={0} rx={26} ry={19} fill="#3f5b91" opacity={0.6} />
    <path d="M-18 -4 q6 -16 22 -12 q16 4 17 16 q1 14 -14 17 q-14 4 -22 -6 q-8 -8 -3 -15z" fill="#4a2c1d" />
    <circle cx={-26} cy={14} r={5} fill="#4a2c1d" />
    <circle cx={24} cy={-20} r={3.4} fill="#4a2c1d" />
    {glow > 0 && <circle cx={0} cy={0} r={34 + 6 * Math.sin(frame / 5)} fill="none" stroke="#ffd25a" strokeWidth={6} opacity={glow} />}
  </g>
);

export const WetPrint: React.FC<{glow?: number; frame?: number}> = ({glow = 0, frame = 0}) => (
  <g>
    <ellipse cx={0} cy={0} rx={30} ry={31} fill="#243f78" opacity={0.72} />
    {[[-23, 22, 34], [-8, 26, 42], [8, 26, 40], [23, 22, 31]].map(([fx, fy, fl], i) => <rect key={i} x={fx - 7} y={fy} width={14} height={fl} rx={7} fill="#243f78" opacity={0.72} />)}
    <ellipse cx={-34} cy={-2} rx={9} ry={19} transform="rotate(30 -34 -2)" fill="#243f78" opacity={0.72} />
    <path d="M-14 -18 q14 -10 28 0 M-20 6 q20 10 40 0" stroke="#9fc0f5" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.55} />
    <path d="M-8 70 q-6 12 0 18 q7 -6 0 -18z" fill="#4b72c0" opacity={0.85} />
    {glow > 0 && <circle cx={0} cy={22} r={62 + 8 * Math.sin(frame / 5)} fill="none" stroke="#ffd25a" strokeWidth={6} opacity={glow} />}
  </g>
);

const HandShape: React.FC = () => (
  <g>
    <path d="M-20 -6 Q-24 38 -10 54 Q0 62 12 54 Q24 38 20 -6 Z" fill={SKIN} stroke="#d49a6e" strokeWidth={2} />
    <path d="M-20 14 Q-34 22 -30 42 Q-26 50 -16 42Z" fill={SKIN} stroke="#d49a6e" strokeWidth={2} />
    <path d="M-6 30 V50 M4 30 V52 M13 28 V46" stroke="#d9a67a" strokeWidth={2} strokeLinecap="round" />
  </g>
);

/** Рукав+предплечье+кисть. Локальная система: плечо в (0,0), рука вниз по +y. */
const Arm: React.FC<{elbow: number; children?: React.ReactNode; forearmExtra?: React.ReactNode; gid: string; item?: React.ReactNode}> = ({elbow, children, forearmExtra, gid, item}) => (
  <g>
    <defs>
      <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={HOOD.light} /><stop offset="0.55" stopColor={HOOD.base} /><stop offset="1" stopColor={HOOD.dark} /></linearGradient>
    </defs>
    <path d="M-33 -4 Q-35 70 -29 150 L29 150 Q35 70 33 -4 Z" fill={`url(#${gid})`} />
    <path d="M14 0 Q22 70 20 150 L29 150 Q35 70 33 -4Z" fill={HOOD.deep} opacity={0.35} />
    {children}
    <g transform={`translate(0 150) rotate(${elbow})`}>
      <circle cx={0} cy={0} r={29} fill={HOOD.base} />
      <path d="M-29 0 Q-28 60 -25 134 L25 134 Q28 60 29 0 Z" fill={`url(#${gid})`} />
      <path d="M12 0 Q18 60 18 134 L25 134 Q28 60 29 0Z" fill={HOOD.deep} opacity={0.3} />
      <rect x={-27} y={114} width={54} height={24} rx={9} fill={HOOD.dark} />
      <rect x={-27} y={114} width={54} height={5} rx={2} fill={HOOD.deep} opacity={0.6} />
      {item ? <g transform={`translate(0 ${GRIP})`}>{item}</g> : <g transform="translate(0 138)"><HandShape /></g>}
      {forearmExtra}
    </g>
  </g>
);

const Eye = ({id, cx, cy, p, look, lid}: any) => {
  const rx = 21 * p.eye, ry = 14.5 * p.eye;
  const yl = cy - ry + 2 * ry * lid;
  return (
    <g>
      <clipPath id={id}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fffaf0" />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + look[0] * 8} cy={cy + look[1] * 5} r={p.iris} fill={p.irisC ?? "#6b3f22"} />
        <circle cx={cx + look[0] * 8} cy={cy + look[1] * 5} r={p.iris * 0.55} fill="#26130a" />
        <circle cx={cx + look[0] * 8 - 3} cy={cy + look[1] * 5 - 3} r={2.6} fill="#fff" />
        <rect x={cx - rx - 3} y={cy - ry - 4} width={2 * rx + 6} height={Math.max(0, yl - (cy - ry - 4))} fill={SKIN} />
      </g>
      <path d={`M ${cx - rx} ${yl + 2.5} Q ${cx} ${yl - 7} ${cx + rx} ${yl + 2.5}`} fill="none" stroke="#2e180c" strokeWidth={4.6} strokeLinecap="round" />
      <path d={`M ${cx - rx + 4} ${cy + ry - 1} Q ${cx} ${cy + ry + 3} ${cx + rx - 4} ${cy + ry - 1}`} fill="none" stroke="#c98f68" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
    </g>
  );
};

/** кинематика руки: положение кисти в координатах героя */
const handPos = (px: number, py: number, r: number, rf: number) => {
  const d = (a: number) => [-Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];
  const u = d(r), f = d(rf);
  return [px + 150 * u[0] + 138 * f[0], py + 150 * u[1] + 138 * f[1]];
};

export const handPosR = (armR: number, elbowR: number) => handPos(574, 372, -(90 - armR), -(90 - armR) + elbowR);

/** Центр сжатого кулака в системе предплечья */
export const GRIP = 166;
const dirA = (dx: number, dy: number) => (Math.atan2(-dx, dy) * 180) / Math.PI;
/**
 * Обратная кинематика: какие armX/elbowX нужны, чтобы центр кисти оказался в точке (tx,ty) героя.
 * bend: +1 — локоть наружу (от тела), −1 — внутрь.
 */
export const reach = (side: 'L' | 'R', tx: number, ty: number, bend = 1) => {
  const sx = side === 'L' ? 434 : 574, sy = 372, L1 = 150, L2 = GRIP;
  let dx = tx - sx, dy = ty - sy;
  let d = Math.hypot(dx, dy);
  const dMax = L1 + L2 - 2, dMin = Math.abs(L1 - L2) + 2;
  if (d > dMax) { dx *= dMax / d; dy *= dMax / d; d = dMax; }
  if (d < dMin) { dx *= dMin / d; dy *= dMin / d; d = dMin; }
  const base = dirA(dx, dy);
  const alpha = (Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)) * 180) / Math.PI;
  const outward = side === 'L' ? 1 : -1; // положительный поворот уводит левую руку влево (наружу)
  const a1 = base + alpha * bend * outward;
  const ex = sx - L1 * Math.sin((a1 * Math.PI) / 180), ey = sy + L1 * Math.cos((a1 * Math.PI) / 180);
  const a2 = dirA(sx + dx - ex, sy + dy - ey);
  return side === 'L' ? {arm: 90 - a1, elbow: a1 - a2} : {arm: a1 + 90, elbow: a2 - a1};
};
/** угол предплечья (градусы SVG) — чтобы ориентировать предмет в кулаке */
export const forearmAngle = (side: 'L' | 'R', arm: number, elbow: number) => (side === 'L' ? 90 - arm - elbow : arm - 90 + elbow);

export const Hero: React.FC<HeroProps> = (p) => {
  const frame = useCurrentFrame();
  const {
    id, x, y, scale = 1, anchor = [505, 930], armL = 80, armR = 80, elbowL = 7, elbowR = 7, face = 'calm', face2, faceMix = 0,
    look = [0, 0], tilt = 0, shade = 0, shadeColor = [0.05, 0.07, 0.16], legs = true, stain = true,
    stainGlow = 0, flip = false, opacity = 1, blinkSeed = 0, extraArmR, bodyBob = 0, turn = 0, prints = {}, cap = false,
    itemL, itemR, armsFront = false, wet = 0, stranger = 0, pocketOver = false, pocketKey = 0,
  } = p;
  const e0 = face2 ? mixE(face, face2, faceMix) : {smile: 0, ...EXPR[face]};
  const e = {...e0, iris: e0.iris * (1 - 0.18 * stranger), irisC: mixC("#6b3f22", "#4c6c8c", stranger)};
  const HR = {light: mixC(HAIR.light, "#c3c6cd", stranger), dark: mixC(HAIR.dark, "#7f838c", stranger)};
  const brow = mixC("#5e371b", "#9a9ca4", stranger);
  const b = (frame + blinkSeed) % 118;
  const blink = b < 5 ? Math.sin((b / 5) * Math.PI) * (1 - e.lid) : 0;
  const lid = Math.min(1, e.lid + blink);
  const [sr, sg, sb] = shadeColor;
  const s = shade;
  const matrix = `${1 - s} 0 0 0 ${s * sr}  0 ${1 - s} 0 0 ${s * sg}  0 0 ${1 - s} 0 ${s * sb}  0 0 0 1 0`;
  const yO = 204 + e.browY, k = e.k;
  const sweatY = ((frame % 40) / 40) * 22;
  const breathe = Math.sin(frame / 17 + blinkSeed) * 1.6;
  const thL = 90 - armL, thR = 90 - armR; // отклонение от вертикали
  const rL = thL, rR = -thR;              // повороты в SVG (левая — по часовой, правая — против)
  const rfR = rR + elbowR;
  const [hx, hy] = handPos(574, 372, rR, rfR);
  // красная бирка ключа торчит из левого края кармана — ключ виден «в кармане»
  const pocketTag = (
    <g opacity={pocketKey} transform="translate(446 486) rotate(-24)">
      <path d="M8 22 Q2 6 10 -4" stroke="#bbb" strokeWidth={2.5} fill="none" />
      <rect x={-6} y={-30} width={34} height={26} rx={5} fill="#c7433a" stroke="#7a1f1a" strokeWidth={2} />
      <circle cx={12} cy={2} r={6} fill="none" stroke="#e0c97c" strokeWidth={3.5} />
    </g>
  );
  const arms = (
    <g>
      {/* левая рука зрителя (с пятном на рукаве) */}
      <g transform={`translate(434 372) rotate(${rL})`}>
        <Arm elbow={-elbowL} gid={`${id}-aL`} item={itemL}>{stain && <g transform="translate(-4 78)"><StainBlob glow={stainGlow} frame={frame} /></g>}</Arm>
      </g>
      <g transform={`translate(574 372) rotate(${rR})`}>
        <Arm elbow={elbowR} gid={`${id}-aR`} item={itemR} />
      </g>
      <circle cx={434} cy={372} r={34} fill={HOOD.base} />
      <circle cx={574} cy={372} r={34} fill={HOOD.base} />
      {wet > 0 && (
        <g opacity={wet}>
          <path d="M440 330 Q505 316 570 330 Q600 350 596 410 Q560 440 505 430 Q450 440 414 410 Q410 350 440 330Z" fill="#2c4373" opacity={0.55} />
          {[[452, 430, 0], [560, 436, 1], [505, 452, 2]].map(([dx, dy, k]) => (
            <path key={k} d={`M${dx} ${dy} q-6 ${14 + 10 * ((frame / 20 + k) % 1)} 0 ${22 + 14 * ((frame / 20 + k) % 1)} q6 -8 0 -${22 + 14 * ((frame / 20 + k) % 1)}z`} fill="#8fb4ef" opacity={0.6} />
          ))}
        </g>
      )}
      {(prints.a ?? 0) > 0 && <g transform="translate(580 372) rotate(-10)" opacity={prints.a}><WetPrint glow={(p as any).printGlow === 'a' ? 1 : 0} frame={frame} /></g>}
      {(prints.b ?? 0) > 0 && <g transform="translate(428 372) rotate(10) scale(-1 1)" opacity={prints.b}><WetPrint glow={(p as any).printGlow === 'b' ? 1 : 0} frame={frame} /></g>}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y + bodyBob}) scale(${flip ? -scale : scale} ${scale}) translate(${-anchor[0]} ${-anchor[1]})`} opacity={opacity}>
      <defs>
        <filter id={`${id}-sh`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={matrix} /></filter>
        <linearGradient id={`${id}-torso`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={HOOD.base} /><stop offset="0.5" stopColor={HOOD.light} /><stop offset="1" stopColor={HOOD.dark} /></linearGradient>
        <linearGradient id={`${id}-pants`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4a4a57" /><stop offset="1" stopColor="#363642" /></linearGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mixC("#f6c999", "#efbb92", stranger)} /><stop offset="1" stopColor={mixC("#efb98a", "#e2a37c", stranger)} /></linearGradient>
        <linearGradient id={`${id}-hair`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={HR.light} /><stop offset="1" stopColor={HR.dark} /></linearGradient>
      </defs>
      <g filter={shade > 0.001 ? `url(#${id}-sh)` : undefined}>
        {/* ноги и обувь */}
        {legs && (
          <g>
            <path d="M421 566 L504 566 Q503 730 497 878 L440 878 Q433 730 421 566Z" fill={`url(#${id}-pants)`} />
            <path d="M508 566 L589 566 Q576 730 562 878 L513 878 Q508 730 508 566Z" fill={`url(#${id}-pants)`} />
            <path d="M504 566 Q503 700 498 878 L488 878 Q494 700 494 566Z" fill="#2a2a34" opacity={0.45} />
            <path d="M440 878 L498 878 L503 906 Q504 926 484 928 L392 929 Q379 924 386 907 Q392 896 418 892 Q432 888 440 878Z" fill="#26262d" />
            <path d="M386 910 Q382 928 396 930 L488 929 Q505 926 504 913Z" fill="#6b6b73" />
            <path d="M420 896 l22 -6 M414 905 l28 -7 M432 888 l16 -3" stroke="#555560" strokeWidth={3} strokeLinecap="round" />
            <path d="M513 878 L562 878 Q566 888 592 892 Q618 896 624 907 Q631 924 618 929 L520 928 Q504 926 507 906Z" fill="#26262d" />
            <path d="M507 910 Q505 926 522 929 L616 930 Q630 928 626 910Z" fill="#6b6b73" />
            <path d="M584 896 l-22 -6 M590 905 l-28 -7 M572 888 l-16 -3" stroke="#555560" strokeWidth={3} strokeLinecap="round" />
          </g>
        )}
        {/* торс */}
        <path d="M430 338 Q505 322 580 338 Q592 345 590 376 L587 552 L423 552 L420 376 Q418 345 430 338Z" fill={`url(#${id}-torso)`} />
        <path d="M560 340 Q592 345 590 376 L587 552 L552 552 Q566 450 560 340Z" fill={HOOD.deep} opacity={0.28} />
        <rect x={421} y={540} width={166} height={36} rx={12} fill={HOOD.dark} />
        <rect x={421} y={540} width={166} height={6} rx={3} fill={HOOD.deep} opacity={0.6} />
        <path d="M452 478 L558 478 Q568 478 572 488 L584 538 L426 538 L438 488 Q442 478 452 478Z" fill={HOOD.dark} opacity={0.55} stroke={HOOD.deep} strokeWidth={3} />
        {pocketKey > 0 && !pocketOver && pocketTag}
        <path d="M452 478 L558 478" stroke={HOOD.deep} strokeWidth={4} strokeLinecap="round" />
        {/* шея и капюшон */}
        <rect x={478} y={292} width={54} height={60} rx={14} fill="#e4aa7d" />
        <path d="M428 352 C424 318 448 298 480 304 L505 354 L530 304 C562 298 586 318 582 352 L560 360 C546 344 524 350 505 370 C486 350 464 344 450 360Z" fill={HOOD.light} stroke={HOOD.deep} strokeWidth={3} strokeLinejoin="round" />
        <path d="M444 332 C456 318 470 314 480 316 M566 332 C554 318 540 314 530 316" stroke={HOOD.deep} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
        <path d="M486 362 V436 M524 362 V436" stroke={HOOD.deep} strokeWidth={8} strokeLinecap="round" />
        <circle cx={486} cy={440} r={5} fill={HOOD.deep} /><circle cx={524} cy={440} r={5} fill={HOOD.deep} />
        {!armsFront && arms}
        {pocketOver && (
          <g>
            <path d="M452 478 L558 478 Q568 478 572 488 L584 538 L426 538 L438 488 Q442 478 452 478Z" fill={HOOD.base} />
            <path d="M452 478 L558 478 Q568 478 572 488 L584 538 L426 538 L438 488 Q442 478 452 478Z" fill={HOOD.dark} opacity={0.55} stroke={HOOD.deep} strokeWidth={3} />
            {pocketKey > 0 && pocketTag}
          </g>
        )}
        {/* голова */}
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${tilt} 505 305)`}>
          <ellipse cx={404} cy={238} rx={13 * (1 - 0.75 * Math.max(0, turn))} ry={22} fill="#eeb785" /><ellipse cx={606} cy={238} rx={13 * (1 - 0.75 * Math.max(0, -turn))} ry={22} fill="#eeb785" />
          <path d="M401 230 q6 -4 8 6 M609 230 q-6 -4 -8 6" stroke="#cf936a" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M416 214 C416 288 456 314 505 314 C554 314 594 288 594 214 C594 168 560 150 505 150 C450 150 416 168 416 214Z" fill={`url(#${id}-face)`} />
          <ellipse cx={450} cy={268} rx={18} ry={10} fill="#f19a7a" opacity={0.22} /><ellipse cx={560} cy={268} rx={18} ry={10} fill="#f19a7a" opacity={0.22} />
          {/* волосы */}
          <path d="M470 134 L480 98 L500 128 L522 96 L532 126 L552 108 L550 142Z" fill={`url(#${id}-hair)`} />
          <path d="M404 238 C396 170 430 122 505 120 C582 120 616 170 606 238 L594 214 C590 192 572 182 548 190 C528 176 470 172 440 192 C428 200 420 212 416 238Z" fill={`url(#${id}-hair)`} />
          <path d="M560 128 C596 148 612 190 606 238 L594 214 C594 190 584 160 560 128Z" fill={HR.dark} opacity={0.55} />
          <path d="M430 150 C446 134 470 126 492 126" stroke={HR.light} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
          <path d="M440 192 C470 176 520 176 548 190" stroke={HR.dark} strokeWidth={3} fill="none" opacity={0.5} />
          {cap && (
            <g transform={`translate(${turn * 16} 0)`}>
              <path d="M408 200 C402 122 450 104 505 104 C560 104 608 122 602 200 Q505 172 408 200Z" fill="#1b1f2d" />
              <path d="M404 202 Q505 170 606 202 L602 190 Q505 160 408 190Z" fill="#10131c" />
              <path d="M418 206 Q505 186 594 206" stroke="#0a0c14" strokeWidth={6} fill="none" />
            </g>
          )}
          <g transform={`translate(${505 + turn * 32} 0) scale(${1 - 0.22 * Math.abs(turn)} 1) translate(-505 0)`}>
          {/* нос */}
          <path d="M503 240 q11 17 -1 23" stroke="#c1805f" strokeWidth={4} fill="none" strokeLinecap="round" opacity={1 - stranger} />
          {stranger > 0.01 && (
            <g opacity={stranger}>
              {/* собственное лицо водителя: крупный нос, усы, морщины, щетина */}
              <ellipse cx={505} cy={292} rx={72} ry={24} fill="#8a8a92" opacity={0.2} />
              <path d="M497 228 q22 26 6 40 q-10 4 -18 -3" stroke="#b5714f" strokeWidth={4.5} fill="#e7a983" strokeLinecap="round" />
              <path d="M456 252 q18 8 36 0 M518 252 q18 8 36 0" stroke="#c48a64" strokeWidth={2.6} fill="none" strokeLinecap="round" />
              <path d="M474 258 q-12 18 -5 34 M536 258 q12 18 5 34" stroke="#c48a64" strokeWidth={2.6} fill="none" strokeLinecap="round" />
              <path d="M466 272 q20 -14 39 -5 q19 -9 39 5 q-6 12 -39 7 q-33 5 -39 -7z" fill="#8f9299" stroke="#6f727a" strokeWidth={2} />
            </g>
          )}
          {/* брови, глаза, рот */}
          <path d={`M 452 ${yO + k * 0.5 + 1} L 494 ${yO - k + 0}`} stroke={brow} strokeWidth={9 + 5 * stranger} strokeLinecap="round" />
          <path d={`M 516 ${yO - k + 0} L 558 ${yO + k * 0.5 + 1}`} stroke={brow} strokeWidth={9 + 5 * stranger} strokeLinecap="round" />
          <Eye id={`${id}-eL`} cx={475} cy={229} p={e} look={look} lid={lid} />
          <Eye id={`${id}-eR`} cx={533} cy={229} p={e} look={look} lid={lid} />
          {e.smile > 0.05 ? (
            (() => {
              const sm = e.smile, hw = 22 + 48 * sm, y0 = 272 - 6 * sm;
              return (
                <g>
                  <path d={`M ${505 - hw} ${y0} Q 505 ${y0 + 56 * sm} ${505 + hw} ${y0} Q 505 ${y0 + 6 * sm} ${505 - hw} ${y0}Z`} fill="#4a1a1c" stroke="#8c3a36" strokeWidth={3} strokeLinejoin="round" />
                  <path d={`M ${505 - hw + 9} ${y0 + 2} Q 505 ${y0 + 36 * sm} ${505 + hw - 9} ${y0 + 2} Q 505 ${y0 + 5 * sm} ${505 - hw + 9} ${y0 + 2}Z`} fill="#fbf6ec" />
                  <path d={`M ${505 - hw + 14} ${y0 + 8 * sm} Q 505 ${y0 + 22 * sm} ${505 + hw - 14} ${y0 + 8 * sm}`} stroke="#d9d2c4" strokeWidth={2} fill="none" opacity={0.7} />
                </g>
              );
            })()
          ) : e.open > 0.05 ? (
            (() => {
              const rx = Math.max(5, e.mw / 2), ry = 3 + e.open * 9, cy = 279 + Math.max(0, e.open - 1) * 4;
              return (
                <g>
                  <clipPath id={`${id}-mouth`}><ellipse cx={505} cy={cy} rx={rx} ry={ry} /></clipPath>
                  <ellipse cx={505} cy={cy} rx={rx} ry={ry} fill="#5a2420" stroke="#8c3a36" strokeWidth={e.open > 1 ? 3 : 0} />
                  <g clipPath={`url(#${id}-mouth)`}>
                    {e.open > 0.9 && <rect x={505 - rx} y={cy - ry - 2} width={2 * rx} height={Math.min(9, ry * 0.4) + 2} fill="#fbf6ec" />}
                    <ellipse cx={505} cy={cy + ry * 0.75} rx={rx * 0.62} ry={ry * 0.45} fill="#c4665a" />
                  </g>
                </g>
              );
            })()
          ) : (
            <path d={`M ${505 - e.mw / 2} 280 Q 505 ${280 + e.mc} ${505 + e.mw / 2} 280`} fill="none" stroke="#b0604a" strokeWidth={4.2} strokeLinecap="round" />
          )}
          </g>
          {e.sweat > 0.2 && <path d={`M 566 ${196 + sweatY} q -7 12 0 17 q 8 -5 0 -17z`} fill="#a9dcff" opacity={0.9 - sweatY / 40} />}
        </g>
        {armsFront && arms}
        {extraArmR && <g transform={`translate(${hx} ${hy})`}>{extraArmR}</g>}
      </g>
    </g>
  );
};

/** Левая рука целиком в позе «в стороны» (для крупного плана пятна на рукаве). Центр плеча в (434,372). */
export const LeftArmStrip: React.FC<{glow?: number; frame?: number}> = ({glow = 0, frame = 0}) => (
  <g transform="translate(434 372) rotate(90)">
    <Arm elbow={0} gid="strip-aL"><g transform="translate(-4 78)"><StainBlob glow={glow} frame={frame} /></g></Arm>
  </g>
);
