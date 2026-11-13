import React from 'react';

/** Водитель сзади/сверху. Лицо не показывается. Руки лежат на коленях, не на руле. */
export const DriverBack: React.FC<{x: number; y: number; scale?: number; headTurn?: number; handsGlow?: number; frame?: number; lift?: number; keyT?: number; keyTurn?: number; lhT?: number}> = ({x, y, scale = 1, headTurn = 0, handsGlow = 0, frame = 0, lift = 0, keyT = 0, keyTurn = 0, lhT = 0}) => {
  const lx = -222 + (-100 + 222) * lhT, ly = 270 + (30 - 270) * lhT;
  const rx = 222 + (110 - 222) * keyT, ry = 270 + (50 - 270) * keyT;
  const jacket = '#2b3250', jacketL = '#3a4366', skin = '#cfae96', pants = '#161a2b';
  const hand = (hx: number, hy: number, flip: number) => (
    <g transform={`translate(${hx} ${hy}) scale(${flip} 1)`}>
      <ellipse cx={0} cy={0} rx={34} ry={42} fill={skin} />
      {[-18, -6, 6, 18].map((fx) => <rect key={fx} x={fx - 4} y={14} width={9} height={36} rx={4.5} fill={skin} stroke="#a3836e" strokeWidth={1.5} />)}
      <rect x={-18} y={-58} width={36} height={30} rx={10} fill={jacket} />
      {handsGlow > 0 && <ellipse cx={0} cy={8} rx={64 + 6 * Math.sin(frame / 6)} ry={72 + 6 * Math.sin(frame / 6)} fill="none" stroke="#ffd25a" strokeWidth={5} opacity={handsGlow} />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* спинка сиденья */}
      <rect x={-180} y={-120} width={360} height={640} rx={60} fill="#232c44" />
      <rect x={-170} y={-110} width={340} height={30} rx={14} fill="#33405f" opacity={0.7} />
      {/* бёдра/колени */}
      <rect x={-260} y={190} width={130} height={170} rx={50} fill={pants} />
      <rect x={130} y={190} width={130} height={170} rx={50} fill={pants} />
      {/* торс */}
      <path d="M-150 -30 Q-170 40 -130 120 L-120 440 L120 440 L130 120 Q170 40 150 -30 Q0 -80 -150 -30Z" fill={jacket} />
      <path d="M0 -50 V440" stroke="#1d2340" strokeWidth={4} />
      <path d="M-130 20 Q0 -20 130 20" stroke={jacketL} strokeWidth={8} fill="none" opacity={0.6} />
      {/* руки */}
      <path d={`M-140 -10 Q${(-140 + lx) / 2 - 30} ${(ly - 70) / 2 + 40} ${lx} ${ly - 60}`} stroke={jacket} strokeWidth={84} strokeLinecap="round" fill="none" />
      <path d={`M140 -10 Q${(140 + rx) / 2 + 30} ${(ry - 70) / 2 + 40} ${rx} ${ry - 60}`} stroke={jacket} strokeWidth={84} strokeLinecap="round" fill="none" />
      {hand(lx, ly, 1)}
      {hand(rx, ry, -1)}
      {keyT > 0 && (
        <g transform={`translate(${rx - 52} ${ry + 6}) rotate(${keyTurn * 80})`}>
          <rect x={-5} y={-4} width={44} height={9} rx={4} fill="#d8c27a" stroke="#8a7a3a" strokeWidth={2} />
          <circle cx={-12} cy={0} r={13} fill="none" stroke="#d8c27a" strokeWidth={6} />
          {keyTurn > 0.5 && <circle cx={10} cy={0} r={36} fill="none" stroke="#ffd25a" strokeWidth={4} opacity={0.7} />}
        </g>
      )}
      {/* шея и голова (затылок), кепка */}
      <g transform={`translate(0 ${-30 * lift}) rotate(${headTurn - 4 * lift} 0 -40)`}>
        <rect x={-34} y={-90} width={68} height={70} rx={20} fill="#b99580" />
        <ellipse cx={-76} cy={-170} rx={14} ry={22} fill="#b99580" />
        <ellipse cx={76} cy={-170} rx={14} ry={22} fill="#b99580" />
        <circle cx={0} cy={-190} r={82} fill="#2a2d3a" />
        <path d="M-82 -190 Q0 -330 82 -190 Q0 -150 -82 -190Z" fill="#1a1d29" />
        <path d="M-82 -176 Q0 -140 82 -176" stroke="#0f1119" strokeWidth={8} fill="none" />
        <rect x={-20} y={-182} width={40} height={10} rx={5} fill="#3a3f55" />
      </g>
    </g>
  );
};

/** Силуэт водителя сбоку-сзади в кабине (вид вдоль салона). */
export const DriverCab: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-70} y={-40} width={140} height={20} rx={10} fill="#202843" />
    <path d="M-80 380 L-70 120 Q-70 20 0 20 Q70 20 76 130 L84 380Z" fill="#242b46" />
    <circle cx={4} cy={-40} r={60} fill="#1d2237" />
    <path d="M-56 -50 Q4 -140 64 -50 Q4 -20 -56 -50Z" fill="#12151f" />
    <path d="M-62 -30 Q4 -4 68 -30" stroke="#0c0e16" strokeWidth={6} fill="none" />
    <path d="M60 -80 Q80 -40 66 20" stroke="#3b4a78" strokeWidth={4} fill="none" opacity={0.7} />
    <rect x={-92} y={140} width={26} height={250} rx={12} fill="#1a2036" />
  </g>
);
