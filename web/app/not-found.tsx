import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ paddingTop: 160, paddingBottom: 100 }}>
      <div className="panel">
        <div className="big">♞</div>
        <h1 style={{ fontSize: 72, lineHeight: 1, margin: "0 0 6px" }}>404</h1>
        <h2>This square doesn&apos;t exist</h2>
        <p>
          The page you&apos;re looking for was moved, renamed, or never made it onto
          the board. Let&apos;s get you back into the game.
        </p>
        <div className="ctas" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn btn-primary">
            ♞ Back to home
          </Link>
          <Link href="/live" className="btn btn-ghost">
            Live tournament →
          </Link>
        </div>
      </div>
    </div>
  );
}
