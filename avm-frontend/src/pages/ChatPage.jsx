import { useState, useRef, useEffect } from "react";

/**
 * Acqar /chat — Beta v0 frontend (React, single file)
 * =====================================================
 * Talks to: POST {BACKEND}/chat
 * Request:  { "message": "Is JVC worth buying in 2026?" }
 * Response: { "answer": str, "grounded": bool, "area": str|null, "debug": {...} }
 *
 * No multi-turn memory here on purpose — Beta v0 sends every message fresh.
 */

const BACKEND = "https://development-production-2ad3.up.railway.app";

async function sendMessage(message) {
  const res = await fetch(BACKEND.replace(/\/$/, "") + "/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Request failed (${res.status}): ${err}`);
  }

  return res.json();
}

function Message({ role, text }) {
  return (
    <div className={`acqar-msg acqar-msg--${role}`}>
      <div className="acqar-msg__who">{role}</div>
      <div className="acqar-msg__bubble">{text}</div>
    </div>
  );
}

function AssistantResponse({ data }) {
  const [showDebug, setShowDebug] = useState(false);
  const badgeClass = data.grounded ? "grounded" : "ungrounded";
  const badgeText = data.grounded
    ? "Grounded — real data"
    : "No data — honest fallback";

  return (
    <div className="acqar-msg acqar-msg--assistant">
      <div className="acqar-msg__who">assistant</div>
      <span className={`acqar-badge acqar-badge--${badgeClass}`}>
        {badgeText}
      </span>
      <div className="acqar-msg__bubble">{data.answer}</div>
      <button
        type="button"
        className="acqar-debug-toggle"
        onClick={() => setShowDebug((v) => !v)}
      >
        {showDebug ? "hide debug" : "debug"}
      </button>
      {showDebug && (
        <pre className="acqar-debug-pre">
          {JSON.stringify({ area: data.area, ...data.debug }, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AcqarChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e) {
    e.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setSending(true);

    try {
      const data = await sendMessage(message);
      setMessages((prev) => [...prev, { role: "assistant-data", data }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `Could not reach backend: ${err.message}` },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="acqar-chat">
      <style>{`
        .acqar-chat {
          --ink: #14141f;
          --muted: #6b7280;
          --border: #e3e2df;
          --bg: #f6f5f2;
          --card: #ffffff;
          --grounded: #1a7a4c;
          --ungrounded: #b45309;

          font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
          background: var(--bg);
          color: var(--ink);
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 100vh;
        }
        .acqar-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--card);
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .acqar-header h1 { font-size: 15px; margin: 0; letter-spacing: 0.02em; }
        .acqar-tag {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .acqar-hint { font-size: 11.5px; color: var(--muted); margin: 14px 24px 0; }
        .acqar-thread { flex: 1; padding: 12px 24px 24px; overflow-y: auto; }
        .acqar-msg { margin-bottom: 18px; }
        .acqar-msg__who {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted);
          margin-bottom: 4px;
        }
        .acqar-msg--user .acqar-msg__bubble { background: var(--ink); color: white; }
        .acqar-msg__bubble {
          display: inline-block;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13.5px;
          line-height: 1.5;
          max-width: 100%;
          white-space: pre-wrap;
        }
        .acqar-badge {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 2px 8px;
          border-radius: 999px;
          margin-bottom: 6px;
        }
        .acqar-badge--grounded {
          background: #eafaf1; color: var(--grounded); border: 1px solid var(--grounded);
        }
        .acqar-badge--ungrounded {
          background: #fef6ea; color: var(--ungrounded); border: 1px solid var(--ungrounded);
        }
        .acqar-debug-toggle {
          display: block;
          margin-top: 6px;
          font-family: inherit;
          font-size: 10.5px;
          color: var(--muted);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
        }
        .acqar-debug-pre {
          margin-top: 6px;
          font-size: 11px;
          background: #fbfbfa;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 8px 10px;
          overflow-x: auto;
        }
        .acqar-composer {
          display: flex;
          gap: 8px;
          padding: 14px 24px;
          background: var(--card);
          border-top: 1px solid var(--border);
        }
        .acqar-composer input[type="text"] {
          flex: 1;
          font-family: inherit;
          font-size: 13.5px;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .acqar-composer button {
          font-family: inherit;
          font-size: 13px;
          padding: 10px 18px;
          background: var(--ink);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .acqar-composer button:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      <header className="acqar-header">
        <h1>Acqar /chat</h1>
        <span className="acqar-tag">Beta v0 — foundation, no multi-turn yet</span>
      </header>

      <p className="acqar-hint">
        Every message is sent fresh — Beta v0 has no follow-up memory yet
        (that's Beta v1). Each answer is labeled GROUNDED (real Supabase
        data) or NO DATA (honest fallback, nothing invented).
      </p>

      <main className="acqar-thread">
        {messages.map((m, i) =>
          m.role === "assistant-data" ? (
            <AssistantResponse key={i} data={m.data} />
          ) : (
            <Message key={i} role={m.role} text={m.text} />
          )
        )}
        {sending && <Message role="assistant" text="Thinking…" />}
        <div ref={bottomRef} />
      </main>

      <form className="acqar-composer" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about JVC, Downtown, Dubai Marina…"
          autoComplete="off"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
