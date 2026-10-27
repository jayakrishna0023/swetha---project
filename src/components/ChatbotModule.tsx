/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Send, Lightbulb } from "lucide-react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { AssistantIcon } from "./icons";

interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
}

const chipList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } }
};

const chipItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }
};

const bubbleTransition = { duration: 0.25, ease: [0.22, 1, 0.36, 1] } as const;

// Inline **bold** support
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={`${keyPrefix}-${i}`} className="font-semibold text-slate-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>
    )
  );
}

// Lightweight markdown-ish formatting: paragraphs, headings, bullet and numbered lists, bold
function renderRichText(content: string) {
  const blocks: React.ReactNode[] = [];
  const lines = String(content ?? "").replace(/\r\n/g, "\n").split("\n");
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      const k = `p-${blocks.length}`;
      blocks.push(
        <p key={k} className="leading-relaxed">
          {renderInline(para.join(" "), k)}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const k = `l-${blocks.length}`;
      const items = list.items.map((item, i) => (
        <li key={`${k}-${i}`} className="leading-relaxed pl-1">
          {renderInline(item, `${k}-${i}`)}
        </li>
      ));
      blocks.push(
        list.ordered ? (
          <ol key={k} className="list-decimal pl-5 space-y-1 marker:text-slate-400 marker:tabular-nums">{items}</ol>
        ) : (
          <ul key={k} className="list-disc pl-5 space-y-1 marker:text-emerald-600">{items}</ul>
        )
      );
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      flushPara();
      flushList();
      const k = `h-${blocks.length}`;
      blocks.push(
        <p key={k} className="font-semibold text-slate-900">
          {renderInline(heading[1], k)}
        </p>
      );
    } else if (bullet || numbered) {
      flushPara();
      const ordered = !!numbered;
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet ? bullet[1] : numbered![1]) as string);
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

export default function ChatbotModule() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      sender: "bot",
      content:
        "Hello! I'm your farm assistant. Ask me about which crops to grow, plant diseases, fertilizer doses, saving water, organic methods, or government schemes."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
    setInput("");

    const newMsg: Message = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      content: userMsgText
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      // Create history payload for API endpoint
      const payloadMessages = messages.concat(newMsg).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages })
      });
      const data = await response.json();

      const botReply: Message = {
        id: "msg-" + Math.random().toString(36).substr(2, 9),
        sender: "bot",
        content: data.response
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error(err);
      const errorReply: Message = {
        id: "msg-err-" + Math.random().toString(36).substr(2, 9),
        sender: "bot",
        content: "Sorry, I couldn't reach the AI service just now. Please check your connection and try again in a moment."
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "What is the PM-KISAN scheme and who is eligible?",
    "Give organic fertilizer tips for growing tomatoes.",
    "Recommend crops to grow in clay soil with low water availability.",
    "How do I prevent Yellow Rust in wheat fields?"
  ];

  const pickPrompt = (p: string) => {
    setInput(p);
    inputRef.current?.focus();
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <AssistantIcon className="w-6 h-6" animate />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Ask anything</span>
          <h2 className="text-3xl text-slate-900">AI Assistant</h2>
          <p className="text-sm text-slate-500 max-w-2xl">
            Chat with an AI farm assistant about crops, pests, soil, irrigation and government schemes. Answers are general guidance; confirm critical decisions with your local agriculture officer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Suggested prompts */}
        <aside className="lg:col-span-1 space-y-3 lg:order-none order-last">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Lightbulb className="w-4 h-4 text-harvest-500" /> Try asking
          </h3>
          <motion.div variants={chipList} initial="hidden" animate="show" className="flex flex-col gap-2">
            {samplePrompts.map((p, idx) => (
              <motion.button
                key={idx}
                variants={chipItem}
                onClick={() => pickPrompt(p)}
                className={`w-full text-left text-sm leading-snug border rounded-xl px-3.5 py-2.5 transition-colors cursor-pointer ${
                  input === p
                    ? "text-emerald-800 border-emerald-300 bg-emerald-50"
                    : "text-slate-600 border-slate-200 bg-white hover:border-emerald-300 hover:text-slate-900"
                }`}
              >
                {p}
              </motion.button>
            ))}
          </motion.div>
        </aside>

        {/* Chat window (rounded-[16px] rather than rounded-2xl so the global card hover-lift doesn't move the whole panel) */}
        <section className="lg:col-span-3 bg-white border border-slate-200/80 rounded-[16px] shadow-sm flex flex-col h-[calc(100dvh-13rem)] min-h-[440px] max-h-[760px] lg:h-[640px] overflow-hidden">
          {/* Title bar */}
          <div className="border-b border-slate-200/80 px-5 py-3.5 flex items-center gap-3 shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <AssistantIcon className="w-5 h-5" mono />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 leading-tight">Farm assistant</h4>
              <span className="text-xs text-slate-500">{loading ? "Typing…" : "Online"}</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 space-y-5 min-h-0 bg-slate-50/50">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  layout="position"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={bubbleTransition}
                  className={`flex items-end gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "bot" && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                      <AssistantIcon className="w-4.5 h-4.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] text-sm px-4 py-3 ${
                      m.sender === "user"
                        ? "bg-emerald-700 text-white rounded-2xl rounded-br-md shadow-sm whitespace-pre-wrap leading-relaxed"
                        : "bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-bl-md shadow-sm space-y-2.5"
                    }`}
                  >
                    {m.sender === "user" ? m.content : renderRichText(m.content)}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div
                  key="typing-indicator"
                  layout="position"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={bubbleTransition}
                  className="flex items-end gap-2.5"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
                    <AssistantIcon className="w-4.5 h-4.5" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md shadow-sm px-4 py-3.5 flex items-center gap-1" aria-label="Assistant is typing">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef}></div>
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="border-t border-slate-200/80 bg-white p-3 shrink-0">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl pl-3.5 pr-1.5 py-1.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about crops, pests, soil or schemes…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none py-1.5"
              />
              <button
                type="submit"
                disabled={!canSend}
                aria-label="Send message"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  canSend ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm cursor-pointer" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                Send
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
