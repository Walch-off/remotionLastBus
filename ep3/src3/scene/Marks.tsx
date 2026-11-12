/** Следы: мокрые отпечатки ладоней, надписи на стекле, пар от дыхания. */
import {h} from "../engine";
import {C, clamp, lerp, mulberry} from "../theme";

/** Мокрый отпечаток ладони (fingers — прозрачность пальцев). */
export const Print = (props: any) => {
  const {x = 0, y = 0, s = 1, rot = 0, o = 1, blur = 1, flip = false} = props;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`} opacity={clamp(o)}>
      <ellipse rx={26} ry={30} fill="#bfe0ff" opacity={0.16 * blur} />
      <ellipse rx={19} ry={23} fill="#eaf4ff" opacity={0.2 * blur} />
      {[-14, -5, 4, 13].map((fx, i) => (
        <ellipse key={i} cx={fx} cy={-33} rx={4.6} ry={11.5} fill="#eaf4ff" opacity={0.22 * blur} />
      ))}
      <ellipse cx={-24} cy={3} rx={6.2} ry={11} transform="rotate(-34 -24 3)" fill="#eaf4ff" opacity={0.2 * blur} />
    </g>
  );
};

/** Капли, стекающие по стеклу (детерминированные). */
export const Drips = (props: any) => {
  const {x = 0, y = 0, w = 300, h = 380, n = 12, seed = 5, o = 1} = props;
  const rnd = mulberry(seed * 7331);
  const items: any[] = [];
  for (let i = 0; i < n; i++) {
    const px = x + rnd() * w;
    const py = y + rnd() * h * 0.7;
    const len = 20 + rnd() * 90;
    items.push(
      <g key={i} opacity={(0.1 + rnd() * 0.22) * o}>
        <rect x={px} y={py} width={2.4} height={len} rx={1.2} fill="#cfe4ff" />
        <ellipse cx={px + 1.2} cy={py + len} rx={3.4} ry={4.4} fill="#eaf4ff" />
      </g>,
    );
  }
  return <g>{items}</g>;
};

/** Надпись на стекле: буквы проступают по одной, с потёками. */
const WORD = "НЕ ОТВЕЧАЙ ЕМУ";
export const GlassText = (props: any) => {
  const {t = 0, t0 = 0, t1 = 1, x = 540, y = 900, size = 64, o = 1, color = "#cfe8ff", drip = 1} = props;
  const chars = WORD.split("");
  const per = (t1 - t0) / 7.0;
  // раскладка в две строки: «НЕ ОТВЕЧАЙ» / «ЕМУ»
  const lines = ["НЕ ОТВЕЧАЙ", "ЕМУ"];
  const adv = size * 1.02;
  let idx = 0;
  return (
    <g opacity={clamp(o)}>
      {lines.map((line, li) => {
        const wpx = line.length * adv * 0.56;
        const ly = y + li * size * 1.32;
        return (
          <g key={li}>
            {line.split("").map((c, ci) => {
              if (c === " ") {
                idx++;
                return null;
              }
              const a = clamp((t - (t0 + idx * per)) / 0.2);
              idx++;
              if (a <= 0.002) return null;
              const lx = x - wpx / 2 + ci * adv * 0.56 + adv * 0.28;
              return (
                <g key={ci} opacity={a}>
                  <text x={lx} y={ly} textAnchor="middle" fontFamily="DejaVu Sans" fontWeight="bold" fontSize={size} fill={color} opacity={0.95}>
                    {c}
                  </text>
                  {drip > 0.02 ? (
                    <rect x={lx - 1.6} y={ly + size * 0.12} width={3.2} height={size * 0.55 * drip * (0.35 + 0.65 * a)} rx={1.6} fill={color} opacity={0.45 * drip} />
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

/** Пар от дыхания на морозном воздухе. */
export const Breath = (props: any) => {
  const {t = 0, x = 0, y = 0, amount = 1, seed = 3} = props;
  const rnd = mulberry(seed * 131);
  return (
    <g opacity={clamp(amount)}>
      {[0, 1, 2].map((i) => {
        const ph = (t * 0.5 + i * 0.33) % 1;
        return (
          <ellipse
            key={i}
            cx={x + (rnd() - 0.5) * 26 + ph * 18}
            cy={y - ph * 46}
            rx={16 + ph * 34}
            ry={10 + ph * 22}
            fill="#cfe4ff"
            opacity={0.11 * (1 - ph) * amount}
          />
        );
      })}
    </g>
  );
};

/** Пятна света от фонарика на полу/стене. */
export const LightPool = (props: any) => {
  const {x = 540, y = 1400, rx = 240, ry = 90, o = 0.3} = props;
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#flashG)" opacity={o} />;
};
