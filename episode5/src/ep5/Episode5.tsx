import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {C, FPS, W, H, TOTAL5, WORDS5, sm, win} from './story5';
import {AllDefs5, Set5} from './Set5';
import {Ext5} from './Ext5';
import {Aisle5, KeyLockCU, PhoneShot5, FeetCU, DoorFrameOverlay} from './Scenes5';
import {heroInX} from './state5';
import {PhoneDefs} from '../components/Phone';

type Cam = (t: number) => [number, number, number];
type Shot = {id: string; a: number; sub: 'b' | 't'; set?: 'in' | 'ext'; cam?: Cam; render?: (t: number) => React.ReactNode; overlay?: React.ReactNode};

/** камера: плавный переход между двумя кадровками за время плана */
const st = (cx: number, cy: number, s: number, cx2 = cx, cy2 = cy, s2 = s) => (a: number, b: number): Cam => (t) => {
  const u = sm(t, a, b);
  return [cx + (cx2 - cx) * u, cy + (cy2 - cy) * u, s + (s2 - s) * u];
};
type Raw = [string, number, 'b' | 't', 'in' | 'ext' | ((t: number) => React.ReactNode), ((a: number, b: number) => Cam)?, React.ReactNode?];
const HCU = (x = 650) => st(x, 1010, 2.45, x, 1005, 2.6);
const DCU = st(230, 1030, 2.6, 230, 1025, 2.8);
const MCU = st(238, 790, 2.65, 240, 790, 2.8);
const EXW = st(600, 900, 1.0, 610, 910, 1.03);
const EX2 = st(690, 1200, 1.65, 690, 1195, 1.72);

const RAW: Raw[] = [
  ['hook', 0, 't', 'in', st(560, 1180, 1.8, 570, 1200, 1.95)],
  ['vote', C.vote, 'b', 'in', st(600, 1260, 1.5, 610, 1250, 1.6)],
  ['aisle', C.voice, 'b', (t) => <Aisle5 t={t} push={[C.voice, C.doorsHiss]} breath={win(t, C.whisper - 0.3, C.whisper + 0.3, C.regret + 1.0, C.regret + 1.6)} />],
  ['doors', C.doorsHiss, 'b', 'in', st(990, 1080, 1.7, 990, 1090, 1.6)],
  ['wide', C.notMoving, 'b', 'in', st(560, 1060, 1.0, 560, 1040, 1.04)],
  ['window', C.window, 't', 'in', st(760, 820, 2.1, 780, 830, 2.3)],
  ['turnDrv', C.turnDrv, 't', 'in', st(430, 1080, 1.25, 420, 1070, 1.3)],
  ['drvFace', C.drvSits, 'b', 'in', DCU],
  ['ask1', C.ask1, 'b', 'in', HCU()],
  ['drvAns', C.raiseHead, 'b', 'in', DCU],
  ['heroReact', C.stayHere, 'b', 'in', HCU()],
  ['drvOnce', C.pause, 'b', 'in', st(230, 1030, 2.7, 230, 1025, 2.9)],
  ['lookMirror', C.lookMirror, 'b', 'in', st(440, 930, 1.35, 420, 920, 1.45)],
  ['mirrorAisle', C.noFace, 't', 'in', MCU],
  ['turnBack', C.turnBack, 'b', 'in', HCU()],
  ['empty', C.empty, 'b', (t) => <Aisle5 t={t} push={[C.empty, C.msgPhone]} />],
  ['phoneUp', C.msgPhone, 'b', 'in', st(660, 1150, 1.7)],
  ['msg', C.msgText - 0.6, 'b', (t) => <PhoneShot5 t={t} which="in" />],
  ['lookWin', C.lookWin, 'b', 'in', HCU()],
  ['dbl', C.dblStands, 't', 'in', st(800, 860, 2.2, 800, 870, 2.35)],
  ['pocketCU', C.pocketW2, 'b', 'in', st(610, 1330, 4.0)],
  ['askKey', C.askKey, 'b', 'in', HCU()],
  ['drvYes', C.yes, 'b', 'in', DCU],
  ['takeOut', C.takeOut, 'b', 'in', st(620, 1250, 1.7)],
  ['figBehind', C.figBehind + 0.4, 't', 'in', MCU],
  ['touch', C.touch, 'b', 'in', st(690, 1060, 2.2)],
  ['rush', C.rush, 'b', 'in', (a) => (t) => [heroInX(t) - 10, 1030, 2.2]],
  ['keyhole', C.keyhole, 'b', (t) => <KeyLockCU t={t} variant="in" />],
  ['creak', C.creak, 'b', 'in', HCU(1205)],
  ['reach', C.sawMirror, 't', 'in', MCU],
  ['turn2', C.turn2, 'b', (t) => <KeyLockCU t={t} variant="in" />],
  ['opening', C.doorsStart, 'b', 'in', st(1080, 1080, 1.5)],
  ['run', C.run, 'b', 'in', HCU(1205)],
  ['jump', C.jump, 't', 'in', st(660, 1040, 0.92)],
  ['stuck', C.stopped - 0.2, 'b', 'in', st(1080, 1080, 1.5, 1080, 1070, 1.6)],
  ['grab2', C.grab2, 'b', 'in', st(1225, 1060, 2.2)],
  ['fullTurn', C.grip, 'b', (t) => <KeyLockCU t={t} variant="in" />],
  ['burst', C.doorsOpen, 'b', 'in', st(1080, 1060, 1.45, 1070, 1040, 1.3)],
  ['feet', C.exit, 'b', (t) => <FeetCU t={t} />],
  ['extWide', C.exit + 1.0, 'b', 'ext', EXW],
  ['lookBack', C.lookBack, 'b', 'ext', st(540, 1120, 2.4)],
  ['mirrorOut', C.palmMirror, 't', (t) => <>{inCam(t, 230, 790, 2.75)}<DoorFrameOverlay /></>],
  ['closeLock', C.close, 'b', (t) => <KeyLockCU t={t} variant="out" />],
  ['jerk', C.takeKey + 0.45, 'b', 'ext', EXW],
  ['drvStood', C.drvStood, 't', 'ext', EX2],
  ['faceNot', C.faceNot, 'b', 'ext', st(822, 1120, 2.6, 822, 1115, 2.75)],
  ['lookBus', C.lookBus, 't', 'ext', EX2],
  ['lampOn', C.lampOn, 'b', 'ext', st(600, 900, 1.0, 610, 930, 1.05)],
  ['road', C.road, 'b', 'ext', st(540, 1120, 2.4)],
  ['noBus', C.busWord, 'b', 'ext', EXW],
  ['thought', C.thought, 't', 'ext', st(690, 1200, 1.6)],
  ['vib', C.vib, 't', 'ext', st(560, 1250, 1.7)],
  ['msgFinal', C.msgFrom, 'b', (t) => <PhoneShot5 t={t} which="out" />],
  ['final', C.q, 'b', 'ext', st(640, 1000, 1.0, 650, 1020, 1.05)],
];
export const SHOTS5 = RAW.map(([id, a, sub, kind, cam], i) => ({id, a, b: i + 1 < RAW.length ? RAW[i + 1][1] : C.end, sub, kind, cam}));

const inCam = (t: number, cx: number, cy: number, s: number) => (
  <g transform={`translate(540 960) scale(${s}) translate(${-cx} ${-cy})`}><Set5 t={t} /></g>
);
/** общая цветокоррекция, как в части 4 v2 */
const GRADE: React.CSSProperties = {filter: 'saturate(1.3) contrast(1.08) brightness(1.04)'};

const ShotView: React.FC<{s: (typeof SHOTS5)[number]; from: number}> = ({s, from}) => {
  const frame = useCurrentFrame();
  const t = (from + frame) / FPS;
  let body: React.ReactNode;
  if (typeof s.kind === 'function') body = s.kind(t);
  else {
    const [cx, cy, sc] = (s.cam as any)(s.a, s.b)(t);
    body = (
      <g transform={`translate(540 960) scale(${sc}) translate(${-cx} ${-cy})`}>
        {s.kind === 'in' ? <Set5 t={t} /> : <Ext5 t={t} />}
      </g>
    );
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={GRADE}>
      <AllDefs5 /><PhoneDefs />
      {body}
      <rect width={W} height={H} fill="url(#e4vig)" />
    </svg>
  );
};

// --------- надписи ---------
const pop = (frame: number, fps: number, s: number) => spring({frame: frame - s * fps, fps, config: {damping: 13, stiffness: 140}});

const Overlays5: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const vIn = pop(frame, fps, C.vote), vOut = 1 - sm(t, C.pocket + 1.4, C.pocket + 1.8);
  const badge = win(t, C.notMoving - 0.2, C.notMoving + 0.2, C.window - 0.4, C.window);
  const card = (y: number, n: string, label: string, appear: number) => (
    <g transform={`translate(540 ${y}) scale(${0.6 + 0.4 * appear})`} opacity={Math.min(1, appear * 1.4)}>
      <rect x={-430} y={-62} width={860} height={124} rx={32} fill="#0e1530" opacity={0.94} stroke="#ffd23f" strokeWidth={6} />
      <circle cx={-355} cy={0} r={44} fill="#ffd23f" />
      <text x={-355} y={19} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={56} fill="#0e1530">{n}</text>
      <text x={-290} y={21} fontFamily="Inter" fontWeight={900} fontSize={60} fill="#ffffff">{label}</text>
    </g>
  );
  const qIn = pop(frame, fps, C.q + 0.05), o1 = pop(frame, fps, C.opt1), o2 = pop(frame, fps, C.opt2);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
      {t >= C.vote && t < C.pocket + 1.8 && (
        <g transform={`translate(540 ${215 - (1 - vIn) * 40}) scale(${0.8 + 0.2 * vIn})`} opacity={Math.min(1, vIn * 1.5) * vOut}>
          <rect x={-470} y={-100} width={940} height={200} rx={38} fill="#ffd23f" />
          <text x={0} y={-12} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={60} fill="#0b1026">ВЫ ВЫБРАЛИ</text>
          <text x={0} y={62} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={62} fill="#0b1026">СПРЯТАТЬ КЛЮЧ</text>
        </g>
      )}
      {badge > 0 && (
        <g opacity={badge} transform="translate(540 150)">
          <rect x={-400} y={-40} width={800} height={80} rx={40} fill="#0b1026" opacity={0.75} stroke="#ffd23f" strokeWidth={3} />
          <text x={0} y={14} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={38} fill="#ffd23f">ПОСЛЕДНИЙ АВТОБУС · ЧАСТЬ 5</text>
        </g>
      )}
      {t >= C.q && (
        <g transform={`translate(540 ${250 - (1 - qIn) * 40}) scale(${0.85 + 0.15 * qIn})`} opacity={Math.min(1, qIn * 1.4)}>
          <rect x={-450} y={-70} width={900} height={140} rx={34} fill="#0b1026" opacity={0.88} stroke="#ffd23f" strokeWidth={6} />
          <text x={0} y={24} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={50} fill="#ffd23f">КУДА ОТПРАВИМСЯ ДАЛЬШЕ?</text>
        </g>
      )}
      {t >= C.opt1 && card(410, '1', 'НОЧНАЯ ОСТАНОВКА', o1)}
      {t >= C.opt2 && card(550, '2', 'ПУСТОЙ ЛИФТ', o2)}
    </svg>
  );
};

// --------- субтитры ---------
type Chunk = {words: {text: string; s: number; e: number; i: number}[]; s: number; e: number};
const PUNCT = /[.,?!…:—»]$/;
/** вопрос и варианты финала уже показаны карточками — их не дублируем субтитрами */
const HIDE_FROM = WORDS5.findIndex((w) => w.s >= C.q - 0.01);
const HIDE_TO = WORDS5.findIndex((w) => w.s >= C.vote2 - 0.01);
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: Chunk['words'] = [];
  const flush = () => { if (cur.length) out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e}); cur = []; };
  WORDS5.forEach((w, i) => {
    if (i >= HIDE_FROM && i < HIDE_TO) { flush(); return; }
    const len = cur.reduce((a, c) => a + c.text.length + 1, 0) + w.text.length;
    if (cur.length && (cur.length >= 5 || len > 24 || (cur.length >= 2 && PUNCT.test(cur[cur.length - 1].text)))) flush();
    cur.push({...w, i});
    if (/[.?!…]$/.test(w.text.replace(/[»"]/g, ''))) flush();
  });
  flush();
  return out;
})();
export const SUB_CHUNKS5 = CHUNKS;
const KEY = /^(ключ|двойник|отражени|ладонь|фигур|зеркал|спасибо|бежим)/i;
const VOICE = [[C.regret - 0.05, C.regret + 1.6]];

const Subtitles5: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const idx = CHUNKS.findIndex((c, k) => {
    const next = CHUNKS[k + 1];
    return t >= c.s - 0.05 && t < Math.min(c.e + 0.3, next ? next.s - 0.02 : 1e9);
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
  const shot = SHOTS5.find((s) => t >= s.a && t < s.b);
  const top = shot?.sub === 't';
  const lh = 86;
  const baseY = top ? 250 + (lines.length - 1) * lh : 1540;
  const enter = Math.min(1, (t - (c.s - 0.05)) / 0.08);
  const voice = VOICE.some(([a, b]) => c.s >= a && c.s < b);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
      <g opacity={enter}>
        {lines.map((ln, li) => (
          <text key={li} x={500} y={baseY - (lines.length - 1 - li) * lh} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={70}
            fontStyle={voice ? 'italic' : 'normal'} style={{paintOrder: 'stroke', stroke: '#05070f', strokeWidth: 16, strokeLinejoin: 'round'}}>
            {ln.map((x, k) => {
              const clean = x.text.replace(/[«»"—,.!?:]/g, '').toLowerCase();
              const hl = KEY.test(clean);
              return <tspan key={x.i} fill={hl ? '#ffd23f' : voice ? '#bcd6ff' : '#ffffff'}>{(k ? ' ' : '') + x.text}</tspan>;
            })}
          </text>
        ))}
      </g>
    </svg>
  );
};

export const LastBus5: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#0a1024', fontFamily: 'Inter'}}>
    {SHOTS5.map((s) => {
      const from = Math.round(s.a * FPS);
      const to = Math.min(TOTAL5, Math.round(s.b * FPS));
      return (
        <Sequence key={s.id} from={from} durationInFrames={Math.max(1, to - from)} name={s.id}>
          <ShotView s={s} from={from} />
        </Sequence>
      );
    })}
    <Overlays5 />
    <Subtitles5 />
    {/* голос — основной слой; музыка, эффекты и атмосфера уже сведены тише голоса в scripts/build_audio5.py */}
    <Audio src={staticFile('audio5/voice_final.wav')} volume={1} />
    <Audio src={staticFile('audio5/sfx.wav')} volume={1} />
    <Audio src={staticFile('audio5/ambience.wav')} volume={1} />
    <Audio src={staticFile('audio5/music.wav')} volume={1} />
  </AbsoluteFill>
);

/** Тест сложного места: ключ входит в замок и поворачивается; фигура в зеркале тянет руку */
export const LastBus5Test: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={-Math.round((C.insert - 0.3) * FPS)}>
      <LastBus5 />
    </Sequence>
  </AbsoluteFill>
);
export {TOTAL5};
