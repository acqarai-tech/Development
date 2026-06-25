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
// // DESIGN TOKENS
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
// // CHART
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

//   const sections  = parseReplyToSections(msg.reply);
//   const charts    = Array.isArray(msg.charts)
//     ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0))
//     : [];
//   const followups = msg._followups || [];

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//         {(msg.summary || msg._summary) && (
//           <p style={{
//             margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary,
//             lineHeight: 1.75, fontWeight: 400,
//             paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
//           }}>
//             {msg.summary || msg._summary}
//           </p>
//         )}

//         <HeroBadges
//           score={msg.score}
//           verdict={msg.verdict}
//           yieldPct={msg.yield_pct}
//           priceTrend={msg.price_trend}
//           ranking={msg.ranking}
//         />

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

//         {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}

//         {msg.insight && (
//           <div style={{
//             marginTop: 16, padding: "10px 14px",
//             background: C.copperTint, border: `1px solid ${C.copperBorder}`,
//             borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500,
//           }}>
//             ✦ {msg.insight}
//           </div>
//         )}

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

//   // ── KEEP-ALIVE: ping backend every 4 min to prevent Railway cold starts ──
//   useEffect(() => {
//     const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
//     ping(); // ping immediately on page load
//     const id = setInterval(ping, 4 * 60 * 1000); // then every 4 minutes
//     return () => clearInterval(id);
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

//       {/* ── Sidebar ── */}
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
// // DESIGN TOKENS
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
// // CHART
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

//   const sections  = parseReplyToSections(msg.reply);
//   const charts    = Array.isArray(msg.charts)
//     ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0))
//     : [];
//   const followups = msg._followups || [];

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//         {(msg.summary || msg._summary) && (
//           <p style={{
//             margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary,
//             lineHeight: 1.75, fontWeight: 400,
//             paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
//           }}>
//             {msg.summary || msg._summary}
//           </p>
//         )}

//         <HeroBadges
//           score={msg.score}
//           verdict={msg.verdict}
//           yieldPct={msg.yield_pct}
//           priceTrend={msg.price_trend}
//           ranking={msg.ranking}
//         />

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

//         {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}

//         {msg.insight && (
//           <div style={{
//             marginTop: 16, padding: "10px 14px",
//             background: C.copperTint, border: `1px solid ${C.copperBorder}`,
//             borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500,
//           }}>
//             ✦ {msg.insight}
//           </div>
//         )}

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

//   // ── KEEP-ALIVE: ping backend every 4 min to prevent Railway cold starts ──
//   useEffect(() => {
//     const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
//     ping(); // ping immediately on page load
//     const id = setInterval(ping, 4 * 60 * 1000); // then every 4 minutes
//     return () => clearInterval(id);
//   }, []);

//   // ── Auto-resume pending query after login ─────────────────────
 

//   // ── Auto-scroll ───────────────────────────────────────────────
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ── Send handler ──────────────────────────────────────────────
//   const handleSend = async (text) => {
//     const query = (text || input).trim();
//     if (!query || loading) return;
//     setInput("");

 

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

//       {/* ── Sidebar ── */}
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
//                 placeholder="Ask anything about Dubai real estate..."
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
// // DESIGN TOKENS
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
//     .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#B87333;text-decoration:underline;font-weight:600;">$1</a>')
//     .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#B87333;text-decoration:underline;font-weight:600;">$1</a>')
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

//   // Strip markdown links from lines — area links are shown as pills below
// const cleanTrimmed = trimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '').trim();
//   if (trimmed.includes("](")) {
//     if (!cleanTrimmed) return null;
//     return (
//       <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}
//         dangerouslySetInnerHTML={{ __html: highlightValues(cleanTrimmed) }} />
//     );
//   }

//   if (trimmed.toLowerCase() === "explore areas") return null;

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

//   if (trimmed.includes("→")) {
//     return (
//       <div key={key} style={{ margin: "3px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}
//         dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />
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
// // CHART
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

//   const sections  = parseReplyToSections(msg.reply);
//   const charts    = Array.isArray(msg.charts)
//     ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0))
//     : [];
//   const followups = msg._followups || [];

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//         {(msg.summary || msg._summary) && (
//           <p style={{
//             margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary,
//             lineHeight: 1.75, fontWeight: 400,
//             paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
//           }}>
//             {msg.summary || msg._summary}
//           </p>
//         )}

//         <HeroBadges
//           score={msg.score}
//           verdict={msg.verdict}
//           yieldPct={msg.yield_pct}
//           priceTrend={msg.price_trend}
//           ranking={msg.ranking}
//         />

//         {sections ? (
//           <div>
//             {sections.map((sec, i) => (
//               <SectionBlock key={i} header={sec.header} body={sec.body} />
//             ))}
//           </div>
//        ) : msg.reply ? (
//           <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//             dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//           />
//         ) : null}

//         {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}

//        {msg.insight && (
//           <div style={{
//             marginTop: 16, padding: "10px 14px",
//             background: C.copperTint, border: `1px solid ${C.copperBorder}`,
//             borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500,
//           }}>
//             ✦ {msg.insight}
//           </div>
//         )}

//         {msg.area_links && msg.area_links.length > 0 && (
//           <div style={{ marginTop: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>
//               Explore Areas
//             </div>
//             <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//               {msg.area_links.map((link, i) => (
//                 <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
//                   style={{ padding: "5px 11px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 20, color: C.copper, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
//                   onMouseEnter={e => { e.currentTarget.style.background = C.copper; e.currentTarget.style.color = "#fff"; }}
//                   onMouseLeave={e => { e.currentTarget.style.background = C.copperTint; e.currentTarget.style.color = C.copper; }}
//                 >
//                   {link.name}
//                 </a>
//               ))}
//             </div>
//           </div>
//         )}

// <div style={{
//           marginTop: 12, padding: "10px 14px",
//           background: "#FFFBEB", border: "1px solid #F59E0B",
//           borderRadius: 8, fontSize: 13, fontWeight: 500,
//         }}>
//           💡 BTW — You can instantly verify the real market value of any Dubai property you are looking at here →{" "}
//           <a href="https://www.acqar.com/valuation" target="_blank" rel="noopener noreferrer"
//             style={{ color: "#B87333", textDecoration: "underline", fontWeight: 700 }}>
//             https://www.acqar.com/valuation
//           </a>
//         </div>

        
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

//   // ── KEEP-ALIVE: ping backend every 4 min to prevent Railway cold starts ──
//   useEffect(() => {
//     const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
//     ping(); // ping immediately on page load
//     const id = setInterval(ping, 4 * 60 * 1000); // then every 4 minutes
//     return () => clearInterval(id);
//   }, []);

//   // ── Auto-resume pending query after login ─────────────────────
 

//   // ── Auto-scroll ───────────────────────────────────────────────
//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   // ── Send handler ──────────────────────────────────────────────
//   const handleSend = async (text) => {
//     const query = (text || input).trim();
//     if (!query || loading) return;
//     setInput("");

 

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

//       {/* ── Sidebar ── */}
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
//                 placeholder="Ask anything about Dubai real estate..."
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
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#B87333;text-decoration:underline;font-weight:600;">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#B87333;text-decoration:underline;font-weight:600;">$1</a>')
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

  // Strip markdown links from lines — area links are shown as pills below
const cleanTrimmed = trimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '').trim();
  if (trimmed.includes("](")) {
    if (!cleanTrimmed) return null;
    return (
      <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: highlightValues(cleanTrimmed) }} />
    );
  }

  if (trimmed.toLowerCase() === "explore areas") return null;

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

  if (trimmed.includes("→")) {
    return (
      <div key={key} style={{ margin: "3px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />
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


// ─── helper ───────────────────────────────────────────────────
function fmtAED(v) {
  if (!v) return "—";
  const n = parseFloat(v);
  return n >= 1_000_000
    ? `AED ${(n / 1_000_000).toFixed(2)}M`
    : `AED ${parseInt(n).toLocaleString()}`;
}

// ─── HERO STATS ROW ───────────────────────────────────────────
function HeroStatsRow({ msg }) {
  const intel    = msg.area_intelligence || {}
  const stats    = msg.transaction_stats || {}
  const userType = msg.user_type || "general"
  const yld      = msg.yield_pct
  const trend    = msg.price_trend
  const verdict  = msg.verdict
  const score    = msg.score
  const tx       = intel.tx_7d
  const txDelta  = intel.tx_7d_delta_pct
  const avgPsm   = intel.truvalu_psm || stats.avg_price_sqm
  const distress = msg.distress_pct
  const absRate  = intel.absorption_rate_pct
  const catScore = intel.catalyst_score
  const bmed     = stats.median_price_by_bedroom || {}
  const firstBr  = Object.keys(bmed)[0]
  const firstMed = bmed[firstBr]

  // Mirror Area Specialist hero row — 6 tiles, role-aware content
  let items = []

  if (userType === "buyer") {
    items = [
      tx && { lbl: "🏠 Homes Sold This Week", val: String(tx), valColor: "#DC2626", sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% vs last week` : "DLD live data", subColor: txDelta && parseFloat(txDelta) > 0 ? "#16A34A" : "#DC2626" },
      avgPsm && { lbl: "💰 What's a Fair Price Here?", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: "Truvalu™ DLD benchmark" },
      yld && { lbl: "📈 Rent Return Per Year", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? "#16A34A" : "#D97706", sub: parseFloat(yld) > 6.1 ? "Better than Dubai's 6.1% avg" : "Near Dubai average" },
      trend != null && { lbl: "📊 Price Trend", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? "#16A34A" : "#DC2626", sub: parseFloat(trend) > 0 ? "Rising — buy sooner" : "Cooling — negotiate hard" },
      firstMed && firstBr && { lbl: `🏡 ${firstBr} Fair Price`, val: firstMed >= 1_000_000 ? `AED ${(firstMed / 1_000_000).toFixed(2)}M` : `AED ${parseInt(firstMed).toLocaleString()}`, valColor: C.copper, sub: "Real DLD closed sale" },
      verdict && { lbl: "🧭 Market Mood", val: verdict === "BUY" ? "Bullish" : verdict === "HOLD" ? "Cautious" : "Slow", valColor: verdict === "BUY" ? "#16A34A" : verdict === "HOLD" ? "#D97706" : "#DC2626", sub: verdict === "BUY" ? "Good entry window" : "Watch closely" },
    ]
  }

  else if (userType === "seller") {
    const recPrice = firstMed ? Math.round(parseFloat(firstMed) * 1.06) : null
    const sellSignal = trend != null && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M"
    const sellColor  = trend != null && parseFloat(trend) > 0 ? "#16A34A" : "#D97706"
    items = [
      avgPsm && { lbl: "💰 Current Market Price", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: "Truvalu™ DLD benchmark" },
      recPrice && { lbl: "🏷️ Recommended List Price", val: recPrice >= 1_000_000 ? `AED ${(recPrice / 1_000_000).toFixed(2)}M` : `AED ${recPrice.toLocaleString()}`, valColor: C.copper, sub: `6% above DLD median — ${firstBr}` },
      trend != null && { lbl: "📈 Price Momentum", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? "#16A34A" : "#DC2626", sub: parseFloat(trend) > 0 ? "Rising — sell into strength" : "Cooling — price carefully" },
      tx && { lbl: "📊 Weekly Transactions", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "DLD live volume", subColor: txDelta && parseFloat(txDelta) > 0 ? "#16A34A" : "#DC2626" },
      distress && { lbl: "⚡ Distress Sales", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? "#DC2626" : "#16A34A", sub: parseFloat(distress) > 10 ? "High — price competitively" : "Low — sellers have leverage" },
      verdict && { lbl: "🧭 Should You Sell?", val: sellSignal, valColor: sellColor, sub: parseFloat(trend) > 0 ? "List now — demand is up" : "Wait for catalyst uplift" },
    ]
  }

  else if (userType === "investor") {
    items = [
      yld && { lbl: "📈 Gross Yield", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? "#16A34A" : "#D97706", sub: `${parseFloat(yld) > 6.1 ? "+" : ""}${(parseFloat(yld) - 6.1).toFixed(2)}% vs Dubai 6.1%`, subColor: parseFloat(yld) > 6.1 ? "#16A34A" : "#DC2626" },
      score && { lbl: "🏆 Investment Score", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? "#16A34A" : parseFloat(score) >= 60 ? "#D97706" : "#DC2626", sub: parseFloat(score) >= 75 ? "STRONG BUY" : parseFloat(score) >= 60 ? "BUY" : "HOLD" },
      trend != null && { lbl: "📊 Capital Appreciation", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? "#16A34A" : "#DC2626", sub: "Price trend year on year" },
      catScore && { lbl: "⚡ Catalyst Score", val: `${catScore}/100`, valColor: parseFloat(catScore) >= 70 ? "#16A34A" : "#D97706", sub: "Upcoming price drivers" },
      distress && { lbl: "🎯 Distress Deals", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? "#16A34A" : "#D97706", sub: parseFloat(distress) > 10 ? "Motivated sellers — opportunity" : "Stable market" },
      absRate && { lbl: "🔄 Absorption Rate", val: `${absRate}%`, valColor: parseFloat(absRate) > 50 ? "#16A34A" : "#D97706", sub: parseFloat(absRate) > 50 ? "Fast-moving demand" : "Balanced market" },
    ]
  }

  else if (userType === "broker") {
    items = [
      score && { lbl: "🏆 Investment Score", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? "#16A34A" : "#D97706", sub: verdict ? `Verdict: ${verdict}` : "Area fundamentals" },
      yld && { lbl: "📈 Gross Yield", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? "#16A34A" : "#D97706", sub: "For investor pitch decks" },
      avgPsm && { lbl: "💰 Avg Price/sqm", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "DLD Truvalu™ benchmark" },
      tx && { lbl: "📊 Weekly DLD Volume", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "Live data", subColor: txDelta && parseFloat(txDelta) > 0 ? "#16A34A" : "#DC2626" },
      distress && { lbl: "⚡ Distress %", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? "#DC2626" : "#16A34A", sub: "Share with investor clients" },
      trend != null && { lbl: "📉 Price Direction", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? "#16A34A" : "#DC2626", sub: parseFloat(trend) > 0 ? "Tell buyers: entry window now" : "Tell buyers: negotiate hard" },
    ]
  }

  else {
    items = [
      verdict && { lbl: "🧭 Verdict", val: verdict, valColor: verdict === "BUY" ? "#16A34A" : verdict === "HOLD" ? "#D97706" : "#DC2626", sub: score ? `Score ${score}/100` : "Market signal" },
      yld && { lbl: "📈 Gross Yield", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? "#16A34A" : "#D97706", sub: "vs Dubai 6.1% average" },
      avgPsm && { lbl: "💰 Avg Price/sqm", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "Truvalu™ benchmark" },
      trend != null && { lbl: "📊 Price Trend", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? "#16A34A" : "#DC2626", sub: "Year on year" },
    ]
  }

  items = items.filter(Boolean)
  if (!items.length) return null

  return (
    <div style={{ display: "flex", flexWrap: "wrap", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 16, background: "#FAFAFA" }}>
      {items.map((s, i) => (
        <div key={i} style={{ padding: "12px 16px", borderRight: i < items.length - 1 ? `1px solid ${C.border}` : "none", borderBottom: `1px solid ${C.border}`, minWidth: 120, flex: "1 1 120px" }}>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{s.lbl}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: s.valColor || C.textPrimary, marginBottom: 2 }}>{s.val}</div>
          <div style={{ fontSize: 11, color: s.subColor || C.textMuted, lineHeight: 1.3 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ─── PRICE TABLE (role-aware columns) ─────────────────────────
function PriceTable({ msg }) {
  const stats    = msg.transaction_stats || {}
  const bpsm     = stats.bedroom_avg_psm || {}
  const bmed     = stats.median_price_by_bedroom || {}
  const userType = msg.user_type || "general"
  const yld      = parseFloat(msg.yield_pct || 0)
  const rows     = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br])
  if (!rows.length) return null

  const fmtAED = v => {
    if (!v) return "—"
    const n = parseFloat(v)
    return n >= 1_000_000 ? `AED ${(n / 1_000_000).toFixed(2)}M` : `AED ${parseInt(n).toLocaleString()}`
  }

  // Mirror Area Specialist tabs: Buyer=cheapest/fair/expensive, Investor=entry+est.rent, Seller=DLD+recommended list, Broker=DLD comparables
  const config = {
    buyer: {
      title: "💰 What Does Buying Here Actually Cost? — Real DLD Data",
      headers: ["Unit Type", "Cheapest", "Fair Price", "Most Expensive"],
      row: (br) => {
        const med = parseFloat(bmed[br] || 0)
        return [br, fmtAED(Math.round(med * 0.75)), fmtAED(med), fmtAED(Math.round(med * 1.40))]
      }
    },
    seller: {
      title: "💰 DLD Closed Sales — Your Pricing Anchor",
      headers: ["Unit Type", "AED/sqm", "DLD Median", "Recommended List"],
      row: (br) => {
        const psm = parseInt(bpsm[br] || 0)
        const med = parseFloat(bmed[br] || 0)
        return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.06)) : "—"]
      }
    },
    investor: {
      title: "💰 Entry Prices + Estimated Annual Rental Income",
      headers: ["Unit Type", "AED/sqm", "Median Price", "Est. Annual Rent"],
      row: (br) => {
        const psm = parseInt(bpsm[br] || 0)
        const med = parseFloat(bmed[br] || 0)
        const rent = med && yld ? fmtAED(Math.round(med * yld / 100)) : "—"
        return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), rent]
      }
    },
    broker: {
      title: "💰 DLD Comparables — Use for Client Negotiations",
      headers: ["Unit Type", "AED/sqm", "DLD Median", "Asking (~+10%)"],
      row: (br) => {
        const psm = parseInt(bpsm[br] || 0)
        const med = parseFloat(bmed[br] || 0)
        return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.10)) : "—"]
      }
    },
    general: {
      title: "💰 Prices by Bedroom — Real DLD Data",
      headers: ["Unit Type", "AED/sqm", "Median Price", ""],
      row: (br) => {
        const psm = parseInt(bpsm[br] || 0)
        const med = parseFloat(bmed[br] || 0)
        return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), ""]
      }
    }
  }

  const { title, headers, row } = config[userType] || config.general
  const activeCols = headers.filter(Boolean)

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>{title}</div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${activeCols.length}, 1fr)`, background: "#F9FAFB", borderBottom: `1px solid ${C.border}`, padding: "8px 14px" }}>
          {activeCols.map((h, i) => <div key={i} style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>{h}</div>)}
        </div>
        {rows.map((br, i) => {
          const cells = row(br).filter((_, ci) => headers[ci])
          return (
            <div key={br} style={{ display: "grid", gridTemplateColumns: `repeat(${activeCols.length}, 1fr)`, padding: "10px 14px", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 === 0 ? "#FFF" : "#FAFAFA" }}>
              {cells.map((cell, ci) => (
                <div key={ci} style={{ fontSize: 13, fontWeight: ci === 0 ? 700 : ci === 3 ? 600 : 400, color: ci === 3 ? C.copper : ci === 0 ? C.textPrimary : C.textSecondary }}>{cell}</div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── PRICE HISTORY CHART ──────────────────────────────────────
function PriceHistoryCard({ msg }) {
  const hist  = msg.price_history || {}
  const years = Object.keys(hist).sort()
  if (years.length < 2) return null

  const vals   = years.map(y => hist[y])
  const max    = Math.max(...vals)
  const min    = Math.min(...vals)
  const range  = max - min || 1
  const first  = vals[0]
  const last   = vals[vals.length - 1]
  const chgPct = ((last - first) / first * 100).toFixed(1)
  const rising = last >= first
  const W = 500, H = 80

  const pts = years.map((y, i) => {
    const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2
    const yc = H - ((hist[y] - min) / range) * (H - 16) - 8
    return `${x},${yc}`
  }).join(" ")

  const userType = msg.user_type || "general"
  const tabLabel = userType === "investor"
    ? "📈 Capital Appreciation — Past Price History"
    : "📜 Past — Price History (AED/sqm)"

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.6 }}>{tabLabel}</div>
        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: rising ? "#D1FAE5" : "#FEE2E2", color: rising ? "#065F46" : "#991B1B" }}>
          {rising ? "+" : ""}{chgPct}% over {years.length} yr{years.length > 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 14px 8px", background: "#FAFAFA" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          <defs>
            <linearGradient id="phGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={rising ? "rgba(22,163,74,0.18)" : "rgba(220,38,38,0.18)"} />
              <stop offset="100%" stopColor="rgba(0,0,0,0.01)" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <polygon
            points={`${years.map((y, i) => { const x = years.length > 1 ? (i / (years.length - 1)) * W : W / 2; const yc = H - ((hist[y] - min) / range) * (H - 16) - 8; return `${x},${yc}` }).join(" ")} ${W},${H} 0,${H}`}
            fill="url(#phGrad)"
          />
          <polyline fill="none" stroke={rising ? "#16A34A" : "#DC2626"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
          {years.map((y, i) => {
            const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2
            const yc = H - ((hist[y] - min) / range) * (H - 16) - 8
            const isLast = i === years.length - 1
            return (
              <g key={y}>
                <circle cx={x} cy={yc} r={isLast ? 5 : 4} fill={isLast ? (rising ? "#16A34A" : "#DC2626") : "#fff"} stroke={rising ? "#16A34A" : "#DC2626"} strokeWidth="2" />
                {isLast && (
                  <>
                    <rect x={x - 40} y={yc - 22} width={80} height={17} rx={4} fill={rising ? "#16A34A" : "#DC2626"} />
                    <text x={x} y={yc - 9} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="700">AED {parseInt(hist[y]).toLocaleString()}</text>
                  </>
                )}
              </g>
            )
          })}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {years.filter((_, i) => i === 0 || i === years.length - 1 || years.length <= 5).map(y => (
            <div key={y} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.textMuted }}>{y}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary }}>{parseInt(hist[y]).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
// ─── CATALYSTS CARD (role-aware label) ────────────────────────
function CatalystsCard({ msg }) {
  const cats     = msg.area_catalysts || []
  const userType = msg.user_type || "general"
  if (!cats.length) return null

  const label = {
    buyer:    "🔭 Future — What's Coming to This Area",
    seller:   "⚡ Upcoming Catalysts That Could Help Your Sale",
    investor: "⚡ Catalysts — Confirmed Price Drivers",
    broker:   "⚡ Upcoming Catalysts — For Pitch Decks",
    general:  "🔭 Upcoming Catalysts",
  }[userType] || "🔭 Upcoming Catalysts"

  const typeColors = {
    metro:    { bg: "#EFF6FF", border: "#DBEAFE", dot: "#2563EB", label: "Metro" },
    school:   { bg: "#F0FDF4", border: "#BBF7D0", dot: "#16A34A", label: "School" },
    mall:     { bg: "#FFFBEB", border: "#FCD34D", dot: "#D97706", label: "Retail" },
    hospital: { bg: "#FDF4FF", border: "#E9D5FF", dot: "#7C3AED", label: "Health" },
    road:     { bg: "#F0F9FF", border: "#BAE6FD", dot: "#0284C7", label: "Road" },
    park:     { bg: "#F0FDF4", border: "#BBF7D0", dot: "#16A34A", label: "Park" },
    airport:  { bg: "#EFF6FF", border: "#DBEAFE", dot: "#2563EB", label: "Airport" },
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>{label}</div>
      {cats.slice(0, 4).map((c, i) => {
        const tc = typeColors[c.catalyst_type] || { bg: "#FFFBEB", border: "#FCD34D", dot: "#D97706", label: "Project" }
        const dateLabel = c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "TBC"
        const confColors = { confirmed: "#16A34A", announced: "#2563EB", likely: "#D97706", spec: "#9CA3AF" }
        return (
          <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", marginBottom: 8, background: tc.bg, border: `1px solid ${tc.border}`, borderLeft: `4px solid ${tc.dot}`, borderRadius: "0 8px 8px 0", alignItems: "flex-start" }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, background: tc.bg, color: tc.dot, border: `1px solid ${tc.border}`, textTransform: "uppercase", letterSpacing: ".08em" }}>{tc.label}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{c.name}</div>
                <div style={{ fontSize: 10, color: C.textMuted, flexShrink: 0 }}>📅 {dateLabel}</div>
              </div>
              {c.description && <div style={{ fontSize: 12, color: C.textSecondary, marginTop: 3, lineHeight: 1.5 }}>{c.description}</div>}
              {c.confidence && (
                <div style={{ marginTop: 4, fontSize: 10, fontWeight: 700, color: confColors[c.confidence] || "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em" }}>
                  {c.confidence === "confirmed" ? "✓ Confirmed" : c.confidence === "announced" ? "● Announced" : c.confidence === "likely" ? "◉ Likely" : "○ Speculative"}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
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

        <HeroStatsRow msg={msg} />
        <PriceTable msg={msg} />
        <PriceHistoryCard msg={msg} />
        <CatalystsCard msg={msg} />

        {sections ? (
          <div>
            {sections.map((sec, i) => (
              <SectionBlock key={i} header={sec.header} body={sec.body} />
            ))}
          </div>
       ) : msg.reply ? (
          <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
            dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
          />
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

        {msg.area_links && msg.area_links.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>
              Explore Areas
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {msg.area_links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "5px 11px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 20, color: C.copper, fontSize: 12, fontWeight: 600, textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.copper; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.copperTint; e.currentTarget.style.color = C.copper; }}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}

<div style={{
          marginTop: 12, padding: "10px 14px",
          background: "#FFFBEB", border: "1px solid #F59E0B",
          borderRadius: 8, fontSize: 13, fontWeight: 500,
        }}>
          💡 BTW — You can instantly verify the real market value of any Dubai property you are looking at here →{" "}
          <a href="https://www.acqar.com/valuation" target="_blank" rel="noopener noreferrer"
            style={{ color: "#B87333", textDecoration: "underline", fontWeight: 700 }}>
            https://www.acqar.com/valuation
          </a>
        </div>

        
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
 

  // ── Auto-scroll ───────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send handler ──────────────────────────────────────────────
  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;
    setInput("");

 

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
                placeholder="Ask anything about Dubai real estate..."
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

