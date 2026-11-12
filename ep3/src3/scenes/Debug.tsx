/** Тест-лист рига: персонаж, рука, кисти. */
import {h} from "../engine";
import {Hero, Hand, Double, Arm} from "../scene/Hero";

export const RigSheet = (props: any) => {
  const {t = 0} = props;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={1920} fill="#0e1729" />
      <g transform="translate(240 700)">
        <Hero x={0} y={0} scale={0.55} mouthCurve={2} />
      </g>
      <g transform="translate(820 700)">
        <Hero x={0} y={0} scale={0.55} smile={1} mouthOpen={0.2} />
      </g>
      {/* рука в трёх углах */}
      <g transform="translate(200 1150)">
        <Arm x={0} y={0} upper={-8} lower={-4} />
      </g>
      <g transform="translate(520 1150)">
        <Arm x={0} y={0} upper={-70} lower={-95} hand={{fingers: [1, 1, 1, 0]}} />
      </g>
      <g transform="translate(850 1150)">
        <Arm x={0} y={0} upper={-40} lower={-10} hand={{face: 0.2}} />
      </g>
      {/* кисти крупно */}
      <g transform="translate(160 1700) scale(1.4)">
        <Hand fingers={[1, 1, 1, 1]} face={1} />
      </g>
      <g transform="translate(430 1700) scale(1.4)">
        <Hand fingers={[1, 1, 1, 0.1]} face={1} />
      </g>
      <g transform="translate(700 1700) scale(1.4)">
        <Hand fingers={[0.05, 1, 0.05, 0.05]} face={1} />
      </g>
      <g transform="translate(950 1700) scale(1.4)">
        <Hand fingers={[1, 1, 1, 1]} face={0.2} />
      </g>
    </g>
  );
};
