import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import DemoSignIn from "@/components/DemoSignIn";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Prochess account — track progress, ratings, certificates and tournament results.",
  alternates: { canonical: "/sign-in" },
};

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div
        className="wrap"
        style={{ paddingTop: 150, paddingBottom: 80, display: "grid", placeItems: "center" }}
      >
        <DemoSignIn mode="in" />
      </div>
    );
  }
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "70vh", padding: "150px 24px 60px" }}>
      <SignIn />
    </div>
  );
}
