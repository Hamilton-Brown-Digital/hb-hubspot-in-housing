// Copies JS, images, fonts and media from assets/src → assets/dist, then writes
// assets/dist/hubspot.html: the page with CSS + page JS inlined, ready to paste into a HubSpot template.
// SASS is compiled separately by the `sass` CLI (see package.json).
//
//   node scripts/build.js           one-off build
//   node scripts/build.js --watch   rebuild when assets/src (non-SCSS) or index.html change
//
// Asset URLs in hubspot.html: upload assets/dist (img, fonts, media, js/vendor) to HubSpot File Manager,
// then build with the folder's URL so every path points there:
//   HUBSPOT_ASSET_BASE="https://xxxx.fs1.hubspotusercontent-eu1.net/hubfs/xxxx/hb-inhousing/" npm run build
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'src');
const dist = path.join(root, 'assets', 'dist');
const assetBase = process.env.HUBSPOT_ASSET_BASE || '';
const folders = ['js', 'img', 'fonts', 'media'];

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const a = path.join(from, entry.name);
    const b = path.join(to, entry.name);
    entry.isDirectory() ? copyDir(a, b) : fs.copyFileSync(a, b);
  }
}

function build() {
  folders.forEach((f) => copyDir(path.join(src, f), path.join(dist, f)));

  const cssFile = path.join(dist, 'css', 'main.css');
  if (!fs.existsSync(cssFile)) {
    console.warn('assets/dist/css/main.css not found – run the SASS build first.');
    return;
  }

  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  let css = fs.readFileSync(cssFile, 'utf8').replace(/\/\*# sourceMappingURL=.*?\*\//, '');
  const js = fs.readFileSync(path.join(src, 'js', 'main.js'), 'utf8');

  // CSS urls are relative to assets/dist/css/ – once inlined they need to point at the asset folder
  const base = assetBase || 'assets/dist/';
  css = css.replace(/url\((['"]?)\.\.\//g, `url($1${base}`);

  html = html
    .replace(/<!-- build:css -->[\s\S]*?<!-- endbuild -->/, () => `<style>\n${css}\n</style>`)
    .replace(/<!-- build:js -->[\s\S]*?<!-- endbuild -->/, () => `<script>\n${js}\n</script>`);

  if (assetBase) {
    html = html.replace(/(["'(])assets\/dist\//g, `$1${assetBase}`);
  }

  fs.writeFileSync(path.join(dist, 'hubspot.html'), html);
  console.log(`[${new Date().toLocaleTimeString()}] Built assets/dist (${folders.join(', ')}, hubspot.html)${assetBase ? ' → ' + assetBase : ''}`);
}

build();

if (process.argv.includes('--watch')) {
  let t;
  const queue = () => { clearTimeout(t); t = setTimeout(build, 150); };
  folders.forEach((f) => {
    const dir = path.join(src, f);
    if (fs.existsSync(dir)) fs.watch(dir, { recursive: true }, queue);
  });
  fs.watch(path.join(root, 'index.html'), queue);
  fs.watch(path.join(dist, 'css'), queue);
  console.log('Watching assets/src and index.html…');
}
