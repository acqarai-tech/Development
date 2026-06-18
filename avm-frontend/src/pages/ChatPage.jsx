// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// const BACKEND = "https://development-production-2ad3.up.railway.app";

// const SUGGESTIONS = [
//   "Best areas for British families with kids in Dubai",
//   "Give me a full investment report on JVC",
//   "Best areas for rental yield in Dubai right now",
//   "Compare Business Bay vs Downtown Dubai",
//   "Find me a 2BR apartment under AED 2M",
//   "How do I buy property in Dubai as a foreigner?",
//   "Is Dubai Marina a good buy in 2026?",
//   "Which Dubai area has the highest investment score?",
// ];

// const C = {
//   bg:           "#FFFFFF",
//   pageBg:       "#F7F7F8",
//   textPrimary:  "#111827",
//   textSecondary:"#374151",
//   textMuted:    "#9CA3AF",
//   textLight:    "#6B7280",
//   border:       "#E5E7EB",
//   copper:       "#B87333",
//   copperBorder: "rgba(184,115,51,0.25)",
//   copperTint:   "rgba(184,115,51,0.06)",
//   userBubble:   "#F3F4F6",
// };

// // ── Conversational summary shown while thinking ───────────────────
// function generateSummary(query) {
//   const q = query.toLowerCase();
//   if (q.includes("british") && (q.includes("school") || q.includes("community")))
//     return "Great question! Finding Dubai communities with strong British expat populations, British curriculum schools, and real DLD transaction data now.";
//   if (q.includes("family") && (q.includes("school") || q.includes("kids") || q.includes("children")))
//     return "Finding the best family communities in Dubai — checking schools, safety, parks, and real closed-sale prices now.";
//   if (q.includes("yield") || q.includes("rental income"))
//     return "Pulling the highest-yielding areas in Dubai — using real DLD transaction data, not estimates.";
//   if (q.includes("compare") || q.includes(" vs ") || q.includes("versus"))
//     return "Good comparison to make. Pulling real DLD data for both areas — investment scores, yields, and closed-sale prices side by side.";
//   if (q.includes("how") && (q.includes("buy") || q.includes("purchase") || q.includes("foreigner")))
//     return "Walking you through the Dubai property buying process step by step.";
//   if (q.includes("visa") || q.includes("golden visa"))
//     return "Looking up the latest Dubai property visa requirements and thresholds.";
//   if (q.includes("invest") || q.includes("best area") || q.includes("top area"))
//     return "Pulling the top-ranked areas by investment score, yield, and price momentum from our database.";
//   if (q.includes("afford") || q.includes("cheap") || q.includes("under aed") || q.includes("budget"))
//     return "Searching our 365K+ DLD transactions for the best value within your budget.";
//   if (q.includes("off plan") || q.includes("off-plan"))
//     return "Checking off-plan opportunities — with developer track records and delay risk data.";
//   if (q.includes("rent") && !q.includes("rental income"))
//     return "Pulling rental ranges, supply levels, and yield data for the relevant areas.";
//   const words = query.trim().split(/\s+/).slice(0, 8).join(" ");
//   return `Searching 365,000+ DLD transactions for: ${words}${query.split(/\s+/).length > 8 ? "..." : ""}`;
// }

// // ── Parse reply into sections ──────────────────────────────────────
// const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼"];

// function parseReplyToSections(reply) {
//   if (!reply) return null;
//   const lines    = reply.split("\n");
//   const sections = [];
//   let current    = null;

//   for (const line of lines) {
//     const trimmed = line.trim();
//     if (!trimmed) {
//       if (current) current.body += "\n";
//       continue;
//     }
//     const isHeader = SECTION_EMOJIS.some(e => trimmed.startsWith(e));
//     if (isHeader) {
//       if (current) sections.push(current);
//       current = { header: trimmed, body: "" };
//     } else {
//       if (current) {
//         current.body += (current.body ? "\n" : "") + trimmed;
//       } else {
//         sections.push({ header: null, body: trimmed });
//       }
//     }
//   }
//   if (current) sections.push(current);
//   return sections.length > 0 ? sections : null;
// }

// // ── Highlight AED values, percentages, scores ────────────────────
// function highlightValues(text) {
//   return text
//     .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(AED\s?[\d,\.]+[MBK]?)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(\d+\.?\d*%)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(\d+\/100)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/\b(BUY)\b/g, '<span style="color:#065F46;font-weight:700;background:#D1FAE5;padding:1px 6px;border-radius:4px">BUY</span>')
//     .replace(/\b(HOLD)\b/g, '<span style="color:#92400E;font-weight:700;background:#FEF3C7;padding:1px 6px;border-radius:4px">HOLD</span>')
//     .replace(/\b(WATCH)\b/g, '<span style="color:#991B1B;font-weight:700;background:#FEE2E2;padding:1px 6px;border-radius:4px">WATCH</span>');
// }

// // ── Render a single line with full formatting ─────────────────────
// function renderLine(text, key) {
//   const trimmed = text.trim();
//   if (!trimmed) return <div key={key} style={{ height: 6 }} />;

//   // Warning line
//   if (trimmed.startsWith("⚠️")) {
//     return (
//       <div key={key} style={{
//         margin: "6px 0", padding: "8px 12px",
//         background: "#FFFBEB", borderLeft: "3px solid #F59E0B",
//         borderRadius: "0 6px 6px 0", fontSize: 13, color: "#92400E",
//       }}>
//         {trimmed}
//       </div>
//     );
//   }

//   // Table row (contains | character)
//   if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
//     const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
//     const isHeader = trimmed.startsWith("---") || cells.every(c => c.match(/^[-\s]+$/));
//     if (isHeader) return <div key={key} style={{ borderBottom: `1px solid ${C.border}`, margin: "2px 0" }} />;
//     return (
//       <div key={key} style={{
//         display: "grid",
//         gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
//         gap: 4, padding: "5px 0",
//         borderBottom: `1px solid #F3F4F6`,
//         fontSize: 12,
//       }}>
//         {cells.map((cell, i) => (
//           <span key={i} style={{ color: i === 0 ? C.textPrimary : C.textSecondary, fontWeight: i === 0 ? 600 : 400, lineHeight: 1.5 }}
//             dangerouslySetInnerHTML={{ __html: highlightValues(cell) }} />
//         ))}
//       </div>
//     );
//   }

//   // Price history arrows
//   if (trimmed.includes("→") && trimmed.match(/\d/)) {
//     return (
//       <div key={key} style={{ margin: "3px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7, fontFamily: "monospace" }}>
//         {trimmed}
//       </div>
//     );
//   }

//   // Numbered follow-up options (e.g. "1. Some question")
//   if (/^\d+\./.test(trimmed)) {
//     const content = trimmed.replace(/^\d+\.\s*/, "");
//     const num     = trimmed.match(/^(\d+)\./)?.[1];
//     return (
//       <div key={key} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
//         <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}
//           dangerouslySetInnerHTML={{ __html: highlightValues(content) }} />
//       </div>
//     );
//   }

//   // Bullet with bold label
//   if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
//     const txt       = trimmed.replace(/^[•\-]\s*/, "");
//     const boldMatch = txt.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
//     if (boldMatch) {
//       return (
//         <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "5px 0" }}>
//           <span style={{ color: C.copper, flexShrink: 0, marginTop: 2, fontSize: 13 }}>•</span>
//           <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>
//             <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{boldMatch[1]}</strong>
//             {boldMatch[2] ? `: ${boldMatch[2]}` : ""}
//           </span>
//         </div>
//       );
//     }
//     return (
//       <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "5px 0" }}>
//         <span style={{ color: C.copper, flexShrink: 0, marginTop: 2, fontSize: 13 }}>•</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}
//           dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
//       </div>
//     );
//   }

//   // Sub-bullet
//   if (trimmed.startsWith("◦") || trimmed.startsWith("  •") || trimmed.startsWith("  -")) {
//     const txt = trimmed.replace(/^[◦\s•\-]+/, "");
//     return (
//       <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "3px 0", paddingLeft: 16 }}>
//         <span style={{ color: C.textMuted, flexShrink: 0, fontSize: 11, marginTop: 3 }}>◦</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}
//           dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
//       </div>
//     );
//   }

//   // Key: value line (bold key)
//   const colonIdx = trimmed.indexOf(":");
//   if (colonIdx > 0 && colonIdx < 32 && !trimmed.includes("→") && !trimmed.startsWith("http") && !trimmed.includes("|")) {
//     const k   = trimmed.slice(0, colonIdx).trim().replace(/\*\*/g, "");
//     const val = trimmed.slice(colonIdx + 1).trim();
//     if (k && val && k.length < 32) {
//       return (
//         <div key={key} style={{ margin: "4px 0", fontSize: 13, lineHeight: 1.65 }}>
//           <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{k}:</strong>{" "}
//           <span style={{ color: C.textSecondary }}
//             dangerouslySetInnerHTML={{ __html: highlightValues(val) }} />
//         </div>
//       );
//     }
//   }

//   // Plain paragraph
//   return (
//     <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}
//       dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />
//   );
// }

// // ── Section block ─────────────────────────────────────────────────
// function SectionBlock({ header, body }) {
//   const lines = body.split("\n").filter(l => l !== undefined);
//   return (
//     <div style={{ marginBottom: 20 }}>
//       {header && (
//         <div style={{
//           fontSize: 15, fontWeight: 700, color: C.textPrimary,
//           marginBottom: 8, paddingBottom: 6,
//           borderBottom: `1px solid ${C.border}`,
//         }}>
//           {header}
//         </div>
//       )}
//       <div>
//         {lines.map((line, i) => renderLine(line, i))}
//       </div>
//     </div>
//   );
// }

// // ── Hero metric badges ─────────────────────────────────────────────
// function HeroBadges({ score, verdict, yieldPct, priceTrend, ranking }) {
//   if (!score && !verdict && !yieldPct) return null;
//   const verdictStyle = {
//     BUY:   { bg: "#D1FAE5", color: "#065F46" },
//     HOLD:  { bg: "#FEF3C7", color: "#92400E" },
//     WATCH: { bg: "#FEE2E2", color: "#991B1B" },
//   }[verdict] || { bg: "#F3F4F6", color: C.textPrimary };

//   return (
//     <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
//       {score && (
//         <span style={{ padding: "4px 10px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>
//           Score {score}/100
//         </span>
//       )}
//       {verdict && (
//         <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: verdictStyle.bg, color: verdictStyle.color }}>
//           {verdict}
//         </span>
//       )}
//       {yieldPct && (
//         <span style={{ padding: "4px 10px", background: "#EFF6FF", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>
//           Yield {yieldPct}%
//         </span>
//       )}
//       {priceTrend && (
//         <span style={{
//           padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
//           background: priceTrend > 0 ? "#D1FAE5" : "#FEE2E2",
//           color: priceTrend > 0 ? "#065F46" : "#991B1B",
//         }}>
//           {priceTrend > 0 ? "+" : ""}{priceTrend}% trend
//         </span>
//       )}
//       {ranking && (
//         <span style={{ padding: "4px 10px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.copper }}>
//           #{ranking} in Dubai
//         </span>
//       )}
//     </div>
//   );
// }

// // ── Chart ─────────────────────────────────────────────────────────
// function SingleChart({ chart }) {
//   if (!chart?.data || chart.data.length === 0) return null;
//   const validData = chart.data.filter(d => d.value > 0);
//   if (validData.length === 0) return null;
//   const max = Math.max(...validData.map(d => d.value));

//   return (
//     <div style={{ margin: "16px 0 8px", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
//       <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>
//         {chart.title}
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//         {validData.slice(0, 10).map((item, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 100, fontSize: 11, color: C.textLight, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//               {item.label}
//             </div>
//             <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
//               <div style={{
//                 height: "100%",
//                 width: `${Math.max(3, (item.value / max) * 100)}%`,
//                 background: chart.type === "line" ? "#3B82F6" : C.copper,
//                 borderRadius: 3,
//                 transition: "width 0.6s ease",
//               }} />
//             </div>
//             <div style={{ width: 64, fontSize: 11, color: C.textSecondary, fontWeight: 600, flexShrink: 0, textAlign: "right" }}>
//               {item.value?.toLocaleString()}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ── Thinking animation ────────────────────────────────────────────
// function ThinkingDots() {
//   return (
//     <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
//       {[0, 1, 2].map(i => (
//         <div key={i} style={{
//           width: 8, height: 8, borderRadius: "50%", background: C.textMuted,
//           animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
//         }} />
//       ))}
//       <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
//     </div>
//   );
// }

// // ── Avatar ────────────────────────────────────────────────────────
// function Avatar() {
//   return (
//     <div style={{
//       width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
//       background: C.copperTint, border: `1.5px solid ${C.copperBorder}`,
//       display: "flex", alignItems: "center", justifyContent: "center",
//       fontSize: 13, color: C.copper, fontWeight: 700,
//     }}>✦</div>
//   );
// }

// // ── Message component ─────────────────────────────────────────────
// function Message({ msg, onSuggestion }) {
//   // User bubble
//   if (msg.role === "user") {
//     return (
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
//         <div style={{
//           maxWidth: "75%", padding: "10px 14px",
//           background: C.userBubble,
//           borderRadius: "18px 18px 4px 18px",
//           fontSize: 14, color: C.textPrimary, lineHeight: 1.6,
//         }}>
//           {msg.text}
//         </div>
//       </div>
//     );
//   }

//   // Thinking state
//   if (msg.role === "thinking") {
//     return (
//       <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
//         <Avatar />
//         <div style={{ paddingTop: 4, flex: 1 }}>
//           {msg.summary && (
//             <p style={{ margin: "0 0 12px 0", fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
//               {msg.summary}
//             </p>
//           )}
//           <ThinkingDots />
//         </div>
//       </div>
//     );
//   }

//   // Clarifying question
//   if (msg.is_clarifying) {
//     const lines = (msg.reply || "").split("\n").filter(l => l.trim());
//     return (
//       <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//         <Avatar />
//         <div style={{
//           flex: 1, background: C.copperTint,
//           border: `1px solid ${C.copperBorder}`,
//           borderRadius: 12, padding: "16px 18px",
//         }}>
//           {lines.map((line, i) => {
//             const trimmed = line.trim();
//             if (/^\d+\./.test(trimmed)) {
//               const content = trimmed.replace(/^\d+\.\s*/, "");
//               const num     = trimmed.match(/^(\d+)\./)?.[1];
//               return (
//                 <div key={i} style={{ display: "flex", gap: 10, margin: "10px 0", alignItems: "flex-start" }}>
//                   <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 20, fontSize: 14 }}>{num}.</span>
//                   <span style={{ color: C.textPrimary, fontWeight: 500, fontSize: 14 }}>{content}</span>
//                 </div>
//               );
//             }
//             return <p key={i} style={{ margin: "0 0 10px", color: C.textSecondary, fontSize: 14 }}>{trimmed}</p>;
//           })}
//         </div>
//       </div>
//     );
//   }

//   // Normal assistant response
//   const sections = parseReplyToSections(msg.reply);
//   const charts = Array.isArray(msg.charts)
//   ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0))
//   : []

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//        {/* Conversational opener — LLM summary takes priority over generated fallback */}
// {(msg.summary || msg._summary || msg._query) && (
//   <p style={{
//     margin: "0 0 16px 0",
//     fontSize: 14,
//     color: C.textPrimary,          // primary color — this is the lead answer
//     lineHeight: 1.75,
//     fontWeight: 400,
//     paddingBottom: 14,
//     borderBottom: `1px solid ${C.border}`,  // visual separator before data sections
//   }}>
//     {msg.summary || msg._summary || generateSummary(msg._query)}
//   </p>
// )}

//         {/* Hero badges for specific area reports */}
//         {(msg.score || msg.verdict || msg.yield_pct) && (
//           <HeroBadges
//             score={msg.score}
//             verdict={msg.verdict}
//             yieldPct={msg.yield_pct}
//             priceTrend={msg.price_trend}
//             ranking={msg.ranking}
//           />
//         )}

//         {/* Response sections */}
//         {sections ? (
//           <div>
//             {sections.map((sec, i) => (
//               <SectionBlock key={i} header={sec.header} body={sec.body} />
//             ))}
//           </div>
//         ) : (
//           <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
//             {msg.reply}
//           </p>
//         )}

//         {/* Charts */}
//         {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}

//         {/* Key insight callout */}
//         {msg.insight && (
//           <div style={{
//             marginTop: 16, padding: "10px 14px",
//             background: C.copperTint,
//             border: `1px solid ${C.copperBorder}`,
//             borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500,
//           }}>
//             ✦ {msg.insight}
//           </div>
//         )}

//         {/* Quick follow-up chips */}
//         {msg._followups && msg._followups.length > 0 && (
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
//             {msg._followups.map((fq, i) => (
//               <button key={i} onClick={() => onSuggestion(fq)}
//                 style={{
//                   padding: "5px 11px", background: "#FAFAFA",
//                   border: `1px solid ${C.border}`, borderRadius: 20,
//                   color: C.textLight, fontSize: 12, cursor: "pointer",
//                   fontFamily: "inherit", transition: "all 0.15s",
//                 }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//               >
//                 {fq}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Parse follow-up suggestions from reply text ───────────────────
// function extractFollowups(reply) {
//   if (!reply) return [];
//   const lines  = reply.split("\n");
//   const result = [];
//   let inFollowup = false;
//   for (const line of lines) {
//     const t = line.trim();
//     if (/(want me to|to narrow|follow.up|ask me|shall i|would you like)/i.test(t)) {
//       inFollowup = true;
//       continue;
//     }
//     if (inFollowup && (t.startsWith("•") || t.startsWith("-") || /^\d+\./.test(t))) {
//       const text = t.replace(/^[•\-\d\.]\s*/, "").trim();
//       if (text.length > 5 && text.length < 100) result.push(text);
//     }
//     if (result.length >= 3) break;
//     if (inFollowup && SECTION_EMOJIS.some(e => t.startsWith(e))) break;
//   }
//   return result;
// }

// // ── Main ChatPage ─────────────────────────────────────────────────
// export default function ChatPage() {
//   const [messages, setMessages]       = useState([]);
//   const [input, setInput]             = useState("");
//   const [loading, setLoading]         = useState(false);
//   const [history, setHistory]         = useState([]);
//   const [user, setUser]               = useState(null);
//   const [checkingAuth, setCheckingAuth] = useState(true);
//   const bottomRef = useRef(null);
//   const inputRef  = useRef(null);
//   const navigate  = useNavigate();

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//       setCheckingAuth(false);
//     });
//     const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
//       setUser(session?.user ?? null);
//     });
//     return () => listener.subscription.unsubscribe();
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async (text) => {
//     const query = (text || input).trim();
//     if (!query || loading) return;
//     if (!user) {
//       sessionStorage.setItem("acqar_chat_pending", query);
//       navigate("/login");
//       return;
//     }
//     setInput("");
//     const summary = generateSummary(query);
//     setMessages(m => [...m, { role: "user", text: query }]);
//     setLoading(true);
//     setMessages(m => [...m, { role: "thinking", summary }]);

//     try {
//       const res  = await fetch(`${BACKEND}/intelligence/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: query, history: history.slice(-6) }),
//       });
//       const json = await res.json();

//       // Extract follow-up suggestions from reply
//       const followups = extractFollowups(json.reply || "");

//       setMessages(m => [
//         ...m.filter(x => x.role !== "thinking"),
//         { role: "assistant", _query: query, _summary: summary, _followups: followups, ...json },
//       ]);
//       setHistory(h => [
//         ...h,
//         { role: "user",      content: query },
//         { role: "assistant", content: json.reply || "" },
//       ].slice(-12));
//     } catch {
//       setMessages(m => [
//         ...m.filter(x => x.role !== "thinking"),
//         { role: "assistant", reply: "Connection error. Please try again.", chart_type: "none", chart_data: [] },
//       ]);
//     }
//     setLoading(false);
//     setTimeout(() => inputRef.current?.focus(), 100);
//   };

//   if (checkingAuth) return null;

//   return (
//     <div style={{
//       height: "100vh", background: C.pageBg,
//       display: "flex",
//       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
//       overflow: "hidden",
//     }}>

//       {/* Sidebar */}
//       <div style={{
//         width: 56, background: C.bg,
//         borderRight: `1px solid ${C.border}`,
//         display: "flex", flexDirection: "column",
//         alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0,
//       }}>
//         {[
//           { label: "Chat",     active: true,  onClick: () => {},                                              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
//           { label: "Terminal", active: false, onClick: () => window.location.href = "https://www.acqar.com/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//           { label: "Areas",    active: false, onClick: () => window.location.href = "https://www.acqar.com/areas",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
//           { label: "Reports",  active: false, onClick: () => window.location.href = "https://www.acqar.com/my-reports", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//         ].map(item => (
//           <button key={item.label} onClick={item.onClick} title={item.label}
//             style={{
//               width: 44, height: 44, borderRadius: 10,
//               background: item.active ? C.copperTint : "transparent",
//               border: item.active ? `1px solid ${C.copperBorder}` : "1px solid transparent",
//               color: item.active ? C.copper : C.textMuted,
//               cursor: item.active ? "default" : "pointer",
//               display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
//               gap: 2, transition: "all 0.15s",
//             }}
//             onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = C.copperTint; e.currentTarget.style.color = C.copper; } }}
//             onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; } }}
//           >
//             {item.icon}
//             <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.2 }}>{item.label}</span>
//           </button>
//         ))}
//       </div>

//       {/* Chat area */}
//       <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>

//         {/* Header */}
//         <div style={{
//           height: 52, padding: "0 20px",
//           borderBottom: `1px solid ${C.border}`,
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//           flexShrink: 0,
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <button onClick={() => navigate(-1)}
//               style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>
//               ←
//             </button>
//             <div style={{
//               width: 26, height: 26, borderRadius: "50%",
//               background: C.copperTint, border: `1.5px solid ${C.copperBorder}`,
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: 11, color: C.copper,
//             }}>✦</div>
//             <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>ACQAR Intelligence</span>
//           </div>
//           <span style={{ fontSize: 11, color: C.textMuted }}>
//             {user ? user.email : "Not signed in"}
//           </span>
//         </div>

//         {/* Messages area */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 0" }}>
//           <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>

//             {/* Empty state */}
//             {messages.length === 0 && (
//               <div style={{ textAlign: "center", paddingTop: 60 }}>
//                 <div style={{ fontSize: 28, color: C.copper, marginBottom: 12 }}>✦</div>
//                 <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>
//                   Ask ACQAR Intelligence
//                 </h2>
//                 <p style={{ fontSize: 14, color: C.textLight, margin: "0 0 36px", lineHeight: 1.6 }}>
//                   365K+ real DLD transactions · Area analytics · Investment scores · School & community data
//                 </p>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 560, margin: "0 auto" }}>
//                   {SUGGESTIONS.map(s => (
//                     <button key={s} onClick={() => handleSend(s)}
//                       style={{
//                         padding: "10px 14px", background: "#FAFAFA",
//                         border: `1px solid ${C.border}`, borderRadius: 8,
//                         color: C.textLight, fontSize: 12, cursor: "pointer",
//                         textAlign: "left", lineHeight: 1.45, fontFamily: "inherit",
//                         transition: "all 0.15s",
//                       }}
//                       onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                       onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {messages.map((msg, i) => (
//               <Message key={i} msg={msg} onSuggestion={handleSend} />
//             ))}
//             <div ref={bottomRef} style={{ height: 20 }} />
//           </div>
//         </div>

//         {/* Input bar */}
//         <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
//           <div style={{ maxWidth: 700, margin: "0 auto" }}>
//             <div style={{
//               display: "flex", alignItems: "center", gap: 8,
//               background: "#FAFAFA",
//               border: `1.5px solid ${loading ? C.copper : C.border}`,
//               borderRadius: 12, padding: "4px 4px 4px 16px",
//               transition: "border-color 0.2s",
//               boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
//             }}>
//               <input
//                 ref={inputRef}
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
//                 placeholder={user ? "Ask anything about Dubai real estate..." : "Sign in to continue..."}
//                 disabled={loading}
//                 style={{
//                   flex: 1, padding: "10px 0",
//                   background: "transparent", border: "none", outline: "none",
//                   fontSize: 14, color: C.textPrimary, fontFamily: "inherit",
//                 }}
//               />
//               <button
//                 onClick={() => handleSend()}
//                 disabled={loading || !input.trim()}
//                 style={{
//                   width: 36, height: 36,
//                   background: loading || !input.trim() ? "#E5E7EB" : C.textPrimary,
//                   border: "none", borderRadius: 8,
//                   cursor: loading || !input.trim() ? "not-allowed" : "pointer",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   transition: "background 0.2s", flexShrink: 0,
//                 }}
//               >
//                 {loading
//                   ? <div style={{ display: "flex", gap: 2 }}>
//                       {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}
//                     </div>
//                   : <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
//                       <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//                       <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                 }
//               </button>
//             </div>
//             <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.textMuted }}>
//               Powered by Acqar · 365K+ DLD Transactions · Real closed-sale prices, not asking prices
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }













// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// const BACKEND = "https://development-production-2ad3.up.railway.app";

// const SUGGESTIONS = [
//   "Best areas for British families with kids in Dubai",
//   "Give me a full investment report on JVC",
//   "Best areas for rental yield in Dubai right now",
//   "Compare Business Bay vs Downtown Dubai",
//   "Find me a 2BR apartment under AED 2M",
//   "How do I buy property in Dubai as a foreigner?",
//   "Is Dubai Marina a good buy in 2026?",
//   "Which Dubai area has the highest investment score?",
// ];

// const BLUR_RESPONSE =
//   "The average price per sqft in Dubai Marina varies significantly based on property type " +
//   "and specific building. Based on recent DLD transactions and current market data, you can " +
//   "expect prices ranging across different tiers depending on floor level, view, and finishing " +
//   "quality. Rental yields in this area have been trending strong with investor demand remaining " +
//   "high through 2025 and into 2026.";

// // ─────────────────────────────────────────────────────────────────
// // DESIGN TOKENS  — Document 2 light theme (unchanged)
// // ─────────────────────────────────────────────────────────────────
// const C = {
//   bg:           "#FFFFFF",
//   pageBg:       "#F7F7F8",
//   textPrimary:  "#111827",
//   textSecondary:"#374151",
//   textMuted:    "#9CA3AF",
//   textLight:    "#6B7280",
//   border:       "#E5E7EB",
//   copper:       "#B87333",
//   copperBorder: "rgba(184,115,51,0.25)",
//   copperTint:   "rgba(184,115,51,0.06)",
//   userBubble:   "#F3F4F6",
// };

// // ─────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────

// function generateSummary(query) {
//   const q = query.toLowerCase();
//   if (q.includes("british") && (q.includes("school") || q.includes("community")))
//     return "Finding Dubai communities with strong British expat populations, British curriculum schools, and real DLD transaction data now.";
//   if (q.includes("family") && (q.includes("school") || q.includes("kids") || q.includes("children")))
//     return "Finding the best family communities in Dubai — checking schools, safety, parks, and real closed-sale prices now.";
//   if (q.includes("yield") || q.includes("rental income"))
//     return "Pulling the highest-yielding areas in Dubai — using real DLD transaction data, not estimates.";
//   if (q.includes("compare") || q.includes(" vs ") || q.includes("versus"))
//     return "Good comparison to make. Pulling real DLD data for both areas — investment scores, yields, and closed-sale prices side by side.";
//   if (q.includes("how") && (q.includes("buy") || q.includes("purchase") || q.includes("foreigner")))
//     return "Walking you through the Dubai property buying process step by step.";
//   if (q.includes("visa") || q.includes("golden visa"))
//     return "Looking up the latest Dubai property visa requirements and thresholds.";
//   if (q.includes("invest") || q.includes("best area") || q.includes("top area"))
//     return "Pulling the top-ranked areas by investment score, yield, and price momentum from our database.";
//   if (q.includes("afford") || q.includes("cheap") || q.includes("under aed") || q.includes("budget"))
//     return "Searching our 365K+ DLD transactions for the best value within your budget.";
//   if (q.includes("off plan") || q.includes("off-plan"))
//     return "Checking off-plan opportunities — with developer track records and delay risk data.";
//   const words = query.trim().split(/\s+/).slice(0, 8).join(" ");
//   return `Searching 365,000+ DLD transactions for: ${words}${query.split(/\s+/).length > 8 ? "..." : ""}`;
// }

// const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼"];

// function parseReplyToSections(reply) {
//   if (!reply) return null;
//   const lines    = reply.split("\n");
//   const sections = [];
//   let current    = null;

//   for (const line of lines) {
//     const trimmed = line.trim();
//     if (!trimmed) {
//       if (current) current.body += "\n";
//       continue;
//     }
//     const isHeader = SECTION_EMOJIS.some(e => trimmed.startsWith(e));
//     if (isHeader) {
//       if (current) sections.push(current);
//       current = { header: trimmed, body: "" };
//     } else {
//       if (current) {
//         current.body += (current.body ? "\n" : "") + trimmed;
//       } else {
//         sections.push({ header: null, body: trimmed });
//       }
//     }
//   }
//   if (current) sections.push(current);
//   return sections.length > 0 ? sections : null;
// }

// function highlightValues(text) {
//   return text
//     .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(AED\s?[\d,\.]+[MBK]?)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(\d+\.?\d*%)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(\d+\/100)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/\b(BUY)\b/g, '<span style="color:#065F46;font-weight:700;background:#D1FAE5;padding:1px 6px;border-radius:4px">BUY</span>')
//     .replace(/\b(HOLD)\b/g, '<span style="color:#92400E;font-weight:700;background:#FEF3C7;padding:1px 6px;border-radius:4px">HOLD</span>')
//     .replace(/\b(WATCH)\b/g, '<span style="color:#991B1B;font-weight:700;background:#FEE2E2;padding:1px 6px;border-radius:4px">WATCH</span>');
// }

// function renderLine(text, key) {
//   const trimmed = text.trim();
//   if (!trimmed) return <div key={key} style={{ height: 6 }} />;

//   if (trimmed.startsWith("⚠️")) {
//     return (
//       <div key={key} style={{
//         margin: "6px 0", padding: "8px 12px",
//         background: "#FFFBEB", borderLeft: "3px solid #F59E0B",
//         borderRadius: "0 6px 6px 0", fontSize: 13, color: "#92400E",
//       }}>
//         {trimmed}
//       </div>
//     );
//   }

//   if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
//     const cells    = trimmed.split("|").map(c => c.trim()).filter(Boolean);
//     const isHeader = cells.every(c => c.match(/^[-\s]+$/));
//     if (isHeader) return <div key={key} style={{ borderBottom: `1px solid ${C.border}`, margin: "2px 0" }} />;
//     return (
//       <div key={key} style={{
//         display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
//         gap: 4, padding: "5px 0", borderBottom: `1px solid #F3F4F6`, fontSize: 12,
//       }}>
//         {cells.map((cell, i) => (
//           <span key={i} style={{ color: i === 0 ? C.textPrimary : C.textSecondary, fontWeight: i === 0 ? 600 : 400, lineHeight: 1.5 }}
//             dangerouslySetInnerHTML={{ __html: highlightValues(cell) }} />
//         ))}
//       </div>
//     );
//   }

//   if (trimmed.includes("→") && trimmed.match(/\d/)) {
//     return (
//       <div key={key} style={{ margin: "3px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7, fontFamily: "monospace" }}>
//         {trimmed}
//       </div>
//     );
//   }

//   if (/^\d+\./.test(trimmed)) {
//     const content = trimmed.replace(/^\d+\.\s*/, "");
//     const num     = trimmed.match(/^(\d+)\./)?.[1];
//     return (
//       <div key={key} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
//         <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}
//           dangerouslySetInnerHTML={{ __html: highlightValues(content) }} />
//       </div>
//     );
//   }

//   if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
//     const txt       = trimmed.replace(/^[•\-]\s*/, "");
//     const boldMatch = txt.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
//     if (boldMatch) {
//       return (
//         <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "5px 0" }}>
//           <span style={{ color: C.copper, flexShrink: 0, marginTop: 2, fontSize: 13 }}>•</span>
//           <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>
//             <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{boldMatch[1]}</strong>
//             {boldMatch[2] ? `: ${boldMatch[2]}` : ""}
//           </span>
//         </div>
//       );
//     }
//     return (
//       <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "5px 0" }}>
//         <span style={{ color: C.copper, flexShrink: 0, marginTop: 2, fontSize: 13 }}>•</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}
//           dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
//       </div>
//     );
//   }

//   if (trimmed.startsWith("◦") || trimmed.startsWith("  •") || trimmed.startsWith("  -")) {
//     const txt = trimmed.replace(/^[◦\s•\-]+/, "");
//     return (
//       <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "3px 0", paddingLeft: 16 }}>
//         <span style={{ color: C.textMuted, flexShrink: 0, fontSize: 11, marginTop: 3 }}>◦</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}
//           dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
//       </div>
//     );
//   }

//   const colonIdx = trimmed.indexOf(":");
//   if (colonIdx > 0 && colonIdx < 32 && !trimmed.includes("→") && !trimmed.startsWith("http") && !trimmed.includes("|")) {
//     const k   = trimmed.slice(0, colonIdx).trim().replace(/\*\*/g, "");
//     const val = trimmed.slice(colonIdx + 1).trim();
//     if (k && val && k.length < 32) {
//       return (
//         <div key={key} style={{ margin: "4px 0", fontSize: 13, lineHeight: 1.65 }}>
//           <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{k}:</strong>{" "}
//           <span style={{ color: C.textSecondary }}
//             dangerouslySetInnerHTML={{ __html: highlightValues(val) }} />
//         </div>
//       );
//     }
//   }

//   return (
//     <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}
//       dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />
//   );
// }

// function SectionBlock({ header, body }) {
//   const lines = body.split("\n").filter(l => l !== undefined);
//   return (
//     <div style={{ marginBottom: 20 }}>
//       {header && (
//         <div style={{
//           fontSize: 15, fontWeight: 700, color: C.textPrimary,
//           marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
//         }}>
//           {header}
//         </div>
//       )}
//       <div>{lines.map((line, i) => renderLine(line, i))}</div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // HERO BADGES
// // ─────────────────────────────────────────────────────────────────
// function HeroBadges({ score, verdict, yieldPct, priceTrend, ranking }) {
//   if (!score && !verdict && !yieldPct) return null;
//   const verdictStyle = {
//     BUY:   { bg: "#D1FAE5", color: "#065F46" },
//     HOLD:  { bg: "#FEF3C7", color: "#92400E" },
//     WATCH: { bg: "#FEE2E2", color: "#991B1B" },
//   }[verdict] || { bg: "#F3F4F6", color: C.textPrimary };

//   return (
//     <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
//       {score && (
//         <span style={{ padding: "4px 10px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>
//           Score {score}/100
//         </span>
//       )}
//       {verdict && (
//         <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: verdictStyle.bg, color: verdictStyle.color }}>
//           {verdict}
//         </span>
//       )}
//       {yieldPct && (
//         <span style={{ padding: "4px 10px", background: "#EFF6FF", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>
//           Yield {yieldPct}%
//         </span>
//       )}
//       {priceTrend != null && (
//         <span style={{
//           padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
//           background: priceTrend > 0 ? "#D1FAE5" : "#FEE2E2",
//           color: priceTrend > 0 ? "#065F46" : "#991B1B",
//         }}>
//           {priceTrend > 0 ? "+" : ""}{priceTrend}% trend
//         </span>
//       )}
//       {ranking && (
//         <span style={{ padding: "4px 10px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.copper }}>
//           #{ranking} in Dubai
//         </span>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CHART  — Document 2 horizontal bar style
// // ─────────────────────────────────────────────────────────────────
// function SingleChart({ chart }) {
//   if (!chart?.data?.length) return null;
//   const valid = chart.data.filter(d => d.value > 0);
//   if (!valid.length) return null;
//   const max = Math.max(...valid.map(d => d.value));

//   return (
//     <div style={{ margin: "16px 0 8px", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
//       <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>
//         {chart.title}
//       </div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//         {valid.slice(0, 10).map((item, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 100, fontSize: 11, color: C.textLight, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//               {item.label}
//             </div>
//             <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
//               <div style={{
//                 height: "100%",
//                 width: `${Math.max(3, (item.value / max) * 100)}%`,
//                 background: chart.type === "line" ? "#3B82F6" : C.copper,
//                 borderRadius: 3, transition: "width 0.6s ease",
//               }} />
//             </div>
//             <div style={{ width: 64, fontSize: 11, color: C.textSecondary, fontWeight: 600, flexShrink: 0, textAlign: "right" }}>
//               {item.value?.toLocaleString()}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // THINKING DOTS
// // ─────────────────────────────────────────────────────────────────
// function ThinkingDots() {
//   return (
//     <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
//       {[0, 1, 2].map(i => (
//         <div key={i} style={{
//           width: 8, height: 8, borderRadius: "50%", background: C.textMuted,
//           animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
//         }} />
//       ))}
//       <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
//     </div>
//   );
// }

// function Avatar() {
//   return (
//     <div style={{
//       width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
//       background: C.copperTint, border: `1.5px solid ${C.copperBorder}`,
//       display: "flex", alignItems: "center", justifyContent: "center",
//       fontSize: 13, color: C.copper, fontWeight: 700,
//     }}>✦</div>
//   );
// }

// function extractFollowups(reply) {
//   if (!reply) return [];
//   const lines  = reply.split("\n");
//   const result = [];
//   let inFollowup = false;
//   for (const line of lines) {
//     const t = line.trim();
//     if (/(want me to|to narrow|follow.up|ask me|shall i|would you like)/i.test(t)) { inFollowup = true; continue; }
//     if (inFollowup && (t.startsWith("•") || t.startsWith("-") || /^\d+\./.test(t))) {
//       const text = t.replace(/^[•\-\d\.]\s*/, "").trim();
//       if (text.length > 5 && text.length < 100) result.push(text);
//     }
//     if (result.length >= 3) break;
//     if (inFollowup && SECTION_EMOJIS.some(e => t.startsWith(e))) break;
//   }
//   return result;
// }

// // ─────────────────────────────────────────────────────────────────
// // MESSAGE COMPONENT
// // ─────────────────────────────────────────────────────────────────
// function Message({ msg, onSuggestion, navigate }) {

//   // User bubble
//   if (msg.role === "user") {
//     return (
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
//         <div style={{
//           maxWidth: "75%", padding: "10px 14px",
//           background: C.userBubble,
//           borderRadius: "18px 18px 4px 18px",
//           fontSize: 14, color: C.textPrimary, lineHeight: 1.6,
//         }}>
//           {msg.text}
//         </div>
//       </div>
//     );
//   }

//   // Thinking
//   if (msg.role === "thinking") {
//     return (
//       <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
//         <Avatar />
//         <div style={{ paddingTop: 4, flex: 1 }}>
//           {msg.summary && (
//             <p style={{ margin: "0 0 12px 0", fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
//               {msg.summary}
//             </p>
//           )}
//           <ThinkingDots />
//         </div>
//       </div>
//     );
//   }

//   // ── BLURRED GATE — not logged in ──
//   if (msg.role === "blurred") {
//     return (
//       <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
//         <Avatar />
//         <div style={{ maxWidth: "75%", position: "relative" }}>
//           <div style={{
//             padding: "12px 16px", background: C.bg,
//             border: `1px solid ${C.border}`,
//             borderRadius: "18px 18px 18px 4px",
//             fontSize: 13, color: C.textPrimary, lineHeight: 1.65,
//             filter: "blur(5px)", userSelect: "none", pointerEvents: "none",
//           }}>
//             {BLUR_RESPONSE}
//           </div>
//           <div style={{
//             position: "absolute", inset: 0,
//             display: "flex", flexDirection: "column",
//             alignItems: "center", justifyContent: "center", gap: 8,
//             borderRadius: "18px 18px 18px 4px",
//             background: "rgba(255,255,255,0.75)",
//             backdropFilter: "blur(2px)",
//           }}>
//             <span style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, textAlign: "center", padding: "0 16px" }}>
//               Sign in to see the full answer
//             </span>
//             <button
//               onClick={() => navigate("/login")}
//               style={{
//                 padding: "7px 18px", background: C.copper, color: "#fff",
//                 border: "none", borderRadius: 6, fontWeight: 700,
//                 fontSize: 12, cursor: "pointer",
//               }}
//             >
//               Sign in free →
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Clarifying question
//   if (msg.is_clarifying) {
//     const lines = (msg.reply || "").split("\n").filter(l => l.trim());
//     return (
//       <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//         <Avatar />
//         <div style={{
//           flex: 1, background: C.copperTint,
//           border: `1px solid ${C.copperBorder}`,
//           borderRadius: 12, padding: "16px 18px",
//         }}>
//           {lines.map((line, i) => {
//             const trimmed = line.trim();
//             if (/^\d+\./.test(trimmed)) {
//               const content = trimmed.replace(/^\d+\.\s*/, "");
//               const num     = trimmed.match(/^(\d+)\./)?.[1];
//               return (
//                 <div key={i} style={{ display: "flex", gap: 10, margin: "10px 0", alignItems: "flex-start" }}>
//                   <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 20, fontSize: 14 }}>{num}.</span>
//                   <span style={{ color: C.textPrimary, fontWeight: 500, fontSize: 14 }}>{content}</span>
//                 </div>
//               );
//             }
//             return <p key={i} style={{ margin: "0 0 10px", color: C.textSecondary, fontSize: 14 }}>{trimmed}</p>;
//           })}
//         </div>
//       </div>
//     );
//   }

//   // ── ASSISTANT — full structured response ──
//   const sections  = parseReplyToSections(msg.reply);
//   const charts    = Array.isArray(msg.charts)
//     ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0))
//     : [];
//   const followups = msg._followups || [];

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//         {/* Summary opener */}
//         {(msg.summary || msg._summary) && (
//           <p style={{
//             margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary,
//             lineHeight: 1.75, fontWeight: 400,
//             paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
//           }}>
//             {msg.summary || msg._summary}
//           </p>
//         )}

//         {/* Hero badges — always from DB, injected by backend */}
//         <HeroBadges
//           score={msg.score}
//           verdict={msg.verdict}
//           yieldPct={msg.yield_pct}
//           priceTrend={msg.price_trend}
//           ranking={msg.ranking}
//         />

//         {/* Emoji-sectioned reply */}
//         {sections ? (
//           <div>
//             {sections.map((sec, i) => (
//               <SectionBlock key={i} header={sec.header} body={sec.body} />
//             ))}
//           </div>
//         ) : msg.reply ? (
//           <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
//             {msg.reply}
//           </p>
//         ) : null}

//         {/* Charts */}
//         {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}

//         {/* Insight callout */}
//         {msg.insight && (
//           <div style={{
//             marginTop: 16, padding: "10px 14px",
//             background: C.copperTint, border: `1px solid ${C.copperBorder}`,
//             borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500,
//           }}>
//             ✦ {msg.insight}
//           </div>
//         )}

//         {/* Follow-up chips */}
//         {followups.length > 0 && (
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
//             {followups.map((fq, i) => (
//               <button key={i} onClick={() => onSuggestion(fq)}
//                 style={{
//                   padding: "5px 11px", background: "#FAFAFA",
//                   border: `1px solid ${C.border}`, borderRadius: 20,
//                   color: C.textLight, fontSize: 12, cursor: "pointer",
//                   fontFamily: "inherit", transition: "all 0.15s",
//                 }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//               >
//                 {fq}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // MAIN PAGE
// // ─────────────────────────────────────────────────────────────────
// export default function ChatPage() {
//   const [messages,     setMessages]     = useState([]);
//   const [input,        setInput]        = useState("");
//   const [loading,      setLoading]      = useState(false);
//   const [history,      setHistory]      = useState([]);
//   const [user,         setUser]         = useState(null);
//   const [checkingAuth, setCheckingAuth] = useState(true);
//   const bottomRef = useRef(null);
//   const inputRef  = useRef(null);
//   const navigate  = useNavigate();

//   // ── Auth ──────────────────────────────────────────────────────
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//       setCheckingAuth(false);
//     });
//     const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
//       setUser(session?.user ?? null);
//     });
//     return () => listener.subscription.unsubscribe();
//   }, []);

//   // ── Auto-resume pending query after login ─────────────────────
//   useEffect(() => {
//     if (!user) return;
//     const pending = sessionStorage.getItem("acqar_chat_pending");
//     if (pending) {
//       sessionStorage.removeItem("acqar_chat_pending");
//       setMessages([]);
//       setTimeout(() => handleSend(pending), 300);
//     }
//   }, [user]);

//   // ── Auto-scroll ───────────────────────────────────────────────
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ── Send handler ──────────────────────────────────────────────
//   const handleSend = async (text) => {
//     const query = (text || input).trim();
//     if (!query || loading) return;
//     setInput("");

//     // Not logged in → blurred gate (save query, show blur)
//     if (!user) {
//       sessionStorage.setItem("acqar_chat_pending", query);
//       setMessages(m => [
//         ...m,
//         { role: "user", text: query },
//         { role: "blurred" },
//       ]);
//       return;
//     }

//     const summary = generateSummary(query);
//     setMessages(m => [...m, { role: "user", text: query }]);
//     setLoading(true);
//     setMessages(m => [...m, { role: "thinking", summary }]);

//     try {
//       const res  = await fetch(`${BACKEND}/intelligence/chat`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ message: query, history: history.slice(-6) }),
//       });
//       const json = await res.json();
//       const followups = extractFollowups(json.reply || "");

//       setMessages(m => [
//         ...m.filter(x => x.role !== "thinking"),
//         { role: "assistant", _query: query, _summary: summary, _followups: followups, ...json },
//       ]);
//       setHistory(h => [
//         ...h,
//         { role: "user",      content: query },
//         { role: "assistant", content: json.reply || "" },
//       ].slice(-12));
//     } catch {
//       setMessages(m => [
//         ...m.filter(x => x.role !== "thinking"),
//         { role: "assistant", reply: "Connection error. Please try again.", charts: [], insight: "", summary: "" },
//       ]);
//     }
//     setLoading(false);
//     setTimeout(() => inputRef.current?.focus(), 100);
//   };

//   if (checkingAuth) return null;

//   return (
//     <div style={{
//       height: "100vh", background: C.pageBg,
//       display: "flex",
//       fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
//       overflow: "hidden",
//     }}>

//       {/* ── Sidebar — exactly Document 2 ── */}
//       <div style={{
//         width: 56, background: C.bg,
//         borderRight: `1px solid ${C.border}`,
//         display: "flex", flexDirection: "column",
//         alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0,
//       }}>
//         {[
//           { label: "Chat",     active: true,  onClick: () => {},                                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
//           { label: "Terminal", active: false, onClick: () => window.location.href = "https://www.acqar.com/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//           { label: "Areas",    active: false, onClick: () => window.location.href = "https://www.acqar.com/areas",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
//           { label: "Reports",  active: false, onClick: () => window.location.href = "https://www.acqar.com/my-reports",  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//         ].map(item => (
//           <button key={item.label} onClick={item.onClick} title={item.label}
//             style={{
//               width: 44, height: 44, borderRadius: 10,
//               background: item.active ? C.copperTint : "transparent",
//               border: item.active ? `1px solid ${C.copperBorder}` : "1px solid transparent",
//               color: item.active ? C.copper : C.textMuted,
//               cursor: item.active ? "default" : "pointer",
//               display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
//               gap: 2, transition: "all 0.15s",
//             }}
//             onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = C.copperTint; e.currentTarget.style.color = C.copper; } }}
//             onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; } }}
//           >
//             {item.icon}
//             <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.2 }}>{item.label}</span>
//           </button>
//         ))}
//       </div>

//       {/* ── Chat area ── */}
//       <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>

//         {/* Header */}
//         <div style={{
//           height: 52, padding: "0 20px",
//           borderBottom: `1px solid ${C.border}`,
//           display: "flex", alignItems: "center", justifyContent: "space-between",
//           flexShrink: 0,
//         }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <button onClick={() => navigate(-1)}
//               style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>
//               ←
//             </button>
//             <div style={{
//               width: 26, height: 26, borderRadius: "50%",
//               background: C.copperTint, border: `1.5px solid ${C.copperBorder}`,
//               display: "flex", alignItems: "center", justifyContent: "center",
//               fontSize: 11, color: C.copper,
//             }}>✦</div>
//             <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>ACQAR Intelligence</span>
//           </div>
//           <span style={{ fontSize: 11, color: C.textMuted }}>
//             {user ? user.email : "Not signed in"}
//           </span>
//         </div>

//         {/* Messages */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 0" }}>
//           <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>

//             {/* Empty state — Document 2 grid */}
//             {messages.length === 0 && (
//               <div style={{ textAlign: "center", paddingTop: 60 }}>
//                 <div style={{ fontSize: 28, color: C.copper, marginBottom: 12 }}>✦</div>
//                 <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>
//                   Ask ACQAR Intelligence
//                 </h2>
//                 <p style={{ fontSize: 14, color: C.textLight, margin: "0 0 36px", lineHeight: 1.6 }}>
//                   365K+ real DLD transactions · Area analytics · Investment scores · School & community data
//                 </p>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 560, margin: "0 auto" }}>
//                   {SUGGESTIONS.map(s => (
//                     <button key={s} onClick={() => handleSend(s)}
//                       style={{
//                         padding: "10px 14px", background: "#FAFAFA",
//                         border: `1px solid ${C.border}`, borderRadius: 8,
//                         color: C.textLight, fontSize: 12, cursor: "pointer",
//                         textAlign: "left", lineHeight: 1.45, fontFamily: "inherit",
//                         transition: "all 0.15s",
//                       }}
//                       onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                       onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//                     >
//                       {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {messages.map((msg, i) => (
//               <Message key={i} msg={msg} onSuggestion={handleSend} navigate={navigate} />
//             ))}
//             <div ref={bottomRef} style={{ height: 20 }} />
//           </div>
//         </div>

//         {/* Input bar — exactly Document 2 */}
//         <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
//           <div style={{ maxWidth: 700, margin: "0 auto" }}>
//             <div style={{
//               display: "flex", alignItems: "center", gap: 8,
//               background: "#FAFAFA",
//               border: `1.5px solid ${loading ? C.copper : C.border}`,
//               borderRadius: 12, padding: "4px 4px 4px 16px",
//               transition: "border-color 0.2s",
//               boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
//             }}>
//               <input
//                 ref={inputRef}
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
//                 placeholder={user ? "Ask anything about Dubai real estate..." : "Sign in to get full answers..."}
//                 disabled={loading}
//                 style={{
//                   flex: 1, padding: "10px 0",
//                   background: "transparent", border: "none", outline: "none",
//                   fontSize: 14, color: C.textPrimary, fontFamily: "inherit",
//                 }}
//               />
//               <button
//                 onClick={() => handleSend()}
//                 disabled={loading || !input.trim()}
//                 style={{
//                   width: 36, height: 36,
//                   background: loading || !input.trim() ? "#E5E7EB" : C.textPrimary,
//                   border: "none", borderRadius: 8,
//                   cursor: loading || !input.trim() ? "not-allowed" : "pointer",
//                   display: "flex", alignItems: "center", justifyContent: "center",
//                   transition: "background 0.2s", flexShrink: 0,
//                 }}
//               >
//                 {loading
//                   ? <div style={{ display: "flex", gap: 2 }}>
//                       {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}
//                     </div>
//                   : <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
//                       <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//                       <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
//                     </svg>
//                 }
//               </button>
//             </div>
//             <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.textMuted }}>
//               Powered by Acqar · 365K+ DLD Transactions · Real closed-sale prices, not asking prices
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const BACKEND = "https://development-production-2ad3.up.railway.app";

const SUGGESTIONS = [
  "Best areas for British families with kids in Dubai",
  "Give me a full investment report on JVC",
  "Best areas for rental yield in Dubai right now",
  "Compare Business Bay vs Downtown Dubai",
  "Find me a 2BR apartment under AED 2M",
  "How do I buy property in Dubai as a foreigner?",
  "Is Dubai Marina a good buy in 2026?",
  "Which Dubai area has the highest investment score?",
];

const BLUR_RESPONSE =
  "The average price per sqft in Dubai Marina varies significantly based on property type " +
  "and specific building. Based on recent DLD transactions and current market data, you can " +
  "expect prices ranging across different tiers depending on floor level, view, and finishing " +
  "quality. Rental yields in this area have been trending strong with investor demand remaining " +
  "high through 2025 and into 2026.";

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────
const C = {
  bg:           "#FFFFFF",
  pageBg:       "#F7F7F8",
  textPrimary:  "#111827",
  textSecondary:"#374151",
  textMuted:    "#9CA3AF",
  textLight:    "#6B7280",
  border:       "#E5E7EB",
  copper:       "#B87333",
  copperBorder: "rgba(184,115,51,0.25)",
  copperTint:   "rgba(184,115,51,0.06)",
  userBubble:   "#F3F4F6",
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function generateSummary(query) {
  const q = query.toLowerCase();
  if (q.includes("british") && (q.includes("school") || q.includes("community")))
    return "Finding Dubai communities with strong British expat populations, British curriculum schools, and real DLD transaction data now.";
  if (q.includes("family") && (q.includes("school") || q.includes("kids") || q.includes("children")))
    return "Finding the best family communities in Dubai — checking schools, safety, parks, and real closed-sale prices now.";
  if (q.includes("yield") || q.includes("rental income"))
    return "Pulling the highest-yielding areas in Dubai — using real DLD transaction data, not estimates.";
  if (q.includes("compare") || q.includes(" vs ") || q.includes("versus"))
    return "Good comparison to make. Pulling real DLD data for both areas — investment scores, yields, and closed-sale prices side by side.";
  if (q.includes("how") && (q.includes("buy") || q.includes("purchase") || q.includes("foreigner")))
    return "Walking you through the Dubai property buying process step by step.";
  if (q.includes("visa") || q.includes("golden visa"))
    return "Looking up the latest Dubai property visa requirements and thresholds.";
  if (q.includes("invest") || q.includes("best area") || q.includes("top area"))
    return "Pulling the top-ranked areas by investment score, yield, and price momentum from our database.";
  if (q.includes("afford") || q.includes("cheap") || q.includes("under aed") || q.includes("budget"))
    return "Searching our 365K+ DLD transactions for the best value within your budget.";
  if (q.includes("off plan") || q.includes("off-plan"))
    return "Checking off-plan opportunities — with developer track records and delay risk data.";
  const words = query.trim().split(/\s+/).slice(0, 8).join(" ");
  return `Searching 365,000+ DLD transactions for: ${words}${query.split(/\s+/).length > 8 ? "..." : ""}`;
}

const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼"];

function parseReplyToSections(reply) {
  if (!reply) return null;
  const lines    = reply.split("\n");
  const sections = [];
  let current    = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) current.body += "\n";
      continue;
    }
    const isHeader = SECTION_EMOJIS.some(e => trimmed.startsWith(e));
    if (isHeader) {
      if (current) sections.push(current);
      current = { header: trimmed, body: "" };
    } else {
      if (current) {
        current.body += (current.body ? "\n" : "") + trimmed;
      } else {
        sections.push({ header: null, body: trimmed });
      }
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : null;
}

function highlightValues(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
    .replace(/(AED\s?[\d,\.]+[MBK]?)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
    .replace(/(\d+\.?\d*%)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
    .replace(/(\d+\/100)/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
    .replace(/\b(BUY)\b/g, '<span style="color:#065F46;font-weight:700;background:#D1FAE5;padding:1px 6px;border-radius:4px">BUY</span>')
    .replace(/\b(HOLD)\b/g, '<span style="color:#92400E;font-weight:700;background:#FEF3C7;padding:1px 6px;border-radius:4px">HOLD</span>')
    .replace(/\b(WATCH)\b/g, '<span style="color:#991B1B;font-weight:700;background:#FEE2E2;padding:1px 6px;border-radius:4px">WATCH</span>');
}

function renderLine(text, key) {
  const trimmed = text.trim();
  if (!trimmed) return <div key={key} style={{ height: 6 }} />;

  if (trimmed.startsWith("⚠️")) {
    return (
      <div key={key} style={{
        margin: "6px 0", padding: "8px 12px",
        background: "#FFFBEB", borderLeft: "3px solid #F59E0B",
        borderRadius: "0 6px 6px 0", fontSize: 13, color: "#92400E",
      }}>
        {trimmed}
      </div>
    );
  }

  if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
    const cells    = trimmed.split("|").map(c => c.trim()).filter(Boolean);
    const isHeader = cells.every(c => c.match(/^[-\s]+$/));
    if (isHeader) return <div key={key} style={{ borderBottom: `1px solid ${C.border}`, margin: "2px 0" }} />;
    return (
      <div key={key} style={{
        display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
        gap: 4, padding: "5px 0", borderBottom: `1px solid #F3F4F6`, fontSize: 12,
      }}>
        {cells.map((cell, i) => (
          <span key={i} style={{ color: i === 0 ? C.textPrimary : C.textSecondary, fontWeight: i === 0 ? 600 : 400, lineHeight: 1.5 }}
            dangerouslySetInnerHTML={{ __html: highlightValues(cell) }} />
        ))}
      </div>
    );
  }

  if (trimmed.includes("→") && trimmed.match(/\d/)) {
    return (
      <div key={key} style={{ margin: "3px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7, fontFamily: "monospace" }}>
        {trimmed}
      </div>
    );
  }

  if (/^\d+\./.test(trimmed)) {
    const content = trimmed.replace(/^\d+\.\s*/, "");
    const num     = trimmed.match(/^(\d+)\./)?.[1];
    return (
      <div key={key} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
        <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
        <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: highlightValues(content) }} />
      </div>
    );
  }

  if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
    const txt       = trimmed.replace(/^[•\-]\s*/, "");
    const boldMatch = txt.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
    if (boldMatch) {
      return (
        <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "5px 0" }}>
          <span style={{ color: C.copper, flexShrink: 0, marginTop: 2, fontSize: 13 }}>•</span>
          <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}>
            <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{boldMatch[1]}</strong>
            {boldMatch[2] ? `: ${boldMatch[2]}` : ""}
          </span>
        </div>
      );
    }
    return (
      <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "5px 0" }}>
        <span style={{ color: C.copper, flexShrink: 0, marginTop: 2, fontSize: 13 }}>•</span>
        <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }}
          dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
      </div>
    );
  }

  if (trimmed.startsWith("◦") || trimmed.startsWith("  •") || trimmed.startsWith("  -")) {
    const txt = trimmed.replace(/^[◦\s•\-]+/, "");
    return (
      <div key={key} style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "3px 0", paddingLeft: 16 }}>
        <span style={{ color: C.textMuted, flexShrink: 0, fontSize: 11, marginTop: 3 }}>◦</span>
        <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }}
          dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
      </div>
    );
  }

  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0 && colonIdx < 32 && !trimmed.includes("→") && !trimmed.startsWith("http") && !trimmed.includes("|")) {
    const k   = trimmed.slice(0, colonIdx).trim().replace(/\*\*/g, "");
    const val = trimmed.slice(colonIdx + 1).trim();
    if (k && val && k.length < 32) {
      return (
        <div key={key} style={{ margin: "4px 0", fontSize: 13, lineHeight: 1.65 }}>
          <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{k}:</strong>{" "}
          <span style={{ color: C.textSecondary }}
            dangerouslySetInnerHTML={{ __html: highlightValues(val) }} />
        </div>
      );
    }
  }

  return (
    <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}
      dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />
  );
}

function SectionBlock({ header, body }) {
  const lines = body.split("\n").filter(l => l !== undefined);
  return (
    <div style={{ marginBottom: 20 }}>
      {header && (
        <div style={{
          fontSize: 15, fontWeight: 700, color: C.textPrimary,
          marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}`,
        }}>
          {header}
        </div>
      )}
      <div>{lines.map((line, i) => renderLine(line, i))}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// HERO BADGES
// ─────────────────────────────────────────────────────────────────
function HeroBadges({ score, verdict, yieldPct, priceTrend, ranking }) {
  if (!score && !verdict && !yieldPct) return null;
  const verdictStyle = {
    BUY:   { bg: "#D1FAE5", color: "#065F46" },
    HOLD:  { bg: "#FEF3C7", color: "#92400E" },
    WATCH: { bg: "#FEE2E2", color: "#991B1B" },
  }[verdict] || { bg: "#F3F4F6", color: C.textPrimary };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
      {score && (
        <span style={{ padding: "4px 10px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>
          Score {score}/100
        </span>
      )}
      {verdict && (
        <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: verdictStyle.bg, color: verdictStyle.color }}>
          {verdict}
        </span>
      )}
      {yieldPct && (
        <span style={{ padding: "4px 10px", background: "#EFF6FF", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>
          Yield {yieldPct}%
        </span>
      )}
      {priceTrend != null && (
        <span style={{
          padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
          background: priceTrend > 0 ? "#D1FAE5" : "#FEE2E2",
          color: priceTrend > 0 ? "#065F46" : "#991B1B",
        }}>
          {priceTrend > 0 ? "+" : ""}{priceTrend}% trend
        </span>
      )}
      {ranking && (
        <span style={{ padding: "4px 10px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.copper }}>
          #{ranking} in Dubai
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CHART
// ─────────────────────────────────────────────────────────────────
function SingleChart({ chart }) {
  if (!chart?.data?.length) return null;
  const valid = chart.data.filter(d => d.value > 0);
  if (!valid.length) return null;
  const max = Math.max(...valid.map(d => d.value));

  return (
    <div style={{ margin: "16px 0 8px", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>
        {chart.title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {valid.slice(0, 10).map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 100, fontSize: 11, color: C.textLight, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </div>
            <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.max(3, (item.value / max) * 100)}%`,
                background: chart.type === "line" ? "#3B82F6" : C.copper,
                borderRadius: 3, transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{ width: 64, fontSize: 11, color: C.textSecondary, fontWeight: 600, flexShrink: 0, textAlign: "right" }}>
              {item.value?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// THINKING DOTS
// ─────────────────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: C.textMuted,
          animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

function Avatar() {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
      background: C.copperTint, border: `1.5px solid ${C.copperBorder}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 13, color: C.copper, fontWeight: 700,
    }}>✦</div>
  );
}

function extractFollowups(reply) {
  if (!reply) return [];
  const lines  = reply.split("\n");
  const result = [];
  let inFollowup = false;
  for (const line of lines) {
    const t = line.trim();
    if (/(want me to|to narrow|follow.up|ask me|shall i|would you like)/i.test(t)) { inFollowup = true; continue; }
    if (inFollowup && (t.startsWith("•") || t.startsWith("-") || /^\d+\./.test(t))) {
      const text = t.replace(/^[•\-\d\.]\s*/, "").trim();
      if (text.length > 5 && text.length < 100) result.push(text);
    }
    if (result.length >= 3) break;
    if (inFollowup && SECTION_EMOJIS.some(e => t.startsWith(e))) break;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
// MESSAGE COMPONENT
// ─────────────────────────────────────────────────────────────────
function Message({ msg, onSuggestion, navigate }) {

  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <div style={{
          maxWidth: "75%", padding: "10px 14px",
          background: C.userBubble,
          borderRadius: "18px 18px 4px 18px",
          fontSize: 14, color: C.textPrimary, lineHeight: 1.6,
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  if (msg.role === "thinking") {
    return (
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
        <Avatar />
        <div style={{ paddingTop: 4, flex: 1 }}>
          {msg.summary && (
            <p style={{ margin: "0 0 12px 0", fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
              {msg.summary}
            </p>
          )}
          <ThinkingDots />
        </div>
      </div>
    );
  }

  if (msg.role === "blurred") {
    return (
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "flex-start" }}>
        <Avatar />
        <div style={{ maxWidth: "75%", position: "relative" }}>
          <div style={{
            padding: "12px 16px", background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: "18px 18px 18px 4px",
            fontSize: 13, color: C.textPrimary, lineHeight: 1.65,
            filter: "blur(5px)", userSelect: "none", pointerEvents: "none",
          }}>
            {BLUR_RESPONSE}
          </div>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 8,
            borderRadius: "18px 18px 18px 4px",
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(2px)",
          }}>
            <span style={{ fontSize: 12, color: C.textSecondary, fontWeight: 500, textAlign: "center", padding: "0 16px" }}>
              Sign in to see the full answer
            </span>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "7px 18px", background: C.copper, color: "#fff",
                border: "none", borderRadius: 6, fontWeight: 700,
                fontSize: 12, cursor: "pointer",
              }}
            >
              Sign in free →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (msg.is_clarifying) {
    const lines = (msg.reply || "").split("\n").filter(l => l.trim());
    return (
      <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
        <Avatar />
        <div style={{
          flex: 1, background: C.copperTint,
          border: `1px solid ${C.copperBorder}`,
          borderRadius: 12, padding: "16px 18px",
        }}>
          {lines.map((line, i) => {
            const trimmed = line.trim();
            if (/^\d+\./.test(trimmed)) {
              const content = trimmed.replace(/^\d+\.\s*/, "");
              const num     = trimmed.match(/^(\d+)\./)?.[1];
              return (
                <div key={i} style={{ display: "flex", gap: 10, margin: "10px 0", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 20, fontSize: 14 }}>{num}.</span>
                  <span style={{ color: C.textPrimary, fontWeight: 500, fontSize: 14 }}>{content}</span>
                </div>
              );
            }
            return <p key={i} style={{ margin: "0 0 10px", color: C.textSecondary, fontSize: 14 }}>{trimmed}</p>;
          })}
        </div>
      </div>
    );
  }

  const sections  = parseReplyToSections(msg.reply);
  const charts    = Array.isArray(msg.charts)
    ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0))
    : [];
  const followups = msg._followups || [];

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
      <Avatar />
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

        {(msg.summary || msg._summary) && (
          <p style={{
            margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary,
            lineHeight: 1.75, fontWeight: 400,
            paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
          }}>
            {msg.summary || msg._summary}
          </p>
        )}

        <HeroBadges
          score={msg.score}
          verdict={msg.verdict}
          yieldPct={msg.yield_pct}
          priceTrend={msg.price_trend}
          ranking={msg.ranking}
        />

        {sections ? (
          <div>
            {sections.map((sec, i) => (
              <SectionBlock key={i} header={sec.header} body={sec.body} />
            ))}
          </div>
        ) : msg.reply ? (
          <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>
            {msg.reply}
          </p>
        ) : null}

        {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}

        {msg.insight && (
          <div style={{
            marginTop: 16, padding: "10px 14px",
            background: C.copperTint, border: `1px solid ${C.copperBorder}`,
            borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500,
          }}>
            ✦ {msg.insight}
          </div>
        )}

        {followups.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            {followups.map((fq, i) => (
              <button key={i} onClick={() => onSuggestion(fq)}
                style={{
                  padding: "5px 11px", background: "#FAFAFA",
                  border: `1px solid ${C.border}`, borderRadius: 20,
                  color: C.textLight, fontSize: 12, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
              >
                {fq}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [history,      setHistory]      = useState([]);
  const [user,         setUser]         = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const navigate  = useNavigate();

  // ── Auth ──────────────────────────────────────────────────────
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

  // ── KEEP-ALIVE: ping backend every 4 min to prevent Railway cold starts ──
  useEffect(() => {
    const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
    ping(); // ping immediately on page load
    const id = setInterval(ping, 4 * 60 * 1000); // then every 4 minutes
    return () => clearInterval(id);
  }, []);

  // ── Auto-resume pending query after login ─────────────────────
  useEffect(() => {
    if (!user) return;
    const pending = sessionStorage.getItem("acqar_chat_pending");
    if (pending) {
      sessionStorage.removeItem("acqar_chat_pending");
      setMessages([]);
      setTimeout(() => handleSend(pending), 300);
    }
  }, [user]);

  // ── Auto-scroll ───────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send handler ──────────────────────────────────────────────
  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;
    setInput("");

    if (!user) {
      sessionStorage.setItem("acqar_chat_pending", query);
      setMessages(m => [
        ...m,
        { role: "user", text: query },
        { role: "blurred" },
      ]);
      return;
    }

    const summary = generateSummary(query);
    setMessages(m => [...m, { role: "user", text: query }]);
    setLoading(true);
    setMessages(m => [...m, { role: "thinking", summary }]);

    try {
      const res  = await fetch(`${BACKEND}/intelligence/chat`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: query, history: history.slice(-6) }),
      });
      const json = await res.json();
      const followups = extractFollowups(json.reply || "");

      setMessages(m => [
        ...m.filter(x => x.role !== "thinking"),
        { role: "assistant", _query: query, _summary: summary, _followups: followups, ...json },
      ]);
      setHistory(h => [
        ...h,
        { role: "user",      content: query },
        { role: "assistant", content: json.reply || "" },
      ].slice(-12));
    } catch {
      setMessages(m => [
        ...m.filter(x => x.role !== "thinking"),
        { role: "assistant", reply: "Connection error. Please try again.", charts: [], insight: "", summary: "" },
      ]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (checkingAuth) return null;

  return (
    <div style={{
      height: "100vh", background: C.pageBg,
      display: "flex",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
    }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 56, background: C.bg,
        borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0,
      }}>
        {[
          { label: "Chat",     active: true,  onClick: () => {},                                                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
          { label: "Terminal", active: false, onClick: () => window.location.href = "https://www.acqar.com/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
          { label: "Areas",    active: false, onClick: () => window.location.href = "https://www.acqar.com/areas",      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
          { label: "Reports",  active: false, onClick: () => window.location.href = "https://www.acqar.com/my-reports",  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        ].map(item => (
          <button key={item.label} onClick={item.onClick} title={item.label}
            style={{
              width: 44, height: 44, borderRadius: 10,
              background: item.active ? C.copperTint : "transparent",
              border: item.active ? `1px solid ${C.copperBorder}` : "1px solid transparent",
              color: item.active ? C.copper : C.textMuted,
              cursor: item.active ? "default" : "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 2, transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = C.copperTint; e.currentTarget.style.color = C.copper; } }}
            onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; } }}
          >
            {item.icon}
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.2 }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* ── Chat area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>

        {/* Header */}
        <div style={{
          height: 52, padding: "0 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate(-1)}
              style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>
              ←
            </button>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: C.copperTint, border: `1.5px solid ${C.copperBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: C.copper,
            }}>✦</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>ACQAR Intelligence</span>
          </div>
          <span style={{ fontSize: 11, color: C.textMuted }}>
            {user ? user.email : "Not signed in"}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 0" }}>
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 20px" }}>

            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{ fontSize: 28, color: C.copper, marginBottom: 12 }}>✦</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>
                  Ask ACQAR Intelligence
                </h2>
                <p style={{ fontSize: 14, color: C.textLight, margin: "0 0 36px", lineHeight: 1.6 }}>
                  365K+ real DLD transactions · Area analytics · Investment scores · School & community data
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 560, margin: "0 auto" }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => handleSend(s)}
                      style={{
                        padding: "10px 14px", background: "#FAFAFA",
                        border: `1px solid ${C.border}`, borderRadius: 8,
                        color: C.textLight, fontSize: 12, cursor: "pointer",
                        textAlign: "left", lineHeight: 1.45, fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <Message key={i} msg={msg} onSuggestion={handleSend} navigate={navigate} />
            ))}
            <div ref={bottomRef} style={{ height: 20 }} />
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "#FAFAFA",
              border: `1.5px solid ${loading ? C.copper : C.border}`,
              borderRadius: 12, padding: "4px 4px 4px 16px",
              transition: "border-color 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={user ? "Ask anything about Dubai real estate..." : "Sign in to get full answers..."}
                disabled={loading}
                style={{
                  flex: 1, padding: "10px 0",
                  background: "transparent", border: "none", outline: "none",
                  fontSize: 14, color: C.textPrimary, fontFamily: "inherit",
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  width: 36, height: 36,
                  background: loading || !input.trim() ? "#E5E7EB" : C.textPrimary,
                  border: "none", borderRadius: 8,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.2s", flexShrink: 0,
                }}
              >
                {loading
                  ? <div style={{ display: "flex", gap: 2 }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}
                    </div>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                }
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.textMuted }}>
              Powered by Acqar · 365K+ DLD Transactions · Real closed-sale prices, not asking prices
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
