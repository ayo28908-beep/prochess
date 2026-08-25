/* eslint-disable */
/**
 * GENERATED — mirrors `npx convex codegen` output so the app typechecks and builds
 * before a real Convex deployment is configured. Replace by running codegen against
 * your deployment; this file is overwritten by the CLI.
 */
import type { GenericId } from "convex/values";

export type Id<TableName extends string> = GenericId<TableName>;

export type TableNames =
  | "players"
  | "tournaments"
  | "games"
  | "users"
  | "payments"
  | "certificates";

type Player = {
  lname: string;
  name: string;
  fideId: string;
  fed: string;
  title: string;
  standard: number;
  rapid: number;
  blitz: number;
  born?: number;
};

type Tournament = {
  slug: string;
  name: string;
  venue: string;
  timeControl: string;
  prizePool: string;
};

type Game = {
  tournamentId: Id<"tournaments">;
  round: number;
  white: string;
  black: string;
  result: string;
  live: boolean;
};

type User = {
  clerkId: string;
  name: string;
  email: string;
  role: "student" | "parent" | "coach" | "admin";
  country?: string;
  rating?: number;
};

type Payment = {
  userId: Id<"users">;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  method: "paystack" | "flutterwave" | "bank_transfer" | "stripe" | "paypal";
  createdAt: number;
};

type Certificate = {
  userId: Id<"users">;
  course: string;
  issuedAt: number;
  qrSeed: string;
};

type SystemFields<TableName extends TableNames> = {
  _id: Id<TableName>;
  _creationTime: number;
};

export type DocumentByTable<TableName extends TableNames> = TableName extends "players"
  ? Player & SystemFields<"players">
  : TableName extends "tournaments"
    ? Tournament & SystemFields<"tournaments">
    : TableName extends "games"
      ? Game & SystemFields<"games">
      : TableName extends "users"
        ? User & SystemFields<"users">
        : TableName extends "payments"
          ? Payment & SystemFields<"payments">
          : Certificate & SystemFields<"certificates">;

export type Doc<TableName extends TableNames> = DocumentByTable<TableName>;

export type DataModel = {
  players: {
    document: Player & SystemFields<"players">;
    fieldPaths: "lname" | "name" | "fideId" | "fed" | "title" | "standard" | "rapid" | "blitz" | "born";
    indexes: { by_lname: ["lname"] };
    searchIndexes: {};
    vectorIndexes: {};
  };
  tournaments: {
    document: Tournament & SystemFields<"tournaments">;
    fieldPaths: "slug" | "name" | "venue" | "timeControl" | "prizePool";
    indexes: { by_slug: ["slug"] };
    searchIndexes: {};
    vectorIndexes: {};
  };
  games: {
    document: Game & SystemFields<"games">;
    fieldPaths: "tournamentId" | "round" | "white" | "black" | "result" | "live";
    indexes: {
      by_tournament: ["tournamentId", "round"];
      by_white: ["white"];
      by_black: ["black"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  users: {
    document: User & SystemFields<"users">;
    fieldPaths: "clerkId" | "name" | "email" | "role" | "country" | "rating";
    indexes: { by_clerk: ["clerkId"] };
    searchIndexes: {};
    vectorIndexes: {};
  };
  payments: {
    document: Payment & SystemFields<"payments">;
    fieldPaths: "userId" | "amount" | "currency" | "status" | "method" | "createdAt";
    indexes: { by_user: ["userId"] };
    searchIndexes: {};
    vectorIndexes: {};
  };
  certificates: {
    document: Certificate & SystemFields<"certificates">;
    fieldPaths: "userId" | "course" | "issuedAt" | "qrSeed";
    indexes: { by_user: ["userId"] };
    searchIndexes: {};
    vectorIndexes: {};
  };
};
