"use client";

import { useEffect, useState } from "react";

export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-GB");

  return (
    <div className="text-right">
      <div className="mono text-lg font-semibold leading-none" style={{ color: "var(--primary)" }}>
        {timeStr}
      </div>
      <div className="text-xs" style={{ color: "var(--muted)" }}>
        {dateStr}
      </div>
    </div>
  );
}
