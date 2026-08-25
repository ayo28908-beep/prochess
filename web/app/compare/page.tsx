import type { Metadata } from "next";
import { Suspense } from "react";
import CompareTool from "@/components/CompareTool";

export const metadata: Metadata = {
  title: "Compare Players — Head-to-Head Ratings & History",
  description:
    "Compare any two Nigerian FIDE-rated players side by side — ratings, titles, real FIDE rating history and head-to-head records.",
  alternates: { canonical: "/compare" },
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: 200, textAlign: "center", color: "var(--muted)" }}>Loading…</div>}>
      <CompareTool />
    </Suspense>
  );
}
