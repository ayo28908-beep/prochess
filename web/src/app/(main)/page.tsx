"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Zap,
  Target,
  Flame,
  GraduationCap,
  Shield,
  Quote,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Tournament, Profile } from "@/lib/types";

const eventPhotos = [
  "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80", // chess tournament hall
  "https://images.unsplash.com/photo-1586165368502-1bad548bc9f5?w=800&q=80", // chess pieces close-up
  "https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=800&q=80", // kids playing chess
  "https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=800&q=80", // chess board overhead
  "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&q=80", // chess clock
  "https://images.unsplash.com/photo-1580541631950-7282082b03fe?w=800&q=80", // chess strategy
  "https://images.unsplash.com/photo-1583118643789-13398c837255?w=800&q=80", // chess match
  "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80", // chess competition
  "https://images.unsplash.com/photo-1577401132921-cb39bb0adcff?w=800&q=80", // chess training
];

const benefits = [
  { icon: Target, title: "Critical Thinking", desc: "Chess trains your brain to think 5 moves ahead — a skill that works in school, business, and life." },
  { icon: Zap, title: "Problem Solving", desc: "Every position is a puzzle. You learn to find solutions under pressure." },
  { icon: Shield, title: "Discipline", desc: "Consistent practice builds habits that stick — on and off the board." },
  { icon: GraduationCap, title: "Academic Boost", desc: "Studies show chess players score higher in maths and reading comprehension." },
];

const testimonials = [
  {
    text: "The structure of the courses is what sets Prochess apart. It's not just playing — it's real learning.",
    name: "Ayodeji",
    detail: "Head Coach",
  },
];


export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [coaches, setCoaches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

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

  // Auto-rotate gallery photos
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % eventPhotos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B5E20]">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                <Shield className="h-3.5 w-3.5" />
                FIDE Infinite Chess Project Partner
              </div>
              <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Learn Chess.
                <br />
                <span className="text-[#D4AF37]">Think Bigger.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-green-100/90">
                Nigeria&apos;s premier chess academy. Structured courses from beginner to
                master, live tournaments, and daily puzzles — all guided by FIDE-certified coaches.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1B5E20] shadow-lg transition-all hover:bg-green-50 hover:shadow-xl active:scale-[0.98]"
                >
                  Start Learning Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="https://chessstream-africa.vercel.app"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 active:scale-[0.98]"
                >
                  Watch Live Games
                </Link>
              </div>

              {/* Trust signals */}
              <div className="mt-10 flex items-center gap-6 text-sm text-green-200/70">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  <span>500+ students trained</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4" />
                  <span>20+ tournaments</span>
                </div>
              </div>
            </div>

            {/* Photo gallery */}
            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                {eventPhotos.map((photo, i) => (
                  <Image
                    key={photo}
                    src={photo}
                    alt="Prochess chess event"
                    fill
                    className={`object-cover transition-all duration-700 ${
                      i === activePhoto ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ))}
                {/* Photo dots */}
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {eventPhotos.slice(0, 6).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === activePhoto ? "w-6 bg-white" : "w-2 bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <Flame className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-500">Summer Camp</div>
                    <div className="text-sm font-bold text-slate-900">Register Now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1B5E20]">
                500+
              </div>
              <div className="mt-1 text-sm text-slate-500">Students Trained</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1B5E20]">
                20+
              </div>
              <div className="mt-1 text-sm text-slate-500">Tournaments Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1B5E20]">
                22+
              </div>
              <div className="mt-1 text-sm text-slate-500">Schools Reached</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#1B5E20]">
                4+
              </div>
              <div className="mt-1 text-sm text-slate-500">Years Running</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Chess */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
              Why Chess?
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Chess isn&apos;t just a game. It&apos;s a thinking tool.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[#1B5E20]/20 hover:shadow-lg hover:shadow-green-50"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 transition-colors group-hover:bg-[#1B5E20]">
                  <b.icon className="h-6 w-6 text-[#1B5E20] transition-colors group-hover:text-white" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-slate-900">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                Start Learning
              </h2>
              <p className="mt-2 text-slate-500">
                Three levels, structured curriculum, real progress
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline sm:flex"
            >
              All courses <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                level: "Beginner",
                title: "Your First Moves",
                lessons: "10 lessons",
                desc: "Learn the rules, basic checkmates, and how to play your first real game with confidence.",
                color: "bg-green-50 text-green-700 border-green-200",
              },
              {
                level: "Intermediate",
                title: "Level Up Your Game",
                lessons: "12 lessons",
                desc: "Master opening principles, tactical motifs, and simple endgames to crush your opponents.",
                color: "bg-amber-50 text-amber-700 border-amber-200",
              },
              {
                level: "Advanced",
                title: "Tournament Ready",
                lessons: "15 lessons",
                desc: "Deep middlegame strategy, precise calculation, and tournament preparation.",
                color: "bg-red-50 text-red-700 border-red-200",
              },
            ].map((course) => (
              <Link
                key={course.level}
                href="/courses"
                className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[#1B5E20]/30 hover:shadow-lg hover:shadow-green-50"
              >
                <span className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${course.color}`}>
                  {course.level}
                </span>
                <h3 className="mt-3 font-serif text-xl font-bold text-slate-900 group-hover:text-[#1B5E20]">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">{course.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{course.lessons}</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-[#1B5E20] opacity-0 transition-opacity group-hover:opacity-100">
                    Start <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                Upcoming Tournaments
              </h2>
              <p className="mt-2 text-slate-500">
                Compete, improve, and win
              </p>
            </div>
            <Link
              href="/tournaments"
              className="hidden items-center gap-1 text-sm font-medium text-[#1B5E20] hover:underline sm:flex"
            >
              All tournaments <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="border-slate-200">
                    <CardContent className="p-6">
                      <Skeleton className="mb-3 h-6 w-3/4" />
                      <Skeleton className="mb-2 h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))
              : tournaments.length === 0
              ? (
                <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-slate-500">No upcoming tournaments yet.</p>
                  <p className="text-sm text-slate-400">Check back soon!</p>
                </div>
              )
              : tournaments.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tournaments/${t.id}`}
                    className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[#1B5E20]/30 hover:shadow-lg hover:shadow-green-50"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-serif text-lg font-bold text-slate-900 group-hover:text-[#1B5E20]">
                        {t.name}
                      </h3>
                      <Badge className="shrink-0 bg-green-50 text-[#1B5E20]">
                        {t.status}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(t.date).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      {t.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {t.venue}
                        </div>
                      )}
                      {t.prize_pool && (
                        <div className="flex items-center gap-2">
                          <Trophy className="h-3.5 w-3.5 text-slate-400" />
                          {t.prize_pool}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[#1B5E20]">
                      Register <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Event Gallery */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              From Our Events
            </h2>
            <p className="mt-2 text-slate-500">
              Real moments from real tournaments and training sessions
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {eventPhotos.slice(0, 8).map((photo, i) => (
              <div
                key={photo}
                className={`relative overflow-hidden rounded-xl ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <Image
                  src={photo}
                  alt={`Prochess event photo ${i + 1}`}
                  width={400}
                  height={300}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-white">
            What People Say
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6"
              >
                <Quote className="mb-3 h-6 w-6 text-[#D4AF37]" />
                <p className="text-sm leading-relaxed text-slate-300">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-4 border-t border-slate-700/50 pt-4">
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Meet Your Coaches
            </h2>
            <p className="mt-2 text-slate-500">
              FIDE-certified instructors who&apos;ve been where you want to go
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Ayodeji - with real photo */}
            <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:shadow-lg">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src="/images/tutor-ayodeji.png"
                  alt="Adeyemi O. Ayodeji"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg font-bold text-slate-900">Ayodeji</h3>
                <p className="text-sm font-medium text-[#1B5E20]">Head Coach</p>
                <a href="tel:08100421852" className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-[#1B5E20]">
                  <Phone className="h-3 w-3" /> 0810 042 1852
                </a>
              </div>
            </div>

            {/* Other coaches from DB */}
            {loading
              ? Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-6">
                    <Skeleton className="mb-3 h-24 w-24 rounded-full" />
                    <Skeleton className="mb-2 h-5 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))
              : coaches
                  .filter((c) => !c.full_name?.includes("Ayodeji"))
                  .map((coach) => (
                    <div
                      key={coach.id}
                      className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg"
                    >
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 transition-colors group-hover:bg-[#1B5E20]">
                        <Users className="h-8 w-8 text-[#1B5E20] transition-colors group-hover:text-white" />
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-900">
                        {coach.full_name}
                      </h3>
                      <p className="text-sm font-medium text-[#1B5E20]">Coach</p>
                      {coach.phone && (
                        <a
                          href={`tel:${coach.phone.replace(/\s/g, "")}`}
                          className="mt-2 flex items-center gap-1 text-xs text-slate-500 hover:text-[#1B5E20]"
                        >
                          <Phone className="h-3 w-3" /> {coach.phone}
                        </a>
                      )}
                    </div>
                  ))}

            {/* FIDE badge */}
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D4AF37]/30 bg-[#D4AF37]/5 p-6 text-center">
              <Image
                src="/images/logo.png"
                alt="Prochess"
                width={48}
                height={44}
                className="mb-3 opacity-60"
              />
              <p className="font-serif text-sm font-semibold text-slate-700">
                FIDE Infinite Chess
              </p>
              <p className="text-xs text-slate-500">Project Partner</p>
              <a
                href="https://www.fide.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-xs font-medium text-[#1B5E20] hover:underline"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Summer Camp CTA */}
      <section className="relative overflow-hidden bg-[#D4AF37]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#C5A028]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
            <Flame className="h-3.5 w-3.5" />
            Happening Now
          </div>
          <h2 className="mt-4 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            Prochess Summer Camp
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-800">
            Intensive chess training for kids and teens. Play tournament games,
            learn from certified coaches, earn certificates.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-800/80">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              10 - 28 August
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              Ibadan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold">₦8,000</span>/week
            </span>
          </div>
          <Link
            href="/summer-camp"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#2E7D32] hover:shadow-xl active:scale-[0.98]"
          >
            Register Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                Come Visit Us
              </h2>
              <p className="mt-3 text-slate-500">
                Walk in for a free trial lesson. No experience needed.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    <MapPin className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Address</div>
                    <div className="text-sm text-slate-500">38 Ifelodun Street, Orogun, Ibadan</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                    <Phone className="h-5 w-5 text-[#1B5E20]" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Phone</div>
                    <a href="tel:+2348081635986" className="block text-sm text-slate-500 hover:text-[#1B5E20]">
                      0808 163 5986
                    </a>
                    <a href="tel:+2348055170872" className="block text-sm text-slate-500 hover:text-[#1B5E20]">
                      0805 517 0872
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <Image src="/images/logo.png" alt="Prochess" width={80} height={74} className="mx-auto mb-4" />
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  Ready to Start?
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Your first lesson is free. Just walk in or sign up online.
                </p>
                <Link
                  href="/signup"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#2E7D32] active:scale-[0.98]"
                >
                  Sign Up Free <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
