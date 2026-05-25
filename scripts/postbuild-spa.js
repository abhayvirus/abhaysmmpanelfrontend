/**
 * Copy index.html → 404.html so static hosts (Render, etc.) serve the SPA on direct URL refresh.
 */
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const index = path.join(buildDir, 'index.html');
const notFound = path.join(buildDir, '404.html');

if (!fs.existsSync(index)) {
  console.warn('[postbuild-spa] build/index.html not found — skip 404.html copy');
  process.exit(0);
}

fs.copyFileSync(index, notFound);
console.log('[postbuild-spa] Created build/404.html for SPA routing');

const htaccess = path.join(__dirname, '..', 'public', '.htaccess');
const htaccessBuild = path.join(buildDir, '.htaccess');
if (fs.existsSync(htaccess)) {
  fs.copyFileSync(htaccess, htaccessBuild);
  console.log('[postbuild-spa] Copied .htaccess for Hostinger');
}
