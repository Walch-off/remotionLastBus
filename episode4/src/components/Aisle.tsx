import React from 'react';
import {useCurrentFrame} from 'remotion';

/** Вид героя назад по проходу: пусто, тёмные сиденья, мерцающий свет под потолком. Одноточечная перспектива. */
export const AisleView: React.FC<{flicker?: number}> = ({flicker = 0}) => {
  const frame = useCurrentFrame();
  const vx = 540, vy = 800;
  // глубина d: 0 (ближе всего) .. 1 (дальний конец)
  const S = (d: number) => 1 / (1 + 4.2 * d);
  const P = (d: number, ox: number, oy: number) => [vx + ox * S(d), vy + oy * S(d)];
  const rows = [0, 0.1, 0.22, 0.36, 0.52, 0.7];
  const fl = (i: number) => {
    const base = 0.9;
    const k = ((frame * (13 + i * 7) + i * 31) % 29) < 4 + i ? 0.12 : 1;
    return flicker > 0 ? base * (1 - flicker * (1 - k)) : base;
  };
  const pts = (arr: number[][]) => arr.map((p) => p.join(',')).join(' ');
  return (
    <g>
      <rect width={1080} height={1920} fill="#070b1a" />
      {/* пол */}
      <polygon points={pts([P(0, -1700, 900), P(0, 1700, 900), P(0.95, 190, 90), P(0.95, -190, 90)])} fill="#0d1429" />
      <polygon points={pts([P(0, -190, 900), P(0, 190, 900), P(0.95, 20, 90), P(0.95, -20, 90)])} fill="#141c38" />
      {/* потолок */}
      <polygon points={pts([P(0, -1700, -1100), P(0, 1700, -1100), P(0.95, 190, -190), P(0.95, -190, -190)])} fill="#0a0f20" />
      {/* стены с окнами */}
      <polygon points={pts([P(0, -1700, -1100), P(0, -1700, 900), P(0.95, -190, 90), P(0.95, -190, -190)])} fill="#101834" />
      <polygon points={pts([P(0, 1700, -1100), P(0, 1700, 900), P(0.95, 190, 90), P(0.95, 190, -190)])} fill="#101834" />
      {rows.map((d, i) => {
        const d2 = d + 0.07;
        return [-1, 1].map((sd) => (
          <polygon key={`w${i}${sd}`} points={pts([P(d, sd * 1700, -350), P(d, sd * 1700, 150), P(d2, sd * 1700 * 0.93, 150), P(d2, sd * 1700 * 0.93, -350)].map((p, k) => p))}
            fill="#1c2a52" opacity={0.7} />
        ));
      })}
      {/* ряды сидений: спинка + подушка по обе стороны, никого нет */}
      {rows.slice().reverse().map((d, ri) => {
        const i = rows.length - 1 - ri;
        return [-1, 1].map((sd) => {
          const s = S(d);
          const x0 = vx + sd * 280 * s, w = 400 * s;
          const left = sd < 0 ? x0 - w : x0;
          return (
            <g key={`s${i}${sd}`}>
              <rect x={left} y={vy + 40 * s} width={w} height={520 * s} rx={46 * s} fill="#2a355a" />
              <rect x={left} y={vy + 40 * s} width={w} height={40 * s} rx={20 * s} fill="#3c4a78" opacity={0.7} />
              <rect x={left} y={vy + 560 * s} width={w} height={150 * s} rx={30 * s} fill="#222c4b" />
              <rect x={left + (sd < 0 ? w - 14 * s : 0)} y={vy - 600 * s} width={14 * s} height={1200 * s} fill="#8c93a8" opacity={0.5} />
            </g>
          );
        });
      })}
      {/* плафоны потолка (мерцают) */}
      {[0.02, 0.14, 0.28, 0.44, 0.62, 0.82].map((d, i) => {
        const [x1, y1] = P(d, -90, -1000), [x2, y2] = P(d + 0.05, 90, -1000);
        const o = fl(i);
        return (
          <g key={i}>
            <rect x={x1} y={y1} width={x2 - x1} height={Math.max(6, (y2 - y1) * 0.5)} rx={6} fill="#fff4d2" opacity={o} />
            <ellipse cx={(x1 + x2) / 2} cy={y1 + 40 * S(d)} rx={320 * S(d)} ry={260 * S(d)} fill="#fff2c9" opacity={0.05 * o} />
          </g>
        );
      })}
      {/* дальний конец: кабина и ночная улица */}
      <rect x={vx - 150} y={vy - 120} width={300} height={220} fill="#0b1226" />
      <rect x={vx - 118} y={vy - 90} width={236} height={110} fill="#1d2c52" opacity={0.8} />
      <circle cx={vx + 40} cy={vy - 30} r={26} fill="url(#bulbGlow)" opacity={0.6} />
    </g>
  );
};
