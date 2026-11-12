/**
 * Салон автобуса: перспектива с камерой на y=1.5 м (f=980), экранный центр (540,900).
 * Геометрия в метрах: ширина 2.6, потолок 2.35, окна 1.02..1.96, дальняя стенка 8.4.
 */
import {h} from "../engine";
import {C, clamp, lerp, kf, mulberry, flicker, busShake} from "../theme";
import {Hand, Arm, Hero} from "./Hero";

export const WIN_Z: [number, number][] = [
  [1.55, 2.95],
  [3.12, 4.52],
  [4.69, 6.09],
  [6.26, 7.42],
];
const F = 980;
const CX = 540;
const CY = 900;
const CAM_Y = 1.5;
const HALF_W = 1.3;
const CEIL = 2.35;
const WIN_LO = 1.02;
const WIN_HI = 1.96;
const FAR = 8.4;
const CAB = 7.5;

/** Проекция точки (x — поперёк, y — высота, z — вперёд) в экранные координаты. */
export const project = (x: number, y: number, z: number) => ({
  x: CX + (F * x) / Math.max(0.35, z),
  y: CY - (F * (y - CAM_Y)) / Math.max(0.35, z),
  s: F / Math.max(0.35, z),
});

/** Квад-полигон по 4 углам в мире. */
const quad = (pts: [number, number, number][]) =>
  pts
    .map((p, i) => {
      const q = project(p[0], p[1], p[2]);
      return `${i === 0 ? "M" : "L"}${q.x.toFixed(1)},${q.y.toFixed(1)}`;
    })
    .join(" ") + " Z";

/** Прямоугольник стены в плоскости x = ±HALF_W. */
const wallQuad = (side: 1 | -1, y0: number, y1: number, z0: number, z1: number) =>
  quad([
    [side * HALF_W, y0, z0],
    [side * HALF_W, y0, z1],
    [side * HALF_W, y1, z1],
    [side * HALF_W, y1, z0],
  ]);

export const busAt = (t: number) => ({
  moving: t > 13.71 && t < 110.0,
  stop: t >= 110.0,
});

/** Тряска корпуса: 0 на стоянке, максимум на ходу. */
export const shakeAt = (t: number) => {
  const moving = clamp((t - 13.9) / 1.2) * (1 - clamp((t - 108) / 2.2));
  return busShake(t, moving * 1.0);
};

const defs = (
  <defs>
    <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={C.wall} />
      <stop offset="1" stopColor={C.wallDark} />
    </linearGradient>
    <linearGradient id="seatG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={C.seatEdge} />
      <stop offset="1" stopColor={C.seat} />
    </linearGradient>
    <linearGradient id="seatG2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#22304d" />
      <stop offset="1" stopColor="#101a2c" />
    </linearGradient>
    <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#101a2e" />
      <stop offset="0.6" stopColor="#0b1322" />
      <stop offset="1" stopColor="#070c17" />
    </linearGradient>
    <radialGradient id="ceilGlow">
      <stop offset="0" stopColor={C.lampWarm} stopOpacity={0.55} />
      <stop offset="1" stopColor={C.lampWarm} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="lampBulb">
      <stop offset="0" stopColor="#fff6dc" />
      <stop offset="0.5" stopColor={C.lampWarm} />
      <stop offset="1" stopColor={C.lampWarm} stopOpacity={0} />
    </radialGradient>
    <linearGradient id="metalG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#4a5872" />
      <stop offset="0.5" stopColor="#9fb2cc" />
      <stop offset="1" stopColor="#3d4a63" />
    </linearGradient>
    <linearGradient id="glassNight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0d1b30" />
      <stop offset="1" stopColor="#050a14" />
    </linearGradient>
    <linearGradient id="mirrorG" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#16243c" />
      <stop offset="0.55" stopColor="#0c1526" />
      <stop offset="1" stopColor="#1a2b44" />
    </linearGradient>
    <radialGradient id="wetSheen">
      <stop offset="0" stopColor={C.cold} stopOpacity={0.32} />
      <stop offset="1" stopColor={C.cold} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="flashG">
      <stop offset="0" stopColor="#fff1c9" stopOpacity={0.9} />
      <stop offset="1" stopColor="#fff1c9" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="warmFace">
      <stop offset="0" stopColor={C.warm} stopOpacity={0.3} />
      <stop offset="1" stopColor={C.warm} stopOpacity={0} />
    </radialGradient>
    <linearGradient id="torchCone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffe9b8" stopOpacity={0.5} />
      <stop offset="1" stopColor="#ffe9b8" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="doorGlass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#0a1526" />
      <stop offset="0.5" stopColor="#132540" />
      <stop offset="1" stopColor="#0a1526" />
    </linearGradient>
  </defs>
);

/** Окно с ночным стеклом, отражениями и струями дождя. */
const Window = (props: any) => {
  const {z0, z1, side = -1, lit = 1, streakSeed = 1, clipId, glassTint = 0, seeThrough = false, tt = 0, moving = 0} = props;
  const _c = project(side * HALF_W, (WIN_LO + WIN_HI) / 2, (z0 + z1) / 2);
  const _b = project(side * HALF_W, WIN_LO, (z0 + z1) / 2);
  const wf = {cx: _c.x, cy: _c.y, s: _c.s, y1: _b.y};
  const d = wallQuad(side, WIN_LO, WIN_HI, z0, z1);
  const rnd = mulberry(streakSeed * 7919);
  const streaks = Array.from({length: 5}, () => {
    const u = rnd();
    return {u, len: 0.15 + rnd() * 0.35, o: 0.06 + rnd() * 0.14};
  });
  const frame = 0.045;
  return (
    <g>
      <path d={d} fill="url(#glassNight)" />
      <clipPath id={clipId}>
        <path d={d} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        {/* ночная улица: силуэты домов + проплывающие фонари */}
        <path
          d={quad([
            [side * (HALF_W + 0.6), -0.6, z0 - 0.4],
            [side * (HALF_W + 0.6), -0.6, z1 + 0.4],
            [side * (HALF_W + 0.6), 1.75, z1 + 0.4],
            [side * (HALF_W + 0.6), 1.75, z0 - 0.4],
          ])}
          fill="#060c17"
        />
        {(() => {
          const rnd = mulberry(3311 + Math.round(z0 * 97) + (side > 0 ? 13 : 0));
          const items: any[] = [];
          for (let k = 0; k < 5; k++) {
            const zz = z0 - 0.3 + rnd() * (z1 - z0 + 0.6);
            const hgt = 0.7 + rnd() * 0.9;
            const a = project(side * (HALF_W + 0.5), 0.4 + hgt, zz);
            const b = project(side * (HALF_W + 0.5), 0.4, zz);
            items.push(<rect key={`bl${k}`} x={a.x - 0.02 * a.s} y={a.y} width={0.05 * a.s} height={Math.max(1, b.y - a.y)} fill="#0d1626" opacity={0.9} />);
            const litw = rnd() > 0.35;
            if (litw) {
              const c = project(side * (HALF_W + 0.5), 0.75, zz);
              items.push(<rect key={`w${k}`} x={c.x - 0.012 * c.s} y={c.y} width={0.024 * c.s} height={0.03 * c.s} fill="#ffcf8a" opacity={0.35 + rnd() * 0.35} />);
            }
          }
          // фонари, проплывающие с ходом автобуса
          for (let k = 0; k < 3; k++) {
            const sp = 2.4;
            const zPos = ((z0 - 0.5 + ((tt * sp + k * 1.9 + 20) % 6)) + 6) % 6;
            const zz = z0 - 0.6 + Math.min(z1 - z0 + 1.2, zPos);
            const p = project(side * (HALF_W + 0.45), 1.55, zz);
            const o = clamp(1 - Math.abs((z0 + z1) / 2 - zz) / 2.2);
            if (o <= 0.02) continue;
            items.push(
              <g key={`lp${k}`} opacity={o * clamp(lit)}>
                <ellipse cx={p.x} cy={p.y} rx={0.16 * p.s} ry={0.16 * p.s} fill="url(#lampBulb)" opacity={0.7} />
                <ellipse cx={p.x} cy={p.y} rx={0.05 * p.s} ry={0.05 * p.s} fill="#fff3d0" />
                <rect x={p.x - 0.008 * p.s} y={p.y} width={0.016 * p.s} height={Math.max(1, 0.5 * p.s)} fill="#141e30" opacity={0.8} />
              </g>,
            );
          }
          return items;
        })()}
      </g>
      {/* струи дождя по стеклу */}
      <clipPath id={`${clipId}-r`}>
        <path d={d} />
      </clipPath>
      <g clipPath={`url(#${clipId}-r)`}>
        {streaks.map((s, i) => {
          const zz = lerp(z0, z1, s.u);
          const top = project(side * HALF_W, WIN_HI - 0.06, zz);
          const bot = project(side * HALF_W, WIN_HI - 0.06 - s.len, zz);
          const wpx = Math.max(1.2, 0.012 * top.s);
          return <rect key={i} x={top.x} y={top.y} width={wpx} height={Math.max(1, bot.y - top.y)} fill="#cfe4ff" opacity={s.o} />;
        })}
      </g>
      {/* блик по стеклу */}
      <g opacity={0.18 * lit}>
        <path
          d={quad([
            [side * (HALF_W - 0.001), WIN_LO + 0.1, z0 + 0.05],
            [side * (HALF_W - 0.001), WIN_LO + 0.1, z1 - 0.05],
            [side * (HALF_W - 0.001), WIN_LO + 0.55, z1 - 0.05],
            [side * (HALF_W - 0.001), WIN_LO + 0.55, z0 + 0.05],
          ])}
          fill="#ffffff"
        />
      </g>
      {/* оконная рама */}
      <path d={wallQuad(side, WIN_HI, WIN_HI + frame, z0, z1)} fill={C.wallDark} />
      <path d={wallQuad(side, WIN_LO - frame, WIN_LO, z0, z1)} fill={C.wallDark} />
      <path d={wallQuad(side, WIN_LO - frame, WIN_HI + frame, z0, z0 + frame)} fill={C.wallDark} />
      <path d={wallQuad(side, WIN_LO - frame, WIN_HI + frame, z1 - frame, z1)} fill={C.wallDark} />
      {glassTint > 0 ? <path d={d} fill={C.cold} opacity={0.06 + glassTint * 0.08} /> : null}
    </g>
  );
};

/** Саденье: каркас, подушка, спинка; немного «мокрого» блеска. */
const Seat = (props: any) => {
  const {z0, z1, side = -1, wet = 0, occupied = 0} = props;
  const baseY = 0.46;
  const topY = 1.06;
  const xIn = side * (HALF_W - 0.52);
  const xOut = side * (HALF_W - 0.04);
  const cushion = quad([
    [xOut, baseY, z0],
    [xOut, baseY, z1],
    [xIn, baseY, z1],
    [xIn, baseY, z0],
  ]);
  const top = quad([
    [xOut, baseY + 0.13, z0],
    [xOut, baseY + 0.13, z1],
    [xIn, baseY + 0.13, z1],
    [xIn, baseY + 0.13, z0],
  ]);
  const back = quad([
    [xOut, 0.6, z0 + 0.03],
    [xOut, 0.6, z1 - 0.03],
    [xOut, topY, z1 - 0.03],
    [xOut, topY, z0 + 0.03],
  ]);
  const backX = quad([
    [xIn, 0.6, z0 + 0.03],
    [xIn, 0.6, z1 - 0.03],
    [xIn, topY, z1 - 0.03],
    [xIn, topY, z0 + 0.03],
  ]);
  return (
    <g>
      <path d={backX} fill="url(#seatG2)" />
      <path d={back} fill="url(#seatG)" />
      <path d={cushion} fill="#101a2c" />
      <path d={top} fill="url(#seatG)" />
      <path
        d={quad([
          [xIn, baseY + 0.14, z0 + 0.04],
          [xIn, baseY + 0.14, z1 - 0.04],
          [xIn, baseY, z1 - 0.04],
          [xIn, baseY, z0 + 0.04],
        ])}
        fill="#0a1220"
      />
      {wet > 0.02
        ? [0.3, 0.62].map((u, i) => {
            const p = project(lerp(xIn, xOut, 0.45), baseY + 0.135, lerp(z0, z1, u));
            return <ellipse key={i} cx={p.x} cy={p.y} rx={0.17 * p.s} ry={0.05 * p.s} fill="url(#wetSheen)" opacity={wet * 0.8} />;
          })
        : null}
      {occupied > 0.02 ? (
        <g opacity={occupied}>
          <path
            d={quad([
              [xOut, 0.6, z0 + 0.05],
              [xOut, 0.6, z1 - 0.05],
              [xOut, 1.0, z1 - 0.05],
              [xOut, 1.0, z0 + 0.05],
            ])}
            fill="#1a2740"
            opacity={0.7}
          />
        </g>
      ) : null}
    </g>
  );
};

/** Потолочные лампы: тёплые панели + ореолы; light — общая яркость. */
const Lamps = (props: any) => {
  const {t, light = 1, flick = 0} = props;
  const zs = [1.9, 3.4, 4.9, 6.4];
  return (
    <g>
      {zs.map((z, i) => {
        const fl = flicker(t, i + 1, 0.1 + flick * 0.5);
        const p = project(0, CEIL - 0.02, z);
        const w = 0.62 * p.s;
        const hh = 0.16 * p.s;
        const a = clamp(light * fl);
        return (
          <g key={i} opacity={a}>
            <ellipse cx={p.x} cy={p.y + hh * 0.6} rx={w * 1.9} ry={hh * 2.1} fill="url(#ceilGlow)" opacity={0.5} />
            <path
              d={quad([
                [-0.3, CEIL - 0.01, z - 0.28],
                [0.3, CEIL - 0.01, z - 0.28],
                [0.3, CEIL - 0.01, z + 0.28],
                [-0.3, CEIL - 0.01, z + 0.28],
              ])}
              fill={C.lamp}
              opacity={0.9}
            />
            <path
              d={quad([
                [-0.3, CEIL - 0.01, z - 0.28],
                [0.3, CEIL - 0.01, z - 0.28],
                [0.3, CEIL - 0.01, z + 0.28],
                [-0.3, CEIL - 0.01, z + 0.28],
              ])}
              fill="url(#lampBulb)"
              opacity={0.55}
            />
          </g>
        );
      })}
    </g>
  );
};

/** Поручни: продольные трубы вдоль потолка и стойки. */
const Handrails = (props: any) => {
  const {grip = 0, x = 0} = props;
  const bars: any[] = [];
  for (const side of [-1, 1]) {
    const z0 = 0.9;
    const z1 = 7.1;
    const p0 = project(side * 0.92, CEIL - 0.3, z0);
    const p1 = project(side * 0.92, CEIL - 0.3, z1);
    bars.push(<path key={`b${side}`} d={`M${p0.x},${p0.y} L${p1.x},${p1.y}`} stroke="url(#metalG)" strokeWidth={0.055 * p0.s} strokeLinecap="round" />);
    for (let k = 0; k < 3; k++) {
      const z = lerp(z0, z1, [0.2, 0.5, 0.8][k]);
      const a = project(side * 0.92, CEIL - 0.3, z);
      const b = project(side * 0.92, CEIL, z);
      bars.push(<path key={`s${side}${k}`} d={`M${a.x},${a.y} L${b.x},${b.y}`} stroke="#59688a" strokeWidth={0.03 * a.s} />);
    }
  }
  // поручень на спинке ближайшего сиденья, за который хватается герой
  const gA = project(-0.62, 1.02, 2.2);
  const gB = project(-0.62, 1.02, 3.6);
  return (
    <g>
      {bars}
      <path d={`M${gA.x},${gA.y} L${gB.x},${gB.y}`} stroke="url(#metalG)" strokeWidth={0.05 * gA.s} strokeLinecap="round" />
      {grip > 0.02 ? (
        <g opacity={clamp(grip)}>
          <ellipse cx={lerp(gA.x, gB.x, 0.45)} cy={lerp(gA.y, gB.y, 0.45)} rx={0.1 * gA.s} ry={0.06 * gA.s} fill="#eaf4ff" opacity={0.25} />
        </g>
      ) : null}
    </g>
  );
};

export type BusProps = {
  t: number;
  light?: number;
  windowContent?: any;
  moon?: number;
  doorsOpen?: number;
  driverIn?: number;
  mirrorFace?: any;
  torch?: number;
  grip?: number;
  wetSteps?: number;
  fogText?: any;
  extra?: any;
};

/** Весь салон. Рисуем от дальнего к ближнему. */
export const BusInterior = (props: BusProps) => {
  const {t, light = 1, doorsOpen = 0, driverIn = 0, mirrorFace, torch = 0, grip = 0, wetSteps = 0, fogText, extra} = props;
  const sh = shakeAt(t);
  return (
    <g transform={`translate(${sh.x.toFixed(2)} ${sh.y.toFixed(2)}) rotate(${sh.r.toFixed(3)} 540 960)`}>
      {defs}
      {/* общий фон салона */}
      <rect x={-400} y={-400} width={1900} height={2800} fill="#04060c" />
      {/* потолок и дальняя стенка */}
      <path
        d={quad([
          [-HALF_W, CEIL, 0.5],
          [HALF_W, CEIL, 0.5],
          [HALF_W, CEIL, FAR],
          [-HALF_W, CEIL, FAR],
        ])}
        fill="url(#wallG)"
      />
      <path
        d={quad([
          [-HALF_W, 0, FAR],
          [HALF_W, 0, FAR],
          [HALF_W, CEIL, FAR],
          [-HALF_W, CEIL, FAR],
        ])}
        fill="#0a1120"
      />
      {/* кабина водителя впереди */}
      <Cab t={t} driverIn={driverIn} mirrorFace={mirrorFace} light={light} doorsOpen={doorsOpen} />
      {/* пол */}
      <path
        d={quad([
          [-HALF_W, 0, 0.5],
          [HALF_W, 0, 0.5],
          [HALF_W, 0, FAR],
          [-HALF_W, 0, FAR],
        ])}
        fill="url(#floorG)"
      />
      {/* блики воды на полу */}
      {[0.28, 0.5, 0.72].map((u, i) => {
        const p = project(lerp(-HALF_W, HALF_W, u), 0.001, lerp(1.2, 6.4, i / 2));
        return <ellipse key={i} cx={p.x} cy={p.y} rx={0.28 * p.s} ry={0.07 * p.s} fill="url(#wetSheen)" opacity={0.45} />;
      })}
      {/* стены с окнами */}
      {([-1, 1] as const).map((side) => (
        <g key={side}>
          <path
            d={wallQuad(side, 0, CEIL, 0.55, FAR) + " " + WIN_Z.map(([z0, z1]) => wallQuad(side, WIN_LO, WIN_HI, z0, z1)).join(" ")}
            fill="url(#wallG)"
            fillRule="evenodd"
          />
          {/* подоконник и полоса под окнами */}
          <path d={wallQuad(side, 0, WIN_LO, 0.55, FAR)} fill="url(#wallG)" opacity={0.9} />
          {WIN_Z.map(([z0, z1], i) => (
            <Window
              key={i}
              z0={z0}
              z1={z1}
              side={side}
              lit={light}
              streakSeed={i + (side === 1 ? 17 : 3)}
              clipId={`win${side > 0 ? "R" : "L"}${i}`}
              tt={t}
              moving={doorsOpen}
            />
          ))}
          {/* сиденья парами */}
          {[6.8, 5.8, 4.6, 3.4, 2.2, 1.0].map((z, i) => (
            <Seat key={i} z0={z + 0.05} z1={z + 0.95} side={side} wet={i === 0 ? wetSteps : 0} />
          ))}
        </g>
      ))}
      {/* задняя дверь и мокрые ступени */}
      <Doors t={t} open={doorsOpen} wet={wetSteps} />
      <Handrails grip={grip} />
      <Lamps t={t} light={light} />
      {torch > 0.01 ? <Torch t={t} amount={torch} /> : null}
      {fogText || null}
      {extra || null}
    </g>
  );
};

/** Кабина: перегородка, руль, водитель, зеркало над рулём. */
const Cab = (props: any) => {
  const {driverIn = 0, mirrorFace, light = 1, doorsOpen = 0} = props;
  const zC = CAB;
  const drv = project(0.55, 1.25, zC);
  return (
    <g>
      {/* перегородка */}
      <path
        d={quad([
          [-HALF_W, 0, zC],
          [HALF_W, 0, zC],
          [HALF_W, CEIL, zC],
          [-HALF_W, CEIL, zC],
        ])}
        fill="#0b1322"
        opacity={0.96}
      />
      {/* лобовое стекло кабины */}
      <path
        d={quad([
          [-1.05, 1.15, zC - 0.01],
          [0.25, 1.15, zC - 0.01],
          [0.25, 2.0, zC - 0.01],
          [-1.05, 2.0, zC - 0.01],
        ])}
        fill="url(#doorGlass)"
      />
      {/* силуэт водителя */}
      {driverIn > 0.02 ? (
        <g opacity={clamp(driverIn)}>
          <ellipse cx={drv.x} cy={drv.y} rx={0.19 * drv.s} ry={0.24 * drv.s} fill="#1b2b45" />
          <path d={`M${drv.x - 0.26 * drv.s},${drv.y + 0.9 * drv.s} L${drv.x - 0.18 * drv.s},${drv.y + 0.2 * drv.s} L${drv.x + 0.2 * drv.s},${drv.y + 0.2 * drv.s} L${drv.x + 0.28 * drv.s},${drv.y + 0.9 * drv.s} Z`} fill="#14203a" />
          <circle cx={drv.x} cy={drv.y} r={0.13 * drv.s} fill="#0d1626" />
        </g>
      ) : null}
      {/* руль */}
      <ellipse cx={drv.x - 0.06 * drv.s} cy={drv.y + 0.5 * drv.s} rx={0.24 * drv.s} ry={0.07 * drv.s} fill="none" stroke="url(#metalG)" strokeWidth={0.035 * drv.s} />
      {/* приборная панель */}
      <path
        d={quad([
          [0.05, 0.98, zC - 0.05],
          [1.15, 0.98, zC - 0.05],
          [1.15, 1.12, zC - 0.05],
          [0.05, 1.12, zC - 0.05],
        ])}
        fill="#121c2e"
      />
      {/* зеркало над рулём */}
      <g>{mirrorFace}</g>
      {/* дверь */}
      <path
        d={quad([
          [HALF_W, 0, zC + 0.2],
          [HALF_W, 0, zC + 1.1],
          [HALF_W, 2.1, zC + 1.1],
          [HALF_W, 2.1, zC + 0.2],
        ])}
        fill="#0d1726"
      />
      {doorsOpen > 0.02 ? (
        <path
          d={quad([
            [HALF_W, 0, zC + 0.2],
            [HALF_W, 0, zC + 1.1],
            [HALF_W, 2.1, zC + 1.1],
            [HALF_W, 2.1, zC + 0.2],
          ])}
          fill="#0a1526"
          opacity={clamp(doorsOpen) * 0.9}
        />
      ) : null}
    </g>
  );
};

/** Дверь и мокрые ступени у остановки. */
const Doors = (props: any) => {
  const {open = 0, wet = 0} = props;
  return (
    <g>
      {wet > 0.02
        ? [0, 1, 2].map((i) => {
            const p = project(lerp(-0.9, -0.2, i / 2), 0.001, lerp(0.7, 1.9, i / 2));
            return <ellipse key={i} cx={p.x} cy={p.y} rx={0.16 * p.s} ry={0.05 * p.s} fill="url(#wetSheen)" opacity={clamp(wet) * 0.7} />;
          })
        : null}
    </g>
  );
};

/** Луч фонарика: конус от руки героя в глубину салона. */
const Torch = (props: any) => {
  const {t, amount = 1} = props;
  const sway = Math.sin(t * 1.7) * 0.06;
  const a = project(-0.5, 1.05, 2.2);
  const b = project(0.7 + sway, 0.1, 6.6);
  const w0 = 0.09 * a.s;
  const w1 = 0.75 * b.s;
  return (
    <g opacity={clamp(amount) * 0.85}>
      <path d={`M${a.x - w0},${a.y} L${b.x - w1},${b.y} L${b.x + w1},${b.y} L${a.x + w0},${a.y} Z`} fill="url(#torchCone)" />
      <ellipse cx={b.x} cy={b.y} rx={w1 * 0.9} ry={w1 * 0.28} fill="#ffe9b8" opacity={0.16} />
      <circle cx={a.x} cy={a.y} r={0.16 * a.s} fill="url(#flashG)" opacity={0.9} />
    </g>
  );
};

/**
 * Позиция персонажа: точка пола (x, z) — это его ступни в экранных координатах.
 * Риг стоит в локальных координатах с макушкой на −1000, поэтому scale = px/м / 1000.
 */
export const heroAt = (x: number, z: number, k = 1) => {
  const p = project(x, 0, z);
  return {x: p.x, y: p.y, scale: (p.s / 1000) * 1.75 * k, s: p.s};
};
