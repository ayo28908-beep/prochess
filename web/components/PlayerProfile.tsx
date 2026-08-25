"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  playerProfile,
  fmtName,
  fmtPtsHalf,
  fmtDelta,
  fedFlag,
  type Player,
  type Game,
} from "@/lib/elo";
import { seedPlayers, seedTournaments } from "@/convex/seedData";
import { useNigeriaPlayers, useRatingHistory, labelOf, type HistoryEntry } from "@/lib/nigeria";
import { ratingHistory as seededHistory } from "@/lib/ratingHistory";
import Breadcrumbs from "@/components/Breadcrumbs";
import RatingChart from "@/components/RatingChart";

const MEDALS = ["🥇", "🥈", "🥉"];
const ORD = (n: number) => (n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th");

const resPill = (score: number) =>
  score === 1 ? (
    <span className="respill w">1–0</span>
  ) : score === 0 ? (
    <span className="respill l">0–1</span>
  ) : (
    <span className="respill d">½–½</span>
  );

// Payload both data sources produce: the queried player + the full player/game
// lists needed by the Elo engine (identical to the `playerGames` Convex query).
type ProfileShow = { player: Player | null; players: Player[]; games: Game[] };

const seedGames = seedTournaments.flatMap((t) => t.games);

export default function PlayerProfile({ lname }: { lname: string }) {
  // No Convex backend configured → render from the full 1,693-player Nigerian
  // FIDE database + real 12-month rating history instead of dead-ending.
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <StaticProfile lname={lname} />;
  }
  return <ConvexProfile lname={lname} />;
}

function ConvexProfile({ lname }: { lname: string }) {
  const data = useQuery(api.queries.playerGames, { lname });
  const [sel, setSel] = useState<string | null>(null);

  const active = sel ?? lname;
  const activeData = useQuery(api.queries.playerGames, { lname: active });
  const show = active === lname ? data : activeData;

  if (show === undefined) {
    return (
      <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
        <div className="panel">
          <div className="big">♟</div>
          <h2>Loading profile…</h2>
          <p>Fetching games and ratings from the Convex backend.</p>
        </div>
      </div>
    );
  }

  if (show === null) {
    return <ProfileMissing active={active} />;
  }

  return (
    <ProfileBody
      active={active}
      show={show}
      history={seededHistory[active]}
      onSwitch={(next) => {
        setSel(next);
        window.history.replaceState(null, "", `/players/${encodeURIComponent(next)}`);
      }}
    />
  );
}

function StaticProfile({ lname }: { lname: string }) {
  const { players, loading } = useNigeriaPlayers();
  const { history } = useRatingHistory();
  const [sel, setSel] = useState<string | null>(null);
  const active = sel ?? lname;

  if (loading) {
    return (
      <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
        <div className="panel">
          <div className="big">♟</div>
          <h2>Loading profile…</h2>
          <p>Fetching the player from the FIDE database.</p>
        </div>
      </div>
    );
  }

  const list = players && players.length ? players : seedPlayers;
  const player = list.find((p) => p.lname === active) ?? null;

  if (!player) {
    return <ProfileMissing active={active} />;
  }

  return (
    <ProfileBody
      active={active}
      show={{ player, players: list, games: seedGames }}
      history={history ? history[active] : undefined}
      onSwitch={(next) => {
        setSel(next);
        window.history.replaceState(null, "", `/players/${encodeURIComponent(next)}`);
      }}
    />
  );
}

function ProfileMissing({ active }: { active: string }) {
  return (
    <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
      <div className="panel">
        <div className="big">🔍</div>
        <h2>Player not found</h2>
        <p>
          “{active}” isn’t in the FIDE list loaded into the backend. Check the name or
          browse the directory.
        </p>
        <div className="ctas" style={{ justifyContent: "center" }}>
          <Link href="/players" className="btn btn-ghost">
            Browse all players →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileBody({
  active,
  show,
  history,
  onSwitch,
}: {
  active: string;
  show: ProfileShow;
  history?: HistoryEntry | null;
  onSwitch: (next: string) => void;
}) {
  const p = useMemo(
    () =>
      !show.players?.length ? null : playerProfile(show.games, show.players, active),
    [show, active]
  );

  if (!p || !p.player) {
    return <ProfileMissing active={active} />;
  }

  const f = p.player;
  const myR = p.rating;
  const played = p.perGame.length;
  const pct = played ? Math.round((p.pts / played) * 100) : 0;
  const games = [...p.perGame].sort((a, b) => b.r - a.r);
  const pending = [...p.pending].sort((a, b) => b.r - a.r);
  // Cumulative delta per game, computed in order (K × (cumulative score − cumulative expected)).
  const rows = games.map((g, i) => {
    const cumScore = games.slice(0, i + 1).reduce((s, x) => s + x.score, 0);
    const cumExpTotal = games.slice(0, i + 1).reduce((s, x) => s + x.e, 0);
    const cumDelta = Math.sign(p.k) * Math.round(Math.abs(p.k * (cumScore - cumExpTotal)));
    return { g, cumDelta };
  });

  const oppLink = (opp: string, withTitle = true) => (
    <Link href={`/players/${encodeURIComponent(opp)}`}>
      {fmtName(opp)}
      {withTitle && oppTitle(opp, show.players)}
    </Link>
  );

  // Real 12-month FIDE history for this player (from the official monthly lists).
  const histPts = (history?.months ?? []).filter((x) => x.rating > 0);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Player profiles", href: "/players" },
          { label: fmtName(f.lname) },
        ]}
      />
      <section className="hero" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">
            <span className="dot" /> FIDE profile · real data
          </span>
          <h1 style={{ fontSize: "clamp(30px,4vw,46px)", margin: "0 auto 18px" }}>
            {fmtName(f.lname)}{" "}
            {f.title ? <span style={{ color: "var(--gold)", fontSize: "0.6em" }}>{f.title}</span> : null}
          </h1>
          <div style={{ color: "var(--muted)", fontSize: 14, display: "flex", gap: "8px 26px", justifyContent: "center", flexWrap: "wrap" }}>
            <span>{fedFlag(f.fed)} {f.fed}</span>
            <span>🎂 Born {f.born || "—"}</span>
            <span>🪪 FIDE ID {f.fideId || "—"}</span>
          </div>
          <div className="ctas" style={{ justifyContent: "center", marginTop: 22 }}>
            <select
              value={active}
              onChange={(e) => onSwitch(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid var(--line2)",
                borderRadius: 10, color: "var(--text)", padding: "9px 14px", fontWeight: 700, fontSize: 13.5,
              }}
              aria-label="Switch player"
            >
              {[...show.players]
                .sort((a, b) => b.standard - a.standard)
                .map((pl) => (
                  <option key={pl.lname} value={pl.lname} style={{ background: "#111a2c" }}>
                    {fmtName(pl.lname)} ({pl.standard || "—"})
                  </option>
                ))}
            </select>
            {f.fideId ? (
              <a
                className="btn btn-ghost btn-sm"
                href={`https://ratings.fide.com/profile/${f.fideId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Official FIDE profile ↗
              </a>
            ) : null}
            <Link
              className="btn btn-ghost btn-sm"
              href={`/compare?a=${encodeURIComponent(f.lname)}`}
            >
              ⚖ Compare with another player
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap" style={{ marginTop: -40, position: "relative", paddingBottom: 80 }}>
        {/* rating chips */}
        <div className="grid4" style={{ marginBottom: 24 }}>
          {(
            [
              ["♔", "#60a5fa", "FIDE Classical", f.standard],
              ["♘", "var(--green)", "Rapid", f.rapid],
              ["♗", "var(--gold)", "Blitz", f.blitz],
              ["♜", "var(--red)", "K-factor", myR ? `K=${p.k}` : "—"],
            ] as [string, string, string, number | string][]
          ).map(([glyph, color, label, val]) => (
            <div key={label as string} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: 18 }}>
              <div className="ic piece" style={{ width: 46, height: 46, fontSize: 24, marginBottom: 0, background: `color-mix(in srgb, ${color} 14%, transparent)`, borderColor: `color-mix(in srgb, ${color} 30%, transparent)`, color }}>
                {glyph}
              </div>
              <div>
                <b style={{ fontSize: 22, letterSpacing: -0.5 }}>{val || "—"}</b>
                <div style={{ color: "var(--muted)", fontSize: 12.5 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 12-month rating history — real FIDE monthly ratings */}
        {histPts.length >= 2 ? (
          <section className="card" style={{ marginBottom: 24, padding: 26 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>📈 FIDE rating history</h3>
            <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 16 }}>
              Real ratings from the official FIDE monthly lists ({labelOf(histPts[0].month)} → {labelOf(histPts[histPts.length - 1].month)})
            </div>
            <RatingChart
              months={histPts.map((x) => labelOf(x.month))}
              ratings={histPts.map((x) => x.rating)}
            />
          </section>
        ) : null}

        {/* event performance */}
        <section className="card" style={{ marginBottom: 24, padding: 26 }}>
          <div className="grid4" style={{ gap: 20 }}>
            {[
              ["Points", `${fmtPtsHalf(p.pts)} / ${played}`],
              ["Performance", p.perf ?? "—"],
              ["Δ rating", fmtDelta(p.delta)],
              ["Buchholz", fmtPtsHalf(p.buch)],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ color: "var(--muted)", fontSize: 12.5, textTransform: "uppercase", letterSpacing: 1.2 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", color: "var(--muted)", fontSize: 14 }}>
            {p.rank > 0 && p.total > 0 ? (
              <>
                {p.rank <= 3 ? <span className="medal">{MEDALS[p.rank - 1]}</span> : <span>#{p.rank}</span>}{" "}
                <b style={{ color: "var(--text)" }}>
                  {p.rank}
                  {ORD(p.rank)} of {p.total}
                </b>{" "}
                · {p.w}–{p.d}–{p.l} (W–D–L) · {pct}% score · {p.k ? `K=${p.k}` : ""}
              </>
            ) : (
              "No finished tournament games on record yet — this is their official FIDE card."
            )}
          </div>
        </section>

        <div className="cols" style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 24, alignItems: "start" }}>
          {/* game-by-game */}
          <section className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "22px 26px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 19, fontWeight: 800 }}>Game-by-game performance</h3>
              {p.delta != null ? (
                <span className="chip muted">ΣΔ {fmtDelta(p.delta)}</span>
              ) : null}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Rd</th><th>Opponent</th><th className="num">Elo</th><th></th><th>Res</th>
                    <th className="num">Score</th><th className="num">Exp</th><th className="num">ΔR</th><th className="num">Cum Δ</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ g, cumDelta }) => (
                    <tr key={`${g.r}-${g.opp}`}>
                        <td className="pos">R{g.r}</td>
                        <td className="opp">{oppLink(g.opp)}</td>
                        <td className="num">{g.oppR || "—"}</td>
                        <td><span className="colorbadge">{g.color === "w" ? "♔" : "♚"}</span></td>
                        <td>{resPill(g.score)}</td>
                        <td className="num">{g.score}</td>
                        <td className="num" style={{ color: "var(--muted)" }}>{g.e.toFixed(2)}</td>
                        <td className={`num ${g.dr > 0 ? "up" : g.dr < 0 ? "down" : ""}`}>
                          {g.dr > 0 ? "+" : ""}{g.dr.toFixed(2)}
                        </td>
                        <td className={`num ${cumDelta > 0 ? "up" : cumDelta < 0 ? "down" : ""}`} style={{ fontWeight: 800 }}>
                          {cumDelta > 0 ? "+" : ""}{cumDelta}
                        </td>
                      </tr>
                  ))}
                  {pending.map((g) => (
                    <tr key={`${g.r}-${g.opp}-p`}>
                      <td className="pos">R{g.r}</td>
                      <td className="opp">{oppLink(g.opp)}</td>
                      <td className="num">{g.oppR || "—"}</td>
                      <td><span className="colorbadge">{g.color === "w" ? "♔" : "♚"}</span></td>
                      <td><span className="chip green" style={{ fontSize: 11 }}>{g.live ? "● Live" : "—"}</span></td>
                      <td className="num">—</td><td className="num">—</td><td className="num">—</td><td className="num">—</td>
                    </tr>
                  ))}
                  {!rows.length && !pending.length ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: "center", color: "var(--muted)", padding: "26px 0" }}>
                        No tournament games on record yet — check back after the next Prochess event.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "12px 26px 20px", color: "var(--muted)", fontSize: 12.5 }}>
              Exp = expected score vs that opponent (400-point logistic). ΔR = score − expected. Cum Δ = K × (cumulative
              score − cumulative expected), rounded — sums to the event Δ. Pending games not counted.
            </div>
          </section>

          {/* head-to-head + FIDE card */}
          <div style={{ display: "grid", gap: 24 }}>
            <section className="card" style={{ padding: 0, overflow: "hidden" }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, padding: "20px 22px 8px" }}>Head-to-head</h3>
              <div style={{ overflowX: "auto" }}>
                <table className="tbl">
                  <thead>
                    <tr><th>Opponent</th><th className="num">Elo</th><th className="num">W</th><th className="num">D</th><th className="num">L</th><th className="num">Score</th></tr>
                  </thead>
                  <tbody>
                    {p.h2h.map((h) => (
                      <tr key={h.opp}>
                        <td className="opp">{oppLink(h.opp)}</td>
                        <td className="num">{h.oppR || "—"}</td>
                        <td className="num up">{h.w}</td>
                        <td className="num" style={{ color: "var(--muted)" }}>{h.d}</td>
                        <td className="num down">{h.l}</td>
                        <td className="num" style={{ fontWeight: 800 }}>{fmtPtsHalf(h.score)}</td>
                      </tr>
                    ))}
                    {!p.h2h.length ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: "26px 0" }}>
                          No head-to-head records yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card">
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>FIDE card</h3>
              <div style={{ display: "grid", gap: 10, fontSize: 13.5 }}>
                {[
                  ["FIDE ID", f.fideId || "—"],
                  ["Federation", `${fedFlag(f.fed)} ${f.fed}`],
                  ["Title", f.title || "—"],
                  ["Born", f.born || "—"],
                  ["Standard / Rapid / Blitz", `${f.standard || "—"} / ${f.rapid || "—"} / ${f.blitz || "—"}`],
                  ["K-factor", `K=${p.k}`],
                  ...(histPts.length
                    ? [["12-month history", `${histPts[0].rating} → ${histPts[histPts.length - 1].rating} (${labelOf(histPts[0].month)} → ${labelOf(histPts[histPts.length - 1].month)})`]]
                    : []),
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 2px", borderBottom: "1px solid var(--line)", gap: 12 }}>
                    <span style={{ color: "var(--muted)" }}>{label}</span>
                    <b style={{ textAlign: "right" }}>{val}</b>
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

function oppTitle(opp: string, players: { lname: string; title: string }[]) {
  const t = players.find((pl) => pl.lname === opp)?.title;
  return t ? <span className="tl">{t}</span> : null;
}
