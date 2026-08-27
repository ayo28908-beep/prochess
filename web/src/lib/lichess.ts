import type { LichessBroadcast, LichessBroadcastRound, LichessGame } from "./types";

const LICHESS_API = "https://lichess.org/api";

export async function fetchBroadcasts(): Promise<{
  featured: LichessBroadcast[];
  upcoming: LichessBroadcast[];
  recent: LichessBroadcast[];
}> {
  try {
    const res = await fetch(`${LICHESS_API}/broadcast`, {
      headers: { Accept: "application/x-ndjson" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[Lichess] Non-OK response:", res.status, res.statusText);
      return { featured: [], upcoming: [], recent: [] };
    }

    const text = await res.text();
    const lines = text.trim().split("\n").filter(Boolean);
    const broadcasts: LichessBroadcast[] = [];

    for (const line of lines) {
      try {
        broadcasts.push(JSON.parse(line));
      } catch {
        // skip malformed line
      }
    }

    const now = Date.now();
    const featured: LichessBroadcast[] = [];
    const upcoming: LichessBroadcast[] = [];
    const recent: LichessBroadcast[] = [];

    for (const b of broadcasts) {
      if (!b.rounds || b.rounds.length === 0) continue;
      const hasFinished = b.rounds.some((r) => r.finished);
      const sorted = [...b.rounds].sort((a, c) => (c.startsAt ?? 0) - (a.startsAt ?? 0));
      const latest = sorted[0];

      if (hasFinished || (latest.startsAt && latest.startsAt <= now)) {
        recent.push(b);
      } else {
        upcoming.push(b);
      }
    }

    if (recent.length > 0) {
      featured.push(
        recent.sort((a, b) => (b.tour.tier ?? 0) - (a.tour.tier ?? 0))[0]
      );
    }

    return { featured, upcoming, recent };
  } catch (e) {
    console.error("[Lichess] fetchBroadcasts failed:", e);
    return { featured: [], upcoming: [], recent: [] };
  }
}

export async function fetchRoundGames(
  roundId: string
): Promise<LichessGame[]> {
  try {
    // Lichess broadcast round endpoint: /api/broadcast/-/-/roundId
    const res = await fetch(`${LICHESS_API}/broadcast/-/-/${roundId}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[Lichess] Round fetch failed:", res.status);
      return [];
    }

    const data = await res.json();

    // New API returns JSON with games array
    if (data.games && Array.isArray(data.games)) {
      return data.games.map((g: Record<string, unknown>): LichessGame => {
        const players = (g.players ?? []) as Array<{
          name?: string;
          rating?: number;
          title?: string;
          fideId?: string;
          fed?: string;
          clock?: number;
        }>;

        return {
          id: (g.id as string) || "unknown",
          players: players.map((p) => ({
            name: p.name,
            rating: p.rating,
            title: p.title,
            fideId: p.fideId ? String(p.fideId) : undefined,
          })),
          fen: (g.fen as string) || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          moves: "",
          status: (g.status as string) || "*",
          winner: (g.status as string) === "1-0" ? "white" : (g.status as string) === "0-1" ? "black" : undefined,
          lastMove: g.lastMove as string | undefined,
          nbMoves: undefined,
        };
      });
    }

    // Fallback: try to parse as PGN text
    const text = JSON.stringify(data);
    return parsePgnGames(text);
  } catch (e) {
    console.error("[Lichess] fetchRoundGames failed:", e);
    return [];
  }
}

export function getBestRound(broadcast: LichessBroadcast): LichessBroadcastRound | null {
  if (!broadcast.rounds || broadcast.rounds.length === 0) return null;
  const sorted = [...broadcast.rounds].sort(
    (a, b) => (b.startsAt ?? 0) - (a.startsAt ?? 0)
  );
  // Prefer a finished round, then any round with games, then most recent
  const finishedWithGames = sorted.find((r) => r.finished && (r.nbGames ?? 0) > 0);
  if (finishedWithGames) return finishedWithGames;
  const finished = sorted.find((r) => r.finished);
  if (finished) return finished;
  const withGames = sorted.find((r) => (r.nbGames ?? 0) > 0);
  if (withGames) return withGames;
  return sorted[0];
}

function parsePgnGames(pgnText: string): LichessGame[] {
  const games: LichessGame[] = [];
  const gameBlocks = pgnText.split("\n\n[Event").filter(Boolean);

  for (const block of gameBlocks) {
    const fullBlock = block.startsWith("[Event") ? block : "[Event" + block;
    const headers: Record<string, string> = {};
    const headerRegex = /\[(\w+)\s+"([^"]*?)"\]/g;
    let match;

    while ((match = headerRegex.exec(fullBlock)) !== null) {
      headers[match[1]] = match[2];
    }

    const players = [];
    if (headers.White) {
      players.push({
        name: headers.White,
        rating: headers.WhiteElo ? parseInt(headers.WhiteElo) : undefined,
        title: headers.WhiteTitle || undefined,
        fideId: headers.WhiteFideId || undefined,
      });
    }
    if (headers.Black) {
      players.push({
        name: headers.Black,
        rating: headers.BlackElo ? parseInt(headers.BlackElo) : undefined,
        title: headers.BlackTitle || undefined,
        fideId: headers.BlackFideId || undefined,
      });
    }

    const result = headers.Result || "*";
    let winner: "white" | "black" | undefined;
    if (result === "1-0") winner = "white";
    else if (result === "0-1") winner = "black";

    games.push({
      id: headers.LichessRoundId || headers.GameId || `game-${games.length}`,
      players,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: "",
      status: result,
      winner,
      opening: headers.Opening ? { name: headers.Opening } : undefined,
      nbMoves: undefined,
    });
  }

  return games;
}
