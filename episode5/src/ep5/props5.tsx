import React from 'react';
import {SKIN} from '../common';
import {Fist, KeyShape} from '../ep4/props4';

const GHOST = '#8fa9cf', GHOST_EDGE = '#4f6c99';

/**
 * Призрачная мокрая ладонь, обхватившая предплечье. Рисуется в системе кулака (предплечье уходит вверх, −y),
 * поэтому двигается вместе с рукой и не «висит» отдельно. Запястье уходит влево и растворяется — владельца не видно.
 */
export const GripHand: React.FC<{x: number; y: number; t: number; squeeze?: number}> = ({x, y, t, squeeze = 0.5}) => (
  <g transform={`translate(${x} ${y})`}>
    <defs>
      <linearGradient id="ghGripFade" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor={GHOST} stopOpacity={0.9} /><stop offset="0.35" stopColor={GHOST} stopOpacity={0.55} /><stop offset="1" stopColor={GHOST} stopOpacity={0} /></linearGradient>
      <radialGradient id="ghGripMist"><stop offset="0" stopColor="#bcd6ff" stopOpacity={0.35} /><stop offset="1" stopColor="#bcd6ff" stopOpacity={0} /></radialGradient>
    </defs>
    <ellipse cx={-60} cy={0} rx={110} ry={80} fill="url(#ghGripMist)" />
    {/* запястье растворяется в воздухе через ~100 px — владельца нет */}
    <rect x={-150} y={-22} width={120} height={44} rx={20} fill="url(#ghGripFade)" />
    {/* ладонь сбоку и большой палец сверху */}
    <ellipse cx={-38} cy={2} rx={24} ry={36} fill={GHOST} stroke={GHOST_EDGE} strokeWidth={2.5} />
    <g transform="translate(-30 -34) rotate(-60)"><rect x={-9} y={-6} width={18} height={52} rx={9} fill={GHOST} stroke={GHOST_EDGE} strokeWidth={2.5} /></g>
    {/* пальцы обхватывают рукав спереди */}
    {[-24, -9, 6, 20].map((fy, i) => (
      <g key={i}>
        <rect x={-34} y={fy - 6.5 + squeeze * 1} width={66 - Math.abs(i - 1.5) * 6} height={13} rx={6.5} fill={GHOST} stroke={GHOST_EDGE} strokeWidth={2} />
        <path d={`M${-10} ${fy - 2} h22`} stroke="#eef6ff" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      </g>
    ))}
    {/* вмятины на рукаве от пальцев */}
    <path d="M32 -30 q6 30 0 60" stroke="#2c4373" strokeWidth={4} fill="none" opacity={0.6} />
    {/* капли стекают по рукаву */}
    {[0, 1].map((k) => {
      const u = (t * 0.8 + k * 0.5) % 1;
      return <path key={k} d={`M${4 + k * 14} ${26 + u * 70} q-4 8 0 11 q4 -3 0 -11z`} fill="#bcd6ff" opacity={0.9 * (1 - u)} />;
    })}
  </g>
);

/** Фигура, которая видна только в зеркале: тёмный безликий силуэт, мокрые блики. d — близость (0 далеко … 1 вплотную). */
export const MirrorFigure: React.FC<{d: number; x: number; bob: number; reachA?: number; op: number}> = ({d, x, bob, reachA = 0, op}) => {
  if (op <= 0.01) return null;
  const s = 0.15 + 1.15 * d;
  const feetY = -10 + 346 * d;
  const body = '#060914', rim = '#7f9fe0';
  return (
    <g opacity={op} transform={`translate(${x} ${feetY - bob * s}) scale(${s})`}>
      <ellipse cx={0} cy={-150} rx={95} ry={170} fill="#0a1030" opacity={0.5} />
      {/* ноги */}
      <path d="M-34 -110 L-30 0 L-8 0 L-4 -110Z M4 -110 L8 0 L30 0 L34 -110Z" fill={body} />
      {/* корпус и плечи */}
      <path d="M-58 -228 Q0 -246 58 -228 Q66 -200 50 -110 L-50 -110 Q-66 -200 -58 -228Z" fill={body} stroke={rim} strokeWidth={2.2 / s + 1} strokeOpacity={0.55} />
      {/* руки вдоль тела */}
      <path d="M-58 -226 Q-74 -170 -66 -120" stroke={body} strokeWidth={20} strokeLinecap="round" fill="none" />
      {reachA < 0.05 && <path d="M58 -226 Q74 -170 66 -120" stroke={body} strokeWidth={20} strokeLinecap="round" fill="none" />}
      {/* голова без лица */}
      <rect x={-12} y={-252} width={24} height={26} fill={body} />
      <ellipse cx={0} cy={-272} rx={30} ry={36} fill={body} stroke={rim} strokeWidth={2.2 / s + 1} strokeOpacity={0.6} />
      <path d="M-16 -296 q12 -10 26 -2" stroke="#c9dcff" strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" />
      {/* мокрые блики и капли */}
      {[[-40, -200], [30, -180], [-20, -140], [44, -150]].map(([px, py], i) => <path key={i} d={`M${px} ${py} q-3 8 0 12 q3 -4 0 -12z`} fill="#9fc0f5" opacity={0.7} />)}
      {/* рука тянется к зрителю: с ракурсом кисть растёт */}
      {reachA >= 0.05 && (
        <g>
          <path d={`M54 -222 Q${70 - 40 * reachA} ${-190 + 10 * reachA} ${40 - 70 * reachA} ${-170 + 20 * reachA}`} stroke={body} strokeWidth={22 + 18 * reachA} strokeLinecap="round" fill="none" />
          <g transform={`translate(${40 - 70 * reachA} ${-170 + 20 * reachA}) scale(${0.5 + 1.3 * reachA})`}>
            {[-1.5, -0.5, 0.5, 1.5].map((f, i) => <rect key={i} x={f * 11 - 5} y={-46 - (i === 1 || i === 2 ? 6 : 0)} width={10} height={40} rx={5} fill={body} stroke={rim} strokeWidth={1.2} strokeOpacity={0.6} />)}
            <ellipse cx={0} cy={0} rx={24} ry={26} fill={body} stroke={rim} strokeWidth={1.2} strokeOpacity={0.6} />
            <g transform="translate(-24 4) rotate(-40)"><rect x={-5} y={-30} width={10} height={32} rx={5} fill={body} /></g>
          </g>
        </g>
      )}
    </g>
  );
};

/**
 * Замок двери крупно, лицом к камере. Начало — центр личинки.
 * Рука приходит снизу справа (герой стоит справа от замка): большой палец прижимает головку ключа,
 * кулак, головка и личинка поворачиваются вместе; рукав всегда соединён с манжетой.
 */
export const LockFace: React.FC<{led: string; angle: number; ins: number; squeeze?: number; outside?: boolean}> = ({led, angle, ins, squeeze = 0, outside = false}) => {
  const ledC = led === 'green' ? '#4dff9a' : led === 'amber' ? '#ffb73a' : '#ff4a3a';
  const ox = 330 * (1 - ins), oy = 430 * (1 - ins), sc = 1 + 0.3 * (1 - ins);
  const r = (angle * Math.PI) / 180;
  const rot = (x: number, y: number): [number, number] => [ox + sc * (x * Math.cos(r) - y * Math.sin(r)), oy + sc * (x * Math.sin(r) + y * Math.cos(r))];
  const cuff = rot(150, 120);
  const ring = rot(0, -150);
  const plateBg = outside ? '#2b3e6e' : '#1d2a52';
  return (
    <g transform="scale(1.3)">
      <rect x={-130} y={-300} width={260} height={580} rx={36} fill="url(#lkChrome)" />
      <rect x={-112} y={-282} width={224} height={544} rx={26} fill={plateBg} />
      <circle cx={0} cy={-220} r={20} fill={ledC} />
      <circle cx={0} cy={-220} r={46} fill={ledC} opacity={0.25} filter="url(#lkBlur8)" />
      <text x={0} y={180} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#c9d4ee" opacity={0.75}>ДВЕРИ</text>
      {[0, 30, 65, 100].map((a, i) => <rect key={i} x={-3} y={-112} width={6} height={16} rx={3} fill="#c9d4ee" opacity={0.6} transform={`rotate(${a})`} />)}
      <circle cx={0} cy={0} r={90} fill="url(#lkChrome)" />
      <circle cx={0} cy={0} r={72} fill="#1a1d27" stroke="#8a95b0" strokeWidth={4} />
      <g transform={`rotate(${angle})`}><rect x={-9} y={-46} width={18} height={92} rx={6} fill="#05060a" /></g>
      {/* рукав: от нижнего правого края кадра до манжеты */}
      <path d={`M${cuff[0]} ${cuff[1]} L620 980`} stroke="#5470a6" strokeWidth={150} strokeLinecap="round" />
      <path d={`M${cuff[0] + 40} ${cuff[1] + 20} L660 980`} stroke="#3a5287" strokeWidth={40} strokeLinecap="round" opacity={0.45} />
      <g transform={`translate(${(cuff[0] + 620) / 2 - 10} ${(cuff[1] + 980) / 2}) scale(2.4)`}><path d="M-18 -4 q6 -16 22 -12 q16 4 17 16 q1 14 -14 17 q-14 4 -22 -6 q-8 -8 -3 -15z" fill="#4a2c1d" /></g>
      <g transform={`translate(${ox} ${oy}) scale(${sc}) rotate(${angle})`}>
        <g transform="translate(150 120) rotate(40)"><rect x={-60} y={-40} width={120} height={80} rx={22} fill="#445f95" /></g>
        {/* кулак за головкой ключа */}
        <g transform="translate(92 22) scale(3.1)"><Fist squeeze={squeeze} /></g>
        {/* головка ключа над личинкой */}
        <path d="M-58 -186 Q0 -226 58 -186 Q72 -136 42 -86 L-42 -86 Q-72 -136 -58 -186Z" fill="#e0c97c" stroke="#8a7a3a" strokeWidth={5} />
        <circle cx={0} cy={-150} r={20} fill={plateBg} stroke="#8a7a3a" strokeWidth={4} />
        <rect x={-26} y={-90} width={52} height={90} rx={8} fill="#d4bd70" stroke="#8a7a3a" strokeWidth={4} />
        <path d="M-40 -200 q20 -10 40 -6" stroke="#fff6d0" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        {/* большой палец прижимает головку */}
        <g transform="translate(46 -120) rotate(-18)"><rect x={-20} y={-56} width={40} height={110} rx={20} fill={SKIN} stroke="#d49a6e" strokeWidth={4} /></g>
      </g>
      {/* бирка на кольце головки — висит вниз */}
      <g transform={`translate(${ring[0]} ${ring[1]})`}>
        <circle cx={0} cy={0} r={18} fill="none" stroke="#e0c97c" strokeWidth={7} />
        <path d="M0 16 Q-14 70 -60 110" stroke="#bbb" strokeWidth={5} fill="none" />
        <g transform="translate(-60 110) rotate(8)">
          <rect x={-70} y={0} width={140} height={96} rx={14} fill="#c7433a" stroke="#7a1f1a" strokeWidth={5} />
          <text x={0} y={62} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#fff">ДВЕРИ</text>
        </g>
      </g>
    </g>
  );
};

/** Красная бирка ключа в кармане — крупный план */
export const PocketTag: React.FC = () => (
  <g>
    <rect x={-70} y={-50} width={140} height={100} rx={14} fill="#c7433a" stroke="#7a1f1a" strokeWidth={5} />
    <text x={0} y={14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#fff">ДВЕРИ</text>
  </g>
);

/** Ботинок героя (как в Hero: тёмный верх, серая подошва) — для крупного плана прыжка на асфальт */
export const Shoe: React.FC<{dark?: boolean}> = ({dark}) => (
  <g>
    <path d="M-20 -260 L40 -260 L46 -40 L-26 -40Z" fill={dark ? '#2d2f3a' : '#3f3f4b'} />
    <path d="M-30 -50 L50 -50 Q60 -30 110 -22 Q150 -14 156 6 Q160 24 140 28 L-30 28 Q-46 20 -40 -4Z" fill={dark ? '#121318' : '#26262d'} />
    <path d="M-44 10 Q-46 30 -28 32 L144 32 Q162 28 160 10Z" fill={dark ? '#2a2a30' : '#6b6b73'} />
    {!dark && <path d="M40 -30 l28 -8 M50 -16 l34 -8" stroke="#555560" strokeWidth={4} strokeLinecap="round" />}
  </g>
);

export {KeyShape, SKIN};
