import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { BookOpen, Clock, CheckCircle, ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.from("courses").select("title").eq("id", id).single();
  return { title: data?.title ?? "Course" };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", id).single();
  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", id)
    .order("order_index");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All Courses
        </Link>
      </Button>

      <Badge className="mb-3 bg-green-50 text-[#1B5E20]">{course.level}</Badge>
      <h1 className="font-serif text-3xl font-bold text-slate-900">{course.title}</h1>
      <p className="mt-3 text-slate-500">{course.description}</p>

      <div className="mt-4 flex items-center gap-4 text-sm text-slate-400">
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          {course.total_lessons} lessons
        </span>
        {course.duration_hours && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration_hours} hours
          </span>
        )}
      </div>

      <Separator className="my-8" />

      <h2 className="font-serif text-xl font-bold text-slate-900">Lessons</h2>

      {lessons && lessons.length > 0 ? (
        <div className="mt-4 space-y-3">
          {lessons.map((lesson, i) => (
            <Card key={lesson.id} className="border-slate-200">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-[#1B5E20]">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{lesson.title}</h3>
                  {lesson.duration_minutes && (
                    <p className="text-xs text-slate-400">{lesson.duration_minutes} min</p>
                  )}
                </div>
                {lesson.video_url ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={lesson.video_url} target="_blank" rel="noopener noreferrer">
                      Watch
                    </a>
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-slate-400">Coming soon</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-4 border-slate-200">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="mb-3 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">Lessons are being prepared. Check back soon.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
