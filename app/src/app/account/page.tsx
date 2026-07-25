"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { getSyncState, syncNow, useCollections, type SyncState } from "@/lib/store";

export default function AccountPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [sync, setSync] = useState<{ state: SyncState; detail: string }>({ state: "off", detail: "" });
  const { collections } = useCollections();

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    void sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) void syncNow();
    });
    const onSync = () => setSync(getSyncState());
    window.addEventListener("ans:sync", onSync);
    onSync();
    return () => {
      sub.subscription.unsubscribe();
      window.removeEventListener("ans:sync", onSync);
    };
  }, []);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !email.trim()) return;
    setBusy(true);
    setMsg("");
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/account` : undefined },
    });
    setBusy(false);
    setMsg(error ? `⚠️ ${error.message}` : "✓ Check your email — we sent you a sign-in link.");
  };

  const signOut = async () => {
    await getSupabase()?.auth.signOut();
    setSession(null);
  };

  const totalNames = collections.reduce((n, c) => n + c.names.length, 0);

  if (!supabaseConfigured) {
    return (
      <section className="section" style={{ paddingTop: 36 }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h1 style={{ fontSize: "2rem" }}>Account</h1>
          <div className="note-banner" style={{ marginTop: 16 }}>
            Cloud sync isn&apos;t configured on this deployment yet. The app works fully — favorites are stored in
            this browser. To enable accounts and cross-device sync, set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (see README &ldquo;Cloud sync&rdquo;).
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: 36 }}>
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: "2rem" }}>Account</h1>

        {!session ? (
          <div className="card" style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <p style={{ color: "var(--text-dim)", margin: 0 }}>
              Sign in with your email — no password needed. Your favorites sync across every device you sign into.
            </p>
            <form onSubmit={sendLink} style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
              />
              <button className="btn btn-aurora" type="submit" disabled={busy || !email.includes("@")}>
                {busy ? <span className="spin" /> : "Send link"}
              </button>
            </form>
            {msg && <p style={{ margin: 0, fontSize: "0.9rem" }}>{msg}</p>}
          </div>
        ) : (
          <div className="card" style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <div>
              <b>{session.user.email}</b>
              <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", margin: "4px 0 0" }}>
                {collections.length} collection{collections.length === 1 ? "" : "s"} · {totalNames} saved name{totalNames === 1 ? "" : "s"}
              </p>
            </div>
            <div style={{ fontSize: "0.9rem" }}>
              Sync:{" "}
              {sync.state === "syncing" ? "⏳ syncing…" :
               sync.state === "synced" ? `✅ up to date${sync.detail ? ` (${sync.detail})` : ""}` :
               sync.state === "error" ? `⚠️ ${sync.detail}` : "—"}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={async () => {
                  const r = await syncNow();
                  if (!r.ok) setMsg(`⚠️ ${r.message}`);
                }}
              >
                Sync now
              </button>
              <button className="btn btn-ghost btn-sm" onClick={signOut}>Sign out</button>
            </div>
            {msg && <p style={{ margin: 0, fontSize: "0.9rem" }}>{msg}</p>}
            <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", margin: 0 }}>
              Local-first: everything keeps working offline; the cloud copy is a backup and bridge between your devices.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
