"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Could not reach the server. Check your connection.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-stretch" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>

      {/* Branding panel */}
      <div
        className="relative hidden w-[42%] flex-col justify-between overflow-hidden p-10 lg:flex"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <div>
          <div
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border-2 font-display text-lg font-bold"
            style={{ borderColor: "rgba(255,255,255,0.5)", color: "white" }}
          >
            GWL
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
            Ghana Water Limited
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight text-white">
            Ashanti South
            <br />
            District
          </h1>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/80">
            Entry Post Attendance System — secure staff clock-in and clock-out records for the
            district office.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          Authorized personnel only. All entries are timestamped and logged.
        </div>

        {/* Decorative wave motif */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-full opacity-25"
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,120 C100,180 200,60 300,110 C400,160 500,70 600,120 L600,200 L0,200 Z"
            fill="rgba(255,255,255,0.15)"
          />
          <path
            d="M0,150 C100,90 200,190 300,140 C400,90 500,170 600,140 L600,200 L0,200 Z"
            fill="rgba(255,255,255,0.1)"
          />
        </svg>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile-only compact header */}
          <div className="mb-8 lg:hidden">
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-bold text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              GWL
            </div>
            <p className="field-label mb-1">Ghana Water Limited</p>
            <h1 className="font-display text-xl font-bold" style={{ color: "var(--primary)" }}>
              Ashanti South District
            </h1>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Entry Post Attendance System
            </p>
          </div>

          <div className="hidden lg:block">
            <p className="field-label mb-1">Sign In</p>
            <h2 className="font-display mb-1 text-2xl font-bold" style={{ color: "var(--text)" }}>
              Welcome back
            </h2>
            <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
              Enter the access password to open the attendance system.
            </p>
          </div>

          <div className="letterhead-rule mb-6 lg:hidden" />

          <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <label className="field-label mb-2 block" htmlFor="password">
                Access Password
              </label>
              <input
                id="password"
                type="password"
                autoFocus
                className="form-input"
                style={{ padding: "0.75rem 0.9rem", fontSize: "1rem" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p
                className="rounded border px-3 py-2 text-sm"
                style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
              >
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base">
              {loading ? "Verifying..." : "Enter System"}
            </button>
          </form>

          <p className="mt-10 text-center text-xs" style={{ color: "var(--muted)" }}>
            Ghana Water Limited — Ashanti South District Office
          </p>
        </div>
      </div>
    </main>
  );
}