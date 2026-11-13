import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Hero} from './Hero';
import {Street, FIGURE_X} from './Street';
import {AisleView} from './Aisle';
import {SKIN, clamp} from '../common';

const EDGE = '#d49a6e', SHADE = '#e6b184';

/** Рука с пальцами: folds = [указательный, средний, безымянный, мизинец], 0 — поднят, 1 — загнут. Ладонь к зрителю. */
export const FingerHand: React.FC<{folds: [number, number, number, number]; wet?: boolean}> = ({folds, wet = true}) => {
  const frame = useCurrentFrame();
  const xs = [-66, -22, 22, 64], lens = [150, 168, 150, 112];
  return (
    <g>
      <path d="M-100 -20 Q-110 120 -60 190 Q0 225 60 190 Q112 120 100 -20 Z" fill={SKIN} stroke={EDGE} strokeWidth={5} />
      {xs.map((x, i) => {
        const f = folds[i], L = lens[i] * (1 - 0.82 * f);
        return (
          <g key={i}>
            <rect x={x - 20} y={-20 - L} width={40} height={L + 44} rx={20} fill={SKIN} stroke={EDGE} strokeWidth={5} />
            <path d={`M${x - 6} ${-20 - L + 26} v${Math.max(10, L * 0.5)}`} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.35} />
          </g>
        );
      })}
      {xs.map((x, i) => folds[i] > 0.4 && (
        <g key={'c' + i} opacity={Math.min(1, (folds[i] - 0.4) * 2)}>
          <ellipse cx={x} cy={20 + folds[i] * 22} rx={22} ry={18} fill={SHADE} stroke={EDGE} strokeWidth={4} />
          <path d={`M${x - 13} ${24 + folds[i] * 22} q13 9 26 0`} stroke={EDGE} strokeWidth={3} fill="none" />
        </g>
      ))}
      <path d="M-100 40 Q-152 70 -130 120 Q-100 142 -62 108 Q-70 70 -100 40Z" fill={SKIN} stroke={EDGE} strokeWidth={5} />
      <path d="M-60 90 Q0 120 60 90" stroke={EDGE} strokeWidth={3} fill="none" opacity={0.6} />
      {wet && [[-40, 120, 0], [30, 150, 9], [70, 90, 17], [-70, 160, 5]].map(([dx, dy, ph], i) => {
        const fall = ((frame + ph * 3) % 60) / 60;
        return <g key={i} opacity={0.9 - fall * 0.8}><path d={`M${dx} ${dy + fall * 40 - 14} q-9 15 0 22 q9 -7 0 -22z`} fill="#bfe3ff" stroke="#7fb4e6" strokeWidth={2} /><circle cx={dx - 3} cy={dy + fall * 40} r={2.5} fill="#fff" /></g>;
      })}
    </g>
  );
};

/** Двойник крупно (бюст) + рука на переднем плане: ладонь на стекле или счёт пальцами. */
export const DoubleWithHand: React.FC<{face: any; face2?: any; mix?: number; shade?: number; folds?: [number, number, number, number]; hy?: number; hs?: number; look?: [number, number]}> = ({face, face2, mix = 0, shade = 0, folds = [0, 0, 0, 1], hy = 1000, hs = 1.8, look = [0, 0]}) => (
  <g>
    <rect width={1080} height={1920} fill="#0a1024" />
    <circle cx={880} cy={260} r={200} fill="url(#bulbGlow)" opacity={0.55} />
    <circle cx={340} cy={800} r={420} fill="#1d2c5c" opacity={0.5} />
    <Hero id="dwh" x={330} y={800} scale={1.75} anchor={[505, 300]} legs={false} face={face} face2={face2} faceMix={mix} look={look} armL={80} armR={80} shade={shade} />
    <g transform={`translate(770 ${hy})`}>
      <path d={`M${-150 * hs} 1000 L${-105 * hs} ${215 * hs} L${105 * hs} ${215 * hs} L${150 * hs} 1000Z`} fill="#4f6aa0" />
      <rect x={-112 * hs} y={190 * hs} width={224 * hs} height={52 * hs} rx={18} fill="#445f95" />
      <g transform={`scale(${hs})`}><FingerHand folds={folds} /></g>
    </g>
  </g>
);

/** Ладонь, прижатая к стеклу (мокрая): рука + стекающие капли, снаружи */
export const GlassPalm: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g opacity={0.9}><FingerHand folds={[0, 0, 0, 0]} /></g>
  </g>
);

/** Окно с улицей: Street масштабируется (автобус уезжает — остановка уменьшается). */
export const WindowPOV: React.FC<{camX0: number; camX: number; s: number; lampLit?: number; figure?: React.ReactNode; hero?: any; children?: React.ReactNode}> = ({camX0, camX, s, lampLit = 1, figure, hero, children}) => {
  const Fc = FIGURE_X - camX0;
  return (
    <g>
      <rect width={1080} height={1920} fill="#0b1124" />
      <clipPath id="wpClip"><rect x={90} y={270} width={900} height={1090} rx={60} /></clipPath>
      <g clipPath="url(#wpClip)">
        <g transform={`translate(540 760) scale(${s}) translate(${-Fc} -350)`}>
          <rect x={-4000} y={-4000} width={9000} height={4000} fill="#070c1d" />
          <rect x={-4000} y={618} width={9000} height={4000} fill="#0b1020" />
          <Street camX={camX} width={1500} figure={figure} lampLit={lampLit} />
        </g>
        {children}
      </g>
      <path fillRule="evenodd" d="M0 0H1080V1920H0Z M90 330 Q90 270 150 270 H930 Q990 270 990 330 V1300 Q990 1360 930 1360 H150 Q90 1360 90 1300Z" fill="#0b1124" />
      <rect x={90} y={270} width={900} height={1090} rx={60} fill="none" stroke="#2a3556" strokeWidth={14} />
      <rect x={90} y={270} width={900} height={1090} rx={60} fill="url(#glassSheen)" />
      <rect x={0} y={1360} width={1080} height={560} fill="#0f1730" />
      {hero && <Hero id="wph" x={290} y={1640} scale={1.5} anchor={[505, 300]} legs={false} armL={80} armR={80} {...hero} />}
    </g>
  );
};

/** Водитель в профиль/анфас (лицо — лицо героя, фуражка). turn: −1 лицом вперёд (влево), 0 — к зрителю. */
export const DriverProfile: React.FC<{x: number; y: number; scale?: number; bodyTurn?: number; keyUp?: number; faceProps?: any; keyText?: string}> = ({x, y, scale = 1, bodyTurn = 0, keyUp = 0, faceProps, keyText = 'ДВЕРИ'}) => {
  const frame = useCurrentFrame();
  const bw = 0.6 + 0.4 * bodyTurn;
  const handX = 30 + 190 * keyUp, handY = -150 - 150 * keyUp;
  const sway = Math.sin(frame / 5) * 3 * keyUp;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={20} y={-470} width={190} height={600} rx={60} fill="#232c44" />
      <rect x={-210} y={-70} width={250} height={92} rx={40} fill="#161a2b" />
      <rect x={-250} y={20} width={80} height={170} rx={30} fill="#161a2b" />
      <ellipse cx={-230} cy={-200} rx={22} ry={126} transform="rotate(-14 -230 -200)" fill="none" stroke="#12151f" strokeWidth={22} />
      <g transform={`translate(0 0) scale(${bw} 1)`}>
        <path d="M-95 -350 Q-120 -200 -85 -20 L110 -20 Q125 -200 95 -350 Q0 -396 -95 -350Z" fill="#2b3250" />
        <path d="M0 -330 V-20" stroke="#1d2340" strokeWidth={5} />
      </g>
      {/* рука: на руле или с ключом */}
      <path d={`M${-40 * bw} -300 Q${60 + 60 * keyUp} ${-180 - 80 * keyUp} ${handX} ${handY}`} stroke="#2b3250" strokeWidth={70} strokeLinecap="round" fill="none" />
      <g transform={`translate(${handX} ${handY}) rotate(${sway})`}>
        <ellipse cx={0} cy={0} rx={34} ry={40} fill="#cfae96" stroke="#9c8068" strokeWidth={3} />
        {keyUp > 0.3 && (
          <g opacity={Math.min(1, keyUp * 1.5)} transform="translate(8 -52)">
            <rect x={-6} y={-96} width={12} height={110} rx={5} fill="#d8c27a" stroke="#8a7a3a" strokeWidth={2} />
            <circle cx={0} cy={-112} r={22} fill="none" stroke="#d8c27a" strokeWidth={8} />
            <path d="M6 -70 h22 v12 h-22 M6 -46 h16 v10 h-16" fill="#d8c27a" stroke="#8a7a3a" strokeWidth={2} />
          </g>
        )}
      </g>
      <rect x={-34} y={-330} width={68} height={60} rx={20} fill="#b99580" />
      <clipPath id="drvHeadClip"><rect x={-150} y={-560} width={300} height={248} /></clipPath>
      <g clipPath="url(#drvHeadClip)">
        <Hero id="drvh" x={0} y={-420} scale={1.0} anchor={[505, 200]} legs={false} cap armL={80} armR={80} stain={false} {...faceProps} />
      </g>
      <path d="M-92 -300 Q0 -270 92 -300 L108 -330 Q0 -300 -108 -330Z" fill="#232a44" />
    </g>
  );
};

/** Ключ от дверей в руке водителя — крупно */
export const KeyHand: React.FC<{t: number; text?: string}> = ({t, text = 'ДВЕРИ'}) => {
  const sway = Math.sin(t * 3) * 2.2;
  return (
    <g>
      <rect width={1080} height={1920} fill="#0a1024" />
      <circle cx={540} cy={820} r={520} fill="#1d2c5c" opacity={0.5} />
      <path d="M-100 1920 L120 1340 L560 1300 L680 1920Z" fill="#2b3250" />
      <rect x={90} y={1290} width={470} height={96} rx={34} transform="rotate(-14 330 1340)" fill="#232a44" />
      <g transform={`translate(560 1190) rotate(${sway})`}>
        <ellipse cx={0} cy={0} rx={130} ry={150} fill="#cfae96" stroke="#9c8068" strokeWidth={6} />
        {[-70, -24, 22, 68].map((fx, i) => <rect key={i} x={fx - 22} y={-100} width={44} height={100} rx={22} fill="#cfae96" stroke="#9c8068" strokeWidth={4} />)}
        <g transform="translate(0 -110)">
          <rect x={-22} y={-420} width={44} height={440} rx={14} fill="#e0c97c" stroke="#8a7a3a" strokeWidth={5} />
          <path d="M22 -250 h86 v38 h-86 M22 -160 h62 v34 h-62 M22 -90 h48 v30 h-48" fill="#e0c97c" stroke="#8a7a3a" strokeWidth={4} />
          <circle cx={0} cy={-470} r={84} fill="none" stroke="#e0c97c" strokeWidth={30} />
          <circle cx={0} cy={-470} r={84} fill="none" stroke="#8a7a3a" strokeWidth={4} />
          <path d="M-14 -380 v280" stroke="#fff7d0" strokeWidth={8} strokeLinecap="round" opacity={0.55} />
          <g transform="translate(-170 -440) rotate(-12)">
            <rect x={-80} y={0} width={160} height={110} rx={14} fill="#c7433a" stroke="#7a1f1a" strokeWidth={5} />
            <text x={0} y={70} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill="#fff">{text}</text>
            <path d="M0 0 Q40 -50 90 -70" stroke="#bbb" strokeWidth={5} fill="none" />
          </g>
        </g>
      </g>
    </g>
  );
};

/** Мокрые следы на полу салона (вид вдоль стены): шаги приближаются к герою слева */
export const FloorPrints: React.FC<{n: number; xFar: number; xNear: number; y: number}> = ({n, xFar, xNear, y}) => {
  const K = 9;
  return (
    <g>
      {Array.from({length: K}).map((_, k) => {
        const a = clamp(n - k);
        if (a <= 0) return null;
        const x = xFar + (xNear - xFar) * (k / (K - 1));
        const yy = y + (k % 2 ? 22 : -14);
        return (
          <g key={k} transform={`translate(${x} ${yy}) rotate(${k % 2 ? 4 : -4})`} opacity={a}>
            <ellipse cx={0} cy={0} rx={38} ry={15} fill="#2d4a7e" opacity={0.7} />
            <ellipse cx={34} cy={0} rx={12} ry={11} fill="#2d4a7e" opacity={0.7} />
            <path d="M-26 -5 q22 -6 46 0" stroke="#a8c8f5" strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" />
            <ellipse cx={-52} cy={6} rx={5} ry={3} fill="#a8c8f5" opacity={0.5} />
          </g>
        );
      })}
    </g>
  );
};

/** Вид по проходу в темноте с лучом фонарика; на полу один за другим появляются мокрые следы, приближаясь */
export const AisleDark: React.FC<{t: number; beam: number; flicker?: number; t0: number; dt: number}> = ({t, beam, flicker = 0, t0, dt}) => {
  const vx = 540, vy = 800;
  const S = (d: number) => 1 / (1 + 4.2 * d);
  const K = 9;
  return (
    <g>
      <AisleView flicker={flicker} />
      {Array.from({length: K}).map((_, k) => {
        const a = clamp((t - (t0 + k * dt)) / 0.25);
        if (a <= 0) return null;
        const d = 0.86 - 0.095 * k, s = S(d);
        const x = vx + (k % 2 ? 70 : -70) * s * 1.6, y = vy + 900 * s;
        return (
          <g key={k} transform={`translate(${x} ${y}) scale(${s * 3.2})`} opacity={a}>
            <ellipse cx={0} cy={-28} rx={27} ry={36} fill="#4a74b8" opacity={0.85} />
            <ellipse cx={5} cy={30} rx={18} ry={23} fill="#4a74b8" opacity={0.85} />
            <rect x={-12} y={-6} width={26} height={22} fill="#4a74b8" opacity={0.85} />
            {[-18, -9, 0, 9, 18].map((tx, i) => <circle key={i} cx={tx} cy={-72 + Math.abs(tx) * 0.5} r={6} fill="#4a74b8" opacity={0.85} />)}
            <path d="M-14 -40 q14 -14 28 0 M-6 22 q10 8 20 0" stroke="#d3e4fc" strokeWidth={4} fill="none" opacity={0.6} strokeLinecap="round" />
          </g>
        );
      })}
      <defs>
        <linearGradient id="beamCut" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#000" /><stop offset="0.6" stopColor="#1a1a1a" /><stop offset="1" stopColor="#6a6a6a" /></linearGradient>
        <mask id="beamMask" maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
          <rect width={1080} height={1920} fill="#fff" />
          <polygon points="470,1920 610,1920 980,640 100,640" fill="#5a5a5a" opacity={beam} />
          <polygon points="500,1920 580,1920 800,700 280,700" fill="url(#beamCut)" opacity={beam} />
        </mask>
      </defs>
      <rect width={1080} height={1920} fill="#02040a" opacity={0.9} mask="url(#beamMask)" />
    </g>
  );
};

/** Запотевшее зеркало: надпись «проступает» (стирается пальцем в конденсате) и исчезает */
export const FogText: React.FC<{fog: number; reveal: number; gone: number; l1?: string; l2?: string}> = ({fog, reveal, gone, l1 = 'НЕ ОТВЕЧАЙ', l2 = 'ЕМУ'}) => {
  const frame = useCurrentFrame();
  const p1 = clamp(reveal / 0.7), p2 = clamp((reveal - 0.7) / 0.3);
  return (
    <g>
      <defs>
        <clipPath id="fogC1"><rect x={-106} y={-40} width={212 * p1} height={44} /></clipPath>
        <clipPath id="fogC2"><rect x={-106} y={2} width={212 * p2} height={40} /></clipPath>
        <mask id="fogMask" maskUnits="userSpaceOnUse" x={-106} y={-40} width={212} height={80}>
          <rect x={-106} y={-40} width={212} height={80} fill="#fff" />
          <g opacity={1 - gone}>
            <g clipPath="url(#fogC1)"><text x={0} y={-6} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={29} fill="#000" stroke="#000" strokeWidth={1.6}>{l1}</text></g>
            <g clipPath="url(#fogC2)"><text x={0} y={28} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={29} fill="#000" stroke="#000" strokeWidth={1.6}>{l2}</text></g>
          </g>
        </mask>
      </defs>
      <rect x={-106} y={-40} width={212} height={80} fill="#c9dbef" opacity={0.78 * fog} mask="url(#fogMask)" />
      {[[-70, -20, 14], [40, 10, 18], [80, -26, 10], [-30, 24, 12]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#fff" opacity={0.12 * fog} />)}
      {reveal > 0.05 && reveal < 1 && gone < 0.5 && <circle cx={-106 + 212 * (reveal < 0.7 ? p1 : p2)} cy={reveal < 0.7 ? -16 : 20} r={6} fill="#fff" opacity={0.6 + 0.2 * Math.sin(frame)} />}
    </g>
  );
};

export const BlinkLids: React.FC<{c: number}> = ({c}) => (
  <g pointerEvents="none">
    <rect x={0} y={0} width={1080} height={960 * c} fill="#060913" opacity={0.96} />
    <rect x={0} y={1920 - 960 * c} width={1080} height={960 * c} fill="#060913" opacity={0.96} />
  </g>
);
