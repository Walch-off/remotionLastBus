import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SKIN} from '../common';

const WET = '#bfe3ff';
/** Крупный план мокрой ладони двойника: блики, капли, стекающая вода. */
export const WetPalm: React.FC<{x: number; y: number; scale?: number; t: number}> = ({x, y, scale = 1, t}) => {
  const frame = useCurrentFrame();
  const drops = [[-120, 110, 0], [-40, 150, 7], [60, 100, 13], [130, 170, 3], [10, 40, 19], [-85, 210, 11], [95, 245, 17]];
  const fingers = [[-150, 60, -14, 180], [-55, -50, -4, 215], [50, -45, 5, 200], [140, 30, 14, 158]];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* рукав синей толстовки и манжета */}
      <path d="M-150 420 L-130 330 L130 330 L160 430 L260 640 L-260 640Z" fill="#4f6aa0" />
      <rect x={-135} y={290} width={270} height={60} rx={22} fill="#445f95" />
      <rect x={-135} y={290} width={270} height={10} rx={5} fill="#3a5287" />
      {/* ладонь */}
      <path d="M-165 70 Q-190 220 -125 300 Q0 345 125 300 Q190 220 165 70 Q0 20 -165 70Z" fill={SKIN} stroke="#d49a6e" strokeWidth={5} />
      {fingers.map(([fx, fy, rot, len], i) => (
        <g key={i} transform={`translate(${fx} ${fy}) rotate(${rot})`}>
          <rect x={-34} y={-len} width={68} height={len + 30} rx={34} fill={SKIN} stroke="#d49a6e" strokeWidth={5} />
          <path d={`M-12 ${-len + 40} v${len * 0.55}`} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.45} />
        </g>
      ))}
      <g transform="translate(-175 190) rotate(-52)"><rect x={-32} y={-150} width={64} height={190} rx={32} fill={SKIN} stroke="#d49a6e" strokeWidth={5} /></g>
      <path d="M-100 140 Q0 105 100 150" stroke="#d6a073" strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* мокрый блеск */}
      <path d="M-120 120 Q-40 90 40 118 M-90 220 Q0 250 100 215" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.5} />
      <ellipse cx={-30} cy={170} rx={70} ry={34} fill={WET} opacity={0.22} />
      {/* капли */}
      {drops.map(([dx, dy, ph], i) => {
        const fall = ((frame + ph * 3) % 60) / 60;
        const yy = dy + fall * 70;
        return (
          <g key={i} opacity={1 - fall * 0.8}>
            <path d={`M${dx} ${yy - 26} q-18 30 0 44 q18 -14 0 -44z`} fill={WET} stroke="#7fb4e6" strokeWidth={3} />
            <circle cx={dx - 5} cy={yy - 2} r={5} fill="#fff" opacity={0.9} />
          </g>
        );
      })}
      {[-150, -55, 50, 140].map((fx, i) => <path key={i} d={`M${fx} 70 v${60 + ((frame + i * 9) % 40)}`} stroke={WET} strokeWidth={6} strokeLinecap="round" opacity={0.5} />)}
    </g>
  );
};

/** Рука двойника, протянутая из двери в салон (в мировых координатах салона). Рукав синий, кисть мокрая. */
export const ReachArm: React.FC<{x0: number; y: number; len: number}> = ({x0, y, len}) => {
  const frame = useCurrentFrame();
  if (len <= 2) return null;
  const x1 = x0 + len;
  return (
    <g>
      <path d={`M${x0} ${y - 25} L${x1 - 30} ${y - 22} L${x1 - 30} ${y + 22} L${x0} ${y + 25}Z`} fill="#5470a6" />
      <rect x={x1 - 52} y={y - 26} width={22} height={52} rx={8} fill="#445f95" />
      <g transform={`translate(${x1 - 30} ${y}) rotate(-90)`}>
        <path d="M-20 -6 Q-24 38 -10 54 Q0 62 12 54 Q24 38 20 -6 Z" fill={SKIN} stroke="#d49a6e" strokeWidth={2} />
        <path d="M-6 28 V52 M4 28 V54 M13 26 V48" stroke="#d9a67a" strokeWidth={2} strokeLinecap="round" />
        <path d="M-12 6 Q0 -2 12 8" stroke="#fff" strokeWidth={4} fill="none" opacity={0.6} />
      </g>
      {[0, 1, 2].map((i) => {
        const fall = ((frame + i * 14) % 42) / 42;
        return <path key={i} d={`M${x1 + 10 + i * 10} ${y + 24 + fall * 40} q-5 9 0 13 q6 -5 0 -13z`} fill="#bfe3ff" opacity={1 - fall} />;
      })}
    </g>
  );
};
