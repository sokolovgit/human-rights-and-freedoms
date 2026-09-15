// Screenshot each slide separately so the rendered result can be inspected.
import { execFile } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const deckDir = resolve(process.argv[2] ?? '.');
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CONCURRENCY = 3;

// Everything the page needs is local, so the renderer is cut off from the network:
// a stalled font or asset fetch used to hang the run indefinitely.
const FLAGS = [
  '--headless', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,720',
  '--no-first-run', '--disable-extensions', '--disable-background-networking',
  '--disable-sync', '--disable-default-apps', '--mute-audio',
];

const html = readFileSync(`${deckDir}/index.html`, 'utf8');
const out = `${root}/out/${basename(deckDir)}/png`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const count = (html.match(/<section class="slide/g) || []).length;

// Temp pages sit next to index.html so relative hrefs resolve; one per slide so
// the renders can run in parallel without clobbering each other.
const shoot = n => new Promise((ok, fail) => {
  const tmp = `${deckDir}/.shot-${n}.html`;
  writeFileSync(tmp, html.replace('</head>',
    `<style>
       .slide{display:none!important}
       .slide:nth-of-type(${n}){display:flex!important;box-shadow:none!important;border-radius:0!important;transform:none!important}
       body.deck{display:block!important;align-items:initial;justify-content:initial;min-height:0}
     </style></head>`));
  execFile(chrome, [
    ...FLAGS,
    `--screenshot=${out}/${String(n).padStart(2, '0')}.png`, tmp,
  ], { timeout: 45_000, killSignal: 'SIGKILL' },
     err => { rmSync(tmp, { force: true }); err ? fail(err) : ok(); });
});

// A cold Chrome occasionally stalls past the timeout; one retry clears it.
const withRetry = async n => {
  try { await shoot(n); }
  catch { await shoot(n); }
};

const queue = Array.from({ length: count }, (_, i) => i + 1);
const failed = [];
let done = 0;
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, count) }, async () => {
  while (queue.length) {
    const n = queue.shift();
    try { await withRetry(n); } catch { failed.push(n); }
    process.stdout.write(`         ${++done}/${count}\r`);
  }
}));

if (failed.length) {
  console.log(`         ${count - failed.length}/${count} slide(s); FAILED: ${failed.sort((a,b)=>a-b).join(', ')}`);
  process.exit(1);
}
console.log(`         ${count} slide(s)          `);
