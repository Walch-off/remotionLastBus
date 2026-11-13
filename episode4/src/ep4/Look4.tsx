import React from 'react';

/**
 * Слой «красоты» эпизода 4: свет, отражения, мелкие детали салона и улицы.
 * Только оформление — никакие предметы сюжета и позы здесь не меняются.
 * Все координаты — мировые координаты Set4 (кадр 1080×1920 при масштабе 1).
 */

const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const LookDefs: React.FC = () => (
  <defs>
    <filter id="lkBlur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={8} /></filter>
    <filter id="lkBlur20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={20} /></filter>
    <filter id="lkBlur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={3} /></filter>
    {/* контровой свет: тёплый ореол по силуэту персонажа (фонарь за окном) */}
    <filter id="lkRimWarm" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={5} result="b" />
      <feFlood floodColor="#ffb866" floodOpacity={0.75} />
      <feComposite in2="b" operator="in" result="glow" />
      <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="lkRimCool" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation={5} result="b" />
      <feFlood floodColor="#7fb2ff" floodOpacity={0.6} />
      <feComposite in2="b" operator="in" result="glow" />
      <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <linearGradient id="lkShaft" x1="1" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffc277" stopOpacity={0.5} />
      <stop offset="0.6" stopColor="#ff9a4a" stopOpacity={0.16} />
      <stop offset="1" stopColor="#ff9a4a" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="lkStripGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#bfe0ff" stopOpacity={0.55} />
      <stop offset="1" stopColor="#7fb2ff" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="lkReflWarm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffb866" stopOpacity={0.55} />
      <stop offset="1" stopColor="#ffb866" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="lkReflCool" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#a8d0ff" stopOpacity={0.45} />
      <stop offset="1" stopColor="#a8d0ff" stopOpacity={0} />
    </linearGradient>
    <linearGradient id="lkChrome" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#5d6a8e" /><stop offset="0.35" stopColor="#e6eeff" /><stop offset="0.55" stopColor="#9aa8c8" /><stop offset="1" stopColor="#4a5576" />
    </linearGradient>
    <pattern id="lkFabric" width="26" height="26" patternUnits="userSpaceOnUse">
      <rect width="26" height="26" fill="#2c4a9a" />
      <path d="M0 13 L13 0 L26 13 L13 26Z" fill="#3558b0" />
      <circle cx="13" cy="13" r="3" fill="#e0a43a" opacity={0.75} />
    </pattern>
    <pattern id="lkRibs" width="1080" height="22" patternUnits="userSpaceOnUse">
      <rect width="1080" height="22" fill="none" />
      <rect y="0" width="1080" height="4" fill="#2f3c66" opacity={0.6} />
    </pattern>
  </defs>
);

/** Потолочные светильники с ореолом и световым конусом */
export const CeilingGlow: React.FC<{flicker?: number}> = ({flicker = 1}) => (
  <g>
    {[120, 460, 800].map((x, i) => (
      <g key={i}>
        <rect x={x - 10} y={322} width={240} height={40} rx={18} fill="#bfe0ff" opacity={0.5 * flicker} filter="url(#lkBlur8)" />
        <rect x={x} y={330} width={220} height={22} rx={10} fill="#eaf5ff" opacity={0.95 * flicker} />
        <path d={`M${x} 352 L${x + 220} 352 L${x + 330} 620 L${x - 110} 620Z`} fill="url(#lkStripGlow)" opacity={0.28 * flicker} />
      </g>
    ))}
  </g>
);

/** Светодиодное табло маршрута над окном */
export const RouteSign: React.FC<{frame: number; on?: number}> = ({frame, on = 1}) => {
  const text = 'МАРШРУТ 13 · КОНЕЧНАЯ НЕ ОБЪЯВЛЕНА · ';
  const scroll = (frame * 2.2) % 560;
  return (
    <g>
      <rect x={496} y={456} width={400} height={56} rx={8} fill="#0a0b12" stroke="#3b4565" strokeWidth={4} />
      <clipPath id="lkRouteClip"><rect x={504} y={462} width={384} height={44} rx={4} /></clipPath>
      <g clipPath="url(#lkRouteClip)">
        <rect x={504} y={462} width={384} height={44} fill="#1a0c06" />
        <text x={900 - scroll} y={496} fontFamily="Inter" fontWeight={900} fontSize={30} fill="#ff9a2e" opacity={on} letterSpacing={2}
          style={{filter: 'drop-shadow(0 0 6px #ff7a1a)'}}>{text + text}</text>
        {Array.from({length: 12}).map((_, i) => <rect key={i} x={504} y={462 + i * 4} width={384} height={1.2} fill="#000" opacity={0.35} />)}
      </g>
    </g>
  );
};

/** Сиденья у стены за героем (до героя по глубине) */
export const WallSeats: React.FC = () => (
  <g>
    {/* батарея/решётка */}
    <rect x={500} y={1470} width={400} height={70} rx={8} fill="#1b2340" />
    {Array.from({length: 18}).map((_, i) => <rect key={i} x={510 + i * 21.5} y={1478} width={10} height={54} rx={4} fill="#11182e" />)}
    {[[520, 1150], [720, 1150]].map(([x, y], i) => (
      <g key={i}>
        <rect x={x + 16} y={y + 300} width={14} height={120} fill="#4a5576" />
        <rect x={x} y={y} width={170} height={290} rx={34} fill="url(#lkFabric)" stroke="#203676" strokeWidth={5} />
        <rect x={x} y={y} width={170} height={290} rx={34} fill="#000" opacity={0.18} />
        <rect x={x + 10} y={y - 20} width={150} height={34} rx={17} fill="url(#lkChrome)" />
        <rect x={x - 6} y={y + 270} width={182} height={60} rx={20} fill="#253d84" stroke="#203676" strokeWidth={4} />
      </g>
    ))}
  </g>
);

/** Капли и потёки на стекле окна; в каплях — тёплые блики фонаря */
export const GlassRain: React.FC<{x: number; y: number; w: number; h: number; frame: number; warm?: number; seed?: number}> = ({x, y, w, h, frame, warm = 1, seed = 0}) => {
  const n = 26;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const hx = hash(i + seed), hy = hash(i * 3.7 + seed), hr = hash(i * 9.1 + seed);
        const r = 1.6 + hr * 3.2;
        const slide = hr > 0.7 ? ((frame * (0.6 + hr) + hy * 900) % (h + 60)) : hy * h;
        const cx = x + hx * w, cy = y + slide;
        const lit = hx > 0.45 ? warm : 0.4;
        return (
          <g key={i} opacity={0.75}>
            {hr > 0.7 && <path d={`M${cx} ${cy - 60} L${cx} ${cy}`} stroke="#cfe0ff" strokeWidth={1.5} opacity={0.18} />}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={lit > 0.6 ? '#ffd6a0' : '#cfe0ff'} strokeWidth={1.1} opacity={0.5} />
            <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={Math.max(0.8, r * 0.3)} fill={lit > 0.6 ? '#fff0d0' : '#f2f8ff'} opacity={0.85} />
          </g>
        );
      })}
    </g>
  );
};

/** Луч фонаря сквозь окно на пол + пылинки в нём (рисуется поверх сцены, режим «экран») */
export const LightShaft: React.FC<{lamp: number; frame: number}> = ({lamp, frame}) => {
  if (lamp <= 0.01) return null;
  return (
    <g style={{mixBlendMode: 'screen'}} opacity={lamp}>
      <path d="M899 522 L899 1118 L640 1990 L180 1990 L487 1118 L487 522Z" fill="url(#lkShaft)" opacity={0.55} />
      {/* тени от рамы окна внутри луча */}
      <path d="M690 1118 L640 1990 L600 1990 L676 1118Z" fill="#000" opacity={0.25} style={{mixBlendMode: 'normal'}} />
      {Array.from({length: 26}).map((_, i) => {
        const hx = hash(i * 2.3), hy = hash(i * 5.1);
        const u = ((frame / 300 + hy) % 1);
        const px = 520 + hx * 320 - u * 160, py = 600 + u * 1100;
        return <circle key={i} cx={px + Math.sin(frame / 40 + i) * 10} cy={py} r={1.6 + hash(i) * 2.2} fill="#ffe2b0" opacity={0.6 * Math.sin(u * Math.PI)} />;
      })}
    </g>
  );
};

/** Мокрый пол: отражения светильников, луча и красных огней приборной панели */
export const FloorReflections: React.FC<{lamp: number; engine: number; frame: number}> = ({lamp, engine, frame}) => (
  <g>
    <rect x={-300} y={1574} width={1700} height={500} fill="url(#lkRibs)" opacity={0.7} />
    <g filter="url(#lkBlur8)">
      {[230, 570, 910].map((x, i) => <rect key={i} x={x - 70} y={1600} width={140} height={260} rx={50} fill="url(#lkReflCool)" opacity={0.55} />)}
      <path d="M560 1590 L760 1590 L700 1920 L420 1920Z" fill="url(#lkReflWarm)" opacity={0.7 * lamp} />
      <rect x={260} y={1590} width={40} height={140} rx={20} fill="#ff4a3a" opacity={0.35 * engine} />
    </g>
    {/* блики-лужицы */}
    {[[150, 1650, 90], [820, 1700, 120], [1000, 1610, 70], [360, 1860, 110]].map(([x, y, rx], i) => (
      <g key={i}>
        <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.16} fill="#3a5490" opacity={0.55} />
        <ellipse cx={x - rx * 0.2} cy={y - 2} rx={rx * 0.5} ry={rx * 0.05} fill="#d7e8ff" opacity={0.35 + 0.1 * Math.sin(frame / 18 + i)} />
      </g>
    ))}
  </g>
);

/** Детали кабины: приборы с подсветкой, валидатор, кнопка остановки */
export const CabPanels: React.FC = () => (
  <g>
    {[[-260, 600], [-40, 600], [180, 600]].map(([x, y], i) => (
      <g key={i}>
        <rect x={x} y={y} width={200} height={660} rx={14} fill="#1d2a52" stroke="#2b3866" strokeWidth={4} />
        <rect x={x + 8} y={y + 8} width={184} height={10} rx={5} fill="#7fb2ff" opacity={0.12} />
        {[0, 1].map((k) => <circle key={k} cx={x + 18 + k * 164} cy={y + 640} r={4} fill="#3b4870" />)}
      </g>
    ))}
  </g>
);
export const CabDetails: React.FC<{engine: number; frame: number}> = ({engine, frame}) => (
  <g>
    {/* кнопка «стоп» на стойке */}
    <rect x={447} y={1240} width={36} height={46} rx={8} fill="#c7433a" />
    <circle cx={465} cy={1263} r={10} fill="#ff8a7a" opacity={0.9} />
    {/* подсветка приборной панели */}
    <g filter="url(#lkBlur8)" opacity={engine}>
      {[60, 120, 180].map((x, i) => <circle key={i} cx={x} cy={1380} r={22} fill="#6cf0a8" opacity={0.5} />)}
      <circle cx={300} cy={1380} r={22} fill="#ff6b5a" opacity={0.6} />
    </g>
    <g opacity={0.35 + 0.65 * engine}>
      <circle cx={360} cy={1440} r={44} fill="#0e1322" stroke="#3a4670" strokeWidth={5} />
      <path d={`M360 1440 L${360 + 34 * Math.cos(-2.4 + engine * (1.2 + 0.05 * Math.sin(frame / 7)))} ${1440 + 34 * Math.sin(-2.4 + engine * (1.2 + 0.05 * Math.sin(frame / 7)))}`} stroke="#ff9a2e" strokeWidth={4} strokeLinecap="round" />
      {Array.from({length: 7}).map((_, i) => {
        const a = -3.4 + i * 0.5;
        return <path key={i} d={`M${360 + 36 * Math.cos(a)} ${1440 + 36 * Math.sin(a)} L${360 + 42 * Math.cos(a)} ${1440 + 42 * Math.sin(a)}`} stroke="#9fb6e6" strokeWidth={3} />;
      })}
    </g>
  </g>
);

/** Детальная ночная улица (под видом за окном): дома с окнами, вывеска, огни, отражения на мокром асфальте */
export const CityDetail: React.FC<{frame: number; lamp: number}> = ({frame, lamp}) => (
  <g>
    {/* дальний план */}
    {[[380, 470, 90, 400, '#121a36'], [470, 540, 150, 300, '#18234a'], [630, 500, 120, 340, '#142046'], [760, 470, 180, 380, '#1a2550'], [940, 520, 140, 330, '#131c3d']].map(([x, y, w, h, c], i) => (
      <g key={i}>
        <rect x={x as number} y={y as number} width={w as number} height={h as number} fill={c as string} />
        {Array.from({length: Math.floor(((w as number) - 16) / 28) * Math.floor(((h as number) - 60) / 40)}).map((_, k) => {
          const cols = Math.floor(((w as number) - 16) / 28);
          const cx = k % cols, cy = Math.floor(k / cols);
          if (hash(i * 7 + k * 11) < 0.55) return null;
          const col = hash(i + k * 5) > 0.82 ? '#9fe6ff' : '#ffcf7a';
          return <rect key={k} x={(x as number) + 10 + cx * 28} y={(y as number) + 16 + cy * 40} width={14} height={20} rx={2} fill={col} opacity={0.35 + 0.35 * hash(k * 3 + i)} />;
        })}
      </g>
    ))}
    {/* неоновая вывеска аптеки */}
    <g transform="translate(560 640)">
      <rect x={-6} y={-6} width={132} height={52} rx={8} fill="#0b1626" />
      <g style={{filter: 'drop-shadow(0 0 8px #2cff9a)'}}>
        <path d="M18 8 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10 v-10 h10z" fill="#3cffa6" />
        <text x={50} y={32} fontFamily="Inter" fontWeight={900} fontSize={20} fill="#9affd0">АПТЕКА</text>
      </g>
    </g>
    {/* огни машин вдали (боке) */}
    {[[520, 930, '#ff5a4a'], [548, 930, '#ff5a4a'], [880, 925, '#ffe0a0'], [905, 925, '#ffe0a0'], [700, 940, '#ffb35a']].map(([x, y, c], i) => (
      <circle key={i} cx={x as number} cy={y as number} r={9 + 2 * Math.sin(frame / 20 + i)} fill={c as string} opacity={0.7} filter="url(#lkBlur3)" />
    ))}
    {/* отражения на мокром асфальте */}
    <g filter="url(#lkBlur8)">
      <rect x={800} y={990} width={44} height={200} fill="#ffc56b" opacity={0.55 * lamp} />
      <rect x={590} y={990} width={30} height={150} fill="#3cffa6" opacity={0.35} />
      <rect x={524} y={990} width={14} height={120} fill="#ff5a4a" opacity={0.4} />
    </g>
  </g>
);

/** Дождь в несколько слоёв: дальний мелкий, ближний крупный, капли светятся у фонаря */
export const RainLayers: React.FC<{frame: number; lamp: number}> = ({frame, lamp}) => (
  <g>
    {[[60, 0.25, 1.4, 22, 44], [40, 0.45, 2.2, 40, 70]].map(([n, op, sw, len, speed], L) => (
      <g key={L}>
        {Array.from({length: n as number}).map((_, i) => {
          const x = 440 + hash(i + L * 100) * 520;
          const y = 420 + ((frame * (speed as number) + hash(i * 3 + L) * 900) % 900);
          const nearLamp = Math.max(0, 1 - Math.hypot(x - 822, y - 560) / 300) * lamp;
          return <path key={i} d={`M${x} ${y} l-${(len as number) * 0.2} ${len}`} stroke={nearLamp > 0.2 ? '#ffe2b0' : '#a9c4f0'} strokeWidth={sw as number} opacity={(op as number) + 0.5 * nearLamp} strokeLinecap="round" />;
        })}
      </g>
    ))}
  </g>
);

/** Боке-фон для крупных планов (размытые огни салона и улицы) */
export const Bokeh: React.FC<{frame: number; warm?: number; count?: number}> = ({frame, warm = 0.5, count = 16}) => (
  <g filter="url(#lkBlur20)">
    {Array.from({length: count}).map((_, i) => {
      const x = hash(i * 4.1) * 1080, y = hash(i * 7.7) * 1500 + 100;
      const c = hash(i * 2.9) < warm ? '#ffb866' : hash(i * 5.3) < 0.5 ? '#7fb2ff' : '#c8a0ff';
      return <circle key={i} cx={x + Math.sin(frame / 60 + i) * 12} cy={y} r={40 + hash(i * 3.3) * 70} fill={c} opacity={0.22 + 0.1 * Math.sin(frame / 30 + i)} />;
    })}
  </g>
);
