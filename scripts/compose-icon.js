/**
 * Compose icon from extracted reference dumbbell + cycle arcs with tips at ends.
 * node scripts/compose-icon.js
 */
const fs = require('fs');
const path = require('path');

const CX = 256;
const CY = 256;
const BG = '#ffffff';
const BLUE = '#5b8def';
const AMBER = '#f59e42';

const R = 178;
const STROKE = 28;
const GAP = 36;
const SWEEP = 180 - GAP;
const START = GAP / 2;
const TIP_STROKE = 12;

function rad(d) {
  return (d * Math.PI) / 180;
}
function polar(r, deg) {
  const a = rad(deg - 90);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}
function add(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}
function mul(v, s) {
  return [v[0] * s, v[1] * s];
}
function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
}
function r2(n) {
  return Math.round(n * 100) / 100;
}
function f(p) {
  return `${r2(p[0])} ${r2(p[1])}`;
}
function frame(deg) {
  const a = rad(deg - 90);
  return {
    forward: [-Math.sin(a), Math.cos(a)],
    outward: [Math.cos(a), Math.sin(a)],
  };
}
function shaftD(startDeg, endDeg) {
  const a = polar(R, startDeg);
  const b = polar(R, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${f(a)} A ${R} ${R} 0 ${large} 1 ${f(b)}`;
}
function tipAt(tipDeg) {
  const { forward, outward } = frame(tipDeg);
  const tip = polar(R, tipDeg);
  const tipPt = add(tip, mul(forward, 2));
  const back = 15;
  const half = STROKE * 0.95;
  const base = sub(tip, mul(forward, back));
  const left = add(base, mul(outward, half));
  const right = sub(base, mul(outward, half));
  return `M ${f(tipPt)} L ${f(left)} L ${f(right)} Z`;
}
function arrow(color, startDeg, shaftEnd, tipDeg) {
  return `
  <path d="${shaftD(startDeg, shaftEnd)}" fill="none" stroke="${color}"
        stroke-width="${STROKE}" stroke-linecap="round"/>
  <path d="${tipAt(tipDeg)}" fill="${color}" stroke="${color}" stroke-width="${TIP_STROKE}"
        stroke-linejoin="round" stroke-linecap="round"/>`;
}

const BLUE_START = START;
const BLUE_TIP = START + SWEEP;
const BLUE_SHAFT_END = BLUE_TIP - 8;
const AMBER_START = START + 180;
const AMBER_TIP = AMBER_START + SWEEP;
const AMBER_SHAFT_END = AMBER_TIP - 8;

const extractPath = path.join(__dirname, 'dumbbell-extract.png');
const publicDumbbell = path.join(__dirname, '../public/icons/dumbbell.png');
fs.copyFileSync(extractPath, publicDumbbell);

const dumbbellB64 = fs.readFileSync(extractPath).toString('base64');
const dbW = 220;
const dbH = Math.round(220 * (288 / 471));

const arcs = `
  ${arrow(BLUE, BLUE_START, BLUE_SHAFT_END, BLUE_TIP)}
  ${arrow(AMBER, AMBER_START, AMBER_SHAFT_END, AMBER_TIP)}
`;

const imageTag = `<image href="data:image/png;base64,${dumbbellB64}"
    x="${CX - dbW / 2}" y="${CY - dbH / 2}"
    width="${dbW}" height="${dbH}"
    preserveAspectRatio="xMidYMid meet"/>`;

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>html,body{margin:0;width:512px;height:512px;overflow:hidden;background:${BG}}</style>
</head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BG}"/>
  ${arcs}
  ${imageTag}
</svg>
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'icon-source.html'), html);
// Keep generate-icon.js as a thin redirect
fs.writeFileSync(
  path.join(__dirname, 'generate-icon.js'),
  `require('./compose-icon.js');\n`
);
console.log('OK — wrote scripts/icon-source.html (screenshot → public/icons/icon-512.png)');
console.log('Then run: node scripts/export-icon-sizes.js');
console.log({ dbW, dbH });
