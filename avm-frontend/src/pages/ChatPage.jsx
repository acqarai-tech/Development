// import { useState, useRef, useEffect } from "react";
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
// } from "recharts";



// const BACKEND = "https://development-production-2ad3.up.railway.app";

// // Beta v1: sends conversation history alongside each message so the
// // backend's Stage 3 (stage3_detect_followup.py) can decide whether this
// // message is a genuine follow-up. This is a stateless API — the client
// // is the source of truth for history, not a server-side session.
// async function sendMessage(message, history) {
//   const res = await fetch(BACKEND.replace(/\/$/, "") + "/chat", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message, history }),
//   });

//   if (!res.ok) {
//     const err = await res.text();
//     throw new Error(`Request failed (${res.status}): ${err}`);
//   }

//   return res.json();
// }

// /**
//  * Splits an answer string into alternating text, table, and bullet-list
//  * blocks. A table block is detected as: a line of |cell|cell|...|,
//  * immediately followed by a divider line like |---|---|...| (dashes/
//  * colons only). A list block is one or more consecutive lines starting
//  * with "- " — previously these were left as plain text, so bullets
//  * rendered as raw "-" characters instead of a real HTML list.
//  */
// function parseAnswerBlocks(text) {
//   const lines = text.split("\n");
//   const blocks = [];
//   let textBuffer = [];

//   const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
//   const isDividerRow = (line) =>
//     /^\s*\|[\s:\-|]+\|\s*$/.test(line) && line.includes("-");
//   const isBulletRow = (line) => /^\s*-\s+\S/.test(line);

//   const flushText = () => {
//     if (textBuffer.length) {
//       const joined = textBuffer.join("\n").trim();
//       if (joined) blocks.push({ type: "text", content: joined });
//       textBuffer = [];
//     }
//   };

//   const splitRow = (line) =>
//     line
//       .trim()
//       .replace(/^\|/, "")
//       .replace(/\|$/, "")
//       .split("|")
//       .map((cell) => cell.trim());

//   let i = 0;
//   while (i < lines.length) {
//     const line = lines[i];
//     if (isTableRow(line) && i + 1 < lines.length && isDividerRow(lines[i + 1])) {
//       flushText();
//       const headers = splitRow(line);
//       i += 2; // skip header + divider
//       const rows = [];
//       while (i < lines.length && isTableRow(lines[i])) {
//         rows.push(splitRow(lines[i]));
//         i += 1;
//       }
//       blocks.push({ type: "table", headers, rows });
//       continue;
//     }
//     if (isBulletRow(line)) {
//       flushText();
//       const items = [];
//       while (i < lines.length && isBulletRow(lines[i])) {
//         items.push(lines[i].trim().replace(/^-\s+/, ""));
//         i += 1;
//       }
//       blocks.push({ type: "list", items });
//       continue;
//     }
//     textBuffer.push(line);
//     i += 1;
//   }
//   flushText();
//   return blocks;
// }

// function AnswerTable({ headers, rows }) {
//   return (
//     <div className="acqar-table-wrap">
//       <table className="acqar-table">
//         <thead>
//           <tr>
//             {headers.map((h, i) => (
//               <th key={i}>{h}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row, ri) => (
//             <tr key={ri}>
//               {row.map((cell, ci) => (
//                 <td key={ci}>{cell}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// /**
//  * Renders inline **bold** and _italic_ markdown within a plain text
//  * string as real <strong>/<em> elements instead of literal asterisks or
//  * underscores. Applied to both plain answer text and list items, since
//  * neither goes through a markdown library — this project's renderer
//  * only understands the block shapes (table/list/text) it explicitly
//  * parses in parseAnswerBlocks above. Two-tier emphasis by design: bold
//  * for verdicts/headings/key numbers, italic for minor hints and caveats
//  * — never both on the same text, and plain text everywhere else.
//  */
// function renderInlineMarkdown(text) {
//   const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
//   return parts.map((part, i) => {
//     if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
//       return <strong key={i}>{part.slice(2, -2)}</strong>;
//     }
//     if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
//       return <em key={i}>{part.slice(1, -1)}</em>;
//     }
//     return part;
//   });
// }

// function AnswerList({ items }) {
//   return (
//     <ul className="acqar-list">
//       {items.map((item, i) => (
//         <li key={i}>{renderInlineMarkdown(item)}</li>
//       ))}
//     </ul>
//   );
// }

// function AnswerBody({ text }) {
//   const blocks = parseAnswerBlocks(text);
//   return (
//     <div className="acqar-answer-body">
//       {blocks.map((block, i) => {
//         if (block.type === "table") {
//           return <AnswerTable key={i} headers={block.headers} rows={block.rows} />;
//         }
//         if (block.type === "list") {
//           return <AnswerList key={i} items={block.items} />;
//         }
//         return (
//           <div key={i} className="acqar-answer-text">
//             {renderInlineMarkdown(block.content)}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// function Message({ role, text }) {
//   return (
//     <div className={`acqar-msg acqar-msg--${role}`}>
//       <div className="acqar-msg__who">{role}</div>
//       <div className="acqar-msg__bubble">{text}</div>
//     </div>
//   );
// }

// function TrendChart({ chartData }) {
//   if (!chartData || chartData.length === 0) return null;
//   return (
//     <div className="acqar-chart-wrap">
//       <ResponsiveContainer width="100%" height={220}>
//         <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
//           <XAxis dataKey="year" tick={{ fontSize: 12 }} />
//           <YAxis
//             tick={{ fontSize: 12 }}
//             tickFormatter={(v) => `${Math.round(v / 1000)}k`}
//             width={44}
//           />
//           <Tooltip
//             formatter={(value, name) =>
//               name === "avg_price_per_sqm" ? [`${value.toLocaleString()} AED/sqm`, "PSM"] : value
//             }
//             labelFormatter={(year) => `Year: ${year}`}
//           />
//           <Line
//             type="monotone"
//             dataKey="avg_price_per_sqm"
//             stroke="var(--accent)"
//             strokeWidth={2}
//             dot={{ r: 3 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// function AssistantResponse({ data }) {
//   const [showDebug, setShowDebug] = useState(false);
//   const badgeClass = data.grounded ? "grounded" : "ungrounded";
//   const badgeText = data.grounded
//     ? "Grounded — real data"
//     : "No data — honest fallback";

//   return (
//     <div className="acqar-msg acqar-msg--assistant">
//       <div className="acqar-msg__who">assistant</div>
//       <span className={`acqar-badge acqar-badge--${badgeClass}`}>
//         {badgeText}
//       </span>
//       <div className="acqar-msg__bubble acqar-msg__bubble--rich">
//         <AnswerBody text={data.answer} />
//         <TrendChart chartData={data.chart_data} />
//       </div>
//       <button
//         type="button"
//         className="acqar-debug-toggle"
//         onClick={() => setShowDebug((v) => !v)}
//       >
//         {showDebug ? "hide debug" : "debug"}
//       </button>
//       {showDebug && (
//         <pre className="acqar-debug-pre">
//           {JSON.stringify({ area: data.area, ...data.debug }, null, 2)}
//         </pre>
//       )}
//     </div>
//   );
// }

// export default function AcqarChat() {
//   const [messages, setMessages] = useState([]);
//   const [history, setHistory] = useState([]); // Beta v1: {message, entities} pairs for Stage 3
//   const [input, setInput] = useState("");
//   const [sending, setSending] = useState(false);
//   const bottomRef = useRef(null);

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     const message = input.trim();
//     if (!message || sending) return;

//     setMessages((prev) => [...prev, { role: "user", text: message }]);
//     setInput("");
//     setSending(true);

//     try {
//       const data = await sendMessage(message, history);
//       setMessages((prev) => [...prev, { role: "assistant-data", data }]);
//       // Only a successful turn extends history — a failed request never
//       // resolved entities, so there's nothing valid for Stage 3 to use
//       // as "the previous turn" if the investor tries again.
//       const entities = data.debug?.entities;
//       if (entities) {
//         setHistory((prev) => [...prev, { message, entities }]);
//       }
//     } catch (err) {
//       setMessages((prev) => [
//         ...prev,
//         { role: "assistant", text: `Could not reach backend: ${err.message}` },
//       ]);
//     } finally {
//       setSending(false);
//     }
//   }

//   return (
//     <div className="acqar-chat">
//       <style>{`
//         .acqar-chat {
//           --ink: #14141f;
//           --muted: #6b7280;
//           --border: #e3e2df;
//           --bg: #f6f5f2;
//           --card: #ffffff;
//           --grounded: #1a7a4c;
//           --ungrounded: #b45309;
//           --accent: #b87333;

//           font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
//           background: var(--bg);
//           color: var(--ink);
//           max-width: 720px;
//           margin: 0 auto;
//           display: flex;
//           flex-direction: column;
//           height: 100%;
//           min-height: 100vh;
//         }
//         .acqar-header {
//           padding: 18px 24px;
//           border-bottom: 1px solid var(--border);
//           background: var(--card);
//           display: flex;
//           align-items: baseline;
//           gap: 10px;
//         }
//         .acqar-header h1 { font-size: 15px; margin: 0; letter-spacing: 0.02em; }
//         .acqar-tag {
//           font-size: 11px;
//           color: var(--muted);
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//         }
//         .acqar-hint { font-size: 11.5px; color: var(--muted); margin: 14px 24px 0; }
//         .acqar-thread { flex: 1; padding: 12px 24px 24px; overflow-y: auto; }
//         .acqar-msg { margin-bottom: 18px; }
//         .acqar-msg__who {
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.06em;
//           color: var(--muted);
//           margin-bottom: 4px;
//         }
//         .acqar-msg--user .acqar-msg__bubble { background: var(--ink); color: white; }
//         .acqar-msg__bubble {
//           display: inline-block;
//           background: var(--card);
//           border: 1px solid var(--border);
//           border-radius: 10px;
//           padding: 10px 14px;
//           font-size: 13.5px;
//           line-height: 1.5;
//           max-width: 100%;
//           white-space: pre-wrap;
//         }
//         .acqar-msg__bubble--rich {
//           display: block;
//           white-space: normal;
//         }
//         .acqar-answer-body { display: flex; flex-direction: column; gap: 16px; }
//         .acqar-answer-text { white-space: pre-wrap; line-height: 1.6; }
//         .acqar-list {
//           margin: 0;
//           padding-left: 20px;
//           display: flex;
//           flex-direction: column;
//           gap: 8px;
//         }
//         .acqar-list li {
//           list-style: disc;
//           line-height: 1.6;
//         }
//         .acqar-table-wrap {
//           max-width: 100%;
//           overflow-x: auto;
//           -webkit-overflow-scrolling: touch;
//           border: 1px solid var(--border);
//           border-radius: 8px;
//         }
//         .acqar-chart-wrap {
//           border: 1px solid var(--border);
//           border-radius: 8px;
//           padding: 8px 4px 0;
//         }
//         .acqar-table {
//           border-collapse: collapse;
//           width: max-content;
//           min-width: 100%;
//           font-size: 12.5px;
//           margin: 0;
//         }
//         .acqar-table th, .acqar-table td {
//           border: 1px solid var(--border);
//           padding: 5px 9px;
//           text-align: left;
//           white-space: nowrap;
//         }
//         .acqar-table th {
//           background: #f1f0ec;
//           font-weight: 700;
//           font-size: 11px;
//           text-transform: uppercase;
//           letter-spacing: 0.03em;
//           color: var(--muted);
//           position: sticky;
//           top: 0;
//         }
//         .acqar-table tbody tr:nth-child(even) { background: #fafaf8; }
//         .acqar-badge {
//           display: inline-block;
//           font-size: 10.5px;
//           font-weight: 700;
//           text-transform: uppercase;
//           letter-spacing: 0.04em;
//           padding: 2px 8px;
//           border-radius: 999px;
//           margin-bottom: 6px;
//         }
//         .acqar-badge--grounded {
//           background: #eafaf1; color: var(--grounded); border: 1px solid var(--grounded);
//         }
//         .acqar-badge--ungrounded {
//           background: #fef6ea; color: var(--ungrounded); border: 1px solid var(--ungrounded);
//         }
//         .acqar-debug-toggle {
//           display: block;
//           margin-top: 6px;
//           font-family: inherit;
//           font-size: 10.5px;
//           color: var(--muted);
//           background: none;
//           border: none;
//           cursor: pointer;
//           padding: 0;
//           text-decoration: underline;
//         }
//         .acqar-debug-pre {
//           margin-top: 6px;
//           font-size: 11px;
//           background: #fbfbfa;
//           border: 1px solid var(--border);
//           border-radius: 6px;
//           padding: 8px 10px;
//           overflow-x: auto;
//         }
//         .acqar-composer {
//           display: flex;
//           gap: 8px;
//           padding: 14px 24px;
//           background: var(--card);
//           border-top: 1px solid var(--border);
//         }
//         .acqar-composer input[type="text"] {
//           flex: 1;
//           font-family: inherit;
//           font-size: 13.5px;
//           padding: 10px 12px;
//           border: 1px solid var(--border);
//           border-radius: 8px;
//         }
//         .acqar-composer button {
//           font-family: inherit;
//           font-size: 13px;
//           padding: 10px 18px;
//           background: var(--ink);
//           color: white;
//           border: none;
//           border-radius: 8px;
//           cursor: pointer;
//         }
//         .acqar-composer button:disabled { opacity: 0.5; cursor: default; }
//       `}</style>

//       <header className="acqar-header">
//         <h1>Acqar /chat</h1>
//         <span className="acqar-tag">Beta Version of Chat</span>
//       </header>

    

//       <main className="acqar-thread">
//         {messages.map((m, i) =>
//           m.role === "assistant-data" ? (
//             <AssistantResponse key={i} data={m.data} />
//           ) : (
//             <Message key={i} role={m.role} text={m.text} />
//           )
//         )}
//         {sending && <Message role="assistant" text="Thinking…" />}
//         <div ref={bottomRef} />
//       </main>

//       <form className="acqar-composer" onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Ask about JVC, Downtown, Dubai Marina…"
//           autoComplete="off"
//           disabled={sending}
//         />
//         <button type="submit" disabled={sending || !input.trim()}>
//           Send
//         </button>
//       </form>
//     </div>
//   );
// }



















import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Sparkle, ArrowUp } from "@phosphor-icons/react";

const BACKEND = "https://development-production-2ad3.up.railway.app";

// Beta v1: sends conversation history alongside each message so the
// backend's Stage 3 (stage3_detect_followup.py) can decide whether this
// message is a genuine follow-up. This is a stateless API — the client
// is the source of truth for history, not a server-side session.
async function sendMessage(message, history) {
  const res = await fetch(BACKEND.replace(/\/$/, "") + "/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Request failed (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * Splits an answer string into alternating text, table, and bullet-list
 * blocks. A table block is detected as: a line of |cell|cell|...|,
 * immediately followed by a divider line like |---|---|...| (dashes/
 * colons only). A list block is one or more consecutive lines starting
 * with "- ".
 */
function parseAnswerBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let textBuffer = [];

  const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
  const isDividerRow = (line) =>
    /^\s*\|[\s:\-|]+\|\s*$/.test(line) && line.includes("-");
  const isBulletRow = (line) => /^\s*-\s+\S/.test(line);

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
    if (isBulletRow(line)) {
      flushText();
      const items = [];
      while (i < lines.length && isBulletRow(lines[i])) {
        items.push(lines[i].trim().replace(/^-\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "list", items });
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
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[480px] border-collapse text-xs">
        <thead>
          <tr className="border-b border-accent/15 bg-[#fdf8f2] text-left text-ink/70">
            {headers.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.03em] first:rounded-tl-lg last:rounded-tr-lg"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-line/60 last:border-0 even:bg-[#fafaf8]">
              {row.map((cell, ci) => (
                <td key={ci} className="whitespace-nowrap px-4 py-2.5 text-ink">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renders inline **bold** and _italic_ markdown within a plain text
 * string as real <strong>/<em> elements instead of literal asterisks or
 * underscores. Two-tier emphasis by design: bold for verdicts/headings/
 * key numbers, italic for minor hints and caveats — never both on the
 * same text, plain text everywhere else.
 */
function renderInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function AnswerList({ items }) {
  return (
    <ul className="flex flex-col gap-2 pl-5">
      {items.map((item, i) => (
        <li key={i} className="list-disc leading-relaxed text-ink">
          {renderInlineMarkdown(item)}
        </li>
      ))}
    </ul>
  );
}

function AnswerBody({ text }) {
  const blocks = parseAnswerBlocks(text);
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        if (block.type === "table") {
          return <AnswerTable key={i} headers={block.headers} rows={block.rows} />;
        }
        if (block.type === "list") {
          return <AnswerList key={i} items={block.items} />;
        }
        return (
          <div key={i} className="whitespace-pre-wrap text-base leading-relaxed text-ink">
            {renderInlineMarkdown(block.content)}
          </div>
        );
      })}
    </div>
  );
}

function Message({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex items-start gap-3"}>
      {!isUser && (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-accent shadow-[var(--shadow-xs)]">
          <Sparkle weight="fill" size={16} />
        </span>
      )}
      <div className="max-w-[80%]">
        {!isUser && (
          <p className="mb-1.5 text-xs font-semibold tracking-[-0.01em] text-ink/70">ACQAR</p>
        )}
        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-md bg-accent px-4 py-3 text-base text-white shadow-[var(--shadow-sm)]"
              : "rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 text-base leading-relaxed text-ink shadow-[var(--shadow-xs)]"
          }
        >
          {text}
        </div>
      </div>
    </div>
  );
}

function TrendChart({ chartData }) {
  if (!chartData || chartData.length === 0) return null;
  return (
    <div className="rounded-xl border border-line bg-white p-3 pt-4 shadow-[var(--shadow-xs)]">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: "var(--color-muted)" }} />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-muted)" }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            width={44}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "avg_price_per_sqm" ? [`${value.toLocaleString()} AED/sqm`, "PSM"] : value
            }
            labelFormatter={(year) => `Year: ${year}`}
          />
          <Line
            type="monotone"
            dataKey="avg_price_per_sqm"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-accent)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function AssistantResponse({ data }) {
  const [showDebug, setShowDebug] = useState(false);

  // Grounded/ungrounded keeps its own green/amber semantics — unlike the
  // Buy/Sell/Invest verdicts elsewhere, which all stay inside the copper
  // accent family — because this badge's job is to flag real vs. fallback
  // data. Collapsing that distinction to one color would defeat the point.
  const badgeClass = data.grounded
    ? "border border-[#1a7a4c] bg-[#eafaf1] text-[#1a7a4c]"
    : "border border-[#b45309] bg-[#fef6ea] text-[#b45309]";
  const badgeText = data.grounded ? "Grounded — real data" : "No data — honest fallback";

  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-accent shadow-[var(--shadow-xs)]">
        <Sparkle weight="fill" size={16} />
      </span>
      <div className="min-w-0 max-w-[85%] flex-1 sm:max-w-[640px]">
        <p className="mb-1.5 text-xs font-semibold tracking-[-0.01em] text-ink/70">ACQAR</p>

        <div className="rounded-2xl rounded-tl-md border border-line bg-white p-4 shadow-[var(--shadow-xs)] sm:p-5">
          <span
            className={`mb-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${badgeClass}`}
          >
            {badgeText}
          </span>
          <div className="flex flex-col gap-4">
            <AnswerBody text={data.answer} />
            <TrendChart chartData={data.chart_data} />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDebug((v) => !v)}
          className="mt-1.5 cursor-pointer text-xs text-muted underline decoration-line underline-offset-2 transition-colors hover:text-ink"
        >
          {showDebug ? "hide debug" : "debug"}
        </button>
        {showDebug && (
          <pre className="mt-1.5 overflow-x-auto rounded-lg border border-line bg-[#fdf8f2] p-3 text-[11px] text-ink/80">
            {JSON.stringify({ area: data.area, ...data.debug }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

export default function AcqarChat() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]); // Beta v1: {message, entities} pairs for Stage 3
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
      const data = await sendMessage(message, history);
      setMessages((prev) => [...prev, { role: "assistant-data", data }]);
      // Only a successful turn extends history — a failed request never
      // resolved entities, so there's nothing valid for Stage 3 to use
      // as "the previous turn" if the investor tries again.
      const entities = data.debug?.entities;
      if (entities) {
        setHistory((prev) => [...prev, { message, entities }]);
      }
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
    <div className="flex h-dvh flex-col bg-cream text-ink">
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-white/70 px-6 py-4 backdrop-blur-sm">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-accent shadow-[var(--shadow-xs)]">
          <Sparkle weight="fill" size={18} />
        </span>
        <div>
          <h1 className="text-sm font-semibold tracking-[-0.01em] text-ink">Acqar /chat</h1>
          <p className="text-[11px] uppercase tracking-[0.06em] text-muted">Beta version of chat</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-[720px] flex-col gap-6">
          {messages.map((m, i) =>
            m.role === "assistant-data" ? (
              <AssistantResponse key={i} data={m.data} />
            ) : (
              <Message key={i} role={m.role} text={m.text} />
            )
          )}
          {sending && <Message role="assistant" text="Thinking…" />}
          <div ref={bottomRef} />
        </div>
      </main>

      <form
        onSubmit={handleSubmit}
        className="border-t border-line bg-cream/90 px-4 py-4 backdrop-blur-sm sm:px-8"
      >
        <div className="mx-auto flex w-full max-w-[720px] items-center gap-2 rounded-full border border-line bg-white p-2 shadow-[var(--shadow-md)] transition-shadow focus-within:shadow-[var(--shadow-lg)]">
          <Sparkle weight="fill" size={18} className="ml-2 shrink-0 text-accent" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about JVC, Downtown, Dubai Marina…"
            autoComplete="off"
            disabled={sending}
            className="w-full bg-transparent px-1 py-2.5 text-base text-ink placeholder:text-muted focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            aria-label="Send"
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-glow)] transition-transform duration-200 hover:brightness-105 active:scale-90 disabled:cursor-default disabled:opacity-50 disabled:active:scale-100"
          >
            <ArrowUp weight="bold" size={17} />
          </button>
        </div>
      </form>
    </div>
  );
}
