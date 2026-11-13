import {Config} from '@remotion/cli/config';
import fs from 'fs';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
// Локальный Chromium используется, только если он есть; иначе Remotion скачает свой headless shell.
const CHROME = process.env.REMOTION_CHROME ?? '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(CHROME)) Config.setBrowserExecutable(CHROME);
Config.setConcurrency(1);
