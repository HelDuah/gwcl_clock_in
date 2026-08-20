"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Could not change password." });
      } else {
        setMessage({ type: "success", text: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Could not reach the server." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="card max-w-lg p-5">
        <p className="field-label mb-4">Change Access Password</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label mb-1 block">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="field-label mb-1 block">New Password</label>
            <input
              type="password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>
          <div>
            <label className="field-label mb-1 block">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={4}
            />
          </div>

          {message && (
            <p
              className="rounded border px-3 py-2 text-sm"
              style={{
                borderColor: message.type === "success" ? "var(--success)" : "var(--danger)",
                color: message.type === "success" ? "var(--success)" : "var(--danger)",
              }}
            >
              {message.text}
            </p>
          )}

          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : "Update Password"}
          </button>
        </form>
      </section>

      <section className="card max-w-lg p-5">
        <p className="field-label mb-2">About This System</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Ghana Water Limited — Ashanti South District Entry Post Attendance System. Data is stored
          securely in a Supabase database and accessible from any authorized device.
        </p>
      </section>
    </div>
  );
}
