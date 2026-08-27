import { NextResponse } from "next/server";
import { fetchRoundGames } from "@/lib/lichess";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await params;
  const games = await fetchRoundGames(roundId);
  return NextResponse.json({ games });
}
