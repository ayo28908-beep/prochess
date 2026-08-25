import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Players from the official FIDE rating list (lname = FIDE "Surname, Given" key).
  players: defineTable({
    lname: v.string(),
    name: v.string(),
    fideId: v.string(),
    fed: v.string(),
    title: v.string(),
    standard: v.number(),
    rapid: v.number(),
    blitz: v.number(),
    born: v.optional(v.number()),
  }).index("by_lname", ["lname"]),

  tournaments: defineTable({
    slug: v.string(),
    name: v.string(),
    venue: v.string(),
    timeControl: v.string(),
    prizePool: v.string(),
  }).index("by_slug", ["slug"]),

  games: defineTable({
    tournamentId: v.id("tournaments"),
    round: v.number(),
    white: v.string(), // player.lname
    black: v.string(), // player.lname
    result: v.string(), // "1-0" | "0-1" | "1/2-1/2" | "*"
    live: v.boolean(),
  })
    .index("by_tournament", ["tournamentId", "round"])
    .index("by_white", ["white"])
    .index("by_black", ["black"]),

  // App users — linked to Clerk via clerkId on sign-in.
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("student"),
      v.literal("parent"),
      v.literal("coach"),
      v.literal("admin")
    ),
    country: v.optional(v.string()),
    rating: v.optional(v.number()),
  }).index("by_clerk", ["clerkId"]),

  payments: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
    method: v.union(
      v.literal("paystack"),
      v.literal("flutterwave"),
      v.literal("bank_transfer"),
      v.literal("stripe"),
      v.literal("paypal")
    ),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  certificates: defineTable({
    userId: v.id("users"),
    course: v.string(),
    issuedAt: v.number(),
    qrSeed: v.string(),
  }).index("by_user", ["userId"]),
});
