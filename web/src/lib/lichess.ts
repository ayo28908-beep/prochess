import type { LichessBroadcast, LichessGame } from "./types";

const LICHESS_API = "https://lichess.org/api";

export async function fetchBroadcasts(): Promise<{
  featured: LichessBroadcast[];
  upcoming: LichessBroadcast[];
  recent: LichessBroadcast[];
}> {
  try {
    const res = await fetch(`${LICHESS_API}/broadcast`, {
      headers: { Accept: "application/x-ndjson" },
    });
    if (!res.ok) return { featured: [], upcoming: [], recent: [] };

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

    // Classify broadcasts
    const featured = broadcasts.slice(0, 1);
    const upcoming = broadcasts.filter(
      (b) => !b.round.startsAt || new Date(b.round.startsAt) > new Date()
    );
    const recent = broadcasts.filter(
      (b) => b.round.startsAt && new Date(b.round.startsAt) <= new Date()
    );

    return { featured, upcoming, recent };
  } catch {
    return { featured: [], upcoming: [], recent: [] };
  }
}

export async function fetchRoundGames(
  roundId: string
): Promise<LichessGame[]> {
  try {
    const res = await fetch(`${LICHESS_API}/broadcast/round/${roundId}`, {
      headers: { Accept: "application/x-chess-pgn" },
    });
    if (!res.ok) return [];

    const text = await res.text();
    return parsePgnGames(text);
  } catch {
    return [];
  }
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

    // Extract moves (everything after headers)
    const movesMatch = fullBlock.match(/\]\s*\n([\s\S]*?)$/);
    const rawMoves = movesMatch ? movesMatch[1].trim() : "";
    const moves = rawMoves
      .replace(/\{[^}]*\}/g, "")
      .replace(/\d+\.\.\./g, "")
      .replace(/\d+\./g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Extract eval from annotations
    const evalRegex = /\[%eval ([^\]]+)\]/g;
    const evals: string[] = [];
    let evalMatch;
    while ((evalMatch = evalRegex.exec(rawMoves)) !== null) {
      evals.push(evalMatch[1]);
    }

    const players = [];
    if (headers.White) {
      players.push({
        name: headers.White,
        rating: headers.WhiteElo ? parseInt(headers.WhiteElo) : undefined,
        title: headers.WhiteTitle || undefined,
        fideId: headers.WhiteFideId || undefined,
        userId: headers.White === headers.White ? undefined : undefined,
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

    const moveList = moves.split(" ").filter(
      (m) => m && !/^\d+\.+$/.test(m) && m !== "..." && m !== "*"
    );

    games.push({
      id: headers.LichessRoundId || headers.GameId || `game-${games.length}`,
      players,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      moves: moveList.join(" "),
      status: headers.Result || "*",
      winner,
      opening: headers.Opening ? { name: headers.Opening } : undefined,
      lastMove: moveList[moveList.length - 1],
      nbMoves: moveList.length,
    });
  }

  return games;
}
