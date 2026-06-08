import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";

const BACKEND = "https://development-production-2ad3.up.railway.app";

const STARTERS = [
  "What is the average price per sqft in Dubai Marina?",
  "Best areas for rental yield above 8%?",
  "Compare JVC vs Business Bay for investment",
];

export default function AcqarAIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask me anything about Dubai real estate — prices, yields, areas, or market trends.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send saved query after login redirect
useEffect(() => {
    const pending = sessionStorage.getItem("acqar_pending_query");
    if (pending) {
      sessionStorage.removeItem("acqar_pending_query");
      setTimeout(() => handleSend(pending), 300);
    }
  }, []);

  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;
    setInput("");

    // Check if user is logged in
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      // Save their question, redirect to login
      sessionStorage.setItem("acqar_pending_query", query);
      window.location.href = "/login";
      return;
    }

    // Add user message to chat
    setMessages((m) => [...m, { role: "user", text: query }]);
    setLoading(true);
    setMessages((m) => [...m, { role: "thinking", text: "Thinking..." }]);

    try {
      const res = await fetch(`${BACKEND}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const json = await res.json();
      setMessages((m) => [
        ...m.filter((x) => x.role !== "thinking"),
        { role: "assistant", text: json.reply },
      ]);
    } catch {
      setMessages((m) => [
        ...m.filter((x) => x.role !== "thinking"),
        { role: "assistant", text: "Connection error. Please try again." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: 720,
      margin: "0 auto",
      background: "var(--dark-card)",
      border: "1px solid var(--border-copper)",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
    }}>

      {/* Message history */}
      <div style={{
        height: 300,
        overflowY: "auto",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "82%",
            padding: "10px 14px",
            borderRadius: 10,
            fontSize: 14,
            lineHeight: 1.65,
            background: m.role === "user"
              ? "rgba(184,115,51,0.15)"
              : "var(--dark-3)",
            border: m.role === "user"
              ? "1px solid var(--border-copper)"
              : "1px solid var(--border)",
            color: m.role === "thinking"
              ? "var(--text-muted)"
              : "var(--text-primary)",
            fontStyle: m.role === "thinking" ? "italic" : "normal",
          }}>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Starter question chips — only before first send */}
      {messages.length === 1 && (
        <div style={{
          padding: "0 20px 14px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}>
          {STARTERS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              style={{
                fontSize: 12,
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 20,
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "var(--copper)";
                e.target.style.color = "var(--copper)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.color = "var(--text-muted)";
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div style={{
        display: "flex",
        gap: 8,
        padding: "12px 16px",
        borderTop: "1px solid var(--border)",
        background: "var(--dark-2)",
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about Dubai property..."
          disabled={loading}
          style={{
            flex: 1,
            background: "var(--dark-3)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            fontSize: 14,
            color: "var(--text-primary)",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--copper)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 20px",
            background:
              loading || !input.trim() ? "var(--dark-4)" : "var(--copper)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            transition: "background 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "..." : "Ask →"}
        </button>
      </div>
    </div>
  );
}
