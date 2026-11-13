import React from 'react';
import {useCurrentFrame} from 'remotion';

export const P = 3600; // длина одного «круга» улицы — все объекты повторяются идентично
export const PHARM_X = 900;
export const SHELTER_X = 1850;
export const FIGURE_X = 2095;
export const LAMP_X = 2310;
export const GROUND_Y = 540;
export const STREET_H = 620;

const rnd = (seed: number) => {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
};
const makeCity = (seed: number, period: number, hmin: number, hmax: number, wmin: number, wmax: number) => {
  const r = rnd(seed), out: any[] = [];
  let x = 0;
  while (x < period) {
    const w = Math.min(period - x, wmin + r() * (wmax - wmin));
    const h = hmin + r() * (hmax - hmin);
    const wins: any[] = [];
    for (let i = 0; i < 6; i++) if (r() > 0.78) wins.push({dx: 10 + r() * (w - 30), dy: 14 + r() * (h - 40)});
    out.push({x, w, h, wins});
    x += w;
  }
  return out;
};
const FAR = makeCity(11, 900, 160, 330, 70, 130);
const MID = makeCity(23, 1980, 120, 260, 110, 210);

const CityLayer = ({camX, par, period, city, color, win, base}: any) => {
  const off = camX * par;
  const first = Math.floor(off / period) - 0;
  const items: any[] = [];
  for (let k = first; k <= first + Math.ceil(1200 / period) + 1; k++) {
    city.forEach((b: any, i: number) => {
      const bx = k * period + b.x - off;
      if (bx > -260 && bx < 1340)
        items.push(
          <g key={`${k}-${i}`} transform={`translate(${bx} ${base - b.h})`}>
            <rect width={b.w - 4} height={b.h} fill={color} />
            {b.wins.map((w: any, j: number) => (
              <rect key={j} x={w.dx} y={w.dy} width={9} height={13} fill={win} opacity={0.75} />
            ))}
          </g>
        );
    });
  }
  return <g>{items}</g>;
};

const Pharmacy = ({x}: {x: number}) => (
  <g transform={`translate(${x} 0)`}>
    <rect x={0} y={150} width={470} height={GROUND_Y - 150} fill="#2a3558" />
    <rect x={0} y={150} width={470} height={16} fill="#1d2644" />
    <rect x={0} y={166} width={470} height={6} fill="#394775" />
    {/* вывеска */}
    <rect x={95} y={176} width={280} height={84} rx={10} fill="#0e1a1a" stroke="#1f8f5f" strokeWidth={4} />
    <circle cx={150} cy={218} r={48} fill="url(#pharmGlow)" />
    <path d="M150 190v56M122 218h56" stroke="#44f09c" strokeWidth={15} strokeLinecap="round" />
    <text x={265} y={236} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill="#44f09c" letterSpacing={3}>АПТЕКА</text>
    {/* витрины */}
    {[40, 270].map((wx) => (
      <g key={wx}>
        <rect x={wx} y={300} width={160} height={150} rx={6} fill="#bfeedd" opacity={0.92} />
        <rect x={wx} y={300} width={160} height={150} rx={6} fill="none" stroke="#12203a" strokeWidth={8} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={wx + 14 + i * 36} y={330 + (i % 2) * 20} width={22} height={34} fill="#6bb89b" />)}
        <rect x={wx} y={398} width={160} height={5} fill="#12203a" />
        {[0, 1, 2].map((i) => <rect key={i} x={wx + 24 + i * 44} y={412} width={26} height={30} fill="#7fa6c9" />)}
      </g>
    ))}
    <rect x={218} y={340} width={34} height={200} fill="#0f1730" />
    <rect x={0} y={GROUND_Y - 6} width={470} height={6} fill="#1a2240" />
  </g>
);

const Shelter = ({x}: {x: number}) => (
  <g transform={`translate(${x} 0)`}>
    {/* столб со знаком */}
    <rect x={-28} y={200} width={9} height={GROUND_Y - 200} fill="#2b3350" />
    <rect x={-58} y={160} width={72} height={64} rx={6} fill="#8a4b2a" />
    <rect x={-52} y={166} width={60} height={52} rx={4} fill="none" stroke="#d9a66a" strokeWidth={3} />
    <text x={-22} y={207} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={34} fill="#e8cfa0">12</text>
    <path d="M-50 190 l14 6 l-10 8z" fill="#5a2f1a" />
    {/* навес и стёкла */}
    <rect x={0} y={262} width={350} height={16} rx={4} fill="#262e4a" />
    <rect x={8} y={278} width={8} height={GROUND_Y - 278} fill="#262e4a" />
    <rect x={334} y={278} width={8} height={GROUND_Y - 278} fill="#262e4a" />
    <rect x={16} y={284} width={318} height={206} fill="#7aa0c8" opacity={0.16} />
    <path d="M110 284 l20 60 l-18 30 l34 52 M110 284 l-24 46 l16 40 M130 344 l50 -12 l30 28" stroke="#cfe2f5" strokeWidth={2.4} fill="none" opacity={0.7} />
    <rect x={40} y={420} width={250} height={14} rx={4} fill="#3b2c28" />
    <rect x={56} y={434} width={8} height={56} fill="#2b2220" />
    <rect x={266} y={434} width={8} height={56} fill="#2b2220" />
    <path d="M220 262 v10 M240 262 v16" stroke="#0b0f20" strokeWidth={3} />
  </g>
);

export const Lamp = ({x, frame, lit = 1, flicker = true}: {x: number; frame: number; lit?: number; flicker?: boolean}) => {
  const fl = flicker ? (((frame * 7919) % 17) < 2 ? 0.35 : ((frame * 31) % 53) < 3 ? 0.6 : 1) : 1;
  const L = lit * fl;
  return (
    <g transform={`translate(${x} 0)`}>
      <path d={`M-150 ${GROUND_Y} L-26 238 L26 238 L150 ${GROUND_Y}Z`} fill="url(#lampCone)" opacity={0.9 * L} />
      <ellipse cx={0} cy={GROUND_Y + 8} rx={190} ry={26} fill="#ffc857" opacity={0.30 * L} />
      <rect x={-7} y={218} width={14} height={GROUND_Y - 218} fill="#1c2236" />
      <path d="M0 220 q-4 -50 -46 -56" stroke="#1c2236" strokeWidth={11} fill="none" strokeLinecap="round" />
      <g transform="translate(-60 160) rotate(-6)">
        <rect x={-34} y={-8} width={78} height={22} rx={6} fill="#1c2236" />
        {/* разбитый плафон */}
        <path d="M-30 14 l12 20 l10 -8 l12 22 l10 -20 l12 14 l8 -16 l10 12 l8 -28z" fill="#ffe29a" opacity={0.55 + 0.45 * L} />
        <path d="M-22 14 l4 12 M6 14 l-2 16 M26 14 l6 10" stroke="#1c2236" strokeWidth={2.4} />
        <circle cx={5} cy={30} r={22} fill="url(#bulbGlow)" opacity={L} />
      </g>
      <path d="M-36 168 q-8 20 -2 40" stroke="#1c2236" strokeWidth={2} fill="none" />
      {[[-40, 6], [30, 14], [70, 4], [-90, 10], [100, 12]].map(([dx, dy], i) => (
        <path key={i} d={`M${dx} ${GROUND_Y + 2 + dy} l6 -4 l5 5z`} fill="#fff1c0" opacity={0.7 * L} />
      ))}
    </g>
  );
};

export const StreetDefs = () => (
  <defs>
    <radialGradient id="warmFace"><stop offset="0" stopColor="#ffd27a" stopOpacity={0.55} /><stop offset="0.6" stopColor="#ffc857" stopOpacity={0.18} /><stop offset="1" stopColor="#ffc857" stopOpacity={0} /></radialGradient>
    <radialGradient id="pharmGlow"><stop offset="0" stopColor="#44f09c" stopOpacity={0.55} /><stop offset="1" stopColor="#44f09c" stopOpacity={0} /></radialGradient>
    <linearGradient id="lampCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd56a" stopOpacity={0.62} /><stop offset="1" stopColor="#ffc857" stopOpacity={0.08} /></linearGradient>
    <radialGradient id="bulbGlow"><stop offset="0" stopColor="#fff3c4" stopOpacity={0.95} /><stop offset="1" stopColor="#ffc857" stopOpacity={0} /></radialGradient>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070c1d" /><stop offset="1" stopColor="#1d2c52" /></linearGradient>
    <linearGradient id="walkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#222c4a" /><stop offset="1" stopColor="#161d36" /></linearGradient>
  </defs>
);

/** Улица в локальных координатах окна (0..width × 0..STREET_H). camX — позиция «камеры» в мире. */
export const Street: React.FC<{camX: number; width?: number; figure?: React.ReactNode; lampLit?: number; lampFlicker?: boolean; children?: React.ReactNode}> = ({camX, width = 1080, figure, lampLit = 1, lampFlicker = true, children}) => {
  const frame = useCurrentFrame();
  const copies = [-1, 0, 1, 2].map((k) => k * P);
  const fcam = ((camX % P) + P) % P; // позиция внутри круга
  const lapK = Math.floor(camX / P);
  return (
    <g>
      <rect x={-50} y={0} width={width + 100} height={STREET_H} fill="url(#skyG)" />
      <CityLayer camX={camX} par={0.25} period={900} city={FAR} color="#0d1530" win="#f2d58a" base={GROUND_Y - 40} />
      <CityLayer camX={camX} par={0.55} period={1980} city={MID} color="#141d3c" win="#ffd98f" base={GROUND_Y - 6} />
      <rect x={-50} y={GROUND_Y - 6} width={width + 100} height={STREET_H - GROUND_Y + 6 + 2} fill="url(#walkG)" />
      <rect x={-50} y={GROUND_Y + 62} width={width + 100} height={60} fill="#0d1226" />
      {Array.from({length: 12}).map((_, i) => {
        const dx = ((i * 140 - camX) % 1680 + 1680) % 1680 - 100;
        return <rect key={i} x={dx} y={GROUND_Y + 88} width={74} height={7} fill="#3b4670" opacity={0.7} />;
      })}
      <g transform={`translate(${-camX} 0)`}>
        {[lapK - 1, lapK, lapK + 1].map((k) => (
          <g key={k} transform={`translate(${k * P} 0)`}>
            <Pharmacy x={PHARM_X} />
            <Shelter x={SHELTER_X} />
            <g transform={`translate(${FIGURE_X} ${GROUND_Y + 6})`}>{figure}</g>
            <Lamp x={LAMP_X} frame={frame} lit={lampLit} flicker={lampFlicker} />
          </g>
        ))}
      </g>
      {children}
    </g>
  );
};
