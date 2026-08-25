// ProChess tournament data generator.
// Reads every ProChess/tournaments/<folder>/round-*/index.json + tournament.json
// and emits ProChess/tournaments-data.js (works when opened from disk via <script>).
// Re-run after each tournament:  node tools/generate-tournaments-data.mjs
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'ProChess/tournaments';
const OUT = 'ProChess/tournaments-data.js';

const tournaments = {};

for (const dir of fs.readdirSync(SRC)) {
  const tpath = path.join(SRC, dir);
  if (!fs.statSync(tpath).isDirectory()) continue;
  const tjPath = path.join(tpath, 'tournament.json');
  if (!fs.existsSync(tjPath)) continue;

  const meta = JSON.parse(fs.readFileSync(tjPath, 'utf8'));
  const rounds = [];

  const roundDirs = fs.readdirSync(tpath)
    .filter(d => /^round-\d+$/.test(d))
    .sort((a, b) => +a.split('-')[1] - +b.split('-')[1]);

  for (const rd of roundDirs) {
    const rp = path.join(tpath, rd);
    if (!fs.statSync(rp).isDirectory()) continue;
    const ij = path.join(rp, 'index.json');
    if (!fs.existsSync(ij)) continue;
    const data = JSON.parse(fs.readFileSync(ij, 'utf8'));
    rounds.push({ round: +rd.split('-')[1], pairings: data.pairings || [] });
  }

  // Pull the venue from the first PGN's [Site] header when available.
  let venue = '';
  const g1 = path.join(tpath, 'round-1', 'game-1.pgn');
  if (fs.existsSync(g1)) {
    const m = fs.readFileSync(g1, 'utf8').match(/\[Site "([^"]+)"\]/);
    if (m) venue = m[1];
  }

  tournaments[dir] = {
    id: meta.id,
    name: meta.name,
    venue,
    timeControl: '90+30 · Classical',
    prizePool: '₦500,000',
    rounds,
  };
  console.log('•', dir, '—', rounds.length, 'rounds,',
    rounds.reduce((n, r) => n + r.pairings.length, 0), 'pairings');
}

fs.writeFileSync(OUT, 'window.PROCHESS_TOURNAMENTS = ' + JSON.stringify(tournaments, null, 1) + ';\n');
console.log('\nGenerated', OUT);
