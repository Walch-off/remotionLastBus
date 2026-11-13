import React from 'react';
import {useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Hero} from '../components/Hero';
import {BusWall, SeatFronts, BusFront, HERO_SEAT, WIN} from '../components/Interior';
import {Phone} from '../components/Phone';
import {FIGURE_X} from '../components/Street';
import {LeftArmStrip} from '../components/Hero';
import {SHOTS, EV, WORDS} from '../story';
import {camT, clamp, lin, ramp, useT, kf} from '../common';
import {Stage, ExtView, Double, phoneSprite, streetXAt, lk, WINDOW_FRAME} from './parts';

type P = {t0: number};
const cl = (v: number, a: number, b: number) => clamp((v - a) / (b - a));

/* ---------- сидящий герой в салоне (вид вдоль стены) ---------- */
const SeatedWorld: React.FC<{t: number; cam: [number, number, number, number][]; face: any; face2?: any; mix?: number; look?: [number, number]; arm?: number; glow?: number; lampLit?: number; tilt?: number}> = ({t, cam, face, face2, mix = 0, look = [0, 0], arm = 70, glow = 0, tilt = 0}) => (
  <g transform={camT(t, cam)}>
    <BusWall streetX={streetXAt(t)} />
    <Hero id="hs" x={HERO_SEAT.x} y={HERO_SEAT.hipY} scale={1.4} anchor={[505, 575]} legs={false} armL={arm} armR={arm} face={face} face2={face2} faceMix={mix} look={look} tilt={tilt} stainGlow={glow} />
    <SeatFronts />
  </g>
);

export const Intro: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const frame = useCurrentFrame();
  return (
    <Stage>
      <ExtView t={t} cam={[[0, 540, 330, 1.75], [4.4, 540, 330, 1.75], [6.57, 395, 352, 3.0]]}
        bus={{x: lk(t, [[0, -950], [4.7, 1500]]), wheel: frame * 14}}
        figure={<Double shade={0.93} face="calm" />} />
    </Stage>
  );
};

export const Seat: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lx = lk(t, [[0, 0], [11.4, 0], [12.0, -0.9], [12.9, 0.9], [13.8, 0], [20, 0]]);
  return <Stage><SeatedWorld t={t} cam={[[6.57, 1015, 780, 1.1], [14.71, 1015, 740, 1.35]]} face="tired" look={[lx, 0]} /></Stage>;
};

export const Window1: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lx = lk(t, [[0, 0], [17.0, 0], [17.5, -0.9], [19.2, 0.9], [20.3, -0.6]]);
  return <Stage><SeatedWorld t={t} cam={[[14.71, 1015, 760, 1.3], [16.3, 900, 900, 1.85], [16.9, 880, 800, 1.0], [20.4, 880, 800, 1.0], [20.92, 1015, 760, 1.2]]} face="tired" face2="calm" mix={cl(t, 16.5, 17.2)} look={[lx, 0]} /></Stage>;
};

export const Window2: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const mix = cl(t, 21.6, 22.3) * (1 - cl(t, 23.6, 24.4));
  const wor = cl(t, 23.6, 24.6);
  return (
    <Stage>
      <SeatedWorld t={t} cam={[[20.92, 1015, 760, 1.2], [23.0, 880, 800, 1.0], [24.4, 880, 800, 1.0], [24.9, 1015, 740, 1.35], [25.2, 880, 800, 1.0], [26.23, 880, 800, 1.0]]} face={wor > 0.5 ? 'worried' : 'tired'} face2={wor > 0.5 ? 'worried' : 'surprised'} mix={wor > 0.5 ? 0 : mix}
        look={[lk(t, [[20, -0.8], [22.5, -0.8], [23.0, 0.7], [24.5, -0.9], [26, -0.9]]), 0]} />
    </Stage>
  );
};

export const Circle: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const frame = useCurrentFrame();
  return (
    <Stage>
      <SeatedWorld t={t} cam={[[26.23, 1015, 740, 1.45], [28.71, 1015, 740, 1.5]]} face="worried" look={[lk(t, [[26, 0.8], [27.2, -0.8], [28.2, 0.5], [29, -0.3]]), -0.2]} />
      <g transform={`translate(540 560) rotate(${frame * 3})`} opacity={0.45 * cl(t, 26.6, 27.2)}>
        <circle r={380} fill="none" stroke="#cfe0ff" strokeWidth={8} strokeDasharray="60 36" strokeLinecap="round" />
        <path d="M380 0 l-34 -26 M380 0 l-34 26" stroke="#cfe0ff" strokeWidth={10} strokeLinecap="round" />
      </g>
    </Stage>
  );
};

export const LookDriver: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><SeatedWorld t={t} cam={[[28.71, 1015, 760, 1.25], [30.45, 820, 760, 1.35]]} face="worried" look={[-1, 0]} tilt={-3} /></Stage>;
};

export const Driver1: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><g transform={camT(t, [[30.45, 540, 960, 1.0], [33.45, 470, 1010, 1.22]])}><BusFront roadShift={t * 0.7} /></g></Stage>;
};

export const FigureShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const op = cl(t, 35.3, 35.95);
  return (
    <Stage>
      <ExtView t={t} cam={[[33.45, 500, 340, 1.9], [36.54, 420, 352, 2.7]]} lampLit={0.85}
        figure={<g opacity={op}><Double shade={0.94} face="calm" /></g>} />
    </Stage>
  );
};

export const HoodieFig: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <ExtView t={t} cam={[[36.54, 395, 372, 3.6], [38.41, 395, 410, 4.4]]} lampLit={0.8} figure={<Double shade={0.5} face="calm" />} />
    </Stage>
  );
};

export const HoodieHero: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><SeatedWorld t={t} cam={[[38.41, 1015, 880, 1.7], [40.03, 1015, 860, 1.9]]} face="worried" look={[0, 1]} arm={70} /></Stage>;
};

export const Reveal: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const frame = useCurrentFrame();
  const lit = cl(t, EV.lightOnFace - 0.2, EV.lightOnFace + 0.6);
  const bob = t > 40.3 && t < 41.8 ? Math.sin((t - 40.3) * 9) * 14 * (1 - cl(t, 40.3, 41.8)) : 0;
  const bus = t < 41.0 ? {x: lk(t, [[40.03, 120], [40.9, 300]]), wheel: frame * 6} : null;
  return (
    <Stage>
      <ExtView t={t} cam={[[40.03, 395, 400, 3.2], [41.8, 395, 358, 7.5], [43.86, 395, 350, 9.5]]} lampLit={0.55 + 0.45 * lit} bob={bob}
        figure={<Double shade={0.8 * (1 - lit)} face="calm" />}>
        <circle cx={395} cy={349} r={80} fill="url(#warmFace)" opacity={0.55 * lit} />
      </ExtView>
    </Stage>
  );
};

/* ---------- крупные планы героя на фоне окна ---------- */
export const CloseBg: React.FC<{t: number}> = ({t}) => (
  <g>
    <g transform={camT(t, [[0, 1000, 700, 1.5], [200, 1000, 700, 1.5]])}><BusWall streetX={streetXAt(t) } lights={0.8} /></g>
    <rect width={1080} height={1920} fill="#060a18" opacity={0.4} />
  </g>
);
export const Chill: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const sc = lk(t, [[43.86, 2.3], [46.11, 2.6]]);
  return (
    <Stage>
      <CloseBg t={t} />
      <Hero id="hc" x={540} y={900} scale={sc} anchor={[505, 300]} legs={false} face="surprised" face2="scared" faceMix={cl(t, 44.0, 44.9)} look={[0, 0]} armL={80} armR={80} bodyBob={Math.sin(t * 40) * 1.5} />
    </Stage>
  );
};

const Ring: React.FC<{cx: number; cy: number; on: number; kind: 'hair' | 'eyes'}> = ({cx, cy, on, kind}) => (
  <g opacity={on}>
    {kind === 'eyes' ? <rect x={cx - 128} y={cy + 12} width={256} height={96} rx={48} fill="none" stroke="#ffd23f" strokeWidth={9} />
      : <path d={`M${cx - 215} ${cy - 40} Q${cx - 215} ${cy - 236} ${cx} ${cy - 236} Q${cx + 215} ${cy - 236} ${cx + 215} ${cy - 40}`} fill="none" stroke="#ffd23f" strokeWidth={9} strokeLinecap="round" />}
  </g>
);
export const Compare: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const hair = t >= EV.q * 0 + 47.2 ? 1 : 0, eyes = t >= 48.2 ? 1 : 0;
  const panel = (id: string, y: number, bg: string) => (
    <clipPath id={id}><rect x={60} y={y} width={960} height={620} rx={40} /></clipPath>
  );
  return (
    <Stage>
      <rect width={1080} height={1920} fill="#0a1024" />
      {panel('cmpA', 150, '')}{panel('cmpB', 800, '')}
      <g clipPath="url(#cmpA)">
        <rect x={60} y={150} width={960} height={620} fill="#18264f" />
        <Hero id="cA" x={540} y={500} scale={2} anchor={[505, 200]} legs={false} face="scared" look={[0, 0]} armL={80} armR={80} />
      </g>
      <g clipPath="url(#cmpB)">
        <rect x={60} y={800} width={960} height={620} fill="#3a3040" />
        <circle cx={540} cy={1000} r={380} fill="#ffcf70" opacity={0.18} />
        <Hero id="cB" x={540} y={1150} scale={2} anchor={[505, 200]} legs={false} face="calm" look={[0, 0]} armL={80} armR={80} blinkSeed={40} />
      </g>
      <Ring cx={540} cy={500 + 0} on={hair} kind="hair" /><Ring cx={540} cy={500 + 0} on={eyes} kind="eyes" />
      <Ring cx={540} cy={1150} on={hair} kind="hair" /><Ring cx={540} cy={1150} on={eyes} kind="eyes" />
      <g transform="translate(540 785)"><circle r={50} fill="#ffd23f" /><text y={20} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill="#0b1026">=</text></g>
      <g transform="translate(150 200)"><rect x={-50} y={-30} width={100} height={60} rx={30} fill="#0b1026" opacity={0.8} /><text y={14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#ffd23f">Я</text></g>
      <g transform="translate(150 850)"><rect x={-50} y={-30} width={100} height={60} rx={30} fill="#0b1026" opacity={0.8} /><text y={14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill="#ffd23f">ОН</text></g>
    </Stage>
  );
};

export const StainShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const frame = useCurrentFrame();
  const glow = cl(t, 50.0, 50.4);
  const S = 4.2, ox = 215, oy = 330;
  const strip = (y: number, id: string, label: string, bg: string) => (
    <g>
      <clipPath id={id}><rect x={65} y={y} width={950} height={344} rx={34} /></clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={65} y={y} width={950} height={344} fill={bg} />
        <g transform={`translate(${65 - ox * S} ${y - oy * S}) scale(${S})`}><LeftArmStrip glow={glow} frame={frame} /></g>
      </g>
      <rect x={65} y={y} width={950} height={344} rx={34} fill="none" stroke="#6c7bb8" strokeWidth={4} />
      <g transform={`translate(150 ${y + 44})`}><rect x={-50} y={-30} width={100} height={60} rx={30} fill="#0b1026" opacity={0.85} /><text y={14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={38} fill="#ffd23f">{label}</text></g>
    </g>
  );
  return (
    <Stage>
      <rect width={1080} height={1920} fill="#0a1024" />
      {strip(330, 'stA', 'Я', '#18264f')}
      {strip(790, 'stB', 'ОН', '#3a3040')}
      <g transform="translate(540 732)"><circle r={50} fill="#ffd23f" /><text y={20} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill="#0b1026">=</text></g>
    </Stage>
  );
};

export const Stare: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <ExtView t={t} cam={[[52.81, 395, 350, 8.5], [54.89, 395, 350, 10.5]]} figure={<Double shade={0} face="calm" look={[0, 0]} />}>
        <circle cx={395} cy={349} r={80} fill="url(#warmFace)" />
      </ExtView>
    </Stage>
  );
};

export const PhoneRaise: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const arm = lk(t, [[0, 84], [55.3, 84], [56.9, 40], [99, 40]]);
  const elb = lk(t, [[0, 7], [55.3, 7], [56.9, -95], [99, -95]]);
  return (
    <Stage>
      <ExtView t={t} cam={[[54.89, 420, 360, 3.0], [58.38, 440, 360, 3.5]]}
        figure={<Double shade={0} face="calm" armR={arm} elbowR={elb} extraArmR={phoneSprite(arm, t > 56.5 ? 1 : 0.3)} />} />
    </Stage>
  );
};

const pop = (frame: number, fps: number, s: number) => spring({frame: frame - s * fps, fps, config: {damping: 13, stiffness: 120}});
const PhoneBg: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill="#0a1024" />
    <circle cx={540} cy={760} r={620} fill="#1d2c5c" opacity={0.55} />
  </g>
);
export const Phone1: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const sc = 1.0 + 0.25 * pop(frame, fps, 0.05);
  const show = t >= EV.msg1 - 0.1;
  return (
    <Stage>
      <PhoneBg />
      <Phone x={540} y={790} scale={sc} msg={show ? {text: 'НЕ ВЫХОДИ'} : undefined} typing={t > 58.8 ? t : 0} />
    </Stage>
  );
};

export const Driver2: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const turn = lk(t, [[0, 0], [63.5, 0], [64.3, -5], [99, -5]]);
  return <Stage><g transform={camT(t, [[61.39, 540, 960, 1.0], [64.79, 480, 1000, 1.15]])}><BusFront headTurn={turn} /></g></Stage>;
};

const outsideDbl = <Double k={0.5} shade={0.8} face="calm" />;
export const DoorShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const open = ramp(t, EV.doorOpen, EV.doorOpen + 0.9);
  return (
    <Stage>
      <g transform={camT(t, [[64.79, 540, 960, 1.0], [66.25, 640, 900, 1.3]])}>
        <BusFront doorOpen={open} outside={outsideDbl} streetX={FIGURE_X - 60} />
      </g>
    </Stage>
  );
};

const StandWorld: React.FC<{t: number; cam: [number, number, number, number][]; face: any; face2?: any; mix?: number; look?: [number, number]; armR?: number; reflection?: number; lights?: number; tilt?: number; zoomDriver?: boolean}> = ({t, cam, face, face2, mix = 0, look = [0, 0], armR = 84, reflection = 0, lights = 1, tilt = 0}) => (
  <g transform={camT(t, cam)}>
    <BusWall streetX={2311} doorOpen={1} doorOutside={<Double k={0.5} shade={0.8} face="calm" />} lights={lights}
      windowOverlay={reflection > 0 ? (
        <g opacity={0.5 * reflection}>
          <Hero id="refl" x={HERO_SEAT.x} y={HERO_SEAT.hipY} scale={1.4} anchor={[505, 575]} legs={false} armL={70} armR={70} face="tired" shade={0.35} shadeColor={[0.25, 0.45, 0.85]} stain={true} />
        </g>
      ) : undefined} />
    <Hero id="hst" x={650} y={1500} scale={1.15} anchor={[505, 930]} armL={84} armR={armR} face={face} face2={face2} faceMix={mix} look={look} tilt={tilt} />
    <SeatFronts />
  </g>
);
export const StandLook: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><StandWorld t={t} cam={[[66.25, 560, 940, 1.15], [67.67, 520, 940, 1.3]]} face="worried" look={[-1, 0]} /></Stage>;
};

export const Hands: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const g = cl(t, 70.3, 70.8) * (t < 72.4 ? 1 : 0);
  return (
    <Stage>
      <g transform={camT(t, [[67.67, 540, 1000, 1.05], [69.6, 420, 1150, 1.3], [72.47, 420, 1230, 1.65]])}>
        <BusFront doorOpen={1} handsGlow={g} outside={outsideDbl} streetX={FIGURE_X - 60} />
      </g>
    </Stage>
  );
};

export const ShakeShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const sh = t > EV.shake && t < EV.shake + 1.2 ? Math.sin((t - EV.shake) * 16) : 0;
  return (
    <Stage>
      <ExtView t={t} cam={[[72.47, 420, 360, 4.8], [75.45, 420, 360, 5.4]]}
        figure={<Double shade={0} face="worried" tilt={sh * 14} look={[sh * 0.8, 0]} armR={40} elbowR={-100} extraArmR={phoneSprite(40, 1)} />} />
      {WINDOW_FRAME}
    </Stage>
  );
};

export const TypingShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <ExtView t={t} cam={[[75.45, 425, 355, 5.6], [77.3, 430, 350, 6.2]]}
        figure={<Double shade={0} face="worried" look={[0, 0.9]} tilt={Math.sin(t * 9) * 1.5} armR={45} elbowR={-115} extraArmR={phoneSprite(45, 0.5 + 0.5 * Math.sin(t * 30) ** 2)} />} />
      {WINDOW_FRAME}
    </Stage>
  );
};

export const Phone2: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const started = [193, 194, 195, 196].filter((i) => t >= WORDS[i].s - 0.05).map((i) => WORDS[i].text.replace(/[«»".]/g, ''));
  const txt = started.join(' ').toUpperCase();
  const sc = 1.0 + 0.2 * pop(frame, fps, 0.05);
  return (
    <Stage>
      <PhoneBg />
      <Phone x={540} y={790} scale={sc} msg={txt ? {text: txt} : undefined} typing={!txt ? t : 0} />
    </Stage>
  );
};

export const Empty: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lx = lk(t, [[79.9, -1], [81.5, 1], [83.0, -0.4], [84.6, 0.8]]);
  return <Stage><StandWorld t={t} cam={[[79.91, 700, 900, 0.85], [84.64, 780, 900, 0.95]]} face="worried" face2="scared" mix={cl(t, 82.5, 83.8)} look={[lx, 0]} /></Stage>;
};

export const ReflectionShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const refl = ramp(t, 86.3, 87.9);
  const arm = lk(t, [[0, 84], [90.9, 84], [91.4, 35], [91.9, 60], [92.4, 35], [93, 84]]);
  const lights = t > 90.2 && t < 91.4 ? (Math.sin(t * 60) > 0.2 ? 1 : 0.5) : 1;
  const f1 = t < 86.6 ? 'worried' : t < 90 ? 'surprised' : 'scared';
  return (
    <Stage>
      <StandWorld t={t} cam={[[84.64, 850, 900, 0.9], [88.0, 800, 900, 0.95], [90.0, 860, 880, 1.0], [93.37, 880, 880, 1.05]]}
        face={f1} look={[lk(t, [[84, 0.5], [86.5, 0.9], [88, 0.9], [89.5, 0.9]]), 0]} armR={arm} reflection={refl} lights={lights} />
    </Stage>
  );
};

/* ---------- финальные крупные планы: рука на плече ---------- */
export const UnknownHand: React.FC<{p: number; x: number; y: number}> = ({p, x, y}) => (
  <g transform={`translate(${x + (1 - p) * 420} ${y - (1 - p) * 320})`} opacity={clamp(p * 3)}>
    <path d="M60 -20 L520 -330" stroke="#0d101c" strokeWidth={150} strokeLinecap="round" />
    <path d="M60 -20 L520 -330" stroke="#1a1f33" strokeWidth={12} strokeLinecap="round" transform="translate(-40 -10)" opacity={0.7} />
    <ellipse cx={-6} cy={34} rx={96} ry={30} fill="#000" opacity={0.28} />
    <g transform="rotate(-18)">
      <rect x={-8} y={-52} width={92} height={104} rx={40} fill="#cdbcb4" stroke="#8f7f79" strokeWidth={3} />
      {[-40, -14, 12, 38].map((fy, i) => <rect key={i} x={-104} y={fy - 12} width={118} height={26} rx={13} fill="#cdbcb4" stroke="#8f7f79" strokeWidth={3} />)}
      <rect x={70} y={-60} width={46} height={120} rx={14} fill="#0d101c" />
    </g>
  </g>
);
const HeroClose: React.FC<{t: number; face: any; face2?: any; mix?: number; look: [number, number]; hand: number; tilt?: number; tremble?: number}> = ({t, face, face2, mix = 0, look, hand, tilt = 0, tremble = 0}) => (
  <Stage>
    <CloseBg t={t} />
    <Hero id="hz" x={540} y={880} scale={2.2} anchor={[505, 300]} legs={false} face={face} face2={face2} faceMix={mix} look={look} tilt={tilt} armL={80} armR={80} bodyBob={Math.sin(t * 50) * tremble} />
    {hand > 0 && <UnknownHand p={hand} x={668} y={1020} />}
  </Stage>
);
export const ShoulderShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <HeroClose t={t} face="scared" look={[0.1, 0]} hand={ramp(t, EV.handWord - 0.1, EV.handWord + 0.5)} tremble={0.8} />;
};
export const Whisper: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lx = lk(t, [[95.97, 0], [97.0, 0.9], [99.6, 0.9], [100.4, 0], [103, 0]]);
  return <HeroClose t={t} face="scared" look={[lx, 0.15]} hand={1} tilt={lk(t, [[96, 0], [99.5, -2], [101, -2]])} tremble={1.2} />;
};
export const FinalShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <HeroClose t={t} face="scared" look={[0.2, 0.1]} hand={1} tremble={1.0} />;
};

export const SHOT_COMPONENTS: Record<string, React.FC<P>> = {
  intro: Intro, seat: Seat, window1: Window1, window2: Window2, circle: Circle, lookDriver: LookDriver, driver1: Driver1,
  figure: FigureShot, hoodieFig: HoodieFig, hoodieHero: HoodieHero, reveal: Reveal, chill: Chill, compare: Compare, stain: StainShot,
  stare: Stare, phoneRaise: PhoneRaise, phone1: Phone1, driver2: Driver2, door: DoorShot, standLook: StandLook, hands: Hands,
  shake: ShakeShot, typing: TypingShot, phone2: Phone2, empty: Empty, reflection: ReflectionShot, shoulder: ShoulderShot,
  whisper: Whisper, final: FinalShot,
};
export const _S = SHOTS;
