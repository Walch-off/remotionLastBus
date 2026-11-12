import {svgDoc} from "./engine";
import {RigSheet} from "./scenes/Debug";

export const FPS = 30;
export const DURATION = 5;
export function frameAt(t: number): string {
  return svgDoc({cx: 540, cy: 960, zoom: 1}, RigSheet({t}));
}
