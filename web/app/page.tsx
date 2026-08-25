import type { Metadata } from "next";
import Link from "next/link";
import LiveStrip from "@/components/LiveStrip";
import { STREAM_URL, STREAM_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Prochess — Learn, Play, Stream, and Master Chess",
  description:
    "Nigeria's #1 chess academy. Learn chess online with courses, daily puzzles, live tournament standings with real FIDE ratings, summer camp and certified coaching for kids and adults.",
  alternates: { canonical: "/" },
};

const BOARD: [string, string][] = [
  // [piece, light?] — start position, black at top
  ["r", "0"], ["n", "1"], ["b", "0"], ["q", "1"], ["k", "0"], ["b", "1"], ["n", "0"], ["r", "1"],
  ["p", "1"], ["p", "0"], ["p", "1"], ["p", "0"], ["p", "1"], ["p", "0"], ["p", "1"], ["p", "0"],
  ["", "0"], ["", "1"], ["", "0"], ["", "1"], ["", "0"], ["", "1"], ["", "0"], ["", "1"],
  ["", "1"], ["", "0"], ["", "1"], ["", "0"], ["", "1"], ["", "0"], ["", "1"], ["", "0"],
  ["", "0"], ["", "1"], ["", "0"], ["", "1"], ["", "0"], ["", "1"], ["", "0"], ["", "1"],
  ["", "1"], ["", "0"], ["", "1"], ["", "0"], ["", "1"], ["", "0"], ["", "1"], ["", "0"],
  ["P", "0"], ["P", "1"], ["P", "0"], ["P", "1"], ["P", "0"], ["P", "1"], ["P", "0"], ["P", "1"],
  ["R", "1"], ["N", "0"], ["B", "1"], ["Q", "0"], ["K", "1"], ["B", "0"], ["N", "1"], ["R", "0"],
];

const PIECE_GLYPH: Record<string, string> = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙",
};

const COURSES = [
  {
    icon: "♙", tag: "Beginner", title: "Beginner Course",
    desc: "Learn the rules, basic checkmates and how to play your first real game with confidence.",
    points: ["Board basics & piece movement", "Check, checkmate & stalemate", "Basic checkmates", "First tournament habits"],
  },
  {
    icon: "♘", tag: "Intermediate", title: "Intermediate Course",
    desc: "Master opening principles, tactical motifs and simple endgames that win games.",
    points: ["Opening principles", "Tactics & combinations", "King & pawn endgames", "Positional play basics"],
  },
  {
    icon: "♕", tag: "Advanced", title: "Advanced Course",
    desc: "Deep middlegame strategy, precise calculation and tournament preparation for rated players.",
    points: ["Middlegame strategy", "Calculation training", "Endgame mastery", "Opening repertoires"],
  },
];

const STATS = [
  { icon: "🎓", num: "2,500+", label: "Students Trained" },
  { icon: "🏆", num: "182", label: "Tournaments Hosted" },
  { icon: "♟", num: "120+", label: "FIDE-Rated Players" },
  { icon: "🌍", num: "6", label: "Countries Reached" },
];

export default function Home() {
  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">
              <span className="dot" /> Nigeria&apos;s #1 Chess Academy &amp; Streaming Platform
            </span>
            <h1>
              Learn, Play, Stream, <span className="grad">and Master Chess.</span>
            </h1>
            <p className="sub">
              World-class lessons, daily puzzles, live tournament broadcasts and certified
              coaching — from first move to FIDE master, all in one place. Prochess is
              also FIDE&apos;s partner for the Infinite Chess Project in Nigeria.
            </p>
            <div className="ctas">
              <Link href="/#academy" className="btn btn-primary">
                🎓 Join Academy
              </Link>
              <Link href="/live" className="btn btn-ghost">
                ▶ Watch Live Games
              </Link>
            </div>
            <div className="trust">
              <span className="stars">★★★★★</span>
              <span>
                <b>2,500+</b> students trust Prochess
              </span>
            </div>
          </div>
          <div className="boardstage">
            <div className="boardglow" />
            <div className="chessboard" aria-hidden>
              {BOARD.map(([p, light], i) => (
                <div key={i} className={`sq ${light === "1" ? "light" : "dark"}`}>
                  {p ? PIECE_GLYPH[p] : ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <section className="sec" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <div className="stats">
            {STATS.map((s) => (
              <div className="stat" key={s.label}>
                <div style={{ fontSize: 26 }}>{s.icon}</div>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- academy ---------- */}
      <section className="sec" id="academy">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">🎓 The Academy</span>
            <h2>From your first move to your first FIDE title</h2>
            <p className="lead">
              Structured courses with video lessons, interactive puzzles, homework, quizzes
              and an end-of-course certificate.
            </p>
          </div>
          <div className="grid3">
            {COURSES.map((c) => (
              <div className="card" key={c.title}>
                <div className="ic piece">{c.icon}</div>
                <span className="chip muted">{c.tag}</span>
                <h3 style={{ marginTop: 12 }}>{c.title}</h3>
                <p>{c.desc}</p>
                <div className="tags">
                  {c.points.map((pt) => (
                    <span className="tag" key={pt}>
                      ✓ {pt}
                    </span>
                  ))}
                </div>
                <Link href="/#academy" className="link" style={{ marginTop: "auto", display: "inline-block", paddingTop: 12 }}>
                  Start learning →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- puzzles ---------- */}
      <section className="sec" id="puzzles" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">⚡ Train your brain</span>
            <h2>Puzzles that make you sharper</h2>
            <p className="lead">
              Daily puzzles, Puzzle Rush, timed battles and streaks — with a leaderboard
              that never sleeps.
            </p>
          </div>
          <div className="grid4">
            {[
              ["♟", "Daily Puzzle", "One fresh puzzle every day"],
              ["⚡", "Puzzle Rush", "Solve as many as you can in 5 minutes"],
              ["⚔️", "Puzzle Battle", "Head-to-head, fastest solver wins"],
              ["🔥", "Puzzle Streak", "One wrong answer and it&apos;s over"],
            ].map(([icon, t, d]) => (
              <div className="card" key={t}>
                <div className="ic">{icon}</div>
                <h3>{t}</h3>
                <p>{d}</p>
                <span className="link">Coming soon →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- live strip ---------- */}
      <section className="sec" id="live">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">🏆 Compete</span>
            <h2>Live tournaments &amp; real standings</h2>
            <p className="lead">
              Swiss, round-robin and knockout — with live standings, pairings and full
              broadcast on Prochess Live.
            </p>
          </div>
          <LiveStrip />
        </div>
      </section>

      {/* ---------- live stream ---------- */}
      <section className="sec" id="stream" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">🎥 Live broadcast</span>
            <h2>Watch every game, live</h2>
            <p className="lead">
              Multi-board broadcasts with an evaluation bar, live chat and commentary —
              powered by {STREAM_NAME}, Prochess&apos;s dedicated streaming home.
            </p>
          </div>
          <div className="cta-band" style={{ padding: "40px 32px" }}>
            <h2 style={{ fontSize: "clamp(24px,3vw,34px)" }}>The stream is live from the venue 📡</h2>
            <p>
              Live games, standings, chat and analysis — all on the stream site.
            </p>
            <div className="ctas">
              <a className="btn btn-primary" href={STREAM_URL} target="_blank" rel="noopener noreferrer">
                ▶ Open {STREAM_NAME} →
              </a>
              <Link href="/live" className="btn btn-ghost">
                Live standings here
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- beyond the board ---------- */}
      <section className="sec" id="impact">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">🌍 Beyond the board</span>
            <h2>Prochess is more than teaching chess</h2>
            <p className="lead">
              An academy, a tournament organizer, a streaming platform — and a force for
              good in Nigerian communities.
            </p>
          </div>
          <div className="grid3">
            {[
              ["🤝", "FIDE's Infinite Chess Project", "Appointed by FIDE to launch chess for children with autism (ASD) across Nigeria."],
              ["🏫", "Chess in schools", "After-school programs and partnerships spanning 22 schools in Ibadan & Lagos."],
              ["🎥", "Live streaming platform", "Every tournament broadcast live — standings, boards and commentary nationwide."],
            ].map(([icon, t, d]) => (
              <div className="card" key={t as string}>
                <div className="ic">{icon}</div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- camp ---------- */}
      <section className="sec" id="camp" style={{ background: "var(--bg2)" }}>
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">☀️ Holiday program · NCF &amp; FIDE affiliated</span>
            <h2>Prochess Summer Camp 2026</h2>
            <p className="lead">
              Three weeks of chess immersion at 38 Ifelodun Street, Orogun, Ibadan —
              10th–28th August, 9am–1:30pm, weekdays. Every camper leaves with a
              certificate, a camp T-shirt and a FIDE rating from the final-day tournament.
            </p>
          </div>
          <div className="grid3">
            {[
              ["₦8,000", "/ week", "Per week", ["5 days of coaching", "9am–1:30pm weekdays", "Certificate of completion"]],
              ["₦20,000", "/ all 3 weeks", "Full camp · best value", ["All 3 weeks (10–28 Aug)", "Free Prochess camp T-shirt", "FIDE-rated tournament on the final day"]],
              ["10–28 Aug", "9am–1:30pm", "Dates & venue", ["38 Ifelodun Street, Orogun, Ibadan", "Call Ayodeji 0808 163 5986", "or Ayomikun 0805 517 0872"]],
            ].map(([price, per, lbl, items]) => (
              <div className="card" key={lbl as string}>
                <span className={`chip ${lbl === "Full camp · best value" ? "gold" : "green"}`}>
                  {lbl === "Full camp · best value" ? "★ Best value" : lbl}
                </span>
                <h3 style={{ marginTop: 12, fontSize: 26 }}>
                  {price} <span style={{ color: "var(--muted)", fontSize: 14, fontWeight: 600 }}>{per}</span>
                </h3>
                <div className="tags">
                  {(items as string[]).map((it) => (
                    <span className="tag" key={it}>
                      ✓ {it}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24, color: "var(--muted)", fontSize: 14 }}>
            🏟 NCF &amp; FIDE affiliated · Limited seats — call to reserve
          </div>
        </div>
      </section>

      {/* ---------- team ---------- */}
      <section className="sec" id="team">
        <div className="wrap">
          <div className="sec-head">
            <span className="kicker">🏆 The team</span>
            <h2>Meet the people behind Prochess</h2>
            <p className="lead">
              Founded by Olalekan Adeyemi — CEO of Prochess Academy and FIDE&apos;s partner
              for the Infinite Chess Project in Nigeria — and run by a team that lives and
              breathes chess.
            </p>
          </div>
          <div className="grid3">
            {[
              ["♔", "Adeyemi O. Ayodeji", "Chief Operations Officer", "0810 042 1852", "Runs the academy, tournaments and the day-to-day."],
              ["♘", "Olumide Komolafe", "Head Trainer", "0815 660 7576", "Leads the coaching team and the classroom program."],
              ["♗", "Esan Faith Toluwalase", "Head of School Partnerships", "0903 551 9574", "Takes chess into schools across Nigeria."],
            ].map(([g, name, role, phone, d]) => (
              <div className="card" key={name as string} style={{ textAlign: "center" }}>
                <div className="ic piece" style={{ margin: "0 auto 14px", width: 58, height: 58, fontSize: 30 }}>{g}</div>
                <h3 style={{ fontSize: 19 }}>{name}</h3>
                <div style={{ color: "var(--gold)", fontSize: 13, fontWeight: 700 }}>{role}</div>
                <p style={{ margin: "10px 0 14px" }}>{d}</p>
                <div className="chip muted">📞 {phone}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="sec">
        <div className="wrap">
          <div className="cta-band">
            <h2>Your chess journey starts with one move.</h2>
            <p>
              Join the academy free — get your first course, daily puzzles and a seat at
              the next tournament.
            </p>
            <div className="ctas">
              <Link href="/dashboard" className="btn btn-primary">
                Create free account
              </Link>
              <Link href="/live" className="btn btn-ghost">
                Watch live games
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
