"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, MapPin, Star } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function PlayerDetailPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
      setPlayer(data);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-100" />
          <div className="h-40 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-2xl font-bold text-slate-900">Player not found</h1>
        <Button asChild className="mt-4">
          <Link href="/players">Back to Players</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/players">
          <ArrowLeft className="mr-2 h-4 w-4" /> All Players
        </Link>
      </Button>

      {/* Profile card */}
      <Card className="border-slate-200">
        <CardContent className="flex items-start gap-6 p-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-green-50">
            <span className="text-2xl font-bold text-[#1B5E20]">
              {player.full_name?.charAt(0) ?? "?"}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold text-slate-900">{player.full_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {player.fide_rating && (
                <Badge className="bg-green-50 text-[#1B5E20]">
                  <Star className="mr-1 h-3 w-3" />
                  {player.fide_rating}
                </Badge>
              )}
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-4 w-4" /> {player.country}
              </span>
              {player.role !== "student" && (
                <Badge variant="outline" className="capitalize">{player.role}</Badge>
              )}
            </div>
            {player.fide_id && (
              <a
                href={`https://ratings.fide.com/profile/${player.fide_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm text-[#1B5E20] hover:underline"
              >
                FIDE Profile <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats placeholder — real data when available */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{player.fide_rating ?? "—"}</p>
            <p className="text-xs text-slate-400">FIDE Rating</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">—</p>
            <p className="text-xs text-slate-400">Games Played</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">—</p>
            <p className="text-xs text-slate-400">Win Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
