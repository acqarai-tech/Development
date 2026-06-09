import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const BACKEND = "https://development-production-2ad3.up.railway.app";

const SUGGESTIONS = [
  "What is the average price per sqft in Dubai Marina?",
  "Compare top areas by transaction volume",
  "Show me latest S4 and S5 signals",
  "Best areas for rental yield in Dubai",
  "Price trend in JVC over last 12 months",
  "How does Business Bay compare to DIFC?",
];

function BarChart({ data }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ marginTop: 16, padding: "16px", background: "var(--dark-3)", borderRadius: 12, border: "1px solid var(--border)" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Chart</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.slice(0, 10).map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 120, fontSize: 11, color: "var(--text-secondary)", textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </div>
            <div style={{ flex: 1, height: 20, background: "var(--dark-4)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(item.value / max) * 100}%`,
                background: "linear-gradient(90deg, var(--copper), var(--copper-light))",
                borderRadius: 4,
                transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ width: 80, fontSize: 11, color: "var(--copper)", fontWeight: 700, flexShrink: 0 }}>
              {item.value?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <div style={{
          maxWidth: "70%",
          padding: "12px 16px",
          background: "rgba(184,115,51,0.15)",
          border: "1px solid var(--border-copper)",
          borderRadius: "16px 16px 4px 16px",
          fontSize: 14,
          color: "var(--text-primary)",
          lineHeight: 1.6,
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.role === "thinking") {
    return (
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--copper-tint)", border: "1px solid var(--border-copper)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✦</div>
        <div style={{ padding: "12px 16px", background: "var(--dark-card)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px", fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
          Searching Acqar data...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--copper-tint)", border: "1px solid var(--border-copper)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: "12px 16px", background: "var(--dark-card)", border: "1px solid var(--border)", borderRadius: "16px 16px 16px 4px", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7 }}>
          {msg.reply}
        </div>
        {msg.chart_type !== "none" && msg.chart_data?.length > 0 && (
          <BarChart data={msg.chart_data} />
        )}
        {msg.insight && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(184,115,51,0.08)", border: "1px solid var(--border-copper)", borderRadius: 8, fontSize: 12, color: "var(--copper)" }}>
            ✦ {msg.insight}
          </div>
        )}
        {msg.data_source && (
          <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-muted)" }}>
            Source: {msg.data_source}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setCheckingAuth(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    if (!user) {
      sessionStorage.setItem("acqar_chat_pending", query);
      navigate("/login");
      return;
    }

    setInput("");
    setMessages(m => [...m, { role: "user", text: query }]);
    setLoading(true);
    setMessages(m => [...m, { role: "thinking" }]);

    try {
      const res = await fetch(`${BACKEND}/intelligence/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const json = await res.json();
      setMessages(m => [
        ...m.filter(x => x.role !== "thinking"),
        { role: "assistant", ...json },
      ]);
    } catch {
      setMessages(m => [
        ...m.filter(x => x.role !== "thinking"),
        { role: "assistant", reply: "Connection error. Please try again.", chart_type: "none", chart_data: [] },
      ]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (checkingAuth) return null;

  return (
    <div style={{
      height: "100vh",
      background: "var(--dark)",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 56,
        borderBottom: "1px solid var(--border)",
        background: "var(--dark-card)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 20, padding: 0 }}>←</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--copper-tint)", border: "1px solid var(--border-copper)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✦</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>ACQAR Intelligence</div>
              <div style={{ fontSize: 10, color: "var(--green)" }}>● Live data</div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {user ? user.email : "Not signed in"}
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
                Ask ACQAR Intelligence
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 40 }}>
                Query your real estate data — transactions, signals, area analytics
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 600, margin: "0 auto" }}>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    style={{
                      padding: "12px 16px",
                      background: "var(--dark-card)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "left",
                      lineHeight: 1.4,
                      transition: "border-color 0.2s",
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--copper)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "16px 24px 24px", flexShrink: 0 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{
            display: "flex",
            gap: 10,
            background: "var(--dark-card)",
            border: "1px solid var(--border-copper)",
            borderRadius: 14,
            padding: "8px 8px 8px 16px",
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={user ? "Ask about Dubai real estate data..." : "Sign in to query Acqar data..."}
              disabled={loading}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: "var(--text-primary)",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                padding: "10px 20px",
                background: loading || !input.trim() ? "var(--dark-3)" : "var(--copper)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 13,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                fontFamily: "inherit",
              }}
            >
              {loading ? "..." : "→"}
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
            Powered by Acqar AVM data · Live signals
          </div>
        </div>
      </div>
    </div>
  );
}
