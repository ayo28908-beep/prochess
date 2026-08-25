import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us — Prochess Academy, Nigeria",
  description:
    "Prochess Academy is a FIDE-affiliated Nigerian chess academy — courses, tournaments, live streaming, schools programs and FIDE's Infinite Chess Project. Founded by Olalekan Adeyemi, Vice President of FIDE.",
  alternates: { canonical: "/about" },
};

const TEAM = [
  {
    g: "♔",
    name: "Olalekan “Lekan” Adeyemi",
    role: "Founder & CEO",
    extra: "Vice President, FIDE · Past President, Nigeria Chess Federation",
    bio: "The founder of Prochess Academy, Lekan has spent decades growing chess across Nigeria — from grassroots classrooms to the international stage. As Vice President of the International Chess Federation and a past President of the Nigeria Chess Federation, he has championed chess in schools, trained a generation of coaches and, through Prochess, was appointed by FIDE to launch the Infinite Chess Project — bringing chess to children with autism — in Nigeria.",
    phone: "0806 505 1323",
  },
  {
    g: "♘",
    name: "Akinwunmi Sehinde",
    role: "Certified FIDE Instructor",
    extra: "Coach · Chess-in-Schools specialist",
    bio: "A certified FIDE instructor, Sehinde is one of the academy's most trusted tutors — featured by FIDE itself for his work with the Prochess club. A lifelong chess enthusiast and trained professional, he blends his engineering mind (he's also a software developer and University of Lagos alumnus) with patient, structured teaching that makes chess click for kids and adults alike.",
    phone: "via the academy",
  },
  {
    g: "♗",
    name: "Adeyemi Oluwafemi Ayodeji",
    role: "Chief Operations Officer",
    extra: "FIDE National Arbiter · FIDE-rated",
    bio: "Adeyemi runs the day-to-day of Prochess — tournaments, the academy and the operations that keep the games rolling. A licensed FIDE National Arbiter (FIDE ID 8510792), he has served as chief arbiter at FIDE-rated rapid tournaments and carries a FIDE rapid rating himself, so the events he organises meet international standards from the arbiter's chair to the results sheet.",
    phone: "0810 042 1852",
  },
  {
    g: "♖",
    name: "Olumide Komolafe",
    role: "Head Trainer",
    extra: "Leads the coaching team",
    bio: "Olumide leads the coaching team at Prochess — training the tutors, designing the curriculum and making sure every student, from first-move beginners to rated competitors, gets the same high standard of instruction.",
    phone: "0815 660 7576",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="hero" style={{ paddingTop: 150, paddingBottom: 60 }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <span className="eyebrow"><span className="dot" /> About Prochess</span>
          <h1 style={{ fontSize: "clamp(32px,4.5vw,52px)", maxWidth: 780, margin: "0 auto 18px" }}>
            An academy, a movement — <span className="grad">beyond teaching chess.</span>
          </h1>
          <p className="lead" style={{ margin: "0 auto", maxWidth: 640 }}>
            Prochess is a FIDE-affiliated Nigerian chess academy and streaming platform —
            teaching kids and adults, running rated tournaments, broadcasting games live,
            taking chess into schools, and using the game to change lives through FIDE&apos;s
            Infinite Chess Project.
          </p>
        </div>
      </section>

      <div className="wrap" style={{ paddingBottom: 80 }}>
        {/* story */}
        <section className="card" style={{ padding: 30, marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 14 }}>Our story</h2>
          <div style={{ display: "grid", gap: 16, color: "var(--muted)", fontSize: 15.5, lineHeight: 1.75 }}>
            <p>
              Prochess began as a simple belief: that every Nigerian child deserves the gift
              of chess. From a base in <b style={{ color: "var(--text)" }}>Ibadan</b> — the
              White House Complex on Orogun Road — and an office in{" "}
              <b style={{ color: "var(--text)" }}>Lagos</b>, the academy has grown into a
              full chess ecosystem: structured courses for beginners to masters, daily
              puzzles, summer camps, FIDE-rated tournaments, and live broadcasts of every
              event.
            </p>
            <p>
              Our work goes far beyond the classroom. Through our schools program we bring
              chess to young people across Ibadan and Lagos. And in partnership with the
              International Chess Federation, Prochess was appointed to launch the{" "}
              <b style={{ color: "var(--text)" }}>Infinite Chess Project</b> in Nigeria —
              FIDE&apos;s programme using chess to support children with autism. When you
              play with Prochess, you&apos;re part of that mission.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 8 }}>
              {[
                ["🤝", "FIDE & NCF affiliated"],
                ["🏫", "Chess in 22+ schools"],
                ["🏆", "182 tournaments hosted"],
                ["🎥", "Live streaming platform"],
              ].map(([i, t]) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(148,180,255,.05)", border: "1px solid var(--line)", borderRadius: 12, padding: "12px 14px" }}>
                  <span style={{ fontSize: 20 }}>{i}</span>
                  <b style={{ color: "var(--text)", fontSize: 13.5 }}>{t}</b>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* founder */}
        <div className="sec-head" style={{ marginBottom: 24 }}>
          <span className="kicker">🏆 Leadership</span>
          <h2 style={{ fontSize: 28 }}>The people behind Prochess</h2>
        </div>
        <div className="grid3">
          {TEAM.map((m) => (
            <div className="card" key={m.name} style={{ padding: 28, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="ic piece" style={{ width: 62, height: 62, fontSize: 32, marginBottom: 4 }}>{m.g}</div>
              <div>
                <h3 style={{ fontSize: 19, lineHeight: 1.3 }}>{m.name}</h3>
                <div style={{ color: "var(--gold)", fontSize: 13.5, fontWeight: 800, marginTop: 4 }}>{m.role}</div>
                <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 2 }}>{m.extra}</div>
              </div>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{m.bio}</p>
              <div className="chip muted" style={{ alignSelf: "flex-start", marginTop: "auto" }}>📞 {m.phone}</div>
            </div>
          ))}
        </div>

        {/* offices */}
        <section className="card" style={{ padding: 30, marginTop: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 18 }}>Visit us</h2>
          <div className="grid3" style={{ gap: 18 }}>
            <div style={{ background: "rgba(148,180,255,.05)", border: "1px solid var(--line)", borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>🏙 Ibadan — Head Office</h3>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                White House Complex, 38 Orogun Road<br />Orogun, Ibadan, Oyo State<br />Camp venue: 38 Ifelodun Street, Orogun
              </p>
            </div>
            <div style={{ background: "rgba(148,180,255,.05)", border: "1px solid var(--line)", borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>🌆 Lagos Office</h3>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                11 Kehinde Aderiokun Street<br />Isolo, Ire-Akari, Lagos
              </p>
            </div>
            <div style={{ background: "rgba(148,180,255,.05)", border: "1px solid var(--line)", borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>📮 Contact</h3>
              <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                📞 0806 505 1323 (office)<br />✉️ prochessinc@gmail.com<br />🌐 prochessinc.com
              </p>
            </div>
          </div>
          <div className="ctas" style={{ marginTop: 24 }}>
            <Link href="/#camp" className="btn btn-primary">Join the summer camp →</Link>
            <Link href="/players" className="btn btn-ghost">See the players</Link>
          </div>
        </section>
      </div>
    </>
  );
}
