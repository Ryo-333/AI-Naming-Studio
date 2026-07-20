"use client";

import { useRef, useState } from "react";
import { loadSettings } from "@/lib/store";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "I'm writing an anime where the main character represents rebirth.",
  "We're expecting a girl in November — we love nature names.",
  "My D&D party needs a name for their airship.",
  "I'm naming a cozy coffee shop with a book theme.",
];

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : <span key={i}>{part}</span>,
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const s = loadSettings();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next,
          ...(s.provider !== "auto" && (s.apiKey || s.provider === "local")
            ? { provider: s.provider, apiKey: s.apiKey || undefined, baseUrl: s.baseUrl || undefined }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
      setTimeout(() => bottom.current?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  };

  return (
    <section className="section" style={{ paddingTop: 36 }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: "2rem" }}>Naming Expert</h1>
        <p style={{ color: "var(--text-dim)" }}>
          Talk it through. The expert asks the right questions, then recommends names with the story behind each.
        </p>

        <div className="chat-box">
          {messages.length === 0 && (
            <div style={{ display: "grid", gap: 8, padding: "24px 0" }}>
              {STARTERS.map((s) => (
                <button key={s} className="chip" style={{ justifyContent: "flex-start", textAlign: "left" }} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className="bubble" data-role={m.role}>
              {m.content.split("\n").map((line, j) => (
                <p key={j} style={{ margin: line.trim() ? "0.3em 0" : 0 }}>{renderInline(line)}</p>
              ))}
            </div>
          ))}
          {busy && (
            <div className="bubble" data-role="assistant">
              <span className="spin" />
            </div>
          )}
          <div ref={bottom} />
        </div>

        {error && <div className="note-banner" style={{ margin: "10px 0" }}>⚠️ {error}</div>}

        <form
          style={{ display: "flex", gap: 10, marginTop: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            type="text"
            placeholder="Describe who or what you're naming…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
          />
          <button className="btn btn-aurora" type="submit" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
