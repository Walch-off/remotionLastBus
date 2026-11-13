import React from 'react';

/** Автобус сбоку, едет вправо. Начало координат — левый нижний угол кузова на уровне колёс. */
export const BusSide: React.FC<{x: number; y: number; scale?: number; wheel?: number; stopped?: boolean}> = ({x, y, scale = 1, wheel = 0, stopped}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx={380} cy={6} rx={430} ry={16} fill="#000" opacity={0.35} />
    <rect x={0} y={-330} width={760} height={300} rx={34} fill="#27495e" />
    <rect x={0} y={-330} width={760} height={46} rx={34} fill="#315d78" />
    <rect x={0} y={-76} width={760} height={46} fill="#1b3243" />
    <rect x={0} y={-60} width={760} height={6} fill="#d9a441" />
    {/* окна */}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i}>
        <rect x={34 + i * 112} y={-262} width={96} height={118} rx={10} fill="#ffd98a" />
        <rect x={34 + i * 112} y={-262} width={96} height={118} rx={10} fill="none" stroke="#17293a" strokeWidth={6} />
      </g>
    ))}
    {/* в салоне — только двое: пассажир и водитель */}
    <g>
      <circle cx={338} cy={-206} r={22} fill="#7a4a28" /><rect x={316} y={-186} width={44} height={42} rx={14} fill="#4b69a0" />
      <circle cx={648} cy={-200} r={23} fill="#10141f" /><rect x={622} y={-178} width={52} height={34} rx={14} fill="#10141f" />
    </g>
    {/* передняя дверь */}
    <rect x={598} y={-262} width={4} height={232} fill="#17293a" />
    <rect x={690} y={-262} width={4} height={232} fill="#17293a" />
    <rect x={705} y={-290} width={44} height={26} rx={5} fill="#0c0f18" />
    <text x={727} y={-270} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={20} fill="#ffb347">12</text>
    {/* фары */}
    <rect x={750} y={-112} width={14} height={30} rx={6} fill="#fff6c8" />
    <path d="M760 -102 L1180 -170 L1180 20 L760 -86Z" fill="#fff0a8" opacity={stopped ? 0.1 : 0.17} />
    {/* колёса */}
    {[170, 600].map((cx) => (
      <g key={cx} transform={`translate(${cx} -28)`}>
        <circle r={60} fill="#0c0f18" />
        <g transform={`rotate(${wheel})`}>
          <circle r={36} fill="#3a4258" />
          {[0, 72, 144, 216, 288].map((a) => <rect key={a} x={-3} y={-36} width={6} height={36} fill="#1a2030" transform={`rotate(${a})`} />)}
        </g>
      </g>
    ))}
  </g>
);
