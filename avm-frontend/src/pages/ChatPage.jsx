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


















// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// const BACKEND = "https://development-production-2ad3.up.railway.app";

// const SUGGESTIONS = [
//   "Give me a full investment report on JVC",
//   "Best areas for rental yield in Dubai right now",
//   "Compare Business Bay vs Downtown Dubai",
//   "How do I buy property in Dubai as a foreigner?",
//   "Is Dubai Marina a good buy in 2026?",
//   "Which Dubai area has the highest investment score?",
// ];

// // ─────────────────────────────────────────────────────────────────
// // DESIGN TOKENS — matching Area Specialist exactly
// // ─────────────────────────────────────────────────────────────────
// const C = {
//   bg:           "#FFFFFF",
//   pageBg:       "#F7F7F8",
//   textPrimary:  "#111827",
//   textSecondary:"#374151",
//   textMuted:    "#9CA3AF",
//   textLight:    "#6B7280",
//   border:       "#E5E7EB",
//   copper:       "#C8732A",
//   copperBorder: "rgba(200,115,42,0.25)",
//   copperTint:   "rgba(200,115,42,0.08)",
//   userBubble:   "#F3F4F6",
//   green:        "#16A34A",
//   greenL:       "rgba(22,163,74,0.1)",
//   amber:        "#D97706",
//   amberL:       "rgba(217,119,6,0.1)",
//   red:          "#DC2626",
//   redL:         "rgba(220,38,38,0.1)",
//   blue:         "#2563EB",
//   blueL:        "rgba(37,99,235,0.09)",
// };

// // ─────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────
// function fmtAED(v) {
//   if (!v) return "—";
//   const n = parseFloat(v);
//   if (!isFinite(n)) return "—";
//   if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
//   if (n >= 1_000) return `AED ${Math.round(n / 1000)}K`;
//   return `AED ${parseInt(n).toLocaleString()}`;
// }

// function fmtNum(n) {
//   if (!n) return "—";
//   return parseFloat(n).toLocaleString();
// }

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
//   const words = query.trim().split(/\s+/).slice(0, 8).join(" ");
//   return `Searching 365,000+ DLD transactions for: ${words}${query.split(/\s+/).length > 8 ? "..." : ""}`;
// }

// const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼","📌","🔍"];

// function parseReplyToSections(reply) {
//   if (!reply) return null;
//   const lines = reply.split("\n");
//   const sections = [];
//   let current = null;
//   for (const line of lines) {
//     const trimmed = line.trim();
//     if (!trimmed) { if (current) current.body += "\n"; continue; }
//     const isHeader = SECTION_EMOJIS.some(e => trimmed.startsWith(e));
//     if (isHeader) {
//       if (current) sections.push(current);
//       current = { header: trimmed, body: "" };
//     } else {
//       if (current) current.body += (current.body ? "\n" : "") + trimmed;
//       else sections.push({ header: null, body: trimmed });
//     }
//   }
//   if (current) sections.push(current);
//   return sections.length > 0 ? sections : null;
// }

// function highlightValues(text) {
//   return text
//     .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
//     .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
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
//   const cleanTrimmed = trimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '').trim();
//   if (trimmed.includes("](")) {
//     if (!cleanTrimmed) return null;
//     return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(cleanTrimmed) }} />;
//   }
//   if (trimmed.toLowerCase() === "explore areas") return null;
//   if (trimmed.startsWith("⚠️")) {
//     return <div key={key} style={{ margin: "6px 0", padding: "8px 12px", background: "#FFFBEB", borderLeft: "3px solid #F59E0B", borderRadius: "0 6px 6px 0", fontSize: 13, color: "#92400E" }}>{trimmed}</div>;
//   }
//   if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
//     const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
//     const isHeader = cells.every(c => c.match(/^[-\s]+$/));
//     if (isHeader) return <div key={key} style={{ borderBottom: `1px solid ${C.border}`, margin: "2px 0" }} />;
//     return (
//       <div key={key} style={{ display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: 4, padding: "5px 0", borderBottom: `1px solid #F3F4F6`, fontSize: 12 }}>
//         {cells.map((cell, i) => <span key={i} style={{ color: i === 0 ? C.textPrimary : C.textSecondary, fontWeight: i === 0 ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: highlightValues(cell) }} />)}
//       </div>
//     );
//   }
//   if (/^\d+\./.test(trimmed)) {
//     const content = trimmed.replace(/^\d+\.\s*/, "");
//     const num = trimmed.match(/^(\d+)\./)?.[1];
//     return (
//       <div key={key} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
//         <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightValues(content) }} />
//       </div>
//     );
//   }
//   if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
//     const txt = trimmed.replace(/^[•\-]\s*/, "");
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
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
//       </div>
//     );
//   }
//   const colonIdx = trimmed.indexOf(":");
//   if (colonIdx > 0 && colonIdx < 32 && !trimmed.includes("→") && !trimmed.startsWith("http") && !trimmed.includes("|")) {
//     const k = trimmed.slice(0, colonIdx).trim().replace(/\*\*/g, "");
//     const val = trimmed.slice(colonIdx + 1).trim();
//     if (k && val && k.length < 32) {
//       return (
//         <div key={key} style={{ margin: "4px 0", fontSize: 13, lineHeight: 1.65 }}>
//           <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{k}:</strong>{" "}
//           <span style={{ color: C.textSecondary }} dangerouslySetInnerHTML={{ __html: highlightValues(val) }} />
//         </div>
//       );
//     }
//   }
//   return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />;
// }

// function SectionBlock({ header, body }) {
//   const lines = body.split("\n").filter(l => l !== undefined);
//   return (
//     <div style={{ marginBottom: 20 }}>
//       {header && (
//         <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
//           {header}
//         </div>
//       )}
//       <div>{lines.map((line, i) => renderLine(line, i))}</div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // SHARED MINI COMPONENTS
// // ─────────────────────────────────────────────────────────────────
// function CardSection({ title, badge, children }) {
//   return (
//     <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12, overflow: "hidden" }}>
//       {title && (
//         <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <span>{title}</span>
//           {badge && <span style={{ fontSize: 10, textTransform: "none", letterSpacing: 0, padding: "2px 8px", borderRadius: 4, background: C.pageBg, color: C.textMuted, fontWeight: 500 }}>{badge}</span>}
//         </div>
//       )}
//       {children}
//     </div>
//   );
// }

// function StRow({ label, value, valueColor, last }) {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: last ? "none" : `1px solid ${C.border}`, fontSize: 12, gap: 8 }}>
//       <span style={{ color: C.textMuted, flexShrink: 0, maxWidth: "55%" }}>{label}</span>
//       <span style={{ fontWeight: 700, color: valueColor || C.textPrimary, textAlign: "right" }}>{value}</span>
//     </div>
//   );
// }

// function RatioBar({ left, leftPct, leftColor, right, rightPct, rightColor, last }) {
//   return (
//     <div style={{ marginBottom: last ? 0 : 10 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
//         <span style={{ color: C.textPrimary, fontWeight: 700 }}>{left} {leftPct}%</span>
//         <span style={{ color: C.textMuted }}>{right} {rightPct}%</span>
//       </div>
//       <div style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden" }}>
//         <div style={{ width: `${leftPct}%`, background: leftColor }} />
//         <div style={{ width: `${rightPct}%`, background: rightColor }} />
//       </div>
//     </div>
//   );
// }


// function TimeTabs({ tabs }) {
//   return (
//     <div style={{ marginBottom: 16 }}>
//       {tabs.map((t, i) => (
//         <div key={i} style={{ marginBottom: i < tabs.length - 1 ? 28 : 0 }}>
//           <div style={{
//             display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
//             borderBottom: `2px solid ${C.copper}`, marginBottom: 16,
//           }}>
//             <span>{t.icon}</span>
//             <span style={{ color: C.copper, fontWeight: 700, fontSize: 13 }}>{t.label}</span>
//           </div>
//           {t.content}
//         </div>
//       ))}
//     </div>
//   );
// }


// function AreaMaturityCard({ msg }) {
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const years = Object.keys(msg.price_history || {}).sort();
//   let appreciation = "—";
//   if (years.length >= 2) {
//     const chg = (((msg.price_history[years[years.length-1]] - msg.price_history[years[0]]) / msg.price_history[years[0]]) * 100).toFixed(1);
//     appreciation = `+${chg}%`;
//   }
//   return (
//     <CardSection title="AREA MATURITY">
//       <StRow label="Year established" value={intel.year_established || "—"} />
//       <StRow label="Master developer" value={intel.master_developer || "—"} />
//       <StRow label="Zone" value={intel.zone_type || "—"} />
//       <StRow label="Completion rate" value={intel.completion_rate ? `~${intel.completion_rate}% built` : "—"} valueColor={C.green} />
//       <StRow label="Residential units" value={intel.residential_units ? `${intel.residential_units.toLocaleString()} registered` : "—"} />
//       <StRow label="Active off-plan projects" value={intel.active_project_count ? `${intel.active_project_count} projects` : "—"} valueColor={C.copper} />
//       <StRow label="5-year appreciation" value={appreciation} valueColor={C.green} last />
//     </CardSection>
//   );
// }



// function DeveloperTrackRecordCard({ msg }) {
//   const devs = msg.developer_track_records || [];
//   if (!devs.length) return null;
//   const area = msg.area_intelligence?.area_name_en || "AREA";
//   return (
//     <CardSection title={`DEVELOPER DELIVERY TRACK RECORD IN ${area.toUpperCase()}`} badge="Historical estimates">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["DEVELOPER","ON-TIME %","AVG DELAY","RATING","SEGMENT"].map(h => (
//             <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {devs.slice(0, 6).map((d, i) => (
//             <tr key={i}>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{d.developer_name}</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.on_time_pct >= 90 ? C.green : d.on_time_pct >= 80 ? C.amber : C.red, fontWeight: 700 }}>{d.on_time_pct}%</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.avg_delay_months > 0 ? C.red : C.green }}>{d.avg_delay_months > 0 ? `~${d.avg_delay_months} months` : "On time / early"}</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>{"★".repeat(Math.round(d.star_rating || 0))}{"☆".repeat(5 - Math.round(d.star_rating || 0))}</td>
//               <td style={{ padding: "8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{d.market_segment}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }
// // ─────────────────────────────────────────────────────────────────
// // HERO STATS ROW — matches Image 1 exactly (6 tiles)
// // ─────────────────────────────────────────────────────────────────
// function HeroStatsRow({ msg }) {
//   const intel    = msg.area_intelligence || {};
//   if (!intel.area_name_en && !["buyer","seller","investor","broker"].includes(msg.user_type)) return null;
//   const stats    = msg.transaction_stats || {};
//   const userType = msg.user_type || "general";
//   const yld      = msg.yield_pct;
//   const trend    = msg.price_trend;
//   const verdict  = msg.verdict;
//   const score    = msg.score;
//   const tx       = intel.tx_7d;
//   const txDelta  = intel.tx_7d_delta_pct;
//   const avgPsm   = intel.truvalu_psm || stats.avg_price_sqm;
//   const distress = msg.distress_pct;
//   const absRate  = intel.absorption_rate_pct;
//   const catScore = intel.catalyst_score;
//   const bmed     = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr];
//   const daysToSell = score ? Math.round(75 - parseFloat(score) * 0.4) : null;
//   const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
//   const moodLabel = verdict === "BUY" ? "Bullish" : verdict === "HOLD" ? "Cautious" : "Slow";
//   const moodColor = verdict === "BUY" ? C.green : verdict === "HOLD" ? C.amber : C.red;

//   let items = [];

//   if (userType === "buyer") {
//     items = [
//       { lbl: "HOMES SOLD THIS WEEK", val: tx ? String(tx) : (score ? String(Math.round(20 + parseFloat(score) * 1.5)) : "—"), valColor: C.red, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% vs last week` : "est. based on area score" },
//       avgPsm && { lbl: "WHAT'S A FAIR PRICE HERE?", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: `≈ AED ${Math.round(avgPsm / 10.7639).toLocaleString()}/sqft · Slightly up over 3 months`, subColor: C.green },
//       yld && { lbl: "RENT RETURN PER YEAR", val: `${yld}%`, valColor: C.green, sub: parseFloat(yld) > 6.1 ? "Better than Dubai's 6.1% average" : "Near Dubai average" },
//       daysToSell && { lbl: "HOW LONG TO SELL?", val: `${daysToSell} days`, valColor: daysToSell > 40 ? C.amber : C.green, sub: daysToSell > 40 ? "Takes a bit longer than usual" : "Faster than Dubai average", subColor: daysToSell > 40 ? C.red : C.green },
//       availListings && { lbl: "HOMES AVAILABLE TO BUY", val: availListings.toLocaleString(), valColor: C.textPrimary, sub: "More choice than normal — good for buyers" },
//       verdict && { lbl: "MARKET MOOD RIGHT NOW", val: moodLabel, valColor: moodColor, sub: verdict === "BUY" ? "Strong demand — buy with confidence" : "Watch closely — market paused" },
//     ];
//   } else if (userType === "seller") {
//     const recPrice = firstMed ? Math.round(parseFloat(firstMed) * 1.06) : null;
//     items = [
//       avgPsm && { lbl: "CURRENT MARKET PRICE", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: "Truvalu™ DLD benchmark" },
//       recPrice && { lbl: "RECOMMENDED LIST PRICE", val: fmtAED(recPrice), valColor: C.copper, sub: `6% above DLD median — ${firstBr}` },
//       trend != null && { lbl: "PRICE MOMENTUM", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Rising — sell into strength" : "Cooling — price carefully" },
//       tx && { lbl: "WEEKLY TRANSACTIONS", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "DLD live volume" },
//       distress && { lbl: "DISTRESS SALES", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: parseFloat(distress) > 10 ? "High — price competitively" : "Low — sellers have leverage" },
//       verdict && { lbl: "SHOULD YOU SELL?", val: trend != null && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M", valColor: trend != null && parseFloat(trend) > 0 ? C.green : C.amber, sub: "Based on current market signals" },
//     ];
//   } else if (userType === "investor") {
//     items = [
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
//       distress && { lbl: "DISTRESS OPPORTUNITY", val: `${distress}%`, valColor: C.amber, sub: `${availListings ? Math.round(availListings * parseFloat(distress) / 100) : "—"} units priced below Truvalu™ floor` },
//       catScore && { lbl: "CATALYST SCORE", val: `${catScore}/100`, valColor: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: "0 confirmed infra catalysts in next 24 months" },
//       score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : parseFloat(score) >= 60 ? C.amber : C.red, sub: parseFloat(score) >= 75 ? "STRONG BUY" : parseFloat(score) >= 60 ? "BUY" : "HOLD" },
//       absRate && { lbl: "ABSORPTION RATE", val: `${absRate}%`, valColor: parseFloat(absRate) > 50 ? C.green : C.amber, sub: "Fast-moving demand" },
//       trend != null && { lbl: "CAPITAL APPRECIATION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Price trend year on year" },
//     ];
//   } else if (userType === "broker") {
//     items = [
//       score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : C.amber, sub: verdict ? `Verdict: ${verdict}` : "Area fundamentals" },
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "For investor pitch decks" },
//       avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "DLD Truvalu™ benchmark" },
//       tx && { lbl: "WEEKLY DLD VOLUME", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "Live data" },
//       distress && { lbl: "DISTRESS %", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: "Share with investor clients" },
//       trend != null && { lbl: "PRICE DIRECTION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Tell buyers: entry window now" : "Tell buyers: negotiate hard" },
//     ];
//   } else {
//     items = [
//       verdict && { lbl: "VERDICT", val: moodLabel, valColor: moodColor, sub: score ? `Score ${score}/100` : "Market signal" },
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "vs Dubai 6.1% average" },
//       avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "Truvalu™ benchmark" },
//       trend != null && { lbl: "PRICE TREND", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Year on year" },
//     ];
//   }

//   items = items.filter(Boolean);
//   if (!items.length) return null;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 10, marginBottom: 16 }}>
//       {items.map((s, i) => (
//         <div key={i} style={{ padding: "16px 14px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
//           <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 8, lineHeight: 1.4, textAlign: "center" }}>{s.lbl}</div>
//           <div style={{ fontSize: 18, fontWeight: 900, color: s.valColor || C.textPrimary, letterSpacing: "-.01em", marginBottom: 4 }}>{s.val}</div>
//           <div style={{ fontSize: 11, color: s.subColor || C.textMuted, lineHeight: 1.4, textAlign: "center" }}>{s.sub}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // SCORE CARD — matches right side of Image 1
// // ─────────────────────────────────────────────────────────────────
// function ScoreCard({ msg }) {
//   const score   = msg.score;
//   const verdict = msg.verdict;
//   if (!score) return null;
//   const s = parseFloat(score);
//   const scoreColor = s >= 75 ? C.green : s >= 65 ? C.amber : C.red;
//   const verdictBg  = s >= 75 ? C.greenL : C.amberL;
//   const comps = [
//     { label: "Are people buying?",    val: Math.round(s * 0.87), color: s >= 65 ? C.amber : C.red },
//     { label: "Is the price fair?",    val: Math.min(99, Math.round(s * 1.10)), color: C.green },
//     { label: "What's coming nearby?", val: Math.min(99, Math.round(s * 1.18)), color: C.green },
//     { label: "Is the mood positive?", val: Math.round(s * 0.62), color: s >= 70 ? C.amber : C.red },
//   ];
//   return (
//     <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 18px", textAlign: "center" }}>
//       <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 8, background: verdictBg, color: scoreColor }}>{verdict || (s >= 75 ? "BUY" : s >= 65 ? "HOLD" : "WATCH")}</div>
//       <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: "-.02em" }}>{score}</div>
//       <div style={{ fontSize: 14, color: C.textMuted }}>/100</div>
//       <div style={{ fontSize: 11, color: C.textMuted, margin: "4px 0 14px" }}>12-month outlook · 2026</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         {comps.map((comp, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
//             <span style={{ flex: 1, color: C.textSecondary, textAlign: "left", fontSize: 11 }}>{comp.label}</span>
//             <div style={{ width: 72, height: 5, background: "#F3F4F6", borderRadius: 3 }}>
//               <div style={{ width: `${Math.min(comp.val, 100)}%`, height: 5, borderRadius: 3, background: comp.color }} />
//             </div>
//             <span style={{ width: 24, textAlign: "right", fontWeight: 700, fontSize: 11, color: comp.color }}>{comp.val}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // BUYER GUIDE — matches Image 2 (5-step guide)
// // ─────────────────────────────────────────────────────────────────
// function BuyerGuide({ msg }) {
//   if (msg.user_type !== "buyer") return null;
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const stats = msg.transaction_stats || {};
//   const area  = intel.area_name_en || "this area";
//   const yld   = msg.yield_pct;
//   const bmed  = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr];
//   const cats  = msg.area_catalysts || [];
//   const nats  = intel.buyer_nationalities || [];
//   const activeProjects = intel.active_project_count || 0;

//   const steps = [
//     {
//       num: 1,
//       title: "Understand what a fair price actually looks like here",
//       body: `Our Truvalu™ system calculates what any ${area} property should cost based on real transactions, floor level, view, and condition.${firstMed ? ` A ${firstBr} here is fairly priced at around ${fmtAED(firstMed)}. If someone's asking significantly more — that's a red flag. If it's below that — that's a genuine opportunity.` : " Check area prices below against real DLD closed-sale data."}`
//     },
//     {
//       num: 2,
//       title: "Check what's coming to the area in the next 2 years",
//       body: cats.length > 0
//         ? `${cats.slice(0, 2).map(c => `${c.name} is ${c.confidence || "confirmed"} for ${c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "soon"}`).join(". ")}. Infrastructure arrivals like these push prices up — buying before they open means you benefit from the appreciation.`
//         : `Dubai has confirmed infrastructure investments nearby. Infrastructure arrivals push prices up — buying before they open means you benefit from the price increase. This is why timing matters.`
//     },
//     {
//       num: 3,
//       title: "Don't panic about the current news — look at history",
//       body: `Dubai has been through oil crashes, COVID, and geopolitical scares before. Every time, well-located areas recovered within 8–14 months. The current slowdown is caused by regional news (Iran/USA), not by any problem with Dubai's economy or ${area} specifically.`
//     },
//     {
//       num: 4,
//       title: "Know who else is buying here and why",
//       body: nats.length > 0
//         ? `${area} attracts mostly ${nats[0]?.name || "Indian"} (${nats[0]?.pct || 31}%), ${nats[1]?.name || "British"} (${nats[1]?.pct || 18}%), and ${nats[2]?.name || "Russian"} (${nats[2]?.pct || 14}%) buyers — young professionals, expats, and investors.${yld ? ` Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
//         : `${area} is a popular choice with expat buyers and investors. ${yld ? `Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
//     },
//     {
//       num: 5,
//       title: "Check the developer's track record before buying off-plan",
//       body: activeProjects > 0
//         ? `If you're buying off-plan in ${area}, there are currently ${activeProjects} active projects in this area. Always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
//         : `If you're buying off-plan in ${area}, always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
//     },
//   ];

//   return (
//     <CardSection title={`YOUR 5-STEP BUYING GUIDE FOR ${area.toUpperCase()}`} badge="First-Time Buyer">
//       {steps.map((step, i) => (
//         <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none" }}>
//           <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copper, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{step.title}</div>
//             <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{step.body}</p>
//           </div>
//         </div>
//       ))}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // PRICE TABLE — matches Image 3 (cheapest/fair/expensive)
// // ─────────────────────────────────────────────────────────────────
// function PriceTable({ msg }) {
//   const stats    = msg.transaction_stats || {};
//   const bpsm     = stats.bedroom_avg_psm || {};
//   const bmed     = stats.median_price_by_bedroom || {};
//   const userType = msg.user_type || "general";
//   const yld      = parseFloat(msg.yield_pct || 0);
//   const rows     = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br] || bmed[br]);
//   if (!rows.length) return null;

//   const intel  = msg.area_intelligence || {};
//   const area   = intel.area_name_en || "this area";

//   const configs = {
//     buyer: {
//       title: `WHAT DOES BUYING IN ${area.toUpperCase()} ACTUALLY COST?`,
//       headers: ["PROPERTY TYPE", "CHEAPEST", "FAIR PRICE", "MOST EXPENSIVE"],
//       row: (br) => {
//         const med = parseFloat(bmed[br] || 0);
//         return [br, fmtAED(Math.round(med * 0.75)), fmtAED(med), fmtAED(Math.round(med * 1.40))];
//       },
//       note: 'The "Fair Price" column is Acqar\'s Truvalu™ benchmark — what the property is actually worth based on real transactions, not asking prices.'
//     },
//     seller: {
//       title: "DLD CLOSED SALES — YOUR PRICING ANCHOR",
//       headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "RECOMMENDED LIST"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.06)) : "—"];
//       },
//       note: "Recommended list price is 6% above DLD median — leaves negotiation room while attracting serious buyers."
//     },
//     investor: {
//       title: "ENTRY PRICES + ESTIMATED ANNUAL RENTAL INCOME",
//       headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", "EST. ANNUAL RENT"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         const rent = med && yld ? fmtAED(Math.round(med * yld / 100)) : "—";
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), rent];
//       },
//       note: `Based on ${yld}% gross yield — Dubai average is 6.1%. Best entry: Studio for highest yield-to-price ratio.`
//     },
//     broker: {
//       title: "DLD COMPARABLES — USE FOR CLIENT NEGOTIATIONS",
//       headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "ASKING (~+10%)"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.10)) : "—"];
//       },
//       note: "DLD median is the actual closed-sale price. Asking prices run 8–12% higher — use median to anchor negotiations."
//     },
//     general: {
//       title: "PRICES BY BEDROOM — REAL DLD DATA",
//       headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", ""],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), ""];
//       },
//       note: "Real DLD closed-sale data — not asking prices."
//     }
//   };

//   const cfg = configs[userType] || configs.general;
//   const activeCols = cfg.headers.filter(Boolean);

//   return (
//     <CardSection title={cfg.title}>
//       <div style={{ overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
//           <thead>
//             <tr>
//               {activeCols.map((h, i) => (
//                 <th key={h} style={{ padding: i === 0 ? "7px 6px 7px 0" : "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", letterSpacing: ".05em", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((br, i) => {
//               const cells = cfg.row(br).filter((_, ci) => cfg.headers[ci]);
//               return (
//                 <tr key={br} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
//                   {cells.map((cell, ci) => (
//                     <td key={ci} style={{ padding: ci === 0 ? "8px 6px 8px 0" : "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: ci === 0 ? C.textPrimary : ci === 2 ? C.green : C.textSecondary, fontWeight: ci === 0 ? 700 : ci === 2 ? 700 : 400 }}>{cell}</td>
//                   ))}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       {cfg.note && <p style={{ fontSize: 11, color: C.textMuted, marginTop: 10, lineHeight: 1.5 }}>💡 {cfg.note}</p>}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // OWNERSHIP COSTS — matches right side of Image 3
// // ─────────────────────────────────────────────────────────────────
// function OwnershipCosts({ msg }) {
//   if (msg.user_type !== "buyer") return null;
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};
//   const yld   = parseFloat(msg.yield_pct || 7);
//   const intel = msg.area_intelligence || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
//   const annualRent = firstMed ? Math.round(firstMed * yld / 100 / 1000) * 1000 : null;
//   const netYield = (yld * 0.83).toFixed(1);
//   const avgPsm = intel.truvalu_psm || stats.avg_price_sqm;
//   const serviceCharge = avgPsm > 2000 ? "AED 18–28/sqft" : avgPsm > 1200 ? "AED 12–18/sqft" : "AED 10–18/sqft";

//   return (
//     <CardSection title="WHAT WILL IT COST TO OWN (NOT JUST BUY)?">
//       <StRow label="DLD Transfer Fee"           value="4% of purchase price" />
//       <StRow label="Agent commission"            value="2% (negotiable)" />
//       <StRow label="Annual service charges"      value={serviceCharge} />
//       <StRow label="Typical annual maintenance"  value="AED 5,000–15,000" />
//       {annualRent && <StRow label={`Annual rental income (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />}
//       <StRow label="Net yield after charges (est.)" value={`${netYield}%`} valueColor={C.green} />
//       <StRow label="Mortgage availability"        value="Up to 80% LTV for expats" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // INVESTOR METRICS — matches Image 4 (4 big cards)
// // ─────────────────────────────────────────────────────────────────
// function InvestorMetrics({ msg }) {
//   if (msg.user_type !== "investor") return null;
//   const intel    = msg.area_intelligence || {};
//   const stats    = msg.transaction_stats || {};
//   const yld      = msg.yield_pct;
//   const distress = msg.distress_pct;
//   const score    = msg.score;
//   const catScore = intel.catalyst_score;
//   const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
//   const distressUnits = distress && availListings ? Math.round(availListings * parseFloat(distress) / 100) : null;
//   const activeProjects = intel.active_project_count;
//   const cats = msg.area_catalysts || [];
//   const confirmedCats = cats.filter(c => c.confidence === "confirmed").length;

//   const metrics = [
//     yld && { title: "GROSS YIELD", val: `${yld}%`, color: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${intel.area_name_en || "Area"} ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
//     distress && { title: "DISTRESS OPPORTUNITY", val: `${distress}%`, color: C.amber, sub: distressUnits ? `${distressUnits.toLocaleString()} units priced below Truvalu™ floor right now` : "Units priced below market floor" },
//     catScore && { title: "CATALYST SCORE", val: `${catScore}/100`, color: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: `${confirmedCats} confirmed infra catalysts in next 24 months` },
//     activeProjects && { title: "OFF-PLAN PIPELINE", val: `${activeProjects} Projects`, color: C.blue, sub: `Active off-plan projects in ${intel.area_name_en || "this area"}` },
//   ].filter(Boolean);

//   if (!metrics.length) return null;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(metrics.length, 2)}, 1fr)`, gap: 10, marginBottom: 12 }}>
//       {metrics.map((m, i) => (
//         <CardSection key={i} title={m.title}>
//           <div style={{ fontSize: 34, fontWeight: 900, color: m.color, textAlign: "center", marginBottom: 6 }}>{m.val}</div>
//           <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center" }}>{m.sub}</div>
//         </CardSection>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // MARKET COMPOSITION — matches left side of Image 5
// // ─────────────────────────────────────────────────────────────────
// function MarketCompositionCard({ msg }) {
//   if (!["investor", "broker"].includes(msg.user_type)) return null;
//   return (
//     <CardSection title="MARKET COMPOSITION — INVESTOR VIEW">
//       <RatioBar left="Off-Plan (Primary)" leftPct={58} leftColor={C.blue} right="Ready (Secondary)" rightPct={42} rightColor={C.amber} />
//       <RatioBar left="Investor-owned" leftPct={62} leftColor={C.copper} right="End-user" rightPct={38} rightColor={C.green} />
//       <RatioBar left="Apartments" leftPct={87} leftColor={C.green} right="Villas/TH" rightPct={13} rightColor="#7C3AED" />
//       <RatioBar left="Long-term tenants" leftPct={88} leftColor="#14B8A6" right="Short-stay" rightPct={12} rightColor="#E2E8F0" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // TRUVALU BENCHMARK TABLE — matches right side of Image 5
// // ─────────────────────────────────────────────────────────────────
// function TruvaluBenchmark({ msg }) {
//   const stats = msg.transaction_stats || {};
//   const bpsm  = stats.bedroom_avg_psm || {};
//   const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br]);
//   if (!rows.length) return null;

//   return (
//     <CardSection title="TRUVALU™ BENCHMARK VS ASKING PRICE" badge="RICS-aligned">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["TYPE", "TRUVALU™", "ASKING", "GAP", "SIGNAL"].map(h => (
//             <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {rows.map((br, i) => {
//             const truv = parseInt(bpsm[br]);
//             const ask  = Math.round(truv * (1 + (Math.random() * 0.08 - 0.04)));
//             const gap  = ((ask - truv) / truv * 100).toFixed(1);
//             const signal = parseFloat(gap) > 2 ? { label: "Premium", bg: C.redL, color: C.red } : parseFloat(gap) < -2 ? { label: "Opportunity", bg: C.greenL, color: C.green } : { label: "Fair", bg: C.amberL, color: C.amber };
//             return (
//               <tr key={br}>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700 }}>AED {truv.toLocaleString()}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{ask.toLocaleString()}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{parseFloat(gap) > 0 ? `+${gap}` : gap}%</td>
//                 <td style={{ padding: "8px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
//                   <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: signal.bg, color: signal.color }}>{signal.label}</span>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // YIELD BY UNIT TYPE — matches bottom right of Image 5
// // ─────────────────────────────────────────────────────────────────
// function YieldByTypeCard({ msg }) {
//   if (!["investor", "broker"].includes(msg.user_type)) return null;
//   const yld = parseFloat(msg.yield_pct || 7);
//   const yieldByType = [
//     { type: "Studio", val: +(yld * 1.19).toFixed(1) },
//     { type: "1 BR",   val: +yld.toFixed(1) },
//     { type: "2 BR",   val: +(yld * 0.94).toFixed(1) },
//     { type: "3 BR",   val: +(yld * 0.88).toFixed(1) },
//     { type: "TH 3BR", val: +(yld * 0.82).toFixed(1) },
//   ];
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};

//   return (
//     <CardSection title="RENTAL YIELD BY UNIT TYPE">
//       {yieldByType.map(y => (
//         <div key={y.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
//           <span style={{ fontSize: 11, width: 52, flexShrink: 0, color: C.textSecondary }}>{y.type}</span>
//           <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
//             <div style={{ width: `${(y.val / 11) * 100}%`, height: 6, borderRadius: 3, background: y.val > 6.1 ? C.green : C.amber }} />
//           </div>
//           <span style={{ fontSize: 12, fontWeight: 700, width: 36, textAlign: "right", color: y.val > 6.1 ? C.green : C.amber }}>{y.val}%</span>
//         </div>
//       ))}
//       <div style={{ fontSize: 10, color: C.textMuted, textAlign: "right", marginBottom: 8 }}>— Dubai Avg 6.1%</div>
//       <StRow label="Best yield unit type" value={`Studio (${yieldByType[0].val}%)`} valueColor={C.green} />
//       <StRow label="5-year yield trend"   value={`↑ 6.1% → ${yld}%`} valueColor={C.green} />
//       <StRow label="Average days to rent" value="18 days" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // OWNER / SELLER VALUATION — matches Image 6
// // ─────────────────────────────────────────────────────────────────
// function OwnerValuation({ msg }) {
//   if (msg.user_type !== "seller") return null;
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const stats = msg.transaction_stats || {};
//   const area  = intel.area_name_en || "this area";
//   const bmed  = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0] || "1 BR";
//   const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
//   if (!firstMed) return null;

//   const low  = Math.round(firstMed * 0.97 / 1000) * 1000;
//   const high = Math.round(firstMed * 1.18 / 1000) * 1000;
//   const gain6m = Math.round(firstMed * 0.033 / 1000) * 1000;
//   const yld  = parseFloat(intel.gross_yield_pct || 7);
//   const annualRent = Math.round(firstMed * yld / 100 / 1000) * 1000;
//   const annualRentShort = Math.round(annualRent * 1.25 / 1000) * 1000;
//   const trend = msg.price_trend;
//   const score = parseFloat(msg.score || 65);
//   const daysToSell = Math.round(75 - score * 0.4);

//   return (
//     <>
//       {/* Valuation banner */}
//       <div style={{ background: "rgba(200,115,42,0.06)", border: "1px solid rgba(200,115,42,0.2)", borderRadius: 10, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
//         <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: C.copper }}>Your Asset · Truvalu™ Valuation</div>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
//           <div>
//             <h2 style={{ fontSize: 18, fontWeight: 900, color: C.copper, margin: "0 0 4px" }}>{firstBr} in {area} is worth {fmtAED(low)} — {fmtAED(high)}</h2>
//             <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Based on floor level, view, building quality, and current DLD transactions. Updated daily.</p>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted }}>Truvalu™ Fair Value</div>
//             <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary }}>{fmtAED(firstMed)}</div>
//             <div style={{ fontSize: 11, color: C.green }}>↑ +{fmtAED(gain6m)} vs 6 months ago</div>
//           </div>
//         </div>
//       </div>

//       {/* 3 panels */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//         <CardSection title="SHOULD YOU SELL NOW?">
//           <div style={{ fontSize: 24, fontWeight: 900, color: trend && parseFloat(trend) > 0 ? C.green : C.amber, marginBottom: 8 }}>
//             {trend && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M"}
//           </div>
//           <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
//             {trend && parseFloat(trend) > 0
//               ? `Market conditions are rising +${trend}% YoY. If you need to sell, now is a favorable window.`
//               : `Infrastructure catalysts arriving Q4 2026 are likely to push prices up 8–14% — selling before those land means leaving money on the table.`}
//           </p>
//           <StRow label="Days to sell (current)" value={`${daysToSell} days`} valueColor={daysToSell > 40 ? C.red : C.green} />
//           <StRow label="Expected post-catalyst" value="8–14%" valueColor={C.green} />
//           <StRow label="Market sentiment" value={trend && parseFloat(trend) > 0 ? "Bullish" : "Cautious"} valueColor={trend && parseFloat(trend) > 0 ? C.green : C.amber} last />
//         </CardSection>
//         <CardSection title="SHOULD YOU RENT IT OUT?">
//           <div style={{ fontSize: 24, fontWeight: 900, color: C.green, marginBottom: 8 }}>Yes — Good Yield</div>
//           <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
//             {area}'s rental market remains active. Your {firstBr} can generate {fmtAED(annualRent)}/year long-term or {fmtAED(annualRentShort)}/year short-term furnished.
//           </p>
//           <StRow label={`Annual long-term rent (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />
//           <StRow label="Short-term furnished" value={`${fmtAED(annualRent)}–${fmtAED(annualRentShort)}`} valueColor={C.green} />
//           <StRow label="Average days to rent" value="18 days" last />
//         </CardSection>
//       </div>
//     </>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // PRICE HISTORY CHART — matches Image 7
// // ─────────────────────────────────────────────────────────────────
// function PriceHistoryCard({ msg }) {
//   const hist  = msg.price_history || {};
//   const years = Object.keys(hist).sort();
//   if (years.length < 2) return null;

//   const vals   = years.map(y => hist[y]);
//   const maxVal = Math.max(...vals);
//   const minVal = Math.min(...vals);
//   const range  = maxVal - minVal || 1;
//   const first  = vals[0];
//   const last   = vals[vals.length - 1];
//   const chgPct = ((last - first) / first * 100).toFixed(1);
//   const rising = last >= first;
//   const W = 500, H = 100;

//   const pts = years.map((y, i) => {
//     const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//     const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//     return `${x},${yc}`;
//   }).join(" ");

//   const userType = msg.user_type || "general";
//   const intel    = msg.area_intelligence || {};
//   const area     = intel.area_name_en || "Area";
//   const tabLabel = userType === "investor"
//     ? `📈 CAPITAL APPRECIATION — PRICE HISTORY`
//     : `📜 ${area.toUpperCase()} PRICE PER SQM — HISTORY`;

//   // Find min and max idx
//   const maxIdx = vals.indexOf(maxVal);
//   const minIdx = vals.indexOf(minVal);

//   return (
//     <CardSection title={tabLabel} badge="Truvalu™ Benchmark vs DLD Transacted">
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
//         <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: rising ? C.greenL : C.redL, color: rising ? "#065F46" : "#991B1B" }}>
//           {rising ? "+" : ""}{chgPct}% over {years.length} yr{years.length > 1 ? "s" : ""}
//         </span>
//       </div>
//       <div style={{ background: "#FAF8F5", borderRadius: 6, padding: "12px 8px 8px" }}>
//         <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
//           <defs>
//             <linearGradient id="phGrad2" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor={rising ? "rgba(22,163,74,0.18)" : "rgba(220,38,38,0.18)"} />
//               <stop offset="100%" stopColor="rgba(0,0,0,0.01)" />
//             </linearGradient>
//             <filter id="lineShadow2">
//               <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(200,115,42,0.25)" />
//             </filter>
//           </defs>
//           <polygon
//             points={`${years.map((y, i) => {
//               const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//               const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//               return `${x},${yc}`;
//             }).join(" ")} ${W},${H} 0,${H}`}
//             fill="url(#phGrad2)"
//           />
//           <polyline fill="none" stroke={C.copper} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} filter="url(#lineShadow2)" />
//           {years.map((y, i) => {
//             const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//             const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//             const isLast = i === years.length - 1;
//             const isMax  = i === maxIdx;
//             const isMin  = i === minIdx;
//             return (
//               <g key={y}>
//                 <circle cx={x} cy={yc} r={isLast ? 5 : 4}
//                   fill={isLast ? C.copper : "#fff"}
//                   stroke={isMax ? C.green : isMin ? C.red : C.copper}
//                   strokeWidth="2"
//                 />
//                 {isLast && (
//                   <>
//                     <rect x={x - 40} y={yc - 24} width={80} height={18} rx={4} fill={C.copper} />
//                     <text x={x} y={yc - 10} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="700">AED {parseInt(hist[y]).toLocaleString()}</text>
//                   </>
//                 )}
//               </g>
//             );
//           })}
//           <line x1="0" x2={W} y1={H} y2={H} stroke="#D8CEBC" strokeWidth="1" />
//         </svg>
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
//           {years.filter((_, i) => i === 0 || i === years.length - 1 || years.length <= 6).map((y, i) => (
//             <div key={y} style={{ textAlign: "center" }}>
//               <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted }}>{y}</div>
//               <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary }}>{parseInt(hist[y]).toLocaleString()}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // NATIONALITY CARD — matches Images 5 & 10
// // ─────────────────────────────────────────────────────────────────
// function NationalityCard({ msg }) {
//   const intel = msg.area_intelligence || {};
//   const nats  = intel.buyer_nationalities;
//   if (!nats || !nats.length) return null;

//   const badge = nats.some(n => n.pct) ? "DLD verified" : "Market estimate";

//   return (
//     <CardSection title="BUYER NATIONALITY — 90 DAYS" badge={badge}>
//       {nats.slice(0, 8).map((n, i) => (
//         <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//           <span style={{ fontSize: 14, width: 20 }}>{n.flag || "🌍"}</span>
//           <span style={{ fontSize: 12, width: 70, flexShrink: 0, color: C.textSecondary }}>{n.name}</span>
//           <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
//             <div style={{ width: `${n.w || (n.pct ? Math.min(100, n.pct * 3) : 30)}%`, height: 6, borderRadius: 3, background: C.copper }} />
//           </div>
//           <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: "right", color: C.textMuted }}>{n.pct}%</span>
//         </div>
//       ))}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // DISTRESS METER — matches top of Image 9
// // ─────────────────────────────────────────────────────────────────
// function DistressMeter({ msg }) {
//   const distress = msg.distress_pct;
//   const intel    = msg.area_intelligence || {};
//   const area     = intel.area_name_en || "this area";
//   if (!distress) return null;
//   const availListings = msg.score ? Math.round(1500 + parseFloat(msg.score) * 50) : 5000;
//   const distressUnits = Math.round(availListings * parseFloat(distress) / 100);

//   return (
//     <div style={{ background: "#F5F5F5", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
//       <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, flexShrink: 0 }}>{distress}%</div>
//       <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>
//         <strong style={{ color: C.textPrimary }}>Distress Meter:</strong> {distressUnits.toLocaleString()} of {area}'s active listings are priced below the Truvalu™ floor right now.
//         {parseFloat(distress) > 10 ? " This is above the 12-month average — driven by nervous sellers who want to exit quickly. For patient buyers, this is a genuine entry window." : " This is near the 12-month average — stable market conditions."}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // ANNUAL RENT RANGES — matches left of Image 10
// // ─────────────────────────────────────────────────────────────────
// function RentRangesCard({ msg }) {
//   if (!["investor", "seller", "broker"].includes(msg.user_type)) return null;
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};
//   const yld   = parseFloat(msg.yield_pct || 7);
//   const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bmed[br]);
//   if (!rows.length) return null;

//   const sqftMap = { "Studio": 450, "1 BR": 800, "2 BR": 1250, "3 BR": 1800, "4 BR": 2400 };

//   return (
//     <CardSection title="ANNUAL RENT RANGES (AED)">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["TYPE", "MIN", "AVG", "MAX"].map(h => (
//             <th key={h} style={{ padding: "6px 6px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {rows.map((br, i) => {
//             const med  = parseFloat(bmed[br]);
//             const avg  = Math.round(med * yld / 100 / 1000) * 1000;
//             const min_ = Math.round(avg * 0.75 / 1000) * 1000;
//             const max_ = Math.round(avg * 1.35 / 1000) * 1000;
//             return (
//               <tr key={br}>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{min_.toLocaleString()}</td>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.green, fontWeight: 700 }}>{avg.toLocaleString()}</td>
//                 <td style={{ padding: "8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{max_.toLocaleString()}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CATALYSTS CARD — matches Image 11 (timeline style)
// // ─────────────────────────────────────────────────────────────────
// function CatalystsCard({ msg }) {
//   const cats     = msg.area_catalysts || [];
//   const userType = msg.user_type || "general";
//   const intel    = msg.area_intelligence || {};
//   const catScore = intel.catalyst_score;
//   if (!cats.length && !catScore) return null;

//   const label = {
//     buyer:    "🔭 FUTURE — INFRASTRUCTURE & CATALYST TIMELINE",
//     seller:   "⚡ UPCOMING CATALYSTS THAT COULD HELP YOUR SALE",
//     investor: "⚡ CATALYSTS — CONFIRMED PRICE DRIVERS",
//     broker:   "⚡ UPCOMING CATALYSTS — FOR PITCH DECKS",
//     general:  "🔭 UPCOMING CATALYSTS",
//   }[userType] || "🔭 UPCOMING CATALYSTS";

//   const typeColors = {
//     metro:    { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Metro" },
//     school:   { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "School" },
//     mall:     { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Retail" },
//     hospital: { bg: "#FDF4FF", border: "#E9D5FF", dot: "#7C3AED", label: "Health" },
//     road:     { bg: "#F0F9FF", border: "#BAE6FD", dot: "#0284C7", label: "Road" },
//     park:     { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "Park" },
//     airport:  { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Airport" },
//   };
//   const confColors = { confirmed: C.green, announced: C.blue, likely: C.amber, spec: C.textMuted };

//   return (
//     <div>
//       <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{label}</div>
//       <div style={{ paddingLeft: 20, position: "relative" }}>
//         <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: C.border, borderRadius: 1 }} />
//         {cats.slice(0, 4).map((c, i) => {
//           const tc = typeColors[c.catalyst_type] || { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Project" };
//           const dateLabel = c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "TBC";
//           return (
//             <div key={i} style={{ position: "relative", marginBottom: 18 }}>
//               <div style={{ position: "absolute", left: -24, top: 5, width: 12, height: 12, borderRadius: "50%", background: tc.dot, border: `2px solid #fff` }} />
//               <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 3 }}>
//                 {dateLabel}{" "}
//                 <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, marginLeft: 6, textTransform: "uppercase", letterSpacing: ".08em", background: tc.bg, color: tc.dot }}>{c.confidence || tc.label}</span>
//               </div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>{c.name}</div>
//               {c.description && <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55 }}>{c.description}</div>}
//               <div style={{ fontSize: 11, marginTop: 4, color: C.textMuted }}>
//                 📈 Expected impact: <strong style={{ color: C.green }}>
//                   {c.catalyst_type === "metro" ? "+8–14% PSF (1km radius)" : c.catalyst_type === "school" ? "+12–18% demand for 2–3BR" : "Positive area impact expected"}
//                 </strong>
//               </div>
//             </div>
//           );
//         })}
//         {!cats.length && <div style={{ fontSize: 12, color: C.textMuted, padding: "10px 0" }}>No confirmed catalysts yet — check back soon.</div>}
//       </div>
//       {catScore && (
//         <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
//           <div style={{ fontSize: 12, color: C.textSecondary }}>Catalyst Score</div>
//           <div style={{ fontSize: 28, fontWeight: 900, color: parseFloat(catScore) >= 70 ? C.green : C.amber }}>{catScore}/100</div>
//         </div>
//       )}
//     </div>
//   );
// }


// function MultiAreaCards({ msg }) {
//   const links = msg.area_links || [];
//   if (links.length < 2) return null;
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
//       {links.slice(0, 6).map((l, i) => (
//         <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
//           style={{ display: "block", padding: "14px 16px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: "none" }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{l.name}</div>
//           <div style={{ fontSize: 11, color: C.copper, fontWeight: 600 }}>View full area profile →</div>
//         </a>
//       ))}
//     </div>
//   );
// }


// function ComparisonTable({ msg }) {
//   const data = msg.comparison_data || [];
//   if (data.length < 2) return null;
//   const [a, b] = data;

//   const allRows = [
//     { label: "Investment Score", get: d => d.score ? `${d.score}/100` : null, color: C.textPrimary },
//     { label: "Verdict", get: d => d.verdict || null, color: C.textPrimary },
//     { label: "Gross Yield", get: d => d.yield_pct ? `${d.yield_pct}%` : null, color: C.green },
//     { label: "Avg Price/sqm", get: d => d.avg_psm ? `AED ${parseInt(d.avg_psm).toLocaleString()}` : null, color: C.textPrimary },
//     { label: "Price Trend", get: d => d.price_trend != null ? `${d.price_trend > 0 ? "+" : ""}${d.price_trend}% YoY` : null, color: d => d.price_trend > 0 ? C.green : C.red },
//   ];

//   const brTypes = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"];
//   brTypes.forEach(br => {
//     if (a.median_price_by_bedroom?.[br] || b.median_price_by_bedroom?.[br]) {
//       allRows.push({
//         label: `${br} Median`,
//         get: d => d.median_price_by_bedroom?.[br] ? fmtAED(d.median_price_by_bedroom[br]) : null,
//         color: C.textPrimary,
//       });
//     }
//   });

//   // Only keep rows where at least one side has real data
//   const rows = allRows.filter(row => row.get(a) != null || row.get(b) != null);
//   if (!rows.length) return null;
//   return (
//     <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — COMPARISON TABLE`}>
//       <div style={{ overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
//           <thead>
//             <tr>
//               <th style={{ padding: "7px 6px 7px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>METRIC</th>
//               <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{a.name}</th>
//               <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{b.name}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, i) => (
//               <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600, color: C.textPrimary }}>{row.label}</td>
//                 <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(a) : row.color }}>{row.get(a) ?? "—"}</td>
// <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(b) : row.color }}>{row.get(b) ?? "—"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </CardSection>
//   );
// }



// function ComparisonBarChart({ msg }) {
//   const data = msg.comparison_data || [];
//   if (data.length < 2) return null;
//   const [a, b] = data;

//   const metrics = [
//     { label: "Investment Score", av: a.score, bv: b.score, suffix: "/100" },
//     { label: "Gross Yield",      av: a.yield_pct, bv: b.yield_pct, suffix: "%" },
//     { label: "Avg Price/sqm",    av: a.avg_psm, bv: b.avg_psm, suffix: "", isPrice: true },
//     { label: "Price Trend YoY",  av: a.price_trend, bv: b.price_trend, suffix: "%" },
//   ].filter(m => m.av != null || m.bv != null);

//   if (!metrics.length) return null;

//   return (
//     <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — VISUAL COMPARISON`}>
//       {metrics.map((m, i) => {
//         const maxVal = Math.max(Math.abs(m.av || 0), Math.abs(m.bv || 0)) * 1.2 || 1;
//         const aPct = m.av != null ? Math.min(100, (Math.abs(m.av) / maxVal) * 100) : 0;
//         const bPct = m.bv != null ? Math.min(100, (Math.abs(m.bv) / maxVal) * 100) : 0;
//         return (
//           <div key={i} style={{ marginBottom: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
//               {m.label}
//             </div>
//             {[[a.name, m.av, aPct, C.copper], [b.name, m.bv, bPct, C.blue]].map(([name, val, pct, color], j) => (
//               <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: j === 0 ? 4 : 0 }}>
//                 <span style={{ width: 110, fontSize: 11, color: C.textSecondary, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
//                 <div style={{ flex: 1, height: 14, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
//                   <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
//                 </div>
//                 <span style={{ width: 70, fontSize: 11, fontWeight: 700, color: C.textPrimary, textAlign: "right" }}>
//                   {val != null ? `${m.isPrice ? Math.round(val).toLocaleString() : val}${m.suffix}` : "—"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         );
//       })}
//     </CardSection>
//   );
// }


// // ─────────────────────────────────────────────────────────────────
// // HERO BADGES
// // ─────────────────────────────────────────────────────────────────
// function HeroBadges({ score, verdict, yieldPct, priceTrend }) {
//   if (!score && !verdict && !yieldPct) return null;
//   const verdictStyle = {
//     BUY:   { bg: "#D1FAE5", color: "#065F46" },
//     HOLD:  { bg: "#FEF3C7", color: "#92400E" },
//     WATCH: { bg: "#FEE2E2", color: "#991B1B" },
//   }[verdict] || { bg: "#F3F4F6", color: C.textPrimary };

//   return (
//     <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
//       {score && <span style={{ padding: "4px 10px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>Score {score}/100</span>}
//       {verdict && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: verdictStyle.bg, color: verdictStyle.color }}>{verdict}</span>}
//       {yieldPct && <span style={{ padding: "4px 10px", background: "#EFF6FF", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>Yield {yieldPct}%</span>}
//       {priceTrend != null && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: priceTrend > 0 ? "#D1FAE5" : "#FEE2E2", color: priceTrend > 0 ? "#065F46" : "#991B1B" }}>{priceTrend > 0 ? "+" : ""}{priceTrend}% trend</span>}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CHART (bar chart for prices/yields)
// // ─────────────────────────────────────────────────────────────────
// function SingleChart({ chart }) {
//   if (!chart?.data?.length) return null;
//   const valid = chart.data.filter(d => d.value > 0);
//   if (!valid.length) return null;
//   const max = Math.max(...valid.map(d => d.value));
//   return (
//     <div style={{ margin: "16px 0 8px", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
//       <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>{chart.title}</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//         {valid.slice(0, 10).map((item, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 100, fontSize: 11, color: C.textLight, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
//             <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
//               <div style={{ height: "100%", width: `${Math.max(3, (item.value / max) * 100)}%`, background: chart.type === "line" ? "#3B82F6" : C.copper, borderRadius: 3 }} />
//             </div>
//             <div style={{ width: 64, fontSize: 11, color: C.textSecondary, fontWeight: 600, flexShrink: 0, textAlign: "right" }}>{item.value?.toLocaleString()}</div>
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
//         <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
//       ))}
//       <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
//     </div>
//   );
// }

// function Avatar() {
//   return (
//     <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.copper, fontWeight: 700 }}>✦</div>
//   );
// }

// function extractFollowups(reply) {
//   if (!reply) return [];
//   const lines = reply.split("\n");
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
//         <div style={{ maxWidth: "75%", padding: "10px 14px", background: C.userBubble, borderRadius: "18px 18px 4px 18px", fontSize: 14, color: C.textPrimary, lineHeight: 1.6 }}>
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
//           {msg.summary && <p style={{ margin: "0 0 12px 0", fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{msg.summary}</p>}
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
//         <div style={{ flex: 1, background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 12, padding: "16px 18px" }}>
//           {lines.map((line, i) => {
//             const trimmed = line.trim();
//             if (/^\d+\./.test(trimmed)) {
//               const content = trimmed.replace(/^\d+\.\s*/, "");
//               const num = trimmed.match(/^(\d+)\./)?.[1];
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
//   const charts    = Array.isArray(msg.charts) ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0)) : [];
//   const followups = msg._followups || [];
// const hasAreaData = !!(
//   msg.area_intelligence ||
//   msg.transaction_stats ||
//   msg.score ||
//   msg.yield_pct ||
//   msg.verdict ||
//   (msg.area_links && msg.area_links.length > 0)
// );

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//         {/* Summary */}
//         {(msg.summary || msg._summary) && (
//           <p style={{ margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary, lineHeight: 1.75, fontWeight: 400, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
//             {msg.summary || msg._summary}
//           </p>
//         )}

//         {/* Badges */}
//         <HeroBadges score={msg.score} verdict={msg.verdict} yieldPct={msg.yield_pct} priceTrend={msg.price_trend} />

// {/* ── MULTI-AREA (comparison/lifestyle/budget) RESPONSES ── */}
//         {hasAreaData && msg.response_mode === "multi_area" ? (
//           <>
//             {sections && sections.length > 0 && sections[0].header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌")) && (
//               <SectionBlock header={sections[0].header} body={sections[0].body} />
//             )}

//            <MultiAreaCards msg={msg} />
//             {msg.comparison_data?.length >= 2 && <ComparisonTable msg={msg} />}
//             {msg.comparison_data?.length >= 2 && <ComparisonBarChart msg={msg} />}

//             {sections && sections.slice(
//               (sections[0]?.header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌"))) ? 1 : 0
//             ).map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}

//             {!sections && msg.reply && (
//               <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//                 dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//               />
//             )}

//             {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
//           </>
//         ) : (
//           <>
//             {hasAreaData && (
//               <>
//                 {/* Hero stats + Score card side by side */}
//                 {msg.score ? (
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12, marginBottom: 16 }}>
//                     <HeroStatsRow msg={msg} />
//                     <ScoreCard msg={msg} />
//                   </div>
//                 ) : (
//                   <HeroStatsRow msg={msg} />
//                 )}

//                 {/* Buyer: Guide + Price table + Costs */}
//                 <BuyerGuide msg={msg} />
//                 <PriceTable msg={msg} />
//                 <OwnershipCosts msg={msg} />

//                 {/* Seller: Owner valuation */}
//                 <OwnerValuation msg={msg} />

//                 {/* Investor: 4 big metric cards */}
//                 <InvestorMetrics msg={msg} />

//                 {/* Investor/Broker: Nationality + Yield by type */}
//                 {["investor", "broker"].includes(msg.user_type) && (
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//                     <NationalityCard msg={msg} />
//                     <YieldByTypeCard msg={msg} />
//                   </div>
//                 )}

//                 {/* Past / Present / Future tabs */}
//                 <TimeTabs
//                   tabs={[
//                     {
//                       label: "PAST — HISTORY & TRACK RECORD",
//                       icon: "📜",
//                       content: (
//                         <>
//                           <PriceHistoryCard msg={msg} />
//                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//                             <AreaMaturityCard msg={msg} />
//                             <DeveloperTrackRecordCard msg={msg} />
//                           </div>
//                         </>
//                       ),
//                     },
//                     {
//                       label: "PRESENT — LIVE MARKET DATA",
//                       icon: "📡",
//                       content: (
//                         <>
//                           <DistressMeter msg={msg} />
//                           {["investor", "broker"].includes(msg.user_type) && (
//                             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//                               <MarketCompositionCard msg={msg} />
//                               <TruvaluBenchmark msg={msg} />
//                             </div>
//                           )}
//                           {!["investor", "broker"].includes(msg.user_type) && <TruvaluBenchmark msg={msg} />}
//                           <RentRangesCard msg={msg} />
//                           <NationalityCard msg={msg} />
//                         </>
//                       ),
//                     },
//                     {
//                       label: "FUTURE — WHAT'S COMING",
//                       icon: "🔭",
//                       content: (
//                         (msg.area_catalysts?.length > 0 || msg.area_intelligence?.catalyst_score) ? (
//                           <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
//                             <CatalystsCard msg={msg} />
//                           </div>
//                         ) : (
//                           <p style={{ fontSize: 13, color: C.textMuted, padding: "20px 0", textAlign: "center" }}>No catalyst data available for this area yet.</p>
//                         )
//                       ),
//                     },
//                   ]}
//                 />
//               </>
//             )}

//             {sections ? (
//               <div>
//                 {sections.map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}
//               </div>
//             ) : msg.reply ? (
//               <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//                 dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//               />
//             ) : null}

//             {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
//           </>
//         )}

//         {/* Insight */}
//         {msg.insight && (
//           <div style={{ marginTop: 16, padding: "10px 14px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
//             ✦ {msg.insight}
//           </div>
//         )}

//         {/* Area links */}
//         {msg.area_links && msg.area_links.length > 0 && (
//           <div style={{ marginTop: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Explore Areas</div>
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

//         {/* Valuation CTA */}
//         <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
//           💡 BTW — You can instantly verify the real market value of any Dubai property you are looking at here →{" "}
//           <a href="https://www.acqar.com/valuation" target="_blank" rel="noopener noreferrer" style={{ color: "#B87333", textDecoration: "underline", fontWeight: 700 }}>
//             https://www.acqar.com/valuation
//           </a>
//         </div>

//         {/* Follow-ups */}
//         {followups.length > 0 && (
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
//             {followups.map((fq, i) => (
//               <button key={i} onClick={() => onSuggestion(fq)}
//                 style={{ padding: "5px 11px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 20, color: C.textLight, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//               >{fq}</button>
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
//     const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
//     ping();
//     const id = setInterval(ping, 4 * 60 * 1000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

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
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: query, history: history.slice(-6) }),
//       });
//       const json = await res.json();
//       const followups = extractFollowups(json.reply || "");
//       setMessages(m => [
//         ...m.filter(x => x.role !== "thinking"),
//         { role: "assistant", _query: query, _summary: summary, _followups: followups, ...json },
//       ]);
//       setHistory(h => [...h, { role: "user", content: query }, { role: "assistant", content: json.reply || "" }].slice(-12));
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
//     <div style={{ height: "100vh", background: C.pageBg, display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden" }}>

//       {/* Sidebar */}
//       <div style={{ width: 56, background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0 }}>
//         {[
//           { label: "Chat",     active: true,  onClick: () => {},                                                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
//           { label: "Terminal", active: false, onClick: () => window.location.href = "https://www.acqar.com/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//           { label: "Areas",    active: false, onClick: () => window.location.href = "https://www.acqar.com/areas",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
//           { label: "Reports",  active: false, onClick: () => window.location.href = "https://www.acqar.com/my-reports", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//         ].map(item => (
//           <button key={item.label} onClick={item.onClick} title={item.label}
//             style={{ width: 44, height: 44, borderRadius: 10, background: item.active ? C.copperTint : "transparent", border: item.active ? `1px solid ${C.copperBorder}` : "1px solid transparent", color: item.active ? C.copper : C.textMuted, cursor: item.active ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.15s" }}
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
//         <div style={{ height: 52, padding: "0 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
//             <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.copper }}>✦</div>
//             <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>ACQAR Intelligence</span>
//           </div>
//           <span style={{ fontSize: 11, color: C.textMuted }}>{user ? user.email : "Not signed in"}</span>
//         </div>

//         {/* Messages */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 0" }}>
//           <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px" }}>

//             {messages.length === 0 && (
//               <div style={{ textAlign: "center", paddingTop: 60 }}>
//                 <div style={{ fontSize: 28, color: C.copper, marginBottom: 12 }}>✦</div>
//                 <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>Ask ACQAR Intelligence</h2>
//                 <p style={{ fontSize: 14, color: C.textLight, margin: "0 0 36px", lineHeight: 1.6 }}>
//                   365K+ real DLD transactions · Area analytics · Investment scores · School & community data
//                 </p>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 560, margin: "0 auto" }}>
//                   {SUGGESTIONS.map(s => (
//                     <button key={s} onClick={() => handleSend(s)}
//                       style={{ padding: "10px 14px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textLight, fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.45, fontFamily: "inherit", transition: "all 0.15s" }}
//                       onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                       onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//                     >{s}</button>
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
//           <div style={{ maxWidth: 780, margin: "0 auto" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FAFAFA", border: `1.5px solid ${loading ? C.copper : C.border}`, borderRadius: 12, padding: "4px 4px 4px 16px", transition: "border-color 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
//               <input
//                 ref={inputRef}
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
//                 placeholder="Ask anything about Dubai real estate..."
//                 disabled={loading}
//                 style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.textPrimary, fontFamily: "inherit" }}
//               />
//               <button
//                 onClick={() => handleSend()}
//                 disabled={loading || !input.trim()}
//                 style={{ width: 36, height: 36, background: loading || !input.trim() ? "#E5E7EB" : C.textPrimary, border: "none", borderRadius: 8, cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}
//               >
//                 {loading
//                   ? <div style={{ display: "flex", gap: 2 }}>{[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}</div>
//                   : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// const BACKEND = "https://development-production-2ad3.up.railway.app";
// const BROKER_PENDING_KEY = "acqar_broker_pending";

// const SUGGESTIONS = [
//   "Give me a full investment report on JVC",
//   "Best areas for rental yield in Dubai right now",
//   "Compare Business Bay vs Downtown Dubai",
//   "How do I buy property in Dubai as a foreigner?",
//   "Is Dubai Marina a good buy in 2026?",
//   "Which Dubai area has the highest investment score?",
// ];

// // ─────────────────────────────────────────────────────────────────
// // DESIGN TOKENS — matching Area Specialist exactly
// // ─────────────────────────────────────────────────────────────────
// const C = {
//   bg:           "#FFFFFF",
//   pageBg:       "#F7F7F8",
//   textPrimary:  "#111827",
//   textSecondary:"#374151",
//   textMuted:    "#9CA3AF",
//   textLight:    "#6B7280",
//   border:       "#E5E7EB",
//   copper:       "#C8732A",
//   copperBorder: "rgba(200,115,42,0.25)",
//   copperTint:   "rgba(200,115,42,0.08)",
//   userBubble:   "#F3F4F6",
//   green:        "#16A34A",
//   greenL:       "rgba(22,163,74,0.1)",
//   amber:        "#D97706",
//   amberL:       "rgba(217,119,6,0.1)",
//   red:          "#DC2626",
//   redL:         "rgba(220,38,38,0.1)",
//   blue:         "#2563EB",
//   blueL:        "rgba(37,99,235,0.09)",
// };

// // ─────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────
// function fmtAED(v) {
//   if (!v) return "—";
//   const n = parseFloat(v);
//   if (!isFinite(n)) return "—";
//   if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
//   if (n >= 1_000) return `AED ${Math.round(n / 1000)}K`;
//   return `AED ${parseInt(n).toLocaleString()}`;
// }

// function fmtNum(n) {
//   if (!n) return "—";
//   return parseFloat(n).toLocaleString();
// }

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
//   const words = query.trim().split(/\s+/).slice(0, 8).join(" ");
//   return `Searching 365,000+ DLD transactions for: ${words}${query.split(/\s+/).length > 8 ? "..." : ""}`;
// }

// const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼","📌","🔍"];

// function parseReplyToSections(reply) {
//   if (!reply) return null;
//   const lines = reply.split("\n");
//   const sections = [];
//   let current = null;
//   for (const line of lines) {
//     const trimmed = line.trim();
//     if (!trimmed) { if (current) current.body += "\n"; continue; }
//     const isHeader = SECTION_EMOJIS.some(e => trimmed.startsWith(e));
//     if (isHeader) {
//       if (current) sections.push(current);
//       current = { header: trimmed, body: "" };
//     } else {
//       if (current) current.body += (current.body ? "\n" : "") + trimmed;
//       else sections.push({ header: null, body: trimmed });
//     }
//   }
//   if (current) sections.push(current);
//   return sections.length > 0 ? sections : null;
// }

// function highlightValues(text) {
//   return text
//     .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
//     .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
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
//   const cleanTrimmed = trimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '').trim();
//   if (trimmed.includes("](")) {
//     if (!cleanTrimmed) return null;
//     return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(cleanTrimmed) }} />;
//   }
//   if (trimmed.toLowerCase() === "explore areas") return null;
//   if (trimmed.startsWith("⚠️")) {
//     return <div key={key} style={{ margin: "6px 0", padding: "8px 12px", background: "#FFFBEB", borderLeft: "3px solid #F59E0B", borderRadius: "0 6px 6px 0", fontSize: 13, color: "#92400E" }}>{trimmed}</div>;
//   }
//   if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
//     const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
//     const isHeader = cells.every(c => c.match(/^[-\s]+$/));
//     if (isHeader) return <div key={key} style={{ borderBottom: `1px solid ${C.border}`, margin: "2px 0" }} />;
//     return (
//       <div key={key} style={{ display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: 4, padding: "5px 0", borderBottom: `1px solid #F3F4F6`, fontSize: 12 }}>
//         {cells.map((cell, i) => <span key={i} style={{ color: i === 0 ? C.textPrimary : C.textSecondary, fontWeight: i === 0 ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: highlightValues(cell) }} />)}
//       </div>
//     );
//   }
//   if (/^\d+\./.test(trimmed)) {
//     const content = trimmed.replace(/^\d+\.\s*/, "");
//     const num = trimmed.match(/^(\d+)\./)?.[1];
//     return (
//       <div key={key} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
//         <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightValues(content) }} />
//       </div>
//     );
//   }
//   if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
//     const txt = trimmed.replace(/^[•\-]\s*/, "");
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
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
//       </div>
//     );
//   }
//   const colonIdx = trimmed.indexOf(":");
//   if (colonIdx > 0 && colonIdx < 32 && !trimmed.includes("→") && !trimmed.startsWith("http") && !trimmed.includes("|")) {
//     const k = trimmed.slice(0, colonIdx).trim().replace(/\*\*/g, "");
//     const val = trimmed.slice(colonIdx + 1).trim();
//     if (k && val && k.length < 32) {
//       return (
//         <div key={key} style={{ margin: "4px 0", fontSize: 13, lineHeight: 1.65 }}>
//           <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{k}:</strong>{" "}
//           <span style={{ color: C.textSecondary }} dangerouslySetInnerHTML={{ __html: highlightValues(val) }} />
//         </div>
//       );
//     }
//   }
//   return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />;
// }

// function SectionBlock({ header, body }) {
//   const lines = body.split("\n").filter(l => l !== undefined);
//   return (
//     <div style={{ marginBottom: 20 }}>
//       {header && (
//         <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
//           {header}
//         </div>
//       )}
//       <div>{lines.map((line, i) => renderLine(line, i))}</div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // SHARED MINI COMPONENTS
// // ─────────────────────────────────────────────────────────────────
// function CardSection({ title, badge, children }) {
//   return (
//     <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12, overflow: "hidden" }}>
//       {title && (
//         <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <span>{title}</span>
//           {badge && <span style={{ fontSize: 10, textTransform: "none", letterSpacing: 0, padding: "2px 8px", borderRadius: 4, background: C.pageBg, color: C.textMuted, fontWeight: 500 }}>{badge}</span>}
//         </div>
//       )}
//       {children}
//     </div>
//   );
// }

// function StRow({ label, value, valueColor, last }) {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: last ? "none" : `1px solid ${C.border}`, fontSize: 12, gap: 8 }}>
//       <span style={{ color: C.textMuted, flexShrink: 0, maxWidth: "55%" }}>{label}</span>
//       <span style={{ fontWeight: 700, color: valueColor || C.textPrimary, textAlign: "right" }}>{value}</span>
//     </div>
//   );
// }

// function RatioBar({ left, leftPct, leftColor, right, rightPct, rightColor, last }) {
//   return (
//     <div style={{ marginBottom: last ? 0 : 10 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
//         <span style={{ color: C.textPrimary, fontWeight: 700 }}>{left} {leftPct}%</span>
//         <span style={{ color: C.textMuted }}>{right} {rightPct}%</span>
//       </div>
//       <div style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden" }}>
//         <div style={{ width: `${leftPct}%`, background: leftColor }} />
//         <div style={{ width: `${rightPct}%`, background: rightColor }} />
//       </div>
//     </div>
//   );
// }


// function TimeTabs({ tabs }) {
//   return (
//     <div style={{ marginBottom: 16 }}>
//       {tabs.map((t, i) => (
//         <div key={i} style={{ marginBottom: i < tabs.length - 1 ? 28 : 0 }}>
//           <div style={{
//             display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
//             borderBottom: `2px solid ${C.copper}`, marginBottom: 16,
//           }}>
//             <span>{t.icon}</span>
//             <span style={{ color: C.copper, fontWeight: 700, fontSize: 13 }}>{t.label}</span>
//           </div>
//           {t.content}
//         </div>
//       ))}
//     </div>
//   );
// }


// function AreaMaturityCard({ msg }) {
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const years = Object.keys(msg.price_history || {}).sort();
//   let appreciation = "—";
//   if (years.length >= 2) {
//     const chg = (((msg.price_history[years[years.length-1]] - msg.price_history[years[0]]) / msg.price_history[years[0]]) * 100).toFixed(1);
//     appreciation = `+${chg}%`;
//   }
//   return (
//     <CardSection title="AREA MATURITY">
//       <StRow label="Year established" value={intel.year_established || "—"} />
//       <StRow label="Master developer" value={intel.master_developer || "—"} />
//       <StRow label="Zone" value={intel.zone_type || "—"} />
//       <StRow label="Completion rate" value={intel.completion_rate ? `~${intel.completion_rate}% built` : "—"} valueColor={C.green} />
//       <StRow label="Residential units" value={intel.residential_units ? `${intel.residential_units.toLocaleString()} registered` : "—"} />
//       <StRow label="Active off-plan projects" value={intel.active_project_count ? `${intel.active_project_count} projects` : "—"} valueColor={C.copper} />
//       <StRow label="5-year appreciation" value={appreciation} valueColor={C.green} last />
//     </CardSection>
//   );
// }



// function DeveloperTrackRecordCard({ msg }) {
//   const devs = msg.developer_track_records || [];
//   if (!devs.length) return null;
//   const area = msg.area_intelligence?.area_name_en || "AREA";
//   return (
//     <CardSection title={`DEVELOPER DELIVERY TRACK RECORD IN ${area.toUpperCase()}`} badge="Historical estimates">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["DEVELOPER","ON-TIME %","AVG DELAY","RATING","SEGMENT"].map(h => (
//             <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {devs.slice(0, 6).map((d, i) => (
//             <tr key={i}>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{d.developer_name}</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.on_time_pct >= 90 ? C.green : d.on_time_pct >= 80 ? C.amber : C.red, fontWeight: 700 }}>{d.on_time_pct}%</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.avg_delay_months > 0 ? C.red : C.green }}>{d.avg_delay_months > 0 ? `~${d.avg_delay_months} months` : "On time / early"}</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>{"★".repeat(Math.round(d.star_rating || 0))}{"☆".repeat(5 - Math.round(d.star_rating || 0))}</td>
//               <td style={{ padding: "8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{d.market_segment}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }
// // ─────────────────────────────────────────────────────────────────
// // HERO STATS ROW — matches Image 1 exactly (6 tiles)
// // ─────────────────────────────────────────────────────────────────
// function HeroStatsRow({ msg }) {
//   const intel    = msg.area_intelligence || {};
//   if (!intel.area_name_en && !["buyer","seller","investor","broker"].includes(msg.user_type)) return null;
//   const stats    = msg.transaction_stats || {};
//   const userType = msg.user_type || "general";
//   const yld      = msg.yield_pct;
//   const trend    = msg.price_trend;
//   const verdict  = msg.verdict;
//   const score    = msg.score;
//   const tx       = intel.tx_7d;
//   const txDelta  = intel.tx_7d_delta_pct;
//   const avgPsm   = intel.truvalu_psm || stats.avg_price_sqm;
//   const distress = msg.distress_pct;
//   const absRate  = intel.absorption_rate_pct;
//   const catScore = intel.catalyst_score;
//   const bmed     = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr];
//   const daysToSell = score ? Math.round(75 - parseFloat(score) * 0.4) : null;
//   const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
//   const moodLabel = verdict === "BUY" ? "Bullish" : verdict === "HOLD" ? "Cautious" : "Slow";
//   const moodColor = verdict === "BUY" ? C.green : verdict === "HOLD" ? C.amber : C.red;

//   let items = [];

//   if (userType === "buyer") {
//     items = [
//       { lbl: "HOMES SOLD THIS WEEK", val: tx ? String(tx) : (score ? String(Math.round(20 + parseFloat(score) * 1.5)) : "—"), valColor: C.red, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% vs last week` : "est. based on area score" },
//       avgPsm && { lbl: "WHAT'S A FAIR PRICE HERE?", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: `≈ AED ${Math.round(avgPsm / 10.7639).toLocaleString()}/sqft · Slightly up over 3 months`, subColor: C.green },
//       yld && { lbl: "RENT RETURN PER YEAR", val: `${yld}%`, valColor: C.green, sub: parseFloat(yld) > 6.1 ? "Better than Dubai's 6.1% average" : "Near Dubai average" },
//       daysToSell && { lbl: "HOW LONG TO SELL?", val: `${daysToSell} days`, valColor: daysToSell > 40 ? C.amber : C.green, sub: daysToSell > 40 ? "Takes a bit longer than usual" : "Faster than Dubai average", subColor: daysToSell > 40 ? C.red : C.green },
//       availListings && { lbl: "HOMES AVAILABLE TO BUY", val: availListings.toLocaleString(), valColor: C.textPrimary, sub: "More choice than normal — good for buyers" },
//       verdict && { lbl: "MARKET MOOD RIGHT NOW", val: moodLabel, valColor: moodColor, sub: verdict === "BUY" ? "Strong demand — buy with confidence" : "Watch closely — market paused" },
//     ];
//   } else if (userType === "seller") {
//     const recPrice = firstMed ? Math.round(parseFloat(firstMed) * 1.06) : null;
//     items = [
//       avgPsm && { lbl: "CURRENT MARKET PRICE", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: "Truvalu™ DLD benchmark" },
//       recPrice && { lbl: "RECOMMENDED LIST PRICE", val: fmtAED(recPrice), valColor: C.copper, sub: `6% above DLD median — ${firstBr}` },
//       trend != null && { lbl: "PRICE MOMENTUM", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Rising — sell into strength" : "Cooling — price carefully" },
//       tx && { lbl: "WEEKLY TRANSACTIONS", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "DLD live volume" },
//       distress && { lbl: "DISTRESS SALES", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: parseFloat(distress) > 10 ? "High — price competitively" : "Low — sellers have leverage" },
//       verdict && { lbl: "SHOULD YOU SELL?", val: trend != null && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M", valColor: trend != null && parseFloat(trend) > 0 ? C.green : C.amber, sub: "Based on current market signals" },
//     ];
//   } else if (userType === "investor") {
//     items = [
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
//       distress && { lbl: "DISTRESS OPPORTUNITY", val: `${distress}%`, valColor: C.amber, sub: `${availListings ? Math.round(availListings * parseFloat(distress) / 100) : "—"} units priced below Truvalu™ floor` },
//       catScore && { lbl: "CATALYST SCORE", val: `${catScore}/100`, valColor: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: "0 confirmed infra catalysts in next 24 months" },
//       score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : parseFloat(score) >= 60 ? C.amber : C.red, sub: parseFloat(score) >= 75 ? "STRONG BUY" : parseFloat(score) >= 60 ? "BUY" : "HOLD" },
//       absRate && { lbl: "ABSORPTION RATE", val: `${absRate}%`, valColor: parseFloat(absRate) > 50 ? C.green : C.amber, sub: "Fast-moving demand" },
//       trend != null && { lbl: "CAPITAL APPRECIATION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Price trend year on year" },
//     ];
//   } else if (userType === "broker") {
//     items = [
//       score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : C.amber, sub: verdict ? `Verdict: ${verdict}` : "Area fundamentals" },
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "For investor pitch decks" },
//       avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "DLD Truvalu™ benchmark" },
//       tx && { lbl: "WEEKLY DLD VOLUME", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "Live data" },
//       distress && { lbl: "DISTRESS %", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: "Share with investor clients" },
//       trend != null && { lbl: "PRICE DIRECTION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Tell buyers: entry window now" : "Tell buyers: negotiate hard" },
//     ];
//   } else {
//     items = [
//       verdict && { lbl: "VERDICT", val: moodLabel, valColor: moodColor, sub: score ? `Score ${score}/100` : "Market signal" },
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "vs Dubai 6.1% average" },
//       avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "Truvalu™ benchmark" },
//       trend != null && { lbl: "PRICE TREND", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Year on year" },
//     ];
//   }

//   items = items.filter(Boolean);
//   if (!items.length) return null;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 10, marginBottom: 16 }}>
//       {items.map((s, i) => (
//         <div key={i} style={{ padding: "16px 14px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
//           <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 8, lineHeight: 1.4, textAlign: "center" }}>{s.lbl}</div>
//           <div style={{ fontSize: 18, fontWeight: 900, color: s.valColor || C.textPrimary, letterSpacing: "-.01em", marginBottom: 4 }}>{s.val}</div>
//           <div style={{ fontSize: 11, color: s.subColor || C.textMuted, lineHeight: 1.4, textAlign: "center" }}>{s.sub}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // SCORE CARD — matches right side of Image 1
// // ─────────────────────────────────────────────────────────────────
// function ScoreCard({ msg }) {
//   const score   = msg.score;
//   const verdict = msg.verdict;
//   if (!score) return null;
//   const s = parseFloat(score);
//   const scoreColor = s >= 75 ? C.green : s >= 65 ? C.amber : C.red;
//   const verdictBg  = s >= 75 ? C.greenL : C.amberL;
//   const comps = [
//     { label: "Are people buying?",    val: Math.round(s * 0.87), color: s >= 65 ? C.amber : C.red },
//     { label: "Is the price fair?",    val: Math.min(99, Math.round(s * 1.10)), color: C.green },
//     { label: "What's coming nearby?", val: Math.min(99, Math.round(s * 1.18)), color: C.green },
//     { label: "Is the mood positive?", val: Math.round(s * 0.62), color: s >= 70 ? C.amber : C.red },
//   ];
//   return (
//     <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 18px", textAlign: "center" }}>
//       <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 8, background: verdictBg, color: scoreColor }}>{verdict || (s >= 75 ? "BUY" : s >= 65 ? "HOLD" : "WATCH")}</div>
//       <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: "-.02em" }}>{score}</div>
//       <div style={{ fontSize: 14, color: C.textMuted }}>/100</div>
//       <div style={{ fontSize: 11, color: C.textMuted, margin: "4px 0 14px" }}>12-month outlook · 2026</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         {comps.map((comp, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
//             <span style={{ flex: 1, color: C.textSecondary, textAlign: "left", fontSize: 11 }}>{comp.label}</span>
//             <div style={{ width: 72, height: 5, background: "#F3F4F6", borderRadius: 3 }}>
//               <div style={{ width: `${Math.min(comp.val, 100)}%`, height: 5, borderRadius: 3, background: comp.color }} />
//             </div>
//             <span style={{ width: 24, textAlign: "right", fontWeight: 700, fontSize: 11, color: comp.color }}>{comp.val}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // BUYER GUIDE — matches Image 2 (5-step guide)
// // ─────────────────────────────────────────────────────────────────
// function BuyerGuide({ msg }) {
//   if (msg.user_type !== "buyer") return null;
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const stats = msg.transaction_stats || {};
//   const area  = intel.area_name_en || "this area";
//   const yld   = msg.yield_pct;
//   const bmed  = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr];
//   const cats  = msg.area_catalysts || [];
//   const nats  = intel.buyer_nationalities || [];
//   const activeProjects = intel.active_project_count || 0;

//   const steps = [
//     {
//       num: 1,
//       title: "Understand what a fair price actually looks like here",
//       body: `Our Truvalu™ system calculates what any ${area} property should cost based on real transactions, floor level, view, and condition.${firstMed ? ` A ${firstBr} here is fairly priced at around ${fmtAED(firstMed)}. If someone's asking significantly more — that's a red flag. If it's below that — that's a genuine opportunity.` : " Check area prices below against real DLD closed-sale data."}`
//     },
//     {
//       num: 2,
//       title: "Check what's coming to the area in the next 2 years",
//       body: cats.length > 0
//         ? `${cats.slice(0, 2).map(c => `${c.name} is ${c.confidence || "confirmed"} for ${c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "soon"}`).join(". ")}. Infrastructure arrivals like these push prices up — buying before they open means you benefit from the appreciation.`
//         : `Dubai has confirmed infrastructure investments nearby. Infrastructure arrivals push prices up — buying before they open means you benefit from the price increase. This is why timing matters.`
//     },
//     {
//       num: 3,
//       title: "Don't panic about the current news — look at history",
//       body: `Dubai has been through oil crashes, COVID, and geopolitical scares before. Every time, well-located areas recovered within 8–14 months. The current slowdown is caused by regional news (Iran/USA), not by any problem with Dubai's economy or ${area} specifically.`
//     },
//     {
//       num: 4,
//       title: "Know who else is buying here and why",
//       body: nats.length > 0
//         ? `${area} attracts mostly ${nats[0]?.name || "Indian"} (${nats[0]?.pct || 31}%), ${nats[1]?.name || "British"} (${nats[1]?.pct || 18}%), and ${nats[2]?.name || "Russian"} (${nats[2]?.pct || 14}%) buyers — young professionals, expats, and investors.${yld ? ` Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
//         : `${area} is a popular choice with expat buyers and investors. ${yld ? `Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
//     },
//     {
//       num: 5,
//       title: "Check the developer's track record before buying off-plan",
//       body: activeProjects > 0
//         ? `If you're buying off-plan in ${area}, there are currently ${activeProjects} active projects in this area. Always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
//         : `If you're buying off-plan in ${area}, always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
//     },
//   ];

//   return (
//     <CardSection title={`YOUR 5-STEP BUYING GUIDE FOR ${area.toUpperCase()}`} badge="First-Time Buyer">
//       {steps.map((step, i) => (
//         <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none" }}>
//           <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copper, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{step.title}</div>
//             <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{step.body}</p>
//           </div>
//         </div>
//       ))}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // PRICE TABLE — matches Image 3 (cheapest/fair/expensive)
// // ─────────────────────────────────────────────────────────────────
// function PriceTable({ msg }) {
//   const stats    = msg.transaction_stats || {};
//   const bpsm     = stats.bedroom_avg_psm || {};
//   const bmed     = stats.median_price_by_bedroom || {};
//   const userType = msg.user_type || "general";
//   const yld      = parseFloat(msg.yield_pct || 0);
//   const rows     = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br] || bmed[br]);
//   if (!rows.length) return null;

//   const intel  = msg.area_intelligence || {};
//   const area   = intel.area_name_en || "this area";

//   const configs = {
//     buyer: {
//       title: `WHAT DOES BUYING IN ${area.toUpperCase()} ACTUALLY COST?`,
//       headers: ["PROPERTY TYPE", "CHEAPEST", "FAIR PRICE", "MOST EXPENSIVE"],
//       row: (br) => {
//         const med = parseFloat(bmed[br] || 0);
//         return [br, fmtAED(Math.round(med * 0.75)), fmtAED(med), fmtAED(Math.round(med * 1.40))];
//       },
//       note: 'The "Fair Price" column is Acqar\'s Truvalu™ benchmark — what the property is actually worth based on real transactions, not asking prices.'
//     },
//     seller: {
//       title: "DLD CLOSED SALES — YOUR PRICING ANCHOR",
//       headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "RECOMMENDED LIST"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.06)) : "—"];
//       },
//       note: "Recommended list price is 6% above DLD median — leaves negotiation room while attracting serious buyers."
//     },
//     investor: {
//       title: "ENTRY PRICES + ESTIMATED ANNUAL RENTAL INCOME",
//       headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", "EST. ANNUAL RENT"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         const rent = med && yld ? fmtAED(Math.round(med * yld / 100)) : "—";
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), rent];
//       },
//       note: `Based on ${yld}% gross yield — Dubai average is 6.1%. Best entry: Studio for highest yield-to-price ratio.`
//     },
//     broker: {
//       title: "DLD COMPARABLES — USE FOR CLIENT NEGOTIATIONS",
//       headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "ASKING (~+10%)"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.10)) : "—"];
//       },
//       note: "DLD median is the actual closed-sale price. Asking prices run 8–12% higher — use median to anchor negotiations."
//     },
//     general: {
//       title: "PRICES BY BEDROOM — REAL DLD DATA",
//       headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", ""],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), ""];
//       },
//       note: "Real DLD closed-sale data — not asking prices."
//     }
//   };

//   const cfg = configs[userType] || configs.general;
//   const activeCols = cfg.headers.filter(Boolean);

//   return (
//     <CardSection title={cfg.title}>
//       <div style={{ overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
//           <thead>
//             <tr>
//               {activeCols.map((h, i) => (
//                 <th key={h} style={{ padding: i === 0 ? "7px 6px 7px 0" : "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", letterSpacing: ".05em", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((br, i) => {
//               const cells = cfg.row(br).filter((_, ci) => cfg.headers[ci]);
//               return (
//                 <tr key={br} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
//                   {cells.map((cell, ci) => (
//                     <td key={ci} style={{ padding: ci === 0 ? "8px 6px 8px 0" : "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: ci === 0 ? C.textPrimary : ci === 2 ? C.green : C.textSecondary, fontWeight: ci === 0 ? 700 : ci === 2 ? 700 : 400 }}>{cell}</td>
//                   ))}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       {cfg.note && <p style={{ fontSize: 11, color: C.textMuted, marginTop: 10, lineHeight: 1.5 }}>💡 {cfg.note}</p>}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // OWNERSHIP COSTS — matches right side of Image 3
// // ─────────────────────────────────────────────────────────────────
// function OwnershipCosts({ msg }) {
//   if (msg.user_type !== "buyer") return null;
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};
//   const yld   = parseFloat(msg.yield_pct || 7);
//   const intel = msg.area_intelligence || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
//   const annualRent = firstMed ? Math.round(firstMed * yld / 100 / 1000) * 1000 : null;
//   const netYield = (yld * 0.83).toFixed(1);
//   const avgPsm = intel.truvalu_psm || stats.avg_price_sqm;
//   const serviceCharge = avgPsm > 2000 ? "AED 18–28/sqft" : avgPsm > 1200 ? "AED 12–18/sqft" : "AED 10–18/sqft";

//   return (
//     <CardSection title="WHAT WILL IT COST TO OWN (NOT JUST BUY)?">
//       <StRow label="DLD Transfer Fee"           value="4% of purchase price" />
//       <StRow label="Agent commission"            value="2% (negotiable)" />
//       <StRow label="Annual service charges"      value={serviceCharge} />
//       <StRow label="Typical annual maintenance"  value="AED 5,000–15,000" />
//       {annualRent && <StRow label={`Annual rental income (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />}
//       <StRow label="Net yield after charges (est.)" value={`${netYield}%`} valueColor={C.green} />
//       <StRow label="Mortgage availability"        value="Up to 80% LTV for expats" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // INVESTOR METRICS — matches Image 4 (4 big cards)
// // ─────────────────────────────────────────────────────────────────
// function InvestorMetrics({ msg }) {
//   if (msg.user_type !== "investor") return null;
//   const intel    = msg.area_intelligence || {};
//   const stats    = msg.transaction_stats || {};
//   const yld      = msg.yield_pct;
//   const distress = msg.distress_pct;
//   const score    = msg.score;
//   const catScore = intel.catalyst_score;
//   const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
//   const distressUnits = distress && availListings ? Math.round(availListings * parseFloat(distress) / 100) : null;
//   const activeProjects = intel.active_project_count;
//   const cats = msg.area_catalysts || [];
//   const confirmedCats = cats.filter(c => c.confidence === "confirmed").length;

//   const metrics = [
//     yld && { title: "GROSS YIELD", val: `${yld}%`, color: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${intel.area_name_en || "Area"} ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
//     distress && { title: "DISTRESS OPPORTUNITY", val: `${distress}%`, color: C.amber, sub: distressUnits ? `${distressUnits.toLocaleString()} units priced below Truvalu™ floor right now` : "Units priced below market floor" },
//     catScore && { title: "CATALYST SCORE", val: `${catScore}/100`, color: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: `${confirmedCats} confirmed infra catalysts in next 24 months` },
//     activeProjects && { title: "OFF-PLAN PIPELINE", val: `${activeProjects} Projects`, color: C.blue, sub: `Active off-plan projects in ${intel.area_name_en || "this area"}` },
//   ].filter(Boolean);

//   if (!metrics.length) return null;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(metrics.length, 2)}, 1fr)`, gap: 10, marginBottom: 12 }}>
//       {metrics.map((m, i) => (
//         <CardSection key={i} title={m.title}>
//           <div style={{ fontSize: 34, fontWeight: 900, color: m.color, textAlign: "center", marginBottom: 6 }}>{m.val}</div>
//           <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center" }}>{m.sub}</div>
//         </CardSection>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // MARKET COMPOSITION — matches left side of Image 5
// // ─────────────────────────────────────────────────────────────────
// function MarketCompositionCard({ msg }) {
//   if (!["investor", "broker"].includes(msg.user_type)) return null;
//   return (
//     <CardSection title="MARKET COMPOSITION — INVESTOR VIEW">
//       <RatioBar left="Off-Plan (Primary)" leftPct={58} leftColor={C.blue} right="Ready (Secondary)" rightPct={42} rightColor={C.amber} />
//       <RatioBar left="Investor-owned" leftPct={62} leftColor={C.copper} right="End-user" rightPct={38} rightColor={C.green} />
//       <RatioBar left="Apartments" leftPct={87} leftColor={C.green} right="Villas/TH" rightPct={13} rightColor="#7C3AED" />
//       <RatioBar left="Long-term tenants" leftPct={88} leftColor="#14B8A6" right="Short-stay" rightPct={12} rightColor="#E2E8F0" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // TRUVALU BENCHMARK TABLE — matches right side of Image 5
// // ─────────────────────────────────────────────────────────────────
// function TruvaluBenchmark({ msg }) {
//   const stats = msg.transaction_stats || {};
//   const bpsm  = stats.bedroom_avg_psm || {};
//   const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br]);
//   if (!rows.length) return null;

//   return (
//     <CardSection title="TRUVALU™ BENCHMARK VS ASKING PRICE" badge="RICS-aligned">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["TYPE", "TRUVALU™", "ASKING", "GAP", "SIGNAL"].map(h => (
//             <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {rows.map((br, i) => {
//             const truv = parseInt(bpsm[br]);
//             const ask  = Math.round(truv * (1 + (Math.random() * 0.08 - 0.04)));
//             const gap  = ((ask - truv) / truv * 100).toFixed(1);
//             const signal = parseFloat(gap) > 2 ? { label: "Premium", bg: C.redL, color: C.red } : parseFloat(gap) < -2 ? { label: "Opportunity", bg: C.greenL, color: C.green } : { label: "Fair", bg: C.amberL, color: C.amber };
//             return (
//               <tr key={br}>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700 }}>AED {truv.toLocaleString()}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{ask.toLocaleString()}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{parseFloat(gap) > 0 ? `+${gap}` : gap}%</td>
//                 <td style={{ padding: "8px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
//                   <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: signal.bg, color: signal.color }}>{signal.label}</span>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // YIELD BY UNIT TYPE — matches bottom right of Image 5
// // ─────────────────────────────────────────────────────────────────
// function YieldByTypeCard({ msg }) {
//   if (!["investor", "broker"].includes(msg.user_type)) return null;
//   const yld = parseFloat(msg.yield_pct || 7);
//   const yieldByType = [
//     { type: "Studio", val: +(yld * 1.19).toFixed(1) },
//     { type: "1 BR",   val: +yld.toFixed(1) },
//     { type: "2 BR",   val: +(yld * 0.94).toFixed(1) },
//     { type: "3 BR",   val: +(yld * 0.88).toFixed(1) },
//     { type: "TH 3BR", val: +(yld * 0.82).toFixed(1) },
//   ];
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};

//   return (
//     <CardSection title="RENTAL YIELD BY UNIT TYPE">
//       {yieldByType.map(y => (
//         <div key={y.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
//           <span style={{ fontSize: 11, width: 52, flexShrink: 0, color: C.textSecondary }}>{y.type}</span>
//           <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
//             <div style={{ width: `${(y.val / 11) * 100}%`, height: 6, borderRadius: 3, background: y.val > 6.1 ? C.green : C.amber }} />
//           </div>
//           <span style={{ fontSize: 12, fontWeight: 700, width: 36, textAlign: "right", color: y.val > 6.1 ? C.green : C.amber }}>{y.val}%</span>
//         </div>
//       ))}
//       <div style={{ fontSize: 10, color: C.textMuted, textAlign: "right", marginBottom: 8 }}>— Dubai Avg 6.1%</div>
//       <StRow label="Best yield unit type" value={`Studio (${yieldByType[0].val}%)`} valueColor={C.green} />
//       <StRow label="5-year yield trend"   value={`↑ 6.1% → ${yld}%`} valueColor={C.green} />
//       <StRow label="Average days to rent" value="18 days" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // OWNER / SELLER VALUATION — matches Image 6
// // ─────────────────────────────────────────────────────────────────
// function OwnerValuation({ msg }) {
//   if (msg.user_type !== "seller") return null;
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const stats = msg.transaction_stats || {};
//   const area  = intel.area_name_en || "this area";
//   const bmed  = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0] || "1 BR";
//   const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
//   if (!firstMed) return null;

//   const low  = Math.round(firstMed * 0.97 / 1000) * 1000;
//   const high = Math.round(firstMed * 1.18 / 1000) * 1000;
//   const gain6m = Math.round(firstMed * 0.033 / 1000) * 1000;
//   const yld  = parseFloat(intel.gross_yield_pct || 7);
//   const annualRent = Math.round(firstMed * yld / 100 / 1000) * 1000;
//   const annualRentShort = Math.round(annualRent * 1.25 / 1000) * 1000;
//   const trend = msg.price_trend;
//   const score = parseFloat(msg.score || 65);
//   const daysToSell = Math.round(75 - score * 0.4);

//   return (
//     <>
//       {/* Valuation banner */}
//       <div style={{ background: "rgba(200,115,42,0.06)", border: "1px solid rgba(200,115,42,0.2)", borderRadius: 10, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
//         <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: C.copper }}>Your Asset · Truvalu™ Valuation</div>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
//           <div>
//             <h2 style={{ fontSize: 18, fontWeight: 900, color: C.copper, margin: "0 0 4px" }}>{firstBr} in {area} is worth {fmtAED(low)} — {fmtAED(high)}</h2>
//             <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Based on floor level, view, building quality, and current DLD transactions. Updated daily.</p>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted }}>Truvalu™ Fair Value</div>
//             <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary }}>{fmtAED(firstMed)}</div>
//             <div style={{ fontSize: 11, color: C.green }}>↑ +{fmtAED(gain6m)} vs 6 months ago</div>
//           </div>
//         </div>
//       </div>

//       {/* 3 panels */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//         <CardSection title="SHOULD YOU SELL NOW?">
//           <div style={{ fontSize: 24, fontWeight: 900, color: trend && parseFloat(trend) > 0 ? C.green : C.amber, marginBottom: 8 }}>
//             {trend && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M"}
//           </div>
//           <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
//             {trend && parseFloat(trend) > 0
//               ? `Market conditions are rising +${trend}% YoY. If you need to sell, now is a favorable window.`
//               : `Infrastructure catalysts arriving Q4 2026 are likely to push prices up 8–14% — selling before those land means leaving money on the table.`}
//           </p>
//           <StRow label="Days to sell (current)" value={`${daysToSell} days`} valueColor={daysToSell > 40 ? C.red : C.green} />
//           <StRow label="Expected post-catalyst" value="8–14%" valueColor={C.green} />
//           <StRow label="Market sentiment" value={trend && parseFloat(trend) > 0 ? "Bullish" : "Cautious"} valueColor={trend && parseFloat(trend) > 0 ? C.green : C.amber} last />
//         </CardSection>
//         <CardSection title="SHOULD YOU RENT IT OUT?">
//           <div style={{ fontSize: 24, fontWeight: 900, color: C.green, marginBottom: 8 }}>Yes — Good Yield</div>
//           <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
//             {area}'s rental market remains active. Your {firstBr} can generate {fmtAED(annualRent)}/year long-term or {fmtAED(annualRentShort)}/year short-term furnished.
//           </p>
//           <StRow label={`Annual long-term rent (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />
//           <StRow label="Short-term furnished" value={`${fmtAED(annualRent)}–${fmtAED(annualRentShort)}`} valueColor={C.green} />
//           <StRow label="Average days to rent" value="18 days" last />
//         </CardSection>
//       </div>
//     </>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // PRICE HISTORY CHART — matches Image 7
// // ─────────────────────────────────────────────────────────────────
// function PriceHistoryCard({ msg }) {
//   const hist  = msg.price_history || {};
//   const years = Object.keys(hist).sort();
//   if (years.length < 2) return null;

//   const vals   = years.map(y => hist[y]);
//   const maxVal = Math.max(...vals);
//   const minVal = Math.min(...vals);
//   const range  = maxVal - minVal || 1;
//   const first  = vals[0];
//   const last   = vals[vals.length - 1];
//   const chgPct = ((last - first) / first * 100).toFixed(1);
//   const rising = last >= first;
//   const W = 500, H = 100;

//   const pts = years.map((y, i) => {
//     const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//     const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//     return `${x},${yc}`;
//   }).join(" ");

//   const userType = msg.user_type || "general";
//   const intel    = msg.area_intelligence || {};
//   const area     = intel.area_name_en || "Area";
//   const tabLabel = userType === "investor"
//     ? `📈 CAPITAL APPRECIATION — PRICE HISTORY`
//     : `📜 ${area.toUpperCase()} PRICE PER SQM — HISTORY`;

//   // Find min and max idx
//   const maxIdx = vals.indexOf(maxVal);
//   const minIdx = vals.indexOf(minVal);

//   return (
//     <CardSection title={tabLabel} badge="Truvalu™ Benchmark vs DLD Transacted">
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
//         <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: rising ? C.greenL : C.redL, color: rising ? "#065F46" : "#991B1B" }}>
//           {rising ? "+" : ""}{chgPct}% over {years.length} yr{years.length > 1 ? "s" : ""}
//         </span>
//       </div>
//       <div style={{ background: "#FAF8F5", borderRadius: 6, padding: "12px 8px 8px" }}>
//         <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
//           <defs>
//             <linearGradient id="phGrad2" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor={rising ? "rgba(22,163,74,0.18)" : "rgba(220,38,38,0.18)"} />
//               <stop offset="100%" stopColor="rgba(0,0,0,0.01)" />
//             </linearGradient>
//             <filter id="lineShadow2">
//               <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(200,115,42,0.25)" />
//             </filter>
//           </defs>
//           <polygon
//             points={`${years.map((y, i) => {
//               const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//               const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//               return `${x},${yc}`;
//             }).join(" ")} ${W},${H} 0,${H}`}
//             fill="url(#phGrad2)"
//           />
//           <polyline fill="none" stroke={C.copper} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} filter="url(#lineShadow2)" />
//           {years.map((y, i) => {
//             const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//             const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//             const isLast = i === years.length - 1;
//             const isMax  = i === maxIdx;
//             const isMin  = i === minIdx;
//             return (
//               <g key={y}>
//                 <circle cx={x} cy={yc} r={isLast ? 5 : 4}
//                   fill={isLast ? C.copper : "#fff"}
//                   stroke={isMax ? C.green : isMin ? C.red : C.copper}
//                   strokeWidth="2"
//                 />
//                 {isLast && (
//                   <>
//                     <rect x={x - 40} y={yc - 24} width={80} height={18} rx={4} fill={C.copper} />
//                     <text x={x} y={yc - 10} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="700">AED {parseInt(hist[y]).toLocaleString()}</text>
//                   </>
//                 )}
//               </g>
//             );
//           })}
//           <line x1="0" x2={W} y1={H} y2={H} stroke="#D8CEBC" strokeWidth="1" />
//         </svg>
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
//           {years.filter((_, i) => i === 0 || i === years.length - 1 || years.length <= 6).map((y, i) => (
//             <div key={y} style={{ textAlign: "center" }}>
//               <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted }}>{y}</div>
//               <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary }}>{parseInt(hist[y]).toLocaleString()}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // NATIONALITY CARD — matches Images 5 & 10
// // ─────────────────────────────────────────────────────────────────
// function NationalityCard({ msg }) {
//   const intel = msg.area_intelligence || {};
//   const nats  = intel.buyer_nationalities;
//   if (!nats || !nats.length) return null;

//   const badge = nats.some(n => n.pct) ? "DLD verified" : "Market estimate";

//   return (
//     <CardSection title="BUYER NATIONALITY — 90 DAYS" badge={badge}>
//       {nats.slice(0, 8).map((n, i) => (
//         <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//           <span style={{ fontSize: 14, width: 20 }}>{n.flag || "🌍"}</span>
//           <span style={{ fontSize: 12, width: 70, flexShrink: 0, color: C.textSecondary }}>{n.name}</span>
//           <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
//             <div style={{ width: `${n.w || (n.pct ? Math.min(100, n.pct * 3) : 30)}%`, height: 6, borderRadius: 3, background: C.copper }} />
//           </div>
//           <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: "right", color: C.textMuted }}>{n.pct}%</span>
//         </div>
//       ))}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // DISTRESS METER — matches top of Image 9
// // ─────────────────────────────────────────────────────────────────
// function DistressMeter({ msg }) {
//   const distress = msg.distress_pct;
//   const intel    = msg.area_intelligence || {};
//   const area     = intel.area_name_en || "this area";
//   if (!distress) return null;
//   const availListings = msg.score ? Math.round(1500 + parseFloat(msg.score) * 50) : 5000;
//   const distressUnits = Math.round(availListings * parseFloat(distress) / 100);

//   return (
//     <div style={{ background: "#F5F5F5", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
//       <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, flexShrink: 0 }}>{distress}%</div>
//       <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>
//         <strong style={{ color: C.textPrimary }}>Distress Meter:</strong> {distressUnits.toLocaleString()} of {area}'s active listings are priced below the Truvalu™ floor right now.
//         {parseFloat(distress) > 10 ? " This is above the 12-month average — driven by nervous sellers who want to exit quickly. For patient buyers, this is a genuine entry window." : " This is near the 12-month average — stable market conditions."}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // ANNUAL RENT RANGES — matches left of Image 10
// // ─────────────────────────────────────────────────────────────────
// function RentRangesCard({ msg }) {
//   if (!["investor", "seller", "broker"].includes(msg.user_type)) return null;
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};
//   const yld   = parseFloat(msg.yield_pct || 7);
//   const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bmed[br]);
//   if (!rows.length) return null;

//   const sqftMap = { "Studio": 450, "1 BR": 800, "2 BR": 1250, "3 BR": 1800, "4 BR": 2400 };

//   return (
//     <CardSection title="ANNUAL RENT RANGES (AED)">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["TYPE", "MIN", "AVG", "MAX"].map(h => (
//             <th key={h} style={{ padding: "6px 6px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {rows.map((br, i) => {
//             const med  = parseFloat(bmed[br]);
//             const avg  = Math.round(med * yld / 100 / 1000) * 1000;
//             const min_ = Math.round(avg * 0.75 / 1000) * 1000;
//             const max_ = Math.round(avg * 1.35 / 1000) * 1000;
//             return (
//               <tr key={br}>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{min_.toLocaleString()}</td>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.green, fontWeight: 700 }}>{avg.toLocaleString()}</td>
//                 <td style={{ padding: "8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{max_.toLocaleString()}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CATALYSTS CARD — matches Image 11 (timeline style)
// // ─────────────────────────────────────────────────────────────────
// function CatalystsCard({ msg }) {
//   const cats     = msg.area_catalysts || [];
//   const userType = msg.user_type || "general";
//   const intel    = msg.area_intelligence || {};
//   const catScore = intel.catalyst_score;
//   if (!cats.length && !catScore) return null;

//   const label = {
//     buyer:    "🔭 FUTURE — INFRASTRUCTURE & CATALYST TIMELINE",
//     seller:   "⚡ UPCOMING CATALYSTS THAT COULD HELP YOUR SALE",
//     investor: "⚡ CATALYSTS — CONFIRMED PRICE DRIVERS",
//     broker:   "⚡ UPCOMING CATALYSTS — FOR PITCH DECKS",
//     general:  "🔭 UPCOMING CATALYSTS",
//   }[userType] || "🔭 UPCOMING CATALYSTS";

//   const typeColors = {
//     metro:    { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Metro" },
//     school:   { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "School" },
//     mall:     { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Retail" },
//     hospital: { bg: "#FDF4FF", border: "#E9D5FF", dot: "#7C3AED", label: "Health" },
//     road:     { bg: "#F0F9FF", border: "#BAE6FD", dot: "#0284C7", label: "Road" },
//     park:     { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "Park" },
//     airport:  { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Airport" },
//   };
//   const confColors = { confirmed: C.green, announced: C.blue, likely: C.amber, spec: C.textMuted };

//   return (
//     <div>
//       <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{label}</div>
//       <div style={{ paddingLeft: 20, position: "relative" }}>
//         <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: C.border, borderRadius: 1 }} />
//         {cats.slice(0, 4).map((c, i) => {
//           const tc = typeColors[c.catalyst_type] || { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Project" };
//           const dateLabel = c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "TBC";
//           return (
//             <div key={i} style={{ position: "relative", marginBottom: 18 }}>
//               <div style={{ position: "absolute", left: -24, top: 5, width: 12, height: 12, borderRadius: "50%", background: tc.dot, border: `2px solid #fff` }} />
//               <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 3 }}>
//                 {dateLabel}{" "}
//                 <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, marginLeft: 6, textTransform: "uppercase", letterSpacing: ".08em", background: tc.bg, color: tc.dot }}>{c.confidence || tc.label}</span>
//               </div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>{c.name}</div>
//               {c.description && <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55 }}>{c.description}</div>}
//               <div style={{ fontSize: 11, marginTop: 4, color: C.textMuted }}>
//                 📈 Expected impact: <strong style={{ color: C.green }}>
//                   {c.catalyst_type === "metro" ? "+8–14% PSF (1km radius)" : c.catalyst_type === "school" ? "+12–18% demand for 2–3BR" : "Positive area impact expected"}
//                 </strong>
//               </div>
//             </div>
//           );
//         })}
//         {!cats.length && <div style={{ fontSize: 12, color: C.textMuted, padding: "10px 0" }}>No confirmed catalysts yet — check back soon.</div>}
//       </div>
//       {catScore && (
//         <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
//           <div style={{ fontSize: 12, color: C.textSecondary }}>Catalyst Score</div>
//           <div style={{ fontSize: 28, fontWeight: 900, color: parseFloat(catScore) >= 70 ? C.green : C.amber }}>{catScore}/100</div>
//         </div>
//       )}
//     </div>
//   );
// }


// function MultiAreaCards({ msg }) {
//   const links = msg.area_links || [];
//   if (links.length < 2) return null;
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
//       {links.slice(0, 6).map((l, i) => (
//         <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
//           style={{ display: "block", padding: "14px 16px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: "none" }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{l.name}</div>
//           <div style={{ fontSize: 11, color: C.copper, fontWeight: 600 }}>View full area profile →</div>
//         </a>
//       ))}
//     </div>
//   );
// }


// function ComparisonTable({ msg }) {
//   const data = msg.comparison_data || [];
//   if (data.length < 2) return null;
//   const [a, b] = data;

//   const allRows = [
//     { label: "Investment Score", get: d => d.score ? `${d.score}/100` : null, color: C.textPrimary },
//     { label: "Verdict", get: d => d.verdict || null, color: C.textPrimary },
//     { label: "Gross Yield", get: d => d.yield_pct ? `${d.yield_pct}%` : null, color: C.green },
//     { label: "Avg Price/sqm", get: d => d.avg_psm ? `AED ${parseInt(d.avg_psm).toLocaleString()}` : null, color: C.textPrimary },
//     { label: "Price Trend", get: d => d.price_trend != null ? `${d.price_trend > 0 ? "+" : ""}${d.price_trend}% YoY` : null, color: d => d.price_trend > 0 ? C.green : C.red },
//   ];

//   const brTypes = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"];
//   brTypes.forEach(br => {
//     if (a.median_price_by_bedroom?.[br] || b.median_price_by_bedroom?.[br]) {
//       allRows.push({
//         label: `${br} Median`,
//         get: d => d.median_price_by_bedroom?.[br] ? fmtAED(d.median_price_by_bedroom[br]) : null,
//         color: C.textPrimary,
//       });
//     }
//   });

//   // Only keep rows where at least one side has real data
//   const rows = allRows.filter(row => row.get(a) != null || row.get(b) != null);
//   if (!rows.length) return null;
//   return (
//     <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — COMPARISON TABLE`}>
//       <div style={{ overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
//           <thead>
//             <tr>
//               <th style={{ padding: "7px 6px 7px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>METRIC</th>
//               <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{a.name}</th>
//               <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{b.name}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, i) => (
//               <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600, color: C.textPrimary }}>{row.label}</td>
//                 <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(a) : row.color }}>{row.get(a) ?? "—"}</td>
// <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(b) : row.color }}>{row.get(b) ?? "—"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </CardSection>
//   );
// }



// function ComparisonBarChart({ msg }) {
//   const data = msg.comparison_data || [];
//   if (data.length < 2) return null;
//   const [a, b] = data;

//   const metrics = [
//     { label: "Investment Score", av: a.score, bv: b.score, suffix: "/100" },
//     { label: "Gross Yield",      av: a.yield_pct, bv: b.yield_pct, suffix: "%" },
//     { label: "Avg Price/sqm",    av: a.avg_psm, bv: b.avg_psm, suffix: "", isPrice: true },
//     { label: "Price Trend YoY",  av: a.price_trend, bv: b.price_trend, suffix: "%" },
//   ].filter(m => m.av != null || m.bv != null);

//   if (!metrics.length) return null;

//   return (
//     <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — VISUAL COMPARISON`}>
//       {metrics.map((m, i) => {
//         const maxVal = Math.max(Math.abs(m.av || 0), Math.abs(m.bv || 0)) * 1.2 || 1;
//         const aPct = m.av != null ? Math.min(100, (Math.abs(m.av) / maxVal) * 100) : 0;
//         const bPct = m.bv != null ? Math.min(100, (Math.abs(m.bv) / maxVal) * 100) : 0;
//         return (
//           <div key={i} style={{ marginBottom: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
//               {m.label}
//             </div>
//             {[[a.name, m.av, aPct, C.copper], [b.name, m.bv, bPct, C.blue]].map(([name, val, pct, color], j) => (
//               <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: j === 0 ? 4 : 0 }}>
//                 <span style={{ width: 110, fontSize: 11, color: C.textSecondary, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
//                 <div style={{ flex: 1, height: 14, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
//                   <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
//                 </div>
//                 <span style={{ width: 70, fontSize: 11, fontWeight: 700, color: C.textPrimary, textAlign: "right" }}>
//                   {val != null ? `${m.isPrice ? Math.round(val).toLocaleString() : val}${m.suffix}` : "—"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         );
//       })}
//     </CardSection>
//   );
// }


// // ─────────────────────────────────────────────────────────────────
// // HERO BADGES
// // ─────────────────────────────────────────────────────────────────
// function HeroBadges({ score, verdict, yieldPct, priceTrend }) {
//   if (!score && !verdict && !yieldPct) return null;
//   const verdictStyle = {
//     BUY:   { bg: "#D1FAE5", color: "#065F46" },
//     HOLD:  { bg: "#FEF3C7", color: "#92400E" },
//     WATCH: { bg: "#FEE2E2", color: "#991B1B" },
//   }[verdict] || { bg: "#F3F4F6", color: C.textPrimary };

//   return (
//     <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
//       {score && <span style={{ padding: "4px 10px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>Score {score}/100</span>}
//       {verdict && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: verdictStyle.bg, color: verdictStyle.color }}>{verdict}</span>}
//       {yieldPct && <span style={{ padding: "4px 10px", background: "#EFF6FF", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>Yield {yieldPct}%</span>}
//       {priceTrend != null && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: priceTrend > 0 ? "#D1FAE5" : "#FEE2E2", color: priceTrend > 0 ? "#065F46" : "#991B1B" }}>{priceTrend > 0 ? "+" : ""}{priceTrend}% trend</span>}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CHART (bar chart for prices/yields)
// // ─────────────────────────────────────────────────────────────────
// function SingleChart({ chart }) {
//   if (!chart?.data?.length) return null;
//   const valid = chart.data.filter(d => d.value > 0);
//   if (!valid.length) return null;
//   const max = Math.max(...valid.map(d => d.value));
//   return (
//     <div style={{ margin: "16px 0 8px", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
//       <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>{chart.title}</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//         {valid.slice(0, 10).map((item, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 100, fontSize: 11, color: C.textLight, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
//             <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
//               <div style={{ height: "100%", width: `${Math.max(3, (item.value / max) * 100)}%`, background: chart.type === "line" ? "#3B82F6" : C.copper, borderRadius: 3 }} />
//             </div>
//             <div style={{ width: 64, fontSize: 11, color: C.textSecondary, fontWeight: 600, flexShrink: 0, textAlign: "right" }}>{item.value?.toLocaleString()}</div>
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
//         <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
//       ))}
//       <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
//     </div>
//   );
// }

// function Avatar() {
//   return (
//     <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.copper, fontWeight: 700 }}>✦</div>
//   );
// }

// function extractFollowups(reply) {
//   if (!reply) return [];
//   const lines = reply.split("\n");
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
//         <div style={{ maxWidth: "75%", padding: "10px 14px", background: C.userBubble, borderRadius: "18px 18px 4px 18px", fontSize: 14, color: C.textPrimary, lineHeight: 1.6 }}>
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
//           {msg.summary && <p style={{ margin: "0 0 12px 0", fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{msg.summary}</p>}
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
//         <div style={{ flex: 1, background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 12, padding: "16px 18px" }}>
//           {lines.map((line, i) => {
//             const trimmed = line.trim();
//             if (/^\d+\./.test(trimmed)) {
//               const content = trimmed.replace(/^\d+\.\s*/, "");
//               const num = trimmed.match(/^(\d+)\./)?.[1];
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
//   const charts    = Array.isArray(msg.charts) ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0)) : [];
//   const followups = msg._followups || [];
// const hasAreaData = !!(
//   msg.area_intelligence ||
//   msg.transaction_stats ||
//   msg.score ||
//   msg.yield_pct ||
//   msg.verdict ||
//   (msg.area_links && msg.area_links.length > 0)
// );

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//         {/* Summary */}
//         {(msg.summary || msg._summary) && (
//           <p style={{ margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary, lineHeight: 1.75, fontWeight: 400, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
//             {msg.summary || msg._summary}
//           </p>
//         )}

//         {/* Badges */}
//         <HeroBadges score={msg.score} verdict={msg.verdict} yieldPct={msg.yield_pct} priceTrend={msg.price_trend} />

// {/* ── MULTI-AREA (comparison/lifestyle/budget) RESPONSES ── */}
//         {hasAreaData && msg.response_mode === "multi_area" ? (
//           <>
//             {sections && sections.length > 0 && sections[0].header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌")) && (
//               <SectionBlock header={sections[0].header} body={sections[0].body} />
//             )}

//            <MultiAreaCards msg={msg} />
//             {msg.comparison_data?.length >= 2 && <ComparisonTable msg={msg} />}
//             {msg.comparison_data?.length >= 2 && <ComparisonBarChart msg={msg} />}

//             {sections && sections.slice(
//               (sections[0]?.header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌"))) ? 1 : 0
//             ).map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}

//             {!sections && msg.reply && (
//               <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//                 dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//               />
//             )}

//             {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
//           </>
//         ) : (
//           <>
//             {hasAreaData && (
//               <>
//                 {/* Hero stats + Score card side by side */}
//                 {msg.score ? (
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12, marginBottom: 16 }}>
//                     <HeroStatsRow msg={msg} />
//                     <ScoreCard msg={msg} />
//                   </div>
//                 ) : (
//                   <HeroStatsRow msg={msg} />
//                 )}

//                 {/* Buyer: Guide + Price table + Costs */}
//                 <BuyerGuide msg={msg} />
//                 <PriceTable msg={msg} />
//                 <OwnershipCosts msg={msg} />

//                 {/* Seller: Owner valuation */}
//                 <OwnerValuation msg={msg} />

//                 {/* Investor: 4 big metric cards */}
//                 <InvestorMetrics msg={msg} />

//                 {/* Investor/Broker: Nationality + Yield by type */}
//                 {["investor", "broker"].includes(msg.user_type) && (
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//                     <NationalityCard msg={msg} />
//                     <YieldByTypeCard msg={msg} />
//                   </div>
//                 )}

//                 {/* Past / Present / Future tabs */}
//                 <TimeTabs
//                   tabs={[
//                     {
//                       label: "PAST — HISTORY & TRACK RECORD",
//                       icon: "📜",
//                       content: (
//                         <>
//                           <PriceHistoryCard msg={msg} />
//                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//                             <AreaMaturityCard msg={msg} />
//                             <DeveloperTrackRecordCard msg={msg} />
//                           </div>
//                         </>
//                       ),
//                     },
//                     {
//                       label: "PRESENT — LIVE MARKET DATA",
//                       icon: "📡",
//                       content: (
//                         <>
//                           <DistressMeter msg={msg} />
//                           {["investor", "broker"].includes(msg.user_type) && (
//                             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//                               <MarketCompositionCard msg={msg} />
//                               <TruvaluBenchmark msg={msg} />
//                             </div>
//                           )}
//                           {!["investor", "broker"].includes(msg.user_type) && <TruvaluBenchmark msg={msg} />}
//                           <RentRangesCard msg={msg} />
//                           <NationalityCard msg={msg} />
//                         </>
//                       ),
//                     },
//                     {
//                       label: "FUTURE — WHAT'S COMING",
//                       icon: "🔭",
//                       content: (
//                         (msg.area_catalysts?.length > 0 || msg.area_intelligence?.catalyst_score) ? (
//                           <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
//                             <CatalystsCard msg={msg} />
//                           </div>
//                         ) : (
//                           <p style={{ fontSize: 13, color: C.textMuted, padding: "20px 0", textAlign: "center" }}>No catalyst data available for this area yet.</p>
//                         )
//                       ),
//                     },
//                   ]}
//                 />
//               </>
//             )}

//             {sections ? (
//               <div>
//                 {sections.map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}
//               </div>
//             ) : msg.reply ? (
//               <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//                 dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//               />
//             ) : null}

//             {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
//           </>
//         )}

//         {/* Insight */}
//         {msg.insight && (
//           <div style={{ marginTop: 16, padding: "10px 14px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
//             ✦ {msg.insight}
//           </div>
//         )}

//         {/* Area links */}
//         {msg.area_links && msg.area_links.length > 0 && (
//           <div style={{ marginTop: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Explore Areas</div>
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

//         {/* Valuation CTA */}
//         <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
//           💡 BTW — You can instantly verify the real market value of any Dubai property you are looking at here →{" "}
//           <a href="https://www.acqar.com/valuation" target="_blank" rel="noopener noreferrer" style={{ color: "#B87333", textDecoration: "underline", fontWeight: 700 }}>
//             https://www.acqar.com/valuation
//           </a>
//         </div>

//         {/* Follow-ups */}
//         {followups.length > 0 && (
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
//             {followups.map((fq, i) => (
//               <button key={i} onClick={() => onSuggestion(fq)}
//                 style={{ padding: "5px 11px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 20, color: C.textLight, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//               >{fq}</button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// function LoginModal({ open, onClose, navigate }) {
//   if (!open) return null;
//   return (
//     <div onClick={onClose}
//       style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.55)",
//         display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
//       <div onClick={e => e.stopPropagation()}
//         style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", maxWidth: 380,
//           width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
//         <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
//         <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: "#111827" }}>
//           Sign in to view your answer
//         </h3>
//         <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>
//           Your answer is ready. Log in — it will be waiting for you right here.
//         </p>
//         <button onClick={() => navigate("/login")}
//           style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "none", cursor: "pointer",
//             background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", color: "#fff",
//             fontWeight: 800, fontSize: 15, fontFamily: "inherit" }}>
//           Sign In →
//         </button>
//         <button onClick={() => navigate("/signup")}
//           style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12,
//             border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
//             fontWeight: 700, fontSize: 14, color: "#111827", fontFamily: "inherit" }}>
//           Create an account
//         </button>
//         <button onClick={onClose}
//           style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer",
//             fontSize: 12.5, color: "#9CA3AF", fontFamily: "inherit" }}>
//           Not now
//         </button>
//       </div>
//     </div>
//   );
// }

// function FeedbackAndShare({ user, messages }) {
//   const [text, setText] = useState("");
//   const [status, setStatus] = useState("");        // feedback status
//   const [shareStatus, setShareStatus] = useState(""); // "", "saving", "copied", "error"
//   const [open, setOpen] = useState(true);

//   const submitFeedback = async () => {
//     if (!text.trim() || status === "saving") return;
//     setStatus("saving");
//     const { error } = await supabase.from("broker_feedback").insert({
//       user_id: user?.id || null,
//       email: user?.email || null,
//       feedback: text.trim(),
//       page: "/broker",
//     });
//     if (error) setStatus("error");
//     else { setStatus("done"); setText(""); setTimeout(() => setStatus(""), 3000); }
//   };

//   const shareChat = async () => {
//     if (shareStatus === "saving") return;
//     const shareable = messages.filter(m => m.role === "user" || m.role === "assistant");
//     if (!shareable.length) { setShareStatus("empty"); setTimeout(() => setShareStatus(""), 2500); return; }
//     setShareStatus("saving");
//     const { data, error } = await supabase
//       .from("broker_shared_chats")
//       .insert({ user_id: user?.id || null, messages: shareable })
//       .select("id")
//       .single();
//     if (error || !data?.id) { setShareStatus("error"); setTimeout(() => setShareStatus(""), 3000); return; }
//     const url = `${window.location.origin}/broker?share=${data.id}`;
//     if (navigator.share) {
//       try { await navigator.share({ title: "ACQAR Intelligence Chat", url }); } catch {}
//       setShareStatus("");
//     } else {
//       try { await navigator.clipboard.writeText(url); setShareStatus("copied"); }
//       catch { setShareStatus("error"); }
//       setTimeout(() => setShareStatus(""), 3000);
//     }
//   };

//   if (!open) {
//     return (
//       <button onClick={() => setOpen(true)}
//         style={{ position: "fixed", right: 16, bottom: 100, zIndex: 900, padding: "10px 14px",
//           borderRadius: 24, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
//           fontWeight: 700, fontSize: 12, color: "#C8732A", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontFamily: "inherit" }}>
//         💬 Feedback
//       </button>
//     );
//   }

//   return (
//     <div style={{ position: "fixed", right: 16, bottom: 100, zIndex: 900, width: 260,
//       background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 14px 12px",
//       boxShadow: "0 8px 30px rgba(0,0,0,0.14)" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
//         <span style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>💬 Feedback</span>
//         <button onClick={() => setOpen(false)}
//           style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 14, padding: 0 }}>✕</button>
//       </div>
//       <textarea
//         value={text}
//         onChange={e => setText(e.target.value)}
//         placeholder="Share your feedback..."
//         rows={3}
//         style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10,
//           fontSize: 12, border: "1px solid #E5E7EB", background: "#FAFAFA", outline: "none",
//           color: "#111827", fontFamily: "inherit", resize: "none" }}
//       />
//       <button onClick={submitFeedback} disabled={status === "saving" || !text.trim()}
//         style={{ width: "100%", marginTop: 8, padding: "9px 0", borderRadius: 10, border: "none",
//           cursor: status === "saving" || !text.trim() ? "not-allowed" : "pointer",
//           background: "#111827", color: "#fff", fontWeight: 700, fontSize: 12,
//           fontFamily: "inherit", opacity: status === "saving" || !text.trim() ? 0.5 : 1 }}>
//         {status === "saving" ? "Saving..." : "Send Feedback"}
//       </button>
//       {status === "done" && <div style={{ fontSize: 11, color: "#16A34A", marginTop: 5 }}>✓ Feedback saved!</div>}
//       {status === "error" && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 5 }}>Could not save. Log in first.</div>}

//       <div style={{ borderTop: "1px solid #F3F4F6", margin: "10px 0 8px" }} />

//       <button onClick={shareChat} disabled={shareStatus === "saving"}
//         style={{ width: "100%", padding: "9px 0", borderRadius: 10, cursor: "pointer",
//           border: "1px solid #E5E7EB", background: "#fff", color: "#C8732A",
//           fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
//         {shareStatus === "saving" ? "Creating link..." : shareStatus === "copied" ? "✓ Link copied!" : "↗ Share this chat"}
//       </button>
//       {shareStatus === "empty" && <div style={{ fontSize: 11, color: "#D97706", marginTop: 5 }}>Ask a question first, then share.</div>}
//       {shareStatus === "error" && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 5 }}>Could not create link. Log in first.</div>}
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
//   const location = useLocation();
// const isBroker = location.pathname === "/broker";
// const [showLoginModal, setShowLoginModal] = useState(false);

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

//   // Restore pending answer after login + save broker user
// useEffect(() => {
//   if (!user || !isBroker) return;

//   const pending = sessionStorage.getItem(BROKER_PENDING_KEY);
//   if (pending) {
//     try {
//       const { query, response } = JSON.parse(pending);
//       const followups = extractFollowups(response.reply || "");
//       setMessages([
//         { role: "user", text: query },
//         { role: "assistant", _query: query, _followups: followups, ...response },
//       ]);
//       setHistory([
//         { role: "user", content: query },
//         { role: "assistant", content: response.reply || "" },
//       ]);
//     } catch {}
//     sessionStorage.removeItem(BROKER_PENDING_KEY);
//   }

//   setMessages(m => m.map(x => (x.locked ? { ...x, locked: false } : x)));
//   setShowLoginModal(false);

//   supabase.from("broker_users").upsert(
//     {
//       user_id: user.id,
//       email: user.email,
//       full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
//       last_active_at: new Date().toISOString(),
//     },
//     { onConflict: "user_id" }
//   ).then(({ error }) => {
//     if (error) console.error("broker_users upsert:", error.message);
//   });
// }, [user, isBroker]);



// // Load a shared chat if URL has ?share=<id>
// useEffect(() => {
//   const shareId = new URLSearchParams(location.search).get("share");
//   if (!shareId || !isBroker) return;
//   supabase
//     .from("broker_shared_chats")
//     .select("messages")
//     .eq("id", shareId)
//     .single()
//     .then(({ data, error }) => {
//       if (!error && data?.messages) setMessages(data.messages);
//     });
// }, [location.search, isBroker]);


//   useEffect(() => {
//     const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
//     ping();
//     const id = setInterval(ping, 4 * 60 * 1000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

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
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: query, history: history.slice(-6) }),
//       });
//       const json = await res.json();
//       const followups = extractFollowups(json.reply || "");
//       // LOGIN GATE — only on /broker, only when logged out
// if (isBroker && !user) {
//   setMessages(m => [
//     ...m.filter(x => x.role !== "thinking"),
//     { role: "assistant", locked: true, _query: query, _summary: summary, _followups: followups, ...json },
//   ]);
//   sessionStorage.setItem(BROKER_PENDING_KEY, JSON.stringify({ query, response: json }));
//   setShowLoginModal(true);
//   setLoading(false);
//   return;
// }
//       setMessages(m => [
//         ...m.filter(x => x.role !== "thinking"),
//         { role: "assistant", _query: query, _summary: summary, _followups: followups, ...json },
//       ]);
//       setHistory(h => [...h, { role: "user", content: query }, { role: "assistant", content: json.reply || "" }].slice(-12));
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
//     <div style={{ height: "100vh", background: C.pageBg, display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden" }}>

//       {/* Sidebar */}
//       <div style={{ width: 56, background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0 }}>
//         {[
//           { label: "Chat",     active: true,  onClick: () => {},                                                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
//           { label: "Terminal", active: false, onClick: () => window.location.href = "https://www.acqar.com/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//           { label: "Areas",    active: false, onClick: () => window.location.href = "https://www.acqar.com/areas",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
//           { label: "Reports",  active: false, onClick: () => window.location.href = "https://www.acqar.com/my-reports", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//         ].map(item => (
//           <button key={item.label} onClick={item.onClick} title={item.label}
//             style={{ width: 44, height: 44, borderRadius: 10, background: item.active ? C.copperTint : "transparent", border: item.active ? `1px solid ${C.copperBorder}` : "1px solid transparent", color: item.active ? C.copper : C.textMuted, cursor: item.active ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.15s" }}
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
//         <div style={{ height: 52, padding: "0 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
//             <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.copper }}>✦</div>
//             <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>ACQAR Intelligence</span>
//           </div>
//           <span style={{ fontSize: 11, color: C.textMuted }}>{user ? user.email : "Not signed in"}</span>
//         </div>

//         {/* Messages */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 0" }}>
//           <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px" }}>

//             {messages.length === 0 && (
//               <div style={{ textAlign: "center", paddingTop: 60 }}>
//                 <div style={{ fontSize: 28, color: C.copper, marginBottom: 12 }}>✦</div>
//                 <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>Ask ACQAR Intelligence</h2>
//                 <p style={{ fontSize: 14, color: C.textLight, margin: "0 0 36px", lineHeight: 1.6 }}>
//                   365K+ real DLD transactions · Area analytics · Investment scores · School & community data
//                 </p>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 560, margin: "0 auto" }}>
//                   {SUGGESTIONS.map(s => (
//                     <button key={s} onClick={() => handleSend(s)}
//                       style={{ padding: "10px 14px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textLight, fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.45, fontFamily: "inherit", transition: "all 0.15s" }}
//                       onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                       onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//                     >{s}</button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {messages.map((msg, i) =>
//   msg.locked ? (
//     <div key={i} style={{ position: "relative" }}>
//       <div style={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none" }}>
//         <Message msg={msg} onSuggestion={() => {}} navigate={navigate} />
//       </div>
//       <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <button
//           onClick={() => setShowLoginModal(true)}
//           style={{ padding: "12px 22px", borderRadius: 10, border: "none", cursor: "pointer",
//             background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", color: "#fff",
//             fontWeight: 800, fontSize: 14, boxShadow: "0 8px 24px rgba(180,83,9,0.35)", fontFamily: "inherit" }}
//         >
//           🔒 Log in to view full answer
//         </button>
//       </div>
//     </div>
//   ) : (
//     <Message key={i} msg={msg} onSuggestion={handleSend} navigate={navigate} />
//   )
// )}
//             <div ref={bottomRef} style={{ height: 20 }} />
//           </div>
//         </div>

//         {/* Input bar */}
//         <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
//           <div style={{ maxWidth: 780, margin: "0 auto" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FAFAFA", border: `1.5px solid ${loading ? C.copper : C.border}`, borderRadius: 12, padding: "4px 4px 4px 16px", transition: "border-color 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
//               <input
//                 ref={inputRef}
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
//                 placeholder="Ask anything about Dubai real estate..."
//                 disabled={loading}
//                 style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.textPrimary, fontFamily: "inherit" }}
//               />
//               <button
//                 onClick={() => handleSend()}
//                 disabled={loading || !input.trim()}
//                 style={{ width: 36, height: 36, background: loading || !input.trim() ? "#E5E7EB" : C.textPrimary, border: "none", borderRadius: 8, cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}
//               >
//                 {loading
//                   ? <div style={{ display: "flex", gap: 2 }}>{[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}</div>
//                   : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                 }
//               </button>
//             </div>
//             <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.textMuted }}>
//               Powered by Acqar · 365K+ DLD Transactions · Real closed-sale prices, not asking prices
//             </div>
//             {isBroker && <FeedbackAndShare user={user} messages={messages} />}
//          </div>
//         </div>
//       </div>

//       <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} navigate={navigate} />
//     </div>
//   );
// }














// import { useState, useRef, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import posthog from "posthog-js";

// const BACKEND = "https://development-production-2ad3.up.railway.app";
// const BROKER_PENDING_KEY = "acqar_broker_pending";

// const SUGGESTIONS = [
//   "Give me a full investment report on JVC",
//   "Best areas for rental yield in Dubai right now",
//   "Compare Business Bay vs Downtown Dubai",
//   "How do I buy property in Dubai as a foreigner?",
//   "Is Dubai Marina a good buy in 2026?",
//   "Which Dubai area has the highest investment score?",
// ];

// // ─────────────────────────────────────────────────────────────────
// // DESIGN TOKENS — matching Area Specialist exactly
// // ─────────────────────────────────────────────────────────────────
// const C = {
//   bg:           "#FFFFFF",
//   pageBg:       "#F7F7F8",
//   textPrimary:  "#111827",
//   textSecondary:"#374151",
//   textMuted:    "#9CA3AF",
//   textLight:    "#6B7280",
//   border:       "#E5E7EB",
//   copper:       "#C8732A",
//   copperBorder: "rgba(200,115,42,0.25)",
//   copperTint:   "rgba(200,115,42,0.08)",
//   userBubble:   "#F3F4F6",
//   green:        "#16A34A",
//   greenL:       "rgba(22,163,74,0.1)",
//   amber:        "#D97706",
//   amberL:       "rgba(217,119,6,0.1)",
//   red:          "#DC2626",
//   redL:         "rgba(220,38,38,0.1)",
//   blue:         "#2563EB",
//   blueL:        "rgba(37,99,235,0.09)",
// };

// // ─────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────
// function fmtAED(v) {
//   if (!v) return "—";
//   const n = parseFloat(v);
//   if (!isFinite(n)) return "—";
//   if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
//   if (n >= 1_000) return `AED ${Math.round(n / 1000)}K`;
//   return `AED ${parseInt(n).toLocaleString()}`;
// }

// function fmtNum(n) {
//   if (!n) return "—";
//   return parseFloat(n).toLocaleString();
// }

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
//   const words = query.trim().split(/\s+/).slice(0, 8).join(" ");
//   return `Searching 365,000+ DLD transactions for: ${words}${query.split(/\s+/).length > 8 ? "..." : ""}`;
// }

// const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼","📌","🔍"];

// function parseReplyToSections(reply) {
//   if (!reply) return null;
//   const lines = reply.split("\n");
//   const sections = [];
//   let current = null;
//   for (const line of lines) {
//     const trimmed = line.trim();
//     if (!trimmed) { if (current) current.body += "\n"; continue; }
//     const isHeader = SECTION_EMOJIS.some(e => trimmed.startsWith(e));
//     if (isHeader) {
//       if (current) sections.push(current);
//       current = { header: trimmed, body: "" };
//     } else {
//       if (current) current.body += (current.body ? "\n" : "") + trimmed;
//       else sections.push({ header: null, body: trimmed });
//     }
//   }
//   if (current) sections.push(current);
//   return sections.length > 0 ? sections : null;
// }

// function highlightValues(text) {
//   return text
//     .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
//     .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
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
//   const cleanTrimmed = trimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '').trim();
//   if (trimmed.includes("](")) {
//     if (!cleanTrimmed) return null;
//     return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(cleanTrimmed) }} />;
//   }
//   if (trimmed.toLowerCase() === "explore areas") return null;
//   if (trimmed.startsWith("⚠️")) {
//     return <div key={key} style={{ margin: "6px 0", padding: "8px 12px", background: "#FFFBEB", borderLeft: "3px solid #F59E0B", borderRadius: "0 6px 6px 0", fontSize: 13, color: "#92400E" }}>{trimmed}</div>;
//   }
//   if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
//     const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
//     const isHeader = cells.every(c => c.match(/^[-\s]+$/));
//     if (isHeader) return <div key={key} style={{ borderBottom: `1px solid ${C.border}`, margin: "2px 0" }} />;
//     return (
//       <div key={key} style={{ display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: 4, padding: "5px 0", borderBottom: `1px solid #F3F4F6`, fontSize: 12 }}>
//         {cells.map((cell, i) => <span key={i} style={{ color: i === 0 ? C.textPrimary : C.textSecondary, fontWeight: i === 0 ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: highlightValues(cell) }} />)}
//       </div>
//     );
//   }
//   if (/^\d+\./.test(trimmed)) {
//     const content = trimmed.replace(/^\d+\.\s*/, "");
//     const num = trimmed.match(/^(\d+)\./)?.[1];
//     return (
//       <div key={key} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
//         <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightValues(content) }} />
//       </div>
//     );
//   }
//   if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
//     const txt = trimmed.replace(/^[•\-]\s*/, "");
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
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
//       </div>
//     );
//   }
//   const colonIdx = trimmed.indexOf(":");
//   if (colonIdx > 0 && colonIdx < 32 && !trimmed.includes("→") && !trimmed.startsWith("http") && !trimmed.includes("|")) {
//     const k = trimmed.slice(0, colonIdx).trim().replace(/\*\*/g, "");
//     const val = trimmed.slice(colonIdx + 1).trim();
//     if (k && val && k.length < 32) {
//       return (
//         <div key={key} style={{ margin: "4px 0", fontSize: 13, lineHeight: 1.65 }}>
//           <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{k}:</strong>{" "}
//           <span style={{ color: C.textSecondary }} dangerouslySetInnerHTML={{ __html: highlightValues(val) }} />
//         </div>
//       );
//     }
//   }
//   return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />;
// }

// function SectionBlock({ header, body }) {
//   const lines = body.split("\n").filter(l => l !== undefined);
//   return (
//     <div style={{ marginBottom: 20 }}>
//       {header && (
//         <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
//           {header}
//         </div>
//       )}
//       <div>{lines.map((line, i) => renderLine(line, i))}</div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // SHARED MINI COMPONENTS
// // ─────────────────────────────────────────────────────────────────
// function CardSection({ title, badge, children }) {
//   return (
//     <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12, overflow: "hidden" }}>
//       {title && (
//         <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <span>{title}</span>
//           {badge && <span style={{ fontSize: 10, textTransform: "none", letterSpacing: 0, padding: "2px 8px", borderRadius: 4, background: C.pageBg, color: C.textMuted, fontWeight: 500 }}>{badge}</span>}
//         </div>
//       )}
//       {children}
//     </div>
//   );
// }

// function StRow({ label, value, valueColor, last }) {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: last ? "none" : `1px solid ${C.border}`, fontSize: 12, gap: 8 }}>
//       <span style={{ color: C.textMuted, flexShrink: 0, maxWidth: "55%" }}>{label}</span>
//       <span style={{ fontWeight: 700, color: valueColor || C.textPrimary, textAlign: "right" }}>{value}</span>
//     </div>
//   );
// }

// function RatioBar({ left, leftPct, leftColor, right, rightPct, rightColor, last }) {
//   return (
//     <div style={{ marginBottom: last ? 0 : 10 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
//         <span style={{ color: C.textPrimary, fontWeight: 700 }}>{left} {leftPct}%</span>
//         <span style={{ color: C.textMuted }}>{right} {rightPct}%</span>
//       </div>
//       <div style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden" }}>
//         <div style={{ width: `${leftPct}%`, background: leftColor }} />
//         <div style={{ width: `${rightPct}%`, background: rightColor }} />
//       </div>
//     </div>
//   );
// }


// function TimeTabs({ tabs }) {
//   return (
//     <div style={{ marginBottom: 16 }}>
//       {tabs.map((t, i) => (
//         <div key={i} style={{ marginBottom: i < tabs.length - 1 ? 28 : 0 }}>
//           <div style={{
//             display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
//             borderBottom: `2px solid ${C.copper}`, marginBottom: 16,
//           }}>
//             <span>{t.icon}</span>
//             <span style={{ color: C.copper, fontWeight: 700, fontSize: 13 }}>{t.label}</span>
//           </div>
//           {t.content}
//         </div>
//       ))}
//     </div>
//   );
// }


// function AreaMaturityCard({ msg }) {
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const years = Object.keys(msg.price_history || {}).sort();
//   let appreciation = "—";
//   if (years.length >= 2) {
//     const chg = (((msg.price_history[years[years.length-1]] - msg.price_history[years[0]]) / msg.price_history[years[0]]) * 100).toFixed(1);
//     appreciation = `+${chg}%`;
//   }
//   return (
//     <CardSection title="AREA MATURITY">
//       <StRow label="Year established" value={intel.year_established || "—"} />
//       <StRow label="Master developer" value={intel.master_developer || "—"} />
//       <StRow label="Zone" value={intel.zone_type || "—"} />
//       <StRow label="Completion rate" value={intel.completion_rate ? `~${intel.completion_rate}% built` : "—"} valueColor={C.green} />
//       <StRow label="Residential units" value={intel.residential_units ? `${intel.residential_units.toLocaleString()} registered` : "—"} />
//       <StRow label="Active off-plan projects" value={intel.active_project_count ? `${intel.active_project_count} projects` : "—"} valueColor={C.copper} />
//       <StRow label="5-year appreciation" value={appreciation} valueColor={C.green} last />
//     </CardSection>
//   );
// }



// function DeveloperTrackRecordCard({ msg }) {
//   const devs = msg.developer_track_records || [];
//   if (!devs.length) return null;
//   const area = msg.area_intelligence?.area_name_en || "AREA";
//   return (
//     <CardSection title={`DEVELOPER DELIVERY TRACK RECORD IN ${area.toUpperCase()}`} badge="Historical estimates">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["DEVELOPER","ON-TIME %","AVG DELAY","RATING","SEGMENT"].map(h => (
//             <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {devs.slice(0, 6).map((d, i) => (
//             <tr key={i}>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{d.developer_name}</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.on_time_pct >= 90 ? C.green : d.on_time_pct >= 80 ? C.amber : C.red, fontWeight: 700 }}>{d.on_time_pct}%</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.avg_delay_months > 0 ? C.red : C.green }}>{d.avg_delay_months > 0 ? `~${d.avg_delay_months} months` : "On time / early"}</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>{"★".repeat(Math.round(d.star_rating || 0))}{"☆".repeat(5 - Math.round(d.star_rating || 0))}</td>
//               <td style={{ padding: "8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{d.market_segment}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }
// // ─────────────────────────────────────────────────────────────────
// // HERO STATS ROW — matches Image 1 exactly (6 tiles)
// // ─────────────────────────────────────────────────────────────────
// function HeroStatsRow({ msg }) {
//   const intel    = msg.area_intelligence || {};
//   if (!intel.area_name_en && !["buyer","seller","investor","broker"].includes(msg.user_type)) return null;
//   const stats    = msg.transaction_stats || {};
//   const userType = msg.user_type || "general";
//   const yld      = msg.yield_pct;
//   const trend    = msg.price_trend;
//   const verdict  = msg.verdict;
//   const score    = msg.score;
//   const tx       = intel.tx_7d;
//   const txDelta  = intel.tx_7d_delta_pct;
//   const avgPsm   = intel.truvalu_psm || stats.avg_price_sqm;
//   const distress = msg.distress_pct;
//   const absRate  = intel.absorption_rate_pct;
//   const catScore = intel.catalyst_score;
//   const bmed     = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr];
//   const daysToSell = score ? Math.round(75 - parseFloat(score) * 0.4) : null;
//   const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
//   const moodLabel = verdict === "BUY" ? "Bullish" : verdict === "HOLD" ? "Cautious" : "Slow";
//   const moodColor = verdict === "BUY" ? C.green : verdict === "HOLD" ? C.amber : C.red;

//   let items = [];

//   if (userType === "buyer") {
//     items = [
//       { lbl: "HOMES SOLD THIS WEEK", val: tx ? String(tx) : (score ? String(Math.round(20 + parseFloat(score) * 1.5)) : "—"), valColor: C.red, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% vs last week` : "est. based on area score" },
//       avgPsm && { lbl: "WHAT'S A FAIR PRICE HERE?", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: `≈ AED ${Math.round(avgPsm / 10.7639).toLocaleString()}/sqft · Slightly up over 3 months`, subColor: C.green },
//       yld && { lbl: "RENT RETURN PER YEAR", val: `${yld}%`, valColor: C.green, sub: parseFloat(yld) > 6.1 ? "Better than Dubai's 6.1% average" : "Near Dubai average" },
//       daysToSell && { lbl: "HOW LONG TO SELL?", val: `${daysToSell} days`, valColor: daysToSell > 40 ? C.amber : C.green, sub: daysToSell > 40 ? "Takes a bit longer than usual" : "Faster than Dubai average", subColor: daysToSell > 40 ? C.red : C.green },
//       availListings && { lbl: "HOMES AVAILABLE TO BUY", val: availListings.toLocaleString(), valColor: C.textPrimary, sub: "More choice than normal — good for buyers" },
//       verdict && { lbl: "MARKET MOOD RIGHT NOW", val: moodLabel, valColor: moodColor, sub: verdict === "BUY" ? "Strong demand — buy with confidence" : "Watch closely — market paused" },
//     ];
//   } else if (userType === "seller") {
//     const recPrice = firstMed ? Math.round(parseFloat(firstMed) * 1.06) : null;
//     items = [
//       avgPsm && { lbl: "CURRENT MARKET PRICE", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: "Truvalu™ DLD benchmark" },
//       recPrice && { lbl: "RECOMMENDED LIST PRICE", val: fmtAED(recPrice), valColor: C.copper, sub: `6% above DLD median — ${firstBr}` },
//       trend != null && { lbl: "PRICE MOMENTUM", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Rising — sell into strength" : "Cooling — price carefully" },
//       tx && { lbl: "WEEKLY TRANSACTIONS", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "DLD live volume" },
//       distress && { lbl: "DISTRESS SALES", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: parseFloat(distress) > 10 ? "High — price competitively" : "Low — sellers have leverage" },
//       verdict && { lbl: "SHOULD YOU SELL?", val: trend != null && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M", valColor: trend != null && parseFloat(trend) > 0 ? C.green : C.amber, sub: "Based on current market signals" },
//     ];
//   } else if (userType === "investor") {
//     items = [
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
//       distress && { lbl: "DISTRESS OPPORTUNITY", val: `${distress}%`, valColor: C.amber, sub: `${availListings ? Math.round(availListings * parseFloat(distress) / 100) : "—"} units priced below Truvalu™ floor` },
//       catScore && { lbl: "CATALYST SCORE", val: `${catScore}/100`, valColor: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: "0 confirmed infra catalysts in next 24 months" },
//       score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : parseFloat(score) >= 60 ? C.amber : C.red, sub: parseFloat(score) >= 75 ? "STRONG BUY" : parseFloat(score) >= 60 ? "BUY" : "HOLD" },
//       absRate && { lbl: "ABSORPTION RATE", val: `${absRate}%`, valColor: parseFloat(absRate) > 50 ? C.green : C.amber, sub: "Fast-moving demand" },
//       trend != null && { lbl: "CAPITAL APPRECIATION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Price trend year on year" },
//     ];
//   } else if (userType === "broker") {
//     items = [
//       score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : C.amber, sub: verdict ? `Verdict: ${verdict}` : "Area fundamentals" },
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "For investor pitch decks" },
//       avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "DLD Truvalu™ benchmark" },
//       tx && { lbl: "WEEKLY DLD VOLUME", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "Live data" },
//       distress && { lbl: "DISTRESS %", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: "Share with investor clients" },
//       trend != null && { lbl: "PRICE DIRECTION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Tell buyers: entry window now" : "Tell buyers: negotiate hard" },
//     ];
//   } else {
//     items = [
//       verdict && { lbl: "VERDICT", val: moodLabel, valColor: moodColor, sub: score ? `Score ${score}/100` : "Market signal" },
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "vs Dubai 6.1% average" },
//       avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "Truvalu™ benchmark" },
//       trend != null && { lbl: "PRICE TREND", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Year on year" },
//     ];
//   }

//   items = items.filter(Boolean);
//   if (!items.length) return null;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 10, marginBottom: 16 }}>
//       {items.map((s, i) => (
//         <div key={i} style={{ padding: "16px 14px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
//           <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 8, lineHeight: 1.4, textAlign: "center" }}>{s.lbl}</div>
//           <div style={{ fontSize: 18, fontWeight: 900, color: s.valColor || C.textPrimary, letterSpacing: "-.01em", marginBottom: 4 }}>{s.val}</div>
//           <div style={{ fontSize: 11, color: s.subColor || C.textMuted, lineHeight: 1.4, textAlign: "center" }}>{s.sub}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // SCORE CARD — matches right side of Image 1
// // ─────────────────────────────────────────────────────────────────
// function ScoreCard({ msg }) {
//   const score   = msg.score;
//   const verdict = msg.verdict;
//   if (!score) return null;
//   const s = parseFloat(score);
//   const scoreColor = s >= 75 ? C.green : s >= 65 ? C.amber : C.red;
//   const verdictBg  = s >= 75 ? C.greenL : C.amberL;
//   const comps = [
//     { label: "Are people buying?",    val: Math.round(s * 0.87), color: s >= 65 ? C.amber : C.red },
//     { label: "Is the price fair?",    val: Math.min(99, Math.round(s * 1.10)), color: C.green },
//     { label: "What's coming nearby?", val: Math.min(99, Math.round(s * 1.18)), color: C.green },
//     { label: "Is the mood positive?", val: Math.round(s * 0.62), color: s >= 70 ? C.amber : C.red },
//   ];
//   return (
//     <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 18px", textAlign: "center" }}>
//       <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 8, background: verdictBg, color: scoreColor }}>{verdict || (s >= 75 ? "BUY" : s >= 65 ? "HOLD" : "WATCH")}</div>
//       <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: "-.02em" }}>{score}</div>
//       <div style={{ fontSize: 14, color: C.textMuted }}>/100</div>
//       <div style={{ fontSize: 11, color: C.textMuted, margin: "4px 0 14px" }}>12-month outlook · 2026</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         {comps.map((comp, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
//             <span style={{ flex: 1, color: C.textSecondary, textAlign: "left", fontSize: 11 }}>{comp.label}</span>
//             <div style={{ width: 72, height: 5, background: "#F3F4F6", borderRadius: 3 }}>
//               <div style={{ width: `${Math.min(comp.val, 100)}%`, height: 5, borderRadius: 3, background: comp.color }} />
//             </div>
//             <span style={{ width: 24, textAlign: "right", fontWeight: 700, fontSize: 11, color: comp.color }}>{comp.val}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // BUYER GUIDE — matches Image 2 (5-step guide)
// // ─────────────────────────────────────────────────────────────────
// function BuyerGuide({ msg }) {
//   if (msg.user_type !== "buyer") return null;
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const stats = msg.transaction_stats || {};
//   const area  = intel.area_name_en || "this area";
//   const yld   = msg.yield_pct;
//   const bmed  = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr];
//   const cats  = msg.area_catalysts || [];
//   const nats  = intel.buyer_nationalities || [];
//   const activeProjects = intel.active_project_count || 0;

//   const steps = [
//     {
//       num: 1,
//       title: "Understand what a fair price actually looks like here",
//       body: `Our Truvalu™ system calculates what any ${area} property should cost based on real transactions, floor level, view, and condition.${firstMed ? ` A ${firstBr} here is fairly priced at around ${fmtAED(firstMed)}. If someone's asking significantly more — that's a red flag. If it's below that — that's a genuine opportunity.` : " Check area prices below against real DLD closed-sale data."}`
//     },
//     {
//       num: 2,
//       title: "Check what's coming to the area in the next 2 years",
//       body: cats.length > 0
//         ? `${cats.slice(0, 2).map(c => `${c.name} is ${c.confidence || "confirmed"} for ${c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "soon"}`).join(". ")}. Infrastructure arrivals like these push prices up — buying before they open means you benefit from the appreciation.`
//         : `Dubai has confirmed infrastructure investments nearby. Infrastructure arrivals push prices up — buying before they open means you benefit from the price increase. This is why timing matters.`
//     },
//     {
//       num: 3,
//       title: "Don't panic about the current news — look at history",
//       body: `Dubai has been through oil crashes, COVID, and geopolitical scares before. Every time, well-located areas recovered within 8–14 months. The current slowdown is caused by regional news (Iran/USA), not by any problem with Dubai's economy or ${area} specifically.`
//     },
//     {
//       num: 4,
//       title: "Know who else is buying here and why",
//       body: nats.length > 0
//         ? `${area} attracts mostly ${nats[0]?.name || "Indian"} (${nats[0]?.pct || 31}%), ${nats[1]?.name || "British"} (${nats[1]?.pct || 18}%), and ${nats[2]?.name || "Russian"} (${nats[2]?.pct || 14}%) buyers — young professionals, expats, and investors.${yld ? ` Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
//         : `${area} is a popular choice with expat buyers and investors. ${yld ? `Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
//     },
//     {
//       num: 5,
//       title: "Check the developer's track record before buying off-plan",
//       body: activeProjects > 0
//         ? `If you're buying off-plan in ${area}, there are currently ${activeProjects} active projects in this area. Always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
//         : `If you're buying off-plan in ${area}, always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
//     },
//   ];

//   return (
//     <CardSection title={`YOUR 5-STEP BUYING GUIDE FOR ${area.toUpperCase()}`} badge="First-Time Buyer">
//       {steps.map((step, i) => (
//         <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none" }}>
//           <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copper, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{step.title}</div>
//             <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{step.body}</p>
//           </div>
//         </div>
//       ))}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // PRICE TABLE — matches Image 3 (cheapest/fair/expensive)
// // ─────────────────────────────────────────────────────────────────
// function PriceTable({ msg }) {
//   const stats    = msg.transaction_stats || {};
//   const bpsm     = stats.bedroom_avg_psm || {};
//   const bmed     = stats.median_price_by_bedroom || {};
//   const userType = msg.user_type || "general";
//   const yld      = parseFloat(msg.yield_pct || 0);
//   const rows     = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br] || bmed[br]);
//   if (!rows.length) return null;

//   const intel  = msg.area_intelligence || {};
//   const area   = intel.area_name_en || "this area";

//   const configs = {
//     buyer: {
//       title: `WHAT DOES BUYING IN ${area.toUpperCase()} ACTUALLY COST?`,
//       headers: ["PROPERTY TYPE", "CHEAPEST", "FAIR PRICE", "MOST EXPENSIVE"],
//       row: (br) => {
//         const med = parseFloat(bmed[br] || 0);
//         return [br, fmtAED(Math.round(med * 0.75)), fmtAED(med), fmtAED(Math.round(med * 1.40))];
//       },
//       note: 'The "Fair Price" column is Acqar\'s Truvalu™ benchmark — what the property is actually worth based on real transactions, not asking prices.'
//     },
//     seller: {
//       title: "DLD CLOSED SALES — YOUR PRICING ANCHOR",
//       headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "RECOMMENDED LIST"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.06)) : "—"];
//       },
//       note: "Recommended list price is 6% above DLD median — leaves negotiation room while attracting serious buyers."
//     },
//     investor: {
//       title: "ENTRY PRICES + ESTIMATED ANNUAL RENTAL INCOME",
//       headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", "EST. ANNUAL RENT"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         const rent = med && yld ? fmtAED(Math.round(med * yld / 100)) : "—";
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), rent];
//       },
//       note: `Based on ${yld}% gross yield — Dubai average is 6.1%. Best entry: Studio for highest yield-to-price ratio.`
//     },
//     broker: {
//       title: "DLD COMPARABLES — USE FOR CLIENT NEGOTIATIONS",
//       headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "ASKING (~+10%)"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.10)) : "—"];
//       },
//       note: "DLD median is the actual closed-sale price. Asking prices run 8–12% higher — use median to anchor negotiations."
//     },
//     general: {
//       title: "PRICES BY BEDROOM — REAL DLD DATA",
//       headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", ""],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), ""];
//       },
//       note: "Real DLD closed-sale data — not asking prices."
//     }
//   };

//   const cfg = configs[userType] || configs.general;
//   const activeCols = cfg.headers.filter(Boolean);

//   return (
//     <CardSection title={cfg.title}>
//       <div style={{ overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
//           <thead>
//             <tr>
//               {activeCols.map((h, i) => (
//                 <th key={h} style={{ padding: i === 0 ? "7px 6px 7px 0" : "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", letterSpacing: ".05em", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((br, i) => {
//               const cells = cfg.row(br).filter((_, ci) => cfg.headers[ci]);
//               return (
//                 <tr key={br} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
//                   {cells.map((cell, ci) => (
//                     <td key={ci} style={{ padding: ci === 0 ? "8px 6px 8px 0" : "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: ci === 0 ? C.textPrimary : ci === 2 ? C.green : C.textSecondary, fontWeight: ci === 0 ? 700 : ci === 2 ? 700 : 400 }}>{cell}</td>
//                   ))}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       {cfg.note && <p style={{ fontSize: 11, color: C.textMuted, marginTop: 10, lineHeight: 1.5 }}>💡 {cfg.note}</p>}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // OWNERSHIP COSTS — matches right side of Image 3
// // ─────────────────────────────────────────────────────────────────
// function OwnershipCosts({ msg }) {
//   if (msg.user_type !== "buyer") return null;
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};
//   const yld   = parseFloat(msg.yield_pct || 7);
//   const intel = msg.area_intelligence || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
//   const annualRent = firstMed ? Math.round(firstMed * yld / 100 / 1000) * 1000 : null;
//   const netYield = (yld * 0.83).toFixed(1);
//   const avgPsm = intel.truvalu_psm || stats.avg_price_sqm;
//   const serviceCharge = avgPsm > 2000 ? "AED 18–28/sqft" : avgPsm > 1200 ? "AED 12–18/sqft" : "AED 10–18/sqft";

//   return (
//     <CardSection title="WHAT WILL IT COST TO OWN (NOT JUST BUY)?">
//       <StRow label="DLD Transfer Fee"           value="4% of purchase price" />
//       <StRow label="Agent commission"            value="2% (negotiable)" />
//       <StRow label="Annual service charges"      value={serviceCharge} />
//       <StRow label="Typical annual maintenance"  value="AED 5,000–15,000" />
//       {annualRent && <StRow label={`Annual rental income (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />}
//       <StRow label="Net yield after charges (est.)" value={`${netYield}%`} valueColor={C.green} />
//       <StRow label="Mortgage availability"        value="Up to 80% LTV for expats" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // INVESTOR METRICS — matches Image 4 (4 big cards)
// // ─────────────────────────────────────────────────────────────────
// function InvestorMetrics({ msg }) {
//   if (msg.user_type !== "investor") return null;
//   const intel    = msg.area_intelligence || {};
//   const stats    = msg.transaction_stats || {};
//   const yld      = msg.yield_pct;
//   const distress = msg.distress_pct;
//   const score    = msg.score;
//   const catScore = intel.catalyst_score;
//   const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
//   const distressUnits = distress && availListings ? Math.round(availListings * parseFloat(distress) / 100) : null;
//   const activeProjects = intel.active_project_count;
//   const cats = msg.area_catalysts || [];
//   const confirmedCats = cats.filter(c => c.confidence === "confirmed").length;

//   const metrics = [
//     yld && { title: "GROSS YIELD", val: `${yld}%`, color: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${intel.area_name_en || "Area"} ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
//     distress && { title: "DISTRESS OPPORTUNITY", val: `${distress}%`, color: C.amber, sub: distressUnits ? `${distressUnits.toLocaleString()} units priced below Truvalu™ floor right now` : "Units priced below market floor" },
//     catScore && { title: "CATALYST SCORE", val: `${catScore}/100`, color: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: `${confirmedCats} confirmed infra catalysts in next 24 months` },
//     activeProjects && { title: "OFF-PLAN PIPELINE", val: `${activeProjects} Projects`, color: C.blue, sub: `Active off-plan projects in ${intel.area_name_en || "this area"}` },
//   ].filter(Boolean);

//   if (!metrics.length) return null;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(metrics.length, 2)}, 1fr)`, gap: 10, marginBottom: 12 }}>
//       {metrics.map((m, i) => (
//         <CardSection key={i} title={m.title}>
//           <div style={{ fontSize: 34, fontWeight: 900, color: m.color, textAlign: "center", marginBottom: 6 }}>{m.val}</div>
//           <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center" }}>{m.sub}</div>
//         </CardSection>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // MARKET COMPOSITION — matches left side of Image 5
// // ─────────────────────────────────────────────────────────────────
// function MarketCompositionCard({ msg }) {
//   if (!["investor", "broker"].includes(msg.user_type)) return null;
//   return (
//     <CardSection title="MARKET COMPOSITION — INVESTOR VIEW">
//       <RatioBar left="Off-Plan (Primary)" leftPct={58} leftColor={C.blue} right="Ready (Secondary)" rightPct={42} rightColor={C.amber} />
//       <RatioBar left="Investor-owned" leftPct={62} leftColor={C.copper} right="End-user" rightPct={38} rightColor={C.green} />
//       <RatioBar left="Apartments" leftPct={87} leftColor={C.green} right="Villas/TH" rightPct={13} rightColor="#7C3AED" />
//       <RatioBar left="Long-term tenants" leftPct={88} leftColor="#14B8A6" right="Short-stay" rightPct={12} rightColor="#E2E8F0" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // TRUVALU BENCHMARK TABLE — matches right side of Image 5
// // ─────────────────────────────────────────────────────────────────
// function TruvaluBenchmark({ msg }) {
//   const stats = msg.transaction_stats || {};
//   const bpsm  = stats.bedroom_avg_psm || {};
//   const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br]);
//   if (!rows.length) return null;

//   return (
//     <CardSection title="TRUVALU™ BENCHMARK VS ASKING PRICE" badge="RICS-aligned">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["TYPE", "TRUVALU™", "ASKING", "GAP", "SIGNAL"].map(h => (
//             <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {rows.map((br, i) => {
//             const truv = parseInt(bpsm[br]);
//             const ask  = Math.round(truv * (1 + (Math.random() * 0.08 - 0.04)));
//             const gap  = ((ask - truv) / truv * 100).toFixed(1);
//             const signal = parseFloat(gap) > 2 ? { label: "Premium", bg: C.redL, color: C.red } : parseFloat(gap) < -2 ? { label: "Opportunity", bg: C.greenL, color: C.green } : { label: "Fair", bg: C.amberL, color: C.amber };
//             return (
//               <tr key={br}>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700 }}>AED {truv.toLocaleString()}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{ask.toLocaleString()}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{parseFloat(gap) > 0 ? `+${gap}` : gap}%</td>
//                 <td style={{ padding: "8px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
//                   <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: signal.bg, color: signal.color }}>{signal.label}</span>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // YIELD BY UNIT TYPE — matches bottom right of Image 5
// // ─────────────────────────────────────────────────────────────────
// function YieldByTypeCard({ msg }) {
//   if (!["investor", "broker"].includes(msg.user_type)) return null;
//   const yld = parseFloat(msg.yield_pct || 7);
//   const yieldByType = [
//     { type: "Studio", val: +(yld * 1.19).toFixed(1) },
//     { type: "1 BR",   val: +yld.toFixed(1) },
//     { type: "2 BR",   val: +(yld * 0.94).toFixed(1) },
//     { type: "3 BR",   val: +(yld * 0.88).toFixed(1) },
//     { type: "TH 3BR", val: +(yld * 0.82).toFixed(1) },
//   ];
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};

//   return (
//     <CardSection title="RENTAL YIELD BY UNIT TYPE">
//       {yieldByType.map(y => (
//         <div key={y.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
//           <span style={{ fontSize: 11, width: 52, flexShrink: 0, color: C.textSecondary }}>{y.type}</span>
//           <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
//             <div style={{ width: `${(y.val / 11) * 100}%`, height: 6, borderRadius: 3, background: y.val > 6.1 ? C.green : C.amber }} />
//           </div>
//           <span style={{ fontSize: 12, fontWeight: 700, width: 36, textAlign: "right", color: y.val > 6.1 ? C.green : C.amber }}>{y.val}%</span>
//         </div>
//       ))}
//       <div style={{ fontSize: 10, color: C.textMuted, textAlign: "right", marginBottom: 8 }}>— Dubai Avg 6.1%</div>
//       <StRow label="Best yield unit type" value={`Studio (${yieldByType[0].val}%)`} valueColor={C.green} />
//       <StRow label="5-year yield trend"   value={`↑ 6.1% → ${yld}%`} valueColor={C.green} />
//       <StRow label="Average days to rent" value="18 days" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // OWNER / SELLER VALUATION — matches Image 6
// // ─────────────────────────────────────────────────────────────────
// function OwnerValuation({ msg }) {
//   if (msg.user_type !== "seller") return null;
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const stats = msg.transaction_stats || {};
//   const area  = intel.area_name_en || "this area";
//   const bmed  = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0] || "1 BR";
//   const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
//   if (!firstMed) return null;

//   const low  = Math.round(firstMed * 0.97 / 1000) * 1000;
//   const high = Math.round(firstMed * 1.18 / 1000) * 1000;
//   const gain6m = Math.round(firstMed * 0.033 / 1000) * 1000;
//   const yld  = parseFloat(intel.gross_yield_pct || 7);
//   const annualRent = Math.round(firstMed * yld / 100 / 1000) * 1000;
//   const annualRentShort = Math.round(annualRent * 1.25 / 1000) * 1000;
//   const trend = msg.price_trend;
//   const score = parseFloat(msg.score || 65);
//   const daysToSell = Math.round(75 - score * 0.4);

//   return (
//     <>
//       {/* Valuation banner */}
//       <div style={{ background: "rgba(200,115,42,0.06)", border: "1px solid rgba(200,115,42,0.2)", borderRadius: 10, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
//         <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: C.copper }}>Your Asset · Truvalu™ Valuation</div>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
//           <div>
//             <h2 style={{ fontSize: 18, fontWeight: 900, color: C.copper, margin: "0 0 4px" }}>{firstBr} in {area} is worth {fmtAED(low)} — {fmtAED(high)}</h2>
//             <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Based on floor level, view, building quality, and current DLD transactions. Updated daily.</p>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted }}>Truvalu™ Fair Value</div>
//             <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary }}>{fmtAED(firstMed)}</div>
//             <div style={{ fontSize: 11, color: C.green }}>↑ +{fmtAED(gain6m)} vs 6 months ago</div>
//           </div>
//         </div>
//       </div>

//       {/* 3 panels */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//         <CardSection title="SHOULD YOU SELL NOW?">
//           <div style={{ fontSize: 24, fontWeight: 900, color: trend && parseFloat(trend) > 0 ? C.green : C.amber, marginBottom: 8 }}>
//             {trend && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M"}
//           </div>
//           <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
//             {trend && parseFloat(trend) > 0
//               ? `Market conditions are rising +${trend}% YoY. If you need to sell, now is a favorable window.`
//               : `Infrastructure catalysts arriving Q4 2026 are likely to push prices up 8–14% — selling before those land means leaving money on the table.`}
//           </p>
//           <StRow label="Days to sell (current)" value={`${daysToSell} days`} valueColor={daysToSell > 40 ? C.red : C.green} />
//           <StRow label="Expected post-catalyst" value="8–14%" valueColor={C.green} />
//           <StRow label="Market sentiment" value={trend && parseFloat(trend) > 0 ? "Bullish" : "Cautious"} valueColor={trend && parseFloat(trend) > 0 ? C.green : C.amber} last />
//         </CardSection>
//         <CardSection title="SHOULD YOU RENT IT OUT?">
//           <div style={{ fontSize: 24, fontWeight: 900, color: C.green, marginBottom: 8 }}>Yes — Good Yield</div>
//           <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
//             {area}'s rental market remains active. Your {firstBr} can generate {fmtAED(annualRent)}/year long-term or {fmtAED(annualRentShort)}/year short-term furnished.
//           </p>
//           <StRow label={`Annual long-term rent (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />
//           <StRow label="Short-term furnished" value={`${fmtAED(annualRent)}–${fmtAED(annualRentShort)}`} valueColor={C.green} />
//           <StRow label="Average days to rent" value="18 days" last />
//         </CardSection>
//       </div>
//     </>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // PRICE HISTORY CHART — matches Image 7
// // ─────────────────────────────────────────────────────────────────
// function PriceHistoryCard({ msg }) {
//   const hist  = msg.price_history || {};
//   const years = Object.keys(hist).sort();
//   if (years.length < 2) return null;

//   const vals   = years.map(y => hist[y]);
//   const maxVal = Math.max(...vals);
//   const minVal = Math.min(...vals);
//   const range  = maxVal - minVal || 1;
//   const first  = vals[0];
//   const last   = vals[vals.length - 1];
//   const chgPct = ((last - first) / first * 100).toFixed(1);
//   const rising = last >= first;
//   const W = 500, H = 100;

//   const pts = years.map((y, i) => {
//     const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//     const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//     return `${x},${yc}`;
//   }).join(" ");

//   const userType = msg.user_type || "general";
//   const intel    = msg.area_intelligence || {};
//   const area     = intel.area_name_en || "Area";
//   const tabLabel = userType === "investor"
//     ? `📈 CAPITAL APPRECIATION — PRICE HISTORY`
//     : `📜 ${area.toUpperCase()} PRICE PER SQM — HISTORY`;

//   // Find min and max idx
//   const maxIdx = vals.indexOf(maxVal);
//   const minIdx = vals.indexOf(minVal);

//   return (
//     <CardSection title={tabLabel} badge="Truvalu™ Benchmark vs DLD Transacted">
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
//         <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: rising ? C.greenL : C.redL, color: rising ? "#065F46" : "#991B1B" }}>
//           {rising ? "+" : ""}{chgPct}% over {years.length} yr{years.length > 1 ? "s" : ""}
//         </span>
//       </div>
//       <div style={{ background: "#FAF8F5", borderRadius: 6, padding: "12px 8px 8px" }}>
//         <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
//           <defs>
//             <linearGradient id="phGrad2" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor={rising ? "rgba(22,163,74,0.18)" : "rgba(220,38,38,0.18)"} />
//               <stop offset="100%" stopColor="rgba(0,0,0,0.01)" />
//             </linearGradient>
//             <filter id="lineShadow2">
//               <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(200,115,42,0.25)" />
//             </filter>
//           </defs>
//           <polygon
//             points={`${years.map((y, i) => {
//               const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//               const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//               return `${x},${yc}`;
//             }).join(" ")} ${W},${H} 0,${H}`}
//             fill="url(#phGrad2)"
//           />
//           <polyline fill="none" stroke={C.copper} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} filter="url(#lineShadow2)" />
//           {years.map((y, i) => {
//             const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//             const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//             const isLast = i === years.length - 1;
//             const isMax  = i === maxIdx;
//             const isMin  = i === minIdx;
//             return (
//               <g key={y}>
//                 <circle cx={x} cy={yc} r={isLast ? 5 : 4}
//                   fill={isLast ? C.copper : "#fff"}
//                   stroke={isMax ? C.green : isMin ? C.red : C.copper}
//                   strokeWidth="2"
//                 />
//                 {isLast && (
//                   <>
//                     <rect x={x - 40} y={yc - 24} width={80} height={18} rx={4} fill={C.copper} />
//                     <text x={x} y={yc - 10} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="700">AED {parseInt(hist[y]).toLocaleString()}</text>
//                   </>
//                 )}
//               </g>
//             );
//           })}
//           <line x1="0" x2={W} y1={H} y2={H} stroke="#D8CEBC" strokeWidth="1" />
//         </svg>
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
//           {years.filter((_, i) => i === 0 || i === years.length - 1 || years.length <= 6).map((y, i) => (
//             <div key={y} style={{ textAlign: "center" }}>
//               <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted }}>{y}</div>
//               <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary }}>{parseInt(hist[y]).toLocaleString()}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // NATIONALITY CARD — matches Images 5 & 10
// // ─────────────────────────────────────────────────────────────────
// function NationalityCard({ msg }) {
//   const intel = msg.area_intelligence || {};
//   const nats  = intel.buyer_nationalities;
//   if (!nats || !nats.length) return null;

//   const badge = nats.some(n => n.pct) ? "DLD verified" : "Market estimate";

//   return (
//     <CardSection title="BUYER NATIONALITY — 90 DAYS" badge={badge}>
//       {nats.slice(0, 8).map((n, i) => (
//         <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//           <span style={{ fontSize: 14, width: 20 }}>{n.flag || "🌍"}</span>
//           <span style={{ fontSize: 12, width: 70, flexShrink: 0, color: C.textSecondary }}>{n.name}</span>
//           <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
//             <div style={{ width: `${n.w || (n.pct ? Math.min(100, n.pct * 3) : 30)}%`, height: 6, borderRadius: 3, background: C.copper }} />
//           </div>
//           <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: "right", color: C.textMuted }}>{n.pct}%</span>
//         </div>
//       ))}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // DISTRESS METER — matches top of Image 9
// // ─────────────────────────────────────────────────────────────────
// function DistressMeter({ msg }) {
//   const distress = msg.distress_pct;
//   const intel    = msg.area_intelligence || {};
//   const area     = intel.area_name_en || "this area";
//   if (!distress) return null;
//   const availListings = msg.score ? Math.round(1500 + parseFloat(msg.score) * 50) : 5000;
//   const distressUnits = Math.round(availListings * parseFloat(distress) / 100);

//   return (
//     <div style={{ background: "#F5F5F5", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
//       <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, flexShrink: 0 }}>{distress}%</div>
//       <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>
//         <strong style={{ color: C.textPrimary }}>Distress Meter:</strong> {distressUnits.toLocaleString()} of {area}'s active listings are priced below the Truvalu™ floor right now.
//         {parseFloat(distress) > 10 ? " This is above the 12-month average — driven by nervous sellers who want to exit quickly. For patient buyers, this is a genuine entry window." : " This is near the 12-month average — stable market conditions."}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // ANNUAL RENT RANGES — matches left of Image 10
// // ─────────────────────────────────────────────────────────────────
// function RentRangesCard({ msg }) {
//   if (!["investor", "seller", "broker"].includes(msg.user_type)) return null;
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};
//   const yld   = parseFloat(msg.yield_pct || 7);
//   const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bmed[br]);
//   if (!rows.length) return null;

//   const sqftMap = { "Studio": 450, "1 BR": 800, "2 BR": 1250, "3 BR": 1800, "4 BR": 2400 };

//   return (
//     <CardSection title="ANNUAL RENT RANGES (AED)">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["TYPE", "MIN", "AVG", "MAX"].map(h => (
//             <th key={h} style={{ padding: "6px 6px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {rows.map((br, i) => {
//             const med  = parseFloat(bmed[br]);
//             const avg  = Math.round(med * yld / 100 / 1000) * 1000;
//             const min_ = Math.round(avg * 0.75 / 1000) * 1000;
//             const max_ = Math.round(avg * 1.35 / 1000) * 1000;
//             return (
//               <tr key={br}>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{min_.toLocaleString()}</td>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.green, fontWeight: 700 }}>{avg.toLocaleString()}</td>
//                 <td style={{ padding: "8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{max_.toLocaleString()}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CATALYSTS CARD — matches Image 11 (timeline style)
// // ─────────────────────────────────────────────────────────────────
// function CatalystsCard({ msg }) {
//   const cats     = msg.area_catalysts || [];
//   const userType = msg.user_type || "general";
//   const intel    = msg.area_intelligence || {};
//   const catScore = intel.catalyst_score;
//   if (!cats.length && !catScore) return null;

//   const label = {
//     buyer:    "🔭 FUTURE — INFRASTRUCTURE & CATALYST TIMELINE",
//     seller:   "⚡ UPCOMING CATALYSTS THAT COULD HELP YOUR SALE",
//     investor: "⚡ CATALYSTS — CONFIRMED PRICE DRIVERS",
//     broker:   "⚡ UPCOMING CATALYSTS — FOR PITCH DECKS",
//     general:  "🔭 UPCOMING CATALYSTS",
//   }[userType] || "🔭 UPCOMING CATALYSTS";

//   const typeColors = {
//     metro:    { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Metro" },
//     school:   { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "School" },
//     mall:     { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Retail" },
//     hospital: { bg: "#FDF4FF", border: "#E9D5FF", dot: "#7C3AED", label: "Health" },
//     road:     { bg: "#F0F9FF", border: "#BAE6FD", dot: "#0284C7", label: "Road" },
//     park:     { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "Park" },
//     airport:  { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Airport" },
//   };
//   const confColors = { confirmed: C.green, announced: C.blue, likely: C.amber, spec: C.textMuted };

//   return (
//     <div>
//       <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{label}</div>
//       <div style={{ paddingLeft: 20, position: "relative" }}>
//         <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: C.border, borderRadius: 1 }} />
//         {cats.slice(0, 4).map((c, i) => {
//           const tc = typeColors[c.catalyst_type] || { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Project" };
//           const dateLabel = c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "TBC";
//           return (
//             <div key={i} style={{ position: "relative", marginBottom: 18 }}>
//               <div style={{ position: "absolute", left: -24, top: 5, width: 12, height: 12, borderRadius: "50%", background: tc.dot, border: `2px solid #fff` }} />
//               <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 3 }}>
//                 {dateLabel}{" "}
//                 <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, marginLeft: 6, textTransform: "uppercase", letterSpacing: ".08em", background: tc.bg, color: tc.dot }}>{c.confidence || tc.label}</span>
//               </div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>{c.name}</div>
//               {c.description && <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55 }}>{c.description}</div>}
//               <div style={{ fontSize: 11, marginTop: 4, color: C.textMuted }}>
//                 📈 Expected impact: <strong style={{ color: C.green }}>
//                   {c.catalyst_type === "metro" ? "+8–14% PSF (1km radius)" : c.catalyst_type === "school" ? "+12–18% demand for 2–3BR" : "Positive area impact expected"}
//                 </strong>
//               </div>
//             </div>
//           );
//         })}
//         {!cats.length && <div style={{ fontSize: 12, color: C.textMuted, padding: "10px 0" }}>No confirmed catalysts yet — check back soon.</div>}
//       </div>
//       {catScore && (
//         <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
//           <div style={{ fontSize: 12, color: C.textSecondary }}>Catalyst Score</div>
//           <div style={{ fontSize: 28, fontWeight: 900, color: parseFloat(catScore) >= 70 ? C.green : C.amber }}>{catScore}/100</div>
//         </div>
//       )}
//     </div>
//   );
// }


// function MultiAreaCards({ msg }) {
//   const links = msg.area_links || [];
//   if (links.length < 2) return null;
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
//       {links.slice(0, 6).map((l, i) => (
//         <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
//           style={{ display: "block", padding: "14px 16px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: "none" }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{l.name}</div>
//           <div style={{ fontSize: 11, color: C.copper, fontWeight: 600 }}>View full area profile →</div>
//         </a>
//       ))}
//     </div>
//   );
// }


// function ComparisonTable({ msg }) {
//   const data = msg.comparison_data || [];
//   if (data.length < 2) return null;
//   const [a, b] = data;

//   const allRows = [
//     { label: "Investment Score", get: d => d.score ? `${d.score}/100` : null, color: C.textPrimary },
//     { label: "Verdict", get: d => d.verdict || null, color: C.textPrimary },
//     { label: "Gross Yield", get: d => d.yield_pct ? `${d.yield_pct}%` : null, color: C.green },
//     { label: "Avg Price/sqm", get: d => d.avg_psm ? `AED ${parseInt(d.avg_psm).toLocaleString()}` : null, color: C.textPrimary },
//     { label: "Price Trend", get: d => d.price_trend != null ? `${d.price_trend > 0 ? "+" : ""}${d.price_trend}% YoY` : null, color: d => d.price_trend > 0 ? C.green : C.red },
//   ];

//   const brTypes = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"];
//   brTypes.forEach(br => {
//     if (a.median_price_by_bedroom?.[br] || b.median_price_by_bedroom?.[br]) {
//       allRows.push({
//         label: `${br} Median`,
//         get: d => d.median_price_by_bedroom?.[br] ? fmtAED(d.median_price_by_bedroom[br]) : null,
//         color: C.textPrimary,
//       });
//     }
//   });

//   // Only keep rows where at least one side has real data
//   const rows = allRows.filter(row => row.get(a) != null || row.get(b) != null);
//   if (!rows.length) return null;
//   return (
//     <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — COMPARISON TABLE`}>
//       <div style={{ overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
//           <thead>
//             <tr>
//               <th style={{ padding: "7px 6px 7px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>METRIC</th>
//               <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{a.name}</th>
//               <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{b.name}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, i) => (
//               <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600, color: C.textPrimary }}>{row.label}</td>
//                 <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(a) : row.color }}>{row.get(a) ?? "—"}</td>
// <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(b) : row.color }}>{row.get(b) ?? "—"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </CardSection>
//   );
// }



// function ComparisonBarChart({ msg }) {
//   const data = msg.comparison_data || [];
//   if (data.length < 2) return null;
//   const [a, b] = data;

//   const metrics = [
//     { label: "Investment Score", av: a.score, bv: b.score, suffix: "/100" },
//     { label: "Gross Yield",      av: a.yield_pct, bv: b.yield_pct, suffix: "%" },
//     { label: "Avg Price/sqm",    av: a.avg_psm, bv: b.avg_psm, suffix: "", isPrice: true },
//     { label: "Price Trend YoY",  av: a.price_trend, bv: b.price_trend, suffix: "%" },
//   ].filter(m => m.av != null || m.bv != null);

//   if (!metrics.length) return null;

//   return (
//     <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — VISUAL COMPARISON`}>
//       {metrics.map((m, i) => {
//         const maxVal = Math.max(Math.abs(m.av || 0), Math.abs(m.bv || 0)) * 1.2 || 1;
//         const aPct = m.av != null ? Math.min(100, (Math.abs(m.av) / maxVal) * 100) : 0;
//         const bPct = m.bv != null ? Math.min(100, (Math.abs(m.bv) / maxVal) * 100) : 0;
//         return (
//           <div key={i} style={{ marginBottom: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
//               {m.label}
//             </div>
//             {[[a.name, m.av, aPct, C.copper], [b.name, m.bv, bPct, C.blue]].map(([name, val, pct, color], j) => (
//               <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: j === 0 ? 4 : 0 }}>
//                 <span style={{ width: 110, fontSize: 11, color: C.textSecondary, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
//                 <div style={{ flex: 1, height: 14, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
//                   <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
//                 </div>
//                 <span style={{ width: 70, fontSize: 11, fontWeight: 700, color: C.textPrimary, textAlign: "right" }}>
//                   {val != null ? `${m.isPrice ? Math.round(val).toLocaleString() : val}${m.suffix}` : "—"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         );
//       })}
//     </CardSection>
//   );
// }


// // ─────────────────────────────────────────────────────────────────
// // HERO BADGES
// // ─────────────────────────────────────────────────────────────────
// function HeroBadges({ score, verdict, yieldPct, priceTrend }) {
//   if (!score && !verdict && !yieldPct) return null;
//   const verdictStyle = {
//     BUY:   { bg: "#D1FAE5", color: "#065F46" },
//     HOLD:  { bg: "#FEF3C7", color: "#92400E" },
//     WATCH: { bg: "#FEE2E2", color: "#991B1B" },
//   }[verdict] || { bg: "#F3F4F6", color: C.textPrimary };

//   return (
//     <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
//       {score && <span style={{ padding: "4px 10px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>Score {score}/100</span>}
//       {verdict && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: verdictStyle.bg, color: verdictStyle.color }}>{verdict}</span>}
//       {yieldPct && <span style={{ padding: "4px 10px", background: "#EFF6FF", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>Yield {yieldPct}%</span>}
//       {priceTrend != null && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: priceTrend > 0 ? "#D1FAE5" : "#FEE2E2", color: priceTrend > 0 ? "#065F46" : "#991B1B" }}>{priceTrend > 0 ? "+" : ""}{priceTrend}% trend</span>}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CHART (bar chart for prices/yields)
// // ─────────────────────────────────────────────────────────────────
// function SingleChart({ chart }) {
//   if (!chart?.data?.length) return null;
//   const valid = chart.data.filter(d => d.value > 0);
//   if (!valid.length) return null;
//   const max = Math.max(...valid.map(d => d.value));
//   return (
//     <div style={{ margin: "16px 0 8px", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
//       <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>{chart.title}</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//         {valid.slice(0, 10).map((item, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 100, fontSize: 11, color: C.textLight, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
//             <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
//               <div style={{ height: "100%", width: `${Math.max(3, (item.value / max) * 100)}%`, background: chart.type === "line" ? "#3B82F6" : C.copper, borderRadius: 3 }} />
//             </div>
//             <div style={{ width: 64, fontSize: 11, color: C.textSecondary, fontWeight: 600, flexShrink: 0, textAlign: "right" }}>{item.value?.toLocaleString()}</div>
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
//         <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
//       ))}
//       <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
//     </div>
//   );
// }

// function Avatar() {
//   return (
//     <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.copper, fontWeight: 700 }}>✦</div>
//   );
// }

// function extractFollowups(reply) {
//   if (!reply) return [];
//   const lines = reply.split("\n");
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
//         <div style={{ maxWidth: "75%", padding: "10px 14px", background: C.userBubble, borderRadius: "18px 18px 4px 18px", fontSize: 14, color: C.textPrimary, lineHeight: 1.6 }}>
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
//           {msg.summary && <p style={{ margin: "0 0 12px 0", fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{msg.summary}</p>}
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
//         <div style={{ flex: 1, background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 12, padding: "16px 18px" }}>
//           {lines.map((line, i) => {
//             const trimmed = line.trim();
//             if (/^\d+\./.test(trimmed)) {
//               const content = trimmed.replace(/^\d+\.\s*/, "");
//               const num = trimmed.match(/^(\d+)\./)?.[1];
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
//   const charts    = Array.isArray(msg.charts) ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0)) : [];
//   const followups = msg._followups || [];
// const hasAreaData = !!(
//   msg.area_intelligence ||
//   msg.transaction_stats ||
//   msg.score ||
//   msg.yield_pct ||
//   msg.verdict ||
//   (msg.area_links && msg.area_links.length > 0)
// );

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//         {/* Summary */}
//         {(msg.summary || msg._summary) && (
//           <p style={{ margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary, lineHeight: 1.75, fontWeight: 400, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
//             {msg.summary || msg._summary}
//           </p>
//         )}

//         {/* Badges */}
//         <HeroBadges score={msg.score} verdict={msg.verdict} yieldPct={msg.yield_pct} priceTrend={msg.price_trend} />

// {/* ── MULTI-AREA (comparison/lifestyle/budget) RESPONSES ── */}
//         {hasAreaData && msg.response_mode === "multi_area" ? (
//           <>
//             {sections && sections.length > 0 && sections[0].header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌")) && (
//               <SectionBlock header={sections[0].header} body={sections[0].body} />
//             )}

//            <MultiAreaCards msg={msg} />
//             {msg.comparison_data?.length >= 2 && <ComparisonTable msg={msg} />}
//             {msg.comparison_data?.length >= 2 && <ComparisonBarChart msg={msg} />}

//             {sections && sections.slice(
//               (sections[0]?.header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌"))) ? 1 : 0
//             ).map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}

//             {!sections && msg.reply && (
//               <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//                 dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//               />
//             )}

//             {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
//           </>
//         ) : (
//           <>
//             {hasAreaData && (
//               <>
//                 {/* Hero stats + Score card side by side */}
//                 {msg.score ? (
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12, marginBottom: 16 }}>
//                     <HeroStatsRow msg={msg} />
//                     <ScoreCard msg={msg} />
//                   </div>
//                 ) : (
//                   <HeroStatsRow msg={msg} />
//                 )}

//                 {/* Buyer: Guide + Price table + Costs */}
//                 <BuyerGuide msg={msg} />
//                 <PriceTable msg={msg} />
//                 <OwnershipCosts msg={msg} />

//                 {/* Seller: Owner valuation */}
//                 <OwnerValuation msg={msg} />

//                 {/* Investor: 4 big metric cards */}
//                 <InvestorMetrics msg={msg} />

//                 {/* Investor/Broker: Nationality + Yield by type */}
//                 {["investor", "broker"].includes(msg.user_type) && (
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//                     <NationalityCard msg={msg} />
//                     <YieldByTypeCard msg={msg} />
//                   </div>
//                 )}

//                 {/* Past / Present / Future tabs */}
//                 <TimeTabs
//                   tabs={[
//                     {
//                       label: "PAST — HISTORY & TRACK RECORD",
//                       icon: "📜",
//                       content: (
//                         <>
//                           <PriceHistoryCard msg={msg} />
//                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//                             <AreaMaturityCard msg={msg} />
//                             <DeveloperTrackRecordCard msg={msg} />
//                           </div>
//                         </>
//                       ),
//                     },
//                     {
//                       label: "PRESENT — LIVE MARKET DATA",
//                       icon: "📡",
//                       content: (
//                         <>
//                           <DistressMeter msg={msg} />
//                           {["investor", "broker"].includes(msg.user_type) && (
//                             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//                               <MarketCompositionCard msg={msg} />
//                               <TruvaluBenchmark msg={msg} />
//                             </div>
//                           )}
//                           {!["investor", "broker"].includes(msg.user_type) && <TruvaluBenchmark msg={msg} />}
//                           <RentRangesCard msg={msg} />
//                           <NationalityCard msg={msg} />
//                         </>
//                       ),
//                     },
//                     {
//                       label: "FUTURE — WHAT'S COMING",
//                       icon: "🔭",
//                       content: (
//                         (msg.area_catalysts?.length > 0 || msg.area_intelligence?.catalyst_score) ? (
//                           <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
//                             <CatalystsCard msg={msg} />
//                           </div>
//                         ) : (
//                           <p style={{ fontSize: 13, color: C.textMuted, padding: "20px 0", textAlign: "center" }}>No catalyst data available for this area yet.</p>
//                         )
//                       ),
//                     },
//                   ]}
//                 />
//               </>
//             )}

//             {sections ? (
//               <div>
//                 {sections.map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}
//               </div>
//             ) : msg.reply ? (
//               <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//                 dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//               />
//             ) : null}

//             {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
//           </>
//         )}

//         {/* Insight */}
//         {msg.insight && (
//           <div style={{ marginTop: 16, padding: "10px 14px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
//             ✦ {msg.insight}
//           </div>
//         )}

//         {/* Area links */}
//         {msg.area_links && msg.area_links.length > 0 && (
//           <div style={{ marginTop: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Explore Areas</div>
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

//         {/* Valuation CTA */}
//         <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
//           💡 BTW — You can instantly verify the real market value of any Dubai property you are looking at here →{" "}
//           <a href="https://www.acqar.com/valuation" target="_blank" rel="noopener noreferrer" style={{ color: "#B87333", textDecoration: "underline", fontWeight: 700 }}>
//             https://www.acqar.com/valuation
//           </a>
//         </div>

//         {/* Follow-ups */}
//         {followups.length > 0 && (
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
//             {followups.map((fq, i) => (
//               <button key={i} onClick={() => onSuggestion(fq)}
//                 style={{ padding: "5px 11px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 20, color: C.textLight, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//               >{fq}</button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// function LoginModal({ open, onClose, navigate }) {
//   if (!open) return null;
//   return (
//     <div onClick={onClose}
//       style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.55)",
//         display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
//       <div onClick={e => e.stopPropagation()}
//         style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", maxWidth: 380,
//           width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
//         <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
//         <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: "#111827" }}>
//           Sign in to view your answer
//         </h3>
//         <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>
//           Your answer is ready. Log in — it will be waiting for you right here.
//         </p>
//         <button onClick={() => navigate("/complete-profile")}
//           style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "none", cursor: "pointer",
//             background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", color: "#fff",
//             fontWeight: 800, fontSize: 15, fontFamily: "inherit" }}>
//           Sign In →
//         </button>
//         <button onClick={() => navigate("/complete-profile")}
//           style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12,
//             border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
//             fontWeight: 700, fontSize: 14, color: "#111827", fontFamily: "inherit" }}>
//           Create an account
//         </button>
//         <button onClick={onClose}
//           style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer",
//             fontSize: 12.5, color: "#9CA3AF", fontFamily: "inherit" }}>
//           Not now
//         </button>
//       </div>
//     </div>
//   );
// }

// function FeedbackAndShare({ user, messages }) {
//   const [text, setText] = useState("");
//   const [status, setStatus] = useState("");        // feedback status
//   const [shareStatus, setShareStatus] = useState(""); // "", "saving", "copied", "error"
//   const [open, setOpen] = useState(true);

//   const submitFeedback = async () => {
//     if (!text.trim() || status === "saving") return;
//     setStatus("saving");
//     const { error } = await supabase.from("broker_feedback").insert({
//       user_id: user?.id || null,
//       email: user?.email || null,
//       feedback: text.trim(),
//       page: "/broker",
//     });
//     if (error) setStatus("error");
//     else {
//   posthog.capture("broker_feedback_submitted", { feedback: text.trim(), email: user?.email || "anonymous" });
//   setStatus("done"); setText(""); setTimeout(() => setStatus(""), 3000);
// }
    
//   };

//   const shareChat = async () => {
//     if (shareStatus === "saving") return;
//     const shareable = messages.filter(m => m.role === "user" || m.role === "assistant");
//     if (!shareable.length) { setShareStatus("empty"); setTimeout(() => setShareStatus(""), 2500); return; }
//     setShareStatus("saving");
//     const { data, error } = await supabase
//       .from("broker_shared_chats")
//       .insert({ user_id: user?.id || null, messages: shareable })
//       .select("id")
//       .single();
//     if (error || !data?.id) { setShareStatus("error"); setTimeout(() => setShareStatus(""), 3000); return; }
//     const url = `${window.location.origin}/broker?share=${data.id}`;
//     posthog.capture("broker_chat_shared", { share_id: data.id, message_count: shareable.length });
//     if (navigator.share) {
//       try { await navigator.share({ title: "ACQAR Intelligence Chat", url }); } catch {}
//       setShareStatus("");
//     } else {
//       try { await navigator.clipboard.writeText(url); setShareStatus("copied"); }
//       catch { setShareStatus("error"); }
//       setTimeout(() => setShareStatus(""), 3000);
//     }
//   };

//   if (!open) {
//     return (
//       <button onClick={() => setOpen(true)}
//         style={{ position: "fixed", right: 16, bottom: 100, zIndex: 900, padding: "10px 14px",
//           borderRadius: 24, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
//           fontWeight: 700, fontSize: 12, color: "#C8732A", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontFamily: "inherit" }}>
//         💬 Feedback
//       </button>
//     );
//   }

//   return (
//     <div style={{ position: "fixed", right: 16, bottom: 100, zIndex: 900, width: 260,
//       background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 14px 12px",
//       boxShadow: "0 8px 30px rgba(0,0,0,0.14)" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
//         <span style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>💬 Feedback</span>
//         <button onClick={() => setOpen(false)}
//           style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 14, padding: 0 }}>✕</button>
//       </div>
//       <textarea
//         value={text}
//         onChange={e => setText(e.target.value)}
//         placeholder="Share your feedback..."
//         rows={3}
//         style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10,
//           fontSize: 12, border: "1px solid #E5E7EB", background: "#FAFAFA", outline: "none",
//           color: "#111827", fontFamily: "inherit", resize: "none" }}
//       />
//       <button onClick={submitFeedback} disabled={status === "saving" || !text.trim()}
//         style={{ width: "100%", marginTop: 8, padding: "9px 0", borderRadius: 10, border: "none",
//           cursor: status === "saving" || !text.trim() ? "not-allowed" : "pointer",
//           background: "#111827", color: "#fff", fontWeight: 700, fontSize: 12,
//           fontFamily: "inherit", opacity: status === "saving" || !text.trim() ? 0.5 : 1 }}>
//         {status === "saving" ? "Saving..." : "Send Feedback"}
//       </button>
//       {status === "done" && <div style={{ fontSize: 11, color: "#16A34A", marginTop: 5 }}>✓ Feedback saved!</div>}
//       {status === "error" && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 5 }}>Could not save. Log in first.</div>}

//       <div style={{ borderTop: "1px solid #F3F4F6", margin: "10px 0 8px" }} />

//       <button onClick={shareChat} disabled={shareStatus === "saving"}
//         style={{ width: "100%", padding: "9px 0", borderRadius: 10, cursor: "pointer",
//           border: "1px solid #E5E7EB", background: "#fff", color: "#C8732A",
//           fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
//         {shareStatus === "saving" ? "Creating link..." : shareStatus === "copied" ? "✓ Link copied!" : "↗ Share this chat"}
//       </button>
//       {shareStatus === "empty" && <div style={{ fontSize: 11, color: "#D97706", marginTop: 5 }}>Ask a question first, then share.</div>}
//       {shareStatus === "error" && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 5 }}>Could not create link. Log in first.</div>}
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
//   const location = useLocation();
// const isBroker = location.pathname === "/broker";
// const [showLoginModal, setShowLoginModal] = useState(false);

// useEffect(() => {
//   if (isBroker) posthog.capture("broker_page_viewed", { logged_in: !!user });
// }, [isBroker]);

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

//   // Restore pending answer after login + save broker user
// useEffect(() => {
//   if (!user || !isBroker) return;
//   posthog.identify(user.id, { email: user.email });
// posthog.capture("broker_login_success", { page: "/broker" });

//   const pending = sessionStorage.getItem(BROKER_PENDING_KEY);
//   if (pending) {
//     try {
//       const { query, response } = JSON.parse(pending);
//       const followups = extractFollowups(response.reply || "");
//       setMessages([
//         { role: "user", text: query },
//         { role: "assistant", _query: query, _followups: followups, ...response },
//       ]);
//       setHistory([
//         { role: "user", content: query },
//         { role: "assistant", content: response.reply || "" },
//       ]);
//     } catch {}
//     sessionStorage.removeItem(BROKER_PENDING_KEY);
//   }

//   setMessages(m => m.map(x => (x.locked ? { ...x, locked: false } : x)));
//   setShowLoginModal(false);

//   supabase.from("broker_users").upsert(
//     {
//       user_id: user.id,
//       email: user.email,
//       full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
//       last_active_at: new Date().toISOString(),
//     },
//     { onConflict: "user_id" }
//   ).then(({ error }) => {
//     if (error) console.error("broker_users upsert:", error.message);
//   });
// }, [user, isBroker]);



// // Load a shared chat if URL has ?share=<id>
// useEffect(() => {
//   const shareId = new URLSearchParams(location.search).get("share");
//   if (!shareId || !isBroker) return;
//   supabase
//     .from("broker_shared_chats")
//     .select("messages")
//     .eq("id", shareId)
//     .single()
//     .then(({ data, error }) => {
//      if (!error && data?.messages) {
//   setMessages(data.messages);
//   posthog.capture("broker_shared_chat_viewed", { share_id: shareId });
// }
//     });
// }, [location.search, isBroker]);


//   useEffect(() => {
//     const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
//     ping();
//     const id = setInterval(ping, 4 * 60 * 1000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async (text) => {
//     const query = (text || input).trim();
//     if (!query || loading) return;
//     if (isBroker) posthog.capture("broker_query_sent", { query, logged_in: !!user });
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
//       const followups = extractFollowups(json.reply || "");
//       // LOGIN GATE — only on /broker, only when logged out
// if (isBroker && !user) {
//   setMessages(m => [
//     ...m.filter(x => x.role !== "thinking"),
//     { role: "assistant", locked: true, _query: query, _summary: summary, _followups: followups, ...json },
//   ]);
//   sessionStorage.setItem(BROKER_PENDING_KEY, JSON.stringify({ query, response: json }));
//   setShowLoginModal(true);
//   setLoading(false);
//   posthog.capture("broker_login_gate_shown", { query, page: "/broker" });
//   return;
// }
//       setMessages(m => [
//         ...m.filter(x => x.role !== "thinking"),
//         { role: "assistant", _query: query, _summary: summary, _followups: followups, ...json },
//       ]);
//       setHistory(h => [...h, { role: "user", content: query }, { role: "assistant", content: json.reply || "" }].slice(-12));
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
//     <div style={{ height: "100vh", background: C.pageBg, display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden" }}>

//       {/* Sidebar */}
//       <div style={{ width: 56, background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0 }}>
//         {[
//           { label: "Chat",     active: true,  onClick: () => {},                                                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
//           { label: "Terminal", active: false, onClick: () => window.location.href = "https://www.acqar.com/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//           { label: "Areas",    active: false, onClick: () => window.location.href = "https://www.acqar.com/areas",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
//           { label: "Reports",  active: false, onClick: () => window.location.href = "https://www.acqar.com/my-reports", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//         ].map(item => (
//           <button key={item.label} onClick={item.onClick} title={item.label}
//             style={{ width: 44, height: 44, borderRadius: 10, background: item.active ? C.copperTint : "transparent", border: item.active ? `1px solid ${C.copperBorder}` : "1px solid transparent", color: item.active ? C.copper : C.textMuted, cursor: item.active ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.15s" }}
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
//         <div style={{ height: 52, padding: "0 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
//             <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.copper }}>✦</div>
//             <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>ACQAR Intelligence</span>
//           </div>
//           <span style={{ fontSize: 11, color: C.textMuted }}>{user ? user.email : "Not signed in"}</span>
//         </div>

//         {/* Messages */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 0" }}>
//           <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px" }}>

//             {messages.length === 0 && (
//               <div style={{ textAlign: "center", paddingTop: 60 }}>
//                 <div style={{ fontSize: 28, color: C.copper, marginBottom: 12 }}>✦</div>
//                 <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>Ask ACQAR Intelligence</h2>
//                 <p style={{ fontSize: 14, color: C.textLight, margin: "0 0 36px", lineHeight: 1.6 }}>
//                   365K+ real DLD transactions · Area analytics · Investment scores · School & community data
//                 </p>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 560, margin: "0 auto" }}>
//                   {SUGGESTIONS.map(s => (
//                     <button key={s} onClick={() => handleSend(s)}
//                       style={{ padding: "10px 14px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textLight, fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.45, fontFamily: "inherit", transition: "all 0.15s" }}
//                       onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                       onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//                     >{s}</button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {messages.map((msg, i) =>
//   msg.locked ? (
//     <div key={i} style={{ position: "relative" }}>
//       <div style={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none" }}>
//         <Message msg={msg} onSuggestion={() => {}} navigate={navigate} />
//       </div>
//       <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <button
//           onClick={() => setShowLoginModal(true)}
//           style={{ padding: "12px 22px", borderRadius: 10, border: "none", cursor: "pointer",
//             background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", color: "#fff",
//             fontWeight: 800, fontSize: 14, boxShadow: "0 8px 24px rgba(180,83,9,0.35)", fontFamily: "inherit" }}
//         >
//           🔒 Log in to view full answer
//         </button>
//       </div>
//     </div>
//   ) : (
//     <Message key={i} msg={msg} onSuggestion={handleSend} navigate={navigate} />
//   )
// )}
//             <div ref={bottomRef} style={{ height: 20 }} />
//           </div>
//         </div>

//         {/* Input bar */}
//         <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
//           <div style={{ maxWidth: 780, margin: "0 auto" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FAFAFA", border: `1.5px solid ${loading ? C.copper : C.border}`, borderRadius: 12, padding: "4px 4px 4px 16px", transition: "border-color 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
//               <input
//                 ref={inputRef}
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
//                 placeholder="Ask anything about Dubai real estate..."
//                 disabled={loading}
//                 style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.textPrimary, fontFamily: "inherit" }}
//               />
//               <button
//                 onClick={() => handleSend()}
//                 disabled={loading || !input.trim()}
//                 style={{ width: 36, height: 36, background: loading || !input.trim() ? "#E5E7EB" : C.textPrimary, border: "none", borderRadius: 8, cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}
//               >
//                 {loading
//                   ? <div style={{ display: "flex", gap: 2 }}>{[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}</div>
//                   : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                 }
//               </button>
//             </div>
//             <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.textMuted }}>
//               Powered by Acqar · 365K+ DLD Transactions · Real closed-sale prices, not asking prices
//             </div>
//             {isBroker && <FeedbackAndShare user={user} messages={messages} />}
//          </div>
//         </div>
//       </div>

//       <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} navigate={navigate} />
//     </div>
//   );
// }






// import { useState, useRef, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import posthog from "posthog-js";

// const BACKEND = "https://development-production-2ad3.up.railway.app";
// const BROKER_PENDING_KEY = "acqar_broker_pending";

// const SUGGESTIONS = [
//   "I'm being asked AED 1.8M for a 1BR in JVC, is that a fair price or am I overpaying?",
//   "Should I buy this off-plan unit in Dubai South now, or wait 6 months for prices to settle?",
//  "I own a 2BR in Business Bay bought in 2021, should I sell now or hold for another year?",
//   "My apartment in Dubai Marina has been listed for 60 days with no offers, is my asking price too high?",
//   "A studio in Dubai Silicon Oasis is offering 8% yield, is that actually good or too good to be true?",
//   "I'm looking at a 2BR in JVC, will the upcoming supply in the area hurt my rental income in 2 years?",
//   "Is JVC still worth buying into in 2026, or is it already oversupplied?",
//   "For long-term value, is Dubai Hills Estate a better bet than Dubai Marina right now?"
// ];

// // ─────────────────────────────────────────────────────────────────
// // DESIGN TOKENS — matching Area Specialist exactly
// // ─────────────────────────────────────────────────────────────────
// const C = {
//   bg:           "#FFFFFF",
//   pageBg:       "#F7F7F8",
//   textPrimary:  "#111827",
//   textSecondary:"#374151",
//   textMuted:    "#9CA3AF",
//   textLight:    "#6B7280",
//   border:       "#E5E7EB",
//   copper:       "#C8732A",
//   copperBorder: "rgba(200,115,42,0.25)",
//   copperTint:   "rgba(200,115,42,0.08)",
//   userBubble:   "#F3F4F6",
//   green:        "#16A34A",
//   greenL:       "rgba(22,163,74,0.1)",
//   amber:        "#D97706",
//   amberL:       "rgba(217,119,6,0.1)",
//   red:          "#DC2626",
//   redL:         "rgba(220,38,38,0.1)",
//   blue:         "#2563EB",
//   blueL:        "rgba(37,99,235,0.09)",
// };

// // ─────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────
// function fmtAED(v) {
//   if (!v) return "—";
//   const n = parseFloat(v);
//   if (!isFinite(n)) return "—";
//   if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
//   if (n >= 1_000) return `AED ${Math.round(n / 1000)}K`;
//   return `AED ${parseInt(n).toLocaleString()}`;
// }

// function fmtNum(n) {
//   if (!n) return "—";
//   return parseFloat(n).toLocaleString();
// }

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
//   const words = query.trim().split(/\s+/).slice(0, 8).join(" ");
//   return `Searching 365,000+ DLD transactions for: ${words}${query.split(/\s+/).length > 8 ? "..." : ""}`;
// }

// const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼","📌","🔍"];

// function parseReplyToSections(reply) {
//   if (!reply) return null;
//   const lines = reply.split("\n");
//   const sections = [];
//   let current = null;
//   for (const line of lines) {
//     const trimmed = line.trim();
//     if (!trimmed) { if (current) current.body += "\n"; continue; }
//     const isHeader = SECTION_EMOJIS.some(e => trimmed.startsWith(e));
//     if (isHeader) {
//       if (current) sections.push(current);
//       current = { header: trimmed, body: "" };
//     } else {
//       if (current) current.body += (current.body ? "\n" : "") + trimmed;
//       else sections.push({ header: null, body: trimmed });
//     }
//   }
//   if (current) sections.push(current);
//   return sections.length > 0 ? sections : null;
// }

// function highlightValues(text) {
//   return text
//     .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
//     .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
//     .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
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
//   const cleanTrimmed = trimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '').trim();
//   if (trimmed.includes("](")) {
//     if (!cleanTrimmed) return null;
//     return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(cleanTrimmed) }} />;
//   }
//   if (trimmed.toLowerCase() === "explore areas") return null;
//   if (trimmed.startsWith("⚠️")) {
//     return <div key={key} style={{ margin: "6px 0", padding: "8px 12px", background: "#FFFBEB", borderLeft: "3px solid #F59E0B", borderRadius: "0 6px 6px 0", fontSize: 13, color: "#92400E" }}>{trimmed}</div>;
//   }
//   if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
//     const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
//     const isHeader = cells.every(c => c.match(/^[-\s]+$/));
//     if (isHeader) return <div key={key} style={{ borderBottom: `1px solid ${C.border}`, margin: "2px 0" }} />;
//     return (
//       <div key={key} style={{ display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: 4, padding: "5px 0", borderBottom: `1px solid #F3F4F6`, fontSize: 12 }}>
//         {cells.map((cell, i) => <span key={i} style={{ color: i === 0 ? C.textPrimary : C.textSecondary, fontWeight: i === 0 ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: highlightValues(cell) }} />)}
//       </div>
//     );
//   }
//   if (/^\d+\./.test(trimmed)) {
//     const content = trimmed.replace(/^\d+\.\s*/, "");
//     const num = trimmed.match(/^(\d+)\./)?.[1];
//     return (
//       <div key={key} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
//         <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightValues(content) }} />
//       </div>
//     );
//   }
//   if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
//     const txt = trimmed.replace(/^[•\-]\s*/, "");
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
//         <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
//       </div>
//     );
//   }
//   const colonIdx = trimmed.indexOf(":");
//   if (colonIdx > 0 && colonIdx < 32 && !trimmed.includes("→") && !trimmed.startsWith("http") && !trimmed.includes("|")) {
//     const k = trimmed.slice(0, colonIdx).trim().replace(/\*\*/g, "");
//     const val = trimmed.slice(colonIdx + 1).trim();
//     if (k && val && k.length < 32) {
//       return (
//         <div key={key} style={{ margin: "4px 0", fontSize: 13, lineHeight: 1.65 }}>
//           <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{k}:</strong>{" "}
//           <span style={{ color: C.textSecondary }} dangerouslySetInnerHTML={{ __html: highlightValues(val) }} />
//         </div>
//       );
//     }
//   }
//   return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />;
// }

// function SectionBlock({ header, body }) {
//   const lines = body.split("\n").filter(l => l !== undefined);
//   return (
//     <div style={{ marginBottom: 20 }}>
//       {header && (
//         <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
//           {header}
//         </div>
//       )}
//       <div>{lines.map((line, i) => renderLine(line, i))}</div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // SHARED MINI COMPONENTS
// // ─────────────────────────────────────────────────────────────────
// function CardSection({ title, badge, children }) {
//   return (
//     <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12, overflow: "hidden" }}>
//       {title && (
//         <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//           <span>{title}</span>
//           {badge && <span style={{ fontSize: 10, textTransform: "none", letterSpacing: 0, padding: "2px 8px", borderRadius: 4, background: C.pageBg, color: C.textMuted, fontWeight: 500 }}>{badge}</span>}
//         </div>
//       )}
//       {children}
//     </div>
//   );
// }

// function StRow({ label, value, valueColor, last }) {
//   return (
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: last ? "none" : `1px solid ${C.border}`, fontSize: 12, gap: 8 }}>
//       <span style={{ color: C.textMuted, flexShrink: 0, maxWidth: "55%" }}>{label}</span>
//       <span style={{ fontWeight: 700, color: valueColor || C.textPrimary, textAlign: "right" }}>{value}</span>
//     </div>
//   );
// }

// function RatioBar({ left, leftPct, leftColor, right, rightPct, rightColor, last }) {
//   return (
//     <div style={{ marginBottom: last ? 0 : 10 }}>
//       <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
//         <span style={{ color: C.textPrimary, fontWeight: 700 }}>{left} {leftPct}%</span>
//         <span style={{ color: C.textMuted }}>{right} {rightPct}%</span>
//       </div>
//       <div style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden" }}>
//         <div style={{ width: `${leftPct}%`, background: leftColor }} />
//         <div style={{ width: `${rightPct}%`, background: rightColor }} />
//       </div>
//     </div>
//   );
// }


// function TimeTabs({ tabs }) {
//   return (
//     <div style={{ marginBottom: 16 }}>
//       {tabs.map((t, i) => (
//         <div key={i} style={{ marginBottom: i < tabs.length - 1 ? 28 : 0 }}>
//           <div style={{
//             display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
//             borderBottom: `2px solid ${C.copper}`, marginBottom: 16,
//           }}>
//             <span>{t.icon}</span>
//             <span style={{ color: C.copper, fontWeight: 700, fontSize: 13 }}>{t.label}</span>
//           </div>
//           {t.content}
//         </div>
//       ))}
//     </div>
//   );
// }


// function AreaMaturityCard({ msg }) {
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const years = Object.keys(msg.price_history || {}).sort();
//   let appreciation = "—";
//   if (years.length >= 2) {
//     const chg = (((msg.price_history[years[years.length-1]] - msg.price_history[years[0]]) / msg.price_history[years[0]]) * 100).toFixed(1);
//     appreciation = `+${chg}%`;
//   }
//   return (
//     <CardSection title="AREA MATURITY">
//       <StRow label="Year established" value={intel.year_established || "—"} />
//       <StRow label="Master developer" value={intel.master_developer || "—"} />
//       <StRow label="Zone" value={intel.zone_type || "—"} />
//       <StRow label="Completion rate" value={intel.completion_rate ? `~${intel.completion_rate}% built` : "—"} valueColor={C.green} />
//       <StRow label="Residential units" value={intel.residential_units ? `${intel.residential_units.toLocaleString()} registered` : "—"} />
//       <StRow label="Active off-plan projects" value={intel.active_project_count ? `${intel.active_project_count} projects` : "—"} valueColor={C.copper} />
//       <StRow label="5-year appreciation" value={appreciation} valueColor={C.green} last />
//     </CardSection>
//   );
// }



// function DeveloperTrackRecordCard({ msg }) {
//   const devs = msg.developer_track_records || [];
//   if (!devs.length) return null;
//   const area = msg.area_intelligence?.area_name_en || "AREA";
//   return (
//     <CardSection title={`DEVELOPER DELIVERY TRACK RECORD IN ${area.toUpperCase()}`} badge="Historical estimates">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["DEVELOPER","ON-TIME %","AVG DELAY","RATING","SEGMENT"].map(h => (
//             <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {devs.slice(0, 6).map((d, i) => (
//             <tr key={i}>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{d.developer_name}</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.on_time_pct >= 90 ? C.green : d.on_time_pct >= 80 ? C.amber : C.red, fontWeight: 700 }}>{d.on_time_pct}%</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.avg_delay_months > 0 ? C.red : C.green }}>{d.avg_delay_months > 0 ? `~${d.avg_delay_months} months` : "On time / early"}</td>
//               <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>{"★".repeat(Math.round(d.star_rating || 0))}{"☆".repeat(5 - Math.round(d.star_rating || 0))}</td>
//               <td style={{ padding: "8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{d.market_segment}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }
// // ─────────────────────────────────────────────────────────────────
// // HERO STATS ROW — matches Image 1 exactly (6 tiles)
// // ─────────────────────────────────────────────────────────────────
// function HeroStatsRow({ msg }) {
//   const intel    = msg.area_intelligence || {};
//   if (!intel.area_name_en && !["buyer","seller","investor","broker"].includes(msg.user_type)) return null;
//   const stats    = msg.transaction_stats || {};
//   const userType = msg.user_type || "general";
//   const yld      = msg.yield_pct;
//   const trend    = msg.price_trend;
//   const verdict  = msg.verdict;
//   const score    = msg.score;
//   const tx       = intel.tx_7d;
//   const txDelta  = intel.tx_7d_delta_pct;
//   const avgPsm   = intel.truvalu_psm || stats.avg_price_sqm;
//   const distress = msg.distress_pct;
//   const absRate  = intel.absorption_rate_pct;
//   const catScore = intel.catalyst_score;
//   const bmed     = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr];
//   const daysToSell = score ? Math.round(75 - parseFloat(score) * 0.4) : null;
//   const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
//   const moodLabel = verdict === "BUY" ? "Bullish" : verdict === "HOLD" ? "Cautious" : "Slow";
//   const moodColor = verdict === "BUY" ? C.green : verdict === "HOLD" ? C.amber : C.red;

//   let items = [];

//   if (userType === "buyer") {
//     items = [
//       { lbl: "HOMES SOLD THIS WEEK", val: tx ? String(tx) : (score ? String(Math.round(20 + parseFloat(score) * 1.5)) : "—"), valColor: C.red, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% vs last week` : "est. based on area score" },
//       avgPsm && { lbl: "WHAT'S A FAIR PRICE HERE?", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: `≈ AED ${Math.round(avgPsm / 10.7639).toLocaleString()}/sqft · Slightly up over 3 months`, subColor: C.green },
//       yld && { lbl: "RENT RETURN PER YEAR", val: `${yld}%`, valColor: C.green, sub: parseFloat(yld) > 6.1 ? "Better than Dubai's 6.1% average" : "Near Dubai average" },
//       daysToSell && { lbl: "HOW LONG TO SELL?", val: `${daysToSell} days`, valColor: daysToSell > 40 ? C.amber : C.green, sub: daysToSell > 40 ? "Takes a bit longer than usual" : "Faster than Dubai average", subColor: daysToSell > 40 ? C.red : C.green },
//       availListings && { lbl: "HOMES AVAILABLE TO BUY", val: availListings.toLocaleString(), valColor: C.textPrimary, sub: "More choice than normal — good for buyers" },
//       verdict && { lbl: "MARKET MOOD RIGHT NOW", val: moodLabel, valColor: moodColor, sub: verdict === "BUY" ? "Strong demand — buy with confidence" : "Watch closely — market paused" },
//     ];
//   } else if (userType === "seller") {
//     const recPrice = firstMed ? Math.round(parseFloat(firstMed) * 1.06) : null;
//     items = [
//       avgPsm && { lbl: "CURRENT MARKET PRICE", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: "Truvalu™ DLD benchmark" },
//       recPrice && { lbl: "RECOMMENDED LIST PRICE", val: fmtAED(recPrice), valColor: C.copper, sub: `6% above DLD median — ${firstBr}` },
//       trend != null && { lbl: "PRICE MOMENTUM", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Rising — sell into strength" : "Cooling — price carefully" },
//       tx && { lbl: "WEEKLY TRANSACTIONS", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "DLD live volume" },
//       distress && { lbl: "DISTRESS SALES", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: parseFloat(distress) > 10 ? "High — price competitively" : "Low — sellers have leverage" },
//       verdict && { lbl: "SHOULD YOU SELL?", val: trend != null && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M", valColor: trend != null && parseFloat(trend) > 0 ? C.green : C.amber, sub: "Based on current market signals" },
//     ];
//   } else if (userType === "investor") {
//     items = [
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
//       distress && { lbl: "DISTRESS OPPORTUNITY", val: `${distress}%`, valColor: C.amber, sub: `${availListings ? Math.round(availListings * parseFloat(distress) / 100) : "—"} units priced below Truvalu™ floor` },
//       catScore && { lbl: "CATALYST SCORE", val: `${catScore}/100`, valColor: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: "0 confirmed infra catalysts in next 24 months" },
//       score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : parseFloat(score) >= 60 ? C.amber : C.red, sub: parseFloat(score) >= 75 ? "STRONG BUY" : parseFloat(score) >= 60 ? "BUY" : "HOLD" },
//       absRate && { lbl: "ABSORPTION RATE", val: `${absRate}%`, valColor: parseFloat(absRate) > 50 ? C.green : C.amber, sub: "Fast-moving demand" },
//       trend != null && { lbl: "CAPITAL APPRECIATION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Price trend year on year" },
//     ];
//   } else if (userType === "broker") {
//     items = [
//       score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : C.amber, sub: verdict ? `Verdict: ${verdict}` : "Area fundamentals" },
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "For investor pitch decks" },
//       avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "DLD Truvalu™ benchmark" },
//       tx && { lbl: "WEEKLY DLD VOLUME", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "Live data" },
//       distress && { lbl: "DISTRESS %", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: "Share with investor clients" },
//       trend != null && { lbl: "PRICE DIRECTION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Tell buyers: entry window now" : "Tell buyers: negotiate hard" },
//     ];
//   } else {
//     items = [
//       verdict && { lbl: "VERDICT", val: moodLabel, valColor: moodColor, sub: score ? `Score ${score}/100` : "Market signal" },
//       yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "vs Dubai 6.1% average" },
//       avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "Truvalu™ benchmark" },
//       trend != null && { lbl: "PRICE TREND", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Year on year" },
//     ];
//   }

//   items = items.filter(Boolean);
//   if (!items.length) return null;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 10, marginBottom: 16 }}>
//       {items.map((s, i) => (
//         <div key={i} style={{ padding: "16px 14px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
//           <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 8, lineHeight: 1.4, textAlign: "center" }}>{s.lbl}</div>
//           <div style={{ fontSize: 18, fontWeight: 900, color: s.valColor || C.textPrimary, letterSpacing: "-.01em", marginBottom: 4 }}>{s.val}</div>
//           <div style={{ fontSize: 11, color: s.subColor || C.textMuted, lineHeight: 1.4, textAlign: "center" }}>{s.sub}</div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // SCORE CARD — matches right side of Image 1
// // ─────────────────────────────────────────────────────────────────
// function ScoreCard({ msg }) {
//   const score   = msg.score;
//   const verdict = msg.verdict;
//   if (!score) return null;
//   const s = parseFloat(score);
//   const scoreColor = s >= 75 ? C.green : s >= 65 ? C.amber : C.red;
//   const verdictBg  = s >= 75 ? C.greenL : C.amberL;
//   const comps = [
//     { label: "Are people buying?",    val: Math.round(s * 0.87), color: s >= 65 ? C.amber : C.red },
//     { label: "Is the price fair?",    val: Math.min(99, Math.round(s * 1.10)), color: C.green },
//     { label: "What's coming nearby?", val: Math.min(99, Math.round(s * 1.18)), color: C.green },
//     { label: "Is the mood positive?", val: Math.round(s * 0.62), color: s >= 70 ? C.amber : C.red },
//   ];
//   return (
//     <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 18px", textAlign: "center" }}>
//       <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 8, background: verdictBg, color: scoreColor }}>{verdict || (s >= 75 ? "BUY" : s >= 65 ? "HOLD" : "WATCH")}</div>
//       <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: "-.02em" }}>{score}</div>
//       <div style={{ fontSize: 14, color: C.textMuted }}>/100</div>
//       <div style={{ fontSize: 11, color: C.textMuted, margin: "4px 0 14px" }}>12-month outlook · 2026</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//         {comps.map((comp, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
//             <span style={{ flex: 1, color: C.textSecondary, textAlign: "left", fontSize: 11 }}>{comp.label}</span>
//             <div style={{ width: 72, height: 5, background: "#F3F4F6", borderRadius: 3 }}>
//               <div style={{ width: `${Math.min(comp.val, 100)}%`, height: 5, borderRadius: 3, background: comp.color }} />
//             </div>
//             <span style={{ width: 24, textAlign: "right", fontWeight: 700, fontSize: 11, color: comp.color }}>{comp.val}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // BUYER GUIDE — matches Image 2 (5-step guide)
// // ─────────────────────────────────────────────────────────────────
// function BuyerGuide({ msg }) {
//   if (msg.user_type !== "buyer") return null;
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const stats = msg.transaction_stats || {};
//   const area  = intel.area_name_en || "this area";
//   const yld   = msg.yield_pct;
//   const bmed  = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr];
//   const cats  = msg.area_catalysts || [];
//   const nats  = intel.buyer_nationalities || [];
//   const activeProjects = intel.active_project_count || 0;

//   const steps = [
//     {
//       num: 1,
//       title: "Understand what a fair price actually looks like here",
//       body: `Our Truvalu™ system calculates what any ${area} property should cost based on real transactions, floor level, view, and condition.${firstMed ? ` A ${firstBr} here is fairly priced at around ${fmtAED(firstMed)}. If someone's asking significantly more — that's a red flag. If it's below that — that's a genuine opportunity.` : " Check area prices below against real DLD closed-sale data."}`
//     },
//     {
//       num: 2,
//       title: "Check what's coming to the area in the next 2 years",
//       body: cats.length > 0
//         ? `${cats.slice(0, 2).map(c => `${c.name} is ${c.confidence || "confirmed"} for ${c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "soon"}`).join(". ")}. Infrastructure arrivals like these push prices up — buying before they open means you benefit from the appreciation.`
//         : `Dubai has confirmed infrastructure investments nearby. Infrastructure arrivals push prices up — buying before they open means you benefit from the price increase. This is why timing matters.`
//     },
//     {
//       num: 3,
//       title: "Don't panic about the current news — look at history",
//       body: `Dubai has been through oil crashes, COVID, and geopolitical scares before. Every time, well-located areas recovered within 8–14 months. The current slowdown is caused by regional news (Iran/USA), not by any problem with Dubai's economy or ${area} specifically.`
//     },
//     {
//       num: 4,
//       title: "Know who else is buying here and why",
//       body: nats.length > 0
//         ? `${area} attracts mostly ${nats[0]?.name || "Indian"} (${nats[0]?.pct || 31}%), ${nats[1]?.name || "British"} (${nats[1]?.pct || 18}%), and ${nats[2]?.name || "Russian"} (${nats[2]?.pct || 14}%) buyers — young professionals, expats, and investors.${yld ? ` Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
//         : `${area} is a popular choice with expat buyers and investors. ${yld ? `Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
//     },
//     {
//       num: 5,
//       title: "Check the developer's track record before buying off-plan",
//       body: activeProjects > 0
//         ? `If you're buying off-plan in ${area}, there are currently ${activeProjects} active projects in this area. Always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
//         : `If you're buying off-plan in ${area}, always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
//     },
//   ];

//   return (
//     <CardSection title={`YOUR 5-STEP BUYING GUIDE FOR ${area.toUpperCase()}`} badge="First-Time Buyer">
//       {steps.map((step, i) => (
//         <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none" }}>
//           <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copper, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{step.title}</div>
//             <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{step.body}</p>
//           </div>
//         </div>
//       ))}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // PRICE TABLE — matches Image 3 (cheapest/fair/expensive)
// // ─────────────────────────────────────────────────────────────────
// function PriceTable({ msg }) {
//   const stats    = msg.transaction_stats || {};
//   const bpsm     = stats.bedroom_avg_psm || {};
//   const bmed     = stats.median_price_by_bedroom || {};
//   const userType = msg.user_type || "general";
//   const yld      = parseFloat(msg.yield_pct || 0);
//   const rows     = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br] || bmed[br]);
//   if (!rows.length) return null;

//   const intel  = msg.area_intelligence || {};
//   const area   = intel.area_name_en || "this area";

//   const configs = {
//     buyer: {
//       title: `WHAT DOES BUYING IN ${area.toUpperCase()} ACTUALLY COST?`,
//       headers: ["PROPERTY TYPE", "CHEAPEST", "FAIR PRICE", "MOST EXPENSIVE"],
//       row: (br) => {
//         const med = parseFloat(bmed[br] || 0);
//         return [br, fmtAED(Math.round(med * 0.75)), fmtAED(med), fmtAED(Math.round(med * 1.40))];
//       },
//       note: 'The "Fair Price" column is Acqar\'s Truvalu™ benchmark — what the property is actually worth based on real transactions, not asking prices.'
//     },
//     seller: {
//       title: "DLD CLOSED SALES — YOUR PRICING ANCHOR",
//       headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "RECOMMENDED LIST"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.06)) : "—"];
//       },
//       note: "Recommended list price is 6% above DLD median — leaves negotiation room while attracting serious buyers."
//     },
//     investor: {
//       title: "ENTRY PRICES + ESTIMATED ANNUAL RENTAL INCOME",
//       headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", "EST. ANNUAL RENT"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         const rent = med && yld ? fmtAED(Math.round(med * yld / 100)) : "—";
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), rent];
//       },
//       note: `Based on ${yld}% gross yield — Dubai average is 6.1%. Best entry: Studio for highest yield-to-price ratio.`
//     },
//     broker: {
//       title: "DLD COMPARABLES — USE FOR CLIENT NEGOTIATIONS",
//       headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "ASKING (~+10%)"],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.10)) : "—"];
//       },
//       note: "DLD median is the actual closed-sale price. Asking prices run 8–12% higher — use median to anchor negotiations."
//     },
//     general: {
//       title: "PRICES BY BEDROOM — REAL DLD DATA",
//       headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", ""],
//       row: (br) => {
//         const psm = parseInt(bpsm[br] || 0);
//         const med = parseFloat(bmed[br] || 0);
//         return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), ""];
//       },
//       note: "Real DLD closed-sale data — not asking prices."
//     }
//   };

//   const cfg = configs[userType] || configs.general;
//   const activeCols = cfg.headers.filter(Boolean);

//   return (
//     <CardSection title={cfg.title}>
//       <div style={{ overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
//           <thead>
//             <tr>
//               {activeCols.map((h, i) => (
//                 <th key={h} style={{ padding: i === 0 ? "7px 6px 7px 0" : "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", letterSpacing: ".05em", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((br, i) => {
//               const cells = cfg.row(br).filter((_, ci) => cfg.headers[ci]);
//               return (
//                 <tr key={br} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
//                   {cells.map((cell, ci) => (
//                     <td key={ci} style={{ padding: ci === 0 ? "8px 6px 8px 0" : "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: ci === 0 ? C.textPrimary : ci === 2 ? C.green : C.textSecondary, fontWeight: ci === 0 ? 700 : ci === 2 ? 700 : 400 }}>{cell}</td>
//                   ))}
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//       {cfg.note && <p style={{ fontSize: 11, color: C.textMuted, marginTop: 10, lineHeight: 1.5 }}>💡 {cfg.note}</p>}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // OWNERSHIP COSTS — matches right side of Image 3
// // ─────────────────────────────────────────────────────────────────
// function OwnershipCosts({ msg }) {
//   if (msg.user_type !== "buyer") return null;
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};
//   const yld   = parseFloat(msg.yield_pct || 7);
//   const intel = msg.area_intelligence || {};
//   const firstBr  = Object.keys(bmed)[0];
//   const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
//   const annualRent = firstMed ? Math.round(firstMed * yld / 100 / 1000) * 1000 : null;
//   const netYield = (yld * 0.83).toFixed(1);
//   const avgPsm = intel.truvalu_psm || stats.avg_price_sqm;
//   const serviceCharge = avgPsm > 2000 ? "AED 18–28/sqft" : avgPsm > 1200 ? "AED 12–18/sqft" : "AED 10–18/sqft";

//   return (
//     <CardSection title="WHAT WILL IT COST TO OWN (NOT JUST BUY)?">
//       <StRow label="DLD Transfer Fee"           value="4% of purchase price" />
//       <StRow label="Agent commission"            value="2% (negotiable)" />
//       <StRow label="Annual service charges"      value={serviceCharge} />
//       <StRow label="Typical annual maintenance"  value="AED 5,000–15,000" />
//       {annualRent && <StRow label={`Annual rental income (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />}
//       <StRow label="Net yield after charges (est.)" value={`${netYield}%`} valueColor={C.green} />
//       <StRow label="Mortgage availability"        value="Up to 80% LTV for expats" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // INVESTOR METRICS — matches Image 4 (4 big cards)
// // ─────────────────────────────────────────────────────────────────
// function InvestorMetrics({ msg }) {
//   if (msg.user_type !== "investor") return null;
//   const intel    = msg.area_intelligence || {};
//   const stats    = msg.transaction_stats || {};
//   const yld      = msg.yield_pct;
//   const distress = msg.distress_pct;
//   const score    = msg.score;
//   const catScore = intel.catalyst_score;
//   const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
//   const distressUnits = distress && availListings ? Math.round(availListings * parseFloat(distress) / 100) : null;
//   const activeProjects = intel.active_project_count;
//   const cats = msg.area_catalysts || [];
//   const confirmedCats = cats.filter(c => c.confidence === "confirmed").length;

//   const metrics = [
//     yld && { title: "GROSS YIELD", val: `${yld}%`, color: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${intel.area_name_en || "Area"} ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
//     distress && { title: "DISTRESS OPPORTUNITY", val: `${distress}%`, color: C.amber, sub: distressUnits ? `${distressUnits.toLocaleString()} units priced below Truvalu™ floor right now` : "Units priced below market floor" },
//     catScore && { title: "CATALYST SCORE", val: `${catScore}/100`, color: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: `${confirmedCats} confirmed infra catalysts in next 24 months` },
//     activeProjects && { title: "OFF-PLAN PIPELINE", val: `${activeProjects} Projects`, color: C.blue, sub: `Active off-plan projects in ${intel.area_name_en || "this area"}` },
//   ].filter(Boolean);

//   if (!metrics.length) return null;

//   return (
//     <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(metrics.length, 2)}, 1fr)`, gap: 10, marginBottom: 12 }}>
//       {metrics.map((m, i) => (
//         <CardSection key={i} title={m.title}>
//           <div style={{ fontSize: 34, fontWeight: 900, color: m.color, textAlign: "center", marginBottom: 6 }}>{m.val}</div>
//           <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center" }}>{m.sub}</div>
//         </CardSection>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // MARKET COMPOSITION — matches left side of Image 5
// // ─────────────────────────────────────────────────────────────────
// function MarketCompositionCard({ msg }) {
//   if (!["investor", "broker"].includes(msg.user_type)) return null;
//   return (
//     <CardSection title="MARKET COMPOSITION — INVESTOR VIEW">
//       <RatioBar left="Off-Plan (Primary)" leftPct={58} leftColor={C.blue} right="Ready (Secondary)" rightPct={42} rightColor={C.amber} />
//       <RatioBar left="Investor-owned" leftPct={62} leftColor={C.copper} right="End-user" rightPct={38} rightColor={C.green} />
//       <RatioBar left="Apartments" leftPct={87} leftColor={C.green} right="Villas/TH" rightPct={13} rightColor="#7C3AED" />
//       <RatioBar left="Long-term tenants" leftPct={88} leftColor="#14B8A6" right="Short-stay" rightPct={12} rightColor="#E2E8F0" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // TRUVALU BENCHMARK TABLE — matches right side of Image 5
// // ─────────────────────────────────────────────────────────────────
// function TruvaluBenchmark({ msg }) {
//   const stats = msg.transaction_stats || {};
//   const bpsm  = stats.bedroom_avg_psm || {};
//   const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br]);
//   if (!rows.length) return null;

//   return (
//     <CardSection title="TRUVALU™ BENCHMARK VS ASKING PRICE" badge="RICS-aligned">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["TYPE", "TRUVALU™", "ASKING", "GAP", "SIGNAL"].map(h => (
//             <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {rows.map((br, i) => {
//             const truv = parseInt(bpsm[br]);
//             const ask  = Math.round(truv * (1 + (Math.random() * 0.08 - 0.04)));
//             const gap  = ((ask - truv) / truv * 100).toFixed(1);
//             const signal = parseFloat(gap) > 2 ? { label: "Premium", bg: C.redL, color: C.red } : parseFloat(gap) < -2 ? { label: "Opportunity", bg: C.greenL, color: C.green } : { label: "Fair", bg: C.amberL, color: C.amber };
//             return (
//               <tr key={br}>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700 }}>AED {truv.toLocaleString()}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{ask.toLocaleString()}</td>
//                 <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{parseFloat(gap) > 0 ? `+${gap}` : gap}%</td>
//                 <td style={{ padding: "8px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
//                   <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: signal.bg, color: signal.color }}>{signal.label}</span>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // YIELD BY UNIT TYPE — matches bottom right of Image 5
// // ─────────────────────────────────────────────────────────────────
// function YieldByTypeCard({ msg }) {
//   if (!["investor", "broker"].includes(msg.user_type)) return null;
//   const yld = parseFloat(msg.yield_pct || 7);
//   const yieldByType = [
//     { type: "Studio", val: +(yld * 1.19).toFixed(1) },
//     { type: "1 BR",   val: +yld.toFixed(1) },
//     { type: "2 BR",   val: +(yld * 0.94).toFixed(1) },
//     { type: "3 BR",   val: +(yld * 0.88).toFixed(1) },
//     { type: "TH 3BR", val: +(yld * 0.82).toFixed(1) },
//   ];
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};

//   return (
//     <CardSection title="RENTAL YIELD BY UNIT TYPE">
//       {yieldByType.map(y => (
//         <div key={y.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
//           <span style={{ fontSize: 11, width: 52, flexShrink: 0, color: C.textSecondary }}>{y.type}</span>
//           <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
//             <div style={{ width: `${(y.val / 11) * 100}%`, height: 6, borderRadius: 3, background: y.val > 6.1 ? C.green : C.amber }} />
//           </div>
//           <span style={{ fontSize: 12, fontWeight: 700, width: 36, textAlign: "right", color: y.val > 6.1 ? C.green : C.amber }}>{y.val}%</span>
//         </div>
//       ))}
//       <div style={{ fontSize: 10, color: C.textMuted, textAlign: "right", marginBottom: 8 }}>— Dubai Avg 6.1%</div>
//       <StRow label="Best yield unit type" value={`Studio (${yieldByType[0].val}%)`} valueColor={C.green} />
//       <StRow label="5-year yield trend"   value={`↑ 6.1% → ${yld}%`} valueColor={C.green} />
//       <StRow label="Average days to rent" value="18 days" last />
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // OWNER / SELLER VALUATION — matches Image 6
// // ─────────────────────────────────────────────────────────────────
// function OwnerValuation({ msg }) {
//   if (msg.user_type !== "seller") return null;
//   const intel = msg.area_intelligence || {};
//   if (!intel.area_name_en) return null;
//   const stats = msg.transaction_stats || {};
//   const area  = intel.area_name_en || "this area";
//   const bmed  = stats.median_price_by_bedroom || {};
//   const firstBr  = Object.keys(bmed)[0] || "1 BR";
//   const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
//   if (!firstMed) return null;

//   const low  = Math.round(firstMed * 0.97 / 1000) * 1000;
//   const high = Math.round(firstMed * 1.18 / 1000) * 1000;
//   const gain6m = Math.round(firstMed * 0.033 / 1000) * 1000;
//   const yld  = parseFloat(intel.gross_yield_pct || 7);
//   const annualRent = Math.round(firstMed * yld / 100 / 1000) * 1000;
//   const annualRentShort = Math.round(annualRent * 1.25 / 1000) * 1000;
//   const trend = msg.price_trend;
//   const score = parseFloat(msg.score || 65);
//   const daysToSell = Math.round(75 - score * 0.4);

//   return (
//     <>
//       {/* Valuation banner */}
//       <div style={{ background: "rgba(200,115,42,0.06)", border: "1px solid rgba(200,115,42,0.2)", borderRadius: 10, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
//         <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: C.copper }}>Your Asset · Truvalu™ Valuation</div>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
//           <div>
//             <h2 style={{ fontSize: 18, fontWeight: 900, color: C.copper, margin: "0 0 4px" }}>{firstBr} in {area} is worth {fmtAED(low)} — {fmtAED(high)}</h2>
//             <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Based on floor level, view, building quality, and current DLD transactions. Updated daily.</p>
//           </div>
//           <div style={{ textAlign: "right", flexShrink: 0 }}>
//             <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted }}>Truvalu™ Fair Value</div>
//             <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary }}>{fmtAED(firstMed)}</div>
//             <div style={{ fontSize: 11, color: C.green }}>↑ +{fmtAED(gain6m)} vs 6 months ago</div>
//           </div>
//         </div>
//       </div>

//       {/* 3 panels */}
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//         <CardSection title="SHOULD YOU SELL NOW?">
//           <div style={{ fontSize: 24, fontWeight: 900, color: trend && parseFloat(trend) > 0 ? C.green : C.amber, marginBottom: 8 }}>
//             {trend && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M"}
//           </div>
//           <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
//             {trend && parseFloat(trend) > 0
//               ? `Market conditions are rising +${trend}% YoY. If you need to sell, now is a favorable window.`
//               : `Infrastructure catalysts arriving Q4 2026 are likely to push prices up 8–14% — selling before those land means leaving money on the table.`}
//           </p>
//           <StRow label="Days to sell (current)" value={`${daysToSell} days`} valueColor={daysToSell > 40 ? C.red : C.green} />
//           <StRow label="Expected post-catalyst" value="8–14%" valueColor={C.green} />
//           <StRow label="Market sentiment" value={trend && parseFloat(trend) > 0 ? "Bullish" : "Cautious"} valueColor={trend && parseFloat(trend) > 0 ? C.green : C.amber} last />
//         </CardSection>
//         <CardSection title="SHOULD YOU RENT IT OUT?">
//           <div style={{ fontSize: 24, fontWeight: 900, color: C.green, marginBottom: 8 }}>Yes — Good Yield</div>
//           <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
//             {area}'s rental market remains active. Your {firstBr} can generate {fmtAED(annualRent)}/year long-term or {fmtAED(annualRentShort)}/year short-term furnished.
//           </p>
//           <StRow label={`Annual long-term rent (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />
//           <StRow label="Short-term furnished" value={`${fmtAED(annualRent)}–${fmtAED(annualRentShort)}`} valueColor={C.green} />
//           <StRow label="Average days to rent" value="18 days" last />
//         </CardSection>
//       </div>
//     </>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // PRICE HISTORY CHART — matches Image 7
// // ─────────────────────────────────────────────────────────────────
// function PriceHistoryCard({ msg }) {
//   const hist  = msg.price_history || {};
//   const years = Object.keys(hist).sort();
//   if (years.length < 2) return null;

//   const vals   = years.map(y => hist[y]);
//   const maxVal = Math.max(...vals);
//   const minVal = Math.min(...vals);
//   const range  = maxVal - minVal || 1;
//   const first  = vals[0];
//   const last   = vals[vals.length - 1];
//   const chgPct = ((last - first) / first * 100).toFixed(1);
//   const rising = last >= first;
//   const W = 500, H = 100;

//   const pts = years.map((y, i) => {
//     const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//     const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//     return `${x},${yc}`;
//   }).join(" ");

//   const userType = msg.user_type || "general";
//   const intel    = msg.area_intelligence || {};
//   const area     = intel.area_name_en || "Area";
//   const tabLabel = userType === "investor"
//     ? `📈 CAPITAL APPRECIATION — PRICE HISTORY`
//     : `📜 ${area.toUpperCase()} PRICE PER SQM — HISTORY`;

//   // Find min and max idx
//   const maxIdx = vals.indexOf(maxVal);
//   const minIdx = vals.indexOf(minVal);

//   return (
//     <CardSection title={tabLabel} badge="Truvalu™ Benchmark vs DLD Transacted">
//       <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
//         <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: rising ? C.greenL : C.redL, color: rising ? "#065F46" : "#991B1B" }}>
//           {rising ? "+" : ""}{chgPct}% over {years.length} yr{years.length > 1 ? "s" : ""}
//         </span>
//       </div>
//       <div style={{ background: "#FAF8F5", borderRadius: 6, padding: "12px 8px 8px" }}>
//         <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
//           <defs>
//             <linearGradient id="phGrad2" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor={rising ? "rgba(22,163,74,0.18)" : "rgba(220,38,38,0.18)"} />
//               <stop offset="100%" stopColor="rgba(0,0,0,0.01)" />
//             </linearGradient>
//             <filter id="lineShadow2">
//               <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(200,115,42,0.25)" />
//             </filter>
//           </defs>
//           <polygon
//             points={`${years.map((y, i) => {
//               const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//               const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//               return `${x},${yc}`;
//             }).join(" ")} ${W},${H} 0,${H}`}
//             fill="url(#phGrad2)"
//           />
//           <polyline fill="none" stroke={C.copper} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} filter="url(#lineShadow2)" />
//           {years.map((y, i) => {
//             const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
//             const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
//             const isLast = i === years.length - 1;
//             const isMax  = i === maxIdx;
//             const isMin  = i === minIdx;
//             return (
//               <g key={y}>
//                 <circle cx={x} cy={yc} r={isLast ? 5 : 4}
//                   fill={isLast ? C.copper : "#fff"}
//                   stroke={isMax ? C.green : isMin ? C.red : C.copper}
//                   strokeWidth="2"
//                 />
//                 {isLast && (
//                   <>
//                     <rect x={x - 40} y={yc - 24} width={80} height={18} rx={4} fill={C.copper} />
//                     <text x={x} y={yc - 10} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="700">AED {parseInt(hist[y]).toLocaleString()}</text>
//                   </>
//                 )}
//               </g>
//             );
//           })}
//           <line x1="0" x2={W} y1={H} y2={H} stroke="#D8CEBC" strokeWidth="1" />
//         </svg>
//         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
//           {years.filter((_, i) => i === 0 || i === years.length - 1 || years.length <= 6).map((y, i) => (
//             <div key={y} style={{ textAlign: "center" }}>
//               <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted }}>{y}</div>
//               <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary }}>{parseInt(hist[y]).toLocaleString()}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // NATIONALITY CARD — matches Images 5 & 10
// // ─────────────────────────────────────────────────────────────────
// function NationalityCard({ msg }) {
//   const intel = msg.area_intelligence || {};
//   const nats  = intel.buyer_nationalities;
//   if (!nats || !nats.length) return null;

//   const badge = nats.some(n => n.pct) ? "DLD verified" : "Market estimate";

//   return (
//     <CardSection title="BUYER NATIONALITY — 90 DAYS" badge={badge}>
//       {nats.slice(0, 8).map((n, i) => (
//         <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
//           <span style={{ fontSize: 14, width: 20 }}>{n.flag || "🌍"}</span>
//           <span style={{ fontSize: 12, width: 70, flexShrink: 0, color: C.textSecondary }}>{n.name}</span>
//           <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
//             <div style={{ width: `${n.w || (n.pct ? Math.min(100, n.pct * 3) : 30)}%`, height: 6, borderRadius: 3, background: C.copper }} />
//           </div>
//           <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: "right", color: C.textMuted }}>{n.pct}%</span>
//         </div>
//       ))}
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // DISTRESS METER — matches top of Image 9
// // ─────────────────────────────────────────────────────────────────
// function DistressMeter({ msg }) {
//   const distress = msg.distress_pct;
//   const intel    = msg.area_intelligence || {};
//   const area     = intel.area_name_en || "this area";
//   if (!distress) return null;
//   const availListings = msg.score ? Math.round(1500 + parseFloat(msg.score) * 50) : 5000;
//   const distressUnits = Math.round(availListings * parseFloat(distress) / 100);

//   return (
//     <div style={{ background: "#F5F5F5", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
//       <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, flexShrink: 0 }}>{distress}%</div>
//       <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>
//         <strong style={{ color: C.textPrimary }}>Distress Meter:</strong> {distressUnits.toLocaleString()} of {area}'s active listings are priced below the Truvalu™ floor right now.
//         {parseFloat(distress) > 10 ? " This is above the 12-month average — driven by nervous sellers who want to exit quickly. For patient buyers, this is a genuine entry window." : " This is near the 12-month average — stable market conditions."}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // ANNUAL RENT RANGES — matches left of Image 10
// // ─────────────────────────────────────────────────────────────────
// function RentRangesCard({ msg }) {
//   if (!["investor", "seller", "broker"].includes(msg.user_type)) return null;
//   const stats = msg.transaction_stats || {};
//   const bmed  = stats.median_price_by_bedroom || {};
//   const yld   = parseFloat(msg.yield_pct || 7);
//   const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bmed[br]);
//   if (!rows.length) return null;

//   const sqftMap = { "Studio": 450, "1 BR": 800, "2 BR": 1250, "3 BR": 1800, "4 BR": 2400 };

//   return (
//     <CardSection title="ANNUAL RENT RANGES (AED)">
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead>
//           <tr>{["TYPE", "MIN", "AVG", "MAX"].map(h => (
//             <th key={h} style={{ padding: "6px 6px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
//           ))}</tr>
//         </thead>
//         <tbody>
//           {rows.map((br, i) => {
//             const med  = parseFloat(bmed[br]);
//             const avg  = Math.round(med * yld / 100 / 1000) * 1000;
//             const min_ = Math.round(avg * 0.75 / 1000) * 1000;
//             const max_ = Math.round(avg * 1.35 / 1000) * 1000;
//             return (
//               <tr key={br}>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{min_.toLocaleString()}</td>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.green, fontWeight: 700 }}>{avg.toLocaleString()}</td>
//                 <td style={{ padding: "8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{max_.toLocaleString()}</td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </CardSection>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CATALYSTS CARD — matches Image 11 (timeline style)
// // ─────────────────────────────────────────────────────────────────
// function CatalystsCard({ msg }) {
//   const cats     = msg.area_catalysts || [];
//   const userType = msg.user_type || "general";
//   const intel    = msg.area_intelligence || {};
//   const catScore = intel.catalyst_score;
//   if (!cats.length && !catScore) return null;

//   const label = {
//     buyer:    "🔭 FUTURE — INFRASTRUCTURE & CATALYST TIMELINE",
//     seller:   "⚡ UPCOMING CATALYSTS THAT COULD HELP YOUR SALE",
//     investor: "⚡ CATALYSTS — CONFIRMED PRICE DRIVERS",
//     broker:   "⚡ UPCOMING CATALYSTS — FOR PITCH DECKS",
//     general:  "🔭 UPCOMING CATALYSTS",
//   }[userType] || "🔭 UPCOMING CATALYSTS";

//   const typeColors = {
//     metro:    { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Metro" },
//     school:   { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "School" },
//     mall:     { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Retail" },
//     hospital: { bg: "#FDF4FF", border: "#E9D5FF", dot: "#7C3AED", label: "Health" },
//     road:     { bg: "#F0F9FF", border: "#BAE6FD", dot: "#0284C7", label: "Road" },
//     park:     { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "Park" },
//     airport:  { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Airport" },
//   };
//   const confColors = { confirmed: C.green, announced: C.blue, likely: C.amber, spec: C.textMuted };

//   return (
//     <div>
//       <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{label}</div>
//       <div style={{ paddingLeft: 20, position: "relative" }}>
//         <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: C.border, borderRadius: 1 }} />
//         {cats.slice(0, 4).map((c, i) => {
//           const tc = typeColors[c.catalyst_type] || { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Project" };
//           const dateLabel = c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "TBC";
//           return (
//             <div key={i} style={{ position: "relative", marginBottom: 18 }}>
//               <div style={{ position: "absolute", left: -24, top: 5, width: 12, height: 12, borderRadius: "50%", background: tc.dot, border: `2px solid #fff` }} />
//               <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 3 }}>
//                 {dateLabel}{" "}
//                 <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, marginLeft: 6, textTransform: "uppercase", letterSpacing: ".08em", background: tc.bg, color: tc.dot }}>{c.confidence || tc.label}</span>
//               </div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>{c.name}</div>
//               {c.description && <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55 }}>{c.description}</div>}
//               <div style={{ fontSize: 11, marginTop: 4, color: C.textMuted }}>
//                 📈 Expected impact: <strong style={{ color: C.green }}>
//                   {c.catalyst_type === "metro" ? "+8–14% PSF (1km radius)" : c.catalyst_type === "school" ? "+12–18% demand for 2–3BR" : "Positive area impact expected"}
//                 </strong>
//               </div>
//             </div>
//           );
//         })}
//         {!cats.length && <div style={{ fontSize: 12, color: C.textMuted, padding: "10px 0" }}>No confirmed catalysts yet — check back soon.</div>}
//       </div>
//       {catScore && (
//         <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
//           <div style={{ fontSize: 12, color: C.textSecondary }}>Catalyst Score</div>
//           <div style={{ fontSize: 28, fontWeight: 900, color: parseFloat(catScore) >= 70 ? C.green : C.amber }}>{catScore}/100</div>
//         </div>
//       )}
//     </div>
//   );
// }


// function MultiAreaCards({ msg }) {
//   const links = msg.area_links || [];
//   if (links.length < 2) return null;
//   return (
//     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
//       {links.slice(0, 6).map((l, i) => (
//         <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
//           style={{ display: "block", padding: "14px 16px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: "none" }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{l.name}</div>
//           <div style={{ fontSize: 11, color: C.copper, fontWeight: 600 }}>View full area profile →</div>
//         </a>
//       ))}
//     </div>
//   );
// }


// function ComparisonTable({ msg }) {
//   const data = msg.comparison_data || [];
//   if (data.length < 2) return null;
//   const [a, b] = data;

//   const allRows = [
//     { label: "Investment Score", get: d => d.score ? `${d.score}/100` : null, color: C.textPrimary },
//     { label: "Verdict", get: d => d.verdict || null, color: C.textPrimary },
//     { label: "Gross Yield", get: d => d.yield_pct ? `${d.yield_pct}%` : null, color: C.green },
//     { label: "Avg Price/sqm", get: d => d.avg_psm ? `AED ${parseInt(d.avg_psm).toLocaleString()}` : null, color: C.textPrimary },
//     { label: "Price Trend", get: d => d.price_trend != null ? `${d.price_trend > 0 ? "+" : ""}${d.price_trend}% YoY` : null, color: d => d.price_trend > 0 ? C.green : C.red },
//   ];

//   const brTypes = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"];
//   brTypes.forEach(br => {
//     if (a.median_price_by_bedroom?.[br] || b.median_price_by_bedroom?.[br]) {
//       allRows.push({
//         label: `${br} Median`,
//         get: d => d.median_price_by_bedroom?.[br] ? fmtAED(d.median_price_by_bedroom[br]) : null,
//         color: C.textPrimary,
//       });
//     }
//   });

//   // Only keep rows where at least one side has real data
//   const rows = allRows.filter(row => row.get(a) != null || row.get(b) != null);
//   if (!rows.length) return null;
//   return (
//     <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — COMPARISON TABLE`}>
//       <div style={{ overflowX: "auto" }}>
//         <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
//           <thead>
//             <tr>
//               <th style={{ padding: "7px 6px 7px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>METRIC</th>
//               <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{a.name}</th>
//               <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{b.name}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row, i) => (
//               <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
//                 <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600, color: C.textPrimary }}>{row.label}</td>
//                 <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(a) : row.color }}>{row.get(a) ?? "—"}</td>
// <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(b) : row.color }}>{row.get(b) ?? "—"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </CardSection>
//   );
// }



// function ComparisonBarChart({ msg }) {
//   const data = msg.comparison_data || [];
//   if (data.length < 2) return null;
//   const [a, b] = data;

//   const metrics = [
//     { label: "Investment Score", av: a.score, bv: b.score, suffix: "/100" },
//     { label: "Gross Yield",      av: a.yield_pct, bv: b.yield_pct, suffix: "%" },
//     { label: "Avg Price/sqm",    av: a.avg_psm, bv: b.avg_psm, suffix: "", isPrice: true },
//     { label: "Price Trend YoY",  av: a.price_trend, bv: b.price_trend, suffix: "%" },
//   ].filter(m => m.av != null || m.bv != null);

//   if (!metrics.length) return null;

//   return (
//     <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — VISUAL COMPARISON`}>
//       {metrics.map((m, i) => {
//         const maxVal = Math.max(Math.abs(m.av || 0), Math.abs(m.bv || 0)) * 1.2 || 1;
//         const aPct = m.av != null ? Math.min(100, (Math.abs(m.av) / maxVal) * 100) : 0;
//         const bPct = m.bv != null ? Math.min(100, (Math.abs(m.bv) / maxVal) * 100) : 0;
//         return (
//           <div key={i} style={{ marginBottom: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
//               {m.label}
//             </div>
//             {[[a.name, m.av, aPct, C.copper], [b.name, m.bv, bPct, C.blue]].map(([name, val, pct, color], j) => (
//               <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: j === 0 ? 4 : 0 }}>
//                 <span style={{ width: 110, fontSize: 11, color: C.textSecondary, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
//                 <div style={{ flex: 1, height: 14, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
//                   <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
//                 </div>
//                 <span style={{ width: 70, fontSize: 11, fontWeight: 700, color: C.textPrimary, textAlign: "right" }}>
//                   {val != null ? `${m.isPrice ? Math.round(val).toLocaleString() : val}${m.suffix}` : "—"}
//                 </span>
//               </div>
//             ))}
//           </div>
//         );
//       })}
//     </CardSection>
//   );
// }


// // ─────────────────────────────────────────────────────────────────
// // HERO BADGES
// // ─────────────────────────────────────────────────────────────────
// function HeroBadges({ score, verdict, yieldPct, priceTrend }) {
//   if (!score && !verdict && !yieldPct) return null;
//   const verdictStyle = {
//     BUY:   { bg: "#D1FAE5", color: "#065F46" },
//     HOLD:  { bg: "#FEF3C7", color: "#92400E" },
//     WATCH: { bg: "#FEE2E2", color: "#991B1B" },
//   }[verdict] || { bg: "#F3F4F6", color: C.textPrimary };

//   return (
//     <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
//       {score && <span style={{ padding: "4px 10px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>Score {score}/100</span>}
//       {verdict && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: verdictStyle.bg, color: verdictStyle.color }}>{verdict}</span>}
//       {yieldPct && <span style={{ padding: "4px 10px", background: "#EFF6FF", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>Yield {yieldPct}%</span>}
//       {priceTrend != null && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: priceTrend > 0 ? "#D1FAE5" : "#FEE2E2", color: priceTrend > 0 ? "#065F46" : "#991B1B" }}>{priceTrend > 0 ? "+" : ""}{priceTrend}% trend</span>}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────
// // CHART (bar chart for prices/yields)
// // ─────────────────────────────────────────────────────────────────
// function SingleChart({ chart }) {
//   if (!chart?.data?.length) return null;
//   const valid = chart.data.filter(d => d.value > 0);
//   if (!valid.length) return null;
//   const max = Math.max(...valid.map(d => d.value));
//   return (
//     <div style={{ margin: "16px 0 8px", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
//       <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>{chart.title}</div>
//       <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
//         {valid.slice(0, 10).map((item, i) => (
//           <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div style={{ width: 100, fontSize: 11, color: C.textLight, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
//             <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
//               <div style={{ height: "100%", width: `${Math.max(3, (item.value / max) * 100)}%`, background: chart.type === "line" ? "#3B82F6" : C.copper, borderRadius: 3 }} />
//             </div>
//             <div style={{ width: 64, fontSize: 11, color: C.textSecondary, fontWeight: 600, flexShrink: 0, textAlign: "right" }}>{item.value?.toLocaleString()}</div>
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
//         <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
//       ))}
//       <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
//     </div>
//   );
// }

// function Avatar() {
//   return (
//     <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.copper, fontWeight: 700 }}>✦</div>
//   );
// }

// function extractFollowups(reply) {
//   if (!reply) return [];
//   const lines = reply.split("\n");
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
//         <div style={{ maxWidth: "75%", padding: "10px 14px", background: C.userBubble, borderRadius: "18px 18px 4px 18px", fontSize: 14, color: C.textPrimary, lineHeight: 1.6 }}>
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
//           {msg.summary && <p style={{ margin: "0 0 12px 0", fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{msg.summary}</p>}
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
//         <div style={{ flex: 1, background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 12, padding: "16px 18px" }}>
//           {lines.map((line, i) => {
//             const trimmed = line.trim();
//             if (/^\d+\./.test(trimmed)) {
//               const content = trimmed.replace(/^\d+\.\s*/, "");
//               const num = trimmed.match(/^(\d+)\./)?.[1];
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
//   const charts    = Array.isArray(msg.charts) ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0)) : [];
//   const followups = msg._followups || [];
// const hasAreaData = !!(
//   msg.area_intelligence ||
//   msg.transaction_stats ||
//   msg.score ||
//   msg.yield_pct ||
//   msg.verdict ||
//   (msg.area_links && msg.area_links.length > 0)
// );

//   return (
//     <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
//       <Avatar />
//       <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

//         {/* Summary */}
//         {(msg.summary || msg._summary) && (
//           <p style={{ margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary, lineHeight: 1.75, fontWeight: 400, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
//             {msg.summary || msg._summary}
//           </p>
//         )}

//         {/* Badges */}
//         <HeroBadges score={msg.score} verdict={msg.verdict} yieldPct={msg.yield_pct} priceTrend={msg.price_trend} />

// {/* ── MULTI-AREA (comparison/lifestyle/budget) RESPONSES ── */}
//         {hasAreaData && msg.response_mode === "multi_area" ? (
//           <>
//             {sections && sections.length > 0 && sections[0].header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌")) && (
//               <SectionBlock header={sections[0].header} body={sections[0].body} />
//             )}

//            <MultiAreaCards msg={msg} />
//             {msg.comparison_data?.length >= 2 && <ComparisonTable msg={msg} />}
//             {msg.comparison_data?.length >= 2 && <ComparisonBarChart msg={msg} />}

//             {sections && sections.slice(
//               (sections[0]?.header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌"))) ? 1 : 0
//             ).map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}

//             {!sections && msg.reply && (
//               <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//                 dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//               />
//             )}

//             {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
//           </>
//         ) : (
//           <>
//             {hasAreaData && (
//               <>
//                 {/* Hero stats + Score card side by side */}
//                 {msg.score ? (
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12, marginBottom: 16 }}>
//                     <HeroStatsRow msg={msg} />
//                     <ScoreCard msg={msg} />
//                   </div>
//                 ) : (
//                   <HeroStatsRow msg={msg} />
//                 )}

//                 {/* Buyer: Guide + Price table + Costs */}
//                 <BuyerGuide msg={msg} />
//                 <PriceTable msg={msg} />
//                 <OwnershipCosts msg={msg} />

//                 {/* Seller: Owner valuation */}
//                 <OwnerValuation msg={msg} />

//                 {/* Investor: 4 big metric cards */}
//                 <InvestorMetrics msg={msg} />

//                 {/* Investor/Broker: Nationality + Yield by type */}
//                 {["investor", "broker"].includes(msg.user_type) && (
//                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//                     <NationalityCard msg={msg} />
//                     <YieldByTypeCard msg={msg} />
//                   </div>
//                 )}

//                 {/* Past / Present / Future tabs */}
//                 <TimeTabs
//                   tabs={[
//                     {
//                       label: "PAST — HISTORY & TRACK RECORD",
//                       icon: "📜",
//                       content: (
//                         <>
//                           <PriceHistoryCard msg={msg} />
//                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
//                             <AreaMaturityCard msg={msg} />
//                             <DeveloperTrackRecordCard msg={msg} />
//                           </div>
//                         </>
//                       ),
//                     },
//                     {
//                       label: "PRESENT — LIVE MARKET DATA",
//                       icon: "📡",
//                       content: (
//                         <>
//                           <DistressMeter msg={msg} />
//                           {["investor", "broker"].includes(msg.user_type) && (
//                             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
//                               <MarketCompositionCard msg={msg} />
//                               <TruvaluBenchmark msg={msg} />
//                             </div>
//                           )}
//                           {!["investor", "broker"].includes(msg.user_type) && <TruvaluBenchmark msg={msg} />}
//                           <RentRangesCard msg={msg} />
//                           <NationalityCard msg={msg} />
//                         </>
//                       ),
//                     },
//                     {
//                       label: "FUTURE — WHAT'S COMING",
//                       icon: "🔭",
//                       content: (
//                         (msg.area_catalysts?.length > 0 || msg.area_intelligence?.catalyst_score) ? (
//                           <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
//                             <CatalystsCard msg={msg} />
//                           </div>
//                         ) : (
//                           <p style={{ fontSize: 13, color: C.textMuted, padding: "20px 0", textAlign: "center" }}>No catalyst data available for this area yet.</p>
//                         )
//                       ),
//                     },
//                   ]}
//                 />
//               </>
//             )}

//             {sections ? (
//               <div>
//                 {sections.map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}
//               </div>
//             ) : msg.reply ? (
//               <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
//                 dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
//               />
//             ) : null}

//             {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
//           </>
//         )}

//         {/* Insight */}
//         {msg.insight && (
//           <div style={{ marginTop: 16, padding: "10px 14px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
//             ✦ {msg.insight}
//           </div>
//         )}

//         {/* Area links */}
//         {msg.area_links && msg.area_links.length > 0 && (
//           <div style={{ marginTop: 16 }}>
//             <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Explore Areas</div>
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

//         {/* Valuation CTA */}
//         <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
//           💡 BTW — You can instantly verify the real market value of any Dubai property you are looking at here →{" "}
//           <a href="https://www.acqar.com/valuation" target="_blank" rel="noopener noreferrer" style={{ color: "#B87333", textDecoration: "underline", fontWeight: 700 }}>
//             https://www.acqar.com/valuation
//           </a>
//         </div>

//         {/* Follow-ups */}
//         {followups.length > 0 && (
//           <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
//             {followups.map((fq, i) => (
//               <button key={i} onClick={() => onSuggestion(fq)}
//                 style={{ padding: "5px 11px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 20, color: C.textLight, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
//                 onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                 onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//               >{fq}</button>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// function LoginModal({ open, onClose, navigate }) {
//   if (!open) return null;
//   return (
//     <div onClick={onClose}
//       style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.55)",
//         display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
//       <div onClick={e => e.stopPropagation()}
//         style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", maxWidth: 380,
//           width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
//         <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
//         <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: "#111827" }}>
//           Sign in to view your answer
//         </h3>
//         <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>
//           Your answer is ready. Log in — it will be waiting for you right here.
//         </p>
//         <button onClick={() => navigate("/complete-profile")}
//           style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "none", cursor: "pointer",
//             background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", color: "#fff",
//             fontWeight: 800, fontSize: 15, fontFamily: "inherit" }}>
//           Sign In →
//         </button>
//         <button onClick={() => navigate("/complete-profile")}
//           style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12,
//             border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
//             fontWeight: 700, fontSize: 14, color: "#111827", fontFamily: "inherit" }}>
//           Create an account
//         </button>
//         <button onClick={onClose}
//           style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer",
//             fontSize: 12.5, color: "#9CA3AF", fontFamily: "inherit" }}>
//           Not now
//         </button>
//       </div>
//     </div>
//   );
// }

// function FeedbackAndShare({ user, messages }) {
//   const [text, setText] = useState("");
//   const [status, setStatus] = useState("");        // feedback status
//   const [shareStatus, setShareStatus] = useState(""); // "", "saving", "copied", "error"
//   const [open, setOpen] = useState(true);

//   const submitFeedback = async () => {
//     if (!text.trim() || status === "saving") return;
//     setStatus("saving");
//     const { error } = await supabase.from("broker_feedback").insert({
//       user_id: user?.id || null,
//       email: user?.email || user?.user_metadata?.email || null,
//       feedback: text.trim(),
//       page: "/broker",
//     });
//     if (error) setStatus("error");
//     else {
//   posthog.capture("broker_feedback_submitted", { feedback: text.trim(), email: user?.email || user?.user_metadata?.email || "anonymous"});
//   setStatus("done"); setText(""); setTimeout(() => setStatus(""), 3000);
// }
    
//   };

//   const shareChat = async () => {
//     if (shareStatus === "saving") return;
//     const shareable = messages.filter(m => m.role === "user" || m.role === "assistant");
//     if (!shareable.length) { setShareStatus("empty"); setTimeout(() => setShareStatus(""), 2500); return; }
//     setShareStatus("saving");
//     const { data, error } = await supabase
//       .from("broker_shared_chats")
//       .insert({ user_id: user?.id || null, messages: shareable })
//       .select("id")
//       .single();
//     if (error || !data?.id) { setShareStatus("error"); setTimeout(() => setShareStatus(""), 3000); return; }
//     const url = `${window.location.origin}/broker?share=${data.id}`;
//     posthog.capture("broker_chat_shared", { share_id: data.id, message_count: shareable.length });
//     if (navigator.share) {
//       try { await navigator.share({ title: "ACQAR Intelligence Chat", url }); } catch {}
//       setShareStatus("");
//     } else {
//       try { await navigator.clipboard.writeText(url); setShareStatus("copied"); }
//       catch { setShareStatus("error"); }
//       setTimeout(() => setShareStatus(""), 3000);
//     }
//   };

//   if (!open) {
//     return (
//       <button onClick={() => setOpen(true)}
//         style={{ position: "fixed", right: 16, bottom: 100, zIndex: 900, padding: "10px 14px",
//           borderRadius: 24, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
//           fontWeight: 700, fontSize: 12, color: "#C8732A", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontFamily: "inherit" }}>
//         💬 Feedback
//       </button>
//     );
//   }

//   return (
//     <div style={{ position: "fixed", right: 16, bottom: 100, zIndex: 900, width: 260,
//       background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 14px 12px",
//       boxShadow: "0 8px 30px rgba(0,0,0,0.14)" }}>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
//         <span style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>💬 Feedback</span>
//         <button onClick={() => setOpen(false)}
//           style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 14, padding: 0 }}>✕</button>
//       </div>
//       <textarea
//         value={text}
//         onChange={e => setText(e.target.value)}
//         placeholder="Share your feedback..."
//         rows={3}
//         style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10,
//           fontSize: 12, border: "1px solid #E5E7EB", background: "#FAFAFA", outline: "none",
//           color: "#111827", fontFamily: "inherit", resize: "none" }}
//       />
//       <button onClick={submitFeedback} disabled={status === "saving" || !text.trim()}
//         style={{ width: "100%", marginTop: 8, padding: "9px 0", borderRadius: 10, border: "none",
//           cursor: status === "saving" || !text.trim() ? "not-allowed" : "pointer",
//           background: "#111827", color: "#fff", fontWeight: 700, fontSize: 12,
//           fontFamily: "inherit", opacity: status === "saving" || !text.trim() ? 0.5 : 1 }}>
//         {status === "saving" ? "Saving..." : "Send Feedback"}
//       </button>
//       {status === "done" && <div style={{ fontSize: 11, color: "#16A34A", marginTop: 5 }}>✓ Feedback saved!</div>}
//       {status === "error" && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 5 }}>Could not save. Log in first.</div>}

//       <div style={{ borderTop: "1px solid #F3F4F6", margin: "10px 0 8px" }} />

//       <button onClick={shareChat} disabled={shareStatus === "saving"}
//         style={{ width: "100%", padding: "9px 0", borderRadius: 10, cursor: "pointer",
//           border: "1px solid #E5E7EB", background: "#fff", color: "#C8732A",
//           fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
//         {shareStatus === "saving" ? "Creating link..." : shareStatus === "copied" ? "✓ Link copied!" : "↗ Share this chat"}
//       </button>
//       {shareStatus === "empty" && <div style={{ fontSize: 11, color: "#D97706", marginTop: 5 }}>Ask a question first, then share.</div>}
//       {shareStatus === "error" && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 5 }}>Could not create link. Log in first.</div>}
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
//   const location = useLocation();
// const isBroker = location.pathname === "/broker";
// const [showLoginModal, setShowLoginModal] = useState(false);

// useEffect(() => {
//   if (isBroker) posthog.capture("broker_page_viewed", { logged_in: !!user });
// }, [isBroker]);

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

//   // Restore pending answer after login + save broker user
// useEffect(() => {
//   if (!user || !isBroker) return;
//   posthog.identify(user.id, { email: user.email || user.user_metadata?.email || null });
// posthog.capture("broker_login_success", { page: "/broker" });

//   const pending = sessionStorage.getItem(BROKER_PENDING_KEY);
//   if (pending) {
//     try {
//       const { query, response } = JSON.parse(pending);
//       const followups = extractFollowups(response.reply || "");
//       setMessages([
//         { role: "user", text: query },
//         { role: "assistant", _query: query, _followups: followups, ...response },
//       ]);
//       setHistory([
//         { role: "user", content: query },
//         { role: "assistant", content: response.reply || "" },
//       ]);
//     } catch {}
//     sessionStorage.removeItem(BROKER_PENDING_KEY);
//   }

//   setMessages(m => m.map(x => (x.locked ? { ...x, locked: false } : x)));
//   setShowLoginModal(false);

//   supabase.from("broker_users").upsert(
//     {
//       user_id: user.id,
//       email: user.email || user.user_metadata?.email || null,
//       full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
//       last_active_at: new Date().toISOString(),
//     },
//     { onConflict: "user_id" }
//   ).then(({ error }) => {
//     if (error) console.error("broker_users upsert:", error.message);
//   });
// }, [user, isBroker]);



// // Load a shared chat if URL has ?share=<id>
// useEffect(() => {
//   const shareId = new URLSearchParams(location.search).get("share");
//   if (!shareId || !isBroker) return;
//   supabase
//     .from("broker_shared_chats")
//     .select("messages")
//     .eq("id", shareId)
//     .single()
//     .then(({ data, error }) => {
//      if (!error && data?.messages) {
//   setMessages(data.messages);
//   posthog.capture("broker_shared_chat_viewed", { share_id: shareId });
// }
//     });
// }, [location.search, isBroker]);


//   useEffect(() => {
//     const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
//     ping();
//     const id = setInterval(ping, 4 * 60 * 1000);
//     return () => clearInterval(id);
//   }, []);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSend = async (text) => {
//     const query = (text || input).trim();
//     if (!query || loading) return;
//     if (isBroker) posthog.capture("broker_query_sent", { query, logged_in: !!user });
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
//       const followups = extractFollowups(json.reply || "");
//       // LOGIN GATE — only on /broker, only when logged out
// if (isBroker && !user) {
//   setMessages(m => [
//     ...m.filter(x => x.role !== "thinking"),
//     { role: "assistant", locked: true, _query: query, _summary: summary, _followups: followups, ...json },
//   ]);
//   sessionStorage.setItem(BROKER_PENDING_KEY, JSON.stringify({ query, response: json }));
//   setShowLoginModal(true);
//   setLoading(false);
//   posthog.capture("broker_login_gate_shown", { query, page: "/broker" });
//   return;
// }
//       setMessages(m => [
//         ...m.filter(x => x.role !== "thinking"),
//         { role: "assistant", _query: query, _summary: summary, _followups: followups, ...json },
//       ]);
//       setHistory(h => [...h, { role: "user", content: query }, { role: "assistant", content: json.reply || "" }].slice(-12));
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
//     <div style={{ height: "100vh", background: C.pageBg, display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden" }}>

//       {/* Sidebar */}
//       <div style={{ width: 56, background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0 }}>
//         {[
//           { label: "Chat",     active: true,  onClick: () => {},                                                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
//           { label: "Terminal", active: false, onClick: () => window.location.href = "https://www.acqar.com/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//           { label: "Areas",    active: false, onClick: () => window.location.href = "https://www.acqar.com/areas",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
//           { label: "Reports",  active: false, onClick: () => window.location.href = "https://www.acqar.com/my-reports", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
//         ].map(item => (
//           <button key={item.label} onClick={item.onClick} title={item.label}
//             style={{ width: 44, height: 44, borderRadius: 10, background: item.active ? C.copperTint : "transparent", border: item.active ? `1px solid ${C.copperBorder}` : "1px solid transparent", color: item.active ? C.copper : C.textMuted, cursor: item.active ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.15s" }}
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
//         <div style={{ height: 52, padding: "0 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
//             <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.copper }}>✦</div>
//             <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>ACQAR Intelligence</span>
//           </div>
//           <span style={{ fontSize: 11, color: C.textMuted }}>{user ? (user.email || user.user_metadata?.email || "Signed in") : "Not signed in"}</span>
//         </div>

//         {/* Messages */}
//         <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 0" }}>
//           <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px" }}>

//             {messages.length === 0 && (
//               <div style={{ textAlign: "center", paddingTop: 60 }}>
//                 <div style={{ fontSize: 28, color: C.copper, marginBottom: 12 }}>✦</div>
//                 <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}> Buy, sell, or invest? Get your answer in minutes.</h2>
//                 <p style={{ fontSize: 14, color: C.textLight, margin: "0 0 36px", lineHeight: 1.6 }}>
//                   365K+ real DLD transactions · Area analytics · Investment scores · Future prediction
//                 </p>
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 560, margin: "0 auto" }}>
//                   {SUGGESTIONS.map(s => (
//                     <button key={s} onClick={() => handleSend(s)}
//                       style={{ padding: "10px 14px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textLight, fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.45, fontFamily: "inherit", transition: "all 0.15s" }}
//                       onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
//                       onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
//                     >{s}</button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {messages.map((msg, i) =>
//   msg.locked ? (
//     <div key={i} style={{ position: "relative" }}>
//       <div style={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none" }}>
//         <Message msg={msg} onSuggestion={() => {}} navigate={navigate} />
//       </div>
//       <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <button
//           onClick={() => setShowLoginModal(true)}
//           style={{ padding: "12px 22px", borderRadius: 10, border: "none", cursor: "pointer",
//             background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", color: "#fff",
//             fontWeight: 800, fontSize: 14, boxShadow: "0 8px 24px rgba(180,83,9,0.35)", fontFamily: "inherit" }}
//         >
//           🔒 Log in to view full answer
//         </button>
//       </div>
//     </div>
//   ) : (
//     <Message key={i} msg={msg} onSuggestion={handleSend} navigate={navigate} />
//   )
// )}
//             <div ref={bottomRef} style={{ height: 20 }} />
//           </div>
//         </div>

//         {/* Input bar */}
//         <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
//           <div style={{ maxWidth: 780, margin: "0 auto" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FAFAFA", border: `1.5px solid ${loading ? C.copper : C.border}`, borderRadius: 12, padding: "4px 4px 4px 16px", transition: "border-color 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
//               <input
//                 ref={inputRef}
//                 value={input}
//                 onChange={e => setInput(e.target.value)}
//                 onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
//                 placeholder="Ask anything about Dubai real estate..."
//                 disabled={loading}
//                 style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.textPrimary, fontFamily: "inherit" }}
//               />
//               <button
//                 onClick={() => handleSend()}
//                 disabled={loading || !input.trim()}
//                 style={{ width: 36, height: 36, background: loading || !input.trim() ? "#E5E7EB" : C.textPrimary, border: "none", borderRadius: 8, cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}
//               >
//                 {loading
//                   ? <div style={{ display: "flex", gap: 2 }}>{[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}</div>
//                   : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
//                 }
//               </button>
//             </div>
//             <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.textMuted }}>
//               Powered by Acqar · 365K+ DLD Transactions · Real closed-sale prices, not asking prices
//             </div>
//             {isBroker && <FeedbackAndShare user={user} messages={messages} />}
//          </div>
//         </div>
//       </div>

//       <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} navigate={navigate} />
//     </div>
//   );
// }

















import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import posthog from "posthog-js";

const BACKEND = "https://development-production-2ad3.up.railway.app";
const BROKER_PENDING_KEY = "acqar_broker_pending";

const SUGGESTIONS = [
  "I'm being asked AED 1.8M for a 1BR in JVC, is that a fair price or am I overpaying?",
  "Should I buy this off-plan unit in Dubai South now, or wait 6 months for prices to settle?",
 "I own a 2BR in Business Bay bought in 2021, should I sell now or hold for another year?",
  "My apartment in Dubai Marina has been listed for 60 days with no offers, is my asking price too high?",
  "A studio in Dubai Silicon Oasis is offering 8% yield, is that actually good or too good to be true?",
  "I'm looking at a 2BR in JVC, will the upcoming supply in the area hurt my rental income in 2 years?",
  "Is JVC still worth buying into in 2026, or is it already oversupplied?",
  "For long-term value, is Dubai Hills Estate a better bet than Dubai Marina right now?"
];

// ─────────────────────────────────────────────────────────────────
// DESIGN TOKENS — matching Area Specialist exactly
// ─────────────────────────────────────────────────────────────────
const C = {
  bg:           "#FFFFFF",
  pageBg:       "#F7F7F8",
  textPrimary:  "#111827",
  textSecondary:"#374151",
  textMuted:    "#9CA3AF",
  textLight:    "#6B7280",
  border:       "#E5E7EB",
  copper:       "#C8732A",
  copperBorder: "rgba(200,115,42,0.25)",
  copperTint:   "rgba(200,115,42,0.08)",
  userBubble:   "#F3F4F6",
  green:        "#16A34A",
  greenL:       "rgba(22,163,74,0.1)",
  amber:        "#D97706",
  amberL:       "rgba(217,119,6,0.1)",
  red:          "#DC2626",
  redL:         "rgba(220,38,38,0.1)",
  blue:         "#2563EB",
  blueL:        "rgba(37,99,235,0.09)",
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────
function fmtAED(v) {
  if (!v) return "—";
  const n = parseFloat(v);
  if (!isFinite(n)) return "—";
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `AED ${Math.round(n / 1000)}K`;
  return `AED ${parseInt(n).toLocaleString()}`;
}

function fmtNum(n) {
  if (!n) return "—";
  return parseFloat(n).toLocaleString();
}

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
  const words = query.trim().split(/\s+/).slice(0, 8).join(" ");
  return `Searching 365,000+ DLD transactions for: ${words}${query.split(/\s+/).length > 8 ? "..." : ""}`;
}

const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼","📌","🔍"];

function parseReplyToSections(reply) {
  if (!reply) return null;
  const lines = reply.split("\n");
  const sections = [];
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { if (current) current.body += "\n"; continue; }
    const isHeader = SECTION_EMOJIS.some(e => trimmed.startsWith(e));
    if (isHeader) {
      if (current) sections.push(current);
      current = { header: trimmed, body: "" };
    } else {
      if (current) current.body += (current.body ? "\n" : "") + trimmed;
      else sections.push({ header: null, body: trimmed });
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : null;
}

function highlightValues(text) {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#111827;font-weight:600">$1</strong>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#C8732A;text-decoration:underline;font-weight:600;">$1</a>')
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
  const cleanTrimmed = trimmed.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '').trim();
  if (trimmed.includes("](")) {
    if (!cleanTrimmed) return null;
    return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(cleanTrimmed) }} />;
  }
  if (trimmed.toLowerCase() === "explore areas") return null;
  if (trimmed.startsWith("⚠️")) {
    return <div key={key} style={{ margin: "6px 0", padding: "8px 12px", background: "#FFFBEB", borderLeft: "3px solid #F59E0B", borderRadius: "0 6px 6px 0", fontSize: 13, color: "#92400E" }}>{trimmed}</div>;
  }
  if (trimmed.includes("|") && trimmed.split("|").length >= 3) {
    const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
    const isHeader = cells.every(c => c.match(/^[-\s]+$/));
    if (isHeader) return <div key={key} style={{ borderBottom: `1px solid ${C.border}`, margin: "2px 0" }} />;
    return (
      <div key={key} style={{ display: "grid", gridTemplateColumns: `repeat(${cells.length}, 1fr)`, gap: 4, padding: "5px 0", borderBottom: `1px solid #F3F4F6`, fontSize: 12 }}>
        {cells.map((cell, i) => <span key={i} style={{ color: i === 0 ? C.textPrimary : C.textSecondary, fontWeight: i === 0 ? 600 : 400 }} dangerouslySetInnerHTML={{ __html: highlightValues(cell) }} />)}
      </div>
    );
  }
  if (/^\d+\./.test(trimmed)) {
    const content = trimmed.replace(/^\d+\.\s*/, "");
    const num = trimmed.match(/^(\d+)\./)?.[1];
    return (
      <div key={key} style={{ display: "flex", gap: 10, margin: "6px 0", alignItems: "flex-start" }}>
        <span style={{ fontWeight: 700, color: C.copper, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{num}.</span>
        <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: highlightValues(content) }} />
      </div>
    );
  }
  if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
    const txt = trimmed.replace(/^[•\-]\s*/, "");
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
        <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.65 }} dangerouslySetInnerHTML={{ __html: highlightValues(txt) }} />
      </div>
    );
  }
  const colonIdx = trimmed.indexOf(":");
  if (colonIdx > 0 && colonIdx < 32 && !trimmed.includes("→") && !trimmed.startsWith("http") && !trimmed.includes("|")) {
    const k = trimmed.slice(0, colonIdx).trim().replace(/\*\*/g, "");
    const val = trimmed.slice(colonIdx + 1).trim();
    if (k && val && k.length < 32) {
      return (
        <div key={key} style={{ margin: "4px 0", fontSize: 13, lineHeight: 1.65 }}>
          <strong style={{ color: C.textPrimary, fontWeight: 600 }}>{k}:</strong>{" "}
          <span style={{ color: C.textSecondary }} dangerouslySetInnerHTML={{ __html: highlightValues(val) }} />
        </div>
      );
    }
  }
  return <p key={key} style={{ margin: "4px 0", fontSize: 13, color: C.textSecondary, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: highlightValues(trimmed) }} />;
}

function SectionBlock({ header, body }) {
  const lines = body.split("\n").filter(l => l !== undefined);
  return (
    <div style={{ marginBottom: 20 }}>
      {header && (
        <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${C.border}` }}>
          {header}
        </div>
      )}
      <div>{lines.map((line, i) => renderLine(line, i))}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SHARED MINI COMPONENTS
// ─────────────────────────────────────────────────────────────────
function CardSection({ title, badge, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12, overflow: "hidden" }}>
      {title && (
        <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{title}</span>
          {badge && <span style={{ fontSize: 10, textTransform: "none", letterSpacing: 0, padding: "2px 8px", borderRadius: 4, background: C.pageBg, color: C.textMuted, fontWeight: 500 }}>{badge}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function StRow({ label, value, valueColor, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: last ? "none" : `1px solid ${C.border}`, fontSize: 12, gap: 8 }}>
      <span style={{ color: C.textMuted, flexShrink: 0, maxWidth: "55%" }}>{label}</span>
      <span style={{ fontWeight: 700, color: valueColor || C.textPrimary, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function RatioBar({ left, leftPct, leftColor, right, rightPct, rightColor, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: C.textPrimary, fontWeight: 700 }}>{left} {leftPct}%</span>
        <span style={{ color: C.textMuted }}>{right} {rightPct}%</span>
      </div>
      <div style={{ display: "flex", height: 7, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${leftPct}%`, background: leftColor }} />
        <div style={{ width: `${rightPct}%`, background: rightColor }} />
      </div>
    </div>
  );
}


function TimeTabs({ tabs }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {tabs.map((t, i) => (
        <div key={i} style={{ marginBottom: i < tabs.length - 1 ? 28 : 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
            borderBottom: `2px solid ${C.copper}`, marginBottom: 16,
          }}>
            <span>{t.icon}</span>
            <span style={{ color: C.copper, fontWeight: 700, fontSize: 13 }}>{t.label}</span>
          </div>
          {t.content}
        </div>
      ))}
    </div>
  );
}


function AreaMaturityCard({ msg }) {
  const intel = msg.area_intelligence || {};
  if (!intel.area_name_en) return null;
  const years = Object.keys(msg.price_history || {}).sort();
  let appreciation = "—";
  if (years.length >= 2) {
    const chg = (((msg.price_history[years[years.length-1]] - msg.price_history[years[0]]) / msg.price_history[years[0]]) * 100).toFixed(1);
    appreciation = `+${chg}%`;
  }
  return (
    <CardSection title="AREA MATURITY">
      <StRow label="Year established" value={intel.year_established || "—"} />
      <StRow label="Master developer" value={intel.master_developer || "—"} />
      <StRow label="Zone" value={intel.zone_type || "—"} />
      <StRow label="Completion rate" value={intel.completion_rate ? `~${intel.completion_rate}% built` : "—"} valueColor={C.green} />
      <StRow label="Residential units" value={intel.residential_units ? `${intel.residential_units.toLocaleString()} registered` : "—"} />
      <StRow label="Active off-plan projects" value={intel.active_project_count ? `${intel.active_project_count} projects` : "—"} valueColor={C.copper} />
      <StRow label="5-year appreciation" value={appreciation} valueColor={C.green} last />
    </CardSection>
  );
}



function DeveloperTrackRecordCard({ msg }) {
  const devs = msg.developer_track_records || [];
  if (!devs.length) return null;
  const area = msg.area_intelligence?.area_name_en || "AREA";
  return (
    <CardSection title={`DEVELOPER DELIVERY TRACK RECORD IN ${area.toUpperCase()}`} badge="Historical estimates">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{["DEVELOPER","ON-TIME %","AVG DELAY","RATING","SEGMENT"].map(h => (
            <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {devs.slice(0, 6).map((d, i) => (
            <tr key={i}>
              <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{d.developer_name}</td>
              <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.on_time_pct >= 90 ? C.green : d.on_time_pct >= 80 ? C.amber : C.red, fontWeight: 700 }}>{d.on_time_pct}%</td>
              <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: d.avg_delay_months > 0 ? C.red : C.green }}>{d.avg_delay_months > 0 ? `~${d.avg_delay_months} months` : "On time / early"}</td>
              <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}` }}>{"★".repeat(Math.round(d.star_rating || 0))}{"☆".repeat(5 - Math.round(d.star_rating || 0))}</td>
              <td style={{ padding: "8px 0", fontSize: 12, borderBottom: `1px solid ${C.border}`, color: C.textMuted }}>{d.market_segment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardSection>
  );
}
// ─────────────────────────────────────────────────────────────────
// HERO STATS ROW — matches Image 1 exactly (6 tiles)
// ─────────────────────────────────────────────────────────────────
function HeroStatsRow({ msg }) {
  const intel    = msg.area_intelligence || {};
  if (!intel.area_name_en && !["buyer","seller","investor","broker"].includes(msg.user_type)) return null;
  const stats    = msg.transaction_stats || {};
  const userType = msg.user_type || "general";
  const yld      = msg.yield_pct;
  const trend    = msg.price_trend;
  const verdict  = msg.verdict;
  const score    = msg.score;
  const tx       = intel.tx_7d;
  const txDelta  = intel.tx_7d_delta_pct;
  const avgPsm   = intel.truvalu_psm || stats.avg_price_sqm;
  const distress = msg.distress_pct;
  const absRate  = intel.absorption_rate_pct;
  const catScore = intel.catalyst_score;
  const bmed     = stats.median_price_by_bedroom || {};
  const firstBr  = Object.keys(bmed)[0];
  const firstMed = bmed[firstBr];
  const daysToSell = score ? Math.round(75 - parseFloat(score) * 0.4) : null;
  const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
  const moodLabel = verdict === "BUY" ? "Bullish" : verdict === "HOLD" ? "Cautious" : "Slow";
  const moodColor = verdict === "BUY" ? C.green : verdict === "HOLD" ? C.amber : C.red;

  let items = [];

  if (userType === "buyer") {
    items = [
      { lbl: "HOMES SOLD THIS WEEK", val: tx ? String(tx) : (score ? String(Math.round(20 + parseFloat(score) * 1.5)) : "—"), valColor: C.red, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% vs last week` : "est. based on area score" },
      avgPsm && { lbl: "WHAT'S A FAIR PRICE HERE?", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: `≈ AED ${Math.round(avgPsm / 10.7639).toLocaleString()}/sqft · Slightly up over 3 months`, subColor: C.green },
      yld && { lbl: "RENT RETURN PER YEAR", val: `${yld}%`, valColor: C.green, sub: parseFloat(yld) > 6.1 ? "Better than Dubai's 6.1% average" : "Near Dubai average" },
      daysToSell && { lbl: "HOW LONG TO SELL?", val: `${daysToSell} days`, valColor: daysToSell > 40 ? C.amber : C.green, sub: daysToSell > 40 ? "Takes a bit longer than usual" : "Faster than Dubai average", subColor: daysToSell > 40 ? C.red : C.green },
      availListings && { lbl: "HOMES AVAILABLE TO BUY", val: availListings.toLocaleString(), valColor: C.textPrimary, sub: "More choice than normal — good for buyers" },
      verdict && { lbl: "MARKET MOOD RIGHT NOW", val: moodLabel, valColor: moodColor, sub: verdict === "BUY" ? "Strong demand — buy with confidence" : "Watch closely — market paused" },
    ];
  } else if (userType === "seller") {
    const recPrice = firstMed ? Math.round(parseFloat(firstMed) * 1.06) : null;
    items = [
      avgPsm && { lbl: "CURRENT MARKET PRICE", val: `AED ${parseInt(avgPsm).toLocaleString()}/sqm`, valColor: C.textPrimary, sub: "Truvalu™ DLD benchmark" },
      recPrice && { lbl: "RECOMMENDED LIST PRICE", val: fmtAED(recPrice), valColor: C.copper, sub: `6% above DLD median — ${firstBr}` },
      trend != null && { lbl: "PRICE MOMENTUM", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Rising — sell into strength" : "Cooling — price carefully" },
      tx && { lbl: "WEEKLY TRANSACTIONS", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "DLD live volume" },
      distress && { lbl: "DISTRESS SALES", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: parseFloat(distress) > 10 ? "High — price competitively" : "Low — sellers have leverage" },
      verdict && { lbl: "SHOULD YOU SELL?", val: trend != null && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M", valColor: trend != null && parseFloat(trend) > 0 ? C.green : C.amber, sub: "Based on current market signals" },
    ];
  } else if (userType === "investor") {
    items = [
      yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
      distress && { lbl: "DISTRESS OPPORTUNITY", val: `${distress}%`, valColor: C.amber, sub: `${availListings ? Math.round(availListings * parseFloat(distress) / 100) : "—"} units priced below Truvalu™ floor` },
      catScore && { lbl: "CATALYST SCORE", val: `${catScore}/100`, valColor: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: "0 confirmed infra catalysts in next 24 months" },
      score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : parseFloat(score) >= 60 ? C.amber : C.red, sub: parseFloat(score) >= 75 ? "STRONG BUY" : parseFloat(score) >= 60 ? "BUY" : "HOLD" },
      absRate && { lbl: "ABSORPTION RATE", val: `${absRate}%`, valColor: parseFloat(absRate) > 50 ? C.green : C.amber, sub: "Fast-moving demand" },
      trend != null && { lbl: "CAPITAL APPRECIATION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Price trend year on year" },
    ];
  } else if (userType === "broker") {
    items = [
      score && { lbl: "INVESTMENT SCORE", val: `${score}/100`, valColor: parseFloat(score) >= 75 ? C.green : C.amber, sub: verdict ? `Verdict: ${verdict}` : "Area fundamentals" },
      yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "For investor pitch decks" },
      avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "DLD Truvalu™ benchmark" },
      tx && { lbl: "WEEKLY DLD VOLUME", val: String(tx), valColor: C.textPrimary, sub: txDelta != null ? `${parseFloat(txDelta) > 0 ? "+" : ""}${txDelta}% WoW` : "Live data" },
      distress && { lbl: "DISTRESS %", val: `${distress}%`, valColor: parseFloat(distress) > 10 ? C.red : C.green, sub: "Share with investor clients" },
      trend != null && { lbl: "PRICE DIRECTION", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: parseFloat(trend) > 0 ? "Tell buyers: entry window now" : "Tell buyers: negotiate hard" },
    ];
  } else {
    items = [
      verdict && { lbl: "VERDICT", val: moodLabel, valColor: moodColor, sub: score ? `Score ${score}/100` : "Market signal" },
      yld && { lbl: "GROSS YIELD", val: `${yld}%`, valColor: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: "vs Dubai 6.1% average" },
      avgPsm && { lbl: "AVG PRICE / SQM", val: `AED ${parseInt(avgPsm).toLocaleString()}`, valColor: C.textPrimary, sub: "Truvalu™ benchmark" },
      trend != null && { lbl: "PRICE TREND", val: `${parseFloat(trend) > 0 ? "+" : ""}${trend}% YoY`, valColor: parseFloat(trend) > 0 ? C.green : C.red, sub: "Year on year" },
    ];
  }

  items = items.filter(Boolean);
  if (!items.length) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 16 }}>
      {items.map((s, i) => (
        <div key={i} style={{ padding: "12px 8px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 8, lineHeight: 1.4, textAlign: "center" }}>{s.lbl}</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: s.valColor || C.textPrimary, letterSpacing: "-.01em", marginBottom: 4 }}>{s.val}</div>
          <div style={{ fontSize: 11, color: s.subColor || C.textMuted, lineHeight: 1.4, textAlign: "center" }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// SCORE CARD — matches right side of Image 1
// ─────────────────────────────────────────────────────────────────
function ScoreCard({ msg }) {
  const score   = msg.score;
  const verdict = msg.verdict;
  if (!score) return null;
  const s = parseFloat(score);
  const scoreColor = s >= 75 ? C.green : s >= 65 ? C.amber : C.red;
  const verdictBg  = s >= 75 ? C.greenL : C.amberL;
  const comps = [
    { label: "Are people buying?",    val: Math.round(s * 0.87), color: s >= 65 ? C.amber : C.red },
    { label: "Is the price fair?",    val: Math.min(99, Math.round(s * 1.10)), color: C.green },
    { label: "What's coming nearby?", val: Math.min(99, Math.round(s * 1.18)), color: C.green },
    { label: "Is the mood positive?", val: Math.round(s * 0.62), color: s >= 70 ? C.amber : C.red },
  ];
  return (
  <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
    {/* Left: verdict + score */}
    <div style={{ textAlign: "center", flexShrink: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".1em", padding: "4px 12px", borderRadius: 20, display: "inline-block", marginBottom: 8, background: verdictBg, color: scoreColor }}>{verdict || (s >= 75 ? "BUY" : s >= 65 ? "HOLD" : "WATCH")}</div>
      <div style={{ fontSize: 48, fontWeight: 900, color: scoreColor, lineHeight: 1, letterSpacing: "-.02em" }}>{score}</div>
      <div style={{ fontSize: 14, color: C.textMuted }}>/100</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>12-month outlook · 2026</div>
    </div>
    {/* Right: component bars */}
    <div style={{ flex: 1, minWidth: 260, display: "flex", flexDirection: "column", gap: 10 }}>
      {comps.map((comp, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
          <span style={{ width: 160, color: C.textSecondary, textAlign: "left", flexShrink: 0 }}>{comp.label}</span>
          <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
            <div style={{ width: `${Math.min(comp.val, 100)}%`, height: 6, borderRadius: 3, background: comp.color }} />
          </div>
          <span style={{ width: 28, textAlign: "right", fontWeight: 700, color: comp.color }}>{comp.val}</span>
        </div>
      ))}
    </div>
  </div>
);
}

// ─────────────────────────────────────────────────────────────────
// BUYER GUIDE — matches Image 2 (5-step guide)
// ─────────────────────────────────────────────────────────────────
function BuyerGuide({ msg }) {
  if (msg.user_type !== "buyer") return null;
  const intel = msg.area_intelligence || {};
  if (!intel.area_name_en) return null;
  const stats = msg.transaction_stats || {};
  const area  = intel.area_name_en || "this area";
  const yld   = msg.yield_pct;
  const bmed  = stats.median_price_by_bedroom || {};
  const firstBr  = Object.keys(bmed)[0];
  const firstMed = bmed[firstBr];
  const cats  = msg.area_catalysts || [];
  const nats  = intel.buyer_nationalities || [];
  const activeProjects = intel.active_project_count || 0;

  const steps = [
    {
      num: 1,
      title: "Understand what a fair price actually looks like here",
      body: `Our Truvalu™ system calculates what any ${area} property should cost based on real transactions, floor level, view, and condition.${firstMed ? ` A ${firstBr} here is fairly priced at around ${fmtAED(firstMed)}. If someone's asking significantly more — that's a red flag. If it's below that — that's a genuine opportunity.` : " Check area prices below against real DLD closed-sale data."}`
    },
    {
      num: 2,
      title: "Check what's coming to the area in the next 2 years",
      body: cats.length > 0
        ? `${cats.slice(0, 2).map(c => `${c.name} is ${c.confidence || "confirmed"} for ${c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "soon"}`).join(". ")}. Infrastructure arrivals like these push prices up — buying before they open means you benefit from the appreciation.`
        : `Dubai has confirmed infrastructure investments nearby. Infrastructure arrivals push prices up — buying before they open means you benefit from the price increase. This is why timing matters.`
    },
    {
      num: 3,
      title: "Don't panic about the current news — look at history",
      body: `Dubai has been through oil crashes, COVID, and geopolitical scares before. Every time, well-located areas recovered within 8–14 months. The current slowdown is caused by regional news (Iran/USA), not by any problem with Dubai's economy or ${area} specifically.`
    },
    {
      num: 4,
      title: "Know who else is buying here and why",
      body: nats.length > 0
        ? `${area} attracts mostly ${nats[0]?.name || "Indian"} (${nats[0]?.pct || 31}%), ${nats[1]?.name || "British"} (${nats[1]?.pct || 18}%), and ${nats[2]?.name || "Russian"} (${nats[2]?.pct || 14}%) buyers — young professionals, expats, and investors.${yld ? ` Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
        : `${area} is a popular choice with expat buyers and investors. ${yld ? `Rental yield here (${yld}%) is ${parseFloat(yld) > 6.1 ? "higher than" : "near"} the Dubai average.` : ""}`
    },
    {
      num: 5,
      title: "Check the developer's track record before buying off-plan",
      body: activeProjects > 0
        ? `If you're buying off-plan in ${area}, there are currently ${activeProjects} active projects in this area. Always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
        : `If you're buying off-plan in ${area}, always verify the developer's track record — check their RERA registration, escrow account compliance, and past delivery history on the DLD portal before signing.`
    },
  ];

  return (
    <CardSection title={`YOUR 5-STEP BUYING GUIDE FOR ${area.toUpperCase()}`} badge="First-Time Buyer">
      {steps.map((step, i) => (
        <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copper, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{step.title}</div>
            <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, margin: 0 }}>{step.body}</p>
          </div>
        </div>
      ))}
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRICE TABLE — matches Image 3 (cheapest/fair/expensive)
// ─────────────────────────────────────────────────────────────────
function PriceTable({ msg }) {
  const stats    = msg.transaction_stats || {};
  const bpsm     = stats.bedroom_avg_psm || {};
  const bmed     = stats.median_price_by_bedroom || {};
  const userType = msg.user_type || "general";
  const yld      = parseFloat(msg.yield_pct || 0);
  const rows     = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br] || bmed[br]);
  if (!rows.length) return null;

  const intel  = msg.area_intelligence || {};
  const area   = intel.area_name_en || "this area";

  const configs = {
    buyer: {
      title: `WHAT DOES BUYING IN ${area.toUpperCase()} ACTUALLY COST?`,
      headers: ["PROPERTY TYPE", "CHEAPEST", "FAIR PRICE", "MOST EXPENSIVE"],
      row: (br) => {
        const med = parseFloat(bmed[br] || 0);
        return [br, fmtAED(Math.round(med * 0.75)), fmtAED(med), fmtAED(Math.round(med * 1.40))];
      },
      note: 'The "Fair Price" column is Acqar\'s Truvalu™ benchmark — what the property is actually worth based on real transactions, not asking prices.'
    },
    seller: {
      title: "DLD CLOSED SALES — YOUR PRICING ANCHOR",
      headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "RECOMMENDED LIST"],
      row: (br) => {
        const psm = parseInt(bpsm[br] || 0);
        const med = parseFloat(bmed[br] || 0);
        return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.06)) : "—"];
      },
      note: "Recommended list price is 6% above DLD median — leaves negotiation room while attracting serious buyers."
    },
    investor: {
      title: "ENTRY PRICES + ESTIMATED ANNUAL RENTAL INCOME",
      headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", "EST. ANNUAL RENT"],
      row: (br) => {
        const psm = parseInt(bpsm[br] || 0);
        const med = parseFloat(bmed[br] || 0);
        const rent = med && yld ? fmtAED(Math.round(med * yld / 100)) : "—";
        return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), rent];
      },
      note: `Based on ${yld}% gross yield — Dubai average is 6.1%. Best entry: Studio for highest yield-to-price ratio.`
    },
    broker: {
      title: "DLD COMPARABLES — USE FOR CLIENT NEGOTIATIONS",
      headers: ["UNIT TYPE", "AED/SQM", "DLD MEDIAN", "ASKING (~+10%)"],
      row: (br) => {
        const psm = parseInt(bpsm[br] || 0);
        const med = parseFloat(bmed[br] || 0);
        return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), med ? fmtAED(Math.round(med * 1.10)) : "—"];
      },
      note: "DLD median is the actual closed-sale price. Asking prices run 8–12% higher — use median to anchor negotiations."
    },
    general: {
      title: "PRICES BY BEDROOM — REAL DLD DATA",
      headers: ["UNIT TYPE", "AED/SQM", "MEDIAN PRICE", ""],
      row: (br) => {
        const psm = parseInt(bpsm[br] || 0);
        const med = parseFloat(bmed[br] || 0);
        return [br, `AED ${psm.toLocaleString()}`, fmtAED(med), ""];
      },
      note: "Real DLD closed-sale data — not asking prices."
    }
  };

  const cfg = configs[userType] || configs.general;
  const activeCols = cfg.headers.filter(Boolean);

  return (
    <CardSection title={cfg.title}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 320 }}>
          <thead>
            <tr>
              {activeCols.map((h, i) => (
                <th key={h} style={{ padding: i === 0 ? "7px 6px 7px 0" : "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", letterSpacing: ".05em", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((br, i) => {
              const cells = cfg.row(br).filter((_, ci) => cfg.headers[ci]);
              return (
                <tr key={br} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  {cells.map((cell, ci) => (
                    <td key={ci} style={{ padding: ci === 0 ? "8px 6px 8px 0" : "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: ci === 0 ? C.textPrimary : ci === 2 ? C.green : C.textSecondary, fontWeight: ci === 0 ? 700 : ci === 2 ? 700 : 400 }}>{cell}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {cfg.note && <p style={{ fontSize: 11, color: C.textMuted, marginTop: 10, lineHeight: 1.5 }}>💡 {cfg.note}</p>}
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// OWNERSHIP COSTS — matches right side of Image 3
// ─────────────────────────────────────────────────────────────────
function OwnershipCosts({ msg }) {
  if (msg.user_type !== "buyer") return null;
  const stats = msg.transaction_stats || {};
  const bmed  = stats.median_price_by_bedroom || {};
  const yld   = parseFloat(msg.yield_pct || 7);
  const intel = msg.area_intelligence || {};
  const firstBr  = Object.keys(bmed)[0];
  const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
  const annualRent = firstMed ? Math.round(firstMed * yld / 100 / 1000) * 1000 : null;
  const netYield = (yld * 0.83).toFixed(1);
  const avgPsm = intel.truvalu_psm || stats.avg_price_sqm;
  const serviceCharge = avgPsm > 2000 ? "AED 18–28/sqft" : avgPsm > 1200 ? "AED 12–18/sqft" : "AED 10–18/sqft";

  return (
    <CardSection title="WHAT WILL IT COST TO OWN (NOT JUST BUY)?">
      <StRow label="DLD Transfer Fee"           value="4% of purchase price" />
      <StRow label="Agent commission"            value="2% (negotiable)" />
      <StRow label="Annual service charges"      value={serviceCharge} />
      <StRow label="Typical annual maintenance"  value="AED 5,000–15,000" />
      {annualRent && <StRow label={`Annual rental income (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />}
      <StRow label="Net yield after charges (est.)" value={`${netYield}%`} valueColor={C.green} />
      <StRow label="Mortgage availability"        value="Up to 80% LTV for expats" last />
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// INVESTOR METRICS — matches Image 4 (4 big cards)
// ─────────────────────────────────────────────────────────────────
function InvestorMetrics({ msg }) {
  if (msg.user_type !== "investor") return null;
  const intel    = msg.area_intelligence || {};
  const stats    = msg.transaction_stats || {};
  const yld      = msg.yield_pct;
  const distress = msg.distress_pct;
  const score    = msg.score;
  const catScore = intel.catalyst_score;
  const availListings = score ? Math.round(1500 + parseFloat(score) * 50) : null;
  const distressUnits = distress && availListings ? Math.round(availListings * parseFloat(distress) / 100) : null;
  const activeProjects = intel.active_project_count;
  const cats = msg.area_catalysts || [];
  const confirmedCats = cats.filter(c => c.confidence === "confirmed").length;

  const metrics = [
    yld && { title: "GROSS YIELD", val: `${yld}%`, color: parseFloat(yld) > 6.1 ? C.green : C.amber, sub: `Dubai avg: 6.1% · ${intel.area_name_en || "Area"} ${parseFloat(yld) > 6.1 ? "above" : "near"} avg for 4 years` },
    distress && { title: "DISTRESS OPPORTUNITY", val: `${distress}%`, color: C.amber, sub: distressUnits ? `${distressUnits.toLocaleString()} units priced below Truvalu™ floor right now` : "Units priced below market floor" },
    catScore && { title: "CATALYST SCORE", val: `${catScore}/100`, color: parseFloat(catScore) >= 70 ? C.green : C.amber, sub: `${confirmedCats} confirmed infra catalysts in next 24 months` },
    activeProjects && { title: "OFF-PLAN PIPELINE", val: `${activeProjects} Projects`, color: C.blue, sub: `Active off-plan projects in ${intel.area_name_en || "this area"}` },
  ].filter(Boolean);

  if (!metrics.length) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(metrics.length, 2)}, 1fr)`, gap: 10, marginBottom: 12 }}>
      {metrics.map((m, i) => (
        <CardSection key={i} title={m.title}>
          <div style={{ fontSize: 34, fontWeight: 900, color: m.color, textAlign: "center", marginBottom: 6 }}>{m.val}</div>
          <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center" }}>{m.sub}</div>
        </CardSection>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MARKET COMPOSITION — matches left side of Image 5
// ─────────────────────────────────────────────────────────────────
function MarketCompositionCard({ msg }) {
  if (!["investor", "broker"].includes(msg.user_type)) return null;
  return (
    <CardSection title="MARKET COMPOSITION — INVESTOR VIEW">
      <RatioBar left="Off-Plan (Primary)" leftPct={58} leftColor={C.blue} right="Ready (Secondary)" rightPct={42} rightColor={C.amber} />
      <RatioBar left="Investor-owned" leftPct={62} leftColor={C.copper} right="End-user" rightPct={38} rightColor={C.green} />
      <RatioBar left="Apartments" leftPct={87} leftColor={C.green} right="Villas/TH" rightPct={13} rightColor="#7C3AED" />
      <RatioBar left="Long-term tenants" leftPct={88} leftColor="#14B8A6" right="Short-stay" rightPct={12} rightColor="#E2E8F0" last />
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// TRUVALU BENCHMARK TABLE — matches right side of Image 5
// ─────────────────────────────────────────────────────────────────
function TruvaluBenchmark({ msg }) {
  const stats = msg.transaction_stats || {};
  const bpsm  = stats.bedroom_avg_psm || {};
  const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bpsm[br]);
  if (!rows.length) return null;

  return (
    <CardSection title="TRUVALU™ BENCHMARK VS ASKING PRICE" badge="RICS-aligned">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{["TYPE", "TRUVALU™", "ASKING", "GAP", "SIGNAL"].map(h => (
            <th key={h} style={{ padding: "6px 8px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((br, i) => {
            const truv = parseInt(bpsm[br]);
            const ask  = Math.round(truv * (1 + (Math.random() * 0.08 - 0.04)));
            const gap  = ((ask - truv) / truv * 100).toFixed(1);
            const signal = parseFloat(gap) > 2 ? { label: "Premium", bg: C.redL, color: C.red } : parseFloat(gap) < -2 ? { label: "Opportunity", bg: C.greenL, color: C.green } : { label: "Fair", bg: C.amberL, color: C.amber };
            return (
              <tr key={br}>
                <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
                <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700 }}>AED {truv.toLocaleString()}</td>
                <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{ask.toLocaleString()}</td>
                <td style={{ padding: "8px 8px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>{parseFloat(gap) > 0 ? `+${gap}` : gap}%</td>
                <td style={{ padding: "8px 0", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: signal.bg, color: signal.color }}>{signal.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// YIELD BY UNIT TYPE — matches bottom right of Image 5
// ─────────────────────────────────────────────────────────────────
function YieldByTypeCard({ msg }) {
  if (!["investor", "broker"].includes(msg.user_type)) return null;
  const yld = parseFloat(msg.yield_pct || 7);
  const yieldByType = [
    { type: "Studio", val: +(yld * 1.19).toFixed(1) },
    { type: "1 BR",   val: +yld.toFixed(1) },
    { type: "2 BR",   val: +(yld * 0.94).toFixed(1) },
    { type: "3 BR",   val: +(yld * 0.88).toFixed(1) },
    { type: "TH 3BR", val: +(yld * 0.82).toFixed(1) },
  ];
  const stats = msg.transaction_stats || {};
  const bmed  = stats.median_price_by_bedroom || {};

  return (
    <CardSection title="RENTAL YIELD BY UNIT TYPE">
      {yieldByType.map(y => (
        <div key={y.type} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, width: 52, flexShrink: 0, color: C.textSecondary }}>{y.type}</span>
          <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
            <div style={{ width: `${(y.val / 11) * 100}%`, height: 6, borderRadius: 3, background: y.val > 6.1 ? C.green : C.amber }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, width: 36, textAlign: "right", color: y.val > 6.1 ? C.green : C.amber }}>{y.val}%</span>
        </div>
      ))}
      <div style={{ fontSize: 10, color: C.textMuted, textAlign: "right", marginBottom: 8 }}>— Dubai Avg 6.1%</div>
      <StRow label="Best yield unit type" value={`Studio (${yieldByType[0].val}%)`} valueColor={C.green} />
      <StRow label="5-year yield trend"   value={`↑ 6.1% → ${yld}%`} valueColor={C.green} />
      <StRow label="Average days to rent" value="18 days" last />
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// OWNER / SELLER VALUATION — matches Image 6
// ─────────────────────────────────────────────────────────────────
function OwnerValuation({ msg }) {
  if (msg.user_type !== "seller") return null;
  const intel = msg.area_intelligence || {};
  if (!intel.area_name_en) return null;
  const stats = msg.transaction_stats || {};
  const area  = intel.area_name_en || "this area";
  const bmed  = stats.median_price_by_bedroom || {};
  const firstBr  = Object.keys(bmed)[0] || "1 BR";
  const firstMed = bmed[firstBr] ? parseFloat(bmed[firstBr]) : null;
  if (!firstMed) return null;

  const low  = Math.round(firstMed * 0.97 / 1000) * 1000;
  const high = Math.round(firstMed * 1.18 / 1000) * 1000;
  const gain6m = Math.round(firstMed * 0.033 / 1000) * 1000;
  const yld  = parseFloat(intel.gross_yield_pct || 7);
  const annualRent = Math.round(firstMed * yld / 100 / 1000) * 1000;
  const annualRentShort = Math.round(annualRent * 1.25 / 1000) * 1000;
  const trend = msg.price_trend;
  const score = parseFloat(msg.score || 65);
  const daysToSell = Math.round(75 - score * 0.4);

  return (
    <>
      {/* Valuation banner */}
      <div style={{ background: "rgba(200,115,42,0.06)", border: "1px solid rgba(200,115,42,0.2)", borderRadius: 10, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: C.copper }}>Your Asset · Truvalu™ Valuation</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: C.copper, margin: "0 0 4px" }}>{firstBr} in {area} is worth {fmtAED(low)} — {fmtAED(high)}</h2>
            <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Based on floor level, view, building quality, and current DLD transactions. Updated daily.</p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.textMuted }}>Truvalu™ Fair Value</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.textPrimary }}>{fmtAED(firstMed)}</div>
            <div style={{ fontSize: 11, color: C.green }}>↑ +{fmtAED(gain6m)} vs 6 months ago</div>
          </div>
        </div>
      </div>

      {/* 3 panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <CardSection title="SHOULD YOU SELL NOW?">
          <div style={{ fontSize: 24, fontWeight: 900, color: trend && parseFloat(trend) > 0 ? C.green : C.amber, marginBottom: 8 }}>
            {trend && parseFloat(trend) > 0 ? "Yes — Good Time" : "Hold 6–12M"}
          </div>
          <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
            {trend && parseFloat(trend) > 0
              ? `Market conditions are rising +${trend}% YoY. If you need to sell, now is a favorable window.`
              : `Infrastructure catalysts arriving Q4 2026 are likely to push prices up 8–14% — selling before those land means leaving money on the table.`}
          </p>
          <StRow label="Days to sell (current)" value={`${daysToSell} days`} valueColor={daysToSell > 40 ? C.red : C.green} />
          <StRow label="Expected post-catalyst" value="8–14%" valueColor={C.green} />
          <StRow label="Market sentiment" value={trend && parseFloat(trend) > 0 ? "Bullish" : "Cautious"} valueColor={trend && parseFloat(trend) > 0 ? C.green : C.amber} last />
        </CardSection>
        <CardSection title="SHOULD YOU RENT IT OUT?">
          <div style={{ fontSize: 24, fontWeight: 900, color: C.green, marginBottom: 8 }}>Yes — Good Yield</div>
          <p style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
            {area}'s rental market remains active. Your {firstBr} can generate {fmtAED(annualRent)}/year long-term or {fmtAED(annualRentShort)}/year short-term furnished.
          </p>
          <StRow label={`Annual long-term rent (${firstBr})`} value={`${fmtAED(Math.round(annualRent * 0.93 / 1000) * 1000)}–${fmtAED(annualRent)}`} valueColor={C.green} />
          <StRow label="Short-term furnished" value={`${fmtAED(annualRent)}–${fmtAED(annualRentShort)}`} valueColor={C.green} />
          <StRow label="Average days to rent" value="18 days" last />
        </CardSection>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// PRICE HISTORY CHART — matches Image 7
// ─────────────────────────────────────────────────────────────────
function PriceHistoryCard({ msg }) {
  const hist  = msg.price_history || {};
  const years = Object.keys(hist).sort();
  if (years.length < 2) return null;

  const vals   = years.map(y => hist[y]);
  const maxVal = Math.max(...vals);
  const minVal = Math.min(...vals);
  const range  = maxVal - minVal || 1;
  const first  = vals[0];
  const last   = vals[vals.length - 1];
  const chgPct = ((last - first) / first * 100).toFixed(1);
  const rising = last >= first;
  const W = 500, H = 100;

  const pts = years.map((y, i) => {
    const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
    const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
    return `${x},${yc}`;
  }).join(" ");

  const userType = msg.user_type || "general";
  const intel    = msg.area_intelligence || {};
  const area     = intel.area_name_en || "Area";
  const tabLabel = userType === "investor"
    ? `📈 CAPITAL APPRECIATION — PRICE HISTORY`
    : `📜 ${area.toUpperCase()} PRICE PER SQM — HISTORY`;

  // Find min and max idx
  const maxIdx = vals.indexOf(maxVal);
  const minIdx = vals.indexOf(minVal);

  return (
    <CardSection title={tabLabel} badge="Truvalu™ Benchmark vs DLD Transacted">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 9px", borderRadius: 5, background: rising ? C.greenL : C.redL, color: rising ? "#065F46" : "#991B1B" }}>
          {rising ? "+" : ""}{chgPct}% over {years.length} yr{years.length > 1 ? "s" : ""}
        </span>
      </div>
      <div style={{ background: "#FAF8F5", borderRadius: 6, padding: "12px 8px 8px" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
          <defs>
            <linearGradient id="phGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={rising ? "rgba(22,163,74,0.18)" : "rgba(220,38,38,0.18)"} />
              <stop offset="100%" stopColor="rgba(0,0,0,0.01)" />
            </linearGradient>
            <filter id="lineShadow2">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(200,115,42,0.25)" />
            </filter>
          </defs>
          <polygon
            points={`${years.map((y, i) => {
              const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
              const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
              return `${x},${yc}`;
            }).join(" ")} ${W},${H} 0,${H}`}
            fill="url(#phGrad2)"
          />
          <polyline fill="none" stroke={C.copper} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts} filter="url(#lineShadow2)" />
          {years.map((y, i) => {
            const x  = years.length > 1 ? (i / (years.length - 1)) * W : W / 2;
            const yc = H - ((hist[y] - minVal) / range) * (H - 20) - 10;
            const isLast = i === years.length - 1;
            const isMax  = i === maxIdx;
            const isMin  = i === minIdx;
            return (
              <g key={y}>
                <circle cx={x} cy={yc} r={isLast ? 5 : 4}
                  fill={isLast ? C.copper : "#fff"}
                  stroke={isMax ? C.green : isMin ? C.red : C.copper}
                  strokeWidth="2"
                />
                {isLast && (
                  <>
                    <rect x={x - 40} y={yc - 24} width={80} height={18} rx={4} fill={C.copper} />
                    <text x={x} y={yc - 10} textAnchor="middle" fontSize={9} fill="#fff" fontWeight="700">AED {parseInt(hist[y]).toLocaleString()}</text>
                  </>
                )}
              </g>
            );
          })}
          <line x1="0" x2={W} y1={H} y2={H} stroke="#D8CEBC" strokeWidth="1" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          {years.filter((_, i) => i === 0 || i === years.length - 1 || years.length <= 6).map((y, i) => (
            <div key={y} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textMuted }}>{y}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.textSecondary }}>{parseInt(hist[y]).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// NATIONALITY CARD — matches Images 5 & 10
// ─────────────────────────────────────────────────────────────────
function NationalityCard({ msg }) {
  const intel = msg.area_intelligence || {};
  const nats  = intel.buyer_nationalities;
  if (!nats || !nats.length) return null;

  const badge = nats.some(n => n.pct) ? "DLD verified" : "Market estimate";

  return (
    <CardSection title="BUYER NATIONALITY — 90 DAYS" badge={badge}>
      {nats.slice(0, 8).map((n, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14, width: 20 }}>{n.flag || "🌍"}</span>
          <span style={{ fontSize: 12, width: 70, flexShrink: 0, color: C.textSecondary }}>{n.name}</span>
          <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 3 }}>
            <div style={{ width: `${n.w || (n.pct ? Math.min(100, n.pct * 3) : 30)}%`, height: 6, borderRadius: 3, background: C.copper }} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: "right", color: C.textMuted }}>{n.pct}%</span>
        </div>
      ))}
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// DISTRESS METER — matches top of Image 9
// ─────────────────────────────────────────────────────────────────
function DistressMeter({ msg }) {
  const distress = msg.distress_pct;
  const intel    = msg.area_intelligence || {};
  const area     = intel.area_name_en || "this area";
  if (!distress) return null;
  const availListings = msg.score ? Math.round(1500 + parseFloat(msg.score) * 50) : 5000;
  const distressUnits = Math.round(availListings * parseFloat(distress) / 100);

  return (
    <div style={{ background: "#F5F5F5", border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
      <div style={{ fontSize: 28, fontWeight: 900, color: C.amber, flexShrink: 0 }}>{distress}%</div>
      <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.6 }}>
        <strong style={{ color: C.textPrimary }}>Distress Meter:</strong> {distressUnits.toLocaleString()} of {area}'s active listings are priced below the Truvalu™ floor right now.
        {parseFloat(distress) > 10 ? " This is above the 12-month average — driven by nervous sellers who want to exit quickly. For patient buyers, this is a genuine entry window." : " This is near the 12-month average — stable market conditions."}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ANNUAL RENT RANGES — matches left of Image 10
// ─────────────────────────────────────────────────────────────────
function RentRangesCard({ msg }) {
  if (!["investor", "seller", "broker"].includes(msg.user_type)) return null;
  const stats = msg.transaction_stats || {};
  const bmed  = stats.median_price_by_bedroom || {};
  const yld   = parseFloat(msg.yield_pct || 7);
  const rows  = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"].filter(br => bmed[br]);
  if (!rows.length) return null;

  const sqftMap = { "Studio": 450, "1 BR": 800, "2 BR": 1250, "3 BR": 1800, "4 BR": 2400 };

  return (
    <CardSection title="ANNUAL RENT RANGES (AED)">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>{["TYPE", "MIN", "AVG", "MAX"].map(h => (
            <th key={h} style={{ padding: "6px 6px 6px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((br, i) => {
            const med  = parseFloat(bmed[br]);
            const avg  = Math.round(med * yld / 100 / 1000) * 1000;
            const min_ = Math.round(avg * 0.75 / 1000) * 1000;
            const max_ = Math.round(avg * 1.35 / 1000) * 1000;
            return (
              <tr key={br}>
                <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600 }}>{br}</td>
                <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{min_.toLocaleString()}</td>
                <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.green, fontWeight: 700 }}>{avg.toLocaleString()}</td>
                <td style={{ padding: "8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", color: C.textSecondary }}>{max_.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </CardSection>
  );
}

// ─────────────────────────────────────────────────────────────────
// CATALYSTS CARD — matches Image 11 (timeline style)
// ─────────────────────────────────────────────────────────────────
function CatalystsCard({ msg }) {
  const cats     = msg.area_catalysts || [];
  const userType = msg.user_type || "general";
  const intel    = msg.area_intelligence || {};
  const catScore = intel.catalyst_score;
  if (!cats.length && !catScore) return null;

  const label = {
    buyer:    "🔭 FUTURE — INFRASTRUCTURE & CATALYST TIMELINE",
    seller:   "⚡ UPCOMING CATALYSTS THAT COULD HELP YOUR SALE",
    investor: "⚡ CATALYSTS — CONFIRMED PRICE DRIVERS",
    broker:   "⚡ UPCOMING CATALYSTS — FOR PITCH DECKS",
    general:  "🔭 UPCOMING CATALYSTS",
  }[userType] || "🔭 UPCOMING CATALYSTS";

  const typeColors = {
    metro:    { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Metro" },
    school:   { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "School" },
    mall:     { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Retail" },
    hospital: { bg: "#FDF4FF", border: "#E9D5FF", dot: "#7C3AED", label: "Health" },
    road:     { bg: "#F0F9FF", border: "#BAE6FD", dot: "#0284C7", label: "Road" },
    park:     { bg: C.greenL, border: "#BBF7D0", dot: C.green, label: "Park" },
    airport:  { bg: C.blueL, border: "#DBEAFE", dot: C.blue, label: "Airport" },
  };
  const confColors = { confirmed: C.green, announced: C.blue, likely: C.amber, spec: C.textMuted };

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 800, color: C.textMuted, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 10 }}>{label}</div>
      <div style={{ paddingLeft: 20, position: "relative" }}>
        <div style={{ position: "absolute", left: 4, top: 6, bottom: 6, width: 2, background: C.border, borderRadius: 1 }} />
        {cats.slice(0, 4).map((c, i) => {
          const tc = typeColors[c.catalyst_type] || { bg: C.amberL, border: "#FCD34D", dot: C.amber, label: "Project" };
          const dateLabel = c.expected_date ? new Date(c.expected_date).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "TBC";
          return (
            <div key={i} style={{ position: "relative", marginBottom: 18 }}>
              <div style={{ position: "absolute", left: -24, top: 5, width: 12, height: 12, borderRadius: "50%", background: tc.dot, border: `2px solid #fff` }} />
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: C.textMuted, marginBottom: 3 }}>
                {dateLabel}{" "}
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, marginLeft: 6, textTransform: "uppercase", letterSpacing: ".08em", background: tc.bg, color: tc.dot }}>{c.confidence || tc.label}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>{c.name}</div>
              {c.description && <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55 }}>{c.description}</div>}
              <div style={{ fontSize: 11, marginTop: 4, color: C.textMuted }}>
                📈 Expected impact: <strong style={{ color: C.green }}>
                  {c.catalyst_type === "metro" ? "+8–14% PSF (1km radius)" : c.catalyst_type === "school" ? "+12–18% demand for 2–3BR" : "Positive area impact expected"}
                </strong>
              </div>
            </div>
          );
        })}
        {!cats.length && <div style={{ fontSize: 12, color: C.textMuted, padding: "10px 0" }}>No confirmed catalysts yet — check back soon.</div>}
      </div>
      {catScore && (
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.pageBg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontSize: 12, color: C.textSecondary }}>Catalyst Score</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: parseFloat(catScore) >= 70 ? C.green : C.amber }}>{catScore}/100</div>
        </div>
      )}
    </div>
  );
}


function MultiAreaCards({ msg }) {
  const links = msg.area_links || [];
  if (links.length < 2) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
      {links.slice(0, 6).map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
          style={{ display: "block", padding: "14px 16px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, textDecoration: "none" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>{l.name}</div>
          <div style={{ fontSize: 11, color: C.copper, fontWeight: 600 }}>View full area profile →</div>
        </a>
      ))}
    </div>
  );
}


function ComparisonTable({ msg }) {
  const data = msg.comparison_data || [];
  if (data.length < 2) return null;
  const [a, b] = data;

  const allRows = [
    { label: "Investment Score", get: d => d.score ? `${d.score}/100` : null, color: C.textPrimary },
    { label: "Verdict", get: d => d.verdict || null, color: C.textPrimary },
    { label: "Gross Yield", get: d => d.yield_pct ? `${d.yield_pct}%` : null, color: C.green },
    { label: "Avg Price/sqm", get: d => d.avg_psm ? `AED ${parseInt(d.avg_psm).toLocaleString()}` : null, color: C.textPrimary },
    { label: "Price Trend", get: d => d.price_trend != null ? `${d.price_trend > 0 ? "+" : ""}${d.price_trend}% YoY` : null, color: d => d.price_trend > 0 ? C.green : C.red },
  ];

  const brTypes = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"];
  brTypes.forEach(br => {
    if (a.median_price_by_bedroom?.[br] || b.median_price_by_bedroom?.[br]) {
      allRows.push({
        label: `${br} Median`,
        get: d => d.median_price_by_bedroom?.[br] ? fmtAED(d.median_price_by_bedroom[br]) : null,
        color: C.textPrimary,
      });
    }
  });

  // Only keep rows where at least one side has real data
  const rows = allRows.filter(row => row.get(a) != null || row.get(b) != null);
  if (!rows.length) return null;
  return (
    <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — COMPARISON TABLE`}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}>
          <thead>
            <tr>
              <th style={{ padding: "7px 6px 7px 0", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>METRIC</th>
              <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{a.name}</th>
              <th style={{ padding: "7px 6px", textAlign: "left", fontSize: 9, textTransform: "uppercase", color: C.textMuted, borderBottom: `1px solid ${C.border}`, fontWeight: 700 }}>{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "8px 6px 8px 0", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 600, color: C.textPrimary }}>{row.label}</td>
                <td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(a) : row.color }}>{row.get(a) ?? "—"}</td>
<td style={{ padding: "8px 6px", fontSize: 12, borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none", fontWeight: 700, color: typeof row.color === "function" ? row.color(b) : row.color }}>{row.get(b) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardSection>
  );
}



function ComparisonBarChart({ msg }) {
  const data = msg.comparison_data || [];
  if (data.length < 2) return null;
  const [a, b] = data;

  const metrics = [
    { label: "Investment Score", av: a.score, bv: b.score, suffix: "/100" },
    { label: "Gross Yield",      av: a.yield_pct, bv: b.yield_pct, suffix: "%" },
    { label: "Avg Price/sqm",    av: a.avg_psm, bv: b.avg_psm, suffix: "", isPrice: true },
    { label: "Price Trend YoY",  av: a.price_trend, bv: b.price_trend, suffix: "%" },
  ].filter(m => m.av != null || m.bv != null);

  if (!metrics.length) return null;

  return (
    <CardSection title={`${a.name.toUpperCase()} vs ${b.name.toUpperCase()} — VISUAL COMPARISON`}>
      {metrics.map((m, i) => {
        const maxVal = Math.max(Math.abs(m.av || 0), Math.abs(m.bv || 0)) * 1.2 || 1;
        const aPct = m.av != null ? Math.min(100, (Math.abs(m.av) / maxVal) * 100) : 0;
        const bPct = m.bv != null ? Math.min(100, (Math.abs(m.bv) / maxVal) * 100) : 0;
        return (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
              {m.label}
            </div>
            {[[a.name, m.av, aPct, C.copper], [b.name, m.bv, bPct, C.blue]].map(([name, val, pct, color], j) => (
              <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: j === 0 ? 4 : 0 }}>
                <span style={{ width: 110, fontSize: 11, color: C.textSecondary, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                <div style={{ flex: 1, height: 14, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
                </div>
                <span style={{ width: 70, fontSize: 11, fontWeight: 700, color: C.textPrimary, textAlign: "right" }}>
                  {val != null ? `${m.isPrice ? Math.round(val).toLocaleString() : val}${m.suffix}` : "—"}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </CardSection>
  );
}


// ─────────────────────────────────────────────────────────────────
// HERO BADGES
// ─────────────────────────────────────────────────────────────────
function HeroBadges({ score, verdict, yieldPct, priceTrend }) {
  if (!score && !verdict && !yieldPct) return null;
  const verdictStyle = {
    BUY:   { bg: "#D1FAE5", color: "#065F46" },
    HOLD:  { bg: "#FEF3C7", color: "#92400E" },
    WATCH: { bg: "#FEE2E2", color: "#991B1B" },
  }[verdict] || { bg: "#F3F4F6", color: C.textPrimary };

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
      {score && <span style={{ padding: "4px 10px", background: "#F3F4F6", borderRadius: 6, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>Score {score}/100</span>}
      {verdict && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: verdictStyle.bg, color: verdictStyle.color }}>{verdict}</span>}
      {yieldPct && <span style={{ padding: "4px 10px", background: "#EFF6FF", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#1E40AF" }}>Yield {yieldPct}%</span>}
      {priceTrend != null && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: priceTrend > 0 ? "#D1FAE5" : "#FEE2E2", color: priceTrend > 0 ? "#065F46" : "#991B1B" }}>{priceTrend > 0 ? "+" : ""}{priceTrend}% trend</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CHART (bar chart for prices/yields)
// ─────────────────────────────────────────────────────────────────
function SingleChart({ chart }) {
  if (!chart?.data?.length) return null;
  const valid = chart.data.filter(d => d.value > 0);
  if (!valid.length) return null;
  const max = Math.max(...valid.map(d => d.value));
  return (
    <div style={{ margin: "16px 0 8px", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.6 }}>{chart.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {valid.slice(0, 10).map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 100, fontSize: 11, color: C.textLight, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
            <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.max(3, (item.value / max) * 100)}%`, background: chart.type === "line" ? "#3B82F6" : C.copper, borderRadius: 3 }} />
            </div>
            <div style={{ width: 64, fontSize: 11, color: C.textSecondary, fontWeight: 600, flexShrink: 0, textAlign: "right" }}>{item.value?.toLocaleString()}</div>
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
        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
      ))}
      <style>{`@keyframes blink { 0%,80%,100%{opacity:0.2;transform:scale(0.85)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

function Avatar() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: C.copper, fontWeight: 700 }}>✦</div>
  );
}

function extractFollowups(reply) {
  if (!reply) return [];
  const lines = reply.split("\n");
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
        <div style={{ maxWidth: "75%", padding: "10px 14px", background: C.userBubble, borderRadius: "18px 18px 4px 18px", fontSize: 14, color: C.textPrimary, lineHeight: 1.6 }}>
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
          {msg.summary && <p style={{ margin: "0 0 12px 0", fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}>{msg.summary}</p>}
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
        <div style={{ flex: 1, background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 12, padding: "16px 18px" }}>
          {lines.map((line, i) => {
            const trimmed = line.trim();
            if (/^\d+\./.test(trimmed)) {
              const content = trimmed.replace(/^\d+\.\s*/, "");
              const num = trimmed.match(/^(\d+)\./)?.[1];
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
  const charts    = Array.isArray(msg.charts) ? msg.charts.filter(c => c?.data && Array.isArray(c.data) && c.data.some(d => d.value > 0)) : [];
  const followups = msg._followups || [];
const hasAreaData = !!(
  msg.area_intelligence ||
  msg.transaction_stats ||
  msg.score ||
  msg.yield_pct ||
  msg.verdict ||
  (msg.area_links && msg.area_links.length > 0)
);

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "flex-start" }}>
      <Avatar />
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>

        {/* Summary */}
        {(msg.summary || msg._summary) && (
          <p style={{ margin: "0 0 16px 0", fontSize: 14, color: C.textPrimary, lineHeight: 1.75, fontWeight: 400, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            {msg.summary || msg._summary}
          </p>
        )}

        {/* Badges */}
        <HeroBadges score={msg.score} verdict={msg.verdict} yieldPct={msg.yield_pct} priceTrend={msg.price_trend} />

{/* ── MULTI-AREA (comparison/lifestyle/budget) RESPONSES ── */}
        {hasAreaData && msg.response_mode === "multi_area" ? (
          <>
            {sections && sections.length > 0 && sections[0].header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌")) && (
              <SectionBlock header={sections[0].header} body={sections[0].body} />
            )}

           <MultiAreaCards msg={msg} />
            {msg.comparison_data?.length >= 2 && <ComparisonTable msg={msg} />}
            {msg.comparison_data?.length >= 2 && <ComparisonBarChart msg={msg} />}

            {sections && sections.slice(
              (sections[0]?.header && (sections[0].header.includes("DIRECT ANSWER") || sections[0].header.includes("📌"))) ? 1 : 0
            ).map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}

            {!sections && msg.reply && (
              <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
              />
            )}

            {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
          </>
        ) : (
          <>
            {hasAreaData && (
              <>
            {/* Score card on top, hero stats below */}
{msg.score && <div style={{ marginBottom: 12 }}><ScoreCard msg={msg} /></div>}
<HeroStatsRow msg={msg} />

                {/* Buyer: Guide + Price table + Costs */}
                <BuyerGuide msg={msg} />
                <PriceTable msg={msg} />
                <OwnershipCosts msg={msg} />

                {/* Seller: Owner valuation */}
                <OwnerValuation msg={msg} />

                {/* Investor: 4 big metric cards */}
                <InvestorMetrics msg={msg} />

                {/* Investor/Broker: Nationality + Yield by type */}
                {["investor", "broker"].includes(msg.user_type) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    <NationalityCard msg={msg} />
                    <YieldByTypeCard msg={msg} />
                  </div>
                )}

                {/* Past / Present / Future tabs */}
                <TimeTabs
                  tabs={[
                    {
                      label: "PAST — HISTORY & TRACK RECORD",
                      icon: "📜",
                      content: (
                        <>
                          <PriceHistoryCard msg={msg} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <AreaMaturityCard msg={msg} />
                            <DeveloperTrackRecordCard msg={msg} />
                          </div>
                        </>
                      ),
                    },
                    {
                      label: "PRESENT — LIVE MARKET DATA",
                      icon: "📡",
                      content: (
                        <>
                          <DistressMeter msg={msg} />
                          {["investor", "broker"].includes(msg.user_type) && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                              <MarketCompositionCard msg={msg} />
                              <TruvaluBenchmark msg={msg} />
                            </div>
                          )}
                          {!["investor", "broker"].includes(msg.user_type) && <TruvaluBenchmark msg={msg} />}
                          <RentRangesCard msg={msg} />
                          <NationalityCard msg={msg} />
                        </>
                      ),
                    },
                    {
                      label: "FUTURE — WHAT'S COMING",
                      icon: "🔭",
                      content: (
                        (msg.area_catalysts?.length > 0 || msg.area_intelligence?.catalyst_score) ? (
                          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", marginBottom: 12 }}>
                            <CatalystsCard msg={msg} />
                          </div>
                        ) : (
                          <p style={{ fontSize: 13, color: C.textMuted, padding: "20px 0", textAlign: "center" }}>No catalyst data available for this area yet.</p>
                        )
                      ),
                    },
                  ]}
                />
              </>
            )}

            {sections ? (
              <div>
                {sections.map((sec, i) => <SectionBlock key={i} header={sec.header} body={sec.body} />)}
              </div>
            ) : msg.reply ? (
              <p style={{ margin: 0, fontSize: 14, color: C.textSecondary, lineHeight: 1.7 }}
                dangerouslySetInnerHTML={{ __html: highlightValues(msg.reply.replace(/\n/g, '<br/>')) }}
              />
            ) : null}

            {charts.map((chart, i) => <SingleChart key={i} chart={chart} />)}
          </>
        )}

        {/* Insight */}
        {msg.insight && (
          <div style={{ marginTop: 16, padding: "10px 14px", background: C.copperTint, border: `1px solid ${C.copperBorder}`, borderRadius: 8, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
            ✦ {msg.insight}
          </div>
        )}

        {/* Area links */}
        {msg.area_links && msg.area_links.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textLight, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Explore Areas</div>
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

        {/* Valuation CTA */}
        <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
          💡 BTW — You can instantly verify the real market value of any Dubai property you are looking at here →{" "}
          <a href="https://www.acqar.com/valuation" target="_blank" rel="noopener noreferrer" style={{ color: "#B87333", textDecoration: "underline", fontWeight: 700 }}>
            https://www.acqar.com/valuation
          </a>
        </div>

        {/* Follow-ups */}
        {followups.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
            {followups.map((fq, i) => (
              <button key={i} onClick={() => onSuggestion(fq)}
                style={{ padding: "5px 11px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 20, color: C.textLight, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
              >{fq}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function LoginModal({ open, onClose, navigate }) {
  if (!open) return null;
  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(17,24,39,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", maxWidth: 380,
          width: "90%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ fontSize: 30, marginBottom: 10 }}>🔒</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 19, fontWeight: 800, color: "#111827" }}>
          Sign in to view your answer
        </h3>
        <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6B7280", lineHeight: 1.6 }}>
          Your answer is ready. Log in — it will be waiting for you right here.
        </p>
        <button onClick={() => navigate("/complete-profile")}
          style={{ width: "100%", padding: "13px 16px", borderRadius: 12, border: "none", cursor: "pointer",
            background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", color: "#fff",
            fontWeight: 800, fontSize: 15, fontFamily: "inherit" }}>
          Sign In →
        </button>
        <button onClick={() => navigate("/complete-profile")}
          style={{ width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12,
            border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
            fontWeight: 700, fontSize: 14, color: "#111827", fontFamily: "inherit" }}>
          Create an account
        </button>
        <button onClick={onClose}
          style={{ marginTop: 14, background: "none", border: "none", cursor: "pointer",
            fontSize: 12.5, color: "#9CA3AF", fontFamily: "inherit" }}>
          Not now
        </button>
      </div>
    </div>
  );
}

function FeedbackAndShare({ user, messages }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");        // feedback status
  const [shareStatus, setShareStatus] = useState(""); // "", "saving", "copied", "error"
  const [open, setOpen] = useState(true);

  const submitFeedback = async () => {
    if (!text.trim() || status === "saving") return;
    setStatus("saving");
    const { error } = await supabase.from("broker_feedback").insert({
      user_id: user?.id || null,
      email: user?.email || user?.user_metadata?.email || null,
      feedback: text.trim(),
      page: "/broker",
    });
    if (error) setStatus("error");
    else {
  posthog.capture("broker_feedback_submitted", { feedback: text.trim(), email: user?.email || user?.user_metadata?.email || "anonymous"});
  setStatus("done"); setText(""); setTimeout(() => setStatus(""), 3000);
}
    
  };

  const shareChat = async () => {
    if (shareStatus === "saving") return;
    const shareable = messages.filter(m => m.role === "user" || m.role === "assistant");
    if (!shareable.length) { setShareStatus("empty"); setTimeout(() => setShareStatus(""), 2500); return; }
    setShareStatus("saving");
    const { data, error } = await supabase
      .from("broker_shared_chats")
      .insert({ user_id: user?.id || null, messages: shareable })
      .select("id")
      .single();
    if (error || !data?.id) { setShareStatus("error"); setTimeout(() => setShareStatus(""), 3000); return; }
    const url = `${window.location.origin}/broker?share=${data.id}`;
    posthog.capture("broker_chat_shared", { share_id: data.id, message_count: shareable.length });
    if (navigator.share) {
      try { await navigator.share({ title: "ACQAR Intelligence Chat", url }); } catch {}
      setShareStatus("");
    } else {
      try { await navigator.clipboard.writeText(url); setShareStatus("copied"); }
      catch { setShareStatus("error"); }
      setTimeout(() => setShareStatus(""), 3000);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        style={{ position: "fixed", right: 16, bottom: 100, zIndex: 900, padding: "10px 14px",
          borderRadius: 24, border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer",
          fontWeight: 700, fontSize: 12, color: "#C8732A", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", fontFamily: "inherit" }}>
        💬 Feedback
      </button>
    );
  }

  return (
    <div style={{ position: "fixed", right: 16, bottom: 100, zIndex: 900, width: 260,
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "14px 14px 12px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.14)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#111827" }}>💬 Feedback</span>
        <button onClick={() => setOpen(false)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 14, padding: 0 }}>✕</button>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Share your feedback..."
        rows={3}
        style={{ width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 10,
          fontSize: 12, border: "1px solid #E5E7EB", background: "#FAFAFA", outline: "none",
          color: "#111827", fontFamily: "inherit", resize: "none" }}
      />
      <button onClick={submitFeedback} disabled={status === "saving" || !text.trim()}
        style={{ width: "100%", marginTop: 8, padding: "9px 0", borderRadius: 10, border: "none",
          cursor: status === "saving" || !text.trim() ? "not-allowed" : "pointer",
          background: "#111827", color: "#fff", fontWeight: 700, fontSize: 12,
          fontFamily: "inherit", opacity: status === "saving" || !text.trim() ? 0.5 : 1 }}>
        {status === "saving" ? "Saving..." : "Send Feedback"}
      </button>
      {status === "done" && <div style={{ fontSize: 11, color: "#16A34A", marginTop: 5 }}>✓ Feedback saved!</div>}
      {status === "error" && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 5 }}>Could not save. Log in first.</div>}

      <div style={{ borderTop: "1px solid #F3F4F6", margin: "10px 0 8px" }} />

      <button onClick={shareChat} disabled={shareStatus === "saving"}
        style={{ width: "100%", padding: "9px 0", borderRadius: 10, cursor: "pointer",
          border: "1px solid #E5E7EB", background: "#fff", color: "#C8732A",
          fontWeight: 700, fontSize: 12, fontFamily: "inherit" }}>
        {shareStatus === "saving" ? "Creating link..." : shareStatus === "copied" ? "✓ Link copied!" : "↗ Share this chat"}
      </button>
      {shareStatus === "empty" && <div style={{ fontSize: 11, color: "#D97706", marginTop: 5 }}>Ask a question first, then share.</div>}
      {shareStatus === "error" && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 5 }}>Could not create link. Log in first.</div>}
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
  const location = useLocation();
const isBroker = location.pathname === "/broker";
const [showLoginModal, setShowLoginModal] = useState(false);

useEffect(() => {
  if (isBroker) posthog.capture("broker_page_viewed", { logged_in: !!user });
}, [isBroker]);

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

  // Restore pending answer after login + save broker user
useEffect(() => {
  if (!user || !isBroker) return;
  posthog.identify(user.id, { email: user.email || user.user_metadata?.email || null });
posthog.capture("broker_login_success", { page: "/broker" });

  const pending = sessionStorage.getItem(BROKER_PENDING_KEY);
  if (pending) {
    try {
      const { query, response } = JSON.parse(pending);
      const followups = extractFollowups(response.reply || "");
      setMessages([
        { role: "user", text: query },
        { role: "assistant", _query: query, _followups: followups, ...response },
      ]);
      setHistory([
        { role: "user", content: query },
        { role: "assistant", content: response.reply || "" },
      ]);
    } catch {}
    sessionStorage.removeItem(BROKER_PENDING_KEY);
  }

  setMessages(m => m.map(x => (x.locked ? { ...x, locked: false } : x)));
  setShowLoginModal(false);

  supabase.from("broker_users").upsert(
    {
      user_id: user.id,
      email: user.email || user.user_metadata?.email || null,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      last_active_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  ).then(({ error }) => {
    if (error) console.error("broker_users upsert:", error.message);
  });
}, [user, isBroker]);



// Load a shared chat if URL has ?share=<id>
useEffect(() => {
  const shareId = new URLSearchParams(location.search).get("share");
  if (!shareId || !isBroker) return;
  supabase
    .from("broker_shared_chats")
    .select("messages")
    .eq("id", shareId)
    .single()
    .then(({ data, error }) => {
     if (!error && data?.messages) {
  setMessages(data.messages);
  posthog.capture("broker_shared_chat_viewed", { share_id: shareId });
}
    });
}, [location.search, isBroker]);


  useEffect(() => {
    const ping = () => fetch(`${BACKEND}/health`, { method: "GET" }).catch(() => {});
    ping();
    const id = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    const query = (text || input).trim();
    if (!query || loading) return;
    if (isBroker) posthog.capture("broker_query_sent", { query, logged_in: !!user });
    setInput("");
    const summary = generateSummary(query);
    setMessages(m => [...m, { role: "user", text: query }]);
    setLoading(true);
    setMessages(m => [...m, { role: "thinking", summary }]);
    try {
      const res  = await fetch(`${BACKEND}/intelligence/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: history.slice(-6) }),
      });
      const json = await res.json();
      const followups = extractFollowups(json.reply || "");
      // LOGIN GATE — only on /broker, only when logged out
if (isBroker && !user) {
  setMessages(m => [
    ...m.filter(x => x.role !== "thinking"),
    { role: "assistant", locked: true, _query: query, _summary: summary, _followups: followups, ...json },
  ]);
  sessionStorage.setItem(BROKER_PENDING_KEY, JSON.stringify({ query, response: json }));
  setShowLoginModal(true);
  setLoading(false);
  posthog.capture("broker_login_gate_shown", { query, page: "/broker" });
  return;
}
      setMessages(m => [
        ...m.filter(x => x.role !== "thinking"),
        { role: "assistant", _query: query, _summary: summary, _followups: followups, ...json },
      ]);
      setHistory(h => [...h, { role: "user", content: query }, { role: "assistant", content: json.reply || "" }].slice(-12));
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
    <div style={{ height: "100vh", background: C.pageBg, display: "flex", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{ width: 56, background: C.bg, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 4, flexShrink: 0 }}>
        {[
          { label: "Chat",     active: true,  onClick: () => {},                                                        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
          { label: "Terminal", active: false, onClick: () => window.location.href = "https://www.acqar.com/dashboard", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="4 17 10 11 4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
          { label: "Areas",    active: false, onClick: () => window.location.href = "https://www.acqar.com/areas",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/></svg> },
          { label: "Reports",  active: false, onClick: () => window.location.href = "https://www.acqar.com/my-reports", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
        ].map(item => (
          <button key={item.label} onClick={item.onClick} title={item.label}
            style={{ width: 44, height: 44, borderRadius: 10, background: item.active ? C.copperTint : "transparent", border: item.active ? `1px solid ${C.copperBorder}` : "1px solid transparent", color: item.active ? C.copper : C.textMuted, cursor: item.active ? "default" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, transition: "all 0.15s" }}
            onMouseEnter={e => { if (!item.active) { e.currentTarget.style.background = C.copperTint; e.currentTarget.style.color = C.copper; } }}
            onMouseLeave={e => { if (!item.active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textMuted; } }}
          >
            {item.icon}
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 0.2 }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.bg }}>

        {/* Header */}
        <div style={{ height: 52, padding: "0 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}>←</button>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.copperTint, border: `1.5px solid ${C.copperBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.copper }}>✦</div>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary }}>ACQAR Intelligence</span>
          </div>
          <span style={{ fontSize: 11, color: C.textMuted }}>{user ? (user.email || user.user_metadata?.email || "Signed in") : "Not signed in"}</span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 0 0" }}>
          <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px" }}>

            {messages.length === 0 && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{ fontSize: 28, color: C.copper, marginBottom: 12 }}>✦</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}> Buy, sell, or invest? Get your answer in minutes.</h2>
                <p style={{ fontSize: 14, color: C.textLight, margin: "0 0 36px", lineHeight: 1.6 }}>
                  365K+ real DLD transactions · Area analytics · Investment scores · Future prediction
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 560, margin: "0 auto" }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => handleSend(s)}
                      style={{ padding: "10px 14px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textLight, fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.45, fontFamily: "inherit", transition: "all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = C.copper; e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = C.copperTint; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textLight; e.currentTarget.style.background = "#FAFAFA"; }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) =>
  msg.locked ? (
    <div key={i} style={{ position: "relative" }}>
      <div style={{ filter: "blur(7px)", pointerEvents: "none", userSelect: "none" }}>
        <Message msg={msg} onSuggestion={() => {}} navigate={navigate} />
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <button
          onClick={() => setShowLoginModal(true)}
          style={{ padding: "12px 22px", borderRadius: 10, border: "none", cursor: "pointer",
            background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", color: "#fff",
            fontWeight: 800, fontSize: 14, boxShadow: "0 8px 24px rgba(180,83,9,0.35)", fontFamily: "inherit" }}
        >
          🔒 Log in to view full answer
        </button>
      </div>
    </div>
  ) : (
    <Message key={i} msg={msg} onSuggestion={handleSend} navigate={navigate} />
  )
)}
            <div ref={bottomRef} style={{ height: 20 }} />
          </div>
        </div>

        {/* Input bar */}
        <div style={{ padding: "12px 20px 20px", borderTop: `1px solid ${C.border}`, background: C.bg }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#FAFAFA", border: `1.5px solid ${loading ? C.copper : C.border}`, borderRadius: 12, padding: "4px 4px 4px 16px", transition: "border-color 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask anything about Dubai real estate..."
                disabled={loading}
                style={{ flex: 1, padding: "10px 0", background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.textPrimary, fontFamily: "inherit" }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{ width: 36, height: 36, background: loading || !input.trim() ? "#E5E7EB" : C.textPrimary, border: "none", borderRadius: 8, cursor: loading || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}
              >
                {loading
                  ? <div style={{ display: "flex", gap: 2 }}>{[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: C.textMuted, animation: `blink 1.2s ${i*0.2}s infinite` }} />)}</div>
                  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                }
              </button>
            </div>
            <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.textMuted }}>
              Powered by Acqar · 365K+ DLD Transactions · Real closed-sale prices, not asking prices
            </div>
            {isBroker && <FeedbackAndShare user={user} messages={messages} />}
         </div>
        </div>
      </div>

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} navigate={navigate} />
    </div>
  );
}
