/** 13 сцен эпизода 3: салон автобуса, зеркало, стекло, финальное голосование. */
import {h} from "../engine";
import {C, clamp, lerp, kf, ramp, easeInOut, easeOut, mulberry, flicker} from "../theme";
import {BusInterior, project, heroAt, WIN_Z} from "../scene/Bus";
import {Hero, Double, Hand, Arm, HeadOnly} from "../scene/Hero";
import {Print, Drips, GlassText, Breath, LightPool} from "../scene/Marks";
import {StreetScene, GROUND_Y} from "../scene/Street";
import {GlassPane, ShotReturn} from "./Street";
import {VoteCard, TitleCard} from "./Overlays";

const heroSitting = (props: any) => <Hero seated legs {...props} />;

/**
 * Ночная улица внутри окна автобуса.
 * frame = {cx, cy, s, y1} от окна: s — пикселей на метр на этом стекле,
 * y1 — экранная y нижней кромки стекла. Улицу ставим так, чтобы земля была у кромки.
 */
const WindowStreet = (props: any) => {
  const {t = 0, lampOn = 1, shift = 0, rain = 1, o = 1, vx = 0, scale = 0.58, groundY = 1105, sign = "ПОСЛЕДНЯЯ", shelter = true} = props;
  const k = scale;
  return (
    <g opacity={0.96 * o} transform={`translate(${540 - 540 * k} ${groundY - 1046 * k}) scale(${k})`}>
      <StreetScene t={t} lampOn={lampOn} lampX={540 + vx + shift} shelterX={shelter ? 300 + vx + shift : -2000} rain={rain} sign={sign}>
        <g />
      </StreetScene>
    </g>
  );
};

/** Зеркало в кабине: рама + отражение (контент задаётся). */
export const Mirror = (props: any) => {
  const {t = 0, x = 540, y = 500, w = 300, h = 220, content, o = 1, crack = 0} = props;
  return (
    <g opacity={clamp(o)}>
      <rect x={x - w / 2 - 8} y={y - h / 2 - 8} width={w + 16} height={h + 16} rx={26} fill="#1a2436" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={20} fill="url(#mirrorG)" />
      <clipPath id={`mirClip-${Math.round(x)}-${Math.round(w)}`}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={20} />
      </clipPath>
      <g clipPath={`url(#mirClip-${Math.round(x)}-${Math.round(w)})`}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill="#0b1524" />
        {content}
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h * 0.42} fill="#ffffff" opacity={0.05} />
        {crack > 0.02
          ? [0, 1, 2, 3, 4].map((i) => {
              const rnd = mulberry(90 + i);
              const a = (i / 5) * Math.PI * 2;
              return (
                <path
                  key={i}
                  d={`M${x},${y} L${x + Math.cos(a) * w * (0.3 + rnd() * 0.3)},${y + Math.sin(a) * h * (0.3 + rnd() * 0.4)}`}
                  stroke="#dff0ff"
                  strokeWidth={1.6}
                  opacity={0.5 * crack}
                />
              );
            })
          : null}
      </g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={20} fill="none" stroke="#5b7597" strokeWidth={3} />
      {/* блик по стеклу зеркала */}
      <path
        d={`M${x - w / 2 + 14},${y + h / 2 - 14} L${x + w / 2 - 60},${y - h / 2 + 10}`}
        stroke="#ffffff"
        strokeWidth={10}
        opacity={0.06}
        strokeLinecap="round"
      />
    </g>
  );
};

/** Отражение героя в зеркале (голова крупно, зеркально). */
const MirrorHero = (props: any) => {
  const {x = 540, y = 500, scale = 1.4, smile = 0, eyeOpen = 1, lookX = 0, lookY = 0, hand = 0, o = 1, t = 0, mouthOpen = 0.05} = props;
  return (
    <g opacity={clamp(o)}>
      <HeadOnly x={x} y={y} scale={scale} smile={smile} eyeOpen={eyeOpen} lookX={lookX} lookY={lookY} brow={0.3} mouthOpen={mouthOpen} hood />
      {hand > 0.02 ? (
        <g opacity={clamp(hand)} transform={`translate(${x + 150 * scale} ${y + 60 * scale}) rotate(-8)`}>
          <Hand fingers={[1, 1, 1, 1]} face={1} spread={0.5} thumb={0.3} scale={scale * 0.62} />
        </g>
      ) : null}
    </g>
  );
};

/** Сцена 1: голосование «ОСТАТЬСЯ В АВТОБУСЕ», мокрые отпечатки на плечах. */
const SceneChoice = (props: any) => {
  const {t} = props;
  const hp = heroAt(-0.62, 2.6, 1.0);
  const sit = ramp(t, 0.2, 1.2);
  const prints = (k: number) => ramp(t, 4.4 + k * 1.1, 5.6 + k * 1.1);
  const doors = 1 - ramp(t, 4.6, 6.0);
  const glance = kf(t, [[0, 0.2], [2.2, -0.5], [4.4, 0.1], [7.4, 0.6]]);
  return (
    <g>
      <BusInterior
        t={t}
        light={1}
        doorsOpen={doors}
        windowScene={<WindowStreet t={t} vx={-40} />}
        extra={
          <g>
            {/* отпечатки на плечах героя рисуются в риге */}
            <g transform={`translate(${hp.x} ${hp.y})`}>
              <Hero
                x={0}
                y={0}
                scale={hp.scale * 1.02}
                legs
                lookX={glance}
                lookY={0.1}
                brow={0.5}
                mouthOpen={0.04 + 0.06 * sit}
                mouthCurve={-1}
                prints={{l: prints(0), r: prints(1)}}
                armL={{upper: -16, lower: -14}}
                armR={{upper: 16, lower: 14}}
              />
              <ellipse cx={0} cy={0} rx={130} ry={30} fill="#000" opacity={0.22} />
            </g>
          </g>
        }
      />
      <TitleCard t={t} t0={0.15} t1={2.6} />
      <VoteCard
        t={t}
        x={540}
        y={236}
        options={['ОСТАТЬСЯ В АВТОБУСЕ']}
        selected={0}
        appear={ramp(t, 0.4, 1.5, 5.6, 6.6)}
        o={1}
      />
    </g>
  );
};

/** Сцена 2: двери закрываются, автобус трогается. */
const SceneDepart = (props: any) => {
  const {t} = props;
  const doors = 1 - ramp(t, 7.6, 9.4);
  const hp = heroAt(-0.55, 2.4, 1.0);
  const sitDown = ramp(t, 9.6, 11.4);
  return (
    <g>
      <BusInterior
        t={t}
        light={1}
        doorsOpen={doors}
        windowScene={<WindowStreet t={t} vx={-20} shift={lerp(0, 400, ramp(t, 9.6, 13.6))} />}
        extra={
          <g transform={`translate(${hp.x} ${hp.y})`}>
            <Hero
              x={0}
              y={0}
              scale={hp.scale * 1.02}
              legs
              lookX={-0.4}
              lookY={0.2}
              brow={0.6}
              mouthOpen={0.1}
              prints={{l: 1, r: 1}}
              armL={{upper: -18, lower: -12}}
              armR={{upper: 34, lower: 30}}
            />
            {/* капли с волос */}
            <Drips x={-60} y={-1040} w={120} h={120} n={3} seed={7} o={0.4} />
          </g>
        }
      />
    </g>
  );
};

/** Сцена 3: пустые остановки проплывают за стеклом. */
const SceneEmptyStops = (props: any) => {
  const {t} = props;
  const shift = (t - 13.6) * 150;
  return (
    <g>
      <BusInterior
        t={t}
        light={0.9}
        doorsOpen={0}
        windowScene={<WindowStreet t={t} lampOn={0.9} vx={-900 + (shift % 500)} rain={1} o={0.85} sign="ПУСТО" />}
        extra={
          <g>
            {(() => {
              const hp = heroAt(-0.45, 2.0, 1);
              return (
                <g transform={`translate(${hp.x} ${hp.y})`}>
                  <Hero x={0} y={0} scale={hp.scale * 1.02} legs lookX={0.7} lookY={-0.1} prints={{l: 0.6, r: 0.6}} armL={{upper: -20, lower: -16}} armR={{upper: 22, lower: 18}} />
                </g>
              );
            })()}
          </g>
        }
      />
      <Drips x={0} y={0} w={1080} h={1920} n={10} seed={31} o={0.5} />
    </g>
  );
};

/** Сцена 4–5: водитель в зеркале, потом «в зеркале не ты». */
const SceneDriverMirror = (props: any) => {
  const {t} = props;
  const look = ramp(t, 26.4, 28.4, 30.6, 32.0);
  const lampOut = ramp(t, 35.4, 36.6);
  const hp = heroAt(-0.5, 4.3, 1);
  const mirrorY = 470;
  return (
    <g>
      <BusInterior
        t={t}
        light={1 - lampOut * 0.15}
        doorsOpen={0}
        driverIn={1}
        windowScene={<WindowStreet t={t} lampOn={1 - lampOut} vx={60} />}
        extra={
          <g>
            <Mirror
              t={t}
              x={540}
              y={mirrorY}
              w={420}
              h={250}
              content={
                <g>
                  <path d={`M330,${mirrorY + 96} Q540,${mirrorY + 30} 750,${mirrorY + 96} L750,${mirrorY + 150} L330,${mirrorY + 150} Z`} fill="#16233a" />
                  <HeadOnly
                    id="drv"
                    x={540}
                    y={mirrorY}
                    scale={1.05}
                    eyeOpen={0.9}
                    lookX={lerp(-0.7, 0.8, look)}
                    lookY={0.15}
                    brow={0.15}
                    browTilt={-5}
                    mouthOpen={0.02}
                    hair
                  />
                </g>
              }
            />
            {/* плечо героя в переднем плане */}
            <g transform={`translate(${hp.x} ${hp.y})`}>
              <Hero x={0} y={0} scale={hp.scale * 1.0} legs headTurn={0.2} lookX={0.2} lookY={-0.6} prints={{l: 0.8}} armL={{hidden: true}} armR={{hidden: true}} />
            </g>
          </g>
        }
      />
      <g opacity={lampOut * 0.55}>
        <rect x={0} y={0} width={1080} height={1920} fill="#02040a" />
      </g>
    </g>
  );
};

/** Сцена 5b: фонарь за окном гаснет. */
const SceneLampOut = (props: any) => {
  const {t} = props;
  const lampOut = 1 - ramp(t, 35.8, 37.0);
  const hp = heroAt(-0.62, 2.2, 1);
  return (
    <g>
      <BusInterior
        t={t}
        light={lerp(1, 0.7, 1 - lampOut)}
        doorsOpen={0}
        windowScene={<WindowStreet t={t} lampOn={lampOut} vx={140} groundY={1120} />}
        extra={
          <g transform={`translate(${hp.x} ${hp.y})`}>
            <Hero x={0} y={0} scale={hp.scale * 1.02} legs={false} lookX={0.5} lookY={-0.4} brow={0.7} mouthOpen={0.12} prints={{l: 0.9, r: 0.9}} armL={{upper: -14, lower: -12}} armR={{upper: 18, lower: 16}} />
          </g>
        }
      />
      <g opacity={(1 - lampOut) * 0.45}>
        <rect x={0} y={0} width={1080} height={1920} fill="#02040a" />
      </g>
    </g>
  );
};


/** Сцена 7: герой выходит к той же остановке, где стоит двойник и улыбается. */
const SceneDoubleStop = (props: any) => {
  const {t} = props;
  const smile = ramp(t, 57.6, 59.6);
  const approach = easeInOut(clamp((t - 52.4) / 3.4));
  const showHead = ramp(t, 56.2, 58.0);
  return (
    <g>
      <StreetScene t={t} lampOn={1} lampX={790} shelterX={420} rain={0.9} sign="ПОСЛЕДНЯЯ">
        {/* двойник у остановки, ровно на земле */}
        <g transform={`translate(700 ${GROUND_Y + 4}) scale(0.5)`}>
          <Double
            x={0}
            y={0}
            scale={1}
            smile={0.15 + smile * 0.85}
            lookX={-0.45}
            brow={0.1}
            headTilt={-3}
            armL={{upper: -11, lower: -8}}
            armR={{upper: 11, lower: 8}}
          />
        </g>
        {/* герой: сделал шаг из автобуса и остановился */}
        <g transform={`translate(${lerp(190, 268, approach)} ${GROUND_Y + 4}) scale(0.5)`}>
          <Hero
            x={0}
            y={0}
            scale={1}
            prints={{l: 1, r: 1}}
            lookX={0.55}
            lookY={0.1}
            brow={0.75}
            mouthOpen={0.06}
            mouthCurve={-2}
            bodyLean={-1.5}
            armL={{upper: -13, lower: -10}}
            armR={{upper: 13, lower: 10}}
          />
          <ellipse cx={0} cy={4} rx={120} ry={26} fill="#000" opacity={0.3} />
        </g>
      </StreetScene>
      {/* передний план: тёмная кромка двери, из которой он вышел */}
      <rect x={0} y={1760} width={1080} height={160} fill="#080e1a" opacity={0.85} />
      <GlassPane t={t} o={0.28} seed={19} rect={{x: 0, y: 0, w: 1080, h: 220}} />
      <Drips x={0} y={0} w={1080} h={520} n={14} seed={61} o={0.45} />
    </g>
  );
};

/** Сцена 8: три пальца → два → один. Двойник подносит руку к стеклу. */
const SceneFingers = (props: any) => {
  const {t} = props;
  // 63.76 «Три пальца», 64.59 «Два», 65.57 «Один»
  const n = t < 64.45 ? 3 : t < 65.45 ? 2 : 1;
  const up = ramp(t, 61.4, 63.0);
  const fingers = [0, 1, 2, 3].map((i) => (i < n ? 1 : 0.05));
  const sway = Math.sin(t * 1.1) * 2;
  return (
    <g>
      <StreetScene t={t} lampOn={1} lampX={800} shelterX={400} rain={0.9} sign="ПОСЛЕДНЯЯ">
        <g transform={`translate(${640 + sway} ${GROUND_Y + 4}) scale(0.78)`}>
          <Double
            x={0}
            y={0}
            scale={1}
            smile={0.95}
            lookX={-0.55}
            brow={0.05}
            headTilt={-4}
            armR={{upper: lerp(9, 122, up), lower: lerp(6, 148, up), hand: {fingers, face: 1, spread: 0.6, thumb: 0.3}}}
            armL={{upper: -12, lower: -9}}
          />
          <ellipse cx={0} cy={4} rx={120} ry={26} fill="#000" opacity={0.3} />
        </g>
        {/* герой у стекла, спиной, в низу кадра */}
        <g transform={`translate(200 ${GROUND_Y + 260}) scale(0.44)`}>
          <Hero
            x={0}
            y={0}
            scale={1}
            prints={{l: 1, r: 1}}
            headTurn={-0.4}
            brow={0.85}
            mouthOpen={0.06}
            mouthCurve={-2}
            armL={{upper: -12, lower: -9}}
            armR={{upper: 12, lower: 9}}
          />
        </g>
      </StreetScene>
      {/* мокрое стекло между нами */}
      <GlassPane t={t} o={0.42} seed={17} />
      <Drips x={0} y={0} w={1080} h={1920} n={16} seed={41} o={0.5} />
      <rect x={0} y={0} width={1080} height={120} fill="#070d18" />
      <rect x={0} y={1820} width={1080} height={100} fill="#0a1220" />
    </g>
  );
};

/** Сцена 8: свет гаснет, мокрые шаги, фонарик, поручень. */
const SceneLightsOut = (props: any) => {
  const {t} = props;
  const dark = ramp(t, 73.2, 75.2);
  const torch = ramp(t, 68.8, 70.6, 76.4, 77.6);
  const grip = ramp(t, 77.4, 79.4);
  const walk = clamp((t - 69) / 8);
  const step = Math.sin(t * 5.2);
  const hp = heroAt(lerp(-0.4, -0.1, walk), lerp(2.4, 3.4, walk), 1);
  return (
    <g>
      <BusInterior
        t={t}
        light={lerp(1, 0.16, dark)}
        doorsOpen={0}
        grip={grip}
        torch={torch * 0.9}
        extra={
          <g>
            <g transform={`translate(${hp.x} ${hp.y})`}>
              <Hero
                x={0}
                y={0}
                scale={hp.scale * 1.02}
                legs
                armL={{upper: lerp(-10, -46, grip), lower: lerp(-8, -72, grip), hand: grip > 0.3 ? {fingers: [1, 1, 1, 1], face: 0.6} : {}}}
                armR={{upper: lerp(10, -58, torch), lower: lerp(8, -22, torch)}}
                lookX={0.2}
                lookY={0.4}
                brow={0.8}
                prints={{l: 1, r: 1}}
                bodyLean={step * 1.2}
                legs={false}
              />
            </g>
            {/* фонарик в руке */}
            {torch > 0.05 ? (
              <g opacity={torch} transform={`translate(${hp.x + 150 * hp.scale} ${hp.y - 430 * hp.scale}) rotate(-16)`}>
                <rect x={-9} y={-15} width={70} height={30} rx={10} fill="#93a7c4" />
                <rect x={54} y={-19} width={18} height={38} rx={7} fill="#e8f1ff" />
              </g>
            ) : null}
            {/* мокрые следы на полу */}
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={hp.x - 60 + i * 90 - step * 20} cy={hp.y + 40 + i * 30} rx={26} ry={9} fill="url(#wetSheen)" opacity={0.5 * (1 - i * 0.2)} />
            ))}
          </g>
        }
      />
      <g opacity={dark * 0.35}>
        <rect x={0} y={0} width={1080} height={1920} fill="#02040a" />
      </g>
    </g>
  );
};

/** Сцена 9: отражение поднимает руку. */
const SceneReflection = (props: any) => {
  const {t} = props;
  const hand = ramp(t, 83.9, 86.0);
  const look = ramp(t, 86.2, 87.6);
  return (
    <g>
      <BusInterior
        t={t}
        light={0.55}
        doorsOpen={0}
        extra={
          <g>
            <Mirror
              t={t}
              x={540}
              y={480}
              w={520}
              h={330}
              content={<MirrorHero t={t} x={540} y={330} scale={0.78} hand={hand} smile={0.15} lookX={lerp(0, -0.5, look)} lookY={0.3} />}
            />
          </g>
        }
      />
      <g opacity={0.2}>
        <rect x={0} y={0} width={1080} height={1920} fill="#040810" />
      </g>
    </g>
  );
};

/** Сцена 10: «НЕ ОТВЕЧАЙ ЕМУ» проступает на стекле. */
const SceneGlassText = (props: any) => {
  const {t} = props;
  const o1 = ramp(t, 90.4, 91.0, 93.9, 95.0);
  const o2 = ramp(t, 95.0, 95.5, 98.2, 99.2);
  const hp = heroAt(0.62, 2.0, 0.95);
  const turn = ramp(t, 98.2, 99.8);
  return (
    <g>
      <BusInterior
        t={t}
        light={0.5}
        doorsOpen={0}
        extra={
          <g transform={`translate(${hp.x} ${hp.y})`}>
            <Hero
              x={0}
              y={0}
              scale={hp.scale * 1.02}
              legs
              headTurn={lerp(0.35, -0.7, turn)}
              lookX={0.35}
              lookY={-0.25}
              brow={0.9}
              mouthOpen={0.16}
              mouthCurve={-2}
              prints={{l: 0.8, r: 0.8}}
              armL={{upper: -12, lower: -10}}
              armR={{upper: 12, lower: 10}}
            />
            <ellipse cx={0} cy={0} rx={130} ry={30} fill="#000" opacity={0.3} />
          </g>
        }
      />
      {/* надписи поверх стекла: яркие, с холодным свечением и стекающими каплями */}
      <g>
        <GlassText t={t} t0={90.4} t1={92.2} x={540} y={700} size={78} o={o1} color="#dcecff" drip={0.9} />
        <GlassText t={t} t0={95.0} t1={96.8} x={540} y={960} size={78} o={o2} color="#dcecff" drip={0.9} />
      </g>
      <g opacity={0.35 * Math.max(o1, o2)}>
        <ellipse cx={540} cy={720} rx={430} ry={220} fill="#8fc4f0" opacity={0.12} />
      </g>
    </g>
  );
};

/** Сцена 11: «Скажи, как тебя зовут» — герой открывает рот и не помнит имени. */
const SceneQuestion = (props: any) => {
  const {t} = props;
  const speak = ramp(t, 103.9, 104.6, 106.2, 106.8);
  const mouth = ramp(t, 106.9, 107.6, 108.4, 109.2);
  const hp = heroAt(-0.5, 2.1, 1);
  return (
    <g>
      <BusInterior
        t={t}
        light={0.8}
        doorsOpen={0}
        driverIn={1}
        extra={
          <g>
            <Mirror
              t={t}
              x={700}
              y={430}
              w={300}
              h={190}
              o={0.9}
              content={
                <g transform={`translate(700 ${470}) scale(0.4)`}>
                  <Hero x={0} y={0} scale={1} legs={false} eyeOpen={0.9} lookX={-0.2} brow={0.7} mouthOpen={speak * 0.55} browTilt={6} prints={{}} armL={{hidden: true}} armR={{hidden: true}} hoodUp={false} />
                </g>
              }
            />
            <g transform={`translate(${hp.x} ${hp.y})`}>
              <Hero
                x={0}
                y={0}
                scale={hp.scale * 1.05}
                legs
                mouthOpen={0.05 + mouth * 0.5}
                mouthCurve={-3}
                eyeOpen={1 - mouth * 0.2}
                brow={0.75}
                lookX={-0.1}
                lookY={-0.3}
                prints={{l: 1, r: 1}}
                armL={{upper: -16, lower: -12}}
                armR={{upper: 16, lower: 12}}
              />
            </g>
            {mouth > 0.05 ? <Breath t={t} x={hp.x} y={hp.y - 700 * hp.scale} amount={mouth * 0.8} /> : null}
          </g>
        }
      />
      <g opacity={0.16 * (1 - mouth)}>
        <rect x={0} y={0} width={1080} height={1920} fill="#02040a" />
      </g>
    </g>
  );
};

/** Сцена 12: автобус встал; двойник на ступенях — один палец и стук по стеклу. */
const SceneOneFinger = (props: any) => {
  const {t} = props;
  const stop = ramp(t, 110.2, 112.4);
  const tap = clamp(Math.sin((t - 119.2) * 11)) * ramp(t, 119.0, 119.6);
  const up = ramp(t, 118.4, 119.8);
  return (
    <g>
      <StreetScene t={t} lampOn={1} lampX={800} shelterX={430} rain={0.9} sign="ПОСЛЕДНЯЯ">
        <g transform={`translate(0 ${lerp(40, 0, stop)})`}>
          <g transform={`translate(650 ${GROUND_Y + 4}) scale(0.52)`}>
            <Double
              x={0}
              y={0}
              scale={1}
              smile={0.9}
              lookX={-0.5}
              brow={0.1}
              armR={{upper: lerp(9, 140, up), lower: lerp(7, 168, up - tap * 0.1), hand: {fingers: [1, 0.05, 0.05, 0.05], face: 1, thumb: 0.2}}}
              armL={{upper: -12, lower: -9}}
            />
            <ellipse cx={0} cy={4} rx={120} ry={26} fill="#000" opacity={0.3} />
          </g>
        </g>
        {/* герой в проёме двери, ближе к камере */}
        <g transform={`translate(260 ${GROUND_Y + 210}) scale(0.62)`}>
          <Hero
            x={0}
            y={0}
            scale={1}
            prints={{l: 1, r: 1}}
            headTurn={-0.15}
            lookX={0.5}
            brow={0.8}
            mouthOpen={0.05}
            mouthCurve={-2}
            armL={{upper: -12, lower: -9}}
            armR={{upper: 12, lower: 9}}
          />
        </g>
      </StreetScene>
      {/* стекло двери и тёмные кромки */}
      <rect x={0} y={0} width={1080} height={110} fill="#070d18" opacity={0.92} />
      <rect x={0} y={1800} width={1080} height={120} fill="#0a1220" opacity={0.92} />
      <GlassPane t={t} o={0.45} seed={23} />
      <g opacity={tap}>
        <ellipse cx={520} cy={700} rx={100} ry={80} fill="url(#flashG)" opacity={0.35} />
      </g>
      <Drips x={0} y={0} w={1080} h={1920} n={14} seed={53} o={0.5} />
    </g>
  );
};

/** Сцена 13: улыбка в зеркале против лица без улыбки; водитель кладёт ключ. */
const SceneSmileKey = (props: any) => {
  const {t} = props;
  const smile = ramp(t, 123.6, 126.2);
  const hand = ramp(t, 126.8, 129.6);
  const key = ramp(t, 136.2, 138.4);
  return (
    <g>
      <BusInterior
        t={t}
        light={0.85}
        doorsOpen={0}
        driverIn={1}
        extra={
          <g>
            <Mirror
              t={t}
              x={300}
              y={420}
              w={330}
              h={210}
              content={<MirrorHero t={t} x={300} y={420} scale={0.72} smile={smile} hand={hand} lookX={0.3} lookY={0.2} />}
            />
            {/* герой рядом, без улыбки */}
            <g transform="translate(860 1560) scale(0.62)">
              <Hero x={0} y={0} scale={1} legs smile={0} mouthCurve={-1} eyeOpen={1} lookX={-0.6} lookY={0.2} brow={0.4} prints={{l: 1, r: 1}} armL={{upper: -14, lower: -12}} armR={{upper: 14, lower: 12}} />
            </g>
            {/* ключ на приборной панели */}
            {key > 0.02 ? (
              <g opacity={key} transform={`translate(455 1268) rotate(-6) scale(1.2)`}>
                <ellipse cx={0} cy={30} rx={44} ry={10} fill="#000" opacity={0.35} />
                <circle cx={0} cy={0} r={16} fill="none" stroke="#e6cf8a" strokeWidth={6} />
                <rect x={-5} y={14} width={10} height={52} rx={4} fill="#e6cf8a" />
                <rect x={3} y={50} width={18} height={8} rx={2} fill="#e6cf8a" />
                <rect x={3} y={62} width={13} height={8} rx={2} fill="#e6cf8a" />
                <ellipse cx={0} cy={-6} rx={30} ry={26} fill="url(#flashG)" opacity={0.4} />
              </g>
            ) : null}
          </g>
        }
      />
      <g opacity={0.14}>
        <rect x={0} y={0} width={1080} height={1920} fill="#02040a" />
      </g>
    </g>
  );
};

/** Эпилог: герой между зеркалом и ключом + финальное голосование. */
const SceneFinal = (props: any) => {
  const {t} = props;
  const look = kf(t, [[139.9, -0.7], [143.0, 0.7], [146.0, -0.2], [148.4, 0.5], [151.5, -0.5]]);
  const card = ramp(t, 143.0, 144.4);
  return (
    <g>
      <BusInterior
        t={t}
        light={0.7}
        doorsOpen={0}
        driverIn={1}
        extra={
          <g>
            <Mirror t={t} x={300} y={420} w={300} h={190} o={0.8} content={<MirrorHero t={t} x={300} y={340} scale={0.5} smile={0.55} hand={0.4} lookX={0.2} />} />
            <g opacity={0.9} transform="translate(820 1300) rotate(-8)">
              <ellipse cx={0} cy={26} rx={36} ry={9} fill="#000" opacity={0.35} />
              <circle cx={0} cy={0} r={13} fill="none" stroke="#e6cf8a" strokeWidth={5} />
              <rect x={-4} y={12} width={8} height={44} rx={3} fill="#e6cf8a" />
              <rect x={2} y={42} width={15} height={7} rx={2} fill="#e6cf8a" />
            </g>
            <g transform="translate(540 1560) scale(0.78)">
              <Hero x={0} y={0} scale={1} legs lookX={look} lookY={-0.1} brow={0.6} mouthCurve={-1} prints={{l: 1, r: 1}} armL={{upper: -14, lower: -12}} armR={{upper: 14, lower: 12}} />
            </g>
          </g>
        }
      />
      <VoteCard
        t={t}
        x={540}
        y={210}
        options={['РАЗБИТЬ ЗЕРКАЛО', 'ОТВЕТИТЬ ВОДИТЕЛЮ', 'ПРОДОЛЖЕНИЕ — В ЧАСТИ 4']}
        selected={-1}
        title="ЧТО ДЕЛАТЬ?"
        appear={card}
        o={1}
        scale={0.98}
      />
      <g opacity={0.2 * (1 - card)}>
        <rect x={0} y={0} width={1080} height={1920} fill="#02040a" />
      </g>
    </g>
  );
};

/** Диспетчер сцен. */
export const BusScene = (props: any) => {
  const {t, only} = props;
  const id =
    only ||
    (t < 7.4
      ? 'choice'
      : t < 13.6
      ? 'depart'
      : t < 21.8
      ? 'emptystops'
      : t < 34.0
      ? 'drivermirror'
      : t < 37.9
      ? 'lampout'
      : t < 46.6
      ? 'return'
      : t < 61.0
      ? 'doublestop'
      : t < 66.2
      ? 'fingers'
      : t < 83.6
      ? 'lightsout'
      : t < 90.3
      ? 'reflection'
      : t < 101.0
      ? 'glasstext'
      : t < 113.5
      ? 'question'
      : t < 123.3
      ? 'onefinger'
      : t < 139.9
      ? 'smilekey'
      : 'final');
  switch (id) {
    case 'choice':
      return <SceneChoice t={t} />;
    case 'depart':
      return <SceneDepart t={t} />;
    case 'emptystops':
      return <SceneEmptyStops t={t} />;
    case 'drivermirror':
      return <SceneDriverMirror t={t} />;
    case 'lampout':
      return <SceneLampOut t={t} />;
    case 'return':
      return <ShotReturn t={t} />;
    case 'doublestop':
      return <SceneDoubleStop t={t} />;
    case 'fingers':
      return <SceneFingers t={t} />;
    case 'lightsout':
      return <SceneLightsOut t={t} />;
    case 'reflection':
      return <SceneReflection t={t} />;
    case 'glasstext':
      return <SceneGlassText t={t} />;
    case 'question':
      return <SceneQuestion t={t} />;
    case 'onefinger':
      return <SceneOneFinger t={t} />;
    case 'smilekey':
      return <SceneSmileKey t={t} />;
    case 'final':
      return <SceneFinal t={t} />;
    default:
      return <SceneChoice t={t} />;
  }
};
