import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Clock, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Courses",
  description: "Learn chess from beginner to advanced with structured courses.",
};

const levelColors: Record<string, string> = {
  beginner: "bg-green-50 text-[#1B5E20]",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

export default async function CoursesPage() {
  const supabase = await createServerClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("order_index");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold text-slate-900">Courses</h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Structured chess education from your first move to tournament readiness.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {courses?.map((course) => (
          <Card key={course.id} className="border-slate-200 transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
                <BookOpen className="h-6 w-6 text-[#1B5E20]" />
              </div>
              <Badge className={`mb-3 w-fit ${levelColors[course.level] ?? "bg-slate-100 text-slate-600"}`}>
                {course.level}
              </Badge>
              <h3 className="font-serif text-xl font-bold text-slate-900">{course.title}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-500">{course.description}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.total_lessons} lessons
                </span>
                {course.duration_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration_hours}h
                  </span>
                )}
              </div>
              <Button asChild className="mt-4 w-full bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
                <Link href={`/courses/${course.id}`}>
                  Start Learning <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {(!courses || courses.length === 0) && (
          <Card className="col-span-full border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-500">Courses coming soon. Check back later.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
