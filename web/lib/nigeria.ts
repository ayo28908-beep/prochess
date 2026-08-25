// Runtime data layer for the full Nigerian FIDE player database.
// The JSONs live in /public — copied from tools/fide-nigeria.mjs and
// tools/fetch-rating-history.mjs output. Fetched lazily so the JS bundle
// stays lean (the files are ~300KB + ~700KB).
"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/lib/elo";

export type NigeriaEntry = {
  fideId: string;
  name: string;
  fed: string;
  title: string;
  standard: number;
  rapid: number;
  blitz: number;
  born?: number | null;
};

export type HistoryEntry = {
  name: string;
  fideId: string;
  months: { month: string; rating: number }[];
};

export const nigeriaToPlayer = (p: NigeriaEntry): Player => ({
  lname: p.name,
  name: p.name,
  fideId: p.fideId,
  fed: p.fed,
  title: p.title,
  standard: p.standard,
  rapid: p.rapid,
  blitz: p.blitz,
  born: p.born ?? null,
});

export function useNigeriaPlayers(): { players: Player[] | null; loading: boolean } {
  const [players, setPlayers] = useState<Player[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/fide-nigeria.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { players: NigeriaEntry[] }) => {
        if (alive) setPlayers((d.players ?? d as unknown as NigeriaEntry[]).map(nigeriaToPlayer));
      })
      .catch(() => alive && setPlayers([]));
    return () => {
      alive = false;
    };
  }, []);
  return { players, loading: players === null };
}

export function useRatingHistory(): {
  history: Record<string, HistoryEntry> | null;
  loading: boolean;
} {
  const [history, setHistory] = useState<Record<string, HistoryEntry> | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/fide-rating-history.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { players: Record<string, HistoryEntry> }) => {
        if (alive) setHistory(d.players ?? (d as unknown as Record<string, HistoryEntry>));
      })
      .catch(() => alive && setHistory({}));
    return () => {
      alive = false;
    };
  }, []);
  return { history, loading: history === null };
}

const MONTHS3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const labelOf = (ym: string) => {
  const [y, m] = ym.split("-");
  return `${MONTHS3[+m - 1]} '${y.slice(2)}`;
};
