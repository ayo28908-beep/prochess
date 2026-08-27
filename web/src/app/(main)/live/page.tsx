"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle, Play, Radio } from "lucide-react";
import dynamic from "next/dynamic";

const Chessboard = dynamic(() => import("react-chessboard").then((m) => m.Chessboard), { ssr: false });

import type { LichessBroadcast, LichessGame } from "@/lib/types";
import { getBestRound } from "@/lib/lichess";

export default function LivePage() {
  const [broadcasts, setBroadcasts] = useState<{ featured: LichessBroadcast[]; upcoming: LichessBroadcast[]; recent: LichessBroadcast[] }>({ featured: [], upcoming: [], recent: [] });
  const [selectedBroadcast, setSelectedBroadcast] = useState<LichessBroadcast | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [games, setGames] = useState<LichessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGames = async (roundId: string) => {
    setGamesLoading(true);
    try {
      const res = await fetch(`/api/lichess/round/${roundId}`);
      const data = await res.json();
      setGames(data.games ?? []);
    } catch {
      setGames([]);
    }
    setGamesLoading(false);
  };

  const loadBroadcasts = useCallback(async () => {
    try {
      const res = await fetch("/api/lichess/broadcasts");
      const data = await res.json();
      setBroadcasts(data);

      // Auto-select first featured/recent broadcast
      if (!selectedBroadcast) {
        const first = data.featured?.[0] ?? data.recent?.[0];
        if (first) {
          setSelectedBroadcast(first);
          const round = getBestRound(first);
          if (round) {
            setSelectedRoundId(round.id);
            loadGames(round.id);
          }
        }
      }
      setLoading(false);
    } catch {
      setError("Failed to load broadcasts. Please try again.");
      setLoading(false);
    }
  }, [selectedBroadcast]);

  useEffect(() => {
    loadBroadcasts();
    const interval = setInterval(loadBroadcasts, 30000);
    return () => clearInterval(interval);
  }, [loadBroadcasts]);

  useEffect(() => {
    if (selectedRoundId) {
      loadGames(selectedRoundId);
      const interval = setInterval(() => loadGames(selectedRoundId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRoundId]);

  const allBroadcasts = [...broadcasts.featured, ...broadcasts.recent, ...broadcasts.upcoming];
  const currentRounds = selectedBroadcast?.rounds ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-4xl font-bold text-slate-900">Live Broadcasts</h1>
          <p className="mt-2 text-slate-500">
            Real-time chess games from tournaments worldwide via Lichess
          </p>
        </div>
        <Button variant="outline" onClick={() => { setLoading(true); loadBroadcasts(); }}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="live" className="mt-8">
        <TabsList>
          <TabsTrigger value="live">Live &amp; Recent</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 p-6">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
                <Button size="sm" variant="outline" onClick={() => { setError(null); loadBroadcasts(); }}>Retry</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Broadcast selector */}
              <div className="mb-4 flex flex-wrap gap-2">
                {allBroadcasts.map((b) => {
                  const round = getBestRound(b);
                  return (
                    <Button
                      key={b.tour.id}
                      variant={selectedBroadcast?.tour.id === b.tour.id ? "default" : "outline"}
                      size="sm"
                      className={selectedBroadcast?.tour.id === b.tour.id ? "bg-[#1B5E20] text-white" : ""}
                      onClick={() => {
                        setSelectedBroadcast(b);
                        if (round) {
                          setSelectedRoundId(round.id);
                        }
                      }}
                    >
                      <Radio className="mr-1 h-3 w-3" />
                      {b.tour.name}
                      {b.tour.tier && b.tour.tier >= 5 && (
                        <Badge className="ml-1 bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] px-1">Tier {b.tour.tier}</Badge>
                      )}
                    </Button>
                  );
                })}
                {allBroadcasts.length === 0 && (
                  <p className="text-sm text-slate-500">No broadcasts available right now.</p>
                )}
              </div>

              {/* Round selector */}
              {currentRounds.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-1">
                  {currentRounds.sort((a, b) => (b.startsAt ?? 0) - (a.startsAt ?? 0)).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoundId(r.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedRoundId === r.id
                          ? "bg-[#1B5E20] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {r.name}
                      {r.finished && <span className="ml-1 text-green-200">&#10003;</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Games grid */}
              {gamesLoading && games.length === 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-slate-200">
                      <CardContent className="p-4">
                        <Skeleton className="mb-2 h-48 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : games.length === 0 ? (
                <Card className="border-slate-200">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Play className="mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-slate-500">No games in this round yet.</p>
                    <p className="text-xs text-slate-400">Select a different round or broadcast.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {broadcasts.upcoming.map((b) => {
              const round = getBestRound(b);
              return (
                <Card key={b.tour.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <h3 className="font-serif font-bold text-slate-900">{b.tour.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{b.tour.info?.format}</p>
                    {b.tour.info?.location && (
                      <p className="text-xs text-slate-400">{b.tour.info.location}</p>
                    )}
                    <Badge className="mt-2 bg-amber-50 text-amber-700">Upcoming</Badge>
                  </CardContent>
                </Card>
              );
            })}
            {broadcasts.upcoming.length === 0 && (
              <p className="text-sm text-slate-500">No upcoming broadcasts.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GameCard({ game }: { game: LichessGame }) {
  const white = game.players?.[0];
  const black = game.players?.[1];

  return (
    <Card className="border-slate-200 transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Players */}
        <div className="mb-3 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-900">
              {white?.title && <span className="mr-1 text-xs text-[#D4AF37]">{white.title}</span>}
              {white?.name ?? "White"}
              {white?.rating && <span className="ml-1 text-xs text-slate-400">{white.rating}</span>}
            </span>
            {game.winner === "white" && <span className="text-xs font-bold text-[#1B5E20]">1</span>}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">
              {black?.title && <span className="mr-1 text-xs text-[#D4AF37]">{black.title}</span>}
              {black?.name ?? "Black"}
              {black?.rating && <span className="ml-1 text-xs text-slate-400">{black.rating}</span>}
            </span>
            {game.winner === "black" && <span className="text-xs font-bold text-[#1B5E20]">1</span>}
          </div>
        </div>

        {/* Chessboard */}
        <div className="mx-auto" style={{ maxWidth: 200 }}>
          <Chessboard
            options={{
              position: game.fen,
              canDragPiece: () => false,
              animationDurationInMs: 0,
              boardStyle: { borderRadius: "4px", boxShadow: "none", width: 200 },
            }}
          />
        </div>

        {/* Info */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {game.opening?.name && <span className="mr-2">{game.opening.name}</span>}
            {game.nbMoves && <span>{Math.ceil(game.nbMoves / 2)} moves</span>}
          </div>
          <span className="text-sm font-bold text-[#1B5E20]">{game.status}</span>
        </div>
      </CardContent>
    </Card>
  );
}
