import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Student Dashboard — Progress, Ratings & Certificates",
  description:
    "Your Prochess student dashboard — rating history from real FIDE data, course progress, certificates, match history and achievements.",
  alternates: { canonical: "/dashboard" },
};

export default function DashboardPage() {
  const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  return <Dashboard clerkEnabled={clerkEnabled} />;
}
