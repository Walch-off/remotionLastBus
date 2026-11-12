/**
 * Риг персонажа. Локальные координаты: ступни на y=0, макушка на y=-1000
 * (рост 1000 юнитов ≈ 1.75 м, масштаб задаёт сцена).
 * Плечи (±96, -742), таз (±68, -520), шея (0, -790), центр головы (0, -880).
 *
 * Углы рук: 0° = строго вниз, +90° = вправо. Отрицательные — влево.
 */
import {h} from "../engine";
import {C, clamp, lerp, NOW, blinkAt} from "../theme";

const SKIN = C.skin;
const SKIN_D = C.skinDark;

export type HandPose = {
  fingers?: number[]; // [указательный, средний, безымянный, мизинец] 0..1
  spread?: number;
  thumb?: number;
  face?: number; // 1 = ладонь к зрителю, 0 = тыл кисти
  bend?: number;
  flip?: boolean;
  scale?: number;
};

/** Пальцы: x-смещение основания, длина, толщина. */
const FINGERS = [
  {x: -33, len: 78, w: 21},
  {x: -11, len: 88, w: 22},
  {x: 11, len: 82, w: 21},
  {x: 32, len: 64, w: 18},
];

/** Кисть. Пальцы растут вверх (−y), ладонь по центру, запястье внизу. */
export const Hand = (props: HandPose) => {
  const {fingers = [1, 1, 1, 1], spread = 0.4, thumb = 0.55, face = 1, bend = 0, flip = false, scale = 1} = props;
  const palmW = 96;
  const palmH = 104;
  const front = face >= 0.55;
  const skin = front ? SKIN : SKIN_D;
  return (
    <g transform={`scale(${flip ? -scale : scale} ${scale})`}>
      {/* пальцы (основания уходят под ладонь) */}
      {FINGERS.map((f, i) => {
        const ext = clamp(fingers[i] ?? 1, 0, 1);
        const ang = (i - 1.5) * 9 * spread * (0.35 + 0.65 * ext);
        const L = lerp(f.len * 0.3, f.len, ext);
        const w = f.w * (0.88 + 0.12 * ext);
        const cx = f.x * (1 + 0.22 * spread);
        return (
          <g key={i} transform={`translate(${cx} ${-palmH * 0.34}) rotate(${ang})`}>
            <rect x={-w / 2} y={-L - 10} width={w} height={L + 34} rx={w / 2} fill={skin} />
            {front ? (
              <rect x={-w * 0.26} y={-L - 4} width={w * 0.52} height={L * 0.55} rx={w * 0.26} fill="#ffffff" opacity={0.16} />
            ) : (
              <ellipse cx={0} cy={-L + 2} rx={w * 0.32} ry={w * 0.3} fill={SKIN} opacity={0.5} />
            )}
          </g>
        );
      })}
      {/* большой палец */}
      <g transform={`translate(${-palmW * 0.44} ${-palmH * 0.16}) rotate(${lerp(40, 6, clamp(thumb))})`}>
        <rect x={-13} y={-62} width={26} height={74} rx={13} fill={skin} />
      </g>
      {/* ладонь */}
      <path
        d={`M${-palmW / 2},${-palmH * 0.30} q0,-30 ${palmW / 2},-30 q${palmW / 2},0 ${palmW / 2},30 l0,${palmH * 0.72} q0,30 ${-palmW / 2},30 q${-palmW / 2},0 ${-palmW / 2},-30 Z`}
        fill={skin}
      />
      {front ? (
        <g opacity={0.45} stroke={SKIN_D} strokeWidth={3} fill="none" strokeLinecap="round">
          <path d={`M${-palmW * 0.26},${-palmH * 0.06} q${palmW * 0.14},${20} ${palmW * 0.3},${4} q${palmW * 0.12},${-14} ${palmW * 0.24},${-2}`} />
          <path d={`M${-4},${palmH * 0.1} q${10},${18} ${0},${30}`} />
        </g>
      ) : (
        <g opacity={0.35}>
          <rect x={-palmW * 0.3} y={-palmH * 0.2} width={palmW * 0.24} height={palmH * 0.5} rx={11} fill={SKIN} />
          <rect x={palmW * 0.04} y={-palmH * 0.2} width={palmW * 0.24} height={palmH * 0.5} rx={11} fill={SKIN} />
        </g>
      )}
      {/* манжета */}
      <rect x={-palmW * 0.46} y={palmH * 0.44} width={palmW * 0.92} height={26} rx={12} fill={C.hoodieDark} />
    </g>
  );
};

/**
 * Рука: плечо → локоть → кисть. Локоть не «ломается»: длина сегментов
 * фиксирована, углы задаются анимацией, кисть висит на запястье.
 */
export const Arm = (props: any) => {
  const {
    x = 0,
    y = 0,
    upper = 8,
    lower = 6,
    len1 = 168,
    len2 = 150,
    sleeve = true,
    hand = {},
    hidden = false,
    w1 = 56,
    w2 = 46,
    sleeveEnd = 0.72,
  } = props;
  if (hidden) return null;
  const a1 = (upper * Math.PI) / 180;
  const ex = x + Math.sin(a1) * len1;
  const ey = y + Math.cos(a1) * len1;
  const a2 = (lower * Math.PI) / 180;
  const hx = ex + Math.sin(a2) * len2;
  const hy = ey + Math.cos(a2) * len2;
  const cuffX = lerp(ex, hx, sleeveEnd);
  const cuffY = lerp(ey, hy, sleeveEnd);
  return (
    <g>
      <path d={`M${x},${y} L${ex},${ey}`} stroke={sleeve ? C.hoodie : SKIN} strokeWidth={w1} strokeLinecap="round" />
      <path d={`M${ex},${ey} L${hx},${hy}`} stroke={SKIN} strokeWidth={w2 - 12} strokeLinecap="round" />
      {sleeve ? <path d={`M${ex},${ey} L${cuffX},${cuffY}`} stroke={C.hoodieDark} strokeWidth={w2} strokeLinecap="round" /> : null}
      <g transform={`translate(${hx} ${hy}) rotate(${180 - lower}) scale(0.72)`}>
        <Hand {...hand} />
      </g>
    </g>
  );
};

/** Глаз: белок, радужка со взглядом, веко, бровь. */
export const Eye = (props: any) => {
  const {x = 0, y = 0, open = 1, lookX = 0, lookY = 0, big = 1, brow = 0.2, browTilt = 0, id = 0, glare = 0} = props;
  const rx = 19 * big;
  const ry = 23 * big;
  const lid = lerp(ry * 0.96, -ry - 3, clamp(open));
  const clipId = `eye-${id}-${Math.round(x)}-${Math.round(open * 40)}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#eef4ff" />
      <clipPath id={clipId}>
        <ellipse cx={0} cy={0} rx={rx} ry={ry} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <circle cx={lookX * 9} cy={4 + lookY * 7} r={11.5 * big} fill="#2b3f60" />
        <circle cx={lookX * 9} cy={4 + lookY * 7} r={5.8 * big} fill="#0a0f1a" />
        <circle cx={lookX * 9 - 4 * big} cy={-1 + lookY * 7} r={3.2 * big} fill="#ffffff" opacity={0.92} />
        <rect x={-rx - 2} y={-ry - 4} width={rx * 2 + 4} height={Math.max(0, lid + ry + 4)} fill={SKIN} />
        {glare > 0.02 ? <rect x={-rx} y={-ry} width={rx * 2} height={ry * 2} fill="#ffffff" opacity={glare * 0.35} /> : null}
      </g>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={C.hair} strokeWidth={4} />
      <g transform={`translate(0 ${-ry - 24}) rotate(${browTilt})`}>
        <rect x={-rx * 0.95} y={lerp(-12, -2, clamp(brow))} width={rx * 1.9} height={9} rx={4.5} fill={C.hair} />
      </g>
    </g>
  );
};

/**
 * Рот: губы, объём, зубы.
 * curve > 0 — улыбка (широкая дуга с зубами), curve < 0 — сжатые губы,
 * creep — «неправильная» ухмылка двойника поверх.
 */
export const Mouth = (props: any) => {
  const {x = 0, y = 0, open = 0, curve = 0, w = 1, teeth = 0.4, creep = 0, id = 0} = props;
  const WW = 33 * w;
  const op = clamp(open);
  const sm = clamp(curve / 13, 0, 1);
  const sad = clamp(-curve / 6, 0, 1);
  const clipId = `mouth-${id}-${Math.round(op * 40)}-${Math.round(curve)}-${Math.round(WW)}`;
  // форма: у улыбки дуга шире и нижняя губа провисает
  const topY = -sm * 9 + sad * 6;
  const botY = 1.5 + op * 30 + sm * 8;
  const cornerY = -sm * 15 + sad * 8 + op * 4;
  const d = `M${-WW},${cornerY} Q0,${topY} ${WW},${cornerY} Q${WW * 0.72},${botY} 0,${botY + 2} Q${-WW * 0.72},${botY} ${-WW},${cornerY} Z`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={d} fill="#37171e" />
      <clipPath id={clipId}>
        <path d={d} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect x={-WW - 2} y={topY - 4} width={WW * 2 + 4} height={Math.max(0.6, (botY - topY) * 0.34 * teeth + 3) * clamp(op * 6)} fill="#f7f0e6" />
        <rect x={-WW - 2} y={botY - (botY - topY) * 0.3} width={WW * 2 + 4} height={(botY - topY) * 0.4} fill="#b4616b" opacity={0.35 + op * 0.4} />
        <rect x={-WW - 2} y={topY - 4} width={WW * 2 + 4} height={Math.max(1.5, 3 + sm * 4)} fill="#8a4238" opacity={0.55} />
      </g>
      {/* контур губ */}
      <path d={d} stroke="#8a4238" strokeWidth={3} fill="none" strokeLinejoin="round" />
      {/* уголки: у улыбки чуть приподняты и с ямочкой */}
      {sm > 0.05 ? (
        <>
          <path d={`M${-WW},${cornerY} q-6,${-4} -10,${-9}`} stroke="#8a4238" strokeWidth={2.8} fill="none" strokeLinecap="round" opacity={sm} />
          <path d={`M${WW},${cornerY} q6,${-4} 10,${-9}`} stroke="#8a4238" strokeWidth={2.8} fill="none" strokeLinecap="round" opacity={sm} />
        </>
      ) : null}
      {creep > 0.55 ? (
        <path d={`M${-WW * 1.1},${cornerY + 4} Q0,${topY - 8} ${WW * 1.1},${cornerY + 4}`} stroke="#6d3030" strokeWidth={2.4} fill="none" opacity={(creep - 0.55) * 1.6} strokeLinecap="round" />
      ) : null}
    </g>
  );
};

export type HeroProps = {
  x?: number;
  y?: number;
  scale?: number;
  rot?: number;
  headTilt?: number;
  headTurn?: number;
  eyeOpen?: number;
  lookX?: number;
  lookY?: number;
  brow?: number;
  browTilt?: number;
  mouthOpen?: number;
  mouthCurve?: number;
  mouthW?: number;
  teeth?: number;
  creep?: number;
  smile?: number;
  armL?: any;
  armR?: any;
  armSide?: 1 | -1; // зеркальное отражение
  legs?: boolean;
  seated?: boolean;
  hoodUp?: boolean;
  prints?: {l?: number; r?: number};
  torch?: number;
  keyring?: number;
  eyeGlare?: number;
  bodyLean?: number;
  ghost?: number;
  eyesOnly?: boolean;
  id?: number;
};

/** Персонаж целиком (ступни в (0,0)). */
export const Hero = (props: HeroProps) => {
  const {
    x = 0,
    y = 0,
    scale = 1,
    rot = 0,
    headTilt = 0,
    headTurn = 0,
    eyeOpen = 1,
    lookX = 0,
    lookY = 0,
    brow = 0.2,
    browTilt = 0,
    mouthOpen = 0.015,
    mouthCurve = 0,
    mouthW = 1.15,
    teeth = 0.45,
    creep = 0,
    smile,
    armL = {},
    armR = {},
    legs = true,
    seated = true,
    hoodUp = true,
    prints = {},
    torch = 0,
    keyring = 0,
    eyeGlare = 0,
    bodyLean = 0,
    ghost = 0,
    id = 1,
  } = props;
  const open = clamp(eyeOpen);
  const curve = smile !== undefined ? lerp(mouthCurve, 13, clamp(smile)) : mouthCurve;
  const cr = smile !== undefined ? clamp(smile) : creep;
  // Пропорции: стоя — плечи на -762, сидя (sit) — на -604 при ступнях на полу.
  const sit = !!(props as any).sit;
  const shoulderY = sit ? -604 : -762;
  const hipY = sit ? -300 : -466;
  const neckY = sit ? -642 : -800;
  const headY = sit ? -744 : -900;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
      {/* ноги */}
      {legs ? (
        <g>
          {sit ? (
            <>
              {/* сидя: бедро уходит вперёд (в экран), голень вертикально вниз */}
              <path d={`M${-50},${hipY} L${-58},${hipY + 120}`} stroke={C.hoodieDark} strokeWidth={76} strokeLinecap="round" />
              <path d={`M${50},${hipY} L${58},${hipY + 120}`} stroke={C.hoodieDark} strokeWidth={76} strokeLinecap="round" />
              <path d={`M${-58},${hipY + 110} L${-62},${-56}`} stroke="#1e2b45" strokeWidth={58} strokeLinecap="round" />
              <path d={`M${58},${hipY + 110} L${62},${-56}`} stroke="#1e2b45" strokeWidth={58} strokeLinecap="round" />
              <ellipse cx={-64} cy={-24} rx={44} ry={18} fill="#151b2b" />
              <ellipse cx={64} cy={-24} rx={44} ry={18} fill="#151b2b" />
            </>
          ) : (
            <>
              <path d={`M${-52},${hipY} L${-66},${-250}`} stroke={C.hoodieDark} strokeWidth={64} strokeLinecap="round" />
              <path d={`M${52},${hipY} L${66},${-250}`} stroke={C.hoodieDark} strokeWidth={64} strokeLinecap="round" />
              <path d={`M${-66},${-250} L${-70},${-56}`} stroke="#1e2b45" strokeWidth={56} strokeLinecap="round" />
              <path d={`M${66},${-250} L${70},${-56}`} stroke="#1e2b45" strokeWidth={56} strokeLinecap="round" />
              <ellipse cx={-76} cy={-26} rx={48} ry={20} fill="#151b2b" />
              <ellipse cx={76} cy={-26} rx={48} ry={20} fill="#151b2b" />
            </>
          )}
        </g>
      ) : null}
      <g transform={`rotate(${bodyLean} 0 ${hipY})`}>
        {/* торс: плечи шире талии, скруглённые края */}
        <path
          d={`M-76,${hipY + 30} C-90,${hipY - 60} -108,${shoulderY + 40} -104,${shoulderY} 
              C-98,${shoulderY - 36} -52,${shoulderY - 48} 0,${shoulderY - 48} 
              C52,${shoulderY - 48} 98,${shoulderY - 36} 104,${shoulderY} 
              C108,${shoulderY + 40} 90,${hipY - 60} 76,${hipY + 30} Z`}
          fill={C.hoodie}
        />
        {/* тень по краю и складки */}
        <path d={`M-104,${shoulderY} C-98,${shoulderY + 90} -84,${hipY - 40} -76,${hipY + 30}`} stroke={C.hoodieDark} strokeWidth={14} fill="none" opacity={0.55} />
        <path d={`M104,${shoulderY} C98,${shoulderY + 90} 84,${hipY - 40} 76,${hipY + 30}`} stroke={C.hoodieDark} strokeWidth={14} fill="none" opacity={0.55} />
        <path d={`M0,${shoulderY - 40} L0,${hipY + 20}`} stroke={C.hoodieDark} strokeWidth={5} opacity={0.85} />
        {/* карман-кенгуру */}
        <path d={`M-52,${hipY - 30} q52,26 104,0 l-8,86 q-44,20 -88,0 Z`} fill={C.hoodieDark} opacity={0.75} />
        {/* мокрые отпечатки ладоней на плечах */}
        {[0, 1].map((k) => {
          const v = k === 0 ? prints.l ?? 0 : prints.r ?? 0;
          if (v <= 0.01) return null;
          const cx = k === 0 ? -74 : 74;
          const cy = shoulderY + 34;
          return (
            <g key={k} opacity={clamp(v)} transform={`translate(${cx} ${cy}) rotate(${k === 0 ? -26 : 26}) scale(0.92)`}>
              <ellipse rx={22} ry={26} fill="#cfe6ff" opacity={0.13} />
              <ellipse rx={15} ry={18} fill="#eaf4ff" opacity={0.15} />
              {[-11, -4, 3, 10].map((fx, fi) => (
                <ellipse key={fi} cx={fx} cy={-30} rx={3.6} ry={8.5} fill="#eaf4ff" opacity={0.16} />
              ))}
              <ellipse cx={-20} cy={0} rx={5} ry={9} transform="rotate(-38 -20 0)" fill="#eaf4ff" opacity={0.15} />
            </g>
          );
        })}
        {/* капюшон */}
        {hoodUp ? (
          <path
            d={`M-58,${shoulderY - 16} C-56,${shoulderY - 74} 56,${shoulderY - 74} 58,${shoulderY - 16} C60,${shoulderY + 8} 38,${shoulderY + 16} 0,${shoulderY + 16} C-38,${shoulderY + 16} -60,${shoulderY + 8} -58,${shoulderY - 16} Z`}
            fill={C.hoodieDark}
          />
        ) : null}
        {/* руки — за торсом и перед ним: плечо на краю торса */}
        <Arm x={-104} y={shoulderY + 26} upper={armL.upper ?? -7} lower={armL.lower ?? -5} {...armL} />
        <Arm x={104} y={shoulderY + 26} upper={armR.upper ?? 7} lower={armR.lower ?? 5} {...armR} />
        {/* шея */}
        <path d={`M-24,${neckY - 6} q24,12 48,0 l6,${shoulderY - neckY + 26} q-30,14 -60,0 Z`} fill={SKIN_D} />
        <path d={`M-24,${neckY - 6} q24,12 48,0 l2,14 q-26,10 -52,0 Z`} fill="#b8805f" opacity={0.55} />
        {/* голова */}
        <g transform={`translate(0 ${headY}) rotate(${headTilt}) translate(${headTurn * 12} 0) scale(1.1)`}>
          <ellipse cx={-74} cy={4} rx={12} ry={20} fill={SKIN_D} />
          <ellipse cx={74} cy={4} rx={12} ry={20} fill={SKIN_D} />
          <path
            d="M-74,-8 C-74,-70 -42,-100 0,-100 C42,-100 74,-70 74,-8 C74,40 44,72 0,78 C-44,72 -74,40 -74,-8 Z"
            fill={SKIN}
          />
          {/* тень от волос */}
          <path d="M-74,-10 C-74,-74 -40,-102 0,-102 C40,-102 74,-74 74,-10 C58,-44 30,-56 0,-56 C-30,-56 -58,-44 -74,-10 Z" fill={C.hair} />
          {/* волосы с чёлкой */}
          <path d="M-80,-14 C-88,-84 -44,-118 4,-116 C52,-114 86,-80 80,-12 C74,-46 50,-62 10,-64 C-32,-66 -70,-48 -80,-14 Z" fill={C.hair} />
          <path d="M-78,-30 C-70,-64 -44,-78 -18,-74 C-44,-64 -62,-50 -70,-22 Z" fill="#1a1520" opacity={0.5} />
          <path d="M78,-30 C70,-64 44,-78 18,-74 C44,-64 62,-50 70,-22 Z" fill="#1a1520" opacity={0.5} />
          <path d="M-34,-94 C-6,-110 34,-104 56,-84" stroke="#3b3141" strokeWidth={5} fill="none" opacity={0.65} strokeLinecap="round" />
          <g transform="translate(0 4)">
            <Eye id={`${id}L`} x={-31} y={0} open={open} lookX={lookX} lookY={lookY} brow={brow} browTilt={browTilt} glare={eyeGlare} />
            <Eye id={`${id}R`} x={31} y={0} open={open} lookX={lookX} lookY={lookY} brow={brow} browTilt={-browTilt} glare={eyeGlare} />
          </g>
          <path d="M-2,18 C-7,32 -8,38 -2,41" stroke={SKIN_D} strokeWidth={4.6} fill="none" strokeLinecap="round" />
          <ellipse cx={-6} cy={40} rx={5} ry={3} fill={SKIN_D} opacity={0.5} />
          <g transform="translate(0 60)">
            <Mouth id={id} open={mouthOpen} curve={curve} w={mouthW} teeth={teeth} creep={cr} />
          </g>
          <ellipse cx={-46} cy={26} rx={13} ry={7} fill={SKIN_D} opacity={0.3} />
          <ellipse cx={46} cy={26} rx={13} ry={7} fill={SKIN_D} opacity={0.3} />
        </g>
      </g>
      {ghost > 0.01 ? <ellipse cx={0} cy={-480} rx={150} ry={470} fill={C.cold} opacity={0.12 * ghost} /> : null}
      {/* фонарик в правой руке */}
      {torch > 0.01 ? (
        <g transform={`translate(${armR.x ?? 0} ${armR.y ?? 0})`} opacity={0} />
      ) : null}
      {keyring > 0.01 ? (
        <g transform={`translate(150 ${-420})`} opacity={clamp(keyring)}>
          <circle cx={0} cy={0} r={14} fill="none" stroke="#c9b06a" strokeWidth={5} />
          <rect x={-4} y={12} width={8} height={42} rx={3} fill="#c9b06a" />
          <rect x={2} y={42} width={15} height={7} rx={2} fill="#c9b06a" />
        </g>
      ) : null}
    </g>
  );
};

/** Двойник: тот же риг, но холоднее и с ухмылкой. */
export const Double = (props: any) => {
  const {smile = 1, ...rest} = props;
  return (
    <g opacity={rest.o ?? 1}>
      <Hero {...rest} prints={{}} smile={smile} teeth={0.62} brow={0.02} browTilt={5} eyeGlare={0.25} />
    </g>
  );
};

/**
 * Голова отдельно (для отражений в зеркале и крупных планов).
 * Центр головы — в (0,0), лицо смотрит на зрителя, рост головы ~200 юнитов.
 */
export const HeadOnly = (props: any) => {
  const {
    x = 0,
    y = 0,
    scale = 1,
    rot = 0,
    tilt = 0,
    turn = 0,
    eyeOpen = 1,
    lookX = 0,
    lookY = 0,
    brow = 0.3,
    browTilt = 0,
    mouthOpen = 0.015,
    mouthCurve = 0,
    mouthW = 1.15,
    teeth = 0.45,
    creep = 0,
    smile,
    eyeGlare = 0,
    hair = true,
    hood = false,
    id = "h",
  } = props;
  const open = clamp(eyeOpen) * (1 - 0.94 * blinkAt(NOW, String(id).length * 0.7));
  const curve = smile !== undefined ? lerp(mouthCurve, 13, clamp(smile)) : mouthCurve;
  const cr = smile !== undefined ? clamp(smile) : creep;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <g transform={`rotate(${tilt}) translate(${turn * 12} 0)`}>
        <ellipse cx={-74} cy={4} rx={12} ry={20} fill={SKIN_D} />
        <ellipse cx={74} cy={4} rx={12} ry={20} fill={SKIN_D} />
        <path
          d="M-74,-8 C-74,-70 -42,-100 0,-100 C42,-100 74,-70 74,-8 C74,40 44,72 0,78 C-44,72 -74,40 -74,-8 Z"
          fill={SKIN}
        />
        {hair ? (
          <>
            <path d="M-74,-10 C-74,-74 -40,-102 0,-102 C40,-102 74,-74 74,-10 C58,-44 30,-56 0,-56 C-30,-56 -58,-44 -74,-10 Z" fill={C.hair} />
            <path d="M-80,-14 C-88,-84 -44,-118 4,-116 C52,-114 86,-80 80,-12 C74,-46 50,-62 10,-64 C-32,-66 -70,-48 -80,-14 Z" fill={C.hair} />
            <path d="M-34,-94 C-6,-110 34,-104 56,-84" stroke="#3b3141" strokeWidth={5} fill="none" opacity={0.65} strokeLinecap="round" />
          </>
        ) : null}
        <g transform="translate(0 4)">
          <Eye id={`${id}L`} x={-31} y={0} open={open} lookX={lookX} lookY={lookY} brow={brow} browTilt={browTilt} glare={eyeGlare} />
          <Eye id={`${id}R`} x={31} y={0} open={open} lookX={lookX} lookY={lookY} brow={brow} browTilt={-browTilt} glare={eyeGlare} />
        </g>
        <path d="M-2,18 C-7,32 -8,38 -2,41" stroke={SKIN_D} strokeWidth={4.6} fill="none" strokeLinecap="round" />
        <g transform="translate(0 60)">
          <Mouth id={id} open={mouthOpen} curve={curve} w={mouthW} teeth={teeth} creep={cr} />
        </g>
        <ellipse cx={-46} cy={26} rx={13} ry={7} fill={SKIN_D} opacity={0.3} />
        <ellipse cx={46} cy={26} rx={13} ry={7} fill={SKIN_D} opacity={0.3} />
        {hood ? (
          <path
            d="M-96,-6 C-100,-92 -50,-136 0,-136 C50,-136 100,-92 96,-6 C88,-70 52,-104 0,-104 C-52,-104 -88,-70 -96,-6 Z"
            fill={C.hoodieDark}
          />
        ) : null}
      </g>
    </g>
  );
};
