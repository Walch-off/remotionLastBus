import {useCurrentFrame, useVideoConfig} from 'remotion';
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const ramp = (t: number, a: number, b: number) => ease(lin(t, a, b));
/** piecewise eased keyframes: [[t,v],...] */
export const kf = (t: number, pts: [number, number][]) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) return lerp(pts[i - 1][1], pts[i][1], ease((t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0])));
  }
  return pts[pts.length - 1][1];
};
/** camera keyframes [t,cx,cy,scale] -> svg transform mapping (cx,cy) to screen anchor */
export const camT = (t: number, keys: [number, number, number, number][], ax = 540, ay = 960) => {
  const cx = kf(t, keys.map((k) => [k[0], k[1]] as [number, number]));
  const cy = kf(t, keys.map((k) => [k[0], k[2]] as [number, number]));
  const s = kf(t, keys.map((k) => [k[0], k[3]] as [number, number]));
  return `translate(${ax} ${ay}) scale(${s}) translate(${-cx} ${-cy})`;
};
export const useT = (t0: number) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return t0 + f / fps;
};
export const SKIN = '#f3c292';
