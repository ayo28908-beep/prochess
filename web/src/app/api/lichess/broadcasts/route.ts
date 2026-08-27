import { NextResponse } from "next/server";
import { fetchBroadcasts } from "@/lib/lichess";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await fetchBroadcasts();
  return NextResponse.json(data);
}
