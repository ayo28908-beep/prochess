import type { Metadata } from "next";
import PlayerDirectory from "@/components/PlayerDirectory";

export const metadata: Metadata = {
  title: "Player Profiles — Nigerian FIDE-Rated Chess Players",
  description:
    "Browse real FIDE-rated Nigerian chess players with official ratings, titles, head-to-head records and game-by-game Elo performance from Prochess tournaments.",
  alternates: { canonical: "/players" },
};

export default function PlayersPage() {
  return <PlayerDirectory />;
}
