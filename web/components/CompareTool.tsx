"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fmtName, fedFlag, kOf, type Player } from "@/lib/elo";
import { useNigeriaPlayers, useRatingHistory, labelOf } from "@/lib/nigeria";
import { seedTournaments } from "@/convex/seedData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RatingChart from "@/components/RatingChart";

const GLYPHS = ["♔", "♕", "♖", "♗", "♘", "♙"];
const seedGames = seedTournaments.flatMap((t) => t.games);

const cardStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14.5,
  background: "rgba(255,255,255,.05)", border: "1px solid var(--line2)",
  color: "var(--text)", outline: "none", fontWeight: 700,
};

export default function CompareTool() {
  const { players, loading } = useNigeriaPlayers();
  const { history } = useRatingHistory();
  const params = useSearchParams();
  const list = players && players.length ? players : [];

  const sorted = useMemo(() => [...list].sort((a, b) => b.standard - a.standard), [list]);
  const [aSel, setASel] = useState<string | null>(null);
  const [bSel, setBSel] = useState<string | null>(null);

  const a = aSel ?? params.get("a") ?? sorted[0]?.lname ?? "";
  const b = bSel ?? params.get("b") ?? sorted[1]?.lname ?? "";
  const pa = sorted.find((p) => p.lname === a);
  const pb = sorted.find((p) => p.lname === b);

  if (loading) {
    return (
      <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
        <div className="panel">
          <div className="big">⚖️</div>
          <h2>Loading the player database…</h2>
          <p>Fetching all 1,693 Nigerian players to compare.</p>
        </div>
      </div>
    );
  }

  const hist = (lname: string) =>
    (history?.[lname]?.months ?? []).filter((m) => m.rating > 0);

  const monthUnion = [...new Set([...hist(a).map((m) => m.month), ...hist(b).map((m) => m.month)])].sort();
  const map = (lname: string) => {
    const h = history?.[lname]?.months ?? [];
    return monthUnion.map((m) => h.find((x) => x.month === m)?.rating ?? null);
  };

  const h2h = seedGames.filter(
    (g) => (g.white === a && g.black === b) || (g.white === b && g.black === a)
  );

  const statRow = (label: string, va: string | number, vb: string | number, better: "a" | "b" | null = null) => {
    const colorA = better === "a" ? "var(--green)" : "var(--text)";
    const colorB = better === "b" ? "var(--green)" : "var(--text)";
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 1fr", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)", fontSize: 14 }}>
        <b style={{ textAlign: "right", color: colorA }}>{va}</b>
        <span style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <b style={{ color: colorB }}>{vb}</b>
      </div>
    );
  };

  const card = (p: Player | undefined, side: "a" | "b") => {
    if (!p) return <div className="card" style={{ padding: 28, textAlign: "center", color: "var(--muted)" }}>—</div>;
    return (
      <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="ic piece" style={{ width: 52, height: 52, fontSize: 26, marginBottom: 0, flexShrink: 0 }}>
            {GLYPHS[p.lname.length % 6]}
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.3 }}>
              {fmtName(p.lname)}
              {p.title ? <span style={{ color: "var(--gold)", marginLeft: 6, fontSize: 13 }}>{p.title}</span> : null}
            </div>
            <div style={{ color: "var(--muted)", fontSize: 12.5 }}>{fedFlag(p.fed)} {p.fed} · FIDE {p.fideId}</div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 8, fontSize: 13.5 }}>
          {[
            ["Classical", p.standard || "—"],
            ["Rapid", p.rapid || "—"],
            ["Blitz", p.blitz || "—"],
            ["Born", p.born || "—"],
            ["K-factor", `K=${kOf(p.standard || 0, p.born)}`],
          ].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 2px", borderBottom: "1px solid var(--line)" }}>
              <span style={{ color: "var(--muted)" }}>{l}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>
        <Link href={`/players/${encodeURIComponent(p.lname)}`} className="btn btn-ghost btn-sm" style={{ textAlign: "center" }}>
          Full profile →
        </Link>
      </div>
    );
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Player profiles", href: "/players" }, { label: "Compare" }]} />
      <section className="hero" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow"><span className="dot" /> Head-to-head · 1,693 players</span>
          <h1 style={{ fontSize: "clamp(30px,4vw,46px)", margin: "0 auto 14px" }}>Compare two players</h1>
          <p className="lead" style={{ margin: "0 auto", maxWidth: 560 }}>
            Pick any two Nigerian players and see their FIDE cards, rating history and
            head-to-head record side by side.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 12, maxWidth: 720, margin: "26px auto 0", alignItems: "center" }}>
            <select value={a} onChange={(e) => setASel(e.target.value)} aria-label="Player A" style={cardStyle}>
              {sorted.map((p) => (
                <option key={p.lname} value={p.lname} style={{ background: "#111a2c" }}>{fmtName(p.lname)} ({p.standard || "—"})</option>
              ))}
            </select>
            <div style={{ textAlign: "center", fontSize: 24, fontWeight: 900, color: "var(--gold)" }}>VS</div>
            <select value={b} onChange={(e) => setBSel(e.target.value)} aria-label="Player B" style={cardStyle}>
              {sorted.map((p) => (
                <option key={p.lname} value={p.lname} style={{ background: "#111a2c" }}>{fmtName(p.lname)} ({p.standard || "—"})</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="wrap" style={{ paddingBottom: 80 }}>
        {/* side-by-side cards */}
        <div className="cols" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {card(pa, "a")}
          {card(pb, "b")}
        </div>

        {/* rating history overlay */}
        <section className="card" style={{ marginBottom: 24, padding: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800 }}>📈 Rating history overlay</h3>
            <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: "var(--muted)" }}>
              <span><span style={{ display: "inline-block", width: 14, height: 3, background: "var(--green)", borderRadius: 99, marginRight: 6, verticalAlign: "middle" }} />{pa ? fmtName(pa.lname) : "—"}</span>
              <span><span style={{ display: "inline-block", width: 14, height: 3, background: "var(--gold)", borderRadius: 99, marginRight: 6, verticalAlign: "middle" }} />{pb ? fmtName(pb.lname) : "—"}</span>
            </div>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 16 }}>
            FIDE Classical · real ratings from the official monthly lists
          </div>
          <RatingChart
            months={monthUnion.map(labelOf)}
            ratings={map(a)}
            series2={{ months: monthUnion.map(labelOf), ratings: map(b), color: "var(--gold)" }}
          />
        </section>

        {/* stat comparison */}
        <div className="cols" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24, alignItems: "start" }}>
          <section className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>⚖️ Side-by-side</h3>
            <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 8 }}>
              Green = higher in that category
            </div>
            {(() => {
              const f = (v: number | undefined, w: number | undefined) => (v ?? 0) > (w ?? 0) ? "a" : (w ?? 0) > (v ?? 0) ? "b" : null;
              return (
                <>
                  {statRow("Classical", pa?.standard || "—", pb?.standard || "—", f(pa?.standard, pb?.standard))}
                  {statRow("Rapid", pa?.rapid || "—", pb?.rapid || "—", f(pa?.rapid, pb?.rapid))}
                  {statRow("Blitz", pa?.blitz || "—", pb?.blitz || "—", f(pa?.blitz, pb?.blitz))}
                  {statRow("Title", pa?.title || "—", pb?.title || "—", null)}
                  {statRow("Born", pa?.born || "—", pb?.born || "—", null)}
                </>
              );
            })()}
          </section>

          <section className="card" style={{ padding: 26 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>⚔️ Head-to-head</h3>
            <div style={{ color: "var(--muted)", fontSize: 12.5, marginBottom: 14 }}>
              From Prochess tournaments on record
            </div>
            {h2h.length ? (
              <div style={{ display: "grid", gap: 8 }}>
                {h2h.map((g) => {
                  const aw = g.white === a;
                  const res = g.result === "1-0" ? (aw ? "1–0" : "0–1") : g.result === "0-1" ? (aw ? "0–1" : "1–0") : "½–½";
                  return (
                    <div key={`${g.round}-${g.white}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13.5 }}>
                      <span className="chip muted">R{g.round}</span>
                      <span style={{ color: "var(--muted)" }}>
                        {fmtName(aw ? g.black : g.white)} as {aw ? "Black" : "White"}
                      </span>
                      <b style={{ fontSize: 15 }}>{res}</b>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: 14 }}>
                No recorded games between these two yet — they may meet in a future Prochess tournament.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
