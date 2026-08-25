"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { computeStandings, fmtName, fedFlag } from "@/lib/elo";
import OfflinePanel from "@/components/OfflinePanel";
import DashboardDemo from "@/components/DashboardDemo";
import { ratingHistory } from "@/lib/ratingHistory";

// ---------------------------------------------------------------- static data
// Rating history: current point is real (August 2026 FIDE list); earlier months are
// illustrative until real rating-change history is wired (Lichess/Chess.com or FIDE).
const ME = {
  lname: "Kigigha, Bomo Lovet",
  ratings: {
    classical: [2210, 2224, 2218, 2236, 2252, 2247, 2263, 2271, 2268, 2275, 2278, 2287],
    rapid: [2145, 2158, 2150, 2172, 2180, 2176, 2191, 2198, 2204, 2201, 2270, 2280],
    blitz: [2112, 2120, 2115, 2134, 2141, 2158, 2162, 2170, 2179, 2182, 2230, 2248],
  },
  months: ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
};
const MODULES = [
  { n: "Opening Principles", p: 100 },
  { n: "Tactics", p: 85 },
  { n: "Endgames", p: 65 },
  { n: "Positional Play", p: 45 },
  { n: "Calculation", p: 28 },
  { n: "Middlegame Strategy", p: 12 },
];
const CERTS = [
  { t: "Advanced Course — Endgames", d: "December 12, 2025", id: "PC-CERT-2025-0922" },
  { t: "Summer Camp 2025 Champion", d: "August 22, 2025", id: "PC-CERT-2025-0713" },
  { t: "Beginner Course Certificate", d: "June 4, 2025", id: "PC-CERT-2025-0417" },
];
const ACH = [
  { i: "🥇", t: "First Tournament Win", s: "Rated victory, 2023", u: true },
  { i: "🔥", t: "Puzzle Streak 30", s: "30 days straight", u: true },
  { i: "🏆", t: "Top-3 National Event", s: "Invitationals 2025", u: true },
  { i: "♟", t: "50 Games Played", s: "Across all events", u: true },
  { i: "📚", t: "Opening Master", s: "100% openings module", u: true },
  { i: "⚔️", t: "100 Wins", s: "41 to go", u: false },
  { i: "♛", t: "Endgame Guru", s: "Finish endgames module", u: false },
  { i: "🎓", t: "Advanced Graduate", s: "Earn your certificate", u: false },
];

// ---------------------------------------------------------------- QR (fake but deterministic — real verification needs the backend)
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function qrSVG(seed: string) {
  const rnd = mulberry(hash(seed));
  const n = 21;
  const mods: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  const finder = (r: number, c: number) => {
    for (let i = -1; i <= 7; i++)
      for (let j = -1; j <= 7; j++) {
        const rr = r + i, cc = c + j;
        if (rr < 0 || cc < 0 || rr >= n || cc >= n) continue;
        const ring = Math.max(Math.abs(i), Math.abs(j));
        mods[rr][cc] = ring !== 2 && ring !== 4;
      }
  };
  finder(0, 0);
  finder(0, n - 7);
  finder(n - 7, 0);
  const data: boolean[] = [];
  for (let i = 0; i < 200; i++) data.push(rnd() > 0.52);
  let di = 0;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      if (mods[r][c] || (r < 9 && c < 9) || (r < 9 && c >= n - 8) || (r >= n - 8 && c < 9)) continue;
      if (di < data.length) mods[r][c] = data[di++];
    }
  let out = "";
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) if (mods[r][c]) out += `<rect x="${c}" y="${r}" width="1" height="1" fill="#111"/>`;
  return `<svg viewBox="0 0 ${n} ${n}" xmlns="http://www.w3.org/2000/svg" width="52" height="52">${out}</svg>`;
}

function chartPath(data: number[]) {
  const W = 680, H = 260, PAD = 14;
  const min = Math.min(...data), max = Math.max(...data), span = Math.max(max - min, 1);
  const x = (i: number) => PAD + ((W - 2 * PAD) * i) / (data.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - 2 * PAD);
  let d = `M ${x(0)} ${y(data[0])}`;
  for (let i = 1; i < data.length; i++) {
    const x0 = x(i - 1), y0 = y(data[i - 1]), x1 = x(i), y1 = y(data[i]);
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }
  return { d, pts: data.map((v, i) => [x(i), y(v)] as const) };
}

// ---------------------------------------------------------------- component
export default function Dashboard({ clerkEnabled }: { clerkEnabled: boolean }) {
  // No Convex backend yet → render the demo dashboard from real seeded data
  // (works with the demo sign-in; the DB-powered version takes over once keys exist).
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <DashboardDemo />;
  }
  return <DashboardInner clerkEnabled={clerkEnabled} />;
}

function DashboardInner({ clerkEnabled }: { clerkEnabled: boolean }) {
  const data = useQuery(api.queries.playerGames, { lname: ME.lname });
  const [verifyId, setVerifyId] = useState<string | null>(null);

  const profile = useMemo(() => {
    if (!data || !data.player) return null;
    const games = data.games.filter((g) => g.white === ME.lname || g.black === ME.lname);
    const finished = games.filter((g) => g.result !== "*");
    const wins = finished.filter((g) =>
      g.result === "1-0" ? g.white === ME.lname : g.result === "0-1" ? g.black === ME.lname : false
    ).length;
    const draws = finished.filter((g) => g.result === "1/2-1/2").length;
    const rank = computeStandings(data.games, data.players).findIndex((s) => s.name === ME.lname) + 1;
    const rows = games
      .map((g) => {
        const isW = g.white === ME.lname;
        const opp = isW ? g.black : g.white;
        const x =
          g.result === "*" ? "pending" : g.result === "1/2-1/2" ? "draw" : isW ? (g.result === "1-0" ? "win" : "loss") : g.result === "0-1" ? "win" : "loss";
        const pts = g.result === "*" ? "—" : g.result === "1/2-1/2" ? "½" : x === "win" ? "1" : "0";
        return { r: g.round, c: isW ? "w" : "b", o: opp, x, pts };
      })
      .sort((a, b) => b.r - a.r);
    return {
      f: data.player,
      finished: finished.length,
      wins,
      draws,
      rank,
      rows,
      winRate: finished.length ? Math.round((wins / finished.length) * 100) : 0,
    };
  }, [data]);

  // Real FIDE monthly history when the tool has run; illustrative fallback otherwise.
  const realPts = (ratingHistory[ME.lname]?.months ?? []).filter((x) => x.rating > 0);
  const MONTHS3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labelOf = (ym: string) => { const [y, m] = ym.split("-"); return `${MONTHS3[+m - 1]} '${y.slice(2)}`; };
  const chartData =
    realPts.length >= 2
      ? { months: realPts.map((x) => labelOf(x.month)), ratings: realPts.map((x) => x.rating), real: true }
      : { months: ME.months, ratings: ME.ratings.classical, real: false };
  const chart = chartPath(chartData.ratings);

  return (
    <>
      {/* ---------- profile ---------- */}
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <div className="pavatar piece" style={{
              width: 84, height: 84, borderRadius: 22, display: "grid", placeItems: "center", fontSize: 44,
              background: "linear-gradient(135deg,var(--green2),var(--green))", boxShadow: "0 12px 32px rgba(34,197,94,.35)",
            }}>
              ♞
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "clamp(24px,3vw,34px)", fontWeight: 900, letterSpacing: -0.8 }}>
                  {ME.lname.includes(",") ? fmtName(ME.lname) : ME.lname}
                </h1>
                <span className="chip gold">{profile?.f.title || "—"}</span>
                {!clerkEnabled && <span className="chip muted">Demo view — add Clerk keys for your own account</span>}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, display: "flex", gap: "6px 22px", flexWrap: "wrap" }}>
                <span>{fedFlag(profile?.f.fed || "NGR")} {profile?.f.fed || "NGR"} · Lagos</span>
                <span>🪪 FIDE {profile?.f.fideId || "—"}</span>
                <span>🎂 Born {profile?.f.born || "—"}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/live" className="btn btn-ghost btn-sm">View live tournament →</Link>
              <button className="btn btn-ghost btn-sm" onClick={() => alert("Profile editing arrives with the accounts phase.")}>⚙ Edit profile</button>
            </div>
          </div>

          <div className="grid4" style={{ marginTop: 28 }}>
            {(
              [
                ["♔", "#60a5fa", "FIDE Classical", profile?.f.standard],
                ["♘", "var(--green)", "Rapid", profile?.f.rapid],
                ["♗", "var(--gold)", "Blitz", profile?.f.blitz],
                ["♜", "var(--red)", "Puzzle Rating", 2350],
              ] as [string, string, string, number | string | undefined][]
            ).map(([glyph, color, label, val]) => (
              <div key={label as string} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
                <div className="ic piece" style={{ width: 46, height: 46, fontSize: 24, marginBottom: 0, color }}>{glyph}</div>
                <div>
                  <b style={{ fontSize: 22 }}>{val ?? "—"}</b>
                  <div style={{ color: "var(--muted)", fontSize: 12.5 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid4" style={{ marginTop: 20 }}>
            {[
              ["♟", profile?.finished ?? "…", "Games this event"],
              ["⚔️", profile ? `${profile.winRate}%` : "…", "Win rate"],
              ["🔥", "134", "Puzzle streak"],
              ["🏆", profile ? `🥇 #${profile.rank}` : "…", "Tournament standing"],
            ].map(([icon, num, label]) => (
              <div className="stat" key={label as string} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                <div>
                  <div className="num" style={{ fontSize: 24 }}>{num}</div>
                  <div className="lbl">{label}</div>
                </div>
                <span style={{ fontSize: 26 }}>{icon}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap" style={{ paddingBottom: 80 }}>
        <div className="cols" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 24 }}>
            {/* rating progress */}
            <section className="card">
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>📈 Rating progress</h3>
              <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 16 }}>
                {chartData.real
                  ? `FIDE Classical — real ratings from the official FIDE monthly lists (${realPts[0].month} → ${realPts[realPts.length - 1].month})`
                  : "FIDE Classical · illustrative until real FIDE history is fetched (run tools/fetch-rating-history.mjs)"}
              </div>
              <svg viewBox="0 0 680 260" preserveAspectRatio="none" style={{ width: "100%", height: 220 }}>
                {[0, 1, 2, 3].map((g) => (
                  <line key={g} x1={14} y1={30 + g * 70} x2={666} y2={30 + g * 70} stroke="rgba(148,180,255,.07)" strokeWidth={1} />
                ))}
                <path
                  d={`${chart.d} L ${chart.pts[chart.pts.length - 1][0]} 246 L ${chart.pts[0][0]} 246 Z`}
                  fill="url(#areagrad)" opacity={0.5}
                />
                <path d={chart.d} fill="none" stroke="var(--green)" strokeWidth={2.5} strokeLinecap="round" />
                {chart.pts.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={3.2} fill="var(--green)">
                    <title>{chartData.months[i]}: {chartData.ratings[i]}</title>
                  </circle>
                ))}
                {chartData.months.map((m, i) => (
                  <text key={m} x={chart.pts[i][0]} y={252} textAnchor="middle" fontSize={10} fill="var(--muted)">{m}</text>
                ))}
                <defs>
                  <linearGradient id="areagrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="rgba(34,197,94,.28)" />
                    <stop offset="1" stopColor="rgba(34,197,94,0)" />
                  </linearGradient>
                </defs>
              </svg>
            </section>

            {/* course progress */}
            <section className="card">
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>🎯 Course progress</h3>
              <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 18 }}>Advanced Course · 2025/26</div>
              <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                <svg viewBox="0 0 120 120" style={{ width: 120, height: 120 }}>
                  <circle cx={60} cy={60} r={52} fill="none" stroke="rgba(148,180,255,.1)" strokeWidth={11} />
                  <circle
                    cx={60} cy={60} r={52} fill="none"
                    stroke="url(#ringgrad)" strokeWidth={11} strokeLinecap="round"
                    strokeDasharray={326.7}
                    strokeDashoffset={326.7 * (1 - 55.8 / 100)}
                    transform="rotate(-90 60 60)"
                  />
                  <defs>
                    <linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="var(--green2)" />
                      <stop offset="1" stopColor="var(--green)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ flex: 1, minWidth: 260, display: "grid", gap: 12 }}>
                  {MODULES.map((m) => (
                    <div key={m.n} style={{ display: "grid", gridTemplateColumns: "150px 1fr 40px", gap: 10, alignItems: "center", fontSize: 13 }}>
                      <span style={{ color: "var(--muted)" }}>{m.n}</span>
                      <div style={{ background: "rgba(148,180,255,.08)", borderRadius: 99, height: 8, overflow: "hidden" }}>
                        <div style={{ width: `${m.p}%`, height: "100%", background: "linear-gradient(90deg,var(--green2),var(--green))", borderRadius: 99 }} />
                      </div>
                      <b style={{ textAlign: "right" }}>{m.p}%</b>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            {/* certificates */}
            <section className="card">
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>🎖 Certificates</h3>
              <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 18 }}>
                QR-secured · verified on prochess.com/verify
              </div>
              <div style={{ display: "grid", gap: 14 }}>
                {CERTS.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: 16, alignItems: "center", border: "1px solid var(--line)", borderRadius: 14, padding: 14 }}>
                    <div className="seal piece" style={{ width: 52, height: 52, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 26, background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.3)", flexShrink: 0 }}>♞</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 14.5, display: "block" }}>{c.t}</b>
                      <div style={{ color: "var(--muted)", fontSize: 12.5 }}>Issued {c.d}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        <button className="btn btn-primary btn-sm" onClick={() => setVerifyId(c.id)}>Verify</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>⬇ PDF</button>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: qrSVG(c.id) }} />
                  </div>
                ))}
              </div>
            </section>

            {/* match history — REAL from Convex */}
            <section className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "22px 26px 12px" }}>
                <h3 style={{ fontSize: 19, fontWeight: 800 }}>♟ Match history</h3>
                <div style={{ color: "var(--muted)", fontSize: 12.5 }}>Olympiad Qualifiers 2026 — live from the database</div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr><th>Rd</th><th></th><th>Opponent</th><th>Result</th><th className="num">Pts</th></tr>
                  </thead>
                  <tbody>
                    {profile ? profile.rows.map((m) => (
                      <tr key={`${m.r}-${m.o}`}>
                        <td className="pos">R{m.r}</td>
                        <td><span className="colorbadge">{m.c === "w" ? "♔" : "♚"}</span></td>
                        <td className="opp">
                          <Link href={`/players/${encodeURIComponent(m.o)}`} style={{ color: "var(--text)", fontWeight: 600 }}>
                            {fmtName(m.o)}
                          </Link>
                        </td>
                        <td>
                          {m.x === "win" ? <span className="respill w">Win</span> : m.x === "loss" ? <span className="respill l">Loss</span> : m.x === "draw" ? <span className="respill d">Draw</span> : <span className="respill p">Live</span>}
                        </td>
                        <td className="num" style={{ fontWeight: 800 }}>{m.pts}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)" }}>Loading match history…</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* achievements */}
            <section className="card">
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>🏅 Achievements</h3>
              <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 16 }}>
                {ACH.filter((a) => a.u).length} of {ACH.length} unlocked
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                {ACH.map((a) => (
                  <div key={a.t} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 12,
                    border: `1px solid ${a.u ? "rgba(34,197,94,.3)" : "var(--line)"}`,
                    background: a.u ? "rgba(34,197,94,.07)" : "rgba(148,180,255,.03)",
                    opacity: a.u ? 1 : 0.55,
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{a.u ? a.i : "🔒"}</span>
                    <div>
                      <b style={{ fontSize: 13, display: "block" }}>{a.t}</b>
                      <span style={{ color: "var(--muted)", fontSize: 11.5 }}>{a.s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* verify modal */}
      {verifyId && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "grid", placeItems: "center",
          zIndex: 200, padding: 24,
        }} onClick={() => setVerifyId(null)}>
          <div className="card" style={{ maxWidth: 380, textAlign: "center", padding: 36 }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", margin: "0 auto 16px", display: "grid", placeItems: "center",
              background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.4)", color: "var(--green)", fontSize: 26,
            }}>✓</div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Certificate verified</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, margin: "10px 0 6px" }}>
              This certificate is registered on the Prochess Academy ledger.
            </p>
            <div className="certid" style={{
              fontFamily: "monospace", background: "rgba(148,180,255,.07)", border: "1px solid var(--line)",
              borderRadius: 8, padding: "8px 14px", fontSize: 13, margin: "12px 0 20px",
            }}>{verifyId}</div>
            <button className="btn btn-primary" onClick={() => setVerifyId(null)}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}
