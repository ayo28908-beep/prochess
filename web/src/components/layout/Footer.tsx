import Link from "next/link";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";

const quickLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/live", label: "Live Broadcasts" },
  { href: "/summer-camp", label: "Summer Camp" },
  { href: "/players", label: "Player Directory" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <svg
                viewBox="0 0 32 32"
                className="h-7 w-7 text-[#1B5E20]"
                fill="currentColor"
              >
                <path d="M16 2C14.5 2 13 3 13 4.5V6H10V4.5C10 3 8.5 2 7 2S4 3 4 4.5V6L2 8V12H30V8L28 6V4.5C28 3 26.5 2 25 2S22 3 22 4.5V6H19V4.5C19 3 17.5 2 16 2ZM4 14V28C4 29.1 4.9 30 6 30H26C27.1 30 28 29.1 28 28V14H4ZM10 26H8V18H10V26ZM16 26H14V16H16V26ZM22 26H20V20H22V26Z" />
              </svg>
              <span className="text-lg font-bold text-slate-900">Prochess</span>
            </div>
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
                href="https://lichess.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-[#1B5E20]"
              >
                <ExternalLink className="h-3 w-3" />
                Lichess Partner
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
