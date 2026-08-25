/* eslint-disable */
/**
 * GENERATED — mirrors `npx convex codegen` output. Replace by running codegen
 * against your deployment; this file is overwritten by the CLI.
 */
import type { ApiFromModules, FilterApi, FunctionReference } from "convex/server";
import { anyApi } from "convex/server";
import type * as queries from "../queries.js";
import type * as seed from "../seed.js";

const fullApi: ApiFromModules<{
  queries: typeof queries;
  seed: typeof seed;
}> = anyApi as any;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export const api: FilterApi<typeof fullApi, FunctionReference<any, "public">> =
  anyApi as any;
