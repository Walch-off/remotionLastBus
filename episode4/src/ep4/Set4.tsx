import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Hero} from '../components/Hero';
import {C} from './story4';
import {HERO, DRV, MIRROR, HAMMER_HOOK, KEY_FLOOR, HAMMER_FLOOR, IMPACT, heroState, driverState, keyFall, mirrorState, envState, doubleState} from './state4';
import {HammerInFist, HammerShape, KeyInFist, KeyShape, PhoneInFist, PointFist, WetHand, crackPattern, PressedPalm, WaterPrint, MirrorFace, Fist} from './props4';
import {LookDefs, CeilingGlow, RouteSign, WallSeats, GlassRain, LightShaft, FloorReflections, CabPanels, CabDetails, CityDetail, RainLayers} from './Look4';

export const Defs4: React.FC = () => (
  <defs>
    <linearGradient id="e4wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d3170" /><stop offset="0.6" stopColor="#182a5e" /><stop offset="1" stopColor="#111d44" /></linearGradient>
    <linearGradient id="e4floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24305a" /><stop offset="1" stopColor="#0f1734" /></linearGradient>
    <linearGradient id="e4sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1236" /><stop offset="0.7" stopColor="#2a2158" /><stop offset="1" stopColor="#4a2d4e" /></linearGradient>
    <radialGradient id="e4lampGlow"><stop offset="0" stopColor="#ffc56b" stopOpacity={0.85} /><stop offset="0.4" stopColor="#ff9f3f" stopOpacity={0.25} /><stop offset="1" stopColor="#ff9f3f" stopOpacity={0} /></radialGradient>
    <radialGradient id="e4warm"><stop offset="0" stopColor="#ffb35a" stopOpacity={0.32} /><stop offset="1" stopColor="#ffb35a" stopOpacity={0} /></radialGradient>
    <radialGradient id="e4cool"><stop offset="0" stopColor="#7fa8ff" stopOpacity={0.22} /><stop offset="1" stopColor="#7fa8ff" stopOpacity={0} /></radialGradient>
    <linearGradient id="e4glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#cfe0ff" stopOpacity={0.16} /><stop offset="0.45" stopColor="#cfe0ff" stopOpacity={0} /><stop offset="0.6" stopColor="#cfe0ff" stopOpacity={0.08} /><stop offset="1" stopColor="#cfe0ff" stopOpacity={0} /></linearGradient>
    <linearGradient id="e4mirror" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4a6cb0" /><stop offset="0.5" stopColor="#2a3d78" /><stop offset="1" stopColor="#1c2a5a" /></linearGradient>
    <radialGradient id="e4vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#03051a" stopOpacity={0.55} /></radialGradient>
  </defs>
);
export const AllDefs: React.FC = () => (<><Defs4 /><LookDefs /></>);

/** Герой в состоянии на время t */
export const HeroAt: React.FC<{t: number; id?: string; legs?: boolean; overrides?: any}> = ({t, id = 'h4', legs = true, overrides = {}}) => {
  const s = heroState(t);
  const itemL = s.itemL === 'hammer' ? <HammerInFist itemRot={s.hammerRot} /> : s.itemL === 'key' ? <KeyInFist worldRot={s.worldRotL} swing={Math.sin(t * 2.1) * 6} squeeze={s.keySqueeze} slip={s.keySlip} /> : undefined;
  const itemR = s.itemR === 'phone' ? <PhoneInFist worldRot={s.worldRotR} glow={s.phoneGlow} /> : undefined;
  return (
    <g>
      <Hero id={id} x={HERO.x + s.dx} y={HERO.y} scale={HERO.s} anchor={[505, 930]} legs={legs}
        armL={s.armL} elbowL={s.elbowL} armR={s.armR} elbowR={s.elbowR} itemL={itemL} itemR={itemR}
        face={s.face} face2={s.face2} faceMix={s.faceMix} look={s.look} turn={s.turn} tilt={s.tilt} bodyBob={s.bob}
        wet={s.wet} prints={s.prints} blinkSeed={11} {...overrides} />
      {s.pocketGlow > 0 && <ellipse cx={HERO.x + s.dx} cy={HERO.y - 420} rx={90} ry={40} fill="#9db8ff" opacity={0.55 * s.pocketGlow} />}
    </g>
  );
};

/** Вид за окном: мокрая улица, остановка, фонарь, двойник */
export const Outside: React.FC<{t: number; frame: number; detail?: number}> = ({t, frame}) => {
  const e = envState(t);
  const d = doubleState(t);
  const lit = e.lamp;
  // двойник стоит прямо у окна, лицом в салон
  const pointL = d.pointing;
  const armL = 80 - 72 * pointL;           // указывает влево (на зеркало)
  const armR = 80 - 150 * d.bangArm;      // правая ладонь — к стеклу
  return (
    <g>
      <rect x={-200} y={300} width={1500} height={900} fill="url(#e4sky)" />
      {/* дальний город: дома с окнами, вывеска, огни */}
      <CityDetail frame={frame} lamp={lit} />
      {/* тротуар и лужи */}
      <rect x={-200} y={960} width={1500} height={260} fill="#1d2440" />
      <ellipse cx={720} cy={1020} rx={160} ry={14} fill="#ffc56b" opacity={0.25 * lit} />
      {/* навес остановки */}
      <rect x={500} y={700} width={360} height={22} fill="#2c3658" /><rect x={516} y={722} width={10} height={260} fill="#2c3658" /><rect x={838} y={722} width={10} height={260} fill="#2c3658" />
      <rect x={530} y={730} width={300} height={170} fill="#5c78b8" opacity={0.12} />
      {/* фонарь */}
      <rect x={866} y={520} width={10} height={480} fill="#2a3150" />
      <path d="M871 524 Q871 500 840 500 L820 500" stroke="#2a3150" strokeWidth={8} fill="none" />
      <rect x={800} y={498} width={44} height={12} rx={5} fill={lit > 0.1 ? '#ffe2a8' : '#3a3f55'} />
      <ellipse cx={822} cy={560} rx={260} ry={300} fill="url(#e4lampGlow)" opacity={lit} />
      {/* двойник: та же внешность, холодный оттенок, мокрый; освещён фонарём */}
      <g opacity={d.vis}>
        <Hero id="dbl" x={812} y={1110} scale={0.6} anchor={[505, 930]} legs face={d.face} look={[-0.2 * pointL, 0]} turn={d.shake}
          armL={armL} elbowL={8 - 8 * pointL} armR={armR} elbowR={10 + 30 * d.bangArm}
          itemL={pointL > 0.3 ? <PointFist /> : undefined}
          shade={0.38 + 0.5 * (1 - lit)} shadeColor={[0.1, 0.16, 0.34]} blinkSeed={71} />
      </g>
      {/* дождь */}
      <RainLayers frame={frame} lamp={lit} />
    </g>
  );
};

/** Зеркало (локальные координаты: центр (0,0), w×h) */
export const Mirror: React.FC<{t: number; frame: number; detail?: boolean}> = ({t, frame}) => {
  const m = mirrorState(t);
  const {w, h} = MIRROR;
  const hs = heroState(t);
  const segs = React.useMemo(() => crackPattern(IMPACT.x, IMPACT.y, w, h), [w, h]);
  const jit = m.knock * 2.2;
  return (
    <g>
      <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 36} rx={20} fill="url(#lkChrome)" />
      <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={14} fill="#0e1430" />
      <clipPath id="e4mclip"><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} /></clipPath>
      <g clipPath="url(#e4mclip)">
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#e4mirror)" />
        {/* отражение салона (до удара) */}
        <g opacity={m.reflection}>
          <rect x={-w / 2} y={-h / 2 + 30} width={w} height={8} fill="#55628e" opacity={0.5} />
          <g transform="translate(110 40) scale(-1 1)">
            <Hero id="refl4" x={0} y={0} scale={0.42} anchor={[505, 250]} legs={false} face={hs.face} look={[0.3, 0.1]} turn={0.25} armL={80} armR={80} shade={0.35} shadeColor={[0.15, 0.2, 0.4]} blinkSeed={11} />
          </g>
        </g>
        {/* по ту сторону: лицо и ладонь */}
        <g transform={`translate(${jit * Math.sin(frame * 2.3)} 0)`}>
          <g transform="translate(-70 18)">
            <MirrorFace op={m.faceOp} t={t} look={[0.75, 0.35]} face="blank" turn={0.15} />
          </g>
          {m.palmOp > 0 && (
            <g opacity={m.palmOp} transform={`translate(60 ${lerpN(140, 30, m.palmUp)}) scale(${0.55 + 0.04 * m.palmPress})`}>
              <PressedPalm press={m.palmPress} />
            </g>
          )}
          {/* приглушённый «крик» изнутри: волны в стекле */}
          {m.screamPulse > 0 && [0, 1, 2].map((k) => (
            <ellipse key={k} cx={IMPACT.x} cy={IMPACT.y} rx={30 + ((t * 120 + k * 45) % 140)} ry={(30 + ((t * 120 + k * 45) % 140)) * 0.55} fill="none" stroke="#bcd0ff" strokeWidth={3} opacity={0.35 * (1 - ((t * 120 + k * 45) % 140) / 140)} />
          ))}
          {m.knock > 0.05 && <circle cx={-20} cy={10} r={50} fill="#000" opacity={0.35 * m.knock} />}
        </g>
        {/* стекло: блики */}
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#e4glass)" />
        {/* диагональные блики стекла */}
        <path d={`M${-w / 2 + 40} ${-h / 2} L${-w / 2 + 90} ${-h / 2} L${-w / 2 + 10} ${h / 2} L${-w / 2 - 40} ${h / 2}Z`} fill="#e6f0ff" opacity={0.1} />
        <path d={`M${-w / 2 + 110} ${-h / 2} L${-w / 2 + 125} ${-h / 2} L${-w / 2 + 45} ${h / 2} L${-w / 2 + 30} ${h / 2}Z`} fill="#e6f0ff" opacity={0.12} />
        {/* трещины поверх всего, что по ту сторону */}
        {m.crack > 0 && (
          <g transform={`translate(${jit * Math.sin(frame * 3.1)} ${jit * Math.cos(frame * 2.7)})`}>
            {segs.map(([x1, y1, x2, y2, o], i) => {
              const vis = Math.max(0, Math.min(1, (m.crack - o) / 0.12));
              if (vis <= 0) return null;
              const ex = x1 + (x2 - x1) * vis, ey = y1 + (y2 - y1) * vis;
              return (
                <g key={i}>
                  <path d={`M${x1} ${y1} L${ex} ${ey}`} stroke="#0a0d18" strokeWidth={3.2} strokeLinecap="round" opacity={0.75} />
                  <path d={`M${x1 + 1} ${y1 - 1} L${ex + 1} ${ey - 1}`} stroke="#e6efff" strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
                </g>
              );
            })}
            <circle cx={IMPACT.x} cy={IMPACT.y} r={16} fill="#e6efff" opacity={0.5} />
            <circle cx={IMPACT.x} cy={IMPACT.y} r={9} fill="#0a0d18" opacity={0.6} />
          </g>
        )}
        {/* мокрый отпечаток — на НАШЕЙ стороне стекла (поверх трещин) */}
        <g transform="translate(60 30) scale(0.57)"><WaterPrint op={m.printOp} t={t} drip={m.drip} /></g>
        {m.impactFlash > 0 && <circle cx={IMPACT.x} cy={IMPACT.y} r={30 + 40 * m.impactFlash} fill="#fff7e0" opacity={0.6 * m.impactFlash} />}
      </g>
      {/* капля срывается с рамки вниз */}
      {m.dropFall > 0 && m.dropFall < 1 && <path d={`M${60 - 6} ${h / 2 + 10 + m.dropFall * 200} q6 12 12 0 q-6 -14 -12 0z`} fill="#bcd6ff" opacity={0.95} />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="none" stroke="#5b678f" strokeWidth={3} />
    </g>
  );
};
const lerpN = (a: number, b: number, u: number) => a + (b - a) * u;

/** Общий вид салона у кабины. Мировые координаты = кадр 1080×1920 при масштабе 1. */
export const Set4: React.FC<{t: number; heroOverrides?: any; hideHero?: boolean}> = ({t, heroOverrides, hideHero}) => {
  const frame = useCurrentFrame();
  const e = envState(t);
  const ds = driverState(t);
  const kf = keyFall(t);
  const lampWarm = e.lamp;
  return (
    <g transform={`rotate(${e.rock} 540 1720)`}>
      <rect x={-600} y={-600} width={2400} height={3200} fill="#0d1328" />
      {/* потолок */}
      <rect x={-300} y={-300} width={1700} height={760} fill="#15214a" />
      <CeilingGlow />
      <rect x={-300} y={440} width={1700} height={10} fill="#2a3456" />
      {/* стена с окном */}
      <rect x={-300} y={450} width={1700} height={1120} fill="url(#e4wall)" />
      <clipPath id="e4win"><rect x={487} y={522} width={412} height={596} rx={26} /></clipPath>
      <g clipPath="url(#e4win)"><Outside t={t} frame={frame} /></g>
      {/* отпечаток ладони двойника на стекле снаружи */}
      {doubleState(t).printOnGlass > 0 && (
        <g transform="translate(752 780) scale(0.5)" opacity={0.7 * doubleState(t).printOnGlass}><WaterPrint op={1} t={t} drip={0.6} /></g>
      )}
      <rect x={487} y={522} width={412} height={596} rx={26} fill="url(#e4glass)" />
      <clipPath id="e4winRain"><rect x={487} y={522} width={412} height={596} rx={26} /></clipPath>
      <g clipPath="url(#e4winRain)"><GlassRain x={487} y={522} w={412} h={596} frame={frame} warm={lampWarm} /></g>
      <rect x={487} y={522} width={412} height={596} rx={26} fill="none" stroke="#3a4a78" strokeWidth={14} />
      <rect x={480} y={515} width={426} height={8} rx={4} fill="url(#lkChrome)" opacity={0.6} />
      <RouteSign frame={frame} />
      <WallSeats />
      {/* стойка и молоток на креплении */}
      <rect x={443} y={460} width={44} height={1110} fill="#2a3456" /><rect x={449} y={460} width={8} height={1110} fill="#3b4870" />
      <rect x={445} y={850} width={40} height={150} rx={6} fill="#d9dee8" /><rect x={449} y={856} width={32} height={20} rx={3} fill="#c7433a" />
      
      {e.hammerOnHook && <g transform={`translate(${HAMMER_HOOK.x - 4} ${HAMMER_HOOK.y + 10}) rotate(-90)`}><HammerShape /></g>}
      <rect x={455} y={920} width={20} height={12} rx={3} fill="#9aa4bb" />
      {/* дверь справа */}
      <g transform={`translate(${e.doorShake} 0)`}>
        <rect x={912} y={480} width={180} height={1150} fill="#1a2240" stroke="#33405f" strokeWidth={10} />
        <rect x={926} y={510} width={70} height={980} rx={12} fill="#0b1124" stroke="#4a587f" strokeWidth={5} />
        <rect x={1006} y={510} width={70} height={980} rx={12} fill="#0b1124" stroke="#4a587f" strokeWidth={5} />
        <rect x={926} y={510} width={70} height={980} rx={12} fill="url(#e4glass)" />
        <rect x={998} y={505} width={10} height={990} fill="#0a0d18" />
        <rect x={940} y={1000} width={10} height={140} rx={5} fill="#7c88a8" />
      </g>
      {e.steam > 0 && [0, 1, 2, 3].map((k) => (
        <ellipse key={k} cx={960 + k * 30} cy={1560 - k * 30 - e.steam * 60} rx={70 + 30 * e.steam} ry={40 + 20 * e.steam} fill="#c9d8f5" opacity={0.18 * e.steam} />
      ))}
      {/* поручень */}
      <rect x={430} y={470} width={700} height={12} rx={6} fill="#8a96b8" />
      {[620, 760].map((x, i) => <g key={i}><rect x={x - 3} y={480} width={6} height={70} fill="#6a7698" /><circle cx={x} cy={566} r={18} fill="none" stroke="#8a96b8" strokeWidth={7} /></g>)}
      {/* кабина: задняя перегородка */}
      <rect x={-300} y={560} width={743} height={1010} fill="#19244c" />
      <CabPanels />
      <rect x={-300} y={560} width={743} height={12} fill="#2a3456" />
      {/* кронштейн и зеркало */}
      <rect x={MIRROR.x - 5} y={450} width={10} height={MIRROR.y - MIRROR.h / 2 - 450} fill="#3b4565" />
      <g transform={`translate(${MIRROR.x} ${MIRROR.y})`}><Mirror t={t} frame={frame} /></g>
      {/* водитель */}
      <g filter="url(#lkRimCool)"><Hero id="drv4" x={DRV.x} y={DRV.y} scale={DRV.s} anchor={[505, 575]} legs={false} cap stain={false}
        armL={ds.armL} elbowL={ds.elbowL} armR={ds.armR} elbowR={ds.elbowR} armsFront={ds.armsFront}
        itemR={ds.holdsKey ? <KeyInFist worldRot={(ds.armR - 90 + ds.elbowR)} swing={Math.sin(t * 1.7) * 5} /> : undefined}
        face={ds.face} face2={ds.face2} faceMix={ds.faceMix} look={ds.look} turn={ds.turn} tilt={ds.tilt} blinkSeed={31}
        shade={0.06} shadeColor={[0.06, 0.08, 0.2]} /></g>
      {/* передняя панель кабины (скрывает ноги водителя) */}
      <path d="M-300 1300 L440 1300 L440 1570 L-300 1570Z" fill="#232c4c" />
      <rect x={-300} y={1292} width={742} height={18} rx={8} fill="#3a4670" />
      <ellipse cx={120} cy={1300} rx={110} ry={26} fill="none" stroke="#0f1324" strokeWidth={16} />
      {[60, 120, 180, 300].map((x, i) => <circle key={i} cx={x} cy={1380} r={9} fill={i === 3 ? '#ff6b5a' : '#6cf0a8'} opacity={e.engine ? 0.9 : 0.12} />)}
      <CabDetails engine={e.engine} frame={frame} />
      {/* пол */}
      <rect x={-300} y={1570} width={1700} height={500} fill="url(#e4floor)" />
      <rect x={-300} y={1566} width={1700} height={8} fill="#2e3a60" />
      <FloorReflections lamp={lampWarm} engine={e.engine} frame={frame} />
      {/* мокрые следы в проходе: от двери к герою */}
      {Array.from({length: 6}).map((_, k) => {
        const vis = e.stepsVis(5 - k, 6);
        if (vis <= 0.01) return null;
        const x = 1060 - k * 62, y = 1820 + (k % 2 ? 26 : -10);
        return (
          <g key={k} transform={`translate(${x} ${y}) rotate(${k % 2 ? 6 : -6})`} opacity={vis}>
            <ellipse cx={0} cy={0} rx={30} ry={12} fill="#3a5a96" opacity={0.75} /><ellipse cx={-28} cy={0} rx={10} ry={9} fill="#3a5a96" opacity={0.75} />
            <path d="M-14 -4 q14 -5 28 0" stroke="#bcd6ff" strokeWidth={3} fill="none" opacity={0.6} strokeLinecap="round" />
          </g>
        );
      })}
      {/* молоток на полу (положен героем) */}
      {e.hammerOnFloor && <g transform={`translate(${HAMMER_FLOOR.x} ${HAMMER_FLOOR.y}) rotate(-8) scale(0.9)`}><HammerShape /></g>}
      {/* ключ: падает / лежит */}
      {kf.mode === 'fall' && <g transform={`translate(${kf.x} ${kf.y}) rotate(${kf.rot})`}><KeyShape g={-kf.rot} /></g>}
      {kf.mode === 'floorCU' && t < C.pick + 1.0 && <g transform={`translate(${KEY_FLOOR.x} ${KEY_FLOOR.y})`}><KeyShape g={-90} /></g>}
      {/* герой */}
      {!hideHero && <g filter={lampWarm > 0.5 ? "url(#lkRimWarm)" : "url(#lkRimCool)"}><HeroAt t={t} overrides={heroOverrides} /></g>}
      {/* мокрая ладонь без владельца */}
      <WetHand id="wh4" x={e.palmPos[0]} y={e.palmPos[1]} scale={0.62} appear={e.palmAppear} open={e.palmOpen} t={t} rotDeg={-8 + 18 * e.palmOpen} />
      {/* свет: тёплый от фонаря через окно, холодный сверху */}
      <LightShaft lamp={lampWarm} frame={frame} />
      <ellipse cx={700} cy={900} rx={520} ry={700} fill="url(#e4warm)" opacity={lampWarm} />
      <ellipse cx={540} cy={500} rx={700} ry={500} fill="url(#e4cool)" />
    </g>
  );
};

export {Fist};
