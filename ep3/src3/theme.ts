/** Палитра, размеры кадра и математические помощники анимации. */
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  night: '#05070f',
  sky0: '#0a1224',
  sky1: '#050a14',
  wall: '#141d33',
  wallDark: '#0d1424',
  floor: '#0b1322',
  seat: '#1b2b4a',
  seatEdge: '#25395f',
  lamp: '#f7f2e0',
  lampWarm: '#ffbe5c',
  warm: '#ffcf8a',
  cold: '#8fc4f0',
  glass: '#0a1428',
  mirror: '#0e1a2e',
  metal: '#93a7c4',
  skin: '#e8b48f',
  skinDark: '#c98d6b',
  hoodie: '#2f3f63',
  hoodieDark: '#22304d',
  hair: '#241d2a',
  red: '#e0574f',
  lead: '#f4d27a',
};

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
export const easeCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Нормированный прогресс между двумя моментами. */
export const lin = (t: number, a: number, b: number) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));

/** Плавный въезд/выезд: 0 до a, 1 между a..b, спад c..d. */
export const ramp = (t: number, a: number, b: number, c = 1e9, d = 1e9, ease = easeInOut) => {
  if (t <= a) return 0;
  if (t < b) return ease(clamp((t - a) / Math.max(1e-6, b - a)));
  if (t <= c) return 1;
  if (t < d) return 1 - ease(clamp((t - c) / Math.max(1e-6, d - c)));
  return 0;
};

/** Кусочно-линейная интерполяция по ключевым кадрам [[t, v], ...]. */
export const kf = (t: number, keys: [number, number][], ease = true): number => {
  if (!keys.length) return 0;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i];
    const [t1, v1] = keys[i + 1];
    if (t >= t0 && t <= t1) {
      const p = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      return lerp(v0, v1, ease ? easeInOut(p) : p);
    }
  }
  return keys[keys.length - 1][1];
};

/** Детерминированный генератор — чтобы «случайность» не мигала между кадрами. */
export const mulberry = (seed: number) => {
  let x = seed | 0;
  return () => {
    x = (x + 0x6d2b79f5) | 0;
    let t = Math.imul(x ^ (x >>> 15), 1 | x);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Мерцание лампы: медленное + редкие провалы. */
export const flicker = (t: number, seed = 1, amp = 0.12) => {
  const a = Math.sin(t * 7.3 + seed) * 0.5 + Math.sin(t * 17.7 + seed * 2.1) * 0.3 + Math.sin(t * 31.1 + seed) * 0.2;
  return 1 - amp * (0.5 + 0.5 * a);
};

/** Тряска автобуса на ходу (детерминированная, мягкая). */
export const busShake = (t: number, amount = 1) => ({
  x: (Math.sin(t * 5.1) * 1.4 + Math.sin(t * 11.3) * 0.7) * amount,
  y: (Math.sin(t * 6.7 + 1.2) * 1.8 + Math.sin(t * 13.1) * 0.8) * amount,
  r: Math.sin(t * 4.3 + 0.4) * 0.22 * amount,
});

/** Текущее время кадра — чтобы мелкие детали (моргание) жили без прокидывания пропсов. */
export let NOW = 0;
export const setNow = (t: number) => {
  NOW = t;
};

/**
 * Моргание: короткое закрытие глаз каждые 3.2–5.0 с, со сдвигом фазы.
 * Возвращает 0..1 (1 = глаза закрыты).
 */
export const blinkAt = (t: number, phase = 0) => {
  const period = 3.4 + (phase % 1.7);
  const u = ((t + phase * 1.3) % period) / period;
  const start = 0.955;
  if (u < start) return 0;
  const p = (u - start) / (1 - start);
  return Math.sin(Math.PI * p);
};

export type Cam = {cx: number; cy: number; zoom: number};
