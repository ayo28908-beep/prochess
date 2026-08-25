import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import DemoSignIn from "@/components/DemoSignIn";

export const metadata: Metadata = {
  title: "Create a free account",
  description: "Join Prochess Academy free — courses, daily puzzles, live tournaments and certified coaching for kids and adults.",
  alternates: { canonical: "/sign-up" },
};

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <div
        className="wrap"
        style={{ paddingTop: 150, paddingBottom: 80, display: "grid", placeItems: "center" }}
      >
        <DemoSignIn mode="up" />
      </div>
    );
  }
  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: "70vh", padding: "150px 24px 60px" }}>
      <SignUp />
    </div>
  );
}
