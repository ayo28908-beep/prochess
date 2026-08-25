import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

// Clerk is fully wired but only activates once real keys are added to .env.local —
// without them, ClerkProvider would throw, so render children directly instead.
export default function ClerkProviderGuard({ children }: { children: ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return <>{children}</>;
  return <ClerkProvider>{children}</ClerkProvider>;
}
