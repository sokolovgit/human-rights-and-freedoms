// Report slides whose content overflows the fixed 1280x720 frame.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const deckDir = resolve(process.argv[2] ?? '.');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const html = readFileSync(`${deckDir}/index.html`, 'utf8');
const tmp = `${deckDir}/.check.html`;

const probe = `
<style>
  body.deck{display:block!important;min-height:0}
  .slide{display:flex!important;transform:none!important;box-shadow:none!important;border-radius:0!important;margin:0}
</style>
<script>
  addEventListener('load', () => {
    const bad = [];
    document.querySelectorAll('.slide').forEach((s, i) => {
      const box = s.getBoundingClientRect();
      const padB = parseFloat(getComputedStyle(s).paddingBottom);
      const limit = box.bottom - padB;
      let deepest = 0;
      s.querySelectorAll('*').forEach(el => {
        if (el.closest('.slide__num, .slide__kicker')) return;
        const r = el.getBoundingClientRect();
        if (r.height && r.bottom > deepest) deepest = r.bottom;
      });
      const over = Math.round(deepest - limit);
      if (over > 1) bad.push(String(i + 1).padStart(2, '0') + ':+' + over);
    });
    document.title = 'OVF[' + bad.join(' ') + ']';
  });
<\/script></head>`;

writeFileSync(tmp, html.replace('</head>', probe));
const dom = execFileSync(chrome, [
  '--headless', '--disable-gpu', '--window-size=1280,720',
  '--no-first-run', '--disable-extensions', '--disable-background-networking',
  '--disable-sync', '--disable-default-apps',
  '--virtual-time-budget=5000', '--dump-dom', tmp,
], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60_000,
     killSignal: 'SIGKILL', stdio: ['ignore', 'pipe', 'ignore'] });
rmSync(tmp, { force: true });

const m = dom.match(/OVF\[([^\]]*)\]/);
if (!m) { console.error('probe did not run'); process.exit(2); }
if (!m[1]) { console.log('  no overflow'); process.exit(0); }
console.log('  OVERFLOW (slide:extra px): ' + m[1]);
process.exit(1);
