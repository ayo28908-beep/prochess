// ProChess — manage the "Live Stream" link (to the separate Nigerian Chess Stream
// site) in the nav (desktop + mobile) and footer of every static page.
// Idempotent: removes any existing stream links first, then inserts exactly one per
// location, so re-running always converges to the same result.
//
// The stream URL is a placeholder — edit STREAM_URL below (it appears once per page).
// Usage (from the project root):  node tools/add-stream-links.mjs

import fs from 'node:fs';

const STREAM_URL = 'https://nigerian-chess-stream.example.com';
const NAV = `        <a href="${STREAM_URL}" target="_blank" rel="noopener">▶ Live Stream</a>`;
const MOB = `      <a href="${STREAM_URL}" target="_blank" rel="noopener">▶ Live Stream</a>`;
const FOOT = `        <a href="${STREAM_URL}" target="_blank" rel="noopener">▶ Nigerian Chess Stream</a>`;

const PAGES = [
  'ProChess/index.html',
  'ProChess/tournament.html',
  'ProChess/player.html',
  'ProChess/dashboard.html',
];

for (const file of PAGES) {
  let html = fs.readFileSync(file, 'utf8');

  // 1) strip every existing stream link (nav, mobile, footer — any indentation)
  html = html
    .split('\n')
    .filter((line) => !line.includes('nigerian-chess-stream.example.com'))
    .join('\n');

  // 2) desktop nav — after the FIRST 8-space Blog link (desktop navlinks; the footer
  //    Blog, if any, comes later in the file)
  const deskBlog = /^( {8}<a href="(?:#blog|index\.html#blog)">Blog<\/a>\n)/m;
  html = html.replace(deskBlog, '$1' + NAV + '\n');

  // 3) mobile menu — after the 6-space Blog link
  const mobBlog = /^( {6}<a href="(?:#blog|index\.html#blog)">Blog<\/a>\n)/m;
  html = html.replace(mobBlog, '$1' + MOB + '\n');

  // 4) footer Compete column — after "Live tournament" / "Upcoming tournaments"
  const footLink = /^( {8}<a href="tournament\.html">(?:Live tournament|Upcoming tournaments)<\/a>\n)/m;
  html = html.replace(footLink, '$1' + FOOT + '\n');

  fs.writeFileSync(file, html);
  const count = (html.match(/nigerian-chess-stream\.example\.com/g) || []).length;
  console.log(`${file} — ${count} stream links (expect 3: desktop nav + mobile nav + footer)`);
}
console.log(`\nStream URL placeholder: ${STREAM_URL} — replace it in one place per page.`);
