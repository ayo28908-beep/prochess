import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, ExternalLink, Users, Award, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Prochess Academy — Nigeria's premier chess academy, FIDE Infinite Chess Project partner.",
};

const team = [
  {
    name: "Olalekan Adeyemi",
    role: "Founder & CEO",
    bio: "Vice President of FIDE (International Chess Federation) and former President of the Nigeria Chess Federation (NCF). Olalekan has been a driving force in developing chess across Nigeria and Africa. Under his leadership, Prochess partners with the FIDE Infinite Chess Project to bring structured chess education to schools and communities nationwide.",
    highlight: true,
  },
  {
    name: "Adeyemi O. Ayodeji",
    role: "Head Coach",
    bio: "A dedicated chess educator and player who has been instrumental in coaching the next generation of Nigerian chess talent. Ayodeji brings passion and structure to every lesson, making complex concepts accessible to students of all levels.",
    phone: "0810 042 1852",
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
      <Card className="mb-12 border-slate-200">
        <CardContent className="p-8">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Our Mission
          </h2>
          <p className="mt-4 text-slate-500 leading-relaxed">
            To make world-class chess education accessible to every Nigerian.
            We believe chess develops critical thinking, discipline, and
            problem-solving skills that extend far beyond the 64 squares. Through
            our partnership with FIDE&apos;s Infinite Chess Project, we are building
            a generation of strong, strategic thinkers.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Globe className="h-5 w-5 text-[#1B5E20]" />
              FIDE Partner
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Award className="h-5 w-5 text-[#1B5E20]" />
              NCF Affiliated
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Users className="h-5 w-5 text-[#1B5E20]" />
              Coaching since 2020
            </div>
          </div>
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
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#1B5E20]">
                <span className="text-2xl font-bold text-white">LA</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Olalekan Adeyemi
                </h3>
                <p className="text-sm font-medium text-[#D4AF37]">
                  Founder &amp; CEO
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Globe className="h-3 w-3" /> Vice President, FIDE
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <Award className="h-3 w-3" /> Former President, Nigeria Chess Federation
                </p>
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
            <Card key={member.name} className="border-slate-200">
              <CardContent className="flex items-start gap-6 p-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-50">
                  <Users className="h-8 w-8 text-[#1B5E20]" />
                </div>
                <div>
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
                      className="mt-2 inline-flex items-center gap-1 text-sm text-[#1B5E20] hover:underline"
                    >
                      <Phone className="h-3 w-3" />
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
            Contact Us
          </h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <MapPin className="h-5 w-5 text-[#1B5E20]" />
              38 Ifelodun Street, Orogun, Ibadan
            </div>
            <a
              href="tel:+2348081635986"
              className="flex items-center gap-3 text-sm text-slate-600 hover:text-[#1B5E20]"
            >
              <Phone className="h-5 w-5 text-[#1B5E20]" />
              0808 163 5986
            </a>
            <a
              href="tel:+2348055170872"
              className="flex items-center gap-3 text-sm text-slate-600 hover:text-[#1B5E20]"
            >
              <Phone className="h-5 w-5 text-[#1B5E20]" />
              0805 517 0872
            </a>
            <a
              href="mailto:info@prochess.ng"
              className="flex items-center gap-3 text-sm text-slate-600 hover:text-[#1B5E20]"
            >
              <Mail className="h-5 w-5 text-[#1B5E20]" />
              info@prochess.ng
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
