"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor, { OnMount } from "@monaco-editor/react";
import { DM_Sans, Fira_Code } from "next/font/google";
import { cn } from "@/lib/utils";

// --- FONTS ---
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400", "500"] });

// --- TYPES ---
interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

// --- CONSTANTS ---
const BASE_URL = "http://localhost:8000";
const USER_ID = "user_001";

const COLORS = {
  bg: "#F2EDE4",        // Warm cream background
  text: "#3D1515",      // Deep maroon text
  border: "#E0D7C6",   // Subtle tan border
  accent: "#6B1A1A",    // Primary maroon accent
  bubble_ai: "#FDFCFB", // Lighter bubble for AI
  bubble_user: "#EDE4D6", // Darker bubble for user
  btn_hover: "#E8D9C5"
};

// --- COMPONENTS ---
const Spinner = ({ size = "14px", color = COLORS.accent }) => (
  <div style={{
    width: size, height: size, border: `2px solid ${color}33`,
    borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite",
  }} />
);

export default function WorkspacePage() {
  // --- STATE ---
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    { role: "assistant", content: "I'll throw coding problems at you one by one. Ask me for hints anytime, or say next to skip. Ready?", time: "09:58 pm" },
    { role: "assistant", content: "Here's your first problem:", time: "09:59 pm" }
  ]);
  const [typing, setTyping] = useState(false);
  const [code, setCode] = useState("def two_sum(nums, target):\n    # Your solution here\n    pass\n\n# Test\nprint(two_sum([2, 7, 11, 15], 9)) # Expected: [0, 1]\nprint(two_sum([3, 2, 4], 6))     # Expected: [1, 2]");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [editorWidth, setEditorWidth] = useState(55); // in %

  const chatEndRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);

  // --- API ---
  const pushAIMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { role: "assistant", content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() }]);
  }, []);

  const handleSendChat = async (userMsg = chatInput) => {
    if (!userMsg.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase() }]);
    setChatInput("");
    setTyping(true);

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: USER_ID, query: userMsg })
      });
      const data = await res.json();
      setTyping(false);
      pushAIMessage(data);
    } catch (err) {
      setTyping(false);
      pushAIMessage("Error connecting to K\u014Ddo brain.");
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput("Running tests...");
    await new Promise(r => setTimeout(r, 1500));
    setOutput("Ln 7. Col 54  7 lines  178 chars\n\nOUTPUT\n[0, 1]\n[1, 2]\n\n\u2705 ALL TESTS PASSED");
    setRunning(false);
    pushAIMessage("Awesome! Opening the editor now. Good luck! \uD83D\uDCAA");
  };

  // --- RESIZE ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      setEditorWidth(Math.min(Math.max(pct, 30), 80));
    };
    const handleMouseUp = () => { dragRef.current = false; document.body.style.cursor = "default"; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const onMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => { handleRun(); });
  };

  return (
    <div className={cn(dmSans.className, "flex h-screen w-full overflow-hidden bg-[#F2EDE4] text-[#3D1515]")}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(107, 26, 26, 0.1); border-radius: 10px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      {/* --- EDITOR COLUMN (LEFT) --- */}
      <div style={{ width: `${editorWidth}%`, display: "flex", flexDirection: "column", borderRight: `1px solid ${COLORS.border}` }}>
        {/* Editor Header */}
        <div style={{ height: "48px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", padding: "0 16px", gap: "10px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E2D3BE" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E2D3BE" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E2D3BE" }} />
          </div>
          <div style={{ margin: "0 24px", padding: "4px 16px", background: "#EDE4D6", borderRadius: "6px", fontSize: "11px", fontWeight: 700, color: COLORS.accent, border: `1px solid ${COLORS.border}` }}>
            solution.py
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "16px", opacity: 0.4 }}>
            <span>\u238F</span>
            <span>\u21BB</span>
          </div>
          <button onClick={handleRun} disabled={running} style={{
            marginLeft: "12px", padding: "6px 18px", borderRadius: "6px", background: "#6B1A1A", color: "#F2EDE4", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center"
          }}>
            {running ? <Spinner size="12px" color="#F2EDE4" /> : "\u25B6 Run"}
          </button>
        </div>

        {/* Editor Area */}
        <div style={{ flex: 1, position: "relative" }}>
          <Editor
            height="100%"
            defaultLanguage="python"
            value={code}
            onChange={v => setCode(v || "")}
            onMount={onMount}
            options={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 14,
              backgroundColor: "#F2EDE4",
              minimap: { enabled: false },
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              theme: "light-theme",
              padding: { top: 24, bottom: 24 },
              lineNumbersMinChars: 3,
            }}
            beforeMount={(monaco) => {
              monaco.editor.defineTheme('light-theme', {
                base: 'vs',
                inherit: true,
                rules: [],
                colors: {
                  'editor.background': '#F2EDE4',
                  'editor.lineHighlightBackground': '#EDE4D6',
                  'editorLineNumber.foreground': '#3D151544',
                  'editorLineNumber.activeForeground': '#3D1515',
                }
              });
            }}
          />
        </div>

        {/* Editor Footer */}
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: "12px 16px", userSelect: "none" }}>
          <div style={{ fontSize: "11px", opacity: 0.5, letterSpacing: "0.03em" }}>
            Ln 7 . Col 54  7 lines  178 chars
          </div>
          <AnimatePresence>
            {output && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} style={{ marginTop: "12px", padding: "16px", background: "#EDE4D6", borderRadius: "10px", border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", opacity: 0.4 }}>OUTPUT</span>
                  <button onClick={() => navigator.clipboard.writeText(output)} style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: 700, opacity: 0.6, background: "none", border: "none", cursor: "pointer" }}>copy</button>
                </div>
                <pre style={{ margin: 0, fontSize: "11px", fontFamily: firaCode.style.fontFamily, opacity: 0.8, lineHeight: 1.6 }}>{output}</pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- RESIZE HANDLE --- */}
      <div onMouseDown={() => { dragRef.current = true; document.body.style.cursor = "col-resize"; }}
        style={{ width: "1px", height: "100%", background: COLORS.border, cursor: "col-resize", zIndex: 10, position: "relative" }}>
        <div style={{ position: "absolute", left: -3, width: 7, height: "100%", opacity: 0 }} />
      </div>

      {/* --- CHAT COLUMN (RIGHT) --- */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: COLORS.bg }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px" }}>
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
              display: "flex", gap: "16px", marginBottom: "32px", flexDirection: m.role === "user" ? "row-reverse" : "row"
            }}>
              {/* Avatar */}
              <div style={{
                width: "36px", height: "36px", borderRadius: "8px", background: m.role === "assistant" ? "#6B1A1A" : "#D4CCC0",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 900, flexShrink: 0, boxShadow: "0 4px 12px rgba(107, 26, 26, 0.15)"
              }}>
                {m.role === "assistant" ? "CB" : "U"}
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                <div style={{ fontSize: "9px", opacity: 0.3, fontWeight: 700, margin: "0 4px" }}>
                  {m.role === "assistant" ? "CodeBuddy" : "You"} \u00B7 {m.time}
                </div>
                <div style={{
                  padding: "16px 20px", borderRadius: "16px", fontSize: "13px", lineHeight: "1.6",
                  background: m.role === "assistant" ? COLORS.bubble_ai : COLORS.bubble_user,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  whiteSpace: "pre-wrap"
                }}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {/* Problem Banner Tag */}
          <div style={{ display: "flex", justifyContent: "center", margin: "40px 0" }}>
             <div style={{ padding: "6px 20px", borderRadius: "99px", background: "#FDFCFB", border: `1px solid ${COLORS.border}`, fontSize: "10px", fontWeight: 700, color: COLORS.accent, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                \u2022 ARRAYS \u0026 HASHING
             </div>
          </div>
          {typing && (
            <div style={{ display: "flex", gap: "4px", padding: "12px 60px" }}>
              {[0, 0.2, 0.4].map(d => (
                <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.accent, opacity: 0.3, animation: `pulse 1.2s ${d}s infinite` }} />
              ))}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Action Bar */}
        <div style={{ padding: "0 40px 24px", display: "flex", gap: "8px", overflowX: "auto" }}>
          {[
            { label: "Hint", icon: "\uD83D\uDCA1" },
            { label: "Next", icon: "\u2192" },
            { label: "Reset", icon: "\u21BA" },
            { label: "Approach", icon: "\uD83E\uDDD9" }
          ].map(btn => (
            <button key={btn.label} onClick={() => handleSendChat(btn.label)} style={{
              display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", background: "#FDFCFB", border: `1px solid ${COLORS.border}`, fontSize: "11px", fontWeight: 600, color: COLORS.text, cursor: "pointer", transition: "all 0.2s"
            }}>
              <span style={{ opacity: 0.7 }}>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div style={{ padding: "0 40px 40px", position: "relative" }}>
          <div style={{
            background: "#FDFCFB", border: `1px solid ${COLORS.border}`, borderRadius: "16px", padding: "16px", display: "flex", gap: "12px", alignItems: "flex-end", boxShadow: "0 4px 24px rgba(0,0,0,0.03)"
          }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
              placeholder="Ask for a hint, skip, or just chat..."
              style={{ flex: 1, minHeight: "24px", maxHeight: "120px", background: "none", border: "none", outline: "none", fontSize: "13px", color: COLORS.text, resize: "none" }}
            />
            <button onClick={() => handleSendChat()} style={{
              width: "32px", height: "32px", borderRadius: "8px", background: COLORS.accent, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              \u2191
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
