"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { computeStandings, fmtName, fedFlag } from "@/lib/elo";
import { seedPlayers, seedTournaments } from "@/convex/seedData";
import { ratingHistory } from "@/lib/ratingHistory";
import RatingChart from "@/components/RatingChart";

// Demo dashboard: renders from the real seeded data (official FIDE ratings + DGT
// tournament games) when Convex isn't connected yet. The full DB-powered version
// (Dashboard.tsx → DashboardInner) takes over automatically once Convex keys exist.
const ME = "Kigigha, Bomo Lovet";
const seedGames = seedTournaments.flatMap((t) => t.games);

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

export default function DashboardDemo() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("prochess_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  if (user === null) {
    return (
      <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
        <div className="panel">
          <div className="big">🔐</div>
          <h2>Sign in to see your dashboard</h2>
          <p>
            Create a free account or sign in — your progress, ratings and certificates
            live here.
          </p>
          <div className="ctas" style={{ justifyContent: "center" }}>
            <Link href="/sign-in" className="btn btn-primary">Sign in</Link>
            <Link href="/sign-up" className="btn btn-ghost">Create free account</Link>
          </div>
        </div>
      </div>
    );
  }

  const f = seedPlayers.find((p) => p.lname === ME) ?? seedPlayers[0];
  const games = seedGames.filter((g) => g.white === ME || g.black === ME);
  const finished = games.filter((g) => g.result !== "*");
  const wins = finished.filter((g) =>
    g.result === "1-0" ? g.white === ME : g.result === "0-1" ? g.black === ME : false
  ).length;
  const draws = finished.filter((g) => g.result === "1/2-1/2").length;
  const losses = finished.length - wins - draws;
  const rank = computeStandings(seedGames, seedPlayers).findIndex((s) => s.name === ME) + 1;
  const rows = games
    .map((g) => {
      const isW = g.white === ME;
      const opp = isW ? g.black : g.white;
      const x =
        g.result === "*" ? "pending" : g.result === "1/2-1/2" ? "draw" : isW ? (g.result === "1-0" ? "win" : "loss") : g.result === "0-1" ? "win" : "loss";
      const pts = g.result === "*" ? "—" : g.result === "1/2-1/2" ? "½" : x === "win" ? "1" : "0";
      return { r: g.round, c: isW ? "w" : "b", o: opp, x, pts };
    })
    .sort((a, b) => b.r - a.r);

  const realPts = (ratingHistory[ME]?.months ?? []).filter((x) => x.rating > 0);
  const MONTHS3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const labelOf = (ym: string) => { const [y, m] = ym.split("-"); return `${MONTHS3[+m - 1]} '${y.slice(2)}`; };

  return (
    <>
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
                  {fmtName(f.lname)}
                </h1>
                <span className="chip gold">{f.title || "—"}</span>
              </div>
              <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, display: "flex", gap: "6px 22px", flexWrap: "wrap" }}>
                <span>Signed in as <b style={{ color: "var(--text)" }}>{user.name}</b></span>
                <span>{fedFlag(f.fed)} {f.fed} · Lagos</span>
                <span>🪪 FIDE {f.fideId}</span>
                <span>🎂 Born {f.born || "—"}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/live" className="btn btn-ghost btn-sm">View live tournament →</Link>
              <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem("prochess_user"); location.reload(); }}>Log out</button>
            </div>
          </div>

          <div className="grid4" style={{ marginTop: 28 }}>
            {([
              ["♔", "#60a5fa", "FIDE Classical", f.standard],
              ["♘", "var(--green)", "Rapid", f.rapid],
              ["♗", "var(--gold)", "Blitz", f.blitz],
              ["♜", "var(--red)", "Puzzle Rating", 2350],
            ] as [string, string, string, number][]).map(([glyph, color, label, val]) => (
              <div key={label} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
                <div className="ic piece" style={{ width: 46, height: 46, fontSize: 24, marginBottom: 0, color }}>{glyph}</div>
                <div>
                  <b style={{ fontSize: 22 }}>{val || "—"}</b>
                  <div style={{ color: "var(--muted)", fontSize: 12.5 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid4" style={{ marginTop: 20 }}>
            {[
              ["♟", finished.length, "Games this event"],
              ["⚔️", finished.length ? `${Math.round((wins / finished.length) * 100)}%` : "—", "Win rate"],
              ["🔥", "134", "Puzzle streak"],
              ["🏆", `🥇 #${rank}`, "Tournament standing"],
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
            <section className="card">
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>📈 Rating progress</h3>
              <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 16 }}>
                FIDE Classical — real ratings from the official FIDE monthly lists (
                {realPts.length ? `${labelOf(realPts[0].month)} → ${labelOf(realPts[realPts.length - 1].month)}` : "history loading"}
                )
              </div>
              <RatingChart
                months={realPts.map((x) => labelOf(x.month))}
                ratings={realPts.map((x) => x.rating)}
              />
            </section>

            <section className="card">
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>🎯 Course progress</h3>
              <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 18 }}>Advanced Course · 2025/26</div>
              <div style={{ display: "grid", gap: 12 }}>
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
            </section>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            <section className="card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "22px 26px 12px" }}>
                <h3 style={{ fontSize: 19, fontWeight: 800 }}>♟ Match history</h3>
                <div style={{ color: "var(--muted)", fontSize: 12.5 }}>
                  Olympiad Qualifiers 2026 · {wins}–{draws}–{losses} (W–D–L) · real DGT results
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr><th>Rd</th><th></th><th>Opponent</th><th>Result</th><th className="num">Pts</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((m) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card">
              <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>🎖 Certificates</h3>
              <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 18 }}>
                QR-secured · verified on prochess.com/verify
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {CERTS.map((c) => (
                  <div key={c.id} style={{ display: "flex", gap: 12, alignItems: "center", border: "1px solid var(--line)", borderRadius: 12, padding: 12 }}>
                    <div className="seal piece" style={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 22, background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.3)", flexShrink: 0 }}>♞</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: 13.5, display: "block" }}>{c.t}</b>
                      <span style={{ color: "var(--muted)", fontSize: 12 }}>Issued {c.d}</span>
                    </div>
                    <span className="chip green">✓ Verified</span>
                  </div>
                ))}
              </div>
            </section>

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
    </>
  );
}
