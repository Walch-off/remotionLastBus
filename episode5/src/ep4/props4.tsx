import React from 'react';
import {SKIN} from '../common';
import {Hero} from '../components/Hero';

const rot = (x: number, y: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
};

/**
 * Точка в системе кулака (кулак в (0,166) системы предплечья) → координаты героя.
 * Повторяет трансформации Hero/Arm, чтобы контакт предмета с объектами считался, а не подбирался на глаз.
 */
export const fistPoint = (side: 'L' | 'R', arm: number, elbow: number, lx: number, ly: number, itemRot = 0): [number, number] => {
  const sx = side === 'L' ? 434 : 574;
  const outer = side === 'L' ? 90 - arm : arm - 90;
  const inner = side === 'L' ? -elbow : elbow;
  const [ix, iy] = rot(lx, ly, itemRot);
  const [fx, fy] = rot(ix, 166 + iy, inner);
  const [ux, uy] = rot(fx, 150 + fy, outer);
  return [sx + ux, 372 + uy];
};
/** поворот кулака в мире (градусы) — для «гравитации» висящих частей */
export const fistWorldRot = (side: 'L' | 'R', arm: number, elbow: number) => (side === 'L' ? 90 - arm - elbow : arm - 90 + elbow);

/** Сжатый кулак (рисуется поверх рукояти), начало координат — центр кулака */
export const Fist: React.FC<{thumbSide?: 1 | -1; squeeze?: number}> = ({thumbSide = 1, squeeze = 0}) => (
  <g>
    <rect x={-27} y={-28} width={54} height={54} rx={20} fill={SKIN} stroke="#d49a6e" strokeWidth={2.5} />
    {[-14, -1, 12].map((x, i) => <path key={i} d={`M${x} ${-20 + squeeze * 3} v34`} stroke="#d9a67a" strokeWidth={2.4} strokeLinecap="round" opacity={0.85} />)}
    <path d={`M${thumbSide * 20} -18 q${thumbSide * 14} 10 ${thumbSide * 6} 30`} stroke="#d49a6e" strokeWidth={3} fill={SKIN} />
    {squeeze > 0.3 && <path d="M-20 -22 h40" stroke="#f7dcc0" strokeWidth={4} strokeLinecap="round" opacity={squeeze * 0.8} />}
  </g>
);

/** Аварийный молоток. Начало координат — точка хвата; рукоять вдоль +x, боёк на конце, остриё — вверх (−y). */
export const HAMMER_TIP: [number, number] = [111, -80];
export const HammerShape: React.FC<{glint?: number}> = ({glint = 0}) => (
  <g>
    <rect x={-34} y={-12} width={140} height={24} rx={10} fill="#d5342b" stroke="#7d1a15" strokeWidth={3} />
    <rect x={-34} y={-12} width={140} height={7} rx={3} fill="#ff6a5c" opacity={0.6} />
    <path d="M96 -52 L126 -52 L126 44 L96 44Z" fill="#4c5566" stroke="#22262f" strokeWidth={3} />
    <path d="M96 -52 L111 -80 L126 -52Z" fill="#8a94a6" stroke="#22262f" strokeWidth={3} strokeLinejoin="round" />
    <path d="M96 44 L111 66 L126 44Z" fill="#8a94a6" stroke="#22262f" strokeWidth={3} strokeLinejoin="round" />
    <path d="M101 -46 V38" stroke="#c9d2e2" strokeWidth={3} opacity={0.6} />
    {glint > 0 && <circle cx={111} cy={-80} r={10 + 10 * glint} fill="#fff6d8" opacity={0.7 * glint} />}
  </g>
);
export const HammerInFist: React.FC<{itemRot: number}> = ({itemRot}) => (
  <g>
    <g transform={`rotate(${itemRot})`}><HammerShape /></g>
    <Fist />
  </g>
);

/** Ключ от дверей с красной биркой «ДВЕРИ». Начало — кольцо. g — угол «вниз» в локальной системе (бирка висит). */
export const KeyShape: React.FC<{g?: number; swing?: number; scale?: number}> = ({g = 0, swing = 0, scale = 1}) => (
  <g transform={`scale(${scale})`}>
    <g transform={`rotate(${g + swing})`}>
      <path d="M0 0 Q4 26 -2 44" stroke="#bbb" strokeWidth={3} fill="none" />
      <g transform="translate(-2 44)">
        <rect x={-30} y={0} width={60} height={42} rx={7} fill="#c7433a" stroke="#7a1f1a" strokeWidth={3} />
        <text x={0} y={27} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={14} fill="#fff">ДВЕРИ</text>
      </g>
    </g>
    <circle cx={0} cy={0} r={14} fill="none" stroke="#e0c97c" strokeWidth={7} />
    <circle cx={0} cy={0} r={14} fill="none" stroke="#8a7a3a" strokeWidth={1.5} />
    <rect x={10} y={-5} width={62} height={10} rx={4} fill="#e0c97c" stroke="#8a7a3a" strokeWidth={2} />
    <path d="M48 5 v10 h8 v-10 M60 5 v7 h7 v-7" fill="#e0c97c" stroke="#8a7a3a" strokeWidth={2} />
  </g>
);
/** ключ в кулаке: кольцо и бирка снаружи кулака, бородка торчит */
export const KeyInFist: React.FC<{worldRot: number; swing?: number; squeeze?: number; slip?: number}> = ({worldRot, swing = 0, squeeze = 0, slip = 0}) => (
  <g>
    <g transform={`translate(${-6} ${12 + slip * 34})`}>
      <g transform="rotate(90)"><KeyShape g={-worldRot - 90} swing={swing} /></g>
    </g>
    <Fist squeeze={squeeze} />
  </g>
);

/** Телефон в кулаке, экраном к зрителю, вертикально в мире */
export const PhoneInFist: React.FC<{worldRot: number; glow?: number}> = ({worldRot, glow = 1}) => (
  <g>
    <g transform={`rotate(${-worldRot})`}>
      <rect x={-40} y={-178} width={80} height={150} rx={14} fill="#0a0c14" stroke="#4a5272" strokeWidth={3} />
      <rect x={-34} y={-170} width={68} height={134} rx={9} fill="#2a4fb0" opacity={0.25 + 0.75 * glow} />
      <rect x={-26} y={-146} width={52} height={26} rx={7} fill="#2f6bff" opacity={glow} />
      {glow > 0 && <ellipse cx={0} cy={-100} rx={120} ry={150} fill="#7fa4ff" opacity={0.12 * glow} />}
    </g>
    <Fist thumbSide={-1} />
  </g>
);

/** Указательный жест (кулак + вытянутый палец вдоль предплечья) */
export const PointFist: React.FC = () => (
  <g>
    <rect x={-9} y={8} width={18} height={62} rx={9} fill={SKIN} stroke="#d49a6e" strokeWidth={2.5} />
    <Fist />
  </g>
);

/** Сверхъестественная мокрая ладонь: без руки и владельца, запястье растворяется в темноте. open: 0 — пальцы сомкнуты, 1 — раскрыта. */
export const WetHand: React.FC<{x: number; y: number; scale?: number; appear: number; open?: number; t: number; rotDeg?: number; id: string}> = ({x, y, scale = 1, appear, open = 0, t, rotDeg = 0, id}) => {
  if (appear <= 0) return null;
  const fingers = [-1.5, -0.5, 0.5, 1.5];
  const skin = '#8fa9cf', edge = '#4f6c99';
  const drops = [0, 1, 2].map((k) => ((t * 0.9 + k * 0.37) % 1));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotDeg}) scale(${scale})`}>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="0.55" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity={0} /></linearGradient>
        <mask id={`${id}-m`}><rect x={-200} y={-260} width={400} height={520} fill={`url(#${id}-fade)`} /></mask>
        <radialGradient id={`${id}-mist`}><stop offset="0" stopColor="#9fc0f5" stopOpacity={0.35} /><stop offset="1" stopColor="#9fc0f5" stopOpacity={0} /></radialGradient>
      </defs>
      <ellipse cx={0} cy={20} rx={170 * (0.6 + 0.4 * appear)} ry={170} fill={`url(#${id}-mist)`} opacity={appear} />
      <g mask={`url(#${id}-m)`} opacity={0.82 * Math.min(1, appear * 1.2)}>
        <rect x={-40} y={60} width={80} height={170} rx={30} fill={skin} opacity={0.8} />
        {fingers.map((f, i) => {
          const spread = f * (10 + 12 * open);
          const len = 92 + (i === 1 || i === 2 ? 14 : 0) - (1 - open) * 26;
          return (
            <g key={i} transform={`translate(${f * 22} -40) rotate(${spread})`}>
              <rect x={-12} y={-len} width={24} height={len + 20} rx={12} fill={skin} stroke={edge} strokeWidth={2.5} />
              <path d={`M-4 ${-len + 14} v10`} stroke="#eef6ff" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
            </g>
          );
        })}
        <g transform={`translate(-58 6) rotate(${-38 - 20 * open})`}>
          <rect x={-13} y={-74} width={26} height={84} rx={13} fill={skin} stroke={edge} strokeWidth={2.5} />
        </g>
        <path d="M-58 -50 Q-62 40 -36 80 L36 80 Q62 40 58 -50 Q0 -64 -58 -50Z" fill={skin} stroke={edge} strokeWidth={2.5} />
        <path d="M-30 -20 q30 18 60 0 M-26 20 q26 12 52 0" stroke="#7f95b4" strokeWidth={3} fill="none" opacity={0.7} />
        <path d="M-40 -40 q10 -6 22 -4" stroke="#f2f8ff" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      </g>
      {drops.map((d, k) => (
        <path key={k} d={`M${-30 + k * 30} ${90 + d * 160} q-6 10 0 14 q6 -4 0 -14z`} fill="#bcd6ff" opacity={appear * (1 - d) * 0.9} />
      ))}
    </g>
  );
};

/** Детерминированный узор трещин из точки удара (локальные координаты зеркала) */
type Seg = [number, number, number, number, number]; // x1 y1 x2 y2 порядок появления 0..1
export const crackPattern = (cx: number, cy: number, w: number, h: number): Seg[] => {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const segs: Seg[] = [];
  const R = Math.hypot(w, h);
  const rays = 15;
  const ringPts: [number, number][][] = [[], [], []];
  for (let i = 0; i < rays; i++) {
    const a0 = (i / rays) * Math.PI * 2 + rnd() * 0.3;
    let x = cx, y = cy, a = a0, len = 0;
    const steps = 9;
    for (let k = 0; k < steps; k++) {
      const l = (R / steps) * (0.5 + rnd() * 0.7);
      a += (rnd() - 0.5) * 0.35;
      const nx = x + Math.cos(a) * l, ny = y + Math.sin(a) * l;
      segs.push([x, y, nx, ny, (len / R) * 0.95]);
      len += l; x = nx; y = ny;
      if (k === 0) ringPts[0].push([x, y]);
      if (k === 1) ringPts[1].push([x, y]);
      if (k === 3) ringPts[2].push([x, y]);
    }
  }
  ringPts.forEach((ring, r) => ring.forEach((p, i) => {
    const q = ring[(i + 1) % ring.length];
    if (rnd() < 0.8) segs.push([p[0], p[1], q[0], q[1], 0.15 + r * 0.22]);
  }));
  return segs;
};

/** Ладонь, прижатая к стеклу изнутри (видна сквозь стекло, ладонью к зрителю) */
export const PressedPalm: React.FC<{press: number}> = ({press}) => (
  <g>
    {[-1.5, -0.5, 0.5, 1.5].map((f, i) => (
      <rect key={i} x={f * 21 - 10} y={-118 - (i === 1 || i === 2 ? 12 : 0)} width={20} height={90} rx={10} fill="#d7a77f" stroke="#a87650" strokeWidth={2} />
    ))}
    <g transform="translate(-52 0) rotate(-40)"><rect x={-11} y={-66} width={22} height={74} rx={11} fill="#d7a77f" stroke="#a87650" strokeWidth={2} /></g>
    <path d="M-50 -46 Q-54 34 -30 70 L30 70 Q54 34 50 -46 Q0 -58 -50 -46Z" fill="#d7a77f" stroke="#a87650" strokeWidth={2} />
    {/* побелевшие места прижатия */}
    <ellipse cx={0} cy={4} rx={30 * press} ry={24 * press} fill="#f3dccb" opacity={0.5 * press} />
    {[-1.5, -0.5, 0.5, 1.5].map((f, i) => <ellipse key={i} cx={f * 21} cy={-100 - (i === 1 || i === 2 ? 12 : 0)} rx={7 * press} ry={9 * press} fill="#f3dccb" opacity={0.5 * press} />)}
  </g>
);

/** Мокрый отпечаток ладони НА НАШЕЙ стороне стекла: вода, блики, капли стекают поверх трещин */
export const WaterPrint: React.FC<{op: number; t: number; drip?: number}> = ({op, t, drip = 0}) => {
  if (op <= 0) return null;
  const c = '#9cc2ff';
  return (
    <g opacity={op}>
      <g fill={c} opacity={0.42}>
        {[-1.5, -0.5, 0.5, 1.5].map((f, i) => <rect key={i} x={f * 21 - 10} y={-118 - (i === 1 || i === 2 ? 12 : 0)} width={20} height={90} rx={10} />)}
        <g transform="translate(-52 0) rotate(-40)"><rect x={-11} y={-66} width={22} height={74} rx={11} /></g>
        <path d="M-50 -46 Q-54 34 -30 70 L30 70 Q54 34 50 -46 Q0 -58 -50 -46Z" />
      </g>
      {/* блики воды */}
      {[[-30, -100], [-10, -112], [12, -112], [32, -98], [-20, -20], [18, 10], [-2, 40]].map(([x, y], i) => (
        <g key={i}><circle cx={x} cy={y} r={5} fill="#f2f8ff" opacity={0.9} /><circle cx={x + 2} cy={y + 3} r={7} fill="none" stroke="#5f86c8" strokeWidth={1.5} opacity={0.6} /></g>
      ))}
      {/* потёки вниз */}
      {[[-30, 70], [6, 72], [30, 66]].map(([x, y], i) => {
        const L = 20 + 60 * Math.min(1, drip + i * 0.15);
        return <path key={i} d={`M${x - 4} ${y} V${y + L} q4 10 8 0 V${y}Z`} fill={c} opacity={0.6} />;
      })}
    </g>
  );
};

/** Лицо героя «по ту сторону» зеркала */
export const MirrorFace: React.FC<{op: number; look?: [number, number]; face?: any; turn?: number; tilt?: number; t: number}> = ({op, look = [0, 0], face = 'blank', turn = 0, tilt = 0}) => {
  if (op <= 0) return null;
  return (
    <g opacity={op}>
      <Hero id="mface" x={0} y={0} scale={0.62} anchor={[505, 230]} legs={false} face={face} look={look} turn={turn} tilt={tilt}
        armL={80} armR={80} shade={0.42} shadeColor={[0.16, 0.26, 0.5]} blinkSeed={53} />
    </g>
  );
};
