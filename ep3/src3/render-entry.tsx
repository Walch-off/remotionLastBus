/** Точка входа: кадр = чистая функция времени. */
import fs from "node:fs";
import path from "node:path";
import {svgDoc} from "./engine";
import {Timeline, FPS, DURATION, cameraAt} from "./Timeline";

export const DATA = JSON.parse(fs.readFileSync(path.resolve("src3/data/words3.json"), "utf8")) as any;
export {FPS, DURATION};

export function frameAt(t: number, only?: string): string {
  const cam = cameraAt(t);
  const body = Timeline({t, data: DATA, only});
  return svgDoc(cam, body);
}

export const TOTAL_FRAMES = Math.round(DURATION * FPS);
