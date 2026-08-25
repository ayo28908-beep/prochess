import type { Metadata } from "next";
import PlayerProfile from "@/components/PlayerProfile";

const fmtTitle = (lname: string) => {
  const i = lname.indexOf(",");
  return i >= 0 ? lname.slice(i + 1).trim() + " " + lname.slice(0, i).trim() : lname;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const lname = decodeURIComponent(name);
  return {
    title: `${fmtTitle(lname)} — FIDE Profile & Match History`,
    description: `${fmtTitle(lname)}'s FIDE profile — official rating, title, head-to-head records and game-by-game Elo performance from Prochess tournaments.`,
    alternates: { canonical: `/players/${name}` },
  };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <PlayerProfile lname={decodeURIComponent(name)} />;
}
