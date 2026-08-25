"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { STREAM_URL, STREAM_NAME } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#academy", label: "Academy" },
  { href: "/#puzzles", label: "Puzzles" },
  { href: "/live", label: "Tournaments" },
  { href: "/players", label: "Players" },
  { href: "/compare", label: "Compare" },
  { href: "/#camp", label: "Summer Camp" },
  { href: "/#blog", label: "Blog" },
  { href: "/analyze", label: "Analyze" },
];

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      setLoggedIn(!!localStorage.getItem("prochess_user"));
    } catch {
      setLoggedIn(false);
    }
  }, []);

  const isOn = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("#")[0]);

  return (
    <header className={`site ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap nav">
        <Link href="/" className="logo">
          <img src="/prochess-logo.png" alt="PROCHESS" className="brandlogo" />
          Pro<b>chess</b>
        </Link>
        <nav className="navlinks" aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={isOn(l.href) ? "on" : ""}>
              {l.label}
            </Link>
          ))}
          <a href={STREAM_URL} target="_blank" rel="noopener noreferrer" title={STREAM_NAME}>
            ▶ {STREAM_NAME}
          </a>
        </nav>
        <div className="navcta">
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            {loggedIn ? "My dashboard" : "Log in"}
          </Link>
          <button className="burger" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
            ☰
          </button>
        </div>
      </div>
      <div className={`wrap mobilemenu ${open ? "open" : ""}`}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <a href={STREAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          ▶ {STREAM_NAME}
        </a>
        <Link href="/analyze" onClick={() => setOpen(false)}>
          Analyze games
        </Link>
        <Link href="/dashboard" onClick={() => setOpen(false)}>
          {loggedIn ? "My dashboard" : "Log in / Dashboard"}
        </Link>
      </div>
    </header>
  );
}
