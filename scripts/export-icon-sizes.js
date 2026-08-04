/**
 * Export all favicon / PWA / Apple sizes from the approved icon-512.png.
 * node scripts/export-icon-sizes.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'public/icons/icon-512.png');
if (!fs.existsSync(src)) {
  console.error('Missing', src);
  process.exit(1);
}

function sips(size, out) {
  execFileSync('sips', ['-z', String(size), String(size), src, '--out', out], {
    stdio: 'inherit',
  });
}

const iconsDir = path.join(root, 'public/icons');
sips(192, path.join(iconsDir, 'icon-192.png'));
sips(180, path.join(iconsDir, 'apple-touch-icon.png'));
fs.copyFileSync(path.join(iconsDir, 'apple-touch-icon.png'), path.join(root, 'public/apple-touch-icon.png'));
sips(32, path.join(root, 'public/favicon-32.png'));
sips(48, path.join(root, 'public/favicon-48.png'));
fs.copyFileSync(path.join(root, 'public/favicon-32.png'), path.join(root, 'public/favicon.png'));

// Next.js App Router metadata files
fs.copyFileSync(src, path.join(root, 'app/icon.png'));
fs.copyFileSync(path.join(iconsDir, 'apple-touch-icon.png'), path.join(root, 'app/apple-icon.png'));

console.log('Exported icon sizes from public/icons/icon-512.png');
