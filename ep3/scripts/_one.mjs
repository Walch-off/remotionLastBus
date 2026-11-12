import {Resvg} from '@resvg/resvg-js';
import fs from 'node:fs';
const svg = fs.readFileSync(process.argv[2], 'utf8');
new Resvg(svg, {fitTo: {mode: 'width', value: 540}, font: {fontFiles: ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'], loadSystemFonts: false, defaultFontFamily: 'DejaVu Sans'}}).render().asPng();
