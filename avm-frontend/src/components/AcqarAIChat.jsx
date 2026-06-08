// import { useState, useRef, useEffect } from "react";
// import { supabase } from "../lib/supabase";

// const BACKEND = "https://development-production-2ad3.up.railway.app";

// const STARTERS = [
//   "What is the average price per sqft in Dubai Marina?",
//   "Best areas for rental yield above 8%?",
//   "Compare JVC vs Business Bay for investment",
// ];

// export default function AcqarAIChat() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       text: "Ask me anything about Dubai real estate — prices, yields, areas, or market trends.",
//     },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const bottomRef = useRef(null);

//   // Auto-scroll to latest message
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // Auto-send saved query after login redirect
// useEffect(() => {
//     const pending = sessionStorage.getItem("acqar_pending_query");
//     if (pending) {
//       sessionStorage.removeItem("acqar_pending_query");
//       setTimeout(() => handleSend(pending), 300);
//     }
//   }, []);

//   const handleSend = async (text) => {
//     const query = (text || input).trim();
//     if (!query || loading) return;
//     setInput("");

//     // Check if user is logged in
//     const { data } = await supabase.auth.getSession();
//     if (!data.session) {
//       // Save their question, redirect to login
//       sessionStorage.setItem("acqar_pending_query", query);
//       window.location.href = "/login";
//       return;
//     }

//     // Add user message to chat
//     setMessages((m) => [...m, { role: "user", text: query }]);
//     setLoading(true);
//     setMessages((m) => [...m, { role: "thinking", text: "Thinking..." }]);

//     try {
//       const res = await fetch(`${BACKEND}/ai/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: query }),
//       });
//       const json = await res.json();
//       setMessages((m) => [
//         ...m.filter((x) => x.role !== "thinking"),
//         { role: "assistant", text: json.reply },
//       ]);
//     } catch {
//       setMessages((m) => [
//         ...m.filter((x) => x.role !== "thinking"),
//         { role: "assistant", text: "Connection error. Please try again." },
//       ]);
//     }

//     setLoading(false);
//   };

//   return (
//     <div style={{
//       maxWidth: 720,
//       margin: "0 auto",
//       background: "var(--dark-card)",
//       border: "1px solid var(--border-copper)",
//       borderRadius: "var(--radius-xl)",
//       overflow: "hidden",
//     }}>

//       {/* Message history */}
//       <div style={{
//         height: 300,
//         overflowY: "auto",
//         padding: "20px 24px",
//         display: "flex",
//         flexDirection: "column",
//         gap: 12,
//       }}>
//         {messages.map((m, i) => (
//           <div key={i} style={{
//             alignSelf: m.role === "user" ? "flex-end" : "flex-start",
//             maxWidth: "82%",
//             padding: "10px 14px",
//             borderRadius: 10,
//             fontSize: 14,
//             lineHeight: 1.65,
//             background: m.role === "user"
//               ? "rgba(184,115,51,0.15)"
//               : "var(--dark-3)",
//             border: m.role === "user"
//               ? "1px solid var(--border-copper)"
//               : "1px solid var(--border)",
//             color: m.role === "thinking"
//               ? "var(--text-muted)"
//               : "var(--text-primary)",
//             fontStyle: m.role === "thinking" ? "italic" : "normal",
//           }}>
//             {m.text}
//           </div>
//         ))}
//         <div ref={bottomRef} />
//       </div>

//       {/* Starter question chips — only before first send */}
//       {messages.length === 1 && (
//         <div style={{
//           padding: "0 20px 14px",
//           display: "flex",
//           flexWrap: "wrap",
//           gap: 8,
//         }}>
//           {STARTERS.map((q) => (
//             <button
//               key={q}
//               onClick={() => handleSend(q)}
//               style={{
//                 fontSize: 12,
//                 padding: "6px 12px",
//                 background: "transparent",
//                 border: "1px solid var(--border)",
//                 borderRadius: 20,
//                 color: "var(--text-muted)",
//                 cursor: "pointer",
//                 transition: "all 0.2s",
//               }}
//               onMouseEnter={(e) => {
//                 e.target.style.borderColor = "var(--copper)";
//                 e.target.style.color = "var(--copper)";
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.borderColor = "var(--border)";
//                 e.target.style.color = "var(--text-muted)";
//               }}
//             >
//               {q}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Input bar */}
//       <div style={{
//         display: "flex",
//         gap: 8,
//         padding: "12px 16px",
//         borderTop: "1px solid var(--border)",
//         background: "var(--dark-2)",
//       }}>
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           placeholder="Ask about Dubai property..."
//           disabled={loading}
//           style={{
//             flex: 1,
//             background: "var(--dark-3)",
//             border: "1px solid var(--border)",
//             borderRadius: "var(--radius-sm)",
//             padding: "10px 14px",
//             fontSize: 14,
//             color: "var(--text-primary)",
//             outline: "none",
//             transition: "border-color 0.2s",
//           }}
//           onFocus={(e) => (e.target.style.borderColor = "var(--copper)")}
//           onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
//         />
//         <button
//           onClick={() => handleSend()}
//           disabled={loading || !input.trim()}
//           style={{
//             padding: "10px 20px",
//             background:
//               loading || !input.trim() ? "var(--dark-4)" : "var(--copper)",
//             color: "#fff",
//             border: "none",
//             borderRadius: "var(--radius-sm)",
//             fontWeight: 700,
//             fontSize: 14,
//             cursor: loading || !input.trim() ? "not-allowed" : "pointer",
//             transition: "background 0.2s",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {loading ? "..." : "Ask →"}
//         </button>
//       </div>
//     </div>
//   );
// }








// import { useState, useRef, useEffect } from "react";
// import { supabase } from "../lib/supabase";
// import { useNavigate } from "react-router-dom";

// const BACKEND = "https://development-production-2ad3.up.railway.app";

// const STARTERS = [
//   "What is the average price per sqft in Dubai Marina?",
//   "Best areas for rental yield above 8%?",
//   "Compare JVC vs Business Bay for investment",
// ];

// const BLUR_RESPONSE = "The average price per sqft in Dubai Marina varies significantly based on property type and specific building. Based on recent DLD transactions and current market data, you can expect prices ranging across different tiers depending on floor level, view, and finishing quality. Rental yields in this area have been trending strong with investor demand remaining high through 2025 and into 2026.";

// export default function AcqarAIChat() {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       role: "assistant",
//       text: "Ask me anything about Dubai real estate — prices, yields, areas, or market trends.",
//     },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [user, setUser] = useState(null);
//   const bottomRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//     });
//     const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
//       setUser(session?.user ?? null);
//     });
//     return () => listener.subscription.unsubscribe();
//   }, []);

//   // After login, auto-send pending query
//   useEffect(() => {
//     if (!user) return;
//     const pending = sessionStorage.getItem("acqar_pending_query");
//     if (pending) {
//       sessionStorage.removeItem("acqar_pending_query");
//       // Replace blurred message with real one
//       setMessages([
//         {
//           role: "assistant",
//           text: "Ask me anything about Dubai real estate — prices, yields, areas, or market trends.",
//         },
//       ]);
//       setTimeout(() => handleSend(pending), 300);
//     }
//   }, [user]);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async (text) => {
//     const query = (text || input).trim();
//     if (!query || loading) return;
//     setInput("");

//     // Not logged in — show blurred fake response + sign in prompt
//     if (!user) {
//       sessionStorage.setItem("acqar_pending_query", query);
//       setMessages((m) => [
//         ...m,
//         { role: "user", text: query },
//         { role: "blurred", text: BLUR_RESPONSE },
//       ]);
//       return;
//     }

//     setMessages((m) => [...m, { role: "user", text: query }]);
//     setLoading(true);
//     setMessages((m) => [...m, { role: "thinking", text: "Thinking..." }]);

//     try {
//       const res = await fetch(`${BACKEND}/ai/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: query }),
//       });
//       const json = await res.json();
//       setMessages((m) => [
//         ...m.filter((x) => x.role !== "thinking"),
//         { role: "assistant", text: json.reply },
//       ]);
//     } catch {
//       setMessages((m) => [
//         ...m.filter((x) => x.role !== "thinking"),
//         { role: "assistant", text: "Connection error. Please try again." },
//       ]);
//     }

//     setLoading(false);
//   };

//   return (
//     <div style={{
//       maxWidth: 720,
//       margin: "0 auto",
//       background: "var(--dark-card)",
//       border: "1px solid var(--border-copper)",
//       borderRadius: "var(--radius-xl)",
//       overflow: "hidden",
//     }}>

//       {/* Message history */}
//       <div style={{
//         height: 300,
//         overflowY: "auto",
//         padding: "20px 24px",
//         display: "flex",
//         flexDirection: "column",
//         gap: 12,
//       }}>
//         {messages.map((m, i) => {
//           if (m.role === "blurred") {
//             return (
//               <div key={i} style={{ alignSelf: "flex-start", maxWidth: "82%", position: "relative" }}>
//                 {/* Blurred text */}
//                 <div style={{
//                   padding: "10px 14px",
//                   borderRadius: 10,
//                   fontSize: 14,
//                   lineHeight: 1.65,
//                   background: "var(--dark-3)",
//                   border: "1px solid var(--border)",
//                   color: "var(--text-primary)",
//                   filter: "blur(5px)",
//                   userSelect: "none",
//                   pointerEvents: "none",
//                 }}>
//                   {m.text}
//                 </div>
//                 {/* Sign in overlay */}
//                 <div style={{
//                   position: "absolute",
//                   inset: 0,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   gap: 8,
//                   borderRadius: 10,
//                   background: "rgba(12,12,12,0.55)",
//                   backdropFilter: "blur(2px)",
//                 }}>
//                   <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>
//                     Sign in to see the full answer
//                   </span>
//                   <button
//                     onClick={() => navigate("/login")}
//                     style={{
//                       padding: "7px 18px",
//                       background: "var(--copper)",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: 6,
//                       fontWeight: 700,
//                       fontSize: 13,
//                       cursor: "pointer",
//                     }}
//                   >
//                     Sign in free →
//                   </button>
//                 </div>
//               </div>
//             );
//           }

//           return (
//             <div key={i} style={{
//               alignSelf: m.role === "user" ? "flex-end" : "flex-start",
//               maxWidth: "82%",
//               padding: "10px 14px",
//               borderRadius: 10,
//               fontSize: 14,
//               lineHeight: 1.65,
//               background: m.role === "user"
//                 ? "rgba(184,115,51,0.15)"
//                 : "var(--dark-3)",
//               border: m.role === "user"
//                 ? "1px solid var(--border-copper)"
//                 : "1px solid var(--border)",
//               color: m.role === "thinking"
//                 ? "var(--text-muted)"
//                 : "var(--text-primary)",
//               fontStyle: m.role === "thinking" ? "italic" : "normal",
//             }}>
//               {m.text}
//             </div>
//           );
//         })}
//         <div ref={bottomRef} />
//       </div>

//       {/* Starter chips */}
//       {messages.length === 1 && (
//         <div style={{ padding: "0 20px 14px", display: "flex", flexWrap: "wrap", gap: 8 }}>
//           {STARTERS.map((q) => (
//             <button
//               key={q}
//               onClick={() => handleSend(q)}
//               style={{
//                 fontSize: 12,
//                 padding: "6px 12px",
//                 background: "transparent",
//                 border: "1px solid var(--border)",
//                 borderRadius: 20,
//                 color: "var(--text-muted)",
//                 cursor: "pointer",
//                 transition: "all 0.2s",
//               }}
//               onMouseEnter={(e) => {
//                 e.target.style.borderColor = "var(--copper)";
//                 e.target.style.color = "var(--copper)";
//               }}
//               onMouseLeave={(e) => {
//                 e.target.style.borderColor = "var(--border)";
//                 e.target.style.color = "var(--text-muted)";
//               }}
//             >
//               {q}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Input bar */}
//       <div style={{
//         display: "flex",
//         gap: 8,
//         padding: "12px 16px",
//         borderTop: "1px solid var(--border)",
//         background: "var(--dark-2)",
//       }}>
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && handleSend()}
//           placeholder="Ask about Dubai property..."
//           disabled={loading}
//           style={{
//             flex: 1,
//             background: "var(--dark-3)",
//             border: "1px solid var(--border)",
//             borderRadius: "var(--radius-sm)",
//             padding: "10px 14px",
//             fontSize: 14,
//             color: "var(--text-primary)",
//             outline: "none",
//             transition: "border-color 0.2s",
//           }}
//           onFocus={(e) => (e.target.style.borderColor = "var(--copper)")}
//           onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
//         />
//         <button
//           onClick={() => handleSend()}
//           disabled={loading || !input.trim()}
//           style={{
//             padding: "10px 20px",
//             background: loading || !input.trim() ? "var(--dark-4)" : "var(--copper)",
//             color: "#fff",
//             border: "none",
//             borderRadius: "var(--radius-sm)",
//             fontWeight: 700,
//             fontSize: 14,
//             cursor: loading || !input.trim() ? "not-allowed" : "pointer",
//             transition: "background 0.2s",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {loading ? "..." : "Ask →"}
//         </button>
//       </div>
//     </div>
//   );
// }














import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const BACKEND = "https://development-production-2ad3.up.railway.app";

const STARTERS = [
  "Average price per sqft in Dubai Marina?",
  "Best areas for rental yield above 8%?",
  "JVC vs Business Bay for investment?",
];

const BLUR_RESPONSE = "The average price per sqft in Dubai Marina varies significantly based on property type and specific building. Based on recent DLD transactions and current market data, you can expect prices ranging across different tiers depending on floor level, view, and finishing quality. Rental yields in this area have been trending strong with investor demand remaining high through 2025 and into 2026.";

export default function AcqarAIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask me anything about Dubai real estate — prices, yields, areas, or market trends.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const pending = sessionStorage.getItem("acqar_pending_query");
    if (pending) {
      sessionStorage.removeItem("acqar_pending_query");
      setMessages([{
        role: "assistant",
        text: "Ask me anything about Dubai real estate — prices, yields, areas, or market trends.",
      }]);
      if (isMobile) setMobileOpen(true);
      setTimeout(() => handleSend(pending), 300);
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lock body scroll when mobile chat is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, isMobile]);

  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;
    setInput("");

    if (!user) {
      sessionStorage.setItem("acqar_pending_query", query);
      setMessages((m) => [
        ...m,
        { role: "user", text: query },
        { role: "blurred", text: BLUR_RESPONSE },
      ]);
      return;
    }

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

  const ChatContent = () => (
    <>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        {messages.map((m, i) => {
          if (m.role === "blurred") {
            return (
              <div key={i} style={{ alignSelf: "flex-start", maxWidth: "85%", position: "relative" }}>
                <div style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  lineHeight: 1.6,
                  background: "var(--dark-3)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  filter: "blur(5px)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}>
                  {m.text}
                </div>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: 10,
                  background: "rgba(12,12,12,0.55)",
                  backdropFilter: "blur(2px)",
                }}>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, textAlign: "center", padding: "0 8px" }}>
                    Sign in to see the full answer
                  </span>
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      padding: "7px 16px",
                      background: "var(--copper)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Sign in free →
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 13,
              lineHeight: 1.6,
              background: m.role === "user" ? "rgba(184,115,51,0.15)" : "var(--dark-3)",
              border: m.role === "user" ? "1px solid var(--border-copper)" : "1px solid var(--border)",
              color: m.role === "thinking" ? "var(--text-muted)" : "var(--text-primary)",
              fontStyle: m.role === "thinking" ? "italic" : "normal",
            }}>
              {m.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Starter chips */}
      {messages.length === 1 && (
        <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
          {STARTERS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              style={{
                fontSize: 11,
                padding: "5px 10px",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 20,
                color: "var(--text-muted)",
                cursor: "pointer",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        display: "flex",
        gap: 8,
        padding: "10px 12px",
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
            padding: "9px 12px",
            fontSize: 13,
            color: "var(--text-primary)",
            outline: "none",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--copper)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            padding: "9px 16px",
            background: loading || !input.trim() ? "var(--dark-4)" : "var(--copper)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-sm)",
            fontWeight: 700,
            fontSize: 13,
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {loading ? "..." : "Ask →"}
        </button>
      </div>
    </>
  );

  // ── MOBILE VIEW ──
  if (isMobile) {
    return (
      <>
        {/* Floating button */}
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              position: "fixed",
              bottom: 24,
              right: 20,
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              background: "var(--copper)",
              color: "#fff",
              border: "none",
              borderRadius: 30,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 8px 32px rgba(184,115,51,0.45)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 16 }}>✦</span>
            Ask ACQAR AI
          </button>
        )}

        {/* Full screen modal */}
        {mobileOpen && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "var(--dark)",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              background: "var(--dark-card)",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--copper-tint)",
                  border: "1px solid var(--border-copper)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                }}>
                  ✦
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>ACQAR AI</div>
                  <div style={{ fontSize: 11, color: "var(--green)" }}>● Online</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: 22,
                  cursor: "pointer",
                  padding: 4,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Chat content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <ChatContent />
            </div>
          </div>
        )}
      </>
    );
  }

  // ── DESKTOP VIEW ──
  return (
    <div style={{
      maxWidth: 720,
      margin: "0 auto",
      background: "var(--dark-card)",
      border: "1px solid var(--border-copper)",
      borderRadius: "var(--radius-xl)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      height: 420,
    }}>
      <ChatContent />
    </div>
  );
}
