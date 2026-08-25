import { mutation } from "./_generated/server";
import { seedPlayers, seedTournaments } from "./seedData";

// Idempotent seed: wipes the players/tournaments/games tables, then loads the
// real data exported by ProChess/tools/export-seed.mjs.
// Run with: npx convex run seed:run
export const run = mutation(async (ctx) => {
  for (const t of await ctx.db.query("tournaments").collect()) await ctx.db.delete(t._id);
  for (const p of await ctx.db.query("players").collect()) await ctx.db.delete(p._id);

  const players = await Promise.all(
    seedPlayers.map((p) =>
      ctx.db.insert("players", { ...p, born: p.born ?? undefined })
    )
  );

  const inserted: string[] = [];
  for (const t of seedTournaments) {
    const tid = await ctx.db.insert("tournaments", {
      slug: t.slug,
      name: t.name,
      venue: t.venue,
      timeControl: t.timeControl,
      prizePool: t.prizePool,
    });
    for (const g of t.games) {
      await ctx.db.insert("games", {
        tournamentId: tid,
        round: g.round,
        white: g.white,
        black: g.black,
        result: g.result,
        live: g.live,
      });
      inserted.push(g.result);
    }
  }

  return {
    players: players.length,
    tournaments: seedTournaments.length,
    games: inserted.length,
  };
});
