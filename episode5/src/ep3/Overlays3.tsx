import React from 'react';
import {useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {E3} from './story3';
import {ramp, lin} from '../common';

const pop = (frame: number, fps: number, s: number) => spring({frame: frame - s * fps, fps, config: {damping: 12, stiffness: 140}});

export const TitleBadge3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const a = Math.min(ramp(t, 0.2, 0.7), 1 - ramp(t, 3.6, 4.4));
  if (a <= 0) return null;
  return (
    <g opacity={a} transform="translate(540 160)">
      <rect x={-400} y={-40} width={800} height={80} rx={40} fill="#0b1026" opacity={0.7} stroke="#ffd23f" strokeWidth={3} />
      <text x={0} y={14} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={38} fill="#ffd23f">ПОСЛЕДНИЙ АВТОБУС · ЧАСТЬ 3</text>
    </g>
  );
};

/** Результат голосования первой серии */
export const VoteResult3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  if (t < E3.vote || t > 3.4) return null;
  const p = pop(frame, fps, E3.vote);
  const out = 1 - lin(t, 2.9, 3.3);
  return (
    <g transform={`translate(540 ${300 - (1 - p) * 40}) scale(${0.8 + 0.2 * p})`} opacity={Math.min(1, p * 1.5) * out}>
      <rect x={-470} y={-90} width={940} height={170} rx={36} fill="#ffd23f" />
      <text x={0} y={30} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={58} fill="#0b1026">ВЫ ВЫБРАЛИ: ОСТАТЬСЯ</text>
    </g>
  );
};

/** Интерактивный финал части 2: вопрос, варианты, «продолжение — в части 3». Не перекрывает героя, дверь и руку. */
export const InteractiveFinal3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const qIn = pop(frame, fps, E3.q + 0.05);
  const qOut = 1 - lin(t, E3.banner - 0.15, E3.banner + 0.1);
  const o1 = pop(frame, fps, E3.opt1);
  const o2 = pop(frame, fps, E3.opt2);
  const cIn = pop(frame, fps, E3.banner);
  const card = (y: number, n: string, label: string, appear: number) => (
    <g transform={`translate(540 ${y}) scale(${0.6 + 0.4 * appear})`} opacity={Math.min(1, appear * 1.4)}>
      <rect x={-420} y={-52} width={840} height={104} rx={28} fill="#0e1530" opacity={0.94} stroke="#ffd23f" strokeWidth={5} />
      <circle cx={-350} cy={0} r={38} fill="#ffd23f" />
      <text x={-350} y={16} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={50} fill="#0e1530">{n}</text>
      <text x={-292} y={16} fontFamily="Inter" fontWeight={900} fontSize={46} fill="#ffffff">{label}</text>
    </g>
  );
  return (
    <g>
      {t >= E3.q && (
        <g opacity={qOut} transform={`translate(540 ${250 - (1 - qIn) * 40}) scale(${0.85 + 0.15 * qIn})`}>
          <rect x={-440} y={-78} width={880} height={150} rx={34} fill="#0b1026" opacity={0.85} stroke="#ffd23f" strokeWidth={6} />
          <text x={0} y={28} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={76} fill="#ffd23f" style={{paintOrder: 'stroke', stroke: '#05070f', strokeWidth: 8}}>ЧТО ДЕЛАТЬ ГЕРОЮ?</text>
        </g>
      )}
      {t >= E3.opt1 && card(385, '1', 'РАЗБИТЬ ЗЕРКАЛО', o1)}
      {t >= E3.opt2 && card(495, '2', 'ОТВЕТИТЬ ВОДИТЕЛЮ', o2)}
      {t >= E3.banner && (
        <g transform={`translate(540 ${235 - (1 - cIn) * 50}) scale(${0.8 + 0.2 * cIn})`} opacity={Math.min(1, cIn * 1.5)}>
          <rect x={-440} y={-90} width={880} height={180} rx={38} fill="#ffd23f" />
          <text x={0} y={-14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={80} fill="#0b1026">ПРОДОЛЖЕНИЕ</text>
          <text x={0} y={60} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill="#0b1026">— В ЧАСТИ 4 —</text>
        </g>
      )}
    </g>
  );
};
