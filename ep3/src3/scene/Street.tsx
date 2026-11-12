/**
 * Улица ночью: небо, дома, пешеходная зона, дорога, фонарь, остановка, дождь.
 * Все «случайные» детали детерминированы (mulberry) — иначе они мигают между кадрами.
 * ВАЖНО: геометрия вне кадра отбрасывается, иначе resvg падает на отрицательных размерах.
 */
import {h} from "../engine";
import {C, clamp, lerp, kf, mulberry, flicker} from "../theme";

export const GROUND_Y = 1046;
export const LAMP_X = 812;

const FAR = (t: number) => 0;

/** Дома: окна светятся, часть погашена. */
const City = (props: any) => {
  const {y = GROUND_Y, tint = 1} = props;
  const rnd = mulberry(4242);
  const bars: any[] = [];
  for (let k = -3; k <= 3; k++) {
    const bx = 540 + k * 260 + (rnd() - 0.5) * 60;
    const bw = 120 + rnd() * 130;
    const bh = 200 + rnd() * 330;
    if (bx + bw < 20 || bx > 1060) continue; // целиком за кадром
    const w = Math.max(40, bw);
    const top = y - bh;
    bars.push(<rect key={`b${k}`} x={bx} y={top} width={w} height={bh} fill={k % 2 ? '#0a1220' : '#0c1626'} />);
    for (let r = 0; r < Math.floor(bh / 64); r++) {
      for (let c = 0; c < Math.floor(w / 46); c++) {
        const lit = rnd() > 0.45;
        const wx = bx + 14 + c * 46;
        const wy = top + 22 + r * 64;
        if (!lit || wx + 22 > 1080 || wx < 0 || wy + 30 > y - 10) continue;
        bars.push(
          <rect
            key={`w${k}-${r}-${c}`}
            x={wx}
            y={wy}
            width={22}
            height={30}
            fill={rnd() > 0.75 ? '#ffcf8a' : '#7fa8c9'}
            opacity={0.16 + rnd() * 0.3 * tint}
          />,
        );
      }
    }
  }
  return <g>{bars}</g>;
};

/** Мокрый асфальт: дорога, разметка, отражения фонаря. */
const Ground = (props: any) => {
  const {t = 0, y = GROUND_Y, lampX = LAMP_X, lamp = 1} = props;
  const marks: any[] = [];
  for (let i = 0; i < 7; i++) {
    const x = -120 + i * 230;
    if (x + 120 < -60 || x > 1140) continue;
    marks.push(<rect key={i} x={x} y={y + 210} width={120} height={16} rx={8} fill="#c9d6e6" opacity={0.16} />);
  }
  return (
    <g>
      <rect x={-120} y={y} width={1320} height={1920 - y} fill="#080d18" />
      <rect x={-120} y={y} width={1320} height={120} fill="#0b1220" />
      {marks}
      {/* отражения фонаря на мокром асфальте */}
      <g opacity={clamp(lamp)}>
        <ellipse cx={lampX} cy={y + 210} rx={120} ry={190} fill="url(#lampReflect)" opacity={0.5} />
        <ellipse cx={lampX} cy={y + 120} rx={54} ry={140} fill="url(#lampReflect)" opacity={0.35} />
      </g>
      {[0.18, 0.42, 0.63, 0.84].map((u, i) => (
        <rect key={i} x={u * 1080} y={y + 60 + i * 26} width={140 + i * 30} height={6} rx={3} fill="#8fc4f0" opacity={0.05} />
      ))}
    </g>
  );
};

/** Фонарь: столб, кронштейн, плафон, тёплый конус света. */
const Lamp = (props: any) => {
  const {x = LAMP_X, y = GROUND_Y, on = 1, t = 0, h = 620} = props;
  const fl = on > 0.02 ? flicker(t, 3, 0.06) * on : 0;
  const headY = y - h;
  return (
    <g>
      <rect x={x - 7} y={headY} width={14} height={h} fill="#1a2436" />
      <path d={`M${x - 6},${headY + 6} Q${x - 4},${headY - 26} ${x + 34},${headY - 28}`} stroke="#1a2436" strokeWidth={12} fill="none" strokeLinecap="round" />
      <ellipse cx={x + 40} cy={headY - 26} rx={30} ry={12} fill="#2a3446" />
      {fl > 0.02 ? (
        <g opacity={fl}>
          <path d={`M${x + 20},${headY - 22} L${x - 160},${y + 40} L${x + 300},${y + 40} L${x + 62},${headY - 22} Z`} fill="url(#lampCone)" opacity={0.55} />
          <ellipse cx={x + 40} cy={headY - 20} rx={54} ry={30} fill="url(#lampBulb)" />
          <ellipse cx={x + 40} cy={headY - 12} rx={14} ry={8} fill="#fff3d0" />
        </g>
      ) : null}
    </g>
  );
};

/** Остановка: навес, стойка, стеклянная панель, скамейка, табличка. */
const Shelter = (props: any) => {
  const {x = 300, y = GROUND_Y, lamp = 1, sign = 'ПОСЛЕДНЯЯ', wet = 1} = props;
  return (
    <g transform={`translate(${x} 0)`}>
      {/* скамейка */}
      <rect x={-96} y={y - 96} width={196} height={14} rx={6} fill="#2a3446" />
      <rect x={-86} y={y - 82} width={12} height={82} fill="#1e2739" />
      <rect x={86} y={y - 82} width={12} height={82} fill="#1e2739" />
      {/* навес */}
      <rect x={-126} y={y - 372} width={272} height={16} rx={5} fill="#202b3d" />
      <rect x={-126} y={y - 388} width={272} height={20} rx={6} fill="#28344a" />
      <rect x={-118} y={y - 368} width={8} height={368} fill="#1b2537" />
      <rect x={138} y={y - 368} width={8} height={368} fill="#1b2537" />
      {/* стеклянная панель за двойником */}
      <rect x={-104} y={y - 352} width={232} height={250} fill="#0c1726" opacity={0.7} />
      <rect x={-104} y={y - 352} width={232} height={250} fill="url(#glassWet)" opacity={0.35} />
      <rect x={-104} y={y - 352} width={232} height={6} rx={3} fill="#31405a" />
      {/* лампа под навесом */}
      <g opacity={clamp(lamp)}>
        <ellipse cx={16} cy={y - 344} rx={90} ry={44} fill="url(#lampBulb)" opacity={0.55} />
        <rect x={-14} y={y - 350} width={62} height={8} rx={4} fill="#fff3d0" />
        <path d={`M-24,${y - 336} L-150,${y + 20} L200,${y + 20} L56,${y - 336} Z`} fill="url(#lampCone)" opacity={0.3} />
      </g>
      {/* табличка */}
      <g transform={`translate(-236 ${y - 300})`}>
        <rect x={0} y={0} width={16} height={300} fill="#1b2537" />
        <rect x={-62} y={-104} width={140} height={64} rx={8} fill="#14203a" stroke="#3a4a66" strokeWidth={3} />
        <text x={8} y={-64} textAnchor="middle" fontFamily="DejaVu Sans" fontSize={22} fill="#cfe0f5" opacity={0.9}>
          {sign}
        </text>
      </g>
      {wet > 0.05 ? <rect x={-104} y={y - 8} width={232} height={10} rx={5} fill="#8fc4f0" opacity={0.06 * wet} /> : null}
    </g>
  );
};

/** Дождь: длинные штрихи, детерминировано по кадрам. */
const Rain = (props: any) => {
  const {t = 0, amount = 1, seed = 1, speed = 1500} = props;
  const rnd = mulberry(seed * 9973);
  const drops: any[] = [];
  const n = Math.round(70 * amount);
  for (let i = 0; i < n; i++) {
    const x0 = rnd() * 1160 - 40;
    const phase = rnd();
    const len = 40 + rnd() * 70;
    const spd = speed * (0.7 + rnd() * 0.6);
    const y = ((phase * 2000 + t * spd) % 2200) - 200;
    const o = 0.06 + rnd() * 0.16;
    drops.push(<path key={i} d={`M${x0},${y} l-10,${len}`} stroke="#a9cbea" strokeWidth={1.6} opacity={o} strokeLinecap="round" />);
  }
  return <g>{drops}</g>;
};

export type StreetProps = {
  t: number;
  lampOn?: number;
  lampX?: number;
  shelterX?: number;
  rain?: number;
  tint?: number;
  sign?: string;
  children?: any;
};

/** Вся сцена снаружи. */
export const StreetScene = (props: StreetProps) => {
  const {t = 0, lampOn = 1, lampX = LAMP_X, shelterX = 300, rain = 1, tint = 1, sign = 'ПОСЛЕДНЯЯ', children} = props;
  return (
    <g>
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#050a15" />
          <stop offset="0.55" stopColor="#0a1424" />
          <stop offset="1" stopColor="#111c2f" />
        </linearGradient>
        <radialGradient id="lampCone">
          <stop offset="0" stopColor="#ffd79a" stopOpacity={0.55} />
          <stop offset="0.55" stopColor="#ffc477" stopOpacity={0.16} />
          <stop offset="1" stopColor="#ffc477" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="lampBulb">
          <stop offset="0" stopColor="#fff6dc" />
          <stop offset="0.45" stopColor="#ffcf8a" />
          <stop offset="1" stopColor="#ffcf8a" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="lampReflect">
          <stop offset="0" stopColor="#ffd79a" stopOpacity={0.4} />
          <stop offset="1" stopColor="#ffd79a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="glassWet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9fd0f5" stopOpacity={0.18} />
          <stop offset="0.5" stopColor="#9fd0f5" stopOpacity={0.02} />
          <stop offset="1" stopColor="#9fd0f5" stopOpacity={0.12} />
        </linearGradient>
      </defs>
      <rect x={-400} y={-400} width="1900" height="2800" fill="#05070f" />
      <rect x={-400} y={-400} width="1900" height={GROUND_Y + 400} fill="url(#skyG)" />
      <City y={GROUND_Y} tint={tint} />
      {/* туман у горизонта */}
      <ellipse cx={540} cy={GROUND_Y - 40} rx={760} ry={130} fill="#16233a" opacity={0.5} />
      <Ground t={t} y={GROUND_Y} lampX={lampX} lamp={lampOn} />
      <Lamp x={lampX} y={GROUND_Y} on={lampOn} t={t} />
      <Shelter x={shelterX} y={GROUND_Y} lamp={lampOn} sign={sign} />
      {children}
      <Rain t={t} amount={rain} seed={11} />
      {/* виньетка */}
      <rect x={-400} y={-400} width="1900" height="2800" fill="url(#vignette)" opacity={0.5} />
      <radialGradient id="vignette">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.65} />
      </radialGradient>
    </g>
  );
};
