// ProChess — real FIDE rating history.
// FIDE archives every monthly rating list back to 2015. This tool downloads the
// STANDARD lists for the last N months and records each target player's rating per
// month → ProChess/fide-rating-history.json (the REAL data for rating charts).
//
// Usage (from the project root):  node tools/fetch-rating-history.mjs [months] [--from YYYY-MM] [--all]
//   months          how many monthly lists to fetch (default 12; ignored with --from)
//   --from YYYY-MM  fetch every monthly list from that month to the present (e.g.
//                   --from 2016-01 goes back a decade)
//   --all           build history for EVERY Nigerian FIDE player (needs fide-nigeria.json;
//                   default is just the players in fide-ratings.json — the tournament 12)
//
// Lists are cached in tools/history/ so re-runs only download what's missing.
// Each list is ~11MB and FIDE's server is slow — the first run takes a while.
// Months with no Wayback Machine snapshot are skipped (they'd stall on FIDE's
// throttled server); run again later to pick up newly archived months.

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import readline from 'node:readline';
import { waybackRawUrl, downloadResumable } from './dl.mjs';

const DIR = 'ProChess/tools';
const CACHE = path.join(DIR, 'history');
const OUT = 'ProChess/fide-rating-history.json';
const PERIOD_API = 'https://ratings.fide.com/a_download.php?period=';
const monthsArg = parseInt(process.argv[2], 10) || 12;
const all = process.argv.includes('--all');
const fromIdx = process.argv.indexOf('--from');
const fromDate = fromIdx >= 0 ? process.argv[fromIdx + 1] : null;
if (fromDate && !/^\d{4}-\d{2}$/.test(fromDate)) {
  console.error(`--from expects YYYY-MM, got "${fromDate}"`);
  process.exit(1);
}

fs.mkdirSync(CACHE, { recursive: true });

// ---- which players to track ----
const tournamentIds = new Set();
{
  const tdb = JSON.parse(fs.readFileSync('ProChess/fide-ratings.json', 'utf8'));
  for (const [, p] of Object.entries(tdb.players)) if (p && p.fideId) tournamentIds.add(p.fideId);
}
let players = new Map();
{
  const src = all ? 'ProChess/fide-nigeria.json' : 'ProChess/fide-ratings.json';
  const raw = fs.readFileSync(src, 'utf8');
  if (all) {
    const db = JSON.parse(raw);
    // Plain-name keys (what the dashboards look up); append [id] only when a
    // name is duplicated across different FIDE IDs (e.g. two "Mba, Anselm"s).
    const counts = new Map();
    for (const p of db.players) counts.set(p.name, (counts.get(p.name) || 0) + 1);
    for (const p of db.players) {
      const key = counts.get(p.name) > 1 ? `${p.name} [${p.fideId}]` : p.name;
      players.set(p.fideId, { key, name: p.name });
    }
  } else {
    const db = JSON.parse(raw);
    for (const [lname, p] of Object.entries(db.players)) {
      if (p && p.fideId) players.set(p.fideId, { key: lname, name: p.name || lname });
    }
  }
}
console.log(`Tracking ${players.size} players${all ? ' (ALL Nigerian players)' : ''}…`);

// ---- build the list of monthly periods (oldest → newest) ----
const periods = [];
{
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(); // 0-based
  const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; // local time, not UTC
  if (fromDate) {
    const [fy, fm] = fromDate.split('-').map(Number);
    const d = new Date(fy, fm - 1, 1);
    while (d.getFullYear() < y || (d.getFullYear() === y && d.getMonth() <= m)) {
      periods.push({ iso: isoOf(d), yyyymm: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` });
      d.setMonth(d.getMonth() + 1);
    }
  } else {
    for (let i = monthsArg - 1; i >= 0; i--) {
      const d = new Date(y, m - i, 1);
      periods.push({ iso: isoOf(d), yyyymm: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` });
    }
  }
}
console.log(`Fetching ${periods.length} monthly lists (${periods[0].yyyymm} → ${periods[periods.length - 1].yyyymm})…`);

// ---- pre-scan Wayback's CDX index for every archived standard_*frl.zip ----
// Gives us the exact snapshot timestamps, so we build the raw mirror URL directly
// (the /wayback/available API misses many old snapshots that CDX knows about).
// Falls back to per-month lookups if the scan fails.
const cdxSnapshots = new Map(); // periodCode → { timestamp, original }
{
  try {
    const cdx = execFileSync('curl', ['-sL', '--max-time', '60', 'http://web.archive.org/cdx/search/cdx?url=ratings.fide.com/download/standard_&matchType=prefix&output=json&fl=original,timestamp&collapse=urlkey&limit=5000'], { encoding: 'utf8' });
    for (const row of JSON.parse(cdx)) {
      const mm = String(row[0]).match(/standard_([a-z]{3}\d{2})frl\.zip/);
      if (mm) {
        const key = mm[1].toUpperCase();
        const prev = cdxSnapshots.get(key);
        if (!prev || row[1] > prev.timestamp) cdxSnapshots.set(key, { timestamp: row[1], original: row[0] });
      }
    }
    console.log(`Wayback archive coverage: ${cdxSnapshots.size} monthly lists found`);
  } catch {
    console.log('CDX scan failed — will do per-month Wayback lookups instead');
  }
}

// ---- column parsing (same approach as lookup-fide.mjs, but rating column = period code) ----
function parseList(file, periodCode) {
  const cols = {};
  const header = fs.readFileSync(file, 'utf8').split('\n')[0];
  const tokens = [];
  const re = /[A-Za-z0-9-]+/g;
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
  const col = (line, key) => { const [a, b] = cols[key] || [0, 0]; return line.slice(a, b).trim(); };
  const ratingCol = Object.keys(cols).find((k) => /^[A-Z]{3}\d{2}$/.test(k));
  if (!ratingCol) throw new Error(`No period-code rating column found in ${file} (header: ${header.slice(0, 120)})`);

  const byId = new Map();
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  let first = true;
  return new Promise((resolve) => {
    rl.on('line', (line) => {
      if (first) { first = false; return; }
      const id = col(line, 'ID');
      if (!id) return;
      const r = +col(line, ratingCol) || 0;
      if (r > 0) byId.set(id, { rating: r, name: col(line, 'Name'), title: col(line, 'Tit'), born: +col(line, 'B-day') || null });
    });
    rl.on('close', () => resolve({ byId, ratingCol, label: periodCode, cols }));
  });
}

// ---- fetch + parse each period ----
const history = {};
for (const p of periods) {
  const periodCode = `${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][+p.yyyymm.slice(5, 7) - 1]}${p.yyyymm.slice(2, 4)}`;
  const cached = path.join(CACHE, `${p.yyyymm}.txt`);
  if (!fs.existsSync(cached)) {
    console.log(`  ${p.iso} — fetching ${periodCode} list…`);
    const zip = path.join(CACHE, `${p.yyyymm}.zip`);
    const url = `https://ratings.fide.com/download/standard_${periodCode.toLowerCase()}frl.zip`;
    // Prefer the CDX-known snapshot (exact timestamp → raw mirror URL).
    let mirror = null;
    if (cdxSnapshots.size) {
      const snap = cdxSnapshots.get(periodCode);
      if (snap) mirror = `https://web.archive.org/web/${snap.timestamp}id_/${snap.original}`;
      else console.log(`    (no wayback archive for ${periodCode}, skipping — run again later)`);
    } else {
      mirror = waybackRawUrl(url);
    }
    if (!mirror) continue;
    const page = execFileSync('curl', ['-sL', '--max-time', '120', '--retry', '5', '--retry-delay', '3', '--retry-all-errors', PERIOD_API + p.iso], { encoding: 'utf8' });
    const m = page.match(new RegExp(`https:\\/\\/ratings\\.fide\\.com\\/download\\/standard_${periodCode.toLowerCase()}frl\\.zip`));
    if (!m) {
      // Origin page unreachable but the archive has the file — try the mirror anyway.
      console.log(`    (origin page not reachable, using archive URL directly)`);
    }
    try {
      // Archived months come from the Wayback mirror; the origin is only ever a
      // brief fallback so a dead connection doesn't stall the whole run.
      downloadResumable(mirror, zip, `${p.yyyymm} (wayback)`);
    } catch (e) {
      console.log(`    giving up on ${p.yyyymm} (${e.message}) — run again later to resume`);
      continue;
    }
    execFileSync('unzip', ['-o', '-q', zip, '-d', CACHE], { stdio: 'inherit' });
    const extracted = fs.readdirSync(CACHE).find((f) => f.endsWith('.txt') && !f.startsWith(p.yyyymm));
    if (extracted) fs.renameSync(path.join(CACHE, extracted), cached);
    if (fs.existsSync(zip)) fs.rmSync(zip);
  } else {
    console.log(`  ${p.yyyymm} — cached`);
  }

  const { byId, cols } = await parseList(cached, periodCode);

  // Keep the cache lean for deep runs: prune the full list down to header + NGR
  // lines (~35MB full → a few KB), so 120 months of history stay on disk cheaply.
  {
    const fedCol = cols['Fed'];
    if (fedCol) {
      const lines = fs.readFileSync(cached, 'utf8').split('\n');
      if (lines.length > 5000) {
        const kept = [lines[0], ...lines.slice(1).filter((l) => l.slice(fedCol[0], fedCol[1]).trim() === 'NGR')];
        fs.writeFileSync(cached, kept.join('\n'));
      }
    }
  }
  let found = 0;
  for (const [fideId, pl] of players) {
    const row = byId.get(fideId);
    if (!row) continue;
    found++;
    if (!history[pl.key]) history[pl.key] = { name: pl.name, fideId, months: [] };
    history[pl.key].months.push({ month: p.yyyymm, rating: row.rating });
  }
  console.log(`    ${found}/${players.size} players rated that month`);
  emit(); // incremental — a partial run still leaves usable data
}

// ---- emit JSON + a TS module for the Next.js app (incremental — called after each month) ----
function emit() {
  const out = {
    source: 'FIDE archived monthly standard rating lists (ratings.fide.com)',
    generated: new Date().toISOString().slice(0, 10),
    periods: periods.map((p) => p.yyyymm),
    players: history,
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');

  const tsOut = 'ProChess/web/lib/ratingHistory.ts';
  // Keep the TS module lean: only the tournament players the app actually charts
  // (the JSON keeps everyone — including the full 1693-player --all build).
  const tsPlayers = {};
  for (const [key, h] of Object.entries(history)) {
    if (tournamentIds.has(h.fideId)) tsPlayers[key] = h;
  }
  const ts = `// GENERATED by tools/fetch-rating-history.mjs — real FIDE monthly ratings. Do not edit by hand.
export type RatingPoint = { month: string; rating: number };
export type RatingHistory = { [key: string]: { name: string; fideId: string; months: RatingPoint[] } };

export const ratingHistory: RatingHistory = ${JSON.stringify(tsPlayers, null, 1)};
`;
  fs.writeFileSync(tsOut, ts);
  return out;
}

for (const [key, h] of Object.entries(history)) {
  const pts = h.months.map((x) => `${x.month}:${x.rating}`).join(' ');
  console.log(`  ${key.padEnd(40)} ${pts}`);
}
const withData = Object.keys(history).length;
console.log(`\n${withData}/${players.size} players have history. Missing: ${[...players.values()].filter((pl) => !history[pl.key]).map((pl) => pl.key).join(', ') || 'none'}`);
