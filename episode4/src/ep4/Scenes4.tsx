import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SKIN} from '../common';
import {Hero} from '../components/Hero';
import {C, sm, win} from './story4';
import {envState, doubleState, heroState} from './state4';
import {HammerShape, KeyShape, KeyInFist, Fist} from './props4';
import {Outside} from './Set4';
import {Bokeh} from './Look4';

const HOOD = '#5470a6', HOOD_D = '#445f95';

/** Вид вдоль прохода: сиденья по сторонам, мокрые следы, тянущиеся к камере. «Голос» — только холодное дыхание, без фигуры. */
export const AisleShot: React.FC<{t: number; push?: [number, number]; breath?: number}> = ({t, push = [0, 0], breath = 0}) => {
  const frame = useCurrentFrame();
  const e = envState(t);
  const s = 1 + 0.08 * sm(t, push[0], push[1]);
  const vx = 540, vy = 860;
  const rowsY = [0.12, 0.22, 0.36, 0.55, 0.8];
  return (
    <g transform={`translate(540 960) scale(${s}) translate(-540 -960)`}>
      <rect width={1080} height={1920} fill="#121a36" />
      <path d={`M0 0 L1080 0 L${vx + 120} ${vy - 160} L${vx - 120} ${vy - 160}Z`} fill="#141c3a" />
      {[0.25, 0.5, 0.75].map((k, i) => (
        <g key={i}>
          <path d={`M${vx - 120 + 240 * k} ${vy - 160} L${1080 * k} 0`} stroke="#bfe0ff" strokeWidth={30 * k + 14} opacity={0.35} filter="url(#lkBlur8)" />
          <path d={`M${vx - 120 + 240 * k} ${vy - 160} L${1080 * k} 0`} stroke="#eaf5ff" strokeWidth={10 * k + 4} opacity={0.9} />
        </g>
      ))}
      <path d={`M0 1920 L1080 1920 L${vx + 120} ${vy + 80} L${vx - 120} ${vy + 80}Z`} fill="#202d5c" />
      {/* отражения светильников на мокром полу прохода */}
      <g filter="url(#lkBlur20)">{[0.25, 0.5, 0.75].map((k, i) => <path key={i} d={`M${vx - 120 + 240 * k} ${vy + 90} L${1080 * k} 1920`} stroke="#a8d0ff" strokeWidth={40 * k + 20} opacity={0.22} />)}</g>
      {/* тёплые пятна фонарей из боковых окон */}
      <g filter="url(#lkBlur20)" style={{mixBlendMode: "screen"}}>{[[180, 1250, 140], [900, 1150, 120], [330, 1000, 70]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#ffb866" opacity={0.35} />)}</g>
      <path d={`M0 0 L${vx - 120} ${vy - 160} L${vx - 120} ${vy + 80} L0 1920Z`} fill="#18203f" />
      <path d={`M1080 0 L${vx + 120} ${vy - 160} L${vx + 120} ${vy + 80} L1080 1920Z`} fill="#18203f" />
      {/* окна по сторонам, задняя дверь вдали */}
      <rect x={vx - 70} y={vy - 120} width={140} height={190} rx={8} fill="#0a0f22" stroke="#33405f" strokeWidth={4} />
      {/* сиденья */}
      {rowsY.map((k, i) => {
        const yy = vy + 80 + (1920 - vy - 80) * k * 0.62;
        const sc = 0.25 + k * 1.2;
        const xl = vx - 120 - (vx - 120) * k * 0.95, xr = vx + 120 + (1080 - vx - 120) * k * 0.95;
        return (
          <g key={i}>
            <rect x={xl - 150 * sc} y={yy - 300 * sc} width={150 * sc} height={330 * sc} rx={24 * sc} fill="#2b3a6e" stroke="#3d4e88" strokeWidth={3} />
            <rect x={xr} y={yy - 300 * sc} width={150 * sc} height={330 * sc} rx={24 * sc} fill="#2b3a6e" stroke="#3d4e88" strokeWidth={3} />
            <rect x={xl - 6} y={yy - 520 * sc} width={10 * sc + 2} height={520 * sc} fill="#8a96b8" opacity={0.7} />
            <rect x={xr - 4} y={yy - 520 * sc} width={10 * sc + 2} height={520 * sc} fill="#8a96b8" opacity={0.7} />
          </g>
        );
      })}
      {/* мокрые следы: от дальнего конца к камере */}
      {Array.from({length: 7}).map((_, k) => {
        const u = k / 6;
        const y = vy + 110 + (1820 - vy - 110) * Math.pow(u, 1.4);
        const sc = 0.3 + 1.3 * u;
        const x = vx + (k % 2 ? 26 : -26) * sc;
        const vis = e.stepsVis(k, 7);
        if (vis <= 0.01) return null;
        const evap = 1 - vis;
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${sc})`} opacity={vis}>
            <ellipse cx={0} cy={0} rx={30 * (1 - 0.3 * evap)} ry={58 * (1 - 0.3 * evap)} fill="#3a5a96" opacity={0.8} />
            <ellipse cx={0} cy={-62} rx={22} ry={18} fill="#3a5a96" opacity={0.8} />
            <path d="M-10 -20 q10 -8 20 0" stroke="#bcd6ff" strokeWidth={4} fill="none" opacity={0.7} />
            {evap > 0.05 && [0, 1, 2].map((q) => <circle key={q} cx={(q - 1) * 18} cy={-30 - evap * 90 - q * 14} r={6} fill="#bcd6ff" opacity={0.5 * (1 - evap)} />)}
          </g>
        );
      })}
      {/* холодное дыхание у камеры: голос рядом */}
      {breath > 0 && <ellipse cx={540 + 40 * Math.sin(frame / 25)} cy={1150} rx={260 * breath} ry={120 * breath} fill="#c9d8f5" opacity={0.12 * breath} />}
      <rect width={1080} height={1920} fill="url(#e4vig)" />
    </g>
  );
};

/** Крупно: окно, двойник снаружи (то же состояние, что и на общем плане) */
export const WindowShot: React.FC<{t: number; s?: number; cx?: number; cy?: number}> = ({t, s = 2.2, cx = 712, cy = 860}) => {
  const frame = useCurrentFrame();
  const d = doubleState(t);
  const shakeGlass = d.bangArm > 0.9 ? Math.sin(frame * 3) * 3 * (d.bangArm - 0.9) * 10 : 0;
  return (
    <g>
      <rect width={1080} height={1920} fill="#0d1328" />
      <g transform={`translate(540 860) scale(${s}) translate(${-cx} ${-cy})`}>
        <clipPath id="e4wcu"><rect x={487} y={522} width={412} height={596} rx={26} /></clipPath>
        <g clipPath="url(#e4wcu)"><Outside t={t} frame={frame} /></g>
        <g transform={`translate(${shakeGlass} 0)`}>
          <rect x={487} y={522} width={412} height={596} rx={26} fill="url(#e4glass)" />
          {d.printOnGlass > 0 && <g transform="translate(752 780) scale(0.5)" opacity={0.6 * d.printOnGlass}>
            <rect x={-60} y={-130} width={120} height={210} rx={50} fill="#9cc2ff" opacity={0.35} />
          </g>}
          {/* капли на стекле */}
          {Array.from({length: 14}).map((_, i) => <circle key={i} cx={500 + ((i * 131) % 390)} cy={540 + ((i * 263 + frame * (i % 3)) % 560)} r={3 + (i % 3)} fill="#cfe0ff" opacity={0.5} />)}
          <rect x={487} y={522} width={412} height={596} rx={26} fill="none" stroke="#33405f" strokeWidth={14} />
        </g>
      </g>
      <rect width={1080} height={1920} fill="url(#e4vig)" />
    </g>
  );
};

/** Крупно: пол у кабины. Левая рука героя (рукав с пятном) кладёт молоток и поднимает ключ. */
export const FloorShot: React.FC<{t: number}> = ({t}) => {
  const a = C.pick - 0.25;
  // фазы: опускает молоток (a..a+0.7), отпускает, тянется к ключу, сжимает, поднимает
  const down = sm(t, a, a + 0.6);
  const release = t >= a + 0.7;
  const toKey = sm(t, a + 0.8, a + 1.3);
  const lift = sm(t, a + 1.55, a + 2.2);
  const handX = 300 + 300 * toKey, handY = 420 + 760 * down - (release ? 40 * sm(t, a + 0.7, a + 0.8) : 0) - 520 * lift - (toKey > 0 && toKey < 1 ? 60 * Math.sin(toKey * Math.PI) : 0);
  const holdingKey = t >= a + 1.4;
  const ang = -12 + 20 * toKey;
  // молоток остаётся ровно там, где его отпустила рука (та же позиция и поворот)
  const HAMMER_LAID = `translate(300 1180) rotate(-12) scale(2.6) rotate(-8)`;
  return (
    <g>
      <rect width={1080} height={1920} fill="#121a32" />
      {/* край кабины и пол */}
      <rect x={0} y={0} width={1080} height={760} fill="#232c4c" />
      <rect x={0} y={740} width={1080} height={30} fill="#3a4670" />
      <rect x={0} y={770} width={1080} height={1150} fill="url(#e4floor)" />
      {[0, 1, 2, 3].map((k) => <path key={k} d={`M0 ${980 + k * 230} H1080`} stroke="#29335a" strokeWidth={6} />)}
      <ellipse cx={540} cy={1250} rx={520} ry={260} fill="#7fa8ff" opacity={0.08} />
      <g filter="url(#lkBlur20)"><ellipse cx={760} cy={900} rx={260} ry={60} fill="#ffb866" opacity={0.3} /><ellipse cx={260} cy={1500} rx={300} ry={70} fill="#a8d0ff" opacity={0.25} /></g>
      {/* молоток: лежит после того, как его положили */}
      {release && <g transform={HAMMER_LAID}><HammerShape /></g>}
      {/* ключ на полу до того, как его взяли */}
      {!holdingKey && <g transform="translate(700 1240) scale(2.6) rotate(10)"><KeyShape g={-100} /></g>}
      {/* рука: рукав сверху кадра → кисть */}
      <g transform={`translate(${handX} ${handY}) rotate(${ang})`}>
        <path d="M-80 -1400 L80 -1400 L74 -80 L-74 -80Z" fill={HOOD} />
        <path d="M30 -1400 L80 -1400 L74 -80 L44 -80Z" fill={HOOD_D} opacity={0.5} />
        {/* пятно на рукаве — та же левая рука, что и на общих планах */}
        <g transform="translate(-6 -420) scale(2.2)"><path d="M-18 -4 q6 -16 22 -12 q16 4 17 16 q1 14 -14 17 q-14 4 -22 -6 q-8 -8 -3 -15z" fill="#4a2c1d" /></g>
        <rect x={-78} y={-110} width={156} height={60} rx={22} fill={HOOD_D} />
        <g transform="scale(2.6)">
          {!release && <g transform="rotate(-8)"><HammerShape /></g>}
          {holdingKey && <g transform="rotate(90)"><KeyShape g={-90 - ang} /></g>}
          {release && !holdingKey ? (
            <g>
              <path d="M-24 -10 Q-28 38 -12 52 Q0 60 12 52 Q28 38 24 -10Z" fill={SKIN} stroke="#d49a6e" strokeWidth={2} />
              <path d="M-24 10 Q-38 18 -34 38 Q-30 46 -20 38Z" fill={SKIN} stroke="#d49a6e" strokeWidth={2} />
            </g>
          ) : <Fist />}
        </g>
      </g>
      <rect width={1080} height={1920} fill="url(#e4vig)" />
    </g>
  );
};

/** Крупно: телефон в правой руке, ключ — в левой (виден у нижнего края кадра) */
export const PhoneShot: React.FC<{t: number; which: 1 | 2}> = ({t, which}) => {
  const frame = useCurrentFrame();
  const hs = heroState(t);
  const arrive = which === 1 ? C.msgFrom : C.newMsg;
  const textAt = which === 1 ? C.msg1 : C.msg2;
  const bubbleIn = sm(t, arrive + 0.05, arrive + 0.35);
  const textIn = sm(t, textAt - 0.1, textAt + 0.25);
  const vib = which === 2 && t > C.vib && t < C.vib + 1.0 ? Math.sin(frame * 2.6) * 6 : 0;
  const lines1 = ['НЕ ОТДАВАЙ', 'ЕМУ КЛЮЧ'];
  const lines2 = ['ЕСЛИ ОН ПОЛУЧИТ', 'КЛЮЧ, ТЫ', 'ОСТАНЕШЬСЯ', 'ЗДЕСЬ НАВСЕГДА'];
  const prev = which === 2;
  return (
    <g>
      <rect width={1080} height={1920} fill="#0f1630" />
      <ellipse cx={540} cy={760} rx={620} ry={760} fill="#4a6fd6" opacity={0.18} />
      <Bokeh frame={frame} warm={0.55} count={18} />
      {/* левая рука с ключом — внизу слева (ключ не исчезает) */}
      <g transform="translate(150 1530) rotate(-20) scale(2.1)">
        <rect x={-40} y={-400} width={80} height={330} fill={HOOD} />
        <rect x={-38} y={-80} width={76} height={34} rx={12} fill={HOOD_D} />
        <g transform="translate(0 -20)"><KeyInFist worldRot={-20} swing={Math.sin(t * 2) * 6} squeeze={hs.keySqueeze} /></g>
      </g>
      <g transform={`translate(${560 + vib} 760)`}>
        {/* правая рука держит телефон снизу: рукав снизу справа, ладонь под корпусом */}
        <path d="M-30 520 L120 500 L330 1300 L60 1300Z" fill={HOOD} />
        <path d="M-50 470 L130 450 L150 540 L-30 560Z" fill={HOOD_D} />
        <path d="M-200 300 Q-230 470 -60 520 L120 500 Q250 450 220 300Z" fill={SKIN} stroke="#d49a6e" strokeWidth={4} />
        <rect x={-300} y={-610} width={600} height={1080} rx={70} fill="#07090f" stroke="#4a5272" strokeWidth={8} />
        <rect x={-276} y={-586} width={552} height={1032} rx={52} fill="#121a36" />
        {/* шапка чата: аватар героя и его же номер */}
        <rect x={-276} y={-586} width={552} height={170} rx={52} fill="#1b2546" />
        <clipPath id="e4av"><circle cx={-190} cy={-500} r={50} /></clipPath>
        <circle cx={-190} cy={-500} r={50} fill="#2f3f73" />
        <g clipPath="url(#e4av)"><Hero id="avatar" x={-190} y={-470} scale={0.28} anchor={[505, 260]} legs={false} face="calm" armL={80} armR={80} /></g>
        <text x={-120} y={-482} fontFamily="Inter" fontWeight={800} fontSize={40} fill="#e6ecff">+7 916 204-47-17</text>
        {prev && (
          <g>
            <rect x={-250} y={-370} width={430} height={150} rx={34} fill="#2f6bff" opacity={0.55} />
            <text x={-35} y={-312} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={44} fill="#fff" opacity={0.7}>НЕ ОТДАВАЙ</text>
            <text x={-35} y={-258} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={44} fill="#fff" opacity={0.7}>ЕМУ КЛЮЧ</text>
          </g>
        )}
        {bubbleIn > 0 && (
          <g opacity={bubbleIn} transform={`translate(0 ${(1 - bubbleIn) * 40})`}>
            <rect x={-262} y={prev ? -190 : -370} width={524} height={prev ? 400 : 230} rx={40} fill="#2f6bff" />
            {textIn < 0.05 ? (
              [0, 1, 2].map((i) => <circle key={i} cx={-40 + i * 40} cy={prev ? 10 : -255} r={13} fill="#dbe6ff" opacity={0.4 + 0.6 * Math.max(0, Math.sin(frame / 4 - i))} />)
            ) : (
              <g opacity={textIn}>
                {(prev ? lines2 : lines1).map((l, i) => (
                  <text key={i} x={0} y={(prev ? -112 : -290) + i * (prev ? 88 : 92)} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={prev ? 47 : 76} fill="#fff">{l}</text>
                ))}
              </g>
            )}
          </g>
        )}
        {/* пальцы обхватывают корпус: большой слева, остальные справа — поверх рамки, не закрывая текст */}
        <rect x={-338} y={180} width={70} height={150} rx={35} fill={SKIN} stroke="#d49a6e" strokeWidth={4} transform="rotate(-12 -303 255)" />
        {[200, 270, 340].map((y, i) => <rect key={i} x={262} y={y} width={78} height={60} rx={30} fill={SKIN} stroke="#d49a6e" strokeWidth={4} />)}
      </g>
      <rect width={1080} height={1920} fill="url(#e4vig)" />
    </g>
  );
};
