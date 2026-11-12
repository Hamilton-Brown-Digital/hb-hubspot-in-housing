// Copies JS + images from assets/src → assets/dist and writes assets/dist/hubspot.html
// (single file, CSS + JS inlined, ready to paste into a HubSpot HTML template).
// SASS is compiled separately by the `sass` CLI (see package.json).
//   node scripts/build.js           one-off build
//   node scripts/build.js --watch   rebuild when assets/src/js or assets/src/images change
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'src');
const dist = path.join(root, 'assets', 'dist');

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
  copyDir(path.join(src, 'js'), path.join(dist, 'js'));
  copyDir(path.join(src, 'images'), path.join(dist, 'images'));

  const cssFile = path.join(dist, 'css', 'main.css');
  if (!fs.existsSync(cssFile)) {
    console.warn('assets/dist/css/main.css not found – run the SASS build first.');
    return;
  }
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const css = fs.readFileSync(cssFile, 'utf8').replace(/\/\*# sourceMappingURL=.*?\*\//, '');
  const js = fs.readFileSync(path.join(src, 'js', 'main.js'), 'utf8');

  const inlined = html
    .replace(/<!-- build:css -->[\s\S]*?<!-- endbuild -->/, () => `<style>\n${css}\n</style>`)
    .replace(/<!-- build:js -->[\s\S]*?<!-- endbuild -->/, () => `<script>\n${js}\n</script>`);
  fs.writeFileSync(path.join(dist, 'hubspot.html'), inlined);
  console.log(`[${new Date().toLocaleTimeString()}] Built assets/dist (js, images, hubspot.html)`);
}

build();

if (process.argv.includes('--watch')) {
  let t;
  const queue = () => { clearTimeout(t); t = setTimeout(build, 100); };
  fs.watch(path.join(src, 'js'), { recursive: true }, queue);
  fs.watch(path.join(src, 'images'), { recursive: true }, queue);
  fs.watch(path.join(root, 'index.html'), queue);
  console.log('Watching assets/src/js, assets/src/images and index.html…');
}
