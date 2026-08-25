"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Demo sign-in: until Clerk keys are added to .env.local this gives a working
// login that stores the account locally and lands on the dashboard (which shows
// real seeded data in demo mode). Swap-in the Clerk <SignIn/> flow the moment
// keys exist — the page already does that automatically.
export default function DemoSignIn({ mode = "in" }: { mode?: "in" | "up" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "up" && !name.trim()) {
      setError("Enter your full name to create the account.");
      return;
    }
    localStorage.setItem(
      "prochess_user",
      JSON.stringify({ name: name.trim() || "Chess Player", email: email.trim() })
    );
    router.push("/dashboard");
  };

  return (
    <div
      className="card"
      style={{ width: "100%", maxWidth: 420, padding: 36, textAlign: "left" }}
    >
      <div
        style={{
          width: 54, height: 54, borderRadius: 16, display: "grid", placeItems: "center",
          fontSize: 28, marginBottom: 16,
          background: "linear-gradient(135deg,var(--green2),var(--green))",
          boxShadow: "0 10px 28px rgba(34,197,94,.35)",
        }}
      >
        ♞
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.4 }}>
        {mode === "in" ? "Welcome back" : "Create your free account"}
      </h2>
      <p style={{ color: "var(--muted)", fontSize: 13.5, margin: "8px 0 22px" }}>
        {mode === "in"
          ? "Sign in to track ratings, certificates and tournament results."
          : "Join Prochess — courses, puzzles, tournaments and certified coaching."}
      </p>

      <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
        {mode === "up" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            aria-label="Full name"
            style={inputStyle}
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          aria-label="Email address"
          style={inputStyle}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          aria-label="Password"
          style={inputStyle}
        />
        {error && (
          <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>
        )}
        <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
          {mode === "in" ? "Sign in →" : "Create account →"}
        </button>
      </form>

      <div style={{ marginTop: 18, fontSize: 13.5, color: "var(--muted)" }}>
        {mode === "in" ? (
          <>
            New here? <Link href="/sign-up" style={{ color: "var(--green)", fontWeight: 700 }}>Create a free account</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/sign-in" style={{ color: "var(--green)", fontWeight: 700 }}>Sign in</Link>
          </>
        )}
      </div>

      <div
        style={{
          marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--line)",
          color: "var(--muted)", fontSize: 12, lineHeight: 1.6,
        }}
      >
        <b style={{ color: "var(--text)" }}>Demo mode</b> — real accounts with
        password reset and profile sync unlock when the Clerk keys are added (see the
        go-live steps). For now this saves your account on this device.
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: 12, fontSize: 14.5,
  background: "rgba(255,255,255,.05)", border: "1px solid var(--line2)",
  color: "var(--text)", outline: "none",
};
