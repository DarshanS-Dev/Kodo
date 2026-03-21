"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import { useKodoStore } from "@/lib/store";
import { chat, startSession, ChatAction } from "@/lib/api";

// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "kodo";
  content: string;
  isStreaming?: boolean;
}

interface ChatProps {
  problemId?: string;
  currentCode?: string;
  onOpenProblem?: (id: string) => void;
}

// ── Typing indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-center gap-1 h-5">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-[#EFEDE3]/35"
        animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
      />
    ))}
  </div>
);

// ── Main Chat Component ───────────────────────────────────────────────────────
export function Chat({ problemId, currentCode, onOpenProblem }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const sessionGreeting = useKodoStore((s) => s.sessionGreeting);
  const setSessionGreeting = useKodoStore((s) => s.setSessionGreeting);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial session start
  useEffect(() => {
    async function init() {
      if (sessionGreeting) {
        setMessages([{ id: "init", role: "kodo", content: sessionGreeting.replace(/^"|"$/g, "") }]);
      } else {
        const greeting = await startSession();
        setSessionGreeting(greeting);
        setMessages([{ id: "init", role: "kodo", content: greeting.replace(/^"|"$/g, "") }]);
      }
    }
    init();
  }, [sessionGreeting, setSessionGreeting]);

  // Handle Send
  const handleSend = useCallback(async () => {
    const query = inputValue.trim();
    if (!query || isSending) return;

    setInputValue("");
    setIsSending(true);

    // Append user message
    const userMsgId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: query }]);

    // Prepare Kōdo placeholder message
    const kodoMsgId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: kodoMsgId, role: "kodo", content: "", isStreaming: true }]);

    let fullContent = "";

    try {
      await chat(
        query,
        problemId,
        currentCode,
        (token) => {
          fullContent += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === kodoMsgId ? { ...m, content: fullContent } : m
            )
          );
        },
        (action: ChatAction) => {
          if (action.type === "open_problem") {
            onOpenProblem?.(action.problem_id);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === kodoMsgId
                  ? { ...m, content: "Opening that problem for you...", isStreaming: false }
                  : m
              )
            );
          }
        }
      );

      // Finish streaming state
      setMessages((prev) =>
        prev.map((m) => (m.id === kodoMsgId ? { ...m, isStreaming: false } : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === kodoMsgId
            ? { ...m, content: "Sorry, I lost my connection to Hindsight.", isStreaming: false }
            : m
        )
      );
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending, problemId, currentCode, onOpenProblem]);

  return (
    <div className="flex flex-col h-full bg-[#3D1515] text-[#EFEDE3] border-l border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5 bg-black/10 shrink-0">
        <h3 className="text-[11px] font-black tracking-[0.2em] opacity-40 uppercase">AI Mentor</h3>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "kodo" ? "items-start" : "items-start flex-row-reverse"}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 border ${
              msg.role === "kodo" ? "bg-[#5C2020] border-[#EFEDE3]/10" : "bg-[#EFEDE3]/10 border-white/10"
            }`}>
              {msg.role === "kodo" ? <Sparkles size={12} className="text-[#EFEDE3]/70" /> : <User size={12} className="text-[#EFEDE3]/40" />}
            </div>
            
            <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === "kodo" ? "items-start" : "items-end"}`}>
              <div className={`px-4 py-2.5 rounded-2xl whitespace-pre-wrap break-words text-[13px] leading-relaxed ${
                msg.role === "kodo" ? "bg-[#EFEDE3]/5 border border-white/5 rounded-tl-sm" : "bg-[#5C2020]/70 border border-white/10 rounded-tr-sm"
              }`}>
                {msg.isStreaming && msg.content === "" ? <TypingIndicator /> : msg.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="px-5 py-4 bg-black/10 shrink-0 border-t border-white/5">
        <div className="flex items-center gap-2 bg-[#EFEDE3]/10 border border-white/5 rounded-2xl p-2 pl-4">
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-[#EFEDE3] text-[13px] outline-none resize-none placeholder:opacity-30 self-center"
          />
          <button
            onClick={handleSend}
            disabled={isSending || !inputValue.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#EFEDE3] text-[#3D1515] hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
