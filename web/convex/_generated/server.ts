/**
 * GENERATED — mirrors `npx convex codegen` output. Replace by running codegen
 * against your deployment; this file is overwritten by the CLI.
 */
import {
  queryGeneric,
  mutationGeneric,
} from "convex/server";
import type {
  MutationBuilder,
  QueryBuilder,
  GenericMutationCtx,
  GenericQueryCtx,
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 *
 * This function will be allowed to read your Convex database and will be accessible from the client.
 */
export const query: QueryBuilder<DataModel, "public"> = queryGeneric;

/**
 * Define a mutation in this Convex app's public API.
 *
 * This function will be allowed to modify your Convex database and will be accessible from the client.
 */
export const mutation: MutationBuilder<DataModel, "public"> = mutationGeneric;

/** A set of services for use within Convex query functions. */
export type QueryCtx = GenericQueryCtx<DataModel>;

/** A set of services for use within Convex mutation functions. */
export type MutationCtx = GenericMutationCtx<DataModel>;

/** An interface to read from the database within Convex query functions. */
export type DatabaseReader = GenericDatabaseReader<DataModel>;

/** An interface to read from and write to the database within Convex mutation functions. */
export type DatabaseWriter = GenericDatabaseWriter<DataModel>;
