"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Trophy,
  ArrowRight,
  Calendar,
  MapPin,
  Phone,
  ChevronRight,
  Users,
  Zap,
  Target,
  Flame,
  GraduationCap,
  Shield,
  Quote,
  Sparkles,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Tournament, Profile } from "@/lib/types";
import ChessPuzzleWidget from "@/components/ChessPuzzleWidget";
import WhatsAppButton from "@/components/WhatsAppButton";

const eventPhotos = [
  "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80",
  "https://images.unsplash.com/photo-1586165368502-1bad548bc9f5?w=800&q=80",
  "https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=800&q=80",
  "https://images.unsplash.com/photo-1523875194681-bedd468c58bf?w=800&q=80",
  "https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&q=80",
  "https://images.unsplash.com/photo-1580541631950-7282082b03fe?w=800&q=80",
  "https://images.unsplash.com/photo-1583118643789-13398c837255?w=800&q=80",
  "https://images.unsplash.com/photo-1615361200141-f45040f367be?w=800&q=80",
];

const benefits = [
  { icon: Target, title: "Critical Thinking", desc: "Chess trains your brain to think 5 moves ahead — a skill that works in school, business, and life.", stat: "5 moves ahead" },
  { icon: Zap, title: "Problem Solving", desc: "Every position is a puzzle. You learn to find solutions under pressure.", stat: "1000+ puzzles" },
  { icon: Shield, title: "Discipline", desc: "Consistent practice builds habits that stick — on and off the board.", stat: "3x weekly" },
  { icon: GraduationCap, title: "Academic Boost", desc: "Studies show chess players score higher in maths and reading comprehension.", stat: "+23% scores" },
];

const testimonials = [
  {
    text: "My son joined Prochess 6 months ago and his concentration in school has improved massively. The coaches really care.",
    name: "Mrs. Adewale",
    detail: "Parent",
    rating: 5,
  },
  {
    text: "I went from not knowing how the pieces move to winning my first tournament. Prochess made it fun.",
    name: "Chidi, age 12",
    detail: "Student",
    rating: 5,
  },
  {
    text: "The structure of the courses is what sets Prochess apart. It's not just playing — it's real learning.",
    name: "Coach Ayodeji",
    detail: "Head Coach",
    rating: 5,
  },
];

const openingLines = [
  { moves: "1. e4 e5 2. Nf3 Nc6 3. Bb5", name: "Ruy Lopez", difficulty: "Advanced" },
  { moves: "1. e4 e5 2. Nf3 Nc6 3. Bc4", name: "Italian Game", difficulty: "Intermediate" },
  { moves: "1. d4 d5 2. c4", name: "Queen's Gambit", difficulty: "Intermediate" },
  { moves: "1. e4 c5", name: "Sicilian Defense", difficulty: "Advanced" },
];

function AnimatedCounter({ target, duration = 2000, suffix = "+" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <div ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</div>;
}

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [coaches, setCoaches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [activeOpening, setActiveOpening] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % eventPhotos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOpening((prev) => (prev + 1) % openingLines.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="relative">
      {/* Floating chess pieces background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="chess-bg-piece float-animation" style={{ top: "10%", left: "5%", fontSize: 100 }}>&#9812;</div>
        <div className="chess-bg-piece float-animation-delayed" style={{ top: "30%", right: "8%", fontSize: 80 }}>&#9816;</div>
        <div className="chess-bg-piece float-animation" style={{ top: "60%", left: "10%", fontSize: 90 }}>&#9814;</div>
        <div className="chess-bg-piece float-animation-delayed" style={{ top: "80%", right: "15%", fontSize: 70 }}>&#9818;</div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1B5E20]">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <ScrollReveal>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  <Sparkles className="h-3.5 w-3.5" />
                  FIDE Infinite Chess Project Partner
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <h1 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Learn Chess.
                  <br />
                  <span className="text-[#D4AF37]">Think Bigger.</span>
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-green-100/90">
                  Nigeria&apos;s premier chess academy. Structured courses from beginner to
                  master, live tournaments, and daily puzzles — all guided by FIDE-certified coaches.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={300}>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/signup"
                    className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1B5E20] shadow-lg transition-all hover:bg-green-50 hover:shadow-xl active:scale-[0.98]"
                  >
                    Start Learning Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/live"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/20 active:scale-[0.98]"
                  >
                    Watch Live Games
                  </Link>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={400}>
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
              </ScrollReveal>
            </div>

            {/* Photo gallery */}
            <ScrollReveal delay={200}>
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
                <div className="absolute -bottom-4 -left-4 rounded-xl bg-white p-3 shadow-lg float-animation">
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
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Rotating Opening Lines Banner */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Learn openings</span>
            <div className="h-4 w-px bg-slate-200" />
            <div className="overflow-hidden">
              {openingLines.map((line, i) => (
                <div
                  key={line.name}
                  className="transition-all duration-500"
                  style={{
                    opacity: i === activeOpening ? 1 : 0,
                    transform: i === activeOpening ? "translateY(0)" : "translateY(10px)",
                    position: i === activeOpening ? "relative" : "absolute",
                  }}
                >
                  <span className="font-mono text-sm text-slate-700">{line.moves}</span>
                  <span className="ml-2 text-xs text-[#1B5E20] font-medium">{line.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { target: 500, label: "Students Trained", icon: Users },
              { target: 20, label: "Tournaments Hosted", icon: Trophy },
              { target: 22, label: "Schools Reached", icon: GraduationCap },
              { target: 4, label: "Years Running", icon: Clock },
            ].map((stat) => (
              <ScrollReveal key={stat.label}>
                <div className="text-center group">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 transition-colors group-hover:bg-[#1B5E20]">
                    <stat.icon className="h-6 w-6 text-[#1B5E20] transition-colors group-hover:text-white" />
                  </div>
                  <div className="text-3xl font-bold text-[#1B5E20]">
                    <AnimatedCounter target={stat.target} />
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Puzzle + Why Chess */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left: Puzzle Widget */}
            <ScrollReveal>
              <ChessPuzzleWidget />
            </ScrollReveal>

            {/* Right: Why Chess */}
            <div>
              <ScrollReveal>
                <div className="max-w-2xl">
                  <h2 className="font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
                    Why Chess?
                  </h2>
                  <p className="mt-3 text-lg text-slate-500">
                    Chess isn&apos;t just a game. It&apos;s a thinking tool.
                  </p>
                </div>
              </ScrollReveal>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {benefits.map((b, i) => (
                  <ScrollReveal key={b.title} delay={i * 100}>
                    <div className="tilt-card group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-[#1B5E20]/20 hover:shadow-lg hover:shadow-green-50">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 transition-colors group-hover:bg-[#1B5E20]">
                        <b.icon className="h-5 w-5 text-[#1B5E20] transition-colors group-hover:text-white" />
                      </div>
                      <h3 className="font-serif text-lg font-semibold text-slate-900">
                        {b.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {b.desc}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-[#1B5E20]">
                        <TrendingUp className="h-3 w-3" />
                        {b.stat}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
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
          </ScrollReveal>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                level: "Beginner",
                title: "Your First Moves",
                lessons: "10 lessons",
                desc: "Learn the rules, basic checkmates, and how to play your first real game with confidence.",
                color: "bg-green-50 text-green-700 border-green-200",
                icon: "♙",
              },
              {
                level: "Intermediate",
                title: "Level Up Your Game",
                lessons: "12 lessons",
                desc: "Master opening principles, tactical motifs, and simple endgames to crush your opponents.",
                color: "bg-amber-50 text-amber-700 border-amber-200",
                icon: "♘",
              },
              {
                level: "Advanced",
                title: "Tournament Ready",
                lessons: "15 lessons",
                desc: "Deep middlegame strategy, precise calculation, and tournament preparation.",
                color: "bg-red-50 text-red-700 border-red-200",
                icon: "♕",
              },
            ].map((course, i) => (
              <ScrollReveal key={course.level} delay={i * 100}>
                <Link
                  href="/courses"
                  className="tilt-card group block rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[#1B5E20]/30 hover:shadow-lg hover:shadow-green-50"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-block rounded-md border px-2.5 py-1 text-xs font-semibold ${course.color}`}>
                      {course.level}
                    </span>
                    <span className="text-2xl">{course.icon}</span>
                  </div>
                  <h3 className="mt-3 font-serif text-xl font-bold text-slate-900 group-hover:text-[#1B5E20]">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">{course.desc}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{course.lessons}</span>
                    <span className="flex items-center gap-1 text-sm font-medium text-[#1B5E20] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                      Start <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tournaments */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
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
          </ScrollReveal>
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
              : tournaments.map((t, i) => (
                  <ScrollReveal key={t.id} delay={i * 100}>
                    <Link
                      href={`/tournaments/${t.id}`}
                      className="tilt-card group block rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-[#1B5E20]/30 hover:shadow-lg hover:shadow-green-50"
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
                  </ScrollReveal>
                ))}
          </div>
        </div>
      </section>

      {/* Event Gallery */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                From Our Events
              </h2>
              <p className="mt-2 text-slate-500">
                Real moments from real tournaments and training sessions
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {eventPhotos.slice(0, 8).map((photo, i) => (
              <ScrollReveal key={photo} delay={i * 50}>
                <div
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-900 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-center font-serif text-3xl font-bold text-white">
              What People Say
            </h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 100}>
                <div className="tilt-card rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
                  <Quote className="mb-3 h-6 w-6 text-[#D4AF37]" />
                  <p className="text-sm leading-relaxed text-slate-300">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Award key={j} className="h-4 w-4 text-[#D4AF37]" />
                    ))}
                  </div>
                  <div className="mt-3 border-t border-slate-700/50 pt-4">
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.detail}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center">
              <h2 className="font-serif text-3xl font-bold text-slate-900">
                Meet Your Coaches
              </h2>
              <p className="mt-2 text-slate-500">
                FIDE-certified instructors who&apos;ve been where you want to go
              </p>
            </div>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ScrollReveal>
              <div className="tilt-card group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all">
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
            </ScrollReveal>

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
                  .map((coach, i) => (
                    <ScrollReveal key={coach.id} delay={(i + 1) * 100}>
                      <div className="tilt-card group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg">
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
                    </ScrollReveal>
                  ))}

            <ScrollReveal delay={300}>
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
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Newsletter + Summer Camp */}
      <section className="relative overflow-hidden bg-[#D4AF37]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#C5A028]" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
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
                <span className="font-bold">&#8358;8,000</span>/week
              </span>
            </div>
            <Link
              href="/summer-camp"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#2E7D32] hover:shadow-xl active:scale-[0.98]"
            >
              Register Now <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-[#1B5E20] py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="font-serif text-2xl font-bold text-white">
              Stay in the Loop
            </h2>
            <p className="mt-2 text-sm text-green-100/80">
              Get notified about tournaments, courses, and chess tips.
            </p>
            {subscribed ? (
              <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 text-white">
                <CheckCircle className="h-5 w-5" />
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-6 flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder-green-200/50 backdrop-blur transition-all focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1B5E20] transition-all hover:bg-green-50 active:scale-[0.98]"
                >
                  Subscribe
                </button>
              </form>
            )}
          </ScrollReveal>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <ScrollReveal>
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
            </ScrollReveal>
            <ScrollReveal delay={200}>
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
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  );
}
