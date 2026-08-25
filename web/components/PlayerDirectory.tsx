"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { fmtName, fedFlag, type Player } from "@/lib/elo";
import { useNigeriaPlayers } from "@/lib/nigeria";
import { seedPlayers } from "@/convex/seedData";
import OfflinePanel from "@/components/OfflinePanel";
import Breadcrumbs from "@/components/Breadcrumbs";

const GLYPHS = ["♔", "♕", "♖", "♗", "♘", "♙"];

export default function PlayerDirectory() {
  // No Convex backend configured → render the full 1,693-player Nigerian FIDE
  // database (fetched from /public) instead of dead-ending on a small seed.
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return <StaticDirectory />;
  }
  return <ConvexDirectory />;
}

function ConvexDirectory() {
  const players = useQuery(api.queries.listPlayers);

  if (players === undefined) {
    return (
      <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
        <div className="panel">
          <div className="big">♟</div>
          <h2>Loading players…</h2>
          <p>Fetching the FIDE player list from the Convex backend.</p>
        </div>
      </div>
    );
  }

  if (players === null || !players.length) {
    return (
      <OfflinePanel icon="🗂" title="No players seeded">
        Start the backend and seed the player data to see the directory here.
      </OfflinePanel>
    );
  }

  return <Directory players={players} count={players.length} />;
}

function StaticDirectory() {
  const { players, loading } = useNigeriaPlayers();
  const list = players && players.length ? players : seedPlayers;

  if (loading) {
    return (
      <div className="wrap" style={{ paddingTop: 150, paddingBottom: 80 }}>
        <div className="panel">
          <div className="big">♟</div>
          <h2>Loading the FIDE player database…</h2>
          <p>Fetching all {`1,693`} Nigerian players from the official FIDE list.</p>
        </div>
      </div>
    );
  }

  return <Directory players={list} count={1693} snapshot />;
}

function Directory({
  players,
  count,
  snapshot = false,
}: {
  players: Player[];
  count: number;
  snapshot?: boolean;
}) {
  const [q, setQ] = useState("");
  const sorted = useMemo(
    () => [...players].sort((a, b) => b.standard - a.standard),
    [players]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return null;
    return sorted.filter(
      (p) =>
        p.lname.toLowerCase().includes(s) ||
        p.fideId.toLowerCase().includes(s) ||
        p.title.toLowerCase().includes(s)
    );
  }, [q, sorted]);

  // No search → every player, sorted by rating; with a query → only the matches.
  const visible = filtered ?? sorted;
  const showing = visible.length;

  return (
    <>
      <Breadcrumbs items={[{ label: "Player profiles" }]} />
      <section className="hero" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow">
            <span className="dot" /> {count.toLocaleString()} FIDE-rated players
            {snapshot ? (
              <span className="chip muted" style={{ marginLeft: 10, fontSize: 11 }}>
                real data snapshot
              </span>
            ) : null}
          </span>
          <h1 style={{ fontSize: "clamp(30px,4vw,46px)", maxWidth: 760, margin: "0 auto 18px" }}>
            Nigerian player profiles
          </h1>
          <p className="lead" style={{ margin: "0 auto", maxWidth: 640 }}>
            Every Nigerian player on the official FIDE list — real ratings, titles and
            FIDE IDs. Search by name, title or FIDE ID. Tournament players link to their
            head-to-head records and game-by-game Elo performance.
          </p>

          <div style={{ maxWidth: 520, margin: "26px auto 0", position: "relative" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 1,693 players — name, title (FM, IM…), FIDE ID…"
              aria-label="Search players"
              style={{
                width: "100%", padding: "14px 18px 14px 46px", borderRadius: 14, fontSize: 15,
                background: "rgba(255,255,255,.05)", border: "1px solid var(--line2)",
                color: "var(--text)", outline: "none",
              }}
            />
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.7 }}>🔍</span>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 10 }}>
            {q.trim()
              ? `${filtered!.length} match${filtered!.length === 1 ? "" : "es"} for “${q.trim()}”`
              : `All ${count.toLocaleString()} players shown — type to narrow the list`}
          </div>
        </div>
      </section>

      <div className="wrap" style={{ marginTop: -40, position: "relative", paddingBottom: 80 }}>
        <div className="grid3">
          {visible.map((p) => (
            <Link
              key={p.lname}
              href={`/players/${encodeURIComponent(p.lname)}`}
              className="card"
              style={{ textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  className="ic piece"
                  style={{ width: 54, height: 54, fontSize: 28, marginBottom: 0, flexShrink: 0 }}
                >
                  {GLYPHS[p.lname.length % 6]}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 16.5, lineHeight: 1.3 }}>
                    {fmtName(p.lname)}
                    {p.title ? <span style={{ color: "var(--gold)", marginLeft: 6, fontSize: 13 }}>{p.title}</span> : null}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 2 }}>
                    {fedFlag(p.fed)} {p.fed} · FIDE {p.fideId}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
                <span className="chip muted">Std {p.standard || "—"}</span>
                <span className="chip muted">Rpd {p.rapid || "—"}</span>
                <span className="chip muted">Blz {p.blitz || "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
