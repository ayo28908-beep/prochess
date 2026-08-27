"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, ArrowRight } from "lucide-react";
import type { Profile } from "@/lib/types";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("role", "admin")
        .order("fide_rating", { ascending: false, nullsFirst: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (search) {
        query = query.ilike("full_name", `%${search}%`);
      }

      const { data } = await query;
      setPlayers(data ?? []);
      setLoading(false);
    }
    load();
  }, [search, page]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl font-bold text-slate-900">Players</h1>
      <p className="mt-3 text-slate-500">Browse registered players in the Prochess community.</p>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-10"
        />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-slate-200">
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          : players.map((p) => (
              <Link key={p.id} href={`/players/${p.id}`}>
                <Card className="border-slate-200 transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50">
                      <span className="text-lg font-bold text-[#1B5E20]">
                        {p.full_name?.charAt(0) ?? "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-medium text-slate-900">{p.full_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        {p.fide_rating && (
                          <Badge variant="outline" className="text-xs">
                            {p.fide_rating}
                          </Badge>
                        )}
                        <span>{p.country}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </CardContent>
                </Card>
              </Link>
            ))}

        {!loading && players.length === 0 && (
          <Card className="col-span-full border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-slate-500">
                {search ? "No players found matching your search." : "No players registered yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {!loading && players.length === pageSize && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-slate-400">Page {page + 1}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
