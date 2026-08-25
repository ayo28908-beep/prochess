import type { Metadata } from "next";
import LiveTournament from "@/components/LiveTournament";

// Matches the slug seeded from the DGT LiveChess export (tools/export-seed.mjs).
export const DEFAULT_SLUG = "NIGERIA CHESS OLYMPIAD QUALIFIERS 2026 OPEN";

export const metadata: Metadata = {
  title: "Live Standings & Pairings — Nigeria Chess Olympiad Qualifiers 2026",
  description:
    "Live tournament standings, pairings and results for the Nigeria Chess Olympiad Qualifiers 2026 Open — with real FIDE ratings, performance ratings and Elo changes.",
  alternates: { canonical: "/live" },
};

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  return <LiveTournament slug={slug || DEFAULT_SLUG} />;
}
