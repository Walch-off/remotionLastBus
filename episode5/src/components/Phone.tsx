import React from 'react';
import {SKIN} from '../common';

export type Msg = {text: string; reveal?: number; lines?: string[]; fontSize?: number};
/** Телефон крупно. Текст — редактируемые строки (не картинка). */
export const Phone: React.FC<{x: number; y: number; scale?: number; rot?: number; msg?: Msg; typing?: number; hand?: boolean; screenGlow?: number; title?: string}> = ({x, y, scale = 1, rot = 0, msg, typing = 0, hand = true, screenGlow = 1, title = 'Сообщения'}) => {
  const shown = msg ? msg.text.slice(0, Math.round(msg.text.length * (msg.reveal ?? 1))) : '';
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <ellipse cx={0} cy={0} rx={380} ry={520} fill="url(#phoneHalo)" opacity={0.35 * screenGlow} />
      {hand && (
        <g>
          <rect x={-250} y={90} width={92} height={190} rx={46} fill={SKIN} transform="rotate(-18 -204 185)" />
          <rect x={160} y={60} width={78} height={64} rx={32} fill={SKIN} />
          <rect x={160} y={130} width={78} height={64} rx={32} fill={SKIN} />
          <rect x={160} y={200} width={78} height={64} rx={32} fill={SKIN} />
          <rect x={150} y={270} width={70} height={56} rx={28} fill={SKIN} />
        </g>
      )}
      <rect x={-190} y={-370} width={380} height={740} rx={56} fill="#0a0c14" />
      <rect x={-190} y={-370} width={380} height={740} rx={56} fill="none" stroke="#4a5272" strokeWidth={5} />
      <rect x={-170} y={-350} width={340} height={700} rx={42} fill="#10162b" />
      <rect x={-170} y={-350} width={340} height={700} rx={42} fill="url(#screenG)" opacity={screenGlow} />
      <rect x={-40} y={-340} width={80} height={20} rx={10} fill="#05060b" />
      <rect x={-170} y={-310} width={340} height={64} fill="#1b2442" />
      <circle cx={-128} cy={-278} r={20} fill="#44527f" />
      <text x={-96} y={-270} fontFamily="Inter" fontWeight={700} fontSize={26} fill="#d9e2ff">{title}</text>
      {msg && (() => {
        const lines = msg.lines ?? wrap(shown);
        const fs = msg.fontSize ?? (shown.length > 12 ? 44 : 56);
        const lh = fs * 1.3;
        const bh = Math.max(150, lines.length * lh + 56);
        const top = -230;
        return (
          <g>
            <rect x={-160} y={top} width={320} height={bh} rx={30} fill="#2f6bff" />
            <text x={0} y={top + 28 + fs * 0.95} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={fs} fill="#fff">
              {lines.map((l, i) => <tspan key={i} x={0} dy={i === 0 ? 0 : lh}>{l}</tspan>)}
            </text>
          </g>
        );
      })()}
      {typing > 0 && !msg && (
        <g>
          {[0, 1, 2].map((i) => <circle key={i} cx={-30 + i * 30} cy={-100} r={9} fill="#9db4ff" opacity={0.35 + 0.65 * Math.max(0, Math.sin(typing * 6 - i))} />)}
        </g>
      )}
    </g>
  );
};
const wrap = (s: string): string[] => {
  if (s.length <= 12) return [s];
  const w = s.split(' '), lines: string[] = [''];
  w.forEach((x) => {
    const cur = lines[lines.length - 1];
    if ((cur + ' ' + x).trim().length > 12 && cur) lines.push(x); else lines[lines.length - 1] = (cur + ' ' + x).trim();
  });
  return lines;
};
export const PhoneDefs = () => (
  <defs>
    <radialGradient id="phoneHalo"><stop offset="0" stopColor="#7fa4ff" /><stop offset="1" stopColor="#7fa4ff" stopOpacity={0} /></radialGradient>
    <linearGradient id="screenG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c2a55" /><stop offset="1" stopColor="#0d1330" /></linearGradient>
  </defs>
);
