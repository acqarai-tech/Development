import { useState, useRef, useEffect } from "react";



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

/**
 * Splits an answer string into alternating text and table blocks.
 * A table block is detected as: a line of |cell|cell|...|, immediately
 * followed by a divider line like |---|---|...| (dashes/colons only).
 */
function parseAnswerBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let textBuffer = [];

  const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
  const isDividerRow = (line) =>
    /^\s*\|[\s:\-|]+\|\s*$/.test(line) && line.includes("-");

  const flushText = () => {
    if (textBuffer.length) {
      const joined = textBuffer.join("\n").trim();
      if (joined) blocks.push({ type: "text", content: joined });
      textBuffer = [];
    }
  };

  const splitRow = (line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim());

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (isTableRow(line) && i + 1 < lines.length && isDividerRow(lines[i + 1])) {
      flushText();
      const headers = splitRow(line);
      i += 2; // skip header + divider
      const rows = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }
    textBuffer.push(line);
    i += 1;
  }
  flushText();
  return blocks;
}

function AnswerTable({ headers, rows }) {
  return (
    <table className="acqar-table">
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AnswerBody({ text }) {
  const blocks = parseAnswerBlocks(text);
  return (
    <div className="acqar-answer-body">
      {blocks.map((block, i) =>
        block.type === "table" ? (
          <AnswerTable key={i} headers={block.headers} rows={block.rows} />
        ) : (
          <div key={i} className="acqar-answer-text">
            {block.content}
          </div>
        )
      )}
    </div>
  );
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
      <div className="acqar-msg__bubble acqar-msg__bubble--rich">
        <AnswerBody text={data.answer} />
      </div>
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
        .acqar-msg__bubble--rich {
          display: block;
          white-space: normal;
        }
        .acqar-answer-body { display: flex; flex-direction: column; gap: 10px; }
        .acqar-answer-text { white-space: pre-wrap; }
        .acqar-table {
          border-collapse: collapse;
          width: 100%;
          font-size: 12.5px;
          margin: 4px 0;
        }
        .acqar-table th, .acqar-table td {
          border: 1px solid var(--border);
          padding: 5px 9px;
          text-align: left;
          white-space: nowrap;
        }
        .acqar-table th {
          background: #f1f0ec;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: var(--muted);
        }
        .acqar-table tbody tr:nth-child(even) { background: #fafaf8; }
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
