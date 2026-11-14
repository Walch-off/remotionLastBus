import React from 'react';
import {useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Hero} from '../components/Hero';
import {BusWall, SeatFronts, BusFront} from '../components/Interior';
import {Phone} from '../components/Phone';
import {AisleView} from '../components/Aisle';
import {WetPalm, ReachArm} from '../components/Palm';
import {FIGURE_X} from '../components/Street';
import {camT, clamp, lin, ramp, useT, SKIN} from '../common';
import {Stage, ExtView, Double, phoneSprite, lk, WINDOW_FRAME} from '../scenes/parts';
import {CloseBg, UnknownHand} from '../scenes/Shots';
import {E2, WORDS2} from './story2';

type P = {t0: number};
const cl = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
type Cam = [number, number, number, number][];

/* ---------- состояния, зависящие от сюжета ---------- */
const printsAt = (t: number) => ({a: ramp(t, 33.5, 34.3), b: ramp(t, 96.4, 97.2)});
const reflAt = (t: number) => ({
  op: ramp(t, 36.6, 37.7) * (1 - ramp(t, 87.6, 88.4)),
  turn: -1 * ramp(t, E2.reflLook, E2.reflLook + 0.9),
  look: [-0.25 - 0.75 * ramp(t, E2.reflLook, E2.reflLook + 0.6), 0.1 * ramp(t, E2.reflLook, E2.reflLook + 0.6)] as [number, number],
  finger: ramp(t, E2.fingerUp - 0.3, E2.fingerUp + 0.55) * (1 - ramp(t, 52.45, 52.8)),
  stand: ramp(t, 52.9, 54.0),
});
type Refl = ReturnType<typeof reflAt>;

const ReflFigure: React.FC<{r: Refl}> = ({r}) => {
  const fingerArm = {armR: 84 + (-55 - 84) * r.finger, elbowR: 7 + (-139 - 7) * r.finger};
  return (
    <g opacity={0.5 * r.op}>
      <Hero id="refl" x={1015} y={900 - 120 * r.stand} scale={0.9} anchor={[505, 575]} legs={r.stand > 0.5} armL={70} armR={fingerArm.armR} elbowL={7} elbowR={fingerArm.elbowR}
        face="calm" look={r.look} turn={r.turn} shade={0.35} shadeColor={[0.25, 0.45, 0.85]} blinkSeed={60}
        extraArmR={r.finger > 0.5 ? <g><ellipse cx={14} cy={20} rx={24} ry={28} fill={SKIN} stroke="#d49a6e" strokeWidth={2} /><rect x={-30} y={-40} width={17} height={70} rx={8.5} fill={SKIN} stroke="#d49a6e" strokeWidth={2} /></g> : undefined} />
    </g>
  );
};

export const GlassDrops: React.FC = () => {
  const frame = useCurrentFrame();
  const d = [[170, 420, 9, 0], [820, 560, 7, 5], [300, 900, 8, 11], [900, 980, 10, 3], [640, 360, 6, 8], [210, 1150, 7, 1], [760, 1180, 9, 14]];
  return (
    <g opacity={0.5}>
      {d.map(([x, y, r, ph], i) => {
        const slide = ((frame + ph * 6) % 160) / 160 * 80;
        return <g key={i}><ellipse cx={x} cy={y + slide} rx={r} ry={r * 1.4} fill="#cfe6ff" opacity={0.35} /><path d={`M${x} ${y} v${slide}`} stroke="#cfe6ff" strokeWidth={2} opacity={0.18} /></g>;
      })}
    </g>
  );
};
export const Frame2 = <g>{WINDOW_FRAME}<GlassDrops /></g>;

const Memory: React.FC = () => (
  <g pointerEvents="none">
    <rect width={1080} height={1920} fill="#9db4e8" opacity={0.1} />
    <rect x={0} y={0} width={1080} height={110} fill="#05070f" opacity={0.55} /><rect x={0} y={1810} width={1080} height={110} fill="#05070f" opacity={0.55} />
  </g>
);

/* ---------- салон: вид вдоль стены (герой стоит, отражение в окне) ---------- */
type WV = {
  t: number; cam: Cam; heroX?: number; face: any; face2?: any; mix?: number; look?: [number, number]; turn?: number; tilt?: number;
  prints?: {a?: number; b?: number}; printGlow?: string; refl?: Refl | null; dim?: number; lights?: number; doorOpen?: number;
  doorOutside?: React.ReactNode; reach?: number; sill?: number; vib?: number; armR?: number; elbowR?: number;
};
const WVWorld: React.FC<WV> = ({t, cam, heroX = 650, face, face2, mix = 0, look = [0, 0], turn = 0, tilt = 0, prints, printGlow, refl, dim = 0, lights = 1, doorOpen = 1, doorOutside, reach = 0, sill = 0, vib = 0, armR = 84, elbowR = 7}) => {
  const frame = useCurrentFrame();
  const sh = vib > 0 ? Math.sin(frame * 2.3) * 1.6 * vib : 0;
  return (
    <g transform={camT(t, cam)}>
      <g transform={`translate(0 ${sh})`}>
        <BusWall streetX={2311} doorOpen={doorOpen} doorOutside={doorOutside} lights={lights}
          windowOverlay={refl && refl.op > 0.01 ? <ReflFigure r={refl} /> : undefined} />
        <SeatFronts />
        <Hero id="hst" x={heroX} y={1500} scale={1.15} anchor={[505, 930]} armL={84} armR={armR} elbowR={elbowR} face={face} face2={face2} faceMix={mix} look={look} turn={turn} tilt={tilt}
          prints={prints ?? printsAt(t)} printGlow={printGlow as any} />
        {sill > 0 && <rect x={330} y={1282} width={230} height={14} rx={6} fill="#ffd25a" opacity={sill * (0.5 + 0.4 * Math.sin(frame / 6))} />}
        <ReachArm x0={470} y={754} len={reach} />
        {dim > 0 && <rect x={-400} y={-900} width={2500} height={3600} fill="#040714" opacity={dim} />}
      </g>
    </g>
  );
};
const dblOut = (face: any = 'worried', armR = 84) => <Double k={0.5} shade={0} face={face} armR={armR} />;

/* ---------- крупный план героя ---------- */
type CU = {t: number; cam?: Cam; face: any; face2?: any; mix?: number; look?: [number, number]; turn?: number; tilt?: number; hand?: number; handOp?: number; prints?: {a?: number; b?: number}; printGlow?: string; tremble?: number; scale?: number};
const CloseUp: React.FC<CU> = ({t, cam, face, face2, mix = 0, look = [0, 0], turn = 0, tilt = 0, hand = 0, handOp = 1, prints, printGlow, tremble = 0.8, scale = 2.2}) => (
  <Stage>
    <CloseBg t={t} />
    <g transform={cam ? camT(t, cam) : undefined}>
      <Hero id="hz" x={540} y={880} scale={scale} anchor={[505, 300]} legs={false} face={face} face2={face2} faceMix={mix} look={look} turn={turn} tilt={tilt} armL={80} armR={80}
        prints={prints ?? printsAt(t)} printGlow={printGlow as any} bodyBob={Math.sin(t * 50) * tremble} />
      {hand > 0 && <g opacity={handOp}><UnknownHand p={hand} x={668} y={1020} /></g>}
    </g>
  </Stage>
);

const pop = (frame: number, fps: number, s: number) => spring({frame: frame - s * fps, fps, config: {damping: 13, stiffness: 120}});
const PhoneBg: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill="#0a1024" />
    <circle cx={540} cy={760} r={620} fill="#1d2c5c" opacity={0.55} />
  </g>
);
const upper = (s: string) => s.replace(/[«».]/g, '').toUpperCase();

/* ================= ПЛАНЫ ================= */
export const Vote: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <CloseUp t={t} cam={[[0, 540, 960, 1.0], [5.24, 540, 930, 1.12]]} face="worried" face2="scared" mix={cl(t, 0.5, 2.5)} look={[0.1, 0]} hand={1} prints={{}} tremble={0.9} />;
};

export const Recall1: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const frame = useCurrentFrame();
  return (
    <Stage>
      <ExtView t={t} cam={[[5.24, 540, 330, 1.75], [8.3, 520, 340, 1.9]]} bus={{x: lk(t, [[5.24, -950], [8.3, 1400]]), wheel: frame * 14}} figure={<Double shade={0.93} face="calm" />} />
      <Memory />
    </Stage>
  );
};
export const Recall2: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <ExtView t={t} cam={[[8.3, 395, 352, 3.6], [10.4, 395, 350, 5.4]]} lampLit={0.9} figure={<Double shade={Math.max(0, 0.5 * (1 - cl(t, 8.3, 9.6)))} face="calm" />} />
      <Memory />
    </Stage>
  );
};
export const Recall3: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const show = t >= E2.phoneNoExit - 0.05;
  return (
    <Stage>
      <PhoneBg />
      <Phone x={540} y={790} scale={1.0 + 0.25 * pop(frame, fps, 0.1)} msg={show ? {lines: ['НЕ', 'ВЫХОДИ'], text: 'НЕ ВЫХОДИ', fontSize: 64} : undefined} typing={t > 11.0 ? t : 0} />
      <Memory />
    </Stage>
  );
};

export const HandBack: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <CloseUp t={t} cam={[[12.84, 540, 960, 1.0], [18.5, 560, 930, 1.1]]} face="worried" face2="scared" mix={cl(t, 14.2, 15.2)} look={[0, 0]} hand={ramp(t, E2.handIn - 0.25, E2.handIn + 0.5)} prints={{}} tremble={1.0} />;
};

export const Turn: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const turn = 0.95 * ramp(t, 19.6, 21.4);
  return <CloseUp t={t} cam={[[18.5, 560, 930, 1.1], [21.9, 560, 900, 1.2]]} face="scared" face2="worried" mix={cl(t, 19.4, 21.0)} look={[0.2 + 0.8 * ramp(t, 19.6, 21.0), 0]} turn={turn} tilt={5 * ramp(t, 19.6, 21.4)} hand={1} prints={{}} tremble={0.4} />;
};

export const Aisle: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <g transform={camT(t, [[21.9, 540, 800, 1.0], [28.33, 540, 800, 1.3]])}>
        <AisleView flicker={ramp(t, E2.flick - 0.3, E2.flick + 0.4)} />
      </g>
    </Stage>
  );
};

export const Vanish: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const turn = 0.95 * (1 - ramp(t, 28.4, 29.3));
  return <CloseUp t={t} cam={[[28.33, 560, 900, 1.2], [32.05, 600, 950, 1.35]]} face="worried" look={[0.8 * (1 - ramp(t, 28.4, 29.3)), 0.1]} turn={turn} tilt={5 * (1 - ramp(t, 28.4, 29.3))} hand={1} handOp={1 - ramp(t, E2.handGone - 0.05, E2.handGone + 0.45)} prints={{}} tremble={0.7} />;
};

export const Print1: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const pr = printsAt(t);
  return <CloseUp t={t} cam={[[32.05, 560, 950, 1.35], [33.6, 700, 1090, 2.3], [35.22, 700, 1090, 2.6]]} face="worried" look={[0.7, 0.8]} turn={0.2} prints={{a: pr.a}} printGlow={t > 34.4 ? 'a' : undefined} tremble={0.4} />;
};

export const ReflSeat: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const turnBack = ramp(t, 40.4, 41.2);
  const face = t < 41.5 ? 'worried' : 'scared';
  return (
    <Stage>
      <WVWorld t={t} cam={[[35.22, 850, 900, 0.9], [40.5, 850, 900, 0.95], [43.4, 640, 900, 1.0]]} face={face}
        turn={0.55 * ramp(t, 35.6, 36.4) * (1 - turnBack)} look={[0.9 * (1 - turnBack) , 0]} refl={reflAt(t)} />
    </Stage>
  );
};

export const DriverKnees: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const g = cl(t, 45.7, 46.2) * (t < 47.0 ? 1 : 0);
  return (
    <Stage>
      <g transform={camT(t, [[43.4, 540, 1000, 1.0], [45.5, 420, 1150, 1.3], [47.13, 420, 1230, 1.55]])}>
        <BusFront doorOpen={1} handsGlow={g} outside={<Double k={0.5} shade={0} face="calm" />} streetX={FIGURE_X - 60} />
      </g>
    </Stage>
  );
};

export const Call: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WVWorld t={t} cam={[[47.13, 700, 900, 1.2], [49.5, 700, 880, 1.28]]} face="surprised" look={[-1, 0]} turn={-0.6} refl={reflAt(t)} />
    </Stage>
  );
};

export const Shush: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WVWorld t={t} cam={[[49.5, 850, 800, 1.2], [52.41, 880, 780, 1.38]]} face="scared" look={[0.5, 0]} turn={0.3} refl={reflAt(t)} />
    </Stage>
  );
};

export const Stand: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WVWorld t={t} cam={[[52.41, 880, 780, 1.38], [54.0, 850, 830, 1.0], [55.59, 850, 870, 0.92]]} face="scared" look={[0.5, 0]} turn={0.3} refl={reflAt(t)} />
    </Stage>
  );
};

export const Recoil: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const r = ramp(t, 55.9, 56.7);
  return (
    <Stage>
      <WVWorld t={t} cam={[[55.59, 800, 900, 0.95], [58.2, 720, 900, 1.0]]} heroX={650 - 90 * r} face="scared" look={[0.8 * (1 - r) - 0.6 * r, 0]} turn={0.3 * (1 - r)} tilt={-7 * r} refl={reflAt(t)} />
    </Stage>
  );
};

export const Knock: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const bump = [58.4, 58.85, 59.25].reduce((a, k) => a + Math.max(0, 1 - Math.abs(t - k) / 0.1), 0);
  const phone = t > 59.5;
  const press = ramp(t, 59.6, 60.2);
  return (
    <Stage>
      <ExtView t={t} cam={[[58.2, 420, 352, 5.0], [62.23, 420, 352, 5.8]]}
        figure={<Double shade={0} face="worried" look={[0, 0]} armR={55 - 10 * press} elbowR={-95 - 22 * bump * (phone ? 0 : 1)} extraArmR={phone ? <g transform={`scale(${1 + 0.25 * press})`}>{phoneSprite(40, 1)}</g> : undefined} />} />
      {Frame2}
    </Stage>
  );
};

export const MsgA: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const ids = [162, 163, 164];
  const lines = ['ОНО', 'УВИДЕЛО', 'ТЕБЯ'].filter((_, i) => t >= WORDS2[ids[i]].s - 0.05);
  return (
    <Stage>
      <PhoneBg />
      <Phone x={540} y={790} scale={1.0 + 0.22 * pop(frame, fps, 0.05)} msg={lines.length ? {lines, text: lines.join(' '), fontSize: 60} : undefined} typing={!lines.length ? t : 0} />
      <GlassDrops />
    </Stage>
  );
};

export const DrvLift: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <g transform={camT(t, [[65.56, 540, 960, 1.0], [68.49, 480, 900, 1.12]])}>
        <BusFront doorOpen={1} lift={ramp(t, 66.4, 68.3)} mirrorFace={0} outside={dblOut('worried')} streetX={FIGURE_X - 60} />
      </g>
    </Stage>
  );
};

export const Mirror: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <g transform={camT(t, [[68.49, 480, 900, 1.12], [69.9, 415, 460, 2.0], [71.2, 415, 335, 3.5], [73.21, 415, 335, 3.9]])}>
        <BusFront doorOpen={1} lift={1} mirrorFace={ramp(t, E2.mirrorFace - 0.15, E2.mirrorFace + 0.45)} outside={dblOut('worried')} streetX={FIGURE_X - 60} />
      </g>
    </Stage>
  );
};

export const ToDoor: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WVWorld t={t} cam={[[73.21, 640, 900, 1.0], [76.45, 520, 900, 1.25]]} face="worried" look={[-1, 0]} turn={-0.8 * ramp(t, 73.6, 74.4)} doorOutside={dblOut('worried')} refl={reflAt(t)} />
    </Stage>
  );
};

export const Step: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WVWorld t={t} cam={[[76.45, 520, 900, 1.25], [79.0, 480, 1050, 1.7]]} heroX={650 - 30 * ramp(t, 77.0, 78.4)} face="worried" look={[-1, 0.3]} turn={-0.8} doorOutside={dblOut('worried')} sill={ramp(t, 77.2, 77.9)} refl={reflAt(t)} />
    </Stage>
  );
};

export const Typing: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <ExtView t={t} cam={[[79.0, 425, 355, 5.2], [81.98, 430, 350, 6.0]]}
        figure={<Double shade={0} face="worried" look={[0, 0.9]} tilt={Math.sin(t * 9) * 1.5} armR={45} elbowR={-115} extraArmR={phoneSprite(45, 0.5 + 0.5 * Math.sin(t * 30) ** 2)} />} />
      {Frame2}
    </Stage>
  );
};

export const MsgB: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const groups = [[206, 207], [208, 209], [210], [211, 212]];
  const lines = groups.map((g) => g.filter((i) => t >= WORDS2[i].s - 0.05).map((i) => upper(WORDS2[i].text)).join(' ')).filter((l) => l);
  return (
    <Stage>
      <PhoneBg />
      <Phone x={540} y={790} scale={1.0 + 0.2 * pop(frame, fps, 0.05)} msg={lines.length ? {lines, text: lines.join(' '), fontSize: 38} : undefined} typing={!lines.length ? t : 0} />
    </Stage>
  );
};

export const LightsOut: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const flick = t > 85.9 && t < E2.lightsOut ? (Math.sin(t * 70) > 0 ? 1 : 0.35) : 1;
  return (
    <Stage>
      <WVWorld t={t} cam={[[85.38, 800, 900, 0.95], [87.25, 800, 900, 1.0]]} face="scared" look={[0.4, 0]} turn={0.2} doorOutside={dblOut('worried')} refl={reflAt(t)}
        lights={flick} dim={0.72 * ramp(t, E2.lightsOut, E2.lightsOut + 0.35)} />
    </Stage>
  );
};

export const Dark: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WVWorld t={t} cam={[[87.25, 850, 850, 1.0], [91.47, 980, 760, 1.25]]} face="scared" look={[0.8, 0]} turn={0.3} doorOutside={dblOut('worried')} refl={reflAt(t)} lights={0} dim={0.72} />
    </Stage>
  );
};

export const LightsOn: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const flick = t > E2.lightsOn && t < 93.3 ? (Math.sin(t * 55) > -0.1 ? 1 : 0.2) : 1;
  const on = t > E2.lightsOn ? 1 : 0;
  const dim = 0.72 * (1 - ramp(t, E2.lightsOn, E2.lightsOn + 0.9)) + (flick < 0.5 ? 0.3 : 0) * (on && t < 93.3 ? 1 : 0);
  return (
    <Stage>
      <WVWorld t={t} cam={[[91.47, 980, 760, 1.25], [93.5, 1015, 720, 1.45], [94.67, 1015, 720, 1.5]]} face="scared" look={[0.8, 0]} turn={0.3} doorOutside={dblOut('worried')} refl={null}
        lights={on ? flick : 0} dim={Math.min(0.75, dim)} />
    </Stage>
  );
};

export const Print2: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const pr = printsAt(t);
  return (
    <CloseUp t={t} cam={[[94.67, 540, 960, 1.0], [96.0, 540, 1000, 1.5], [98.0, 420, 1100, 2.2], [99.21, 420, 1100, 2.3]]} face="scared" look={[-0.4, 0.5]} prints={{a: 1, b: pr.b}} printGlow={t > 97.3 ? 'b' : undefined} tremble={0.6} />
  );
};

export const Voice: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lx = lk(t, [[99.2, 0], [101.2, -0.9], [102.8, 0.9], [104.0, 0]]);
  return <CloseUp t={t} cam={[[99.21, 540, 960, 1.2], [104.57, 540, 930, 1.05]]} face="scared" look={[lx, 0.1]} prints={{a: 1, b: 1}} tremble={1.4} />;
};

export const Key: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const engine = ramp(t, E2.engine, E2.engine + 0.7);
  const vib = t >= E2.engine ? Math.max(0, 1 - (t - E2.engine) / 1.6) : 0;
  const door = 1 - 0.5 * ramp(t, E2.doors, E2.doors + 1.5);
  return (
    <Stage>
      <g transform={camT(t, [[104.57, 540, 960, 1.0], [105.2, 430, 1130, 1.5], [106.8, 430, 1130, 1.5], [107.6, 800, 900, 1.2], [109.31, 880, 850, 1.28]])}>
        <BusFront doorOpen={door} lift={1} mirrorFace={0} keyT={ramp(t, 104.9, 105.7)} keyTurn={ramp(t, 105.7, 106.1)} engine={engine} vib={vib} outside={dblOut('worried')} streetX={FIGURE_X - 60} />
      </g>
    </Stage>
  );
};

export const Reach: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const arm = 84 - 84 * ramp(t, 110.5, 111.3);
  return (
    <Stage>
      <WVWorld t={t} cam={[[109.31, 600, 900, 0.95], [111.9, 560, 880, 1.2]]} heroX={760} face="scared" look={[-1, 0]} turn={-0.7} doorOpen={0.5 - 0.06 * lin(t, 109.3, 111.9)} doorOutside={dblOut('worried', arm)}
        reach={170 * ramp(t, E2.reach - 0.2, E2.reach + 0.8)} vib={0.5} prints={{a: 1, b: 1}} />
    </Stage>
  );
};

export const Palm: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const py = 1500 - 720 * ramp(t, 112.0, 113.4);
  const sc = 1.45 + 0.2 * ramp(t, E2.palm - 0.2, 114.8);
  return (
    <Stage>
      <PhoneBg />
      <WetPalm x={540} y={py} scale={sc} t={t} />
    </Stage>
  );
};

export const Final2: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const wob = Math.sin(t * 7) * 3;
  return (
    <Stage>
      <WVWorld t={t} cam={[[114.8, 600, 745, 0.85], [126.73, 600, 745, 0.85]]} heroX={760} face="scared" look={[-1, 0]} turn={-0.7} doorOpen={0.44 - 0.1 * lin(t, 114.8, 126.7)}
        doorOutside={dblOut('worried', 0)} reach={170 + wob} vib={0.5} prints={{a: 1, b: 1}} />
    </Stage>
  );
};

export const SHOTS2_COMPONENTS: Record<string, React.FC<P>> = {
  vote: Vote, recall1: Recall1, recall2: Recall2, recall3: Recall3, handBack: HandBack, turn: Turn, aisle: Aisle, vanish: Vanish, print1: Print1,
  reflSeat: ReflSeat, driverKnees: DriverKnees, call: Call, shush: Shush, stand: Stand, recoil: Recoil, knock: Knock, msgA: MsgA, drvLift: DrvLift,
  mirror: Mirror, toDoor: ToDoor, step: Step, typing: Typing, msgB: MsgB, lightsOut: LightsOut, dark: Dark, lightsOn: LightsOn, print2: Print2,
  voice: Voice, key: Key, reach: Reach, palm: Palm, final: Final2,
};
