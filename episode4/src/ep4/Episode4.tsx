import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {C, FPS, W, H, TOTAL4, WORDS4, sm, win} from './story4';
import {Defs4, Set4} from './Set4';
import {AisleShot, WindowShot, FloorShot, PhoneShot} from './Scenes4';
import {PhoneDefs} from '../components/Phone';

type Cam = [number, number, number, number][]; // [t, cx, cy, scale]
type Shot = {id: string; a: number; cam?: Cam; render?: (t: number) => React.ReactNode; heroOverrides?: any};
const st = (cx: number, cy: number, s: number, cx2 = cx, cy2 = cy, s2 = s): ((a: number, b: number) => Cam) => (a, b) => [[a, cx, cy, s], [b, cx2, cy2, s2]];

/** Раскадровка: границы планов — от таймкодов слов озвучки */
const RAW: [string, number, ((a: number, b: number) => Cam) | ((t: number) => React.ReactNode), any?][] = [
  ['wide0', 0, st(540, 1000, 1.0, 520, 1030, 1.08)],
  ['keyCU', C.keyHeld, st(430, 1250, 2.5, 430, 1240, 2.75)],
  ['drvFace', C.stare - 0.1, st(230, 1010, 2.45, 230, 1010, 2.65)],
  ['aisle', C.aisle, (t: number) => <AisleShot t={t} push={[C.aisle, C.remember]} breath={win(t, C.voice1 - 0.3, C.voice1 + 0.3, C.remember, C.remember + 0.6)} />],
  ['mirrorRefl', C.remember - 0.3, st(235, 820, 2.4, 235, 810, 2.6)],
  ['heroLook', C.look, st(640, 1080, 1.9)],
  ['hammerCU', C.hammer, st(520, 930, 2.5, 505, 930, 2.8)],
  ['grab', C.grab - 0.2, st(540, 1080, 1.35, 520, 1020, 1.3)],
  ['shout', C.shoutPre, st(240, 1020, 2.4, 235, 1015, 2.6)],
  ['late', C.late, st(520, 980, 1.5, 500, 970, 1.55)],
  ['strike', C.strike - 0.45, st(420, 960, 1.4)],
  ['cracks', C.cracked, st(235, 820, 2.5, 235, 810, 2.65)],
  ['scream', C.then, st(235, 810, 2.65, 235, 805, 2.8)],
  ['heroScared', C.scream, st(650, 990, 2.8)],
  ['recoil', C.recoil, st(660, 1080, 1.8)],
  ['drop', C.drop, st(330, 1350, 1.4)],
  ['drvEyes', C.eyes, st(220, 1000, 2.6, 220, 1000, 2.85)],
  ['floor', C.pick - 0.3, (t: number) => <FloorShot t={t} />],
  ['engine', C.engine, st(540, 1000, 1.0)],
  ['prints', C.wetSteps, (t: number) => <AisleShot t={t} push={[C.wetSteps, C.quiet]} />],
  ['quiet', C.quiet, st(640, 1100, 1.8, 640, 1080, 1.95)],
  ['mirrorQuiet', C.knockPre, st(235, 830, 2.45, 235, 820, 2.6)],
  ['heroUp', C.knockWord, st(650, 1000, 2.6)],
  ['knocks', C.k1 - 0.35, st(235, 815, 2.65)],
  ['face', C.between, st(225, 815, 2.6, 220, 800, 2.85)],
  ['two', C.stood, st(420, 1000, 1.15, 430, 1010, 1.2)],
  ['palm', C.palmIn, st(245, 805, 2.75)],
  ['wet', C.water, st(650, 1130, 2.1, 650, 1120, 2.3)],
  ['bang', C.bangPre, st(600, 1000, 1.1)],
  ['heroTurn', C.turn, st(650, 1060, 1.9)],
  ['double', C.shake, (t: number) => <WindowShot t={t} s={2.1} cx={790} cy={860} />],
  ['heroBack', C.lookBack, st(650, 1000, 2.6)],
  ['noFace', C.noFace, st(240, 815, 2.65)],
  ['printCU', C.butNow, st(270, 830, 3.2, 270, 880, 3.0)],
  ['inhale', C.inhale - 0.1, st(250, 1080, 2.0)],
  ['keySlip', C.almost - 0.05, st(560, 1350, 2.6)],
  ['ask', C.ask, st(650, 1000, 2.5)],
  ['drvSay', C.drvLook, st(230, 1010, 2.5, 230, 1010, 2.7)],
  ['aisleVoice', C.voiceNear, (t: number) => <AisleShot t={t} push={[C.voiceNear, C.near]} breath={sm(t, C.same, C.near)} />],
  ['heroVoice', C.near, st(650, 1010, 2.4, 650, 1010, 2.7)],
  ['rock', C.rock - 0.1, st(540, 1000, 1.0)],
  ['lamp', C.lampOut - 0.2, (t: number) => <WindowShot t={t} s={1.6} cx={760} cy={800} />],
  ['pocket', C.phone, st(650, 1200, 1.8)],
  ['msg1', C.msgFrom, (t: number) => <PhoneShot t={t} which={1} />],
  ['lookUp', C.lookUp, st(420, 1080, 1.2)],
  ['palmAppear', C.palmNear, st(520, 1360, 2.0, 515, 1350, 2.2)],
  ['give', C.whisper, st(580, 1200, 1.6)],
  ['grip', C.grip, st(590, 1320, 2.5)],
  ['msg2', C.vib, (t: number) => <PhoneShot t={t} which={2} />],
  ['palmOpen', C.palmOpen, st(580, 1220, 1.6)],
  ['doors', C.doors, st(990, 1150, 1.7, 990, 1150, 1.8)],
  ['final', C.q - 0.1, st(540, 1020, 1.0, 560, 1050, 1.06)],
];
export const SHOTS4 = RAW.map(([id, a, f], i) => ({id, a, b: i + 1 < RAW.length ? RAW[i + 1][1] : C.end, f}));

const ShotView: React.FC<{a: number; b: number; f: any}> = ({a, b, f}) => {
  const frame = useCurrentFrame();
  const t = a + frame / FPS;
  const out = f(t === undefined ? 0 : t);
  if (React.isValidElement(out)) return <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}><Defs4 /><PhoneDefs />{out}</svg>;
  const cam = f(a, b) as Cam;
  const u = sm(t, a, b);
  const cx = cam[0][1] + (cam[1][1] - cam[0][1]) * u, cy = cam[0][2] + (cam[1][2] - cam[0][2]) * u, s = cam[0][3] + (cam[1][3] - cam[0][3]) * u;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs4 />
      <g transform={`translate(540 960) scale(${s}) translate(${-cx} ${-cy})`}><Set4 t={t} /></g>
      <rect width={W} height={H} fill="url(#e4vig)" />
    </svg>
  );
};

// --------- надписи ---------
const pop = (frame: number, fps: number, s: number) => spring({frame: frame - s * fps, fps, config: {damping: 13, stiffness: 140}});

const Overlays4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const vIn = pop(frame, fps, 0.2), vOut = 1 - sm(t, 3.0, 3.4);
  const badge = win(t, 3.3, 3.7, 5.6, 6.1);
  const card = (y: number, n: string, label: string, appear: number) => (
    <g transform={`translate(540 ${y}) scale(${0.6 + 0.4 * appear})`} opacity={Math.min(1, appear * 1.4)}>
      <rect x={-420} y={-56} width={840} height={112} rx={30} fill="#0e1530" opacity={0.94} stroke="#ffd23f" strokeWidth={5} />
      <circle cx={-350} cy={0} r={40} fill="#ffd23f" />
      <text x={-350} y={17} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={52} fill="#0e1530">{n}</text>
      <text x={-290} y={18} fontFamily="Inter" fontWeight={900} fontSize={54} fill="#ffffff">{label}</text>
    </g>
  );
  const o1 = pop(frame, fps, C.opt1), o2 = pop(frame, fps, C.opt2), cIn = pop(frame, fps, C.cont);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
      {t < 3.5 && (
        <g transform={`translate(540 ${330 - (1 - vIn) * 40}) scale(${0.8 + 0.2 * vIn})`} opacity={Math.min(1, vIn * 1.5) * vOut}>
          <rect x={-470} y={-100} width={940} height={200} rx={38} fill="#ffd23f" />
          <text x={0} y={-12} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={62} fill="#0b1026">ВЫ ВЫБРАЛИ</text>
          <text x={0} y={62} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={62} fill="#0b1026">РАЗБИТЬ ЗЕРКАЛО</text>
        </g>
      )}
      {badge > 0 && (
        <g opacity={badge} transform="translate(540 170)">
          <rect x={-400} y={-40} width={800} height={80} rx={40} fill="#0b1026" opacity={0.7} stroke="#ffd23f" strokeWidth={3} />
          <text x={0} y={14} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={38} fill="#ffd23f">ПОСЛЕДНИЙ АВТОБУС · ЧАСТЬ 4</text>
        </g>
      )}
      {t >= C.opt1 && card(t >= C.cont ? 470 : 330, '1', 'ОТДАТЬ КЛЮЧ', o1)}
      {t >= C.opt2 && card(t >= C.cont ? 600 : 460, '2', 'СПРЯТАТЬ КЛЮЧ', o2)}
      {t >= C.cont && (
        <g transform={`translate(540 ${250 - (1 - cIn) * 50}) scale(${0.8 + 0.2 * cIn})`} opacity={Math.min(1, cIn * 1.5)}>
          <rect x={-450} y={-92} width={900} height={184} rx={38} fill="#ffd23f" />
          <text x={0} y={-14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={80} fill="#0b1026">ПРОДОЛЖЕНИЕ</text>
          <text x={0} y={62} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill="#0b1026">— В ЧАСТИ 5 —</text>
        </g>
      )}
    </svg>
  );
};

// --------- субтитры (по словам озвучки после монтажа) ---------
type Chunk = {words: {text: string; s: number; e: number; i: number}[]; s: number; e: number};
const PUNCT = /[.,?!…:—»]$/;
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Chunk['words'] = [];
  const flush = () => { if (cur.length) out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e}); cur = []; };
  WORDS4.forEach((w, i) => {
    const len = cur.reduce((a, c) => a + c.text.length + 1, 0) + w.text.length;
    if (cur.length && (cur.length >= 5 || len > 24 || (cur.length >= 2 && PUNCT.test(cur[cur.length - 1].text)))) flush();
    cur.push({...w, i});
    if (/[.?!…]$/.test(w.text.replace(/[»"]/g, ''))) flush();
  });
  flush();
  return out;
})();
export const SUB_CHUNKS = CHUNKS;
/** реплики голоса из прохода — холодным цветом; остальное — белым, текущее слово — жёлтым */
const VOICE_RANGES = [[C.voice1, C.remember + 0.9], [C.thanks, C.thanks + 2.2], [C.give, C.give + 3]];
const isVoice = (s: number) => VOICE_RANGES.some(([a, b]) => s >= a - 0.05 && s < b);

/** на крупных планах зеркала субтитры сверху: не закрывают зеркало и лицо водителя под ним */
const SUB_TOP = new Set(['mirrorRefl', 'cracks', 'scream', 'mirrorQuiet', 'knocks', 'face', 'palm', 'noFace']);
const Subtitles4: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = CHUNKS.findIndex((c, k) => {
    const next = CHUNKS[k + 1];
    const end = Math.min(c.e + 0.3, next ? next.s - 0.02 : 1e9);
    return t >= c.s - 0.05 && t < end;
  });
  if (idx < 0) return null;
  const c = CHUNKS[idx];
  const text = c.words.map((x) => x.text).join(' ');
  let lines = [c.words];
  if (text.length > 16 && c.words.length > 2) {
    const half = text.length / 2; let acc = 0, cut = 1;
    c.words.forEach((x, k) => { acc += x.text.length + 1; if (acc < half + 2) cut = k + 1; });
    lines = [c.words.slice(0, cut), c.words.slice(cut)];
  }
  const shot = SHOTS4.find((s) => t >= s.a && t < s.b);
  const top = !!shot && SUB_TOP.has(shot.id);
  const baseY = top ? 400 : 1690, lh = 88;
  const enter = Math.min(1, (t - (c.s - 0.05)) / 0.08);
  const voice = isVoice(c.s);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
      <g opacity={enter}>
        {lines.map((ln, li) => (
          <text key={li} x={490} y={baseY - (lines.length - 1 - li) * lh} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={72}
            fontStyle={voice ? 'italic' : 'normal'}
            style={{paintOrder: 'stroke', stroke: '#05070f', strokeWidth: 16, strokeLinejoin: 'round'}}>
            {ln.map((x, k) => {
              const active = t >= x.s - 0.02 && t < x.e + 0.06;
              return <tspan key={x.i} fill={active ? '#ffd23f' : voice ? '#bcd6ff' : '#ffffff'}>{(k ? ' ' : '') + x.text}</tspan>;
            })}
          </text>
        ))}
      </g>
    </svg>
  );
};

export const LastBus4: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0a1024', fontFamily: 'Inter'}}>
    {SHOTS4.map((s) => {
      const from = Math.round(s.a * FPS);
      const to = Math.min(TOTAL4, Math.round(s.b * FPS));
      return (
        <Sequence key={s.id} from={from} durationInFrames={Math.max(1, to - from)} name={s.id}>
          <ShotView a={from / FPS} b={to / FPS} f={s.f} />
        </Sequence>
      );
    })}
    <Overlays4 />
    <Subtitles4 />
    {/* голос — основной слой; эффекты, атмосфера и музыка уже сведены тише голоса в scripts/build_audio4.py */}
    <Audio src={staticFile('audio4/voice_final.wav')} volume={1} />
    <Audio src={staticFile('audio4/sfx.wav')} volume={1} />
    <Audio src={staticFile('audio4/ambience.wav')} volume={1} />
    <Audio src={staticFile('audio4/music.wav')} volume={1} />
  </AbsoluteFill>
);

/** Короткий тест сложного момента: удар молотком (замах → контакт → трещины) */
export const LastBus4Test: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Sequence from={-Math.round((C.grab - 0.2) * FPS)} durationInFrames={Math.round((C.grab - 0.2) * FPS) + durationInFrames}>
        <LastBus4 />
      </Sequence>
    </AbsoluteFill>
  );
};
export {TOTAL4};
