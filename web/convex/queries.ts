import { query } from "./_generated/server";
import { v } from "convex/values";

// Full payload for a tournament: the event + its games + all known FIDE players.
// The client computes standings/perf/delta with the shared Elo engine (lib/elo.ts).
export const tournament = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const t = await ctx.db
      .query("tournaments")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!t) return null;
    const games = await ctx.db
      .query("games")
      .withIndex("by_tournament", (q) => q.eq("tournamentId", t._id))
      .collect();
    const players = await ctx.db.query("players").collect();
    return {
      tournament: { id: t._id, slug: t.slug, name: t.name, venue: t.venue, timeControl: t.timeControl, prizePool: t.prizePool },
      games: games.map((g) => ({ round: g.round, white: g.white, black: g.black, result: g.result, live: g.live })),
      players: players.map((p) => ({
        lname: p.lname, name: p.name, fideId: p.fideId, fed: p.fed, title: p.title,
        standard: p.standard, rapid: p.rapid, blitz: p.blitz, born: p.born ?? null,
      })),
    };
  },
});

// All tournaments (for the homepage "upcoming" strip / live list).
export const listTournaments = query({
  args: {},
  handler: async (ctx) => {
    const ts = await ctx.db.query("tournaments").collect();
    const withGames = await Promise.all(
      ts.map(async (t) => {
        const games = await ctx.db
          .query("games")
          .withIndex("by_tournament", (q) => q.eq("tournamentId", t._id))
          .collect();
        const finished = games.filter((g) => g.result !== "*").length;
        return {
          slug: t.slug,
          name: t.name,
          venue: t.venue,
          timeControl: t.timeControl,
          prizePool: t.prizePool,
          rounds: Math.max(0, ...games.map((g) => g.round)),
          games: games.length,
          finished,
          live: games.some((g) => g.live),
        };
      })
    );
    return withGames;
  },
});

// A player + every game they've played across all tournaments (profile page).
export const playerGames = query({
  args: { lname: v.string() },
  handler: async (ctx, { lname }) => {
    const [asWhite, asBlack] = await Promise.all([
      ctx.db.query("games").withIndex("by_white", (q) => q.eq("white", lname)).collect(),
      ctx.db.query("games").withIndex("by_black", (q) => q.eq("black", lname)).collect(),
    ]);
    const games = [...asWhite, ...asBlack].map((g) => ({
      round: g.round,
      white: g.white,
      black: g.black,
      result: g.result,
      live: g.live,
    }));
    const players = await ctx.db.query("players").collect();
    const player = players.find((p) => p.lname === lname) ?? null;
    return {
      player: player
        ? {
            lname: player.lname, name: player.name, fideId: player.fideId, fed: player.fed,
            title: player.title, standard: player.standard, rapid: player.rapid,
            blitz: player.blitz, born: player.born ?? null,
          }
        : null,
      players: players.map((p) => ({
        lname: p.lname, name: p.name, fideId: p.fideId, fed: p.fed, title: p.title,
        standard: p.standard, rapid: p.rapid, blitz: p.blitz, born: p.born ?? null,
      })),
      games,
    };
  },
});

// All players (for the leaderboard / switcher).
export const listPlayers = query({
  args: {},
  handler: async (ctx) => {
    const ps = await ctx.db.query("players").collect();
    return ps.map((p) => ({
      lname: p.lname, name: p.name, fideId: p.fideId, fed: p.fed, title: p.title,
      standard: p.standard, rapid: p.rapid, blitz: p.blitz, born: p.born ?? null,
    }));
  },
});
