"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LiveClock from "./LiveClock";

const NAV_ITEMS = [
  { href: "/", label: "Clocking" },
  { href: "/register", label: "Register" },
  { href: "/generate", label: "Generate" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="card mb-6">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="field-label mb-1">Ghana Water Limited</p>
          <h1 className="font-display text-xl font-bold sm:text-2xl" style={{ color: "var(--primary)" }}>
            Ashanti South District — Entry Post Attendance System
          </h1>
        </div>
        <div className="flex items-start gap-4">
          <LiveClock />
          <ThemeToggle />
        </div>
      </div>
      <div className="letterhead-rule" />
      <nav className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
        <div className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-1.5 text-sm font-semibold"
                style={{
                  backgroundColor: active ? "var(--primary)" : "transparent",
                  color: active ? "white" : "var(--text)",
                  border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <button onClick={handleLogout} className="btn-outline btn text-xs px-3 py-1.5">
          Log Out
        </button>
      </nav>
    </header>
  );
}
