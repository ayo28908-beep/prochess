"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, BookOpen, Trophy, Puzzle, LogOut, ArrowRight } from "lucide-react";
import type { Profile, Tournament, Course, CourseProgress } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [profileRes, tournamentRes, coursesRes, progressRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user!.id).single(),
        supabase
          .from("tournament_registrations")
          .select("*, tournaments(*)")
          .eq("user_id", user!.id)
          .order("registered_at", { ascending: false }),
        supabase.from("courses").select("*").order("order_index"),
        supabase.from("course_progress").select("*").eq("user_id", user!.id),
      ]);

      setProfile(profileRes.data);

      // Extract tournaments from registrations
      const regs = tournamentRes.data ?? [];
      setTournaments(regs.map((r: Record<string, unknown>) => r.tournaments).filter(Boolean) as Tournament[]);

      setCourses(coursesRes.data ?? []);
      setProgress(progressRes.data ?? []);
      setLoading(false);
    }

    load();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-100" />
          <div className="h-40 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  const getCourseProgress = (courseId: string) => {
    const completed = progress.filter((p) => p.course_id === courseId && p.completed).length;
    const total = courses.find((c) => c.id === courseId)?.total_lessons ?? 1;
    return { completed, total, pct: Math.round((completed / total) * 100) };
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Dashboard</h1>
        <Button variant="ghost" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      {/* Profile card */}
      <Card className="mt-6 border-slate-200">
        <CardContent className="flex items-center gap-6 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1B5E20]">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-slate-900">
              {profile?.full_name ?? user.email}
            </h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-1 flex items-center gap-2">
              {profile?.fide_rating && (
                <Badge className="bg-green-50 text-[#1B5E20]">{profile.fide_rating}</Badge>
              )}
              {profile?.country && <Badge variant="outline">{profile.country}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {/* My Courses */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-900">My Courses</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/courses">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
            {courses.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No courses yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {courses.map((course) => {
                  const p = getCourseProgress(course.id);
                  return (
                    <div key={course.id} className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 shrink-0 text-[#1B5E20]" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{course.title}</p>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
                          <div
                            className="h-1.5 rounded-full bg-[#1B5E20]"
                            style={{ width: `${p.pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{p.pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Tournaments */}
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-slate-900">My Tournaments</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tournaments">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
            {tournaments.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No tournament registrations yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {tournaments.map((t) => (
                  <div key={t.id} className="flex items-center gap-3">
                    <Trophy className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(t.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
          <Link href="/puzzles">
            <Puzzle className="h-6 w-6 text-[#1B5E20]" />
            <span className="text-sm">Daily Puzzle</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
          <Link href="https://chessstream-africa.vercel.app">
            <Trophy className="h-6 w-6 text-[#D4AF37]" />
            <span className="text-sm">Live Games</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto flex-col gap-2 py-6">
          <Link href="/summer-camp">
            <BookOpen className="h-6 w-6 text-[#1B5E20]" />
            <span className="text-sm">Summer Camp</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
