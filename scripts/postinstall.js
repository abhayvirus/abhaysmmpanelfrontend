/**
 * Ensure workbox-webpack-plugin v7 inside react-scripts (Node 24 dev-server fix).
 * Uses symlink from root node_modules — avoids `npm install` inside react-scripts
 * which can corrupt nested babel-loader / webpack deps.
 */
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const rsDir = path.join(root, 'node_modules', 'react-scripts');
if (!fs.existsSync(rsDir)) process.exit(0);

const rootWb = path.join(root, 'node_modules', 'workbox-webpack-plugin');
const rsNm = path.join(rsDir, 'node_modules');
const rsWb = path.join(rsNm, 'workbox-webpack-plugin');

if (!fs.existsSync(rootWb)) {
  console.warn('[postinstall] workbox-webpack-plugin not found at project root — run npm install');
  process.exit(0);
}

try {
  const rootPkg = JSON.parse(fs.readFileSync(path.join(rootWb, 'package.json'), 'utf8'));
  if (!String(rootPkg.version).startsWith('7.')) {
    console.warn('[postinstall] Expected workbox-webpack-plugin v7 at root, got', rootPkg.version);
    process.exit(0);
  }

  if (!fs.existsSync(rsNm)) fs.mkdirSync(rsNm, { recursive: true });

  if (fs.existsSync(rsWb)) {
    try {
      const rsPkg = JSON.parse(fs.readFileSync(path.join(rsWb, 'package.json'), 'utf8'));
      if (String(rsPkg.version).startsWith('7.')) process.exit(0);
      fs.rmSync(rsWb, { recursive: true, force: true });
    } catch {
      fs.rmSync(rsWb, { recursive: true, force: true });
    }
  }

  const type = process.platform === 'win32' ? 'junction' : 'dir';
  fs.symlinkSync(rootWb, rsWb, type);
} catch (err) {
  console.warn('[postinstall] workbox symlink skipped:', err.message);
}
