// ProChess data injector.
// Keeps the inline data blocks (tournament rounds + FIDE ratings) in sync across pages.
// Extracts them from tournament.html and injects them into player.html.
//
// Usage (project root):  node tools/inject-data.mjs
import fs from 'node:fs';

const SRC = 'ProChess/tournament.html';
const DST = 'ProChess/player.html';

const src = fs.readFileSync(SRC, 'utf8');
const grab = (re) => {
  const m = src.match(re);
  if (!m) throw new Error('Block not found in ' + SRC + ': ' + re);
  return m[0];
};
const tourn = grab(/<script>window\.PROCHESS_TOURNAMENTS[\s\S]*?<\/script>/);
const fide = grab(/<script>window\.PROCHESS_FIDE[\s\S]*?<\/script>/);

let dst = fs.readFileSync(DST, 'utf8');
// Replace either leftover markers or previously-injected blocks
dst = dst.replace(/<script>window\.PROCHESS_TOURNAMENTS[\s\S]*?<\/script>[\s\S]*?<script>window\.PROCHESS_FIDE[\s\S]*?<\/script>/, tourn + '\n' + fide);
dst = dst.replace(/<!--INJECT_TOURNAMENTS-->[\s\S]*?<!--INJECT_FIDE-->/, tourn + '\n' + fide);
dst = dst.replace(/undefined\nundefined/, tourn + '\n' + fide);
if (!dst.includes('window.PROCHESS_TOURNAMENTS=window.PROCHESS_TOURNAMENTS||')) throw new Error('Injection failed — check markers in ' + DST);
fs.writeFileSync(DST, dst);
console.log('✓ injected tournaments (' + tourn.length + 'B) + fide (' + fide.length + 'B) into ' + DST);
