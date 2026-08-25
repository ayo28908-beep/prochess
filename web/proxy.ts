import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// No-op passthrough until CLERK_SECRET_KEY is configured (see .env.example).
const proxy = process.env.CLERK_SECRET_KEY
  ? clerkMiddleware((auth, req) => {
      if (isProtectedRoute(req)) auth.protect();
    })
  : () => undefined;

export default proxy;

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
