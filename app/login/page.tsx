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
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="card w-full max-w-md p-8">
        <p className="field-label mb-1 text-center">Ghana Water Limited</p>
        <h1 className="font-display mb-1 text-center text-xl font-bold" style={{ color: "var(--primary)" }}>
          Ashanti South District
        </h1>
        <p className="mb-6 text-center text-sm" style={{ color: "var(--muted)" }}>
          Entry Post Attendance System
        </p>
        <div className="letterhead-rule mb-6" />

        <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <label className="field-label mb-1 block" htmlFor="password">
              Access Password
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded border px-3 py-2 text-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
