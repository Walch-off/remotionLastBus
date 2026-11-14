import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Hero} from '../components/Hero';
import {C} from './story5';
import {EXT, heroOut, driverOut, doorOut, busOut, keyAngleOut, keyInsertOut} from './state5';
import {KeyInFist, PhoneInFist} from '../ep4/props4';
import {CityDetail, RainLayers, GlassRain} from '../ep4/Look4';

const BUS = {y0: 520, y1: 1430};

/** Борт автобуса у остановки: окна с тусклым светом салона, складная дверь, замок снаружи */
const BusSideExt: React.FC<{t: number; frame: number; jerk: number; heroPoseX: number}> = ({t, frame, jerk}) => {
  const o = doorOut(t);
  const pw = 112 * (1 - 0.8 * o);
  const {x0, x1, y0, y1} = EXT.door;
  const led = t < C.close + 0.75 ? '#4dff9a' : '#ff4a3a';
  return (
    <g transform={`translate(${jerk} 0)`}>
      {/* корпус */}
      <rect x={-300} y={BUS.y0} width={1800} height={BUS.y1 - BUS.y0} rx={30} fill="#24427e" />
      <rect x={-300} y={BUS.y0} width={1800} height={60} fill="#2f55a0" />
      <rect x={-300} y={1150} width={1800} height={36} fill="#e8b04a" />
      <rect x={-300} y={1186} width={1800} height={8} fill="#b07a22" />
      <rect x={-300} y={1340} width={1800} height={90} fill="#1a2f5c" />
      {/* окна салона */}
      {[430, 690, 950].map((x, i) => (
        <g key={i}>
          <rect x={x} y={610} width={230} height={330} rx={22} fill="#0f1a3c" stroke="#16264e" strokeWidth={10} />
          <rect x={x + 10} y={620} width={210} height={150} fill="#9fc0ff" opacity={0.08} />
          <rect x={x + 30} y={630} width={170} height={14} rx={7} fill="#dbeaff" opacity={0.5} />
          {[0, 1].map((k) => <rect key={k} x={x + 30 + k * 100} y={820} width={70} height={120} rx={14} fill="#2b4a9a" opacity={0.6} />)}
          <clipPath id={`bw${i}`}><rect x={x} y={610} width={230} height={330} rx={22} /></clipPath>
          <g clipPath={`url(#bw${i})`}><GlassRain x={x} y={610} w={230} h={330} frame={frame} warm={0.3} seed={i * 7} /></g>
        </g>
      ))}
      {/* табло маршрута у передней части */}
      <rect x={-200} y={548} width={300} height={44} rx={6} fill="#120a06" />
      <text x={-50} y={580} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#ff9a2e" style={{filter: 'drop-shadow(0 0 6px #ff7a1a)'}}>13 · КОНЕЧНАЯ</text>
      {/* дверь */}
      <rect x={x0 - 14} y={y0 - 14} width={x1 - x0 + 28} height={y1 - y0 + 14} rx={10} fill="#1a2f5c" />
      <clipPath id="exDoor"><rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} /></clipPath>
      <g clipPath="url(#exDoor)">
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#0d1430" />
        <rect x={x0 + 20} y={y0 + 20} width={x1 - x0 - 40} height={16} rx={8} fill="#dbeaff" opacity={0.45} />
        <rect x={x0} y={y1 - 120} width={x1 - x0} height={120} fill="#1d2645" />
        <ellipse cx={(x0 + x1) / 2} cy={y0 + 240} rx={120} ry={180} fill="#7fa8ff" opacity={0.12} />
      </g>
      <rect x={x0} y={y0} width={pw} height={y1 - y0} rx={10} fill="#0d1534" stroke="#4a587f" strokeWidth={6} />
      <rect x={x1 - pw} y={y0} width={pw} height={y1 - y0} rx={10} fill="#0d1534" stroke="#4a587f" strokeWidth={6} />
      <rect x={x0} y={y0} width={pw} height={y1 - y0} fill="url(#e4glass)" />
      <rect x={x1 - pw} y={y0} width={pw} height={y1 - y0} fill="url(#e4glass)" />
      {/* замок снаружи */}
      <rect x={EXT.lock.x - 18} y={EXT.lock.y - 50} width={36} height={100} rx={8} fill="url(#lkChrome)" />
      <circle cx={EXT.lock.x} cy={EXT.lock.y + 10} r={10} fill="#1a1d27" stroke="#8a95b0" strokeWidth={2} />
      <circle cx={EXT.lock.x} cy={EXT.lock.y - 28} r={6} fill={led} />
      {/* колёса */}
      {[640, 1290].map((x, i) => <g key={i}><circle cx={x} cy={1440} r={100} fill="#0b0d14" /><circle cx={x} cy={1440} r={44} fill="#3a3f52" /><circle cx={x} cy={1440} r={16} fill="#8a92a8" /></g>)}
      {/* блики дождя на корпусе */}
      <rect x={-300} y={BUS.y0 + 8} width={1800} height={6} fill="#a8c8ff" opacity={0.3} />
    </g>
  );
};

/** Остановка снаружи (мировые координаты = кадр при масштабе 1) */
export const Ext5: React.FC<{t: number}> = ({t}) => {
  const frame = useCurrentFrame();
  const b = busOut(t);
  const hp = heroOut(t), dp = driverOut(t);
  const lamp = b.lamp;
  const hasKey = !(keyInsertOut(t) > 0.98 && t >= C.close + 0.3 && t < C.takeKey + 0.1);
  const heroKey = (
    <g transform={`rotate(${keyAngleOut(t) * keyInsertOut(t) * 0.4})`}>
      <KeyInFist worldRot={90 - hp.armL - hp.elbowL} swing={Math.sin(t * 2.1) * 5} />
    </g>
  );
  const warm = lamp;
  return (
    <g>
      {/* небо и город */}
      <rect x={-300} y={-300} width={1700} height={1800} fill="url(#e4sky)" />
      <g transform="translate(-520 -260) scale(1.6)"><CityDetail frame={frame} lamp={lamp} /></g>
      {/* дорога (видна, когда автобуса нет) */}
      <rect x={-300} y={1250} width={1700} height={230} fill="#1a2140" />
      {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={-200 + k * 340} y={1352} width={170} height={12} fill="#d9dee8" opacity={0.35} />)}
      <rect x={760} y={1260} width={120} height={210} fill="#ffc56b" opacity={0.22 * warm} filter="url(#lkBlur8)" />
      {b.present && <BusSideExt t={t} frame={frame} jerk={b.jerk} heroPoseX={EXT.hero.x} />}
      {/* бордюр и тротуар */}
      <rect x={-300} y={1470} width={1700} height={26} fill="#3a4466" />
      <rect x={-300} y={1496} width={1700} height={500} fill="url(#e4floor)" />
      {[[200, 1640, 150], [760, 1720, 180], [980, 1600, 90]].map(([x, y, rx], i) => (
        <g key={i}><ellipse cx={x} cy={y} rx={rx} ry={rx * 0.14} fill="#3a5490" opacity={0.55} /><ellipse cx={x - rx * 0.2} cy={y - 2} rx={rx * 0.5} ry={rx * 0.04} fill="#d7e8ff" opacity={0.3 + 0.15 * warm} /></g>
      ))}
      {/* навес остановки */}
      <rect x={880} y={860} width={260} height={24} fill="#2c3658" />
      <rect x={900} y={884} width={12} height={620} fill="#2c3658" />
      <rect x={912} y={900} width={200} height={420} fill="#5c78b8" opacity={0.14} />
      <rect x={930} y={930} width={140} height={190} rx={8} fill="#1c2546" stroke="#3a4670" strokeWidth={4} />
      <text x={1000} y={1000} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#c9d4ee" opacity={0.8}>13</text>
      {/* фонарь */}
      <rect x={1030} y={300} width={16} height={1220} fill="#2a3150" />
      <path d="M1038 306 Q1038 270 990 270 L940 270" stroke="#2a3150" strokeWidth={12} fill="none" />
      <rect x={900} y={262} width={80} height={22} rx={8} fill={lamp > 0.3 ? '#ffe2a8' : '#3a3f55'} />
      {lamp > 0 && (
        <g opacity={lamp}>
          <ellipse cx={940} cy={300} rx={120} ry={60} fill="#ffd28a" opacity={0.6} filter="url(#lkBlur20)" />
          <path d="M905 284 L975 284 L1250 1800 L300 1800Z" fill="url(#lkShaft)" opacity={0.5} style={{mixBlendMode: 'screen'}} />
          <ellipse cx={720} cy={1760} rx={520} ry={90} fill="#ffc56b" opacity={0.22} />
        </g>
      )}
      {/* водитель и герой */}
      <g filter={lamp > 0.5 ? 'url(#lkRimWarm)' : 'url(#lkRimCool)'}>
        <Hero id="drvOut" x={EXT.drv.x} y={EXT.drv.y} scale={EXT.drv.s} anchor={[505, 930]} legs cap stain={false}
          armL={dp.armL} elbowL={dp.elbowL} armR={dp.armR} elbowR={dp.elbowR}
          face={dp.face} face2={dp.face2} faceMix={dp.faceMix} look={dp.look} turn={dp.turn} tilt={dp.tilt} bodyBob={dp.bob}
          stranger={dp.stranger} shade={0.22 * (1 - warm)} shadeColor={[0.08, 0.1, 0.25]} blinkSeed={31} />
        <Hero id="heroOut" x={EXT.hero.x} y={EXT.hero.y} scale={EXT.hero.s} anchor={[505, 930]} legs
          armL={hp.armL} elbowL={hp.elbowL} armR={hp.armR} elbowR={hp.elbowR}
          itemL={hasKey ? heroKey : undefined} itemR={<PhoneInFist worldRot={hp.armR - 90 + hp.elbowR} glow={t >= C.vib ? 1 : 0.35} />}
          face={hp.face} face2={hp.face2} faceMix={hp.faceMix} look={hp.look} turn={hp.turn} tilt={hp.tilt} bodyBob={hp.bob}
          wet={0.6} prints={{a: 1, b: 1}} shade={0.22 * (1 - warm)} shadeColor={[0.08, 0.1, 0.25]} blinkSeed={11} />
      </g>
      {/* ключ в замке снаружи, пока рука его поворачивает */}
      {!hasKey && <g transform={`translate(${EXT.lock.x} ${EXT.lock.y + 10}) rotate(${keyAngleOut(t)})`}><rect x={-6} y={-30} width={12} height={30} rx={4} fill="#e0c97c" /></g>}
      {/* обычное отражение героя в стекле закрытой двери: двойник снова стал отражением */}
      {b.present && doorOut(t) < 0.05 && (
        <g clipPath="url(#exDoor)" opacity={0.22}>
          <Hero id="heroRefl" x={EXT.door.x0 + 140 + b.jerk} y={EXT.hero.y - 210} scale={0.7} anchor={[505, 930]} legs flip
            armL={hp.armL} elbowL={hp.elbowL} armR={hp.armR} elbowR={hp.elbowR} face={hp.face} look={[-hp.look[0], hp.look[1]]} turn={-hp.turn}
            shade={0.45} shadeColor={[0.2, 0.3, 0.6]} blinkSeed={11} />
        </g>
      )}
      <RainLayers frame={frame} lamp={lamp} />
      <g transform="translate(-480 0)"><RainLayers frame={frame + 37} lamp={0} /></g>
    </g>
  );
};
