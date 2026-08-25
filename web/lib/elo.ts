// Elo math ported 1:1 from ProChess/tournament.html — FIDE Rating Regulations 8.1/8.3.

export type Player = {
  lname: string;
  name: string;
  fideId: string;
  fed: string;
  title: string;
  standard: number;
  rapid: number;
  blitz: number;
  born?: number | null;
};

export type Game = {
  round: number;
  white: string;
  black: string;
  result: string; // "1-0" | "0-1" | "1/2-1/2" | "*"
  live: boolean;
};

export type StandingRow = {
  name: string;
  title: string;
  born: number | null;
  rating: number;
  pts: number;
  w: number;
  d: number;
  l: number;
  buch: number;
  perf: number | null;
  k: number;
  delta: number | null;
  games: { oppR: number; score: number }[];
};

const roundHalfAway = (x: number) => Math.sign(x) * Math.round(Math.abs(x));

// FIDE 8.3.3 — K = 40 (under 18 & rated <2300), K = 10 (ever ≥2400), else 20.
export const kOf = (rating: number, born?: number | null) => {
  if (born && new Date().getFullYear() - born < 18 && rating < 2300) return 40;
  return rating >= 2400 ? 10 : 20;
};

const ratingOf = (p?: Player | null) => p?.standard || p?.rapid || p?.blitz || 0;

export function computeStandings(games: Game[], players: Player[]): StandingRow[] {
  const byName = new Map(players.map((p) => [p.lname, p]));
  const map = new Map<string, StandingRow>();
  const get = (lname: string): StandingRow => {
    let r = map.get(lname);
    if (!r) {
      const f = byName.get(lname);
      r = {
        name: lname,
        title: f?.title || "",
        born: f?.born ?? null,
        rating: ratingOf(f),
        pts: 0, w: 0, d: 0, l: 0, buch: 0, perf: null, k: 20, delta: null,
        games: [],
      };
      map.set(lname, r);
    }
    return r;
  };

  for (const g of games) {
    if (!g.white || !g.black) continue;
    const w = get(g.white), b = get(g.black);
    const wr = ratingOf(byName.get(g.white)), br = ratingOf(byName.get(g.black));
    switch (g.result) {
      case "1-0":
        w.pts += 1; w.w++; b.l++;
        if (wr) w.games.push({ oppR: br, score: 1 });
        if (br) b.games.push({ oppR: wr, score: 0 });
        break;
      case "0-1":
        b.pts += 1; b.w++; w.l++;
        if (wr) w.games.push({ oppR: br, score: 0 });
        if (br) b.games.push({ oppR: wr, score: 1 });
        break;
      case "1/2-1/2":
        w.pts += 0.5; b.pts += 0.5; w.d++; b.d++;
        if (wr) w.games.push({ oppR: br, score: 0.5 });
        if (br) b.games.push({ oppR: wr, score: 0.5 });
        break;
      default:
        break; // pending — not counted
    }
  }

  const list = [...map.values()].map((p) => perfDelta(p));
  list.sort((a, b) => b.pts - a.pts || b.buch - a.buch || a.name.localeCompare(b.name));
  return list;
}

// FIDE 8.1.1: perf = avg opponent rating + dp(score%); FIDE 8.3: Δ = K × (score − expected), D capped at 400.
function perfDelta(p: StandingRow): StandingRow {
  const myR = p.rating;
  const games = p.games.filter((g) => g.oppR > 0);
  if (!myR || !games.length) {
    p.perf = null;
    p.delta = null;
    return p;
  }
  const score = games.reduce((s, g) => s + g.score, 0);
  const n = games.length;
  const avgOpp = games.reduce((s, g) => s + g.oppR, 0) / n;
  let exp = 0;
  for (const g of games) {
    const D = Math.max(-400, Math.min(400, g.oppR - myR));
    exp += 1 / (1 + Math.pow(10, D / 400));
  }
  const pct = score / n;
  const dp = pct <= 0 ? -800 : pct >= 1 ? 800 : -400 * Math.log10(1 / pct - 1);
  p.perf = Math.round(avgOpp + dp);
  p.k = kOf(myR, p.born);
  p.delta = roundHalfAway(p.k * (score - exp));
  return p;
}

export const fmtDelta = (d: number | null) => (d == null ? "—" : (d > 0 ? "+" : "") + d);
export const fmtPts = (pts: number) => (Number.isInteger(pts) ? String(pts) : pts.toFixed(1).replace(/\.0$/, ""));

// ---------- player profile (ported 1:1 from player.html) ----------

export type PerGame = {
  r: number;
  opp: string;
  oppR: number;
  score: number;
  color: "w" | "b";
  result: string;
  live: boolean;
  e: number;
  dr: number;
};

export type H2H = { opp: string; oppR: number; n: number; w: number; d: number; l: number; score: number };

export type PlayerProfileData = {
  player: Player | undefined;
  rating: number;
  pts: number;
  w: number;
  d: number;
  l: number;
  buch: number;
  rank: number;
  total: number;
  k: number;
  exp: number;
  delta: number | null;
  perf: number | null;
  perGame: PerGame[];
  pending: { r: number; opp: string; oppR: number; color: "w" | "b"; result: string; live: boolean }[];
  h2h: H2H[];
};

export function playerProfile(games: Game[], players: Player[], lname: string): PlayerProfileData {
  const byName = new Map(players.map((p) => [p.lname, p]));
  const f = byName.get(lname);
  const rating = ratingOf(f);

  let pts = 0, w = 0, d = 0, l = 0;
  const opps: string[] = [];
  const perGame: PerGame[] = [];
  const pending: PlayerProfileData["pending"] = [];

  for (const g of games) {
    if (g.result === "*") {
      if (g.white === lname) pending.push({ r: g.round, opp: g.black, oppR: ratingOf(byName.get(g.black)), color: "w", result: "*", live: g.live });
      if (g.black === lname) pending.push({ r: g.round, opp: g.white, oppR: ratingOf(byName.get(g.white)), color: "b", result: "*", live: g.live });
      continue;
    }
    const isW = g.white === lname, isB = g.black === lname;
    if (!isW && !isB) continue;
    const opp = isW ? g.black : g.white;
    const oppR = ratingOf(byName.get(opp));
    opps.push(opp);
    const score =
      g.result === "1-0" ? (isW ? 1 : 0) : g.result === "0-1" ? (isW ? 0 : 1) : g.result === "1/2-1/2" ? 0.5 : 0;
    if (score === 1) w++; else if (score === 0.5) d++; else l++;
    pts += score;
    if (rating && oppR > 0) perGame.push({ r: g.round, opp, oppR, score, color: isW ? "w" : "b", result: g.result, live: g.live, e: 0, dr: 0 });
  }

  const buch = opps.length
    ? computeStandings(games, players)
        .filter((s) => opps.includes(s.name))
        .reduce((s, o) => s + o.pts, 0)
    : 0;
  const standings = computeStandings(games, players);
  const rank = standings.findIndex((s) => s.name === lname) + 1 || 0;
  const total = standings.length;

  let exp = 0;
  for (const g of perGame) {
    const D = Math.max(-400, Math.min(400, g.oppR - rating));
    g.e = 1 / (1 + Math.pow(10, D / 400));
    exp += g.e;
    g.dr = g.score - g.e;
  }

  const k = rating ? kOf(rating, f?.born ?? null) : 20;
  let perf: number | null = null;
  let delta: number | null = null;
  if (rating && perGame.length) {
    const score = perGame.reduce((s, g) => s + g.score, 0);
    const n = perGame.length;
    const avgOpp = perGame.reduce((s, g) => s + g.oppR, 0) / n;
    const pct = score / n;
    const dp = pct <= 0 ? -800 : pct >= 1 ? 800 : -400 * Math.log10(1 / pct - 1);
    perf = Math.round(avgOpp + dp);
    delta = roundHalfAway(k * (score - exp));
  }

  const h2hMap = new Map<string, H2H>();
  for (const g of perGame) {
    let h = h2hMap.get(g.opp);
    if (!h) h2hMap.set(g.opp, (h = { opp: g.opp, oppR: g.oppR, n: 0, w: 0, d: 0, l: 0, score: 0 }));
    h.n++;
    h.oppR = g.oppR;
    if (g.score === 1) h.w++; else if (g.score === 0.5) h.d++; else h.l++;
    h.score += g.score;
  }
  const h2h = [...h2hMap.values()];

  return { player: f, rating, pts, w, d, l, buch, rank, total, k, exp, delta, perf, perGame, pending, h2h };
}

export const fmtName = (n: string) => {
  const i = n.indexOf(",");
  return i >= 0 ? n.slice(i + 1).trim() + " " + n.slice(0, i).trim() : n;
};

export const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export const fmtPtsHalf = (p: number) => Math.floor(p) + (p % 1 ? "½" : "");

export const fedFlag = (fed: string) => (fed === "NGR" ? "🇳🇬" : fed);
