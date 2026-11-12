/** Оверлеи: карточки голосования, заголовок серии, субтитры. */
import {h} from "../engine";
import {C, clamp, lerp, easeOut, kf} from "../theme";
import {splitLines} from "../subtitles";

const FONT = "DejaVu Sans";

/** Карточка голосования: список вариантов, выбранный подсвечен. */
export const VoteCard = (props: any) => {
  const {x = 540, y = 300, w = 880, options = [], selected = -1, o = 1, title = 'ГОЛОСОВАНИЕ', appear = 1, scale = 1} = props;
  const rowH = 92;
  const hh = 96 + options.length * (rowH + 10);
  const ac = easeOut(clamp(appear));
  return (
    <g opacity={clamp(o) * ac} transform={`translate(${x} ${y}) scale(${lerp(0.94, 1, ac) * scale})`}>
      <rect x={-w / 2} y={0} width={w} height={hh} rx={30} fill="#070d18" opacity={0.86} stroke="#5d7ba6" strokeWidth={3} />
      <text x={0} y={62} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={34} fill="#cfe0f5" letterSpacing={3}>
        {title}
      </text>
      {options.map((op: string, i: number) => {
        const yy = 96 + i * (rowH + 10);
        const sel = i === selected;
        return (
          <g key={i}>
            <rect x={-w / 2 + 22} y={yy} width={w - 44} height={rowH} rx={18} fill={sel ? '#1d3a63' : '#101a2c'} stroke={sel ? '#ffd23f' : '#2b3b56'} strokeWidth={sel ? 4 : 2} />
            <text x={-w / 2 + 48} y={yy + rowH / 2 + 12} fontFamily={FONT} fontWeight="bold" fontSize={31} fill={sel ? '#ffe9a8' : '#a9bcd6'}>
              {op}
            </text>
            {sel ? (
              <g transform={`translate(${w / 2 - 66} ${yy + rowH / 2})`}>
                <circle cx={0} cy={0} r={16} fill="none" stroke="#ffd23f" strokeWidth={4} />
                <path d="M-7,0 L-1,7 L8,-7" stroke="#ffd23f" strokeWidth={4} fill="none" strokeLinecap="round" />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/** Заголовок серии в начале. */
export const TitleCard = (props: any) => {
  const {t = 0, t0 = 0.1, t1 = 3.2, o = 1} = props;
  const a = clamp((t - t0) / 0.5);
  const b = clamp((t1 - t) / 0.5);
  const op = Math.min(a, b) * o;
  if (op <= 0.001) return null;
  return (
    <g opacity={op}>
      <rect x={0} y={452} width={1080} height={230} fill="#05070f" opacity={0.42} />
      <text x={540} y={536} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={44} fill="#eaf2ff" letterSpacing={2}>
        ПОСЛЕДНИЙ АВТОБУС
      </text>
      <text x={540} y={638} textAnchor="middle" fontFamily={FONT} fontWeight="bold" fontSize={80} fill="#ffd23f" letterSpacing={4}>
        ЧАСТЬ 3
      </text>
    </g>
  );
};

/** Субтитры: одна <text> на строку, слова — <tspan>, активное слово золотое. */
export const Subtitles = (props: any) => {
  const {t = 0, cues = [], baseY = 1432, size = 66, o = 1} = props;
  const cue = cues.find((c: any) => t >= c.s - 0.06 && t <= c.e + 0.30);
  if (!cue) return null;
  const lines = splitLines(cue.words);
  const fade = Math.min(clamp((t - cue.s + 0.06) / 0.1), clamp((cue.e + 0.30 - t) / 0.16));
  const lh = size + 14;
  return (
    <g opacity={clamp(fade) * o}>
      {lines.map((line: any[], li: number) => {
        const y = baseY - (lines.length - 1 - li) * lh;
        return (
          <text
            key={li}
            x={540}
            y={y}
            textAnchor="middle"
            fontFamily={FONT}
            fontWeight="bold"
            fontSize={size}
            fill="#ffffff"
            stroke="#05070f"
            strokeWidth={13}
            paintOrder="stroke"
            strokeLinejoin="round"
            xmlSpace="preserve"
          >
            {line.map((w: any, wi: number) => {
              const active = t >= w.s - 0.02 && t <= w.e + 0.06;
              return (
                <tspan key={wi} fill={active ? '#ffd23f' : '#ffffff'}>
                  {(wi ? ' ' : '') + w.text}
                </tspan>
              );
            })}
          </text>
        );
      })}
    </g>
  );
};
