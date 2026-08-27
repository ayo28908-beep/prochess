"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trophy, Calendar, MapPin, ArrowLeft, Users, Clock, CheckCircle, ExternalLink } from "lucide-react";
import type { Tournament } from "@/lib/types";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("tournaments").select("*").eq("id", id).single();
      setTournament(data);

      const { count } = await supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true })
        .eq("tournament_id", id as string);
      setRegistrations(count ?? 0);

      if (user) {
        const { data: reg } = await supabase
          .from("tournament_registrations")
          .select("id")
          .eq("tournament_id", id as string)
          .eq("user_id", user.id)
          .maybeSingle();
        setRegistered(!!reg);
      }

      setLoading(false);
    }
    load();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user) {
      toast.error("Please sign in to register");
      return;
    }

    setRegistering(true);
    const { error } = await supabase.from("tournament_registrations").insert({
      tournament_id: id as string,
      user_id: user.id,
      section: "open",
      payment_status: "pending",
    });

    if (error) {
      toast.error(error.message);
    } else {
      setRegistered(true);
      setRegistrations((prev) => prev + 1);
      toast.success("Registration submitted!");
    }
    setRegistering(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-slate-100" />
          <div className="h-4 w-96 rounded bg-slate-100" />
          <div className="h-4 w-48 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-2xl font-bold text-slate-900">Tournament not found</h1>
        <Button asChild className="mt-4">
          <Link href="/tournaments">Back to Tournaments</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/tournaments">
          <ArrowLeft className="mr-2 h-4 w-4" /> All Tournaments
        </Link>
      </Button>

      <div className="flex items-center gap-3">
        <h1 className="font-serif text-3xl font-bold text-slate-900">{tournament.name}</h1>
        <Badge className={tournament.status === "upcoming" ? "bg-green-50 text-[#1B5E20]" : tournament.status === "ongoing" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}>
          {tournament.status}
        </Badge>
      </div>

      {tournament.description && <p className="mt-3 text-slate-500">{tournament.description}</p>}

      <Card className="mt-6 border-slate-200">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#1B5E20]" />
            <div>
              <p className="text-xs text-slate-400">Date</p>
              <p className="font-medium text-slate-900">
                {new Date(tournament.date).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          {tournament.venue && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#1B5E20]" />
              <div>
                <p className="text-xs text-slate-400">Venue</p>
                <p className="font-medium text-slate-900">{tournament.venue}</p>
              </div>
            </div>
          )}
          {tournament.format && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#1B5E20]" />
              <div>
                <p className="text-xs text-slate-400">Format</p>
                <p className="font-medium text-slate-900 capitalize">{tournament.format}</p>
              </div>
            </div>
          )}
          {tournament.prize_pool && (
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-[#D4AF37]" />
              <div>
                <p className="text-xs text-slate-400">Prize Pool</p>
                <p className="font-medium text-slate-900">{tournament.prize_pool}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="h-4 w-4" />
          {registrations} registered player{registrations !== 1 ? "s" : ""}
        </div>
        {tournament.lichess_broadcast_id && (
          <Button variant="outline" asChild size="sm">
            <a href={`https://lichess.org/broadcast/${tournament.lichess_broadcast_id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-4 w-4" /> Live on Lichess
            </a>
          </Button>
        )}
      </div>

      <Separator className="my-6" />

      {tournament.status === "upcoming" && tournament.registration_open && (
        <Card className="border-slate-200">
          <CardContent className="p-6 text-center">
            {registered ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-10 w-10 text-[#1B5E20]" />
                <p className="font-medium text-slate-900">You are registered!</p>
                <p className="text-sm text-slate-500">See you at the tournament.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-slate-600">Ready to compete?</p>
                <Button onClick={handleRegister} disabled={registering} className="bg-[#1B5E20] text-white hover:bg-[#2E7D32]">
                  {registering ? "Registering..." : "Register Now"}
                </Button>
                {!user && <p className="text-xs text-slate-400">You must be signed in to register</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
