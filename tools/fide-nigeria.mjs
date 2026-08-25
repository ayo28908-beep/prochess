// ProChess — Nigerian players database extractor.
// Downloads the official FIDE combined rating list (STD + RPD + BLZ), keeps every
// player with federation NGR, and writes ProChess/fide-nigeria.json — the full
// database of Nigerian FIDE-rated players (ratings + profiles).
//
// Usage (from the project root):  node tools/fide-nigeria.mjs
//   Downloads the current list (~42MB) on first run; caches it in tools/.
//   Re-run monthly after FIDE publishes the new list to refresh.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import readline from 'node:readline';
import { waybackRawUrl, downloadResumable } from './dl.mjs';

const DIR = 'ProChess/tools';
const ZIP = path.join(DIR, 'players_list.zip');
const TXT = path.join(DIR, 'players_list_foa.txt');
const OUT = 'ProChess/fide-nigeria.json';
const URL = 'https://ratings.fide.com/download/players_list.zip';

if (!fs.existsSync(TXT)) {
  console.log(`Downloading current FIDE combined list → ${ZIP} (${fs.existsSync(ZIP) ? 'resuming ' + fs.statSync(ZIP).size + ' bytes' : 'fresh'})…`);
  // Prefer a Wayback mirror (FIDE's own server throttles to near-zero sometimes).
  const mirror = waybackRawUrl(URL);
  if (mirror) {
    console.log('  using Wayback mirror: ' + mirror.replace('id_/', 'id_/'));
    downloadResumable(mirror, ZIP, 'combined list (wayback)');
  } else {
    downloadResumable(URL, ZIP, 'combined list (fide)');
  }
  execFileSync('unzip', ['-o', '-q', ZIP, '-d', DIR], { stdio: 'inherit' });
  const found = fs.readdirSync(DIR).find((f) => f.endsWith('.txt'));
  if (found !== 'players_list_foa.txt' && fs.existsSync(path.join(DIR, found))) {
    fs.renameSync(path.join(DIR, found), TXT);
  }
}

// ---- column layout: each column spans from where its header token STARTS to the next ----
const cols = {};
{
  const header = fs.readFileSync(TXT, 'utf8').split('\n')[0];
  const tokens = [];
  const re = /[A-Za-z-]+/g;
  let m;
  while ((m = re.exec(header)) !== null) tokens.push({ key: m[0], idx: m.index });
  const merged = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].key === 'ID' && tokens[i + 1] && tokens[i + 1].key === 'Number') {
      merged.push({ key: 'ID', idx: tokens[i].idx });
      i++;
      continue;
    }
    merged.push(tokens[i]);
  }
  for (let i = 0; i < merged.length; i++) {
    const end = i + 1 < merged.length ? merged[i + 1].idx : header.length;
    cols[merged[i].key] = [merged[i].idx, end];
  }
}
const col = (line, key) => { const [a, b] = cols[key] || [0, 0]; return line.slice(a, b).trim(); };
const TITLES = new Set(['GM', 'WGM', 'IM', 'WIM', 'FM', 'WFM', 'CM', 'WCM']);
// The combined list spells titles out (FM, IM, …); some per-federation lists use short codes (f, m, …).
const titleMap = { g: 'GM', wg: 'WGM', m: 'IM', wm: 'WIM', f: 'FM', wf: 'WFM', c: 'CM', wc: 'WCM' };
const normTitle = (raw) => {
  const t = (raw || '').trim();
  if (!t) return '';
  const upper = t.toUpperCase();
  return TITLES.has(upper) ? upper : (titleMap[t.toLowerCase()] || '');
};

// ---- single streaming pass, keep every NGR row ----
const rl = readline.createInterface({ input: fs.createReadStream(TXT), crlfDelay: Infinity });
let isFirst = true;
const players = new Map();
rl.on('line', (line) => {
  if (isFirst) { isFirst = false; return; }
  if (col(line, 'Fed') !== 'NGR') return;
  const fideId = col(line, 'ID');
  if (!fideId) return;
  const std = +col(line, 'SRtng') || 0;
  const rpd = +col(line, 'RRtng') || 0;
  const blz = +col(line, 'BRtng') || 0;
  if (!std && !rpd && !blz) return; // rated in nothing → skip
  players.set(fideId, {
    fideId,
    name: col(line, 'Name'),
    fed: 'NGR',
    title: normTitle(col(line, 'Tit')),
    standard: std,
    rapid: rpd,
    blitz: blz,
    born: +col(line, 'B-day') || null,
  });
});
rl.on('close', () => {
  const list = [...players.values()].sort((a, b) => b.standard - a.standard);
  const out = {
    source: 'FIDE combined rating list (players_list_foa.txt)',
    generated: new Date().toISOString().slice(0, 10),
    count: list.length,
    players: list,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`\nNigerian FIDE-rated players: ${list.length} → ${OUT}`);
  console.log('\nTop 15 by standard rating:');
  for (const p of list.slice(0, 15)) {
    console.log(`  ${(p.title || '  ').padEnd(3)} ${p.name.padEnd(40)} STD ${String(p.standard).padStart(4)}  RPD ${String(p.rapid).padStart(4)}  BLZ ${String(p.blitz).padStart(4)}  ${p.fideId}`);
  }
  const rated = (k) => list.filter((p) => p[k] > 0).length;
  console.log(`\nWith standard rating: ${rated('standard')} · rapid: ${rated('rapid')} · blitz: ${rated('blitz')}`);
  const titled = list.filter((p) => p.title).length;
  console.log(`Titled players: ${titled} (GM ${list.filter((p) => p.title === 'GM').length}, IM ${list.filter((p) => p.title === 'IM').length}, FM ${list.filter((p) => p.title === 'FM').length}, CM ${list.filter((p) => p.title === 'CM').length} + women's titles)`);
});
