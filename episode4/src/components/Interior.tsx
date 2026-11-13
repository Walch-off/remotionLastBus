import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Street, StreetDefs, Lamp, FIGURE_X, STREET_H} from './Street';
import {DriverCab, DriverBack} from './Driver';
import {Hero} from './Hero';

export const SEAT_X = [760, 1015, 1290, 1560]; // A, B(герой), C, D
export const WIN = {x: 620, y: 340, w: 1080, h: 620};
export const HERO_SEAT = {x: 1015, hipY: 1070};
export const DOOR = {x: 330, w: 230, y: 340, h: 960};

export const InteriorDefs = () => (
  <defs>
    <StreetDefs />
    <linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2442" /><stop offset="1" stopColor="#0f1730" /></linearGradient>
    <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10172e" /><stop offset="1" stopColor="#070a16" /></linearGradient>
    <linearGradient id="seatG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4a70" /><stop offset="1" stopColor="#252f4d" /></linearGradient>
    <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity={0.12} /><stop offset="0.35" stopColor="#fff" stopOpacity={0} /><stop offset="0.7" stopColor="#fff" stopOpacity={0.05} /></linearGradient>
    <radialGradient id="ceilGlow"><stop offset="0" stopColor="#fff2c9" stopOpacity={0.35} /><stop offset="1" stopColor="#fff2c9" stopOpacity={0} /></radialGradient>
    <clipPath id="winClip"><rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} rx={26} /></clipPath>
    <clipPath id="doorClip"><rect x={DOOR.x} y={DOOR.y} width={DOOR.w} height={DOOR.h} rx={12} /></clipPath>
  </defs>
);

/** Фон салона (вид вдоль стены): кабина водителя, дверь, окна с улицей, спинки сидений. */
export const BusWall: React.FC<{streetX: number; doorOpen?: number; lampLit?: number; windowOverlay?: React.ReactNode; doorOutside?: React.ReactNode; driver?: boolean; lights?: number; poleShake?: number}> = ({streetX, doorOpen = 0, lampLit = 1, windowOverlay, doorOutside, driver = true, lights = 1, poleShake = 0}) => {
  const frame = useCurrentFrame();
  const flick = (frame % 97 > 92 ? 0.55 : 1) * lights;
  const ps = poleShake > 0 ? Math.sin(frame * 3.1) * poleShake : 0;
  return (
    <g>
      <rect x={-400} y={-900} width={2500} height={3600} fill="url(#wallG)" />
      {/* потолок */}
      <rect x={-400} y={-900} width={2500} height={1200} fill="#0b1124" />
      <rect x={-200} y={296} width={2100} height={10} fill="#2a3556" />
      {Array.from({length: 9}).map((_, i) => (
        <g key={i}>
          <rect x={80 + i * 210} y={80} width={150} height={16} rx={8} fill="#fff4d2" opacity={0.92 * flick} />
          <ellipse cx={155 + i * 210} cy={200} rx={190} ry={170} fill="url(#ceilGlow)" opacity={0.5 * flick} />
        </g>
      ))}
      <rect x={-200} y={236} width={2100} height={12} rx={6} fill="#8c93a8" />
      {Array.from({length: 11}).map((_, i) => (
        <g key={i}><path d={`M${660 + i * 100} 248 v50`} stroke="#6f7690" strokeWidth={5} /><circle cx={660 + i * 100} cy={314} r={20} fill="none" stroke="#a0a8c0" strokeWidth={6} /></g>
      ))}
      {/* кабина водителя */}
      <rect x={-200} y={340} width={500} height={960} fill="#0d1328" />
      <rect x={20} y={380} width={270} height={560} rx={20} fill="#0a1022" stroke="#2a3556" strokeWidth={8} />
      {driver && <g><rect x={40} y={400} width={230} height={520} rx={12} fill="#141c36" /><DriverCab x={160} y={620} /></g>}
      <rect x={300} y={340} width={30} height={960} fill="#222c4c" />
      {/* дверь */}
      <rect x={DOOR.x - 12} y={DOOR.y - 16} width={DOOR.w + 24} height={DOOR.h + 22} rx={16} fill="#1b2442" />
      <g clipPath="url(#doorClip)">
        <g transform={`translate(${DOOR.x} ${DOOR.y})`}>
          <rect width={DOOR.w} height={DOOR.h} fill="#05070f" />
        </g>
        <g transform={`translate(${DOOR.x} ${DOOR.y}) scale(1.55)`}>
          <Street camX={streetX - 290 + FIGURE_X * 0} width={DOOR.w / 1.55} lampLit={lampLit} figure={doorOutside} />
        </g>
        {doorOpen < 1 && (
          <g>
            <g transform={`translate(${-(DOOR.w / 2) * doorOpen} 0)`}>
              <rect x={DOOR.x} y={DOOR.y} width={DOOR.w / 2 - 3} height={DOOR.h} fill="#7a9bd0" opacity={0.18} />
              <rect x={DOOR.x} y={DOOR.y} width={DOOR.w / 2 - 3} height={DOOR.h} fill="none" stroke="#10182f" strokeWidth={10} />
              <rect x={DOOR.x} y={DOOR.y + 500} width={DOOR.w / 2 - 3} height={22} fill="#10182f" />
            </g>
            <g transform={`translate(${(DOOR.w / 2) * doorOpen} 0)`}>
              <rect x={DOOR.x + DOOR.w / 2 + 3} y={DOOR.y} width={DOOR.w / 2 - 3} height={DOOR.h} fill="#7a9bd0" opacity={0.18} />
              <rect x={DOOR.x + DOOR.w / 2 + 3} y={DOOR.y} width={DOOR.w / 2 - 3} height={DOOR.h} fill="none" stroke="#10182f" strokeWidth={10} />
              <rect x={DOOR.x + DOOR.w / 2 + 3} y={DOOR.y + 500} width={DOOR.w / 2 - 3} height={22} fill="#10182f" />
            </g>
          </g>
        )}
      </g>
      <rect x={DOOR.x + DOOR.w / 2 - 3} y={DOOR.y} width={6} height={DOOR.h} fill="#0a0f20" opacity={1 - doorOpen} />
      {/* окна с улицей */}
      <rect x={WIN.x - 14} y={WIN.y - 14} width={WIN.w + 28} height={WIN.h + 28} rx={34} fill="#0b1124" />
      <g clipPath="url(#winClip)">
        <g transform={`translate(${WIN.x} ${WIN.y - 93}) scale(1.15)`}><Street camX={streetX} width={WIN.w / 1.15} lampLit={lampLit} /></g>
        {windowOverlay}
        <rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="url(#glassSheen)" />
      </g>
      {[887, 1150, 1425].map((px) => <rect key={px} x={px - 20} y={WIN.y - 6} width={40} height={WIN.h + 12} fill="#121a34" />)}
      {/* стена под окнами */}
      <rect x={-200} y={960} width={2100} height={340} fill="#18213e" />
      <rect x={-200} y={955} width={2100} height={12} fill="#2f3b61" />
      {/* спинки сидений */}
      {SEAT_X.map((sx) => (
        <g key={sx}>
          <rect x={sx - 108} y={740} width={216} height={300} rx={46} fill="url(#seatG)" />
          <rect x={sx - 96} y={752} width={192} height={26} rx={13} fill="#4c5d88" opacity={0.6} />
        </g>
      ))}
      <g transform={`translate(${ps} 0)`}><rect x={584} y={230} width={14} height={1260} rx={7} fill="#9aa3bd" /><rect x={1156} y={230} width={14} height={1260} rx={7} fill="#9aa3bd" /></g>
      {/* пол */}
      <rect x={-400} y={1300} width={2500} height={1800} fill="url(#floorG)" />
      <rect x={-200} y={1296} width={2100} height={10} fill="#2a3556" />
      <path d="M-200 1560 H1900" stroke="#1d2644" strokeWidth={4} />
      <path d="M-200 1760 H1900" stroke="#161d38" strokeWidth={4} />
    </g>
  );
};

/** Передние панели сидений — рисуются поверх сидящего героя (скрывают ноги). */
export const SeatFronts: React.FC = () => (
  <g>
    {SEAT_X.map((sx) => (
      <g key={sx}>
        <rect x={sx - 118} y={1046} width={236} height={86} rx={30} fill="#3e4d75" />
        <rect x={sx - 118} y={1046} width={236} height={22} rx={11} fill="#58699a" />
        <rect x={sx - 118} y={1120} width={236} height={180} rx={12} fill="#212a47" />
        <rect x={sx - 104} y={1140} width={208} height={8} fill="#161d36" />
      </g>
    ))}
  </g>
);

/** Вид вперёд: водитель со спины, лобовое стекло, передняя дверь (справа). */
export const BusFront: React.FC<{doorOpen?: number; wheelRot?: number; headTurn?: number; handsGlow?: number; roadShift?: number; outside?: React.ReactNode; streetX?: number; lift?: number; keyT?: number; keyTurn?: number; engine?: number; mirrorFace?: number; vib?: number; mirrorProps?: any; mirrorOverlay?: React.ReactNode; ahead?: {k: number; camX: number; lampLit: number; figure?: React.ReactNode} | null; dim?: number; lights?: number; lhT?: number}> = ({doorOpen = 0, wheelRot = 0, headTurn = 0, handsGlow = 0, roadShift = 0, outside, streetX = 1700, lift = 0, keyT = 0, keyTurn = 0, engine = 0, mirrorFace = -1, vib = 0, mirrorProps, mirrorOverlay, ahead = null, dim = 0, lights = 1, lhT = 0}) => {
  const frame = useCurrentFrame();
  const vx = 415, vy = 640;
  const dash = ((roadShift % 1) + 1) % 1;
  const shake = vib > 0 ? Math.sin(frame * 2.3) * 3 * vib : 0;
  return (
    <g transform={`translate(0 ${shake})`}>
      <rect x={-50} y={0} width={1180} height={1920} fill="#0c1226" />
      <rect x={0} y={0} width={1080} height={230} fill="#0a0f20" />
      {Array.from({length: 4}).map((_, i) => <rect key={i} x={60 + i * 250} y={90} width={150} height={16} rx={8} fill="#fff4d2" opacity={0.85 * lights} />)}
      {/* лобовое стекло */}
      <clipPath id="wsClip"><path d="M60 300 Q415 220 770 300 L790 1020 L40 1020Z" /></clipPath>
      <g clipPath="url(#wsClip)">
        <rect x={0} y={200} width={820} height={840} fill="url(#skyG)" />
        {/* дома по бокам */}
        {[0, 1, 2, 3, 4].map((i) => {
          const d = i / 4; const w = 60 + d * 220;
          return (
            <g key={i}>
              <rect x={vx - 40 - d * 400 - w * 0.2} y={vy - 120 - d * 260} width={w} height={240 + d * 520} fill={i % 2 ? '#141d3c' : '#0f1731'} />
              <rect x={vx + 40 + d * 330} y={vy - 100 - d * 240} width={w} height={220 + d * 500} fill={i % 2 ? '#0f1731' : '#141d3c'} />
            </g>
          );
        })}
        {/* дорога */}
        <path d={`M${vx - 14} ${vy} L${vx + 14} ${vy} L${vx + 470} 1020 L${vx - 470} 1020Z`} fill="#101528" />
        <path d={`M${vx - 14} ${vy} L${vx - 470} 1020 L${vx - 640} 1020 L${vx - 40} ${vy}Z`} fill="#1d2748" />
        <path d={`M${vx + 14} ${vy} L${vx + 470} 1020 L${vx + 640} 1020 L${vx + 40} ${vy}Z`} fill="#1d2748" />
        {[0, 1, 2, 3, 4].map((i) => {
          const p = (i + dash) / 5; const y = vy + (1020 - vy) * p * p; const w = 3 + 22 * p * p; const h = 8 + 70 * p * p;
          return <rect key={i} x={vx - w / 2} y={y} width={w} height={h} fill="#e2d9a8" opacity={0.65} />;
        })}
        {/* фонарь и аптека впереди */}
        <g transform="translate(300 600)">
          <rect x={-3} y={-60} width={6} height={110} fill="#1c2236" />
          <circle cx={0} cy={-62} r={30} fill="url(#bulbGlow)" opacity={frame % 23 < 3 ? 0.4 : 1} />
        </g>
        <g transform="translate(540 630)">
          <rect x={-50} y={-30} width={100} height={60} fill="#2a3558" />
          <circle cx={0} cy={-40} r={26} fill="url(#pharmGlow)" />
          <path d="M0 -52v24M-12 -40h24" stroke="#44f09c" strokeWidth={6} strokeLinecap="round" />
        </g>
        <path d={`M${vx} 1000 L${vx - 250} ${vy + 120} L${vx + 250} ${vy + 120}Z`} fill="#fff0a8" opacity={0.05 + 0.14 * engine} />
        {ahead && (
          <g transform={`translate(415 660) scale(${ahead.k}) translate(-540 -310)`}>
            <rect x={-3000} y={-3000} width={7000} height={3000} fill="#070c1d" />
            <rect x={-3000} y={618} width={7000} height={4000} fill="#0b1020" />
            <Street camX={ahead.camX} figure={ahead.figure} lampLit={ahead.lampLit} />
          </g>
        )}
      </g>
      <path d="M60 300 Q415 220 770 300 L790 1020 L40 1020Z" fill="none" stroke="#1d2644" strokeWidth={16} />
      <rect x={400} y={290} width={30} height={730} fill="#0c1226" opacity={0.0} />
      {/* приборная панель */}
      <rect x={0} y={1010} width={820} height={300} fill="#0d1224" />
      <rect x={0} y={1010} width={820} height={10} fill="#2a3556" />
      <rect x={560} y={1050} width={150} height={52} rx={8} fill="#05070f" />
      <text x={635} y={1090} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={36} fill="#ff6a3d">00:47</text>
      {[0, 1, 2].map((i) => <circle key={i} cx={100 + i * 38} cy={1070} r={9} fill={['#ff5a4d', '#ffb347', '#4de08a'][i]} opacity={0.25 + 0.65 * Math.max(engine, i === 0 && keyT > 0.6 ? 1 : 0)} />)}
      {/* руль (пустой) */}
      <g transform={`rotate(${wheelRot} ${vx} 1085)`}>
        <ellipse cx={vx} cy={1085} rx={300} ry={92} fill="none" stroke="#12151f" strokeWidth={30} />
        <ellipse cx={vx} cy={1085} rx={300} ry={92} fill="none" stroke="#2a3048" strokeWidth={5} />
        <ellipse cx={vx} cy={1090} rx={64} ry={26} fill="#171b2b" />
        <path d={`M${vx - 70} 1090 L${vx - 290} 1080 M${vx + 70} 1090 L${vx + 290} 1080`} stroke="#12151f" strokeWidth={20} strokeLinecap="round" />
      </g>
      <DriverBack x={vx} y={1030} scale={1} headTurn={headTurn} handsGlow={handsGlow} frame={frame} lift={lift} keyT={keyT} keyTurn={keyTurn} lhT={lhT} />
      {mirrorFace >= 0 && (
        <g transform="translate(415 330)">
          <rect x={-114} y={-48} width={228} height={96} rx={14} fill="#0b0f1d" stroke="#2f3a5c" strokeWidth={8} />
          <clipPath id="mirClip"><rect x={-106} y={-40} width={212} height={80} rx={9} /></clipPath>
          <g clipPath="url(#mirClip)">
            <rect x={-106} y={-40} width={212} height={80} fill="#18223f" />
            <rect x={-90} y={-30} width={50} height={7} rx={3} fill="#fff4d2" opacity={0.35} /><rect x={30} y={-30} width={50} height={7} rx={3} fill="#fff4d2" opacity={0.35} />
            <g opacity={mirrorFace}>
              <rect x={-106} y={-40} width={212} height={80} fill="#2a2f4a" />
              <Hero id="mf" x={0} y={34} scale={0.36} anchor={[505, 300]} legs={false} face="calm" look={[0, 0]} armL={80} armR={80} {...mirrorProps} />
            </g>
            {mirrorOverlay}
            <path d="M-106 -40 L-40 -40 L-80 40 L-106 40Z" fill="#fff" opacity={0.07} />
          </g>
        </g>
      )}
      {/* передняя дверь справа */}
      <rect x={822} y={240} width={258} height={1300} fill="#0d1328" />
      <rect x={830} y={260} width={236} height={1110} rx={14} fill="#0a0f20" stroke="#222c4c" strokeWidth={10} />
      <clipPath id="fdClip"><rect x={842} y={272} width={212} height={1086} rx={8} /></clipPath>
      <g clipPath="url(#fdClip)">
        <rect x={842} y={272} width={212} height={1086} fill="#05070f" />
        <g transform={`translate(842 300) scale(1.75)`}>
          <Street camX={streetX} width={212 / 1.75} figure={outside} />
        </g>
        {doorOpen > 0 && <rect x={842} y={272} width={212} height={1086} fill="#ffc857" opacity={0.06 * doorOpen} />}
        <g transform={`translate(${-106 * doorOpen} 0)`}>
          <rect x={842} y={272} width={103} height={1086} fill="#7a9bd0" opacity={0.2} />
          <rect x={842} y={272} width={103} height={1086} fill="none" stroke="#10182f" strokeWidth={9} />
        </g>
        <g transform={`translate(${106 * doorOpen} 0)`}>
          <rect x={951} y={272} width={103} height={1086} fill="#7a9bd0" opacity={0.2} />
          <rect x={951} y={272} width={103} height={1086} fill="none" stroke="#10182f" strokeWidth={9} />
        </g>
      </g>
      <rect x={0} y={1500} width={1080} height={420} fill="url(#floorG)" />
      <path d={`M${vx} 1310 L${vx - 480} 1920 M${vx} 1310 L${vx + 560} 1920`} stroke="#171f3d" strokeWidth={4} />
      {dim > 0 && <rect x={-50} y={-50} width={1180} height={2000} fill="#040714" opacity={dim} />}
    </g>
  );
};
