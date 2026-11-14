import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SKIN} from '../common';
import {Hero} from '../components/Hero';
import {C, sm, win} from './story5';
import {lockLed, keyAngleIn, keyInsertIn, keyAngleOut, keyInsertOut, heroIn} from './state5';
import {KeyInFist} from '../ep4/props4';
import {Bokeh} from '../ep4/Look4';
import {LockFace, Shoe} from './props5';

const HOOD = '#5470a6', HOOD_D = '#445f95';

/** Пустой проход, вид от кабины назад. breath — холодное дыхание «голоса» у камеры (сам голос не показываем). */
export const Aisle5: React.FC<{t: number; push: [number, number]; breath?: number}> = ({t, push, breath = 0}) => {
  const frame = useCurrentFrame();
  const s = 1 + 0.08 * sm(t, push[0], push[1]);
  const vx = 540, vy = 860;
  const rowsY = [0.12, 0.22, 0.36, 0.55, 0.8];
  return (
    <g transform={`translate(540 960) scale(${s}) translate(-540 -960)`}>
      <rect width={1080} height={1920} fill="#121a36" />
      <path d={`M0 0 L1080 0 L${vx + 120} ${vy - 160} L${vx - 120} ${vy - 160}Z`} fill="#16204a" />
      {[0.25, 0.5, 0.75].map((k, i) => (
        <g key={i}>
          <path d={`M${vx - 120 + 240 * k} ${vy - 160} L${1080 * k} 0`} stroke="#bfe0ff" strokeWidth={30 * k + 14} opacity={0.3} filter="url(#lkBlur8)" />
          <path d={`M${vx - 120 + 240 * k} ${vy - 160} L${1080 * k} 0`} stroke="#eaf5ff" strokeWidth={10 * k + 4} opacity={0.85} />
        </g>
      ))}
      <path d={`M0 1920 L1080 1920 L${vx + 120} ${vy + 80} L${vx - 120} ${vy + 80}Z`} fill="#202d5c" />
      <g filter="url(#lkBlur20)">{[0.25, 0.5, 0.75].map((k, i) => <path key={i} d={`M${vx - 120 + 240 * k} ${vy + 90} L${1080 * k} 1920`} stroke="#a8d0ff" strokeWidth={40 * k + 20} opacity={0.2} />)}</g>
      <path d={`M0 0 L${vx - 120} ${vy - 160} L${vx - 120} ${vy + 80} L0 1920Z`} fill="#18203f" />
      <path d={`M1080 0 L${vx + 120} ${vy - 160} L${vx + 120} ${vy + 80} L1080 1920Z`} fill="#18203f" />
      <rect x={vx - 70} y={vy - 120} width={140} height={190} rx={8} fill="#0a0f22" stroke="#33405f" strokeWidth={4} />
      {rowsY.map((k, i) => {
        const yy = vy + 80 + (1920 - vy - 80) * k * 0.62;
        const sc = 0.25 + k * 1.2;
        const xl = vx - 120 - (vx - 120) * k * 0.95, xr = vx + 120 + (1080 - vx - 120) * k * 0.95;
        return (
          <g key={i}>
            <rect x={xl - 150 * sc} y={yy - 300 * sc} width={150 * sc} height={330 * sc} rx={24 * sc} fill="url(#lkFabric)" stroke="#203676" strokeWidth={3} />
            <rect x={xr} y={yy - 300 * sc} width={150 * sc} height={330 * sc} rx={24 * sc} fill="url(#lkFabric)" stroke="#203676" strokeWidth={3} />
            <rect x={xl - 6} y={yy - 520 * sc} width={10 * sc + 2} height={520 * sc} fill="url(#lkChrome)" opacity={0.8} />
            <rect x={xr - 4} y={yy - 520 * sc} width={10 * sc + 2} height={520 * sc} fill="url(#lkChrome)" opacity={0.8} />
          </g>
        );
      })}
      {breath > 0 && <ellipse cx={540 + 40 * Math.sin(frame / 25)} cy={1150} rx={300 * breath} ry={140 * breath} fill="#c9d8f5" opacity={0.14 * breath} filter="url(#lkBlur20)" />}
      <rect width={1080} height={1920} fill="url(#e4vig)" />
    </g>
  );
};

/** Крупно: замок двери. variant in — у двери в салоне, out — снаружи на борту. */
export const KeyLockCU: React.FC<{t: number; variant: 'in' | 'out'}> = ({t, variant}) => {
  const frame = useCurrentFrame();
  const outside = variant === 'out';
  const ins = outside ? keyInsertOut(t) : keyInsertIn(t);
  const angle = outside ? keyAngleOut(t) : keyAngleIn(t);
  const led = outside ? (t < C.close + 0.75 ? 'green' : 'red') : lockLed(t);
  const hs = heroIn(t);
  const shake = !outside && t > C.stopped - 0.2 && t < C.stopped + 0.4 ? Math.sin(frame * 3) * 4 : 0;
  return (
    <g>
      <rect width={1080} height={1920} fill={outside ? '#1e3366' : '#16204a'} />
      {outside ? (
        <g>
          <rect x={0} y={1380} width={1080} height={70} fill="#e8b04a" />
          <rect x={0} y={1450} width={1080} height={14} fill="#b07a22" />
          {Array.from({length: 22}).map((_, i) => <circle key={i} cx={(i * 197) % 1080} cy={(i * 331 + frame * (i % 3)) % 1380} r={4 + (i % 4)} fill="#cfe0ff" opacity={0.35} />)}
        </g>
      ) : (
        <g>
          <rect x={720} y={0} width={360} height={1920} fill="#0b1124" stroke="#4a587f" strokeWidth={10} />
          <rect x={720} y={0} width={360} height={1920} fill="url(#e4glass)" />
          <rect x={0} y={0} width={140} height={1920} fill="url(#lkChrome)" opacity={0.35} />
        </g>
      )}
      <Bokeh frame={frame} warm={outside ? 0.2 : 0.1} count={10} />
      <g transform={`translate(${470 + shake} 820)`}>
        <LockFace led={led} angle={angle * Math.min(1, ins * 1.2)} ins={ins} squeeze={outside ? 0 : hs.keySqueeze} outside={outside} />
      </g>
      <rect width={1080} height={1920} fill="url(#e4vig)" />
    </g>
  );
};

/** Крупно: телефон в правой руке. which: in — в салоне (ключ в кармане), out — на остановке (ключ в левой руке). */
export const PhoneShot5: React.FC<{t: number; which: 'in' | 'out'}> = ({t, which}) => {
  const frame = useCurrentFrame();
  const inside = which === 'in';
  const b1 = inside ? sm(t, C.msgText - 0.25, C.msgText + 0.05) : sm(t, C.msgFinal - 0.25, C.msgFinal + 0.05);
  const b2 = inside ? sm(t, C.warn - 0.2, C.warn + 0.1) : 0;
  const typing = inside ? t < C.msgText - 0.25 : t < C.msgFinal - 0.25;
  const vib = !inside && t > C.vib && t < C.vib + 1.2 ? Math.sin(frame * 2.6) * 6 : 0;
  const scroll = b2 * 120;
  return (
    <g>
      <rect width={1080} height={1920} fill={inside ? '#0f1630' : '#1a1630'} />
      <Bokeh frame={frame} warm={inside ? 0.25 : 0.75} count={16} />
      {!inside && (
        <g transform="translate(150 1530) rotate(-20) scale(2.1)">
          <rect x={-40} y={-400} width={80} height={330} fill={HOOD} />
          <rect x={-38} y={-80} width={76} height={34} rx={12} fill={HOOD_D} />
          <g transform="translate(0 -20)"><KeyInFist worldRot={-20} swing={Math.sin(t * 2) * 6} /></g>
        </g>
      )}
      <g transform={`translate(${560 + vib} 760)`}>
        <path d="M-30 520 L120 500 L330 1300 L60 1300Z" fill={HOOD} />
        <path d="M-50 470 L130 450 L150 540 L-30 560Z" fill={HOOD_D} />
        <path d="M-200 300 Q-230 470 -60 520 L120 500 Q250 450 220 300Z" fill={SKIN} stroke="#d49a6e" strokeWidth={4} />
        <rect x={-300} y={-610} width={600} height={1080} rx={70} fill="#07090f" stroke="#4a5272" strokeWidth={8} />
        <rect x={-276} y={-586} width={552} height={1032} rx={52} fill="#121a36" />
        <clipPath id="ph5clip"><rect x={-276} y={-416} width={552} height={862} /></clipPath>
        <g clipPath="url(#ph5clip)">
          <g transform={`translate(0 ${-scroll})`}>
            {/* предыдущее сообщение из части 4 */}
            <rect x={-250} y={-390} width={430} height={150} rx={34} fill="#2f6bff" opacity={0.45} />
            <text x={-35} y={-330} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#fff" opacity={0.65}>{inside ? 'ЕСЛИ ОН ПОЛУЧИТ' : 'ОНО ПЫТАЛОСЬ'}</text>
            <text x={-35} y={-280} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#fff" opacity={0.65}>{inside ? 'КЛЮЧ…' : 'ТЕБЯ ПРЕДУПРЕДИТЬ'}</text>
            {typing && [0, 1, 2].map((i) => <circle key={i} cx={-60 + i * 44} cy={-150} r={15} fill="#dbe6ff" opacity={0.4 + 0.6 * Math.max(0, Math.sin(frame / 4 - i))} />)}
            {b1 > 0 && (
              <g opacity={b1} transform={`translate(0 ${(1 - b1) * 40})`}>
                <rect x={-262} y={-210} width={524} height={inside ? 340 : 230} rx={40} fill="#2f6bff" />
                {(inside ? ['ТВОЙ ДВОЙНИК', 'СНАРУЖИ —', 'ЭТО ТВОЁ', 'ОТРАЖЕНИЕ'] : ['НА ЭТОТ РАЗ', 'ТЫ ВЫБРАЛСЯ']).map((l, i) => (
                  <text key={i} x={0} y={-140 + i * 72 + (inside ? 0 : 20)} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={inside ? 56 : 58} fill="#fff">{l}</text>
                ))}
              </g>
            )}
            {b2 > 0 && (
              <g opacity={b2} transform={`translate(0 ${(1 - b2) * 40})`}>
                <rect x={-262} y={150} width={524} height={270} rx={40} fill="#2f6bff" />
                {['ОНО ПЫТАЛОСЬ', 'ТЕБЯ', 'ПРЕДУПРЕДИТЬ'].map((l, i) => (
                  <text key={i} x={0} y={222 + i * 72} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={52} fill="#fff">{l}</text>
                ))}
              </g>
            )}
          </g>
        </g>
        <rect x={-276} y={-586} width={552} height={170} rx={52} fill="#1b2546" />
        <clipPath id="ph5av"><circle cx={-190} cy={-500} r={50} /></clipPath>
        <circle cx={-190} cy={-500} r={50} fill="#2f3f73" />
        <g clipPath="url(#ph5av)"><Hero id="avatar5" x={-190} y={-470} scale={0.28} anchor={[505, 260]} legs={false} face="calm" armL={80} armR={80} /></g>
        <text x={-120} y={-482} fontFamily="Inter" fontWeight={800} fontSize={40} fill="#e6ecff">+7 916 204-47-17</text>
        <rect x={-338} y={180} width={70} height={150} rx={35} fill={SKIN} stroke="#d49a6e" strokeWidth={4} transform="rotate(-12 -303 255)" />
        {[200, 270, 340].map((y, i) => <rect key={i} x={262} y={y} width={78} height={60} rx={30} fill={SKIN} stroke="#d49a6e" strokeWidth={4} />)}
      </g>
      <rect width={1080} height={1920} fill="url(#e4vig)" />
    </g>
  );
};

/** Крупно: ноги героя и водителя спрыгивают со ступеньки в лужу */
export const FeetCU: React.FC<{t: number}> = ({t}) => {
  const frame = useCurrentFrame();
  const foot = (land: number, x: number, dark: boolean, key: string) => {
    const u = sm(t, land - 0.32, land);
    const y = 560 + 660 * u - Math.sin(u * Math.PI) * 60;
    const after = t - land;
    return (
      <g key={key}>
        <g transform={`translate(${x} ${y}) scale(1.6)`}><Shoe dark={dark} /></g>
        {after > 0 && after < 1.2 && [0, 1, 2].map((k) => (
          <ellipse key={k} cx={x + 120} cy={1268} rx={(80 + 200 * after) * (1 + k * 0.4)} ry={(16 + 40 * after) * (1 + k * 0.4)} fill="none" stroke="#bcd6ff" strokeWidth={4} opacity={0.6 * (1 - after / 1.2)} />
        ))}
        {after > 0 && after < 0.5 && Array.from({length: 8}).map((_, k) => {
          const a = Math.PI * (0.1 + 0.8 * (k / 7));
          return <circle key={k} cx={x + 120 + Math.cos(a) * 260 * after * 2} cy={1250 - Math.sin(a) * 300 * after + 600 * after * after} r={8} fill="#cfe0ff" opacity={0.8 * (1 - after * 2)} />;
        })}
      </g>
    );
  };
  return (
    <g>
      <rect width={1080} height={1920} fill="#141b36" />
      {/* ступенька автобуса */}
      <rect x={-50} y={0} width={1180} height={560} fill="#1a2f5c" />
      <rect x={-50} y={520} width={1180} height={40} fill="#e8b04a" />
      <rect x={-50} y={560} width={1180} height={30} fill="#0a0d18" />
      {/* асфальт и лужа */}
      <rect x={0} y={900} width={1080} height={1020} fill="url(#e4floor)" />
      <ellipse cx={540} cy={1280} rx={520} ry={110} fill="#3a5490" opacity={0.7} />
      <ellipse cx={420} cy={1270} rx={260} ry={22} fill="#d7e8ff" opacity={0.25} />
      {foot(C.lands[0], 200, false, 'h')}
      {foot(C.lands[1], 600, true, 'd')}
      {Array.from({length: 40}).map((_, i) => {
        const x = (i * 97) % 1080, y = ((frame * 45 + i * 211) % 1920);
        return <path key={i} d={`M${x} ${y} l-6 34`} stroke="#a9c4f0" strokeWidth={2.5} opacity={0.4} />;
      })}
      <rect width={1080} height={1920} fill="url(#e4vig)" />
    </g>
  );
};

/** Рамка «снаружи через открытую дверь» поверх крупного плана зеркала */
export const DoorFrameOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <path fillRule="evenodd" d="M0 0H1080V1920H0Z M60 420 Q60 360 120 360 H960 Q1020 360 1020 420 V1460 Q1020 1520 960 1520 H120 Q60 1520 60 1460Z" fill="#0d1534" />
      <rect x={60} y={360} width={960} height={1160} rx={56} fill="none" stroke="#4a587f" strokeWidth={14} />
      <rect x={0} y={1550} width={1080} height={370} fill="#1a2f5c" />
      <rect x={0} y={1550} width={1080} height={40} fill="#e8b04a" />
      {Array.from({length: 46}).map((_, i) => {
        const x = (i * 97) % 1080, y = ((frame * 42 + i * 211) % 1920);
        return <path key={i} d={`M${x} ${y} l-6 34`} stroke="#a9c4f0" strokeWidth={2.5} opacity={0.35} />;
      })}
    </g>
  );
};

export const _w = win;
