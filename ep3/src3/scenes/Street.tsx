/** Внешние («через стекло») кадры: остановка, двойник, стекло с дождём. */
import {h} from "../engine";
import {C, clamp, lerp, ramp, kf, easeInOut, mulberry} from "../theme";
import {StreetScene, GROUND_Y} from "../scene/Street";
import {Hero, Double} from "../scene/Hero";
import {Print, Drips, Breath} from "../scene/Marks";

/** Двойник на остановке: рост 1000 юнитов у земли y=1046. */
export const StopDouble = (props: any) => {
  const {x = 700, y = GROUND_Y, scale = 0.5, arm = {}, smile = 1, o = 1, prints = {l: 0, r: 0}} = props;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={clamp(o)}>
      <Double x={0} y={0} scale={1} smile={smile} armL={arm.left || {}} armR={arm.right || {}} prints={prints} />
    </g>
  );
};

/** Стекло: полосы блика и струи дождя. */
export const GlassPane = (props: any) => {
  const {t = 0, rect = {x: 0, y: 0, w: 1080, h: 1920}, o = 1, seed = 4} = props;
  const rnd = mulberry(seed * 977);
  const drops = Array.from({length: 26}, () => ({x: rnd(), y0: rnd(), len: 30 + rnd() * 120, sp: 0.5 + rnd() * 0.5, w: 1.4 + rnd() * 1.6, o: 0.08 + rnd() * 0.16}));
  return (
    <g opacity={clamp(o)}>
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="#a9d4ff" opacity={0.035} />
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill="url(#glassSheen)" opacity={0.09} />
      <g>
        {drops.map((d, i) => {
          const y = rect.y + ((d.y0 * rect.h + t * 34 * d.sp) % (rect.h + 200)) - 100;
          return <rect key={i} x={rect.x + d.x * rect.w} y={y} width={d.w} height={d.len} rx={d.w / 2} fill="#cfe4ff" opacity={d.o} />;
        })}
      </g>
    </g>
  );
};

/** Кадр 6: автобус возвращается к той же остановке (вид из салона через мокрое стекло). */
export const ShotReturn = (props: any) => {
  const {t = 0} = props;
  const a = ramp(t, 37.9, 39.4);
  const lamp = ramp(t, 41.6, 42.6);
  const busShift = lerp(16, 0, easeInOut(clamp((t - 39.0) / 3.2)));
  return (
    <g>
      <StreetScene t={t} lampOn={lamp} lampX={700} shelterX={520} rain={0.9} sign="ПОСЛЕДНЯЯ">
        <g transform={`translate(${busShift} 0)`}>
          <StopDouble x={660} y={GROUND_Y - 96} scale={0.34} smile={0.25} o={ramp(t, 42.4, 43.4)} />
        </g>
      </StreetScene>
      {/* рама окна автобуса */}
      <rect x={0} y={0} width={1080} height={150} fill="#070d18" />
      <rect x={0} y={1720} width={1080} height={200} fill="#0a1220" />
      <rect x={0} y={0} width={64} height={1920} fill="#0a1220" />
      <rect x={1016} y={0} width={64} height={1920} fill="#0a1220" />
      <GlassPane t={t} o={0.9} seed={9} />
      <Drips t={t} x={0} y={0} w={1080} h={1920} n={16} seed={21} o={0.7} />
      {/* отражение салона в стекле: сиденье и подголовник в нижней трети */}
      <g opacity={0.55}>
        <rect x={0} y={1500} width={1080} height={220} fill="#111c2e" />
        <ellipse cx={330} cy={1500} rx={150} ry={70} fill="#1b2b45" />
        <ellipse cx={760} cy={1520} rx={170} ry={76} fill="#182742" />
      </g>
      <g opacity={0.9 * a}>
        <rect x={0} y={0} width={1080} height={1920} fill="#0b1526" opacity={0.14} />
      </g>
    </g>
  );
};

/** Кадр 7: двойник поднимает руку — три пальца, два, один. */
export const ShotFingers = (props: any) => {
  const {t = 0} = props;
  // 63.76 «Три пальца», 64.59 «Два», 65.57 «Один»
  const n = t < 64.45 ? 3 : t < 65.45 ? 2 : 1;
  const up = ramp(t, 61.0, 62.2);
  const fingers = [1, 1, 1, 1].map((_, i) => (i < n ? 1 : 0.02));
  const heroShake = Math.sin(t * 6) * 2;
  return (
    <g>
      <StreetScene t={t} lampOn={1} lampX={760} shelterX={420} rain={0.8} sign="ПОСЛЕДНЯЯ">
        <StopDouble x={640} y={GROUND_Y + 8} scale={0.54} smile={0.9} o={1} />
      </StreetScene>
      {/* рука двойника крупно поверх */}
      <g opacity={up} transform={`translate(700 760) scale(1.9)`}>
        <g transform="rotate(-8)">
          <g transform="translate(0 -140) rotate(180)">
            <g>{h}</g>
          </g>
        </g>
      </g>
      <GlassPane t={t} o={0.55} seed={13} />
      <rect x={0} y={0} width={1080} height={110} fill="#070d18" />
      <rect x={0} y={1780} width={1080} height={180} fill="#0a1220" />
    </g>
  );
};
