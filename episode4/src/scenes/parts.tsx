import React from 'react';
import {Hero, HeroProps} from '../components/Hero';
import {Street, FIGURE_X, LAMP_X} from '../components/Street';
import {BusSide} from '../components/Bus';
import {InteriorDefs} from '../components/Interior';
import {PhoneDefs} from '../components/Phone';
import {Vignette} from '../components/Overlays';
import {camT} from '../common';

export const lk = (t: number, pts: [number, number][]) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++)
    if (t <= pts[i][0]) return pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * (t - pts[i - 1][0])) / (pts[i][0] - pts[i - 1][0]);
  return pts[pts.length - 1][1];
};
/** положение «камеры» улицы за окном автобуса — привязано к словам озвучки (аптека, остановка, фонарь по кругам) */
export const streetXAt = (t: number) =>
  lk(t, [[0, -6000], [14.7, -472], [17.74, 740], [20.65, 1915], [23.85, 4340], [25.9, 5515], [40.0, 13600]]);

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0}}>
    <InteriorDefs /><PhoneDefs />
    {children}
    <Vignette />
  </svg>
);

/** Двойник (копия героя, то же пятно на том же рукаве) в системе координат улицы */
export const Double: React.FC<Partial<HeroProps> & {k?: number}> = ({k = 0.27, ...p}) => (
  <Hero id="dbl" x={0} y={0} scale={k} anchor={[505, 930]} {...(p as any)} />
);

export const phoneSprite = (_armR: number, glow = 1) => (
  <g transform="translate(0 -62)">
    <rect x={-46} y={-80} width={92} height={150} rx={14} fill="#07090f" />
    <rect x={-39} y={-73} width={78} height={136} rx={9} fill="#6f9bff" opacity={0.55 + 0.45 * glow} />
    <rect x={-39} y={-73} width={78} height={136} rx={9} fill="none" stroke="#bcd0ff" strokeWidth={2} opacity={0.6} />
    <path d="M-24 -40 h48 M-24 -12 h36 M-24 16 h42" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.85 * glow} />
    <rect x={-22} y={64} width={44} height={16} rx={8} fill="#e9b88a" />
  </g>
);

/** Внешний вид: улица в локальных координатах (0..1080 × 0..620), камера в этих же координатах */
export const ExtView: React.FC<{t: number; cam: [number, number, number, number][]; figure?: React.ReactNode; bus?: {x: number; wheel: number} | null; lampLit?: number; children?: React.ReactNode; camX?: number; bob?: number}> = ({t, cam, figure, bus, lampLit = 1, children, camX = 1700, bob = 0}) => (
  <g transform={camT(t, cam, 540, 960 + bob)}>
    <rect x={-3000} y={-3000} width={7000} height={3000} fill="#070c1d" />
    <rect x={-3000} y={618} width={7000} height={4000} fill="#0b1020" />
    <Street camX={camX} figure={figure} lampLit={lampLit} />
    {bus && <BusSide x={bus.x} y={606} scale={0.9} wheel={bus.wheel} />}
    {children}
  </g>
);
export const WINDOW_FRAME = (
  <g>
    <path fillRule="evenodd" d="M0 0H1080V1920H0Z M90 330 Q90 270 150 270 H930 Q990 270 990 330 V1300 Q990 1360 930 1360 H150 Q90 1360 90 1300Z" fill="#0b1124" />
    <rect x={90} y={270} width={900} height={1090} rx={60} fill="none" stroke="#2a3556" strokeWidth={14} />
    <rect x={90} y={270} width={900} height={1090} rx={60} fill="url(#glassSheen)" />
  </g>
);
export const _L = LAMP_X + FIGURE_X;
