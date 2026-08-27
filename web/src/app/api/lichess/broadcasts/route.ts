import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("https://lichess.org/api/broadcast", {
      headers: { Accept: "application/x-ndjson" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ featured: [], upcoming: [], recent: [], error: `Lichess ${res.status}` });
    }

    const text = await res.text();
    const lines = text.trim().split("\n").filter(Boolean);
    const broadcasts: Record<string, unknown>[] = [];

    for (const line of lines) {
      try {
        broadcasts.push(JSON.parse(line));
      } catch { /* skip */ }
    }

    const now = Date.now();

    const recent = broadcasts.filter((b) => {
      const rounds = b.rounds as Array<{ startsAt?: number; finished?: boolean }> | undefined;
      if (!rounds?.length) return false;
      // A broadcast is "recent" if it has any finished round OR its latest round started in the past
      const hasFinished = rounds.some((r) => r.finished);
      const sorted = [...rounds].sort((a, c) => (c.startsAt ?? 0) - (a.startsAt ?? 0));
      return hasFinished || (sorted[0].startsAt && sorted[0].startsAt <= now);
    });

    const upcoming = broadcasts.filter((b) => {
      const rounds = b.rounds as Array<{ startsAt?: number; finished?: boolean }> | undefined;
      if (!rounds?.length) return true;
      const hasFinished = rounds.some((r) => r.finished);
      const sorted = [...rounds].sort((a, c) => (c.startsAt ?? 0) - (a.startsAt ?? 0));
      return !hasFinished && (!sorted[0].startsAt || sorted[0].startsAt > now);
    });

    const featured = recent.length > 0 ? [recent[0]] : [];

    return NextResponse.json({ featured, upcoming, recent });
  } catch (e: unknown) {
    return NextResponse.json({ featured: [], upcoming: [], recent: [], error: e instanceof Error ? e.message : String(e) });
  }
}
