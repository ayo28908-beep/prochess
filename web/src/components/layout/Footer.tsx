import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, ExternalLink, Play } from "lucide-react";

const quickLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/summer-camp", label: "Summer Camp" },
  { href: "/players", label: "Player Directory" },
  { href: "/about", label: "About Us" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/images/logo.png"
                alt="Prochess"
                width={36}
                height={33}
                className="h-9 w-auto"
              />
              <div>
                <span className="text-lg font-bold text-slate-900">Prochess</span>
                <span className="block text-[10px] font-medium uppercase tracking-widest text-[#D4AF37]">
                  Chess Academy
                </span>
              </div>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Nigeria&apos;s premier chess academy. FIDE Infinite Chess Project partner.
              NCF affiliated. Building champions across Nigeria.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Quick Links</h3>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-500 transition-colors hover:text-[#1B5E20]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://chessstream-africa.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-orange-600"
                >
                  <Play className="h-3 w-3" />
                  Live Broadcasts
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Contact</h3>
            <ul className="mt-3 space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1B5E20]" />
                38 Ifelodun Street, Orogun, Ibadan
              </li>
              <li>
                <a
                  href="tel:+2348081635986"
                  className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-[#1B5E20]"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#1B5E20]" />
                  0808 163 5986
                </a>
              </li>
              <li>
                <a
                  href="tel:+2348055170872"
                  className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-[#1B5E20]"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#1B5E20]" />
                  0805 517 0872
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@prochess.ng"
                  className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-[#1B5E20]"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#1B5E20]" />
                  info@prochess.ng
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Prochess Academy. FIDE &amp; NCF Affiliated.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://chessstream-africa.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-orange-600"
              >
                <ExternalLink className="h-3 w-3" />
                ChessStream Africa
              </Link>
              <Link
                href="https://www.fide.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-[#1B5E20]"
              >
                <ExternalLink className="h-3 w-3" />
                FIDE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
