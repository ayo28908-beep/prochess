import Link from "next/link";
import { STREAM_URL, STREAM_NAME } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="fgrid">
          <div className="fcol">
            <Link href="/" className="logo">
              <img src="/prochess-logo.png" alt="PROCHESS" className="brandlogo" />
              Pro<b>chess</b>
            </Link>
            <p style={{ marginTop: 14 }}>
              Learn, Play, Stream, and Master Chess. Nigeria&apos;s home of chess
              education, tournaments and live broadcast.
            </p>
            <Link href="/about" style={{ fontSize: 13.5, fontWeight: 700, color: "var(--green)" }}>
              About Prochess →
            </Link>
          </div>
          <div className="fcol">
            <h4>Learn</h4>
            <Link href="/#academy">Beginner course</Link>
            <Link href="/#academy">Intermediate course</Link>
            <Link href="/#academy">Advanced course</Link>
            <Link href="/#puzzles">Daily puzzles</Link>
            <Link href="/#puzzles">Puzzle rush</Link>
          </div>
          <div className="fcol">
            <h4>Compete</h4>
            <Link href="/live">Live tournament</Link>
            <Link href="/live">Live standings</Link>
            <Link href="/players">Player profiles</Link>
            <Link href="/compare">Compare players</Link>
            <Link href="/dashboard">Student dashboard</Link>
            <Link href="/#camp">Summer camp</Link>
          </div>
          <div className="fcol">
            <h4>Watch</h4>
            <a href={STREAM_URL} target="_blank" rel="noopener noreferrer">
              ▶ {STREAM_NAME}
            </a>
            <Link href="/analyze">Game analyzer</Link>
            <Link href="/live">Live tournament board</Link>
            <Link href="/live">Standings &amp; pairings</Link>
          </div>
          <div className="fcol">
            <h4>Get updates</h4>
            <p>
              Tournament announcements, new courses and special offers — straight to
              your inbox.
            </p>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Prochess Academy. All rights reserved.</span>
          <span>Made with ♟ in Nigeria</span>
        </div>
      </div>
    </footer>
  );
}
