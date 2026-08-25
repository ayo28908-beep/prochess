"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function LiveStrip() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    // Backend not configured — point at the static live page as a fallback.
    return (
      <div className="tstrip">
        <div className="tcard">
          <span className="chip green">● Live</span>
          <div className="tc-name">Nigeria Chess Olympiad Qualifiers 2026 Open</div>
          <div className="tc-meta">
            <span>
              <b>Rapid 90+30</b> · Time control
            </span>
            <span>
              <b>Chevron Recreational Centre, Gbagada</b> · Venue
            </span>
          </div>
          <Link href="/live" className="btn btn-primary btn-sm" style={{ marginTop: "auto" }}>
            Watch live →
          </Link>
        </div>
        <div className="tcard">
          <span className="chip gold">⏳ Registering</span>
          <div className="tc-name">Blazing Kings Monthly Rapid Championship</div>
          <div className="tc-meta">
            <span>
              <b>Rapid 10+0</b> · Time control
            </span>
            <span>
              <b>Lagos, Nigeria</b> · Venue
            </span>
          </div>
        </div>
        <div className="tcard">
          <span className="chip muted">☀ Juniors</span>
          <div className="tc-name">Prochess Summer Camp Championship</div>
          <div className="tc-meta">
            <span>
              <b>Standard 60+30</b> · Time control
            </span>
            <span>
              <b>Abuja, Nigeria</b> · Venue
            </span>
          </div>
        </div>
      </div>
    );
  }
  return <LiveStripInner />;
}

function LiveStripInner() {
  const ts = useQuery(api.queries.listTournaments);

  if (ts === undefined) {
    return (
      <div className="tstrip">
        {[0, 1, 2].map((i) => (
          <div className="tcard" key={i} style={{ opacity: 0.5, minHeight: 140 }}>
            <div className="chip muted">…</div>
          </div>
        ))}
      </div>
    );
  }

  if (ts === null || !ts.length) {
    // Backend offline (or empty) — point at the static live page as a fallback.
    return (
      <div className="tstrip">
        <div className="tcard">
          <span className="chip green">● Live</span>
          <div className="tc-name">Nigeria Chess Olympiad Qualifiers 2026 Open</div>
          <div className="tc-meta">
            <span>
              <b>Rapid 90+30</b> · Time control
            </span>
            <span>
              <b>Chevron Recreational Centre, Gbagada</b> · Venue
            </span>
          </div>
          <Link href="/live" className="btn btn-primary btn-sm" style={{ marginTop: "auto" }}>
            Watch live →
          </Link>
        </div>
        <div className="tcard">
          <span className="chip gold">⏳ Registering</span>
          <div className="tc-name">Blazing Kings Monthly Rapid Championship</div>
          <div className="tc-meta">
            <span>
              <b>Rapid 10+0</b> · Time control
            </span>
            <span>
              <b>Lagos, Nigeria</b> · Venue
            </span>
          </div>
        </div>
        <div className="tcard">
          <span className="chip muted">☀ Juniors</span>
          <div className="tc-name">Prochess Summer Camp Championship</div>
          <div className="tc-meta">
            <span>
              <b>Standard 60+30</b> · Time control
            </span>
            <span>
              <b>Abuja, Nigeria</b> · Venue
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tstrip">
      {ts.map((t) => (
        <div className="tcard" key={t.slug}>
          <span className={`chip ${t.live ? "green" : t.finished < t.games ? "gold" : "muted"}`}>
            {t.live ? "● Live now" : t.finished < t.games ? "⏳ In progress" : "🏁 Finished"}
          </span>
          <div className="tc-name">{t.name}</div>
          <div className="tc-meta">
            <span>
              <b>{t.timeControl || "—"}</b> · Time control
            </span>
            <span>
              <b>{t.venue || "—"}</b> · Venue
            </span>
            <span>
              <b>{t.finished}</b> of {t.games} games played · {t.rounds} rounds
            </span>
          </div>
          <Link href={`/live?slug=${t.slug}`} className="btn btn-primary btn-sm" style={{ marginTop: "auto" }}>
            View standings →
          </Link>
        </div>
      ))}
    </div>
  );
}
