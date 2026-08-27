import { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trophy, Calendar, MapPin, Users, ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Tournaments",
  description: "Browse and register for upcoming chess tournaments in Nigeria.",
};

const statusColors: Record<string, string> = {
  upcoming: "bg-green-50 text-[#1B5E20]",
  ongoing: "bg-amber-50 text-amber-700",
  completed: "bg-slate-100 text-slate-600",
};

export default async function TournamentsPage() {
  const supabase = await createServerClient();
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .order("date", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold text-slate-900">Tournaments</h1>
      <p className="mt-3 max-w-2xl text-slate-500">
        Compete in official tournaments across Nigeria. Swiss pairings, live standings, and real results.
      </p>

      <div className="mt-10 space-y-6">
        {tournaments?.map((t) => (
          <Card key={t.id} className="border-slate-200 transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-xl font-bold text-slate-900">{t.name}</h3>
                  <Badge className={statusColors[t.status] ?? "bg-slate-100 text-slate-600"}>
                    {t.status}
                  </Badge>
                </div>
                {t.description && (
                  <p className="mt-2 text-sm text-slate-500">{t.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(t.date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  {t.venue && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {t.venue}
                    </span>
                  )}
                  {t.prize_pool && (
                    <span className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      {t.prize_pool}
                    </span>
                  )}
                  {t.format && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {t.format}
                    </span>
                  )}
                </div>
              </div>
              <Button asChild className="shrink-0 bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
                <Link href={`/tournaments/${t.id}`}>
                  {t.status === "upcoming" ? "Register" : "View"} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}

        {(!tournaments || tournaments.length === 0) && (
          <Card className="border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Trophy className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-500">No tournaments listed yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
