// Shared download helper for the FIDE tools.
//
// FIDE's server throttles aggressively (sometimes near-zero) and the connection here
// is slow, so every download:
//   1. prefers a Wayback Machine mirror when one exists (usually faster + resumable),
//   2. resumes partial files (-C -),
//   3. caps each attempt at a few minutes so a stalled connection retries quickly,
//   4. only returns once the file passes `unzip -t`.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

// Raw (id_) snapshot URL for a target URL, or null when Wayback has no copy.
export function waybackRawUrl(target) {
  try {
    const api = `http://archive.org/wayback/available?url=${encodeURIComponent(target)}`;
    const out = execFileSync('curl', ['-sL', '--max-time', '30', api], { encoding: 'utf8' });
    const snap = JSON.parse(out)?.archived_snapshots?.closest;
    if (snap && snap.available && snap.url) {
      // insert "id_" so Wayback serves the raw file, not the banner-wrapped page.
      // HTTPS measures ~4x faster than HTTP from here — always use it.
      return snap.url.replace(/^https?:\/\/web\.archive\.org\/web\/(\d+)\//, 'https://web.archive.org/web/$1id_/');
    }
  } catch { /* no snapshot / api hiccup — caller falls back to the origin */ }
  return null;
}

// Download `url` to `file`, resuming + retrying until the file passes `unzip -t`.
// `label` is printed in log lines. Throws if it never succeeds (after `maxAttempts`).
export function downloadResumable(url, file, label, maxAttempts = 200, timeoutSeconds = 180) {
  let ok = false;
  let stalled = 0;
  let lastSize = -1;
  for (let attempt = 1; attempt <= maxAttempts && !ok; attempt++) {
    const before = fs.existsSync(file) ? fs.statSync(file).size : 0;
    if (attempt > 1) console.log(`    ${label} — retry ${attempt - 1} (size ${before})`);
    try {
      execFileSync('curl', ['-sL', '-C', '-', '--max-time', String(timeoutSeconds), '-o', file, url], { stdio: 'inherit' });
    } catch { /* curl timed out / died — loop resumes */ }
    const after = fs.existsSync(file) ? fs.statSync(file).size : 0;
    if (after === lastSize) stalled++; else stalled = 0;
    lastSize = after;
    // Only restart from scratch when the partial is SMALL (cheap to redo). A large
    // partial that's merely stalled will resume fine once the server responds —
    // deleting it would waste all progress.
    if (stalled >= 8 && after > 0 && after < 2_000_000) {
      console.log(`    ${label} — stalled with a small partial, restarting from scratch`);
      fs.rmSync(file, { force: true });
      stalled = 0;
      lastSize = -1;
      continue;
    }
    try { execFileSync('unzip', ['-t', '-q', file], { stdio: 'inherit' }); ok = true; } catch { /* partial — keep going */ }
    if (!ok && before === after) execFileSync('sleep', ['2']);
  }
  if (!ok) throw new Error(`download failed after ${maxAttempts} attempts: ${label}`);
}
