/**
 * Canvas icon — thick stroke + solid tip drawn on top with overlap (no white seam).
 */
const fs = require('fs');
const path = require('path');

const BG = '#ffffff';
const BLUE = '#5b8def';
const AMBER = '#f59e42';
const CX = 256;
const CY = 256;
const R = 168;
const STROKE = 38;
const GAP = 50;
const SWEEP = 180 - GAP;
const START = GAP / 2;
const TIP_LEN = 78;
const TIP_HALF = STROKE * 0.82;
/** Tip base pulled back into shaft; tip painted on top closes the join */
const TIP_OVERLAP = Math.round(STROKE * 0.65);

const extractPath = path.join(__dirname, 'dumbbell-extract.png');
fs.copyFileSync(extractPath, path.join(__dirname, '../public/icons/dumbbell.png'));
const dumbbellB64 = fs.readFileSync(extractPath).toString('base64');
const dbW = 205;
const dbH = Math.round(205 * (288 / 471));

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>html,body{margin:0;width:512px;height:512px;overflow:hidden;background:${BG}}</style>
</head><body>
<canvas id="c" width="512" height="512"></canvas>
<script>
const ctx = document.getElementById('c').getContext('2d');
ctx.fillStyle = '${BG}';
ctx.fillRect(0,0,512,512);

const CX=${CX}, CY=${CY}, R=${R}, STROKE=${STROKE}, HALF=STROKE/2;
const TIP_LEN=${TIP_LEN}, TIP_HALF=${TIP_HALF}, TIP_OVERLAP=${TIP_OVERLAP};
const START=${START}, SWEEP=${SWEEP};

function theta(ourDeg){ return (ourDeg - 90) * Math.PI / 180; }
function pt(ourDeg){
  const t = theta(ourDeg);
  return [CX + R * Math.cos(t), CY + R * Math.sin(t)];
}

function drawArrow(color, startOur) {
  const endOur = startOur + SWEEP;
  const steps = 120;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    pts.push(pt(startOur + (SWEEP * i) / steps));
  }

  const [x0, y0] = pts[pts.length - 2];
  const [ex, ey] = pts[pts.length - 1];
  let tangX = ex - x0, tangY = ey - y0;
  const tlen = Math.hypot(tangX, tangY) || 1;
  tangX /= tlen; tangY /= tlen;
  const outX = tangY, outY = -tangX; // CW-normal (y-down)

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = STROKE;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'round';

  // Round start only
  const [sx, sy] = pts[0];
  ctx.beginPath();
  ctx.arc(sx, sy, HALF, 0, Math.PI * 2);
  ctx.fill();

  // Shaft — butt end at geometric tip attach point
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();

  // Tip on TOP: base nested into shaft so no white gap / AA seam
  const bx = ex - tangX * TIP_OVERLAP;
  const by = ey - tangY * TIP_OVERLAP;
  const apexX = ex + tangX * TIP_LEN;
  const apexY = ey + tangY * TIP_LEN;

  ctx.beginPath();
  ctx.moveTo(bx + outX * TIP_HALF, by + outY * TIP_HALF);
  ctx.lineTo(apexX, apexY);
  ctx.lineTo(bx - outX * TIP_HALF, by - outY * TIP_HALF);
  ctx.closePath();
  ctx.fill();
}

drawArrow('${BLUE}', START);
drawArrow('${AMBER}', START + 180);

const img = new Image();
img.onload = () => {
  ctx.drawImage(img, CX - ${dbW}/2, CY - ${dbH}/2, ${dbW}, ${dbH});
  document.title = 'ready';
};
img.src = 'data:image/png;base64,${dumbbellB64}';
</script>
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'icon-source.html'), html);
fs.writeFileSync(path.join(__dirname, 'generate-icon.js'), `require('./compose-icon.js');\n`);
console.log('OK', { STROKE, TIP_LEN, TIP_OVERLAP, TIP_HALF });
