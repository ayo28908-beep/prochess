"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Trophy,
  Puzzle,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Phone,
  ChevronRight,
  Users,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Tournament, Profile } from "@/lib/types";

const features = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description:
      "Beginner to advanced courses with video lessons, interactive puzzles, and homework.",
  },
  {
    icon: Trophy,
    title: "Live Tournaments",
    description:
      "Real-time broadcasts from Lichess, Swiss pairings, and standings updated live.",
  },
  {
    icon: Puzzle,
    title: "Daily Puzzles",
    description:
      "Sharpen your tactics with rated puzzles, daily challenges, and puzzle streaks.",
  },
];

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [coaches, setCoaches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [tournRes, coachRes] = await Promise.all([
        supabase
          .from("tournaments")
          .select("*")
          .eq("status", "upcoming")
          .order("date", { ascending: true })
          .limit(3),
        supabase
          .from("profiles")
          .select("*")
          .eq("role", "coach")
          .order("full_name"),
      ]);

      setTournaments(tournRes.data ?? []);
      setCoaches(coachRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B5E20] text-white">
        <div className="absolute inset-0 bg-[url('/images/chess-pattern.svg')] opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="mb-4 border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]">
              FIDE Infinite Chess Project Partner
            </Badge>
            <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Nigeria&apos;s Premier
              <br />
              Chess Academy
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-green-100">
              Learn chess with Nigeria&apos;s best coaches. Structured courses, live
              tournaments, daily puzzles — everything you need to become a champion.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-[#1B5E20] hover:bg-green-50"
              >
                <Link href="/courses">
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/live">
                  Watch Live
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-slate-900">
            Everything You Need
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500">
            From your first move to tournament preparation
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="border-slate-200 transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                    <f.icon className="h-6 w-6 text-[#1B5E20]" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {f.description}
                  </p>
                  <Link
                    href={
                      f.title === "Structured Courses"
                        ? "/courses"
                        : f.title === "Live Tournaments"
                        ? "/live"
                        : "/puzzles"
                    }
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline"
                  >
                    Learn more <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                Upcoming Tournaments
              </h2>
              <p className="mt-2 text-slate-500">
                Register now and compete with the best
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/tournaments">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-slate-200">
                    <CardContent className="p-6">
                      <Skeleton className="mb-3 h-6 w-3/4" />
                      <Skeleton className="mb-2 h-4 w-1/2" />
                      <Skeleton className="mb-2 h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </CardContent>
                  </Card>
                ))
              : tournaments.length === 0
              ? (
                <Card className="col-span-full border-slate-200">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-slate-500">
                      No upcoming tournaments yet. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )
              : tournaments.map((t) => (
                  <Card
                    key={t.id}
                    className="border-slate-200 transition-shadow hover:shadow-md"
                  >
                    <CardContent className="p-6">
                      <div className="mb-3 flex items-start justify-between">
                        <h3 className="font-serif text-lg font-semibold text-slate-900">
                          {t.name}
                        </h3>
                        <Badge className="shrink-0 bg-green-50 text-[#1B5E20]">
                          {t.format}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {new Date(t.date).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        {t.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {t.venue}
                          </div>
                        )}
                        {t.prize_pool && (
                          <div className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-slate-400" />
                            {t.prize_pool}
                          </div>
                        )}
                      </div>
                      <Button asChild className="mt-4 w-full bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
                        <Link href={`/tournaments/${t.id}`}>Register</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-slate-900">
            Meet Our Coaches
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500">
            Experienced chess educators dedicated to your growth
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="mx-auto mb-4 h-24 w-24 rounded-full" />
                    <Skeleton className="mx-auto mb-2 h-6 w-32" />
                    <Skeleton className="mx-auto h-4 w-24" />
                  </div>
                ))
              : coaches.map((c) => (
                  <div key={c.id} className="text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-50">
                      <Users className="h-10 w-10 text-[#1B5E20]" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-slate-900">
                      {c.full_name}
                    </h3>
                    <p className="text-sm text-slate-500">Coach</p>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone.replace(/\s/g, "")}`}
                        className="mt-2 inline-flex items-center gap-1 text-sm text-[#1B5E20] hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </a>
                    )}
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* Summer Camp CTA */}
      <section className="bg-[#D4AF37]/10 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge className="mb-4 border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]">
            August 2026
          </Badge>
          <h2 className="font-serif text-3xl font-bold text-slate-900">
            Prochess Summer Camp
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Intensive chess training for kids and teens. Learn from certified coaches,
            play tournament games, and earn certificates.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-[#D4AF37]" />
              10 - 28 August
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-[#D4AF37]" />
              Ibadan
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-[#D4AF37]" />
              ₦8,000/week
            </span>
          </div>
          <Button asChild size="lg" className="mt-8 bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
            <Link href="/summer-camp">
              Register Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-slate-900">
            Get In Touch
          </h2>
          <div className="mx-auto mt-8 max-w-xl space-y-4 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-[#1B5E20]" />
              38 Ifelodun Street, Orogun, Ibadan
            </div>
            <a
              href="tel:+2348081635986"
              className="flex items-center justify-center gap-2 hover:text-[#1B5E20]"
            >
              <Phone className="h-5 w-5 text-[#1B5E20]" />
              0808 163 5986
            </a>
            <a
              href="tel:+2348055170872"
              className="flex items-center justify-center gap-2 hover:text-[#1B5E20]"
            >
              <Phone className="h-5 w-5 text-[#1B5E20]" />
              0805 517 0872
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
