"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Playfair_Display, DM_Sans, Fira_Code } from "next/font/google";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const firaCode = Fira_Code({ subsets: ["latin"], weight: ["400"] });

const CREAM = "#F2EDE4";
const RED = "#6B1A1A";
const RED_MID = "#8B2222";

// ── Debugger data (register.js flavour) ───────────────────────
const CODE_LINES = [
  { tokens: [{ t: "comment", v: "// register.js  —  new user flow" }], bp: false, err: false },
  { tokens: [], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "async function " }, { t: "fn", v: "createUser" }, { t: "plain", v: "(" }, { t: "param", v: "data" }, { t: "plain", v: ") {" }], bp: true, err: false },
  { tokens: [{ t: "keyword", v: "  const " }, { t: "param", v: "exists" }, { t: "plain", v: " = " }, { t: "keyword", v: "await " }, { t: "fn", v: "db.findByEmail" }, { t: "plain", v: "(" }, { t: "param", v: "data" }, { t: "plain", v: ".email);" }], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "  if " }, { t: "plain", v: "(" }, { t: "param", v: "exists" }, { t: "plain", v: ") {" }], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "    throw " }, { t: "keyword", v: "new " }, { t: "fn", v: "Error" }, { t: "plain", v: "(" }, { t: "string", v: '"Email already taken"' }, { t: "plain", v: ");" }], bp: false, err: true },
  { tokens: [{ t: "plain", v: "  }" }], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "  const " }, { t: "param", v: "hash" }, { t: "plain", v: " = " }, { t: "keyword", v: "await " }, { t: "fn", v: "bcrypt.hash" }, { t: "plain", v: "(" }, { t: "param", v: "data" }, { t: "plain", v: ".pwd, " }, { t: "num", v: "12" }, { t: "plain", v: ");" }], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "  return " }, { t: "keyword", v: "await " }, { t: "fn", v: "db.insert" }, { t: "plain", v: "({ ..." }, { t: "param", v: "data" }, { t: "plain", v: ", " }, { t: "param", v: "hash" }, { t: "plain", v: " });" }], bp: false, err: false },
  { tokens: [{ t: "plain", v: "}" }], bp: false, err: false },
  { tokens: [], bp: false, err: false },
  { tokens: [{ t: "fn", v: "createUser" }, { t: "plain", v: "({ email: " }, { t: "string", v: '"dev@test.io"' }, { t: "plain", v: ", pwd: " }, { t: "string", v: '"••••••"' }, { t: "plain", v: " });" }], bp: false, err: false },
];

const CONSOLE_STEPS = [
  { type: "info",    text: "Debugger attached  •  PID 5120",              delay: 300  },
  { type: "log",     text: '> createUser({ email: "dev@test.io" })',       delay: 850  },
  { type: "log",     text: "> db.findByEmail()  →  checking...",          delay: 1500 },
  { type: "warn",    text: '⚠  Email "dev@test.io" already exists',       delay: 2200 },
  { type: "error",   text: '✖  Uncaught Error: "Email already taken"',    delay: 2900 },
  { type: "trace",   text: "    at createUser  register.js:6",            delay: 3100 },
  { type: "trace",   text: "    at Object.<anonymous>  register.js:12",   delay: 3250 },
  { type: "info",    text: "⏸  Paused on exception  —  line 6",           delay: 3700 },
  { type: "fix",     text: "✔  Patch: duplicate-check handled gracefully",delay: 5100 },
  { type: "success", text: "✔  User created  •  id: u_9xKz  •  200 OK",  delay: 6200 },
];

const TOKEN_COLORS: Record<string, string> = {
  keyword: "#c084fc",
  fn:      "#60a5fa",
  string:  "#4ade80",
  param:   "#fbbf24",
  num:     "#f97316",
  comment: "#6b7280",
  plain:   "#e2e8f0",
};

const CONSOLE_COLORS: Record<string, string> = {
  info:    "#60a5fa",
  log:     "#cbd5e1",
  warn:    "#fbbf24",
  error:   "#f87171",
  trace:   "#6b7280",
  fix:     "#a78bfa",
  success: "#4ade80",
};

// ── Debugger Panel ─────────────────────────────────────────────
function DebuggerPanel() {
  const [activeLine, setActiveLine]     = useState<number | null>(null);
  const [consoleLogs, setConsoleLogs]   = useState<any[]>([]);
  const [phase, setPhase]               = useState("idle");
  const [tick, setTick]                 = useState(0);
  const consoleRef                      = useRef<HTMLDivElement>(null);
  const stepTimer                       = useRef<NodeJS.Timeout | null>(null);

  const STEP_SEQUENCE = [2, 3, 4, 5, 5, 7, 8, 11];
  const [stepIdx, setStepIdx] = useState(0);

  function startCycle() {
    setActiveLine(null);
    setConsoleLogs([]);
    setPhase("running");
    setStepIdx(0);
    setTick(t => t + 1);
  }

  useEffect(() => { startCycle(); }, []);

  useEffect(() => {
    if (phase !== "running" && phase !== "paused") return;
    if (stepIdx >= STEP_SEQUENCE.length) return;

    const delay = stepIdx === 0 ? 600 : stepIdx === 3 ? 900 : stepIdx === 4 ? 600 : 420;

    stepTimer.current = setTimeout(() => {
      const lineIdx = STEP_SEQUENCE[stepIdx];
      setActiveLine(lineIdx);
      if (CODE_LINES[lineIdx].err && stepIdx === 4) {
        setPhase("paused");
      } else {
        setStepIdx(s => s + 1);
      }
    }, delay);

    return () => { if (stepTimer.current) clearTimeout(stepTimer.current); };
  }, [stepIdx, phase, tick]);

  useEffect(() => {
    if (phase !== "paused") return;
    const t = setTimeout(() => { setPhase("running"); setStepIdx(s => s + 1); }, 1800);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (stepIdx < STEP_SEQUENCE.length) return;
    setPhase("fixed");
    const t = setTimeout(() => startCycle(), 3200);
    return () => clearTimeout(t);
  }, [stepIdx]);

  useEffect(() => {
    const timers = CONSOLE_STEPS.map(step =>
      setTimeout(() => setConsoleLogs(prev => [...prev, step]), step.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [tick]);

  useEffect(() => {
    if (consoleRef.current)
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [consoleLogs]);

  const renderLine = (line: any, idx: number) => {
    return line.tokens.map((tok: any, i: number) => (
      <span key={i} style={{ color: TOKEN_COLORS[tok.t] || TOKEN_COLORS.plain }}>
        {tok.v}
      </span>
    ));
  };

  const statusLabel = phase === "running" ? "▶  Running"
    : phase === "paused" ? "⏸  Paused on exception"
    : phase === "fixed"  ? "✔  Fixed & passing"
    : "Idle";

  const statusColor = phase === "running" ? "#4ade80"
    : phase === "paused" ? "#f87171"
    : phase === "fixed"  ? "#a78bfa"
    : "#6b7280";

  return (
    <div className={cn(
      firaCode.className,
      "bg-[#0D0F16] rounded-2xl border border-[rgba(107,26,26,0.4)] shadow-[0_24px_64px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.03)] overflow-hidden w-[360px] text-[0.72rem]"
    )}>
      <div className="flex items-center gap-[7px] px-3.5 py-2.5 bg-[#161822] border-b border-white/[0.05]">
        <div className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E]" />
        <div className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
        <span className="ml-2 text-[#94A3B8] text-[0.7rem] tracking-wider">
          register.js
        </span>
        <div className="ml-auto flex gap-2.5">
          {["▶", "⏭", "↓", "↑"].map((sym, i) => (
            <span key={i} className={cn(
              "text-[0.75rem] cursor-pointer transition-colors",
              phase === "running" ? "text-[#60A5FA]" : "text-[#374151]"
            )}>{sym}</span>
          ))}
        </div>
      </div>

      <div className="py-2.5 leading-[1.75] max-h-[192px] overflow-hidden">
        {CODE_LINES.map((line, idx) => {
          const isActive = activeLine === idx;
          const isPaused = isActive && phase === "paused";
          return (
            <div key={idx} className={cn(
              "flex items-center transition-all duration-200 border-l-[3px]",
              isPaused ? "bg-[rgba(248,113,113,0.13)] border-[#F87171]"
                : isActive ? "bg-[rgba(96,165,250,0.08)] border-[#60A5FA]"
                  : "bg-transparent border-transparent"
            )}>
              <span className={cn(
                "min-w-[22px] text-center text-[0.65rem] pl-0.5",
                line.bp ? "text-[#F87171]" : "text-transparent"
              )}>●</span>
              <span className={cn(
                "min-w-[28px] text-right pr-3 select-none text-[0.65rem]",
                isActive ? "text-[#94A3B8]" : "text-[#374151]"
              )}>{idx + 1}</span>
              <span className={cn(
                line.err && phase === "paused" ? "underline decoration-wavy decoration-[#F87171]" : ""
              )}>
                {renderLine(line, idx)}
              </span>
              {isActive && (
                <span className={cn(
                  "ml-1.5 text-[0.65rem] animate-pulse",
                  isPaused ? "text-[#F87171]" : "text-[#60A5FA]"
                )}>
                  {isPaused ? "⬤" : "→"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-[1px] bg-white/[0.06]" />

      <div>
        <div className="px-3.5 py-1.5 bg-[#111318] flex justify-between items-center text-[0.64rem] tracking-[0.08em] uppercase text-[#475569]">
          <span>Console</span>
          <span style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
        </div>
        <div ref={consoleRef} className="px-3.5 py-2 max-h-[110px] overflow-y-auto bg-[#0A0B10] leading-[1.8]">
          {consoleLogs.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ color: CONSOLE_COLORS[log.type] || "#cbd5e1" }} className="text-[0.69rem]">
              {log.text}
            </motion.div>
          ))}
          <span className="inline-block w-[6px] h-[11px] bg-[#4ADE80] ml-0.5 align-middle animate-pulse" />
        </div>
      </div>

      <div className="px-3.5 py-1.5 bg-[#6B1A1A] flex justify-between text-[0.64rem] text-[#F2EDE4]/75 tracking-wider">
        <span>JS Debugger</span>
        <span>Ln {activeLine !== null ? activeLine + 1 : "—"}  ·  Col 1</span>
      </div>
    </div>
  );
}

// ── Particles ──────────────────────────────────────────────────
function Particles() {
  const [pts] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 3 + Math.random() * 6,
      delay: Math.random() * 4,
      dur: 3 + Math.random() * 3,
      filled: Math.random() > 0.4,
    }))
  );
  return (
    <div className="absolute inset-0 pointer-events-none">
      {pts.map(p => (
        <div key={p.id} className={cn("absolute rounded-full", p.filled ? "bg-[rgba(107,26,26,0.35)]" : "bg-transparent border-[1.5px] border-[rgba(107,26,26,0.28)]")}
          style={{ left:`${p.x}%`, top:`${p.y}%`, width:p.size, height:p.size }} />
      ))}
    </div>
  );
}

// ── Register Page ──────────────────────────────────────────────
export default function RegisterPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState<string|null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(cardRef.current, { opacity: 0, y: 28, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power3.out" });
    tl.fromTo(sideRef.current, { opacity: 0, x: -32 }, { opacity: 1, x: 0, duration: 0.9, ease: "power3.out" }, 0.2);
  }, []);

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  }

  return (
    <div className={cn(dmSans.className, "min-h-screen flex items-center justify-center bg-[#F2EDE4] relative overflow-hidden")}>
      <div className="fixed bottom-[-12vh] left-[-12vw] w-[65vw] h-[65vw] bg-[#6B1A1A] rounded-full z-0" />
      <div className="fixed top-[-8vw] right-[-8vw] w-[26vw] h-[26vw] bg-[rgba(107,26,26,0.1)] rounded-full z-0" />

      <Particles />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-11 p-6">
        <div ref={sideRef} className="flex flex-col items-center gap-3.5 order-2 md:order-1">
          <div className="flex items-center gap-2 text-[#F2EDE4]/80 text-[0.75rem] tracking-[0.1em] uppercase font-medium">
            <div className="w-[7px] h-[7px] rounded-full bg-[#F87171] shadow-[0_0_7px_#F87171] animate-pulse" />
            JS Debugger
          </div>
          <DebuggerPanel />
          <div className="text-[#F2EDE4]/40 text-[0.7rem] tracking-wider">Breakpoints · Call Stack · Console</div>
        </div>

        <div ref={cardRef} className="bg-[#F2EDE4]/80 backdrop-blur-3xl border border-[#6B1A1A]/15 rounded-[28px] p-11 pt-11 w-[360px] shadow-[0_8px_40px_rgba(107,26,26,0.13)] order-1 md:order-2">
          <h1 className={cn(playfair.className, "text-[2rem] font-bold text-[#6B1A1A] text-center mb-7 tracking-tight")}>Register Now</h1>
          <form onSubmit={handleRegister} className="space-y-3">
            {[
              { ph:"Full Name",        val:name,     set:setName,     type:"text",     k:"name"    },
              { ph:"Email Address",    val:email,    set:setEmail,    type:"email",    k:"email"   },
              { ph:"Password",         val:password, set:setPassword, type:"password", k:"pass"    },
              { ph:"Confirm Password", val:confirm,  set:setConfirm,  type:"password", k:"confirm" },
            ].map(({ ph, val, set, type, k }) => (
              <input key={k} type={type} placeholder={ph} value={val} onChange={e => set(e.target.value)} onFocus={() => setFocused(k)} onBlur={() => setFocused(null)}
                className={cn("w-full px-4.5 py-3 rounded-xl bg-white/60 border outline-none text-[0.9rem] text-[#2A1010] transition-all duration-200", focused === k ? "border-[#8B2222] ring-3 ring-[#6B1A1A]/10" : "border-[#6B1A1A]/20")} />
            ))}
            <button type="submit" disabled={loading} className={cn("w-full py-3.5 bg-[#6B1A1A] text-[#F2EDE4] rounded-xl font-semibold text-[0.92rem] tracking-widest uppercase transition-colors shadow-[0_4px_16px_rgba(107,26,26,0.25)] flex items-center justify-center gap-2.5", loading ? "bg-[#8B2222] cursor-not-allowed" : "cursor-pointer hover:bg-[#8B2222]")}>
              {loading && <div className="w-4 h-4 border-2 border-[#F2EDE4]/30 border-t-[#F2EDE4] rounded-full animate-spin" />}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <div className="flex items-center gap-2.5 my-4 text-[#5A3333] text-[0.82rem] opacity-70">
            <div className="flex-1 h-[1px] bg-[#6B1A1A]/18" />Or sign up with<div className="flex-1 h-[1px] bg-[#6B1A1A]/18" />
          </div>
          <div className="flex gap-3 mb-5">
            {[
              { label:"Facebook", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg> },
              { label:"Google",   icon:<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
            ].map(({ label, icon }) => (
              <button key={label} type="button" className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[#6B1A1A]/20 bg-white/55 text-[0.87rem] font-medium text-[#2A1010] cursor-pointer hover:bg-white/70 transition-colors">{icon}{label}</button>
            ))}
          </div>
          <p className="text-center text-[0.84rem] text-[#5A3333] opacity-85">Already a member?{" "}<a href="/login" className="text-[#6B1A1A] font-semibold hover:underline transition-all">Login Now</a></p>
        </div>
      </div>
    </div>
  );
}
