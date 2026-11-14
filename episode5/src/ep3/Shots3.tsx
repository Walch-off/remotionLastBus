import React from 'react';
import {useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Hero, handPosR} from '../components/Hero';
import {BusWall, SeatFronts, BusFront} from '../components/Interior';
import {FIGURE_X} from '../components/Street';
import {FingerHand, DoubleWithHand, GlassPalm, WindowPOV, DriverProfile, KeyHand, FloorPrints, AisleDark, FogText, BlinkLids} from '../components/Ep3Parts';
import {AisleView} from '../components/Aisle';
import {ReachArm} from '../components/Palm';
import {camT, clamp, lin, ramp, useT} from '../common';
import {Stage, ExtView, Double, lk} from '../scenes/parts';
import {CloseBg} from '../scenes/Shots';
import {Frame2, GlassDrops} from '../ep2/Shots2';
import {E3} from './story3';

type P = {t0: number};
type Cam = [number, number, number, number][];
const cl = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
const HERO_PRINTS = {a: 0.85, b: 0.85};
const dblOut = (face: any = 'worried', armR = 84) => <Double k={0.5} shade={0} face={face} armR={armR} />;
const hand3 = (folds: [number, number, number, number], s = 0.5, op = 1) => <g opacity={op} transform={`translate(0 -34) scale(${s})`}><FingerHand folds={folds} /></g>;

/* ---------- салон (вид вдоль стены) ---------- */
type W3 = {
  t: number; cam: Cam; heroX?: number; face?: any; face2?: any; mix?: number; look?: [number, number]; turn?: number; tilt?: number;
  armR?: number; elbowR?: number; phone?: boolean; beam?: number; dim?: number; lights?: number; doorOpen?: number; doorOutside?: React.ReactNode;
  streetX?: number; poleShake?: number; floorN?: number; refl?: {op: number; point: number} | null; cabMirror?: {face: any} | null;
  driver?: any | null; glassPalm?: number; reach?: number; bob?: number; vib?: number;
};
const WV3: React.FC<W3> = ({t, cam, heroX = 650, face = 'worried', face2, mix = 0, look = [0, 0], turn = 0, tilt = 0, armR = 84, elbowR = 7, phone = false, beam = 0, dim = 0, lights = 1,
  doorOpen = 0, doorOutside, streetX = 2311, poleShake = 0, floorN = 0, refl = null, cabMirror = null, driver = null, glassPalm = 0, reach = 0, bob = 0, vib = 0}) => {
  const frame = useCurrentFrame();
  const sh = vib > 0 ? Math.sin(frame * 2.3) * 1.6 * vib : 0;
  const [hx, hy] = handPosR(armR, elbowR);
  const wx = heroX + (hx - 505) * 1.15, wy = 1500 + (hy - 930) * 1.15;
  return (
    <g transform={camT(t, cam, 540, 960 + bob)}>
      <g transform={`translate(0 ${sh})`}>
        <BusWall streetX={streetX} doorOpen={doorOpen} doorOutside={doorOutside} lights={lights} poleShake={poleShake} driver={!driver}
          windowOverlay={refl && refl.op > 0.01 ? (
            <g opacity={0.5 * refl.op}>
              <Hero id="refl3" x={900} y={960} scale={1.1} anchor={[505, 575]} legs={false} armL={80 - 78 * refl.point} elbowL={0} face="calm" look={[0, 0]} shade={0.35} shadeColor={[0.25, 0.45, 0.85]} blinkSeed={77} />
            </g>
          ) : undefined} />
        {driver && <DriverProfile x={190} y={940} scale={0.8} {...driver} />}
        {cabMirror && (
          <g>
            <clipPath id="cabMirClip"><rect x={112} y={398} width={156} height={64} rx={8} /></clipPath>
            <rect x={106} y={392} width={168} height={76} rx={12} fill="#0b0f1d" stroke="#2f3a5c" strokeWidth={7} />
            <g clipPath="url(#cabMirClip)"><rect x={112} y={398} width={156} height={64} fill="#2a2f4a" /><Hero id="cabm" x={190} y={462} scale={0.3} anchor={[505, 300]} legs={false} face={cabMirror.face} look={[0, 0]} armL={80} armR={80} stain={false} /></g>
          </g>
        )}
        {glassPalm > 0 && <g opacity={glassPalm}><GlassPalm x={445} y={830} scale={0.5} /></g>}
        <Hero id="hst" x={heroX} y={1500} scale={1.15} anchor={[505, 930]} armL={84} armR={armR} elbowR={elbowR} face={face} face2={face2} faceMix={mix} look={look} turn={turn} tilt={tilt}
          prints={HERO_PRINTS}
          extraArmR={phone ? (
            <g>
              <rect x={-40} y={-56} width={82} height={124} rx={12} fill="#07090f" />
              <rect x={-33} y={-49} width={68} height={110} rx={8} fill="#cfe0ff" opacity={0.9} />
              <circle cx={0} cy={-38} r={9} fill="#fff" />
            </g>
          ) : undefined} />
        <SeatFronts />
        <ReachArm x0={470} y={754} len={reach} />
        {(dim > 0 || beam > 0) && (
          <g>
            <defs>
              <linearGradient id="wvBeamG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#6a6a6a" /></linearGradient>
              <mask id="wvMask" maskUnits="userSpaceOnUse" x={-400} y={-900} width={2500} height={3600}>
                <rect x={-400} y={-900} width={2500} height={3600} fill="#fff" />
                {beam > 0 && <polygon points={`${wx},${wy} ${wx + 1100},${wy - 330} ${wx + 1100},${wy + 460}`} fill="url(#wvBeamG)" opacity={beam} />}
                {beam > 0 && <circle cx={heroX} cy={840} r={330} fill="#7a7a7a" opacity={beam} />}
              </mask>
            </defs>
            <rect x={-400} y={-900} width={2500} height={3600} fill="#040714" opacity={Math.max(dim, beam > 0 ? 0.86 : 0)} mask="url(#wvMask)" />
          </g>
        )}
        {floorN > 0 && <FloorPrints n={floorN} xFar={1550} xNear={heroX + 110} y={1590} />}
      </g>
    </g>
  );
};

/* ---------- крупный план героя ---------- */
type CU = {t: number; cam?: Cam; face: any; face2?: any; mix?: number; look?: [number, number]; turn?: number; tilt?: number; dim?: number; tremble?: number; speak?: boolean; scale?: number};
const CU3: React.FC<CU> = ({t, cam, face, face2, mix = 0, look = [0, 0], turn = 0, tilt = 0, dim = 0, tremble = 0.8, speak = false, scale = 2.2}) => (
  <Stage>
    <CloseBg t={t} />
    <g transform={cam ? camT(t, cam) : undefined}>
      <Hero id="hz" x={540} y={880} scale={scale} anchor={[505, 300]} legs={false} face={speak ? 'worried' : face} face2={speak ? 'surprised' : face2} faceMix={speak ? 0.5 + 0.5 * Math.sin(t * 14) : mix}
        look={look} turn={turn} tilt={tilt} armL={80} armR={80} prints={HERO_PRINTS} bodyBob={Math.sin(t * 50) * tremble} />
    </g>
    {dim > 0 && <rect width={1080} height={1920} fill="#040714" opacity={dim} />}
  </Stage>
);

/* ---------- вид вперёд: зеркало над рулём ---------- */
type MS = {t: number; cam: Cam; mp?: any; overlay?: React.ReactNode; mirrorFace?: number; dim?: number; lights?: number; lhT?: number; ahead?: any; roadShift?: number; children?: React.ReactNode};
const FV: React.FC<MS> = ({t, cam, mp, overlay, mirrorFace = 1, dim = 0, lights = 1, lhT = 0, ahead = null, roadShift = 0}) => (
  <g transform={camT(t, cam)}>
    <BusFront doorOpen={0} lift={1} mirrorFace={mirrorFace} mirrorProps={mp} mirrorOverlay={overlay} dim={dim} lights={lights} lhT={lhT} ahead={ahead} roadShift={roadShift} />
  </g>
);
const speakMix = (t: number, a: number, b: number) => (t > a && t < b ? 0.5 + 0.5 * Math.sin(t * 13) : 0);
const pop = (frame: number, fps: number, s: number) => spring({frame: frame - s * fps, fps, config: {damping: 13, stiffness: 120}});

/* ================= ПЛАНЫ ================= */
export const Chosen: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><WV3 t={t} cam={[[0, 600, 745, 0.9], [3.16, 560, 790, 1.0]]} heroX={760} face="worried" look={[-1, 0]} turn={-0.7} doorOpen={0.34} doorOutside={dblOut('worried', 0)} reach={170 * (1 - ramp(t, 2.8, 3.6))} vib={0.3} /></Stage>;
};

export const DoorClose: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WV3 t={t} cam={[[3.16, 560, 790, 1.0], [5.6, 470, 880, 1.5]]} heroX={760} face="worried" look={[-1, 0]} turn={-0.7} doorOpen={0.34 * (1 - ramp(t, 3.7, 4.95))}
        doorOutside={dblOut('worried', 0)} reach={170 * (1 - ramp(t, 3.2, 4.2))} glassPalm={ramp(t, 5.0, 5.4)} />
    </Stage>
  );
};

const Grin: React.FC<{t: number; cam: Cam; mixA: number; mixB: number}> = ({t, cam, mixA, mixB}) => (
  <Stage>
    <ExtView t={t} cam={cam} figure={<Double shade={0} face="calm" face2="grin" faceMix={ramp(t, mixA, mixB)} look={[0, 0]} armR={55} elbowR={-100} extraArmR={hand3([0, 0, 0, 0], 0.5)} />} />
    {Frame2}
  </Stage>
);
export const GrinStart: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Grin t={t} cam={[[5.6, 395, 350, 6.0], [7.57, 395, 352, 8.0]]} mixA={E3.grin - 0.1} mixB={E3.grin + 0.7} />;
};
export const SmileWrong: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Grin t={t} cam={[[7.57, 395, 352, 8.0], [9.5, 395, 372, 12], [10.95, 395, 372, 14]]} mixA={0} mixB={0.01} />;
};

export const PalmGlass: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <DoubleWithHand face="grin" folds={[0, 0, 0, 0]} hs={1.8 + 0.1 * lin(t, 10.95, 13.7)} />
      <GlassDrops />
    </Stage>
  );
};

export const Ask1: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <CU3 t={t} cam={[[13.7, 540, 960, 1.0], [16.55, 540, 940, 1.1]]} face="worried" look={[-0.9, 0]} turn={-0.5} speak={t > 14.2 && t < 16.2} />;
};

const BusGo: React.FC<{t: number; cam: Cam}> = ({t, cam}) => {
  const jolt = ramp(t, E3.start, E3.start + 0.25) * (1 - ramp(t, E3.start + 0.3, E3.start + 1.0));
  return (
    <WV3 t={t} cam={cam} heroX={760 - 28 * jolt} face="worried" look={[-1, 0]} turn={-0.7} tilt={4 * jolt} doorOpen={0}
      streetX={lk(t, [[16.55, 2311], [E3.start, 2311], [19.6, 2311 + 600], [24, 2311 + 3400]])} doorOutside={dblOut('grin', 84)} glassPalm={0.9 * (1 - ramp(t, E3.start + 0.4, E3.start + 1.4))} />
  );
};
export const BusGoes: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><BusGo t={t} cam={[[16.55, 560, 880, 1.15], [19.62, 520, 880, 1.25]]} /></Stage>;
};
export const Leaves: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><BusGo t={t} cam={[[19.62, 520, 880, 1.25], [21.9, 470, 880, 1.3]]} /></Stage>;
};

export const Recede: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const s = lk(t, [[21.9, 1.75], [26.1, 0.8]]);
  return (
    <Stage>
      <WindowPOV camX0={1700} camX={lk(t, [[21.9, 1700], [26.1, 1960]])} s={s} figure={<Double shade={0} face="grin" />} hero={{face: 'worried', turn: 0.6, look: [0.9, 0], prints: HERO_PRINTS}} />
    </Stage>
  );
};
export const LampOut: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lit = 1 - ramp(t, 25.9, 26.3);
  const s = lk(t, [[21.9, 1.75], [26.1, 0.8], [30, 0.7]]);
  return (
    <Stage>
      <WindowPOV camX0={1700} camX={lk(t, [[21.9, 1700], [26.1, 1960], [30, 2000]])} s={s} lampLit={lit} figure={<Double shade={0.5 * (1 - lit)} face="grin" />}
        hero={{face: 'scared', turn: 0.6, look: [0.9, 0], prints: HERO_PRINTS}}>
        <rect x={90} y={270} width={900} height={1090} fill="#02040a" opacity={0.4 * (1 - lit)} />
      </WindowPOV>
    </Stage>
  );
};

export const StopAhead: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lit = ramp(t, 27.5, 27.9);
  return (
    <Stage>
      <FV t={t} cam={[[26.64, 540, 960, 1.0], [30.69, 480, 900, 1.12]]} mp={{face: 'blank', look: [0, 0]}} mirrorFace={1}
        ahead={{k: lk(t, [[26.64, 0.85], [29.6, 1.2], [30.69, 1.2]]), camX: FIGURE_X - 540, lampLit: lit, figure: <Double shade={0.8 * (1 - ramp(t, 27.6, 28.2))} face="grin" />}}
        roadShift={lk(t, [[26.64, 0], [29.6, 2]])} dim={0.25 * (1 - lit)} />
    </Stage>
  );
};

export const Bench: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><ExtView t={t} cam={[[30.69, 315, 430, 3.2], [32.0, 330, 430, 3.7]]} figure={<Double shade={0} face="grin" />} /></Stage>;
};
export const Lamp: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><ExtView t={t} cam={[[32.0, 590, 230, 3.4], [33.04, 600, 230, 3.8]]} figure={<Double shade={0} face="grin" />} /></Stage>;
};
export const DoubleStands: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><ExtView t={t} cam={[[33.04, 420, 360, 2.6], [35.7, 400, 350, 4.4]]} figure={<Double shade={0} face="grin" />} /></Stage>;
};
export const NotSmiling: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <ExtView t={t} cam={[[35.7, 395, 350, 6.5], [38.04, 395, 350, 7.6]]} figure={<Double shade={0} face="grin" face2="blank" faceMix={ramp(t, 36.4, 37.4)} />} />
    </Stage>
  );
};

export const Hand3Shot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const arm = lk(t, [[0, 84], [38.6, 84], [40.2, 45]]);
  const elb = lk(t, [[0, 7], [38.6, 7], [40.2, -100]]);
  return (
    <Stage>
      <ExtView t={t} cam={[[38.04, 420, 360, 4.2], [40.9, 430, 330, 5.0]]} figure={<Double shade={0} face="blank" armR={arm} elbowR={elb} extraArmR={hand3([0, 0, 0, 1], 0.55, cl(t, 39.8, 40.6))} />} />
    </Stage>
  );
};
export const Count3: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><DoubleWithHand face="blank" folds={[0, 0, 0, 1]} hs={1.9} /></Stage>;
};
export const Bend: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><DoubleWithHand face="blank" folds={[0, 0, ramp(t, E3.fold - 0.05, E3.fold + 0.45), 1]} hs={1.9} /></Stage>;
};
export const Two: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><DoubleWithHand face="blank" folds={[0, 0, 1, 1]} hs={1.9 + 0.2 * lin(t, 43.39, 44.68)} /></Stage>;
};

export const Rush: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const r = ramp(t, 44.8, 45.95);
  return (
    <Stage>
      <WV3 t={t} cam={[[44.68, 600, 880, 1.0], [46.39, 380, 880, 1.15]]} heroX={760 - 330 * r} face="scared" look={[-1, 0]} turn={-0.6} tilt={-8 * Math.sin(r * Math.PI)} bob={Math.abs(Math.sin(t * 20)) * 5 * Math.sin(r * Math.PI)}
        doorOutside={dblOut('blank', 84)} />
    </Stage>
  );
};

export const Mirror1: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lx = 0.9 * (1 - ramp(t, 50.3, 50.7));
  return (
    <Stage>
      <FV t={t} cam={[[46.39, 480, 900, 1.1], [47.4, 415, 420, 2.2], [48.8, 415, 335, 3.6], [53.51, 415, 335, 5.2]]} mp={{face: 'blank', look: [lx, lx > 0.05 ? -0.15 : 0]}} mirrorFace={ramp(t, 46.6, 47.2)} />
    </Stage>
  );
};
export const Ask2: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <CU3 t={t} cam={[[53.51, 540, 960, 1.0], [56.67, 540, 940, 1.12]]} face="worried" look={[-0.8, 0]} turn={-0.5} speak={t > 53.8 && t < 56.4} />;
};
export const NoAnswer: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><FV t={t} cam={[[56.67, 540, 960, 1.0], [58.16, 470, 900, 1.15]]} mp={{face: 'blank', look: [0, 0]}} /></Stage>;
};
export const LightsOffShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const off = t >= E3.lights;
  return (
    <Stage>
      <FV t={t} cam={[[58.16, 470, 900, 1.15], [59.4, 330, 1150, 1.5], [60.3, 440, 1000, 1.25], [60.85, 470, 950, 1.2]]} mp={{face: 'blank', look: [0, 0]}}
        lhT={ramp(t, 58.9, 59.5) * (1 - ramp(t, 59.95, 60.4))} lights={off ? 0 : 1} dim={0.72 * ramp(t, E3.lights, E3.lights + 0.35)} />
    </Stage>
  );
};

export const Steps: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const look = lk(t, [[60.85, 0], [63.7, 0.9], [66.5, 0.9], [69, 0.5]]);
  return <CU3 t={t} cam={[[60.85, 540, 960, 1.0], [69.08, 540, 930, 1.15]]} face="scared" look={[look, 0.05]} turn={0.3} dim={0.55} tremble={1.1} />;
};

export const Flashlight: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const up = ramp(t, 69.6, 70.4);
  return (
    <Stage>
      <WV3 t={t} cam={[[69.08, 700, 880, 1.0], [73.29, 860, 880, 0.95]]} heroX={640} face="worried" look={[1, 0]} turn={0.5} armR={84 - 49 * up} elbowR={7 - 42 * up} phone={t > 69.9}
        beam={ramp(t, 70.4, 70.9)} dim={0.86} lights={0} />
    </Stage>
  );
};

export const Prints: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><g transform={camT(t, [[73.29, 540, 800, 1.0], [78.52, 540, 800, 1.18]])}><AisleDark t={t} beam={1} t0={73.5} dt={0.55} /></g></Stage>;
};

export const Retreat: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const back = ramp(t, 79.0, 79.75);
  const hit = t >= 80.0 && t < 81.0 ? 1 - (t - 80.0) : 0;
  const hx = 700 - 100 * back;
  return (
    <Stage>
      <WV3 t={t} cam={[[78.52, 800, 940, 1.1], [81.25, 700, 1050, 1.35]]} heroX={hx} face="scared" look={[1, 0]} turn={0.4} tilt={-6 * ramp(t, 79.0, 80.0) * (1 - ramp(t, 80.0, 81.0))}
        armR={35} elbowR={-35} phone beam={1} dim={0.78} lights={0} poleShake={hit * 6} floorN={ramp(t, 78.5, 81.2) * 8} />
    </Stage>
  );
};
export const FloorShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WV3 t={t} cam={[[81.25, 700, 1050, 1.3], [82.2, 650, 1430, 1.85], [83.6, 650, 1450, 1.9]]} heroX={600} face="scared" look={[0.4, 1]} turn={0.3} armR={35} elbowR={-35} phone beam={0.9} dim={0.86} lights={0} floorN={9} />
    </Stage>
  );
};

export const ReflectionShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WV3 t={t} cam={[[83.6, 800, 880, 1.0], [86.5, 820, 860, 1.15], [90.55, 830, 840, 1.25]]} heroX={720} face="worried" face2="scared" mix={cl(t, 86.5, 88.0)} look={[0.9, 0]} turn={0.6}
        refl={{op: ramp(t, 84.9, 85.9), point: 0}} dim={0.45} lights={0.5} />
    </Stage>
  );
};
export const PointShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WV3 t={t} cam={[[90.55, 830, 840, 1.25], [93.0, 860, 800, 1.35], [94.96, 560, 700, 1.0]]} heroX={720} face="scared" look={[0.9, 0]} turn={0.6}
        refl={{op: 1, point: ramp(t, 91.5, 93.4)}} cabMirror={{face: 'blank'}} dim={0.45} lights={0.5} />
    </Stage>
  );
};

export const FogShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const b = Math.max(0, 1 - Math.abs(t - 99.95) / 0.16);
  return (
    <Stage>
      <FV t={t} cam={[[94.96, 480, 900, 1.1], [96.0, 415, 430, 2.4], [97.0, 415, 335, 4.0], [101.82, 415, 335, 4.4]]} mp={{face: 'blank', look: [0, 0]}} dim={0.3} lights={0.4}
        overlay={<FogText fog={ramp(t, 95.3, 96.6)} reveal={ramp(t, 97.9, 99.05)} gone={ramp(t, 100.7, 101.3)} />} />
      <BlinkLids c={0.46 * b} />
    </Stage>
  );
};

export const Talks1: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const m = speakMix(t, 103.2, 103.96);
  return <Stage><FV t={t} cam={[[101.82, 415, 335, 4.4], [103.96, 415, 335, 3.4]]} mp={{face: 'blank', face2: 'surprised', faceMix: m, look: [0, 0]}} dim={0.3} lights={0.4} /></Stage>;
};
export const LikeMine: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <CU3 t={t} cam={[[103.96, 540, 960, 1.0], [106.63, 540, 930, 1.14]]} face="scared" look={[-0.5, 0]} turn={-0.3} dim={0.35} tremble={1.0} />;
};
export const QuestionShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const m = speakMix(t, E3.asks - 0.05, 109.95);
  return <Stage><FV t={t} cam={[[106.63, 415, 335, 3.4], [110.07, 415, 335, 4.0]]} mp={{face: 'blank', face2: 'surprised', faceMix: m, look: [0, 0]}} dim={0.3} lights={0.4} /></Stage>;
};
export const Hesitate: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const m = ramp(t, 110.5, 111.0) * (1 - ramp(t, 111.6, 112.1));
  const gl = ramp(t, 112.0, 112.5);
  return <CU3 t={t} cam={[[110.07, 540, 960, 1.0], [113.68, 540, 930, 1.12]]} face="worried" face2="surprised" mix={m} look={[-0.8 * gl, -0.5 * gl]} turn={-0.3 * gl} dim={0.3} />;
};

export const StopAgainShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const lurch = t > 115.4 && t < 116.4 ? Math.sin((t - 115.4) * 8) * 14 * (1 - cl(t, 115.4, 116.4)) : 0;
  return (
    <Stage>
      <WV3 t={t} cam={[[113.68, 640, 900, 1.0], [116.69, 700, 880, 1.05]]} heroX={650 + (t > 115.4 ? 22 * (1 - cl(t, 115.4, 116.4)) : 0)} face="scared" look={[0.5, 0]} turn={0.3} tilt={t > 115.4 ? 5 * (1 - cl(t, 115.4, 116.4)) : 0}
        streetX={lk(t, [[113.68, 2311], [115.4, 3400], [115.8, 3500], [200, 3500]])} dim={0.45} lights={0.5} bob={lurch} />
    </Stage>
  );
};
export const WindowStop: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WindowPOV camX0={1700} camX={1700} s={1.7 + 0.1 * lin(t, 116.69, 119.23)} figure={<Double shade={0} face="blank" />} hero={{face: 'scared', turn: 0.6, look: [0.9, 0], prints: HERO_PRINTS}} />
    </Stage>
  );
};
export const OneFinger: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><DoubleWithHand face="blank" folds={[0, ramp(t, 120.8, 121.5), 1, 1]} hs={2.0 + 0.15 * lin(t, 119.23, 123.06)} /></Stage>;
};

export const BlinkShot: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const fl = t > E3.flicker && t < 123.95 ? (Math.sin(t * 60) > 0 ? 0.05 : 0.7) : 0.45;
  return <Stage><WV3 t={t} cam={[[123.06, 650, 800, 1.1], [124.21, 650, 790, 1.2]]} heroX={650} face="scared" look={[0, -0.6]} turn={0.2} dim={fl} lights={fl < 0.3 ? 1 : 0.4} /></Stage>;
};
export const SmileMirror: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><FV t={t} cam={[[124.21, 415, 335, 3.6], [126.47, 415, 335, 4.4]]} mp={{face: 'blank', face2: 'grin', faceMix: ramp(t, 125.2, 125.9), look: [0, 0]}} dim={0.3} lights={0.4} /></Stage>;
};

export const Direct: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WV3 t={t} cam={[[126.47, 380, 780, 1.45], [130.85, 300, 730, 1.9]]} heroX={520} face="scared" look={[-1, 0]} turn={-0.8} dim={0.4} lights={0.4}
        cabMirror={{face: 'grin'}} driver={{bodyTurn: 0, faceProps: {face: 'blank', turn: -0.95, look: [-1, 0]}}} />
    </Stage>
  );
};
export const AisleVoice: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <g transform={camT(t, [[130.85, 540, 800, 1.0], [134.5, 540, 800, 1.25]])}>
        <AisleView flicker={0.7} />
        <rect width={1080} height={1920} fill="#02040a" opacity={0.5} />
      </g>
    </Stage>
  );
};
export const React3: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <CU3 t={t} cam={[[134.5, 540, 960, 1.0], [136.0, 540, 940, 1.1]]} face="scared" look={[-0.7, -0.3]} turn={-0.4} dim={0.35} tremble={1.1} />;
};
export const MirrorWords: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><FV t={t} cam={[[136.0, 415, 335, 3.6], [137.83, 415, 335, 5.2]]} mp={{face: 'blank', look: [0, 0]}} dim={0.3} lights={0.4} /></Stage>;
};

export const DriverTurn: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  const bt = ramp(t, 138.5, 140.2);
  return (
    <Stage>
      <WV3 t={t} cam={[[137.83, 330, 760, 1.6], [140.53, 380, 740, 1.45]]} heroX={520} face="scared" look={[-1, 0]} turn={-0.7} dim={0.4} lights={0.4}
        cabMirror={{face: 'grin'}} driver={{bodyTurn: bt, keyUp: ramp(t, 140.0, 140.5), faceProps: {face: 'blank', turn: -0.95 + 1.0 * bt, look: [-1 + 1.9 * bt, 0.05]}}} />
    </Stage>
  );
};
export const KeyClose: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return <Stage><KeyHand t={t} /></Stage>;
};
export const Final3: React.FC<P> = ({t0}) => {
  const t = useT(t0);
  return (
    <Stage>
      <WV3 t={t} cam={[[142.93, 430, 745, 0.85], [154.97, 430, 745, 0.85]]} heroX={640} face="worried" face2="scared" mix={0.5 + 0.5 * Math.sin(t * 2)} look={[0, 0]} turn={0} dim={0.4} lights={0.4}
        cabMirror={{face: 'grin'}} driver={{bodyTurn: 1, keyUp: 1, faceProps: {face: 'blank', turn: 0.05, look: [0.9, 0.05]}}} vib={0.3} />
    </Stage>
  );
};

export const SHOTS3_COMPONENTS: Record<string, React.FC<P>> = {
  chosen: Chosen, doorClose: DoorClose, grinStart: GrinStart, smileWrong: SmileWrong, palmGlass: PalmGlass, ask1: Ask1, busGoes: BusGoes, leaves: Leaves,
  recede: Recede, lampOut: LampOut, stopAhead: StopAhead, bench: Bench, lamp: Lamp, doubleStands: DoubleStands, notSmiling: NotSmiling, hand3: Hand3Shot,
  count3: Count3, bend: Bend, two: Two, rush: Rush, mirror1: Mirror1, ask2: Ask2, noAnswer: NoAnswer, lightsOff: LightsOffShot, steps: Steps,
  flashlight: Flashlight, prints: Prints, retreat: Retreat, floor: FloorShot, reflection: ReflectionShot, point: PointShot, fog: FogShot,
  talks1: Talks1, likeMine: LikeMine, question: QuestionShot, hesitate: Hesitate, stopAgain: StopAgainShot, windowStop: WindowStop, oneFinger: OneFinger,
  blink: BlinkShot, smileMirror: SmileMirror, direct: Direct, aisleVoice: AisleVoice, react: React3, mirrorWords: MirrorWords, driverTurn: DriverTurn,
  keyClose: KeyClose, final: Final3,
};
