import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Hero} from '../components/Hero';
import {C, sm} from './story5';
import {HERO_IN, DRV, MIRROR, LOCK_IN, HAMMER_FLOOR, heroIn, driverIn, mirror5, doorIn, lockLed, steamIn, ghostHands, dblIn, GRIP_LOCAL} from './state5';
import {HammerShape, KeyInFist, PhoneInFist, PointFist, WetHand, crackPattern, WaterPrint} from '../ep4/props4';
import {IMPACT} from '../ep4/state4';
import {Defs4} from '../ep4/Set4';
import {LookDefs, CeilingGlow, RouteSign, WallSeats, GlassRain, FloorReflections, CabPanels, CabDetails, CityDetail, RainLayers} from '../ep4/Look4';
import {GripHand, MirrorFigure} from './props5';

export const AllDefs5: React.FC = () => (<><Defs4 /><LookDefs /></>);

/** Герой в салоне в момент t */
export const HeroIn5: React.FC<{t: number}> = ({t}) => {
  const s = heroIn(t);
  const keyItem = (
    <g transform={`rotate(${s.keyAngle * 0.45})`}>
      <KeyInFist worldRot={90 - s.armL - s.elbowL + s.keyAngle * 0.45} swing={Math.sin(t * 2.1) * 5} squeeze={s.keySqueeze} />
    </g>
  );
  const itemL = s.itemL === 'keyGrip'
    ? <g>{keyItem}<GripHand x={GRIP_LOCAL[0]} y={GRIP_LOCAL[1]} t={t} /></g>
    : s.itemL === 'key' ? keyItem : undefined;
  return (
    <Hero id="h5" x={s.x} y={HERO_IN.y} scale={1} anchor={[505, 930]} legs
      armL={s.armL} elbowL={s.elbowL} armR={s.armR} elbowR={s.elbowR} itemL={itemL}
      itemR={<PhoneInFist worldRot={s.armR - 90 + s.elbowR} glow={1} />}
      face={s.face} face2={s.face2} faceMix={s.faceMix} look={s.look} turn={s.turn} tilt={s.tilt} bodyBob={s.bob}
      wet={0.6} prints={{a: 1, b: 1}} pocketOver={s.pocketOver} pocketKey={s.pocketKey} blinkSeed={11} />
  );
};

/** Вид за окном: остановка под погасшим фонарём; двойник — со «стеклянным» холодным свечением отражения */
export const Outside5: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const d = dblIn(t);
  return (
    <g>
      <rect x={-200} y={300} width={1500} height={900} fill="url(#e4sky)" />
      <CityDetail frame={frame} lamp={0} />
      <rect x={-200} y={960} width={1500} height={260} fill="#1d2440" />
      <rect x={500} y={700} width={360} height={22} fill="#2c3658" /><rect x={516} y={722} width={10} height={260} fill="#2c3658" /><rect x={838} y={722} width={10} height={260} fill="#2c3658" />
      <rect x={530} y={730} width={300} height={170} fill="#5c78b8" opacity={0.12} />
      <rect x={866} y={520} width={10} height={480} fill="#2a3150" />
      <path d="M871 524 Q871 500 840 500 L820 500" stroke="#2a3150" strokeWidth={8} fill="none" />
      <rect x={800} y={498} width={44} height={12} rx={5} fill="#3a3f55" />
      {d.vis > 0 && (
        <g filter="url(#lkRimCool)">
          <ellipse cx={812} cy={900} rx={110} ry={230} fill="#7fb2ff" opacity={0.1} />
          <Hero id="dbl5" x={812} y={1110} scale={0.6} anchor={[505, 930]} legs face="worried" look={[-0.5 + 0.3 * d.pointDoor, 0.3]} turn={-0.2 + 0.5 * d.pointDoor}
            armR={80 - 76 * d.pointDoor} elbowR={6 - 6 * d.pointDoor} itemR={d.pointDoor > 0.3 ? <PointFist /> : undefined}
            armL={80 - 42 * d.pointPocket} elbowL={8 - 8 * d.pointPocket} itemL={d.pointPocket > 0.3 ? <PointFist /> : undefined}
            shade={0.28} shadeColor={[0.12, 0.2, 0.42]} blinkSeed={71} wet={0.6} prints={{a: 1, b: 1}} />
        </g>
      )}
      <RainLayers frame={frame} lamp={0} />
    </g>
  );
};

/** Содержимое разбитого зеркала: отражение тёмного прохода (без героя), фигура, ладонь изнутри */
export const Mirror5: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const m = mirror5(t);
  const {w, h} = MIRROR;
  const segs = React.useMemo(() => crackPattern(IMPACT.x, IMPACT.y, w, h), [w, h]);
  const V = {x: 30, y: -30};
  return (
    <g>
      <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 36} rx={20} fill="url(#lkChrome)" />
      <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={14} fill="#0e1430" />
      <clipPath id="m5clip"><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} /></clipPath>
      <g clipPath="url(#m5clip)">
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#141d40" />
        {/* отражённый проход: потолок, лампы, сиденья, пол */}
        <path d={`M${-w / 2} ${-h / 2} L${w / 2} ${-h / 2} L${V.x + 30} ${V.y - 14} L${V.x - 30} ${V.y - 14}Z`} fill="#1b2652" />
        {[-0.6, 0, 0.6].map((k, i) => <path key={i} d={`M${V.x + k * 30} ${V.y - 14} L${V.x + k * 300} ${-h / 2}`} stroke="#dbeaff" strokeWidth={4 + Math.abs(k) * 3} opacity={0.55} />)}
        <path d={`M${-w / 2} ${h / 2} L${w / 2} ${h / 2} L${V.x + 30} ${V.y + 18} L${V.x - 30} ${V.y + 18}Z`} fill="#1f2a55" />
        {[0.2, 0.45, 0.75].map((k, i) => {
          const sx = 18 + 150 * k, sy = 20 + 60 * k, yy = V.y + 18 + 70 * k;
          return (
            <g key={i}>
              <rect x={V.x - 34 - sx} y={yy - sy} width={sx * 0.5} height={sy} rx={6} fill="#2b4a9a" opacity={0.8} />
              <rect x={V.x + 34 + sx * 0.5} y={yy - sy} width={sx * 0.5} height={sy} rx={6} fill="#2b4a9a" opacity={0.8} />
            </g>
          );
        })}
        <rect x={V.x - 22} y={V.y - 12} width={44} height={30} rx={4} fill="#0a0f22" stroke="#4a587f" strokeWidth={2} />
        <MirrorFigure d={m.d} x={V.x + m.figX * m.d} bob={m.bob} reachA={m.reachA} op={m.fig} />
        {/* ладонь изнутри зеркала — стучит по стеклу */}
        {m.palm > 0 && (
          <g transform={`translate(-40 ${10}) scale(${0.5 * (1 + 0.08 * m.tapPush)})`}>
            <WetHand id="mpalm" x={0} y={0} scale={1} appear={m.palm} open={1} t={t} />
          </g>
        )}
        {m.tapRipple > 0 && <circle cx={-30} cy={0} r={40 + 60 * (1 - m.tapRipple)} fill="none" stroke="#cfe0ff" strokeWidth={3} opacity={0.6 * m.tapRipple} />}
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="url(#e4glass)" />
        <path d={`M${-w / 2 + 40} ${-h / 2} L${-w / 2 + 90} ${-h / 2} L${-w / 2 + 10} ${h / 2} L${-w / 2 - 40} ${h / 2}Z`} fill="#e6f0ff" opacity={0.08} />
        {/* трещины — те же, что после удара в части 4 */}
        {segs.map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#0a0d18" strokeWidth={3.2} strokeLinecap="round" opacity={0.75} />
            <path d={`M${x1 + 1} ${y1 - 1} L${x2 + 1} ${y2 - 1}`} stroke="#e6efff" strokeWidth={1.4} strokeLinecap="round" opacity={0.85} />
          </g>
        ))}
        <circle cx={IMPACT.x} cy={IMPACT.y} r={16} fill="#e6efff" opacity={0.5} />
        <circle cx={IMPACT.x} cy={IMPACT.y} r={9} fill="#0a0d18" opacity={0.6} />
        {/* мокрый отпечаток с нашей стороны (из части 4) */}
        <g transform="translate(60 30) scale(0.57)"><WaterPrint op={1} t={t} drip={1} /></g>
      </g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="none" stroke="#5b678f" strokeWidth={3} />
    </g>
  );
};

/** Вид улицы в проёме двери (фонарь погас) */
const Doorway: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={926} y={510} width={150} height={980} fill="#3d5aa8" />
    <rect x={926} y={510} width={150} height={520} fill="url(#e4sky)" opacity={0.6} />
    <ellipse cx={1000} cy={900} rx={160} ry={420} fill="#bcd6ff" opacity={0.3} filter="url(#lkBlur20)" />
    <rect x={926} y={1260} width={150} height={230} fill="#232c4c" />
    <rect x={1030} y={600} width={10} height={700} fill="#2a3150" />
    <rect x={940} y={1000} width={90} height={160} fill="#5c78b8" opacity={0.12} />
    <ellipse cx={1000} cy={1380} rx={70} ry={10} fill="#9fc0f5" opacity={0.25} />
    {Array.from({length: 14}).map((_, i) => {
      const x = 930 + ((i * 53) % 140), y = 510 + ((frame * 40 + i * 157) % 980);
      return <path key={i} d={`M${x} ${y} l-5 26`} stroke="#a9c4f0" strokeWidth={2} opacity={0.45} />;
    })}
  </g>
);

/** Салон у кабины (мировые координаты = кадр при масштабе 1) */
export const Set5: React.FC<{t: number; showHero?: boolean}> = ({t, showHero = true}) => {
  const frame = useCurrentFrame();
  const ds = driverIn(t);
  const hs = heroIn(t);
  const o = Math.max(0, doorIn(t));
  const st = steamIn(t);
  const led = lockLed(t);
  const ledC = led === 'green' ? '#4dff9a' : led === 'amber' ? '#ffb73a' : '#ff4a3a';
  const pw = 70 * (1 - 0.82 * o);
  return (
    <g>
      <rect x={-600} y={-600} width={2400} height={3200} fill="#0d1328" />
      <rect x={-300} y={-300} width={1700} height={760} fill="#15214a" />
      <CeilingGlow />
      <rect x={-300} y={440} width={1700} height={10} fill="#2a3456" />
      <rect x={-300} y={450} width={1700} height={1120} fill="url(#e4wall)" />
      <clipPath id="e5win"><rect x={487} y={522} width={412} height={596} rx={26} /></clipPath>
      <g clipPath="url(#e5win)"><Outside5 t={t} frame={frame} /></g>
      <rect x={487} y={522} width={412} height={596} rx={26} fill="url(#e4glass)" />
      <g clipPath="url(#e5win)"><GlassRain x={487} y={522} w={412} h={596} frame={frame} warm={0} /></g>
      <rect x={487} y={522} width={412} height={596} rx={26} fill="none" stroke="#3a4a78" strokeWidth={14} />
      <rect x={480} y={515} width={426} height={8} rx={4} fill="url(#lkChrome)" opacity={0.6} />
      <RouteSign frame={frame} />
      <WallSeats />
      {/* стойка; крепление молотка пустое — молоток лежит на полу с части 4 */}
      <rect x={443} y={460} width={44} height={1110} fill="#2a3456" /><rect x={449} y={460} width={8} height={1110} fill="#3b4870" />
      <rect x={445} y={850} width={40} height={150} rx={6} fill="#d9dee8" /><rect x={449} y={856} width={32} height={20} rx={3} fill="#c7433a" />
      <rect x={455} y={920} width={20} height={12} rx={3} fill="#9aa4bb" />
      {/* дверь: створки складываются к краям, за ними — улица */}
      <rect x={912} y={480} width={180} height={1150} fill="#1a2240" stroke="#33405f" strokeWidth={10} />
      <clipPath id="e5door"><rect x={926} y={510} width={150} height={980} rx={10} /></clipPath>
      <g clipPath="url(#e5door)"><Doorway frame={frame} /></g>
      <rect x={926} y={510} width={pw} height={980} rx={12} fill="#070b1a" stroke="#8a9ccc" strokeWidth={6} />
      <rect x={926} y={510} width={pw} height={980} rx={12} fill="url(#e4glass)" />
      <rect x={1076 - pw} y={510} width={pw} height={980} rx={12} fill="#070b1a" stroke="#8a9ccc" strokeWidth={6} />
      <rect x={926 + pw - 6} y={1000} width={8} height={140} rx={4} fill="#7c88a8" />
      {/* замок у двери */}
      <rect x={LOCK_IN.x - 16} y={LOCK_IN.y - 44} width={32} height={88} rx={8} fill="url(#lkChrome)" />
      <circle cx={LOCK_IN.x} cy={LOCK_IN.y + 8} r={9} fill="#1a1d27" stroke="#8a95b0" strokeWidth={2} />
      <circle cx={LOCK_IN.x} cy={LOCK_IN.y - 26} r={5} fill={ledC} />
      <circle cx={LOCK_IN.x} cy={LOCK_IN.y - 26} r={14} fill={ledC} opacity={0.3} filter="url(#lkBlur3)" />
      {st > 0 && [0, 1, 2, 3].map((k) => (
        <ellipse key={k} cx={960 + k * 30} cy={1560 - k * 30 - st * 60} rx={70 + 30 * st} ry={40 + 20 * st} fill="#c9d8f5" opacity={0.2 * st} />
      ))}
      {/* поручень */}
      <rect x={430} y={470} width={700} height={12} rx={6} fill="#8a96b8" />
      {[620, 760].map((x, i) => <g key={i}><rect x={x - 3} y={480} width={6} height={70} fill="#6a7698" /><circle cx={x} cy={566} r={18} fill="none" stroke="#8a96b8" strokeWidth={7} /></g>)}
      {/* кабина */}
      <rect x={-300} y={560} width={743} height={1010} fill="#19244c" />
      <CabPanels />
      <rect x={-300} y={560} width={743} height={12} fill="#2a3456" />
      <rect x={MIRROR.x - 5} y={450} width={10} height={MIRROR.y - MIRROR.h / 2 - 450} fill="#3b4565" />
      <g transform={`translate(${MIRROR.x} ${MIRROR.y})`}><Mirror5 t={t} frame={frame} /></g>
      {/* водитель выбежал вместе с героем — после побега кабина пуста */}
      {t < C.exit && <g filter="url(#lkRimCool)">
        <Hero id="drv5" x={ds.x} y={ds.y} scale={DRV.s} anchor={[505, 575]} legs={false} cap stain={false}
          armL={ds.armL} elbowL={ds.elbowL} armR={ds.armR} elbowR={ds.elbowR}
          face={ds.face} face2={ds.face2} faceMix={ds.faceMix} look={ds.look} turn={ds.turn} tilt={ds.tilt} bodyBob={ds.bob} blinkSeed={31}
          shade={0.06} shadeColor={[0.06, 0.08, 0.2]} />
      </g>}
      <path d="M-300 1300 L440 1300 L440 1570 L-300 1570Z" fill="#232c4c" />
      <rect x={-300} y={1292} width={742} height={18} rx={8} fill="#3a4670" />
      <ellipse cx={120} cy={1300} rx={110} ry={26} fill="none" stroke="#0f1324" strokeWidth={16} />
      {[60, 120, 180, 300].map((x, i) => <circle key={i} cx={x} cy={1380} r={9} fill={i === 3 ? '#ff6b5a' : '#6cf0a8'} opacity={0.12} />)}
      <CabDetails engine={0} frame={frame} />
      {/* пол */}
      <rect x={-300} y={1570} width={1700} height={500} fill="url(#e4floor)" />
      <rect x={-300} y={1566} width={1700} height={8} fill="#2e3a60" />
      <FloorReflections lamp={0} engine={0} frame={frame} />
      <g transform={`translate(${HAMMER_FLOOR.x} ${HAMMER_FLOOR.y}) rotate(-8) scale(0.9)`}><HammerShape /></g>
      {o > 0.15 && <path d={`M926 1570 L1076 1570 L1180 1920 L840 1920Z`} fill="#9fc0f5" opacity={0.08 * o} />}
      {showHero && <g filter="url(#lkRimCool)"><HeroIn5 t={t} /></g>}
      {ghostHands(t, hs.x).map((g) => <WetHand key={g.id} id={g.id} x={g.x} y={g.y} scale={g.scale} appear={g.appear} open={g.open} t={t} rotDeg={g.rot} />)}
      <ellipse cx={540} cy={500} rx={700} ry={500} fill="url(#e4cool)" />
    </g>
  );
};
