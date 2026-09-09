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



















import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import * as Dialog from '@radix-ui/react-dialog'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Sparkle,
  ArrowUp,
  Plus,
  List,
  X,
  MagnifyingGlass,
  Copy,
  Check,
  ArrowClockwise,
  ThumbsUp,
  ThumbsDown,
  PencilSimple,
  SidebarSimple,
  Export,
  UserCircle,
  SignOut,
  PushPin,
  Headset,
  CheckCircle,
} from '@phosphor-icons/react'
import acqarLogo from '../assets/acqar-logo.webp'
import LayeredGlow from '../components/LayeredGlow'
import TypingPlaceholder from '../components/TypingPlaceholder'

const STARTER_PROMPTS = [
  'Is a 3-bedroom townhouse in Damac Hills a good investment?',
  'Should I sell my 2BR in Business Bay now or wait a year?',
  'Is AED 1.8M fair for a 1BR in JVC, or am I overpaying?',
]

// Same shortened phrasing as Hero's mobile placeholder rotation — on phones
// the input cycles through these instead of showing the static chip row
// below, so the welcome screen stays to one clear action instead of a
// crowded stack of long full-sentence pills.
const STARTER_PROMPTS_MOBILE = [
  'Good investment in Damac Hills?',
  'Sell now or wait in Business Bay?',
  'Fair price for this JVC 1BR?',
]

let seedId = 0
const nextId = () => `c${seedId++}`

const INITIAL_CONVERSATIONS = [
  { id: nextId(), title: '1BR in JVC — fair price?', day: 'today', pinned: false },
  { id: nextId(), title: '2BR Business Bay — sell or hold?', day: 'today', pinned: false },
  { id: nextId(), title: 'Off-plan vs resale in Dubai Hills', day: 'yesterday', pinned: false },
]

const BACKEND = 'https://development-production-2ad3.up.railway.app'

// Beta v1: sends conversation history alongside each message so the
// backend's Stage 3 (stage3_detect_followup.py) can decide whether this
// message is a genuine follow-up. This is a stateless API — the client
// is the source of truth for history, not a server-side session.
async function postChatMessage(message, history) {
  const res = await fetch(BACKEND.replace(/\/$/, '') + '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Request failed (${res.status}): ${err}`)
  }

  return res.json()
}

/**
 * Splits an answer string into alternating text, table, and bullet-list
 * blocks. A table block is detected as: a line of |cell|cell|...|,
 * immediately followed by a divider line like |---|---|...| (dashes/
 * colons only). A list block is one or more consecutive lines starting
 * with "- ".
 */
function parseAnswerBlocks(text) {
  const lines = text.split('\n')
  const blocks = []
  let textBuffer = []

  const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line)
  const isDividerRow = (line) =>
    /^\s*\|[\s:\-|]+\|\s*$/.test(line) && line.includes('-')
  const isBulletRow = (line) => /^\s*-\s+\S/.test(line)

  const flushText = () => {
    if (textBuffer.length) {
      const joined = textBuffer.join('\n').trim()
      if (joined) blocks.push({ type: 'text', content: joined })
      textBuffer = []
    }
  }

  const splitRow = (line) =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim())

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (isTableRow(line) && i + 1 < lines.length && isDividerRow(lines[i + 1])) {
      flushText()
      const headers = splitRow(line)
      i += 2 // skip header + divider
      const rows = []
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(splitRow(lines[i]))
        i += 1
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }
    if (isBulletRow(line)) {
      flushText()
      const items = []
      while (i < lines.length && isBulletRow(lines[i])) {
        items.push(lines[i].trim().replace(/^-\s+/, ''))
        i += 1
      }
      blocks.push({ type: 'list', items })
      continue
    }
    textBuffer.push(line)
    i += 1
  }
  flushText()
  return blocks
}

/**
 * Renders inline **bold** and _italic_ markdown within a plain text
 * string as real <strong>/<em> elements instead of literal asterisks or
 * underscores.
 */
function renderInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

// Same table treatment RichAnswerCard already used for the JVC transactions
// list — just parameterized with real headers/rows instead of the fixed
// mock data.
function AnswerTable({ headers, rows }) {
  return (
    <div className="mt-3 -mx-1 overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-xs">
        <thead>
          <tr className="border-b border-accent/15 bg-[#fdf8f2] text-left text-ink/70">
            {headers.map((h, i) => (
              <th
                key={i}
                className="whitespace-nowrap px-4 py-2.5 font-semibold first:rounded-l-lg first:pl-3 last:rounded-r-lg last:pr-3"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-line/60 last:border-0">
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="whitespace-nowrap px-4 py-2.5 tabular-nums text-ink first:pl-3 last:pr-3"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AnswerList({ items }) {
  return (
    <ul className="flex flex-col gap-2 pl-5 text-ink">
      {items.map((item, i) => (
        <li key={i} className="list-disc leading-relaxed">
          {renderInlineMarkdown(item)}
        </li>
      ))}
    </ul>
  )
}

function AnswerBody({ text }) {
  const blocks = parseAnswerBlocks(text)
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => {
        if (block.type === 'table') {
          return <AnswerTable key={i} headers={block.headers} rows={block.rows} />
        }
        if (block.type === 'list') {
          return <AnswerList key={i} items={block.items} />
        }
        return (
          <p key={i} className="whitespace-pre-wrap text-base leading-relaxed text-ink">
            {renderInlineMarkdown(block.content)}
          </p>
        )
      })}
    </div>
  )
}

// Same bg-[#fdf8f2] tint RichAnswerCard's stat cards used, just wrapping a
// chart instead of a metric grid.
function TrendChart({ chartData }) {
  if (!chartData || chartData.length === 0) return null
  return (
    <div className="rounded-xl border border-line bg-[#fdf8f2] p-3 pt-4">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: 'var(--color-muted)' }} />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            width={44}
          />
          <Tooltip
            formatter={(value, name) =>
              name === 'avg_price_per_sqm' ? [`${value.toLocaleString()} AED/sqm`, 'PSM'] : value
            }
            labelFormatter={(year) => `Year: ${year}`}
          />
          <Line
            type="monotone"
            dataKey="avg_price_per_sqm"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--color-accent)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// All three verdicts stay inside the copper accent family (no red/green) —
// the rest of the site never introduces a second hue, it only varies weight
// and tint of the one accent color, so the chat shouldn't either.
const VERDICT_STYLES = {
  Buy: 'bg-accent text-white',
  Sell: 'border border-accent-dark text-accent-dark',
  Invest: 'bg-accent/10 text-accent-dark',
}

// Grounded/ungrounded reuses the same two treatments above (filled = Buy,
// outline = Sell) rather than introducing green/amber — same one-hue rule.
const DATA_BADGE_STYLES = {
  grounded: VERDICT_STYLES.Buy,
  ungrounded: VERDICT_STYLES.Sell,
}

function ProfileCard({ collapsed, isLoggedIn, userEmail, userPlan, onToggleLogin }) {
  const initial = userEmail?.[0]?.toUpperCase() || 'U'

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={onToggleLogin}
        title={isLoggedIn ? userEmail : 'Log in'}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-accent/20 bg-white/70 text-accent shadow-[var(--shadow-xs)]"
      >
        {isLoggedIn ? <span className="text-xs font-semibold">{initial}</span> : <UserCircle size={18} />}
      </button>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-accent/20 bg-white/70 px-3 py-2.5">
        <div className="flex items-center gap-2 text-sm text-ink/70">
          <UserCircle size={22} />
          Guest
        </div>
        <button
          type="button"
          onClick={onToggleLogin}
          className="cursor-pointer rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:shadow-[var(--shadow-sm)]"
        >
          Log in
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{userEmail || 'Account'}</p>
          <p className="text-xs text-muted">
            {userPlan === 'pro' || userPlan === 'elite' ? 'Pro plan' : 'Free plan'}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleLogin}
        aria-label="Log out"
        title="Log out"
        className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
      >
        <SignOut size={15} />
      </button>
    </div>
  )
}

function ConversationRow({ c, active, isEditing, editValue, onEditValueChange, onOpenClick, onTogglePin, onStartRename, onSaveRename, onCancelRename }) {
  if (isEditing) {
    return (
      <input
        autoFocus
        value={editValue}
        onChange={(e) => onEditValueChange(e.target.value)}
        onBlur={onSaveRename}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSaveRename()
          if (e.key === 'Escape') onCancelRename()
        }}
        className="w-full rounded-lg border border-accent/40 bg-white/80 px-2 py-2 text-sm text-ink focus:outline-none"
      />
    )
  }

  return (
    <div
      className={`group flex items-center gap-1 rounded-lg px-2 py-2 transition-colors ${
        active ? 'border border-accent/20 bg-accent/10' : 'border border-transparent hover:bg-accent/5'
      }`}
    >
      <button
        type="button"
        onClick={() => onOpenClick(c.title)}
        className="min-w-0 flex-1 truncate text-left text-sm text-muted hover:text-ink"
      >
        {c.title}
      </button>
      <button
        type="button"
        onClick={() => onTogglePin(c.id)}
        title={c.pinned ? 'Unpin' : 'Pin'}
        aria-label={c.pinned ? 'Unpin chat' : 'Pin chat'}
        className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors ${
          c.pinned ? 'text-accent-dark' : 'text-muted/70 hover:text-accent-dark'
        }`}
      >
        <PushPin size={13} weight={c.pinned ? 'fill' : 'regular'} />
      </button>
      <button
        type="button"
        onClick={() => onStartRename(c.id, c.title)}
        title="Rename"
        aria-label="Rename chat"
        className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted/70 transition-colors hover:text-ink"
      >
        <PencilSimple size={13} />
      </button>
    </div>
  )
}

function SidebarContent({
  onPromptClick,
  onNewChat,
  collapsed,
  onToggleCollapse,
  isLoggedIn,
  userEmail,
  userPlan,
  onToggleLogin,
  conversations,
  activeConversationId,
  onTogglePin,
  editingId,
  editValue,
  onEditValueChange,
  onStartRename,
  onSaveRename,
  onCancelRename,
}) {
  const [search, setSearch] = useState('')
  const q = search.trim().toLowerCase()
  const filtered = q ? conversations.filter((c) => c.title.toLowerCase().includes(q)) : conversations
  const pinned = filtered.filter((c) => c.pinned)
  const today = filtered.filter((c) => !c.pinned && c.day === 'today')
  const yesterday = filtered.filter((c) => !c.pinned && c.day === 'yesterday')

  const rowProps = {
    activeConversationId,
    onOpenClick: onPromptClick,
    onTogglePin,
    editingId,
    editValue,
    onEditValueChange,
    onStartRename,
    onSaveRename,
    onCancelRename,
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className={`flex items-center px-5 pt-5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img src={acqarLogo} alt="ACQAR" className="h-6 w-auto" />
          </Link>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-accent/5 hover:text-ink"
          >
            <SidebarSimple size={18} />
          </button>
        )}
      </div>

      <div className={`flex flex-col gap-2 px-4 pt-6 ${collapsed ? 'items-center px-2' : ''}`}>
        <button
          type="button"
          onClick={onNewChat}
          title="New chat"
          className={`flex cursor-pointer items-center gap-2 rounded-full bg-accent text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] active:scale-[0.98] ${
            collapsed ? 'h-9 w-9 justify-center' : 'w-full px-4 py-2.5'
          }`}
        >
          <Plus size={16} weight="bold" />
          {!collapsed && 'New chat'}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2 rounded-full border border-accent/20 bg-white/70 px-4 py-2">
            <MagnifyingGlass size={15} className="shrink-0 text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-4">
          {pinned.length > 0 && (
            <>
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark">Pinned</p>
              <div className="mt-3 flex flex-col gap-1">
                {pinned.map((c) => (
                  <ConversationRow key={c.id} c={c} active={c.id === activeConversationId} isEditing={editingId === c.id} {...rowProps} />
                ))}
              </div>
            </>
          )}

          {today.length > 0 && (
            <>
              <p className="mt-7 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark">Today</p>
              <div className="mt-3 flex flex-col gap-1">
                {today.map((c) => (
                  <ConversationRow key={c.id} c={c} active={c.id === activeConversationId} isEditing={editingId === c.id} {...rowProps} />
                ))}
              </div>
            </>
          )}

          {yesterday.length > 0 && (
            <>
              <p className="mt-7 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-dark">Yesterday</p>
              <div className="mt-3 flex flex-col gap-1">
                {yesterday.map((c) => (
                  <ConversationRow key={c.id} c={c} active={c.id === activeConversationId} isEditing={editingId === c.id} {...rowProps} />
                ))}
              </div>
            </>
          )}

          {q && pinned.length === 0 && today.length === 0 && yesterday.length === 0 && (
            <p className="px-1 text-sm text-muted">No matches for "{search}".</p>
          )}
        </div>
      )}

      <div className={`flex flex-col gap-3 border-t border-line px-4 py-4 ${collapsed ? 'items-center px-2' : ''}`}>
        <ProfileCard collapsed={collapsed} isLoggedIn={isLoggedIn} userEmail={userEmail} userPlan={userPlan} onToggleLogin={onToggleLogin} />
      </div>
    </div>
  )
}

function MessageActionButton({ onClick, active, activeClassName, children, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors ${
        active ? activeClassName : 'text-muted hover:bg-ink/5 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

// Same rounded-2xl card RichAnswerCard used for the mocked JVC deep-dive —
// now filled with the real backend's parsed answer (text/list/table blocks)
// and an optional trend chart, plus the grounded/ungrounded badge, instead
// of the fixed headline/metrics/table.
function AnswerCard({ data }) {
  const badgeClass = data.grounded ? DATA_BADGE_STYLES.grounded : DATA_BADGE_STYLES.ungrounded
  const badgeText = data.grounded ? 'Grounded — real data' : 'No data — honest fallback'

  return (
    <div className="rounded-2xl rounded-tl-md border border-line bg-white p-4 shadow-[var(--shadow-xs)] sm:p-5">
      <span
        className={`mb-2.5 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${badgeClass}`}
      >
        {badgeText}
      </span>
      <div className="flex flex-col gap-4">
        <AnswerBody text={data.answer} />
        <TrendChart chartData={data.chart_data} />
      </div>
    </div>
  )
}

function AssistantMessage({ m, onRegenerate, onFeedback, isLast }) {
  const [copied, setCopied] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const handleCopy = () => {
    const textToCopy = m.data ? m.data.answer : m.text
    navigator.clipboard?.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-start gap-3">
      <span className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-accent shadow-[var(--shadow-xs)]">
        <Sparkle weight="fill" size={16} />
      </span>
      <div className={m.data ? 'min-w-0 max-w-[85%] flex-1 sm:max-w-[640px]' : 'max-w-[80%]'}>
        <p className="mb-1.5 text-xs font-semibold tracking-[-0.01em] text-ink/70">ACQAR</p>
        {m.data ? (
          <AnswerCard data={m.data} />
        ) : (
          <div className="rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3.5 shadow-[var(--shadow-xs)]">
            <p className="text-base leading-relaxed text-ink">{m.text}</p>
          </div>
        )}

        <div className="mt-1.5 flex items-center gap-0.5">
          <MessageActionButton onClick={handleCopy} label="Copy">
            {copied ? <Check size={14} weight="bold" className="text-accent-dark" /> : <Copy size={14} />}
          </MessageActionButton>
          <MessageActionButton onClick={onRegenerate} label="Regenerate">
            <ArrowClockwise size={14} />
          </MessageActionButton>
          <MessageActionButton
            onClick={() => onFeedback('up')}
            active={m.feedback === 'up'}
            activeClassName="text-accent-dark"
            label="Good response"
          >
            <ThumbsUp size={14} weight={m.feedback === 'up' ? 'fill' : 'regular'} />
          </MessageActionButton>
          <MessageActionButton
            onClick={() => onFeedback('down')}
            active={m.feedback === 'down'}
            activeClassName="text-accent-dark"
            label="Poor response"
          >
            <ThumbsDown size={14} weight={m.feedback === 'down' ? 'fill' : 'regular'} />
          </MessageActionButton>
        </div>

        {m.data && (
          <>
            <button
              type="button"
              onClick={() => setShowDebug((v) => !v)}
              className="mt-1 block cursor-pointer text-xs text-muted underline decoration-line underline-offset-2 transition-colors hover:text-ink"
            >
              {showDebug ? 'hide debug' : 'debug'}
            </button>
            {showDebug && (
              <pre className="mt-1.5 overflow-x-auto rounded-lg border border-line bg-[#fdf8f2] p-3 text-[11px] text-ink/80">
                {JSON.stringify({ area: m.data.area, ...m.data.debug }, null, 2)}
              </pre>
            )}
          </>
        )}

        {isLast && <DisclaimerLine className="mt-3 text-left" />}
      </div>
    </div>
  )
}

function UserMessage({ m, onEdit }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard?.writeText(m.text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col items-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-base text-white shadow-[var(--shadow-sm)]">
        {m.text}
      </div>
      <div className="mt-1.5 flex items-center gap-0.5">
        <MessageActionButton onClick={handleCopy} label="Copy">
          {copied ? <Check size={14} weight="bold" className="text-accent-dark" /> : <Copy size={14} />}
        </MessageActionButton>
        <MessageActionButton onClick={onEdit} label="Edit">
          <PencilSimple size={14} />
        </MessageActionButton>
      </div>
    </div>
  )
}

// Claude-style "Thinking for Ns…" indicator — a live elapsed-time counter
// rather than a static spinner, so the wait reads as real work happening.
function ThinkingIndicator() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-accent shadow-[var(--shadow-xs)]">
        <Sparkle weight="fill" size={16} className="animate-pulse" />
      </span>
      <span className="text-base text-muted">
        Thinking{seconds > 0 ? ` for ${seconds}s` : '…'}
      </span>
    </div>
  )
}

function DisclaimerLine({ className = '' }) {
  return (
    <p className={`text-xs text-muted ${className}`}>
      ACQAR AI can make mistakes. Please double-check responses.{' '}
      <a href="#" className="cursor-pointer underline decoration-line underline-offset-2 transition-colors hover:text-accent-dark">
        Give us feedback
      </a>
    </p>
  )
}

function ShareButton({ onShare, copied, compact = false }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onShare}
        aria-label="Share this chat"
        title="Share this chat"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-ink shadow-[var(--shadow-xs)] transition-transform duration-200 active:scale-90"
      >
        {copied ? <Check size={17} weight="bold" className="text-accent-dark" /> : <Export size={17} weight="bold" />}
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onShare}
      className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-accent/5 hover:text-accent-dark"
    >
      {copied ? <Check size={15} weight="bold" className="text-accent-dark" /> : <Export size={15} />}
      {copied ? 'Link copied' : 'Share'}
    </button>
  )
}

// Floating "talk to a property advisor" prompt — only shown once ACQAR has
// actually answered something, so it reads as "want a human take on this?"
// rather than an unprompted popup before there's anything to discuss.
function AdvisorPrompt({ visible }) {
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  if (!visible) return null

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => setConfirmed(false), 200)
  }

  return (
    <div className="absolute bottom-28 right-4 z-20 flex flex-col items-end sm:right-8">
      {open && (
        <div className="mb-3 w-[280px] rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-lg)] sm:w-[300px]">
          {confirmed ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CheckCircle weight="fill" size={22} />
              </span>
              <p className="text-sm font-medium text-ink">Thanks — a property advisor will be in touch shortly.</p>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-white text-accent shadow-[var(--shadow-xs)]">
                    <Headset weight="fill" size={18} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">ACQAR Advisor</p>
                    <p className="text-xs text-muted">Usually replies within a day</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Dismiss"
                  className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink">
                Do you want to discuss this with a property advisor?
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmed(true)}
                  className="flex-1 cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-accent/5 hover:text-ink"
                >
                  No
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Talk to a property advisor"
        title="Talk to a property advisor"
        className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-accent/20 bg-white text-accent shadow-[var(--shadow-md)] transition-transform duration-200 active:scale-95"
      >
        {!open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/20" />}
        <Headset weight="fill" size={22} className="relative" />
      </button>
    </div>
  )
}

export default function ChatPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [history, setHistory] = useState([]) // Beta v1: {message, entities} pairs for Stage 3
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [userPlan, setUserPlan] = useState('free')
  const [shareCopied, setShareCopied] = useState(false)
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS)
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const autoSubmitted = useRef(false)
  const scrollRef = useRef(null)


  useEffect(() => {
  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      navigate('/loginpage', { replace: true })
      return
    }

    setSession(session)
    setAuthLoading(false)
  }

  checkAuth()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) {
      navigate('/', { replace: true })
      return
    }

    setSession(session)
    setAuthLoading(false)
  })

  return () => subscription.unsubscribe()
}, [navigate])


    useEffect(() => {
    if (!session?.user?.id) return
    let mounted = true

    const loadPlan = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('plan')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!mounted) return
      if (error) {
        console.error('Failed to load user plan:', error)
        return
      }
      setUserPlan(data?.plan || 'free')
    }

    loadPlan()
    return () => { mounted = false }
  }, [session])

  const sendMessage = async (text) => {
    const trimmed = text.trim()
    if (!trimmed || thinking) return

    const isFirst = messages.length === 0
    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    setInput('')
    setThinking(true)

    if (isFirst) {
      const convo = { id: nextId(), title: trimmed, day: 'today', pinned: false }
      setConversations((c) => [convo, ...c])
      setActiveConversationId(convo.id)
    }

    try {
      const data = await postChatMessage(trimmed, history)
      setMessages((m) => [...m, { role: 'assistant', feedback: null, data }])
      // Only a successful turn extends history — a failed request never
      // resolved entities, so there's nothing valid for Stage 3 to use
      // as "the previous turn" if the investor tries again.
      const entities = data.debug?.entities
      if (entities) {
        setHistory((prev) => [...prev, { message: trimmed, entities }])
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', feedback: null, error: true, text: `Could not reach backend: ${err.message}` },
      ])
    } finally {
      setThinking(false)
    }
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q && !autoSubmitted.current) {
      autoSubmitted.current = true
      sendMessage(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const handlePromptClick = (label) => {
    setDrawerOpen(false)
    if (label) sendMessage(label)
  }

  const resetChat = () => {
    setDrawerOpen(false)
    setMessages([])
    setInput('')
    setThinking(false)
    setActiveConversationId(null)
  }

  // Re-asks the backend for the same user turn and swaps this message's
  // data in place. Uses whatever `history` holds at the moment of the
  // click (same simplification the mock version had — this isn't a true
  // rollback to "history right before this turn").
  const regenerate = async (index) => {
    const query = messages[index - 1]?.text
    if (!query || thinking) return

    setThinking(true)
    try {
      const data = await postChatMessage(query, history)
      setMessages((m) => m.map((msg, i) => (i === index ? { role: 'assistant', feedback: null, data } : msg)))
      const entities = data.debug?.entities
      if (entities) {
        setHistory((prev) => [...prev, { message: query, entities }])
      }
    } catch (err) {
      setMessages((m) =>
        m.map((msg, i) =>
          i === index
            ? { role: 'assistant', feedback: null, error: true, text: `Could not reach backend: ${err.message}` }
            : msg
        )
      )
    } finally {
      setThinking(false)
    }
  }

  const setFeedback = (index, value) => {
    setMessages((m) =>
      m.map((msg, i) => (i === index ? { ...msg, feedback: msg.feedback === value ? null : value } : msg))
    )
  }

  const editMessage = (index) => {
    setInput(messages[index].text)
    setMessages((m) => m.slice(0, index))
  }

  const togglePin = (id) => {
    setConversations((c) => c.map((conv) => (conv.id === id ? { ...conv, pinned: !conv.pinned } : conv)))
  }

  const startRename = (id, currentTitle) => {
    setEditingId(id)
    setEditValue(currentTitle)
  }

  const saveRename = () => {
    const trimmed = editValue.trim()
    if (trimmed && editingId) {
      setConversations((c) => c.map((conv) => (conv.id === editingId ? { ...conv, title: trimmed } : conv)))
    }
    setEditingId(null)
  }

  const cancelRename = () => setEditingId(null)

  // No backend/persistence to point a "share" link at a saved conversation,
  // so this shares a link that reproduces the opening exchange (via ?q=) —
  // honest for a prototype, and still genuinely useful for a broker sending
  // a client "here's what ACQAR said about this property."
  const handleShare = async () => {
    const firstUserMessage = messages.find((m) => m.role === 'user')?.text
    const url = `${window.location.origin}/chat${firstUserMessage ? `?q=${encodeURIComponent(firstUserMessage)}` : ''}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'ACQAR', text: 'Ask ACQAR about Dubai property', url })
      } catch {
        // user cancelled the native share sheet — nothing to do
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    } catch {
      // clipboard blocked (e.g. insecure context) — fail silently
    }
  }

  const hasConversation = messages.length > 0
  const hasAnswer = messages.some((m) => m.role === 'assistant')

    if (authLoading) {
    return (
      <div className="flex h-dvh items-center justify-center bg-cream">
        <Sparkle weight="fill" size={28} className="animate-pulse text-accent" />
      </div>
    )
  }

const sidebarProps = {
  onPromptClick: handlePromptClick,
  onNewChat: resetChat,
  isLoggedIn: !!session,
  userEmail: session?.user?.email,
  userPlan,
  onToggleLogin: async () => {
    if (session) {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Logout error:', error)
        return
      }

      navigate('/', { replace: true })
    } else {
      navigate('/loginpage')
    }
  },
  conversations,
    activeConversationId,
    onTogglePin: togglePin,
    editingId,
    editValue,
    onEditValueChange: setEditValue,
    onStartRename: startRename,
    onSaveRename: saveRename,
    onCancelRename: cancelRename,
  }

  return (
    <div className="flex h-dvh flex-col bg-cream text-ink md:flex-row">
      {/* Desktop sidebar */}
      <aside
        className={`hidden shrink-0 border-r border-line bg-[#fdf8f2]/80 backdrop-blur-sm transition-[width] duration-200 md:block ${
          sidebarCollapsed ? 'w-[76px]' : 'w-[280px]'
        }`}
      >
        <SidebarContent
          {...sidebarProps}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-line bg-cream/90 px-4 py-3 shadow-[var(--shadow-xs)] backdrop-blur-sm md:hidden">
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
            >
              <List size={20} weight="bold" />
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/20" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-line bg-[#fdf8f2] shadow-[var(--shadow-lg)]">
              <Dialog.Title className="sr-only">ACQAR chat menu</Dialog.Title>
              <Dialog.Description className="sr-only">
                Pinned and recent chats, and a link back to the ACQAR site
              </Dialog.Description>
              <div className="flex shrink-0 justify-end px-4 pt-4">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
                  >
                    <X size={20} weight="bold" />
                  </button>
                </Dialog.Close>
              </div>
              <SidebarContent {...sidebarProps} collapsed={false} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Link to="/" className="flex items-center gap-1.5">
          <img src={acqarLogo} alt="ACQAR" className="h-5 w-auto" />
        </Link>

        <div className="flex items-center gap-1">
          {hasConversation && <ShareButton onShare={handleShare} copied={shareCopied} compact />}
          <button
            type="button"
            onClick={resetChat}
            aria-label="New chat"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-xs)] transition-transform duration-200 active:scale-90"
          >
            <Plus size={18} weight="bold" />
          </button>
        </div>
      </div>

      {/* Main chat column */}
      <div className="grain relative flex flex-1 flex-col overflow-hidden">
        <LayeredGlow />
        <AdvisorPrompt visible={hasAnswer} />

        {/* Desktop-only conversation header — mobile already has the top bar above */}
        {hasConversation && (
          <div className="relative hidden shrink-0 items-center justify-end gap-1 border-b border-line bg-white/40 px-6 py-3 backdrop-blur-sm md:flex">
            <ShareButton onShare={handleShare} copied={shareCopied} />
            <button
              type="button"
              onClick={resetChat}
              className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:bg-accent/5 hover:text-accent-dark"
            >
              <Plus size={15} weight="bold" />
              New chat
            </button>
          </div>
        )}

        {!hasConversation ? (
          <div className="relative mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-white text-accent shadow-[var(--shadow-md)]">
              <Sparkle weight="fill" size={24} />
            </span>
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-[-0.03em] text-ink sm:text-[2.5rem]">
              Ask ACQAR anything about{' '}
              <span className="bg-gradient-to-r from-accent via-[#c98a4a] to-accent-dark bg-clip-text text-transparent">
                a Dubai property.
              </span>
            </h1>
            <p className="mt-3 max-w-[480px] text-base leading-relaxed text-muted">
              Get a straight Buy, Sell, or Invest answer, backed by real DLD transaction data.
            </p>

            <ChatInputBar
              value={input}
              onChange={setInput}
              onSubmit={() => sendMessage(input)}
              className="mt-8 w-full"
              rotatingPlaceholder
            />

            <div className="mt-6 hidden w-full flex-wrap justify-center gap-2 sm:flex">
              {STARTER_PROMPTS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => sendMessage(label)}
                  className="cursor-pointer rounded-full border border-line bg-white px-4 py-2 text-left text-xs text-ink/70 shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:text-accent-dark hover:shadow-[var(--shadow-sm)] sm:text-sm"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-8 sm:px-8">
              <div className="mx-auto flex max-w-[720px] flex-col gap-6">
                {messages.map((m, i) =>
                  m.role === 'user' ? (
                    <UserMessage key={i} m={m} onEdit={() => editMessage(i)} />
                  ) : (
                    <AssistantMessage
                      key={i}
                      m={m}
                      onRegenerate={() => regenerate(i)}
                      onFeedback={(v) => setFeedback(i, v)}
                      isLast={i === messages.length - 1}
                    />
                  )
                )}

                {thinking && <ThinkingIndicator />}
              </div>
            </div>

            <div className="relative border-t border-line bg-cream/90 px-4 py-4 backdrop-blur-sm sm:px-8">
              <ChatInputBar
                value={input}
                onChange={setInput}
                onSubmit={() => sendMessage(input)}
                className="mx-auto w-full max-w-[720px]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ChatInputBar({ value, onChange, onSubmit, className = '', rotatingPlaceholder = false }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className={className}
    >
      <div className="flex items-center gap-2 rounded-full border border-line bg-white p-2 shadow-[var(--shadow-md)] transition-shadow focus-within:shadow-[var(--shadow-lg)]">
        <Sparkle weight="fill" size={18} className="ml-2 shrink-0 text-accent" />
        <div className="relative w-full">
          {rotatingPlaceholder && value === '' && (
            <TypingPlaceholder
              texts={STARTER_PROMPTS}
              mobileTexts={STARTER_PROMPTS_MOBILE}
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center truncate px-1 py-2.5 text-base text-muted"
            />
          )}
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={rotatingPlaceholder ? '' : 'Ask about any Dubai property…'}
            className="w-full bg-transparent px-1 py-2.5 text-base text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
        <button
          type="submit"
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-white shadow-[var(--shadow-glow)] transition-transform duration-200 hover:brightness-105 active:scale-90"
        >
          <ArrowUp weight="bold" size={17} />
        </button>
      </div>
    </form>
  )
}
