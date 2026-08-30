import { Metadata } from "next";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, ExternalLink, Users, Award, Globe, Shield, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "About — Prochess Academy",
  description:
    "Prochess Academy — Nigeria's premier chess academy, FIDE Infinite Chess Project partner. Meet our founder, coaches, and mission.",
};

const team = [
  {
    name: "Olalekan Adeyemi",
    role: "Founder & CEO",
    bio: "Vice President of FIDE (International Chess Federation) and former President of the Nigeria Chess Federation (NCF). Under his leadership, Prochess partners with the FIDE Infinite Chess Project to bring structured chess education to schools and communities nationwide.",
    initials: "LA",
    highlight: true,
  },
  {
    name: "Adeyemi O. Ayodeji",
    role: "Head Coach",
    bio: "A dedicated chess educator and player who has been instrumental in coaching the next generation of Nigerian chess talent. Ayodeji brings passion and structure to every lesson, making complex concepts accessible to students of all levels.",
    phone: "0810 042 1852",
    hasPhoto: true,
  },
  {
    name: "Olumide Komolafe",
    role: "Coach",
    bio: "An experienced chess coach who has trained numerous junior players in competitive tournament play. Olumide specialises in tactical training and endgame technique, helping students develop the sharp, calculating style needed for serious competition.",
    phone: "0815 660 7576",
  },
  {
    name: "Esan Faith Toluwalase",
    role: "Coach",
    bio: "A certified FIDE Instructor who brings expertise in opening preparation and positional play. Faith is passionate about growing chess among young people and has led multiple school outreach programmes across Ibadan.",
    phone: "0903 551 9574",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
          <Shield className="h-3.5 w-3.5" />
          Since 2022
        </div>
        <h1 className="font-serif text-4xl font-bold text-slate-900">
          About Prochess
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500">
          Prochess is Nigeria&apos;s premier chess academy, dedicated to developing
          chess talent across the country. As partners of the FIDE Infinite Chess
          Project and affiliated with the Nigeria Chess Federation, we provide
          structured training from beginner to master level.
        </p>
      </div>

      {/* Mission */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200 transition-all hover:shadow-md">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <Globe className="h-5 w-5 text-[#1B5E20]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">FIDE Partner</h3>
              <p className="mt-1 text-sm text-slate-500">
                Official partner of FIDE&apos;s Infinite Chess Project
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 transition-all hover:shadow-md">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <Award className="h-5 w-5 text-[#1B5E20]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">NCF Affiliated</h3>
              <p className="mt-1 text-sm text-slate-500">
                Recognised by the Nigeria Chess Federation
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 transition-all hover:shadow-md">
          <CardContent className="flex items-start gap-3 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
              <BookOpen className="h-5 w-5 text-[#1B5E20]" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">22 Schools</h3>
              <p className="mt-1 text-sm text-slate-500">
                Chess programmes in schools across Ibadan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Our Story */}
      <Card className="mb-12 border-slate-200">
        <CardContent className="p-8">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Our Story
          </h2>
          <p className="mt-4 text-slate-500 leading-relaxed">
            Prochess started with a simple idea: every Nigerian child deserves
            access to world-class chess education. Founded by Olalekan Adeyemi —
            Vice President of FIDE and former President of the Nigeria Chess
            Federation — we partner with the FIDE Infinite Chess Project to bring
            structured, progressive chess training to schools and communities
            across Nigeria.
          </p>
          <p className="mt-3 text-slate-500 leading-relaxed">
            We believe chess develops critical thinking, discipline, and
            problem-solving skills that extend far beyond the 64 squares. Our
            coaches are FIDE-certified instructors who make learning fun while
            building real competitive skill.
          </p>
        </CardContent>
      </Card>

      {/* CEO */}
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-2xl font-bold text-slate-900">
          Leadership
        </h2>
        <Card className="border-slate-200">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#1B5E20] shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {team[0].initials}
                </span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {team[0].name}
                </h3>
                <p className="text-sm font-medium text-[#D4AF37]">
                  {team[0].role}
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <Globe className="h-3 w-3" /> Vice President, FIDE
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                    <Award className="h-3 w-3" /> Former President, NCF
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  {team[0].bio}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coaches */}
      <div className="mb-12">
        <h2 className="mb-6 font-serif text-2xl font-bold text-slate-900">
          Our Coaches
        </h2>
        <div className="space-y-4">
          {team.slice(1).map((member) => (
            <Card key={member.name} className="border-slate-200 transition-all hover:shadow-md">
              <CardContent className="flex items-start gap-6 p-6">
                {member.hasPhoto ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src="/images/tutor-ayodeji.png"
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-green-50">
                    <Users className="h-8 w-8 text-[#1B5E20]" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-semibold text-slate-900">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-[#1B5E20]">
                    {member.role}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {member.bio}
                  </p>
                  {member.phone && (
                    <a
                      href={`tel:${member.phone.replace(/\s/g, "")}`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-[#1B5E20] transition-colors hover:bg-green-100"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {member.phone}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact */}
      <Card className="border-slate-200">
        <CardContent className="p-8">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Visit Us
          </h2>
          <p className="mt-2 text-slate-500">
            Walk in for a free trial lesson. No experience needed.
          </p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <MapPin className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <div>
                <div className="font-medium">38 Ifelodun Street, Orogun, Ibadan</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <Phone className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <div>
                <a href="tel:+2348081635986" className="block hover:text-[#1B5E20]">
                  0808 163 5986
                </a>
                <a href="tel:+2348055170872" className="block hover:text-[#1B5E20]">
                  0805 517 0872
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <Mail className="h-5 w-5 text-[#1B5E20]" />
              </div>
              <a href="mailto:info@prochess.ng" className="hover:text-[#1B5E20]">
                info@prochess.ng
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
