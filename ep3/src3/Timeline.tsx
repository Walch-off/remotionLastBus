/** Сборка кадра: сцена по времени + камера + субтитры. */
import {h, Fragment} from "./engine";
import {kf, setNow} from "./theme";
import {BusScene} from "./scenes/Bus";
import {SHOTS, DURATION as DUR_SHOTS, shotAt} from "./shots";
import {buildCues} from "./subtitles";
import {Subtitles} from "./scenes/Overlays";

export const FPS = 30;
export const DURATION = DUR_SHOTS;

export type Cam = {cx: number; cy: number; zoom: number};

/** Камера: интерполяция ключей монтажного листа. */
export const cameraAt = (t: number): Cam => {
  const s = shotAt(t);
  const keys = s.cam;
  return {
    cx: kf(t, keys.map((k) => [k.t, k.cx] as [number, number]), false),
    cy: kf(t, keys.map((k) => [k.t, k.cy] as [number, number]), false),
    zoom: kf(t, keys.map((k) => [k.t, k.zoom] as [number, number]), false),
  };
};

let cueCache: any = null;
export const cuesOf = (data: any) => {
  if (!cueCache || cueCache.words !== data.words) cueCache = {words: data.words, cues: buildCues(data.words)};
  return cueCache.cues;
};

const num = (v: number) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : 0);

export const Timeline: React.FC<any> = ({t, data, only}) => {
  setNow(t);
  const cam = cameraAt(t);
  const z = cam.zoom || 1;
  const tx = 540 - cam.cx * z;
  const ty = 960 - cam.cy * z;
  const camT = z === 1 && Math.abs(tx) < 1e-6 && Math.abs(ty) < 1e-6
    ? ""
    : `translate(${num(tx)} ${num(ty)}) scale(${num(z)})`;
  return (
    <Fragment>
      <g transform={camT || undefined}>
        <BusScene t={t} only={only} />
      </g>
      {only ? null : <Subtitles t={t} cues={cuesOf(data)} baseY={1580} size={64} />}
    </Fragment>
  );
};
