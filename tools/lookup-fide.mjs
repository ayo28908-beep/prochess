// ProChess FIDE lookup tool (streaming).
// Reads the official FIDE combined rating list (players_list_foa.txt, downloaded from
// https://ratings.fide.com/download_lists.phtml -> "Combined list ... TXT format")
// and matches every player found in ProChess/tournaments-data.js.
// Emits ProChess/fide-ratings.json — the REAL ratings for the tournament page.
//
// Usage (from the project root):  node tools/lookup-fide.mjs
//   After refreshing the FIDE list each month:
//   curl -L -o ProChess/tools/players_list_foa.txt https://ratings.fide.com/download/players_list.zip
//   unzip -o ProChess/tools/players_list_foa.txt -d ProChess/tools/
import fs from 'node:fs';
import readline from 'node:readline';

const FRL = 'ProChess/tools/players_list_foa.txt';
const OUT = 'ProChess/fide-ratings.json';
const DATA = 'ProChess/tournaments-data.js';

if (!fs.existsSync(FRL)) {
  console.error('FIDE list not found at', FRL);
  process.exit(1);
}

// ---- column layout: each column spans from where its header token STARTS to the next one ----
const cols = {};
{
  const header = fs.readFileSync(FRL, 'utf8').split('\n')[0];
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
const norm = s => s.toUpperCase().replace(/\s+/g, ' ').trim();

const buildPlayer = (line, exact) => ({
  fideId: col(line, 'ID'),
  name: col(line, 'Name'),
  fed: col(line, 'Fed'),
  title: col(line, 'Tit'),
  standard: +col(line, 'SRtng') || 0,
  rapid: +col(line, 'RRtng') || 0,
  blitz: +col(line, 'BRtng') || 0,
  born: +col(line, 'B-day') || null,
  exact
});

// ---- players to look up, straight from the tournament data ----
const raw = fs.readFileSync(DATA, 'utf8');
const T = JSON.parse(raw.slice(raw.indexOf('=') + 1, raw.lastIndexOf(';')));
const players = new Map();
for (const t of Object.values(T)) {
  for (const r of t.rounds || []) {
    for (const pg of r.pairings || []) {
      for (const side of ['white', 'black']) {
        const lname = pg[side]?.lname;
        if (lname && !players.has(lname)) players.set(lname, { lname, want: norm(lname), found: null });
      }
    }
  }
}
const surnames = new Set([...players.values()].map(p => p.want.split(',')[0]));

// ---- single streaming pass over the 311MB list ----
const rl = readline.createInterface({ input: fs.createReadStream(FRL), crlfDelay: Infinity });
let isFirst = true;
rl.on('line', line => {
  if (isFirst) { isFirst = false; return; } // header
  const nameCol = col(line, 'Name');
  if (!nameCol) return;
  const lineName = norm(nameCol);
  const surnameTok = lineName.split(',')[0];
  if (!surnames.has(surnameTok)) return;

  for (const p of players.values()) {
    if (p.found && p.found.exact) continue; // exact already found — nothing better can come
    if (surnameTok !== p.want.split(',')[0]) continue;
    if (lineName === p.want) {
      p.found = buildPlayer(line, true);
    } else if (!p.found) {
      // fallback: same surname + same first given-name initial + a shared given name
      const gWant = (p.want.split(',')[1] || '').trim();
      const gLine = (lineName.split(',')[1] || '').trim();
      if (gWant && gLine && gLine[0] === gWant[0] &&
          (gLine.includes(gWant.split(' ')[0]) || gWant.includes(gLine.split(' ')[0]))) {
        p.found = buildPlayer(line, false);
      }
    }
  }
});
rl.on('close', () => {
  const out = { source: 'FIDE combined rating list (players_list_foa.txt)', generated: new Date().toISOString().slice(0, 10), players: {} };
  let matched = 0, fuzzy = 0;
  for (const p of players.values()) {
    out.players[p.lname] = p.found || { found: false };
    if (p.found) {
      matched++;
      if (!p.found.exact) fuzzy++;
      const f = p.found;
      console.log(`  ${(f.exact ? '✓' : '~')} ${(f.title || '—').padEnd(2)} ${p.lname.padEnd(38)} STD ${String(f.standard).padStart(4)}  RPD ${String(f.rapid).padStart(4)}  BLZ ${String(f.blitz).padStart(4)}  ${f.fideId}`);
    } else {
      console.log(`  ?  ${p.lname}  — NOT FOUND in FIDE list`);
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`\nMatched ${matched}/${players.size} (${fuzzy} fuzzy ~) → ${OUT}`);
  if (fuzzy) console.log('NOTE: ~ matches should be double-checked against ratings.fide.com manually.');
});
