"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { computeStandings, fmtDelta, fmtPts, type Player, type Game } from "@/lib/elo";
import { seedPlayers, seedTournaments } from "@/convex/seedData";
import OfflinePanel from "@/components/OfflinePanel";
import Breadcrumbs from "@/components/Breadcrumbs";

type TournamentShow = {
  tournament: { slug: string; name: string; venue: string; timeControl: string; prizePool: string };
  games: Game[];
  players: Player[];
};

const seedShow: TournamentShow = {
  tournament: {
    slug: seedTournaments[0].slug,
    name: seedTournaments[0].name,
    venue: seedTournaments[0].venue,
    timeControl: seedTournaments[0].timeControl,
    prizePool: seedTournaments[0].prizePool,
  },
  games: seedTournaments.flatMap((t) => t.games),
  players: seedPlayers,
};

export default function LiveTournament({ slug }: { slug: string }) {
  // No Convex backend configured → render the real seeded tournament (official
  // FIDE ratings + DGT games) instead of dead-ending at an offline panel.
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return seedShow.tournament.slug === slug ? (
      <LiveTournamentView show={seedShow} />
    ) : (
      <OfflinePanel icon="🔍" title="Tournament not found">
        No tournament with slug “{slug}” in the seeded data.
      </OfflinePanel>
    );
  }
  return <LiveTournamentInner slug={slug} />;
}

function LiveTournamentInner({ slug }: { slug: string }) {
  const data = useQuery(api.queries.tournament, { slug });

  if (data === undefined) {
    return (
      <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
        <div className="panel">
          <div className="big">♟</div>
          <h2>Loading live tournament…</h2>
          <p>Fetching games and ratings from the Convex backend.</p>
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <OfflinePanel icon="🔍" title="Tournament not found">
        No tournament with slug “{slug}” in the database. Check the slug or re-run the
        seed.
      </OfflinePanel>
    );
  }

  return <LiveTournamentView show={data} />;
}

function LiveTournamentView({ show }: { show: TournamentShow }) {
  const { tournament: t, games, players } = show;
  const standings = computeStandings(games, players);
  const [round, setRound] = useState<number | null>(null);
  const rounds = [...new Set(games.map((g) => g.round))].sort((a, b) => a - b);
  const activeRound = round ?? rounds[rounds.length - 1] ?? 1;
  const roundGames = games.filter((g) => g.round === activeRound);
  const livePlayers = new Set(
    games.filter((g) => g.live).flatMap((g) => [g.white, g.black])
  );
  const played = games.filter((g) => g.result !== "*").length;
  const pending = games.length - played;
  const liveNow = games.some((g) => g.live);
  const byName = new Map(players.map((p) => [p.lname, p]));
  const linkName = (lname: string) => {
    const p = byName.get(lname);
    if (p) return `/players/${encodeURIComponent(p.lname)}`;
    return "#";
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Live tournament", href: "/live" }, { label: t.name }]} />
      {/* ---------- hero ---------- */}
      <section className="hero" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">
            <span className="dot" /> {liveNow ? `Live now — round ${activeRound}` : "Tournament finished"}
          </span>
          <h1 style={{ fontSize: "clamp(30px,4vw,46px)", maxWidth: 800, margin: "0 auto 18px" }}>
            {t.name}
          </h1>
          <div className="tc-meta" style={{ display: "flex", gap: "8px 28px", justifyContent: "center", flexWrap: "wrap", color: "var(--muted)", fontSize: 14 }}>
            <span>📍 <b style={{ color: "var(--text)" }}>{t.venue || "—"}</b></span>
            <span>⏱ <b style={{ color: "var(--text)" }}>{t.timeControl || "—"}</b></span>
            <span>🏆 <b style={{ color: "var(--text)" }}>{t.prizePool || "—"}</b></span>
            <span>♟ <b style={{ color: "var(--text)" }}>{standings.length}</b> players</span>
            <span>🎯 <b style={{ color: "var(--text)" }}>{played}</b> games played</span>
            {pending > 0 && (
              <span className="chip green">● {pending} live</span>
            )}
          </div>
        </div>
      </section>

      <div className="wrap" style={{ marginTop: -70, position: "relative" }}>
        {/* ---------- standings ---------- */}
        <section className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "22px 26px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800 }}>Live standings</h3>
            <span className="chip muted">Points · Buchholz · Perf · Δ (FIDE Elo math)</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th></th>
                  <th>Player</th>
                  <th className="num">Elo</th>
                  <th className="num">Perf</th>
                  <th className="num">Δ</th>
                  <th className="num">Pts</th>
                  <th className="num">W</th>
                  <th className="num">D</th>
                  <th className="num">L</th>
                  <th className="num">Buch</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((p, i) => (
                  <tr key={p.name} className={livePlayers.has(p.name) ? "livepl" : ""}>
                    <td className="pos">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                    <td>
                      <a className="pname" href={linkName(p.name)}>
                        {p.title ? `${p.title} ` : ""}
                        {p.name}
                      </a>
                    </td>
                    <td className="num">{p.rating || "—"}</td>
                    <td className="num">{p.perf ?? "—"}</td>
                    <td className={`num ${p.delta && p.delta > 0 ? "up" : p.delta && p.delta < 0 ? "down" : ""}`}>
                      {fmtDelta(p.delta)}
                    </td>
                    <td className="num" style={{ fontWeight: 800 }}>{fmtPts(p.pts)}</td>
                    <td className="num">{p.w}</td>
                    <td className="num">{p.d}</td>
                    <td className="num">{p.l}</td>
                    <td className="num">{fmtPts(p.buch)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- pairings ---------- */}
        <section style={{ marginTop: 32 }}>
          <div className="rtabs">
            {rounds.map((r) => (
              <button
                key={r}
                className={`rtab ${r === activeRound ? "on" : ""}`}
                onClick={() => setRound(r)}
              >
                Round {r}
              </button>
            ))}
          </div>
          <div className="grid3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {roundGames.map((g, i) => {
              const w = byName.get(g.white);
              const b = byName.get(g.black);
              const dec = g.result === "1-0" ? "w" : g.result === "0-1" ? "b" : g.result === "1/2-1/2" ? "d" : null;
              return (
                <div className="card" key={i} style={{ padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span className="chip muted">Round {g.round}</span>
                    {g.live ? <span className="chip green">● Live</span> : <span className="chip muted">{g.result}</span>}
                  </div>
                  {[
                    { name: g.white, p: w, color: "white" },
                    { name: g.black, p: b, color: "black" },
                  ].map((s) => (
                    <div key={s.color} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0" }}>
                      <a href={linkName(s.name)} style={{ fontWeight: 700 }}>
                        {s.p?.title ? `${s.p.title} ` : ""}
                        {s.name}
                      </a>
                      <span style={{ color: "var(--muted)", fontSize: 13, whiteSpace: "nowrap" }}>
                        {s.p?.standard ? `FIDE ${s.p.standard}` : "—"}
                      </span>
                    </div>
                  ))}
                  {dec && (
                    <div style={{ marginTop: 8, fontSize: 13, color: "var(--muted)" }}>
                      Result:{" "}
                      <b style={{ color: dec === "w" ? "var(--text)" : dec === "b" ? "var(--gold)" : "var(--muted)" }}>
                        {g.result}
                      </b>{" "}
                      {dec === "w" ? "— White won" : dec === "b" ? "— Black won" : "— Draw"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
