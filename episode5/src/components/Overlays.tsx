import React from 'react';
import {useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {EV, DURATION_SEC} from '../story';
import {ramp, lin} from '../common';

const pop = (frame: number, fps: number, startS: number) =>
  spring({frame: frame - startS * fps, fps, config: {damping: 12, stiffness: 140}});

/** Интерактивный финал: вопрос, варианты ответа, плашка «продолжение». */
export const InteractiveFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const qIn = pop(frame, fps, EV.q + 0.05);
  const qOut = 1 - lin(t, EV.cont - 0.2, EV.cont + 0.1);
  const optIn1 = pop(frame, fps, EV.q + 4.3);
  const optIn2 = pop(frame, fps, EV.q + 4.45);
  const hl1 = t >= EV.one - 0.05 && t < EV.two - 0.05 ? 1 : 0;
  const hl2 = t >= EV.two - 0.05 ? 1 : 0;
  const cIn = pop(frame, fps, EV.cont + 0.0);
  const card = (y: number, n: string, label: string, appear: number, hl: number) => (
    <g transform={`translate(540 ${y}) scale(${0.6 + 0.4 * appear})`} opacity={Math.min(1, appear * 1.4)}>
      <rect x={-400} y={-56} width={800} height={112} rx={30} fill={hl ? '#ffd23f' : '#0e1530'} opacity={0.94} stroke={hl ? '#fff3b0' : '#6c7bb8'} strokeWidth={5} />
      <circle cx={-330} cy={0} r={42} fill={hl ? '#0e1530' : '#ffd23f'} />
      <text x={-330} y={17} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill={hl ? '#ffd23f' : '#0e1530'}>{n}</text>
      <text x={-262} y={17} fontFamily="Inter" fontWeight={900} fontSize={50} fill={hl ? '#0e1530' : '#ffffff'}>{label}</text>
    </g>
  );
  return (
    <g>
      {t >= EV.q && (
        <g opacity={qOut} transform={`translate(540 ${300 - (1 - qIn) * 40}) scale(${0.85 + 0.15 * qIn})`}>
          <rect x={-470} y={-96} width={940} height={176} rx={36} fill="#0b1026" opacity={0.82} stroke="#ffd23f" strokeWidth={6} />
          <text x={0} y={34} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={84} fill="#ffd23f"
            style={{paintOrder: 'stroke', stroke: '#05070f', strokeWidth: 8}}>А ТЫ БЫ ОБЕРНУЛСЯ?</text>
        </g>
      )}
      {t >= EV.q + 4.3 && card(1185, '1', 'ОБЕРНУТЬСЯ', optIn1, hl1)}
      {t >= EV.q + 4.3 && card(1305, '2', 'НЕ ОБОРАЧИВАТЬСЯ', optIn2, hl2)}
      {t >= EV.cont && (
        <g transform={`translate(540 ${300 - (1 - cIn) * 50}) scale(${0.8 + 0.2 * cIn})`} opacity={Math.min(1, cIn * 1.5)}>
          <rect x={-470} y={-110} width={940} height={216} rx={40} fill="#ffd23f" />
          <text x={0} y={-8} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={88} fill="#0b1026">ПРОДОЛЖЕНИЕ</text>
          <text x={0} y={76} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={72} fill="#0b1026">— В ЧАСТИ 2 —</text>
        </g>
      )}
    </g>
  );
};

export const TitleBadge: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const a = Math.min(ramp(t, 0.3, 0.9), 1 - ramp(t, 5.4, 6.2));
  if (a <= 0) return null;
  return (
    <g opacity={a} transform="translate(540 190)">
      <rect x={-400} y={-40} width={800} height={80} rx={40} fill="#0b1026" opacity={0.7} stroke="#ffd23f" strokeWidth={3} />
      <text x={0} y={14} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={38} fill="#ffd23f">ПОСЛЕДНИЙ АВТОБУС · ЧАСТЬ 1</text>
    </g>
  );
};

export const Vignette: React.FC = () => (
  <g pointerEvents="none">
    <defs>
      <radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="0.55" stopColor="#02040c" stopOpacity={0} /><stop offset="1" stopColor="#02040c" stopOpacity={0.55} /></radialGradient>
    </defs>
    <rect x={0} y={0} width={1080} height={1920} fill="url(#vig)" />
  </g>
);
export const _D = DURATION_SEC;
