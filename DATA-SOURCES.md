# ProChess — Where the REAL Data Comes From

Every placeholder on the site replaced with a real source, how to fetch it, and how often to refresh.
Status as of **August 2026** — all commands run from this folder with Node 18+.

---

## ✅ ALREADY REAL (your own data)

| Section | Source | How it flows in |
|---|---|---|
| Tournament pairings & results | Your **DGT LiveChess** exports (`round-N/index.json`) | Drop rounds into `tournaments/<event>/`, run `node tools/generate-tournaments-data.mjs` |
| Live boards / PGN games | Your DGT PGN files (`round-N/game-*.pgn`) | Copied with the event folder; the embedded viewer reads them |
| Match history (dashboard) | The same tournament data | Computed from `tournaments-data.js` at render time |
| Tournament standings & tiebreaks | Same | Computed in the page (points + Buchholz) |

## ✅ NOW REAL — FIDE ratings, titles & IDs

The official FIDE Rating List (FRL) publishes ~the 1st of every month. No public API exists, so we
**download the official list and parse it** (what I already did for your 12 Olympiad players → `fide-ratings.json`).

```
# ~40 MB, once a month
curl -L -o ProChess/tools/players_list_foa.txt https://ratings.fide.com/download/players_list.zip
unzip -o ProChess/tools/players_list_foa.txt -d ProChess/tools/
node ProChess/tools/lookup-fide.mjs        # matches players from tournaments-data.js
```

- `fide-ratings.json` now holds **real** STD/RPD/BLZ ratings + FIDE IDs + titles for:
  Abdulraheem (FM 2316), Akinseye (FM 2154), Aikhoje (IM 2246), Ekunke (2280),
  Olisa (FM 2230), Emmanuel (2175), Eyetonghan (FM 2256), Okhipo (2246),
  Kigigha (FM 2287/2280/2248), Lapite (CM 2228), Nyuima (2174), Balogun (IM 2220).
- The dashboard's Kigigha cards now show the real values.
- Any NEW player not in the tournament data: add a `players` entry in the tool or a small CSV; the
  matcher uses exact full-name matching (surname + given names), falling back to surname+initial.

**Manual lookups / spot checks:** ratings.fide.com (search by name) or lichess.org/fide.

## ✅ NOW REAL — full Nigerian players database

`node ProChess/tools/fide-nigeria.mjs` downloads the current combined FIDE list and extracts
**every player with federation NGR** → `ProChess/fide-nigeria.json` (FIDE ID, name, title,
STD/RPD/BLZ ratings, birth year). Re-run monthly after the FRL refresh. Includes a summary
(count, top ratings, titled-player breakdown) printed to the terminal.

## ✅ NOW REAL — rating history (FIDE monthly archives)

FIDE keeps every monthly rating list since 2015 at ratings.fide.com/download_lists.phtml. There is no
API, but the archive is a simple form POST that returns direct download links — so history is fully automated:

`node ProChess/tools/fetch-rating-history.mjs [months] [--all]`

- Downloads the **STANDARD** list for the last N months (default 12), cached in `tools/history/` so re-runs only fetch what's missing.
- Records each target player's rating per month → `ProChess/fide-rating-history.json` + `ProChess/web/lib/ratingHistory.ts` (used by the Next app's dashboard chart).
- Default target set = the tournament players from `fide-ratings.json`; pass `--all` to track every Nigerian player (needs `fide-nigeria.json`).
- Each list is ~11 MB and FIDE's server is slow — the first run takes a while; partial runs still produce valid partial history.
- The static `dashboard.html` fetches `fide-rating-history.json` at load and swaps the illustrative chart for the real one automatically.

**Alternative history sources (for online play, not FIDE):**
- Chess.com: `https://api.chess.com/pub/player/{username}/ratings` (monthly history) and `https://api.chess.com/pub/country/NG/players` (all Nigerian usernames)
- Lichess: `https://lichess.org/api/user/{username}/rating-history`

## 🟡 SOURCES FOUND — plug in when you build the backend

### Chess.com online games & stats (for match history of online play)
Public API, **no key needed** (send a custom User-Agent with your email):
- Profile (includes FIDE rating + country): `https://api.chess.com/pub/player/{username}`
- Ratings per time control: `https://api.chess.com/pub/player/{username}/stats`
- Monthly games as JSON: `https://api.chess.com/pub/player/{username}/games/{YYYY}/{MM}`
- Same month as PGN file: `.../games/{YYYY}/{MM}/pgn`
- Club rosters: `https://api.chess.com/pub/club/{club-id}/members`

### Lichess online games & rating history
Public API, no token for public data:
- Profile: `https://lichess.org/api/user/{username}`
- Full rating history per category: `https://lichess.org/api/user/{username}/rating-history`
- Games (PGN or NDJSON): `https://lichess.org/api/games/user/{username}`

### Puzzles (real, 4M+ puzzles, free for commercial use — CC0)
- Bulk DB: `https://database.lichess.org/lichess_db_puzzle.csv.zst` (Zstd-compressed CSV)
- Columns: `PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags,DailyDate`
- **Note:** `Moves` are in UCI notation and the FEN is *before* the opponent's reply — solving starts on move 2.
  Use chess.js to convert UCI→SAN for the UI. Filter by `Rating` band for Beginner/Intermediate/Advanced/Master.
- Daily puzzle: the last 365 days of `DailyDate` are the real "daily puzzles".

### Opening explorer
- Crowdsourced opening names: github.com/lichess-org/chess-openings
- Win rates come from Lichess game dumps: `https://database.lichess.org/` (monthly `.pgn.zst`, CC0).

## 🔴 YOUR OWN DATA — no external API exists, you collect these

| Placeholder | Real source (in your hands) |
|---|---|
| Students count, attendance, coach feedback | Registration forms, attendance sheets, coach notes — digitize per student |
| Tournaments hosted count | Your records (SwissManager `.TURx`/`.ERG` + the event folders you already keep) |
| FIDE-rated players count | Count distinct FIDE IDs from `fide-ratings.json` ✓ |
| Countries reached | Your registration data (which countries students/streams come from) |
| **Payments** | **Paystack:** dashboard CSV export, or API `GET https://api.paystack.co/transaction` (Bearer secret key); webhook events `charge.success` confirm payments. **Flutterwave:** `GET https://api.flutterwave.com/v3/transactions` (Bearer secret key). **Bank transfers:** record manually (or statement import) — no API for personal accounts |
| Certificates (IDs & dates) | Your issuance records. QR verification = a real endpoint later: `prochess.com/verify?cert=ID` checked against your DB (Convex) — the current QR visuals are placeholders |
| Coaches, testimonials, blog, store | Your own content/records |
| Summer camp registrations | Your forms (currently the page links nowhere — wire to a Google Form / Tally / Typeform until you have a backend) |
| Prize pools, venues, time controls | Your event files — add them to `tournaments/<event>/tournament.json` (the generator picks up venue from PGN `[Site]`) |
| **Live streaming** | The **Nigerian Chess Stream** site (separate project in your other Freebuff thread). Linked from every page's nav + footer via one placeholder URL (`tools/add-stream-links.mjs` sets it; Next app: `web/lib/site.ts`) — drop in the real URL once the stream site is deployed |

## Suggested automation once you go full-stack (Next.js + Convex)

0. **Monthly cron** → `fide-nigeria.mjs` + `fetch-rating-history.mjs` → upsert `players` table + rating-history table (drift-free ratings AND charts).
1. **Monthly cron** → download FRL → `lookup-fide.mjs` → upsert `players` table (ratings drift-free).
2. **Event end** → run `generate-tournaments-data.mjs` → push rounds to Convex → standings/medals auto-update.
3. **Paystack/Flutterwave webhooks** → create/confirm `payments` records → parent dashboard payment history is real.
4. **Lichess/Chess.com import button** (student dashboard): paste username → pull games + rating history → real charts.
5. **Puzzle seed** → script filters `lichess_db_puzzle.csv` by rating band into your puzzle collection (start with ~5,000).
6. **Certificate issue** → when a student completes a course, mint `PC-CERT-YYYY-xxxx` in Convex → QR endpoint + PDF generator become real.
