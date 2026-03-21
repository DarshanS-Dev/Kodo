"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ChevronRight,
  X,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart2,
  BookOpen,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#0d0d0d]">
      <Loader2 className="animate-spin text-[#EFEDE3]/30" size={24} />
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "kodo" | "user";

interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  streaming?: boolean;
  action?: {
    type: "open_problem";
    problem_id: string;
  };
  problemCard?: ProblemListItem | null;
}

interface ProblemListItem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
}

interface Problem extends ProblemListItem {
  description: string;
  examples: { input: string; output: string }[];
  test_cases: { input: string; output: string }[];
  starter_code: string;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API = "http://localhost:8000";

// Derived once on the client — never on the server
function getOrCreateUserId(): string {
  const existing = localStorage.getItem("kodo_user_id");
  if (existing) return existing;
  const id = `user_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("kodo_user_id", id);
  return id;
}

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  hard: "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

// ─── Pyodide singleton ────────────────────────────────────────────────────────

let pyodideInstance: any = null;
let pyodideLoading = false;
let pyodideCallbacks: ((py: any) => void)[] = [];

function loadPyodide(): Promise<any> {
  return new Promise((resolve) => {
    if (pyodideInstance) return resolve(pyodideInstance);
    pyodideCallbacks.push(resolve);
    if (pyodideLoading) return;
    pyodideLoading = true;
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
    script.async = true;
    script.onload = async () => {
      // @ts-ignore
      const py = await window.loadPyodide();
      pyodideInstance = py;
      pyodideCallbacks.forEach((cb) => cb(py));
      pyodideCallbacks = [];
    };
    document.body.appendChild(script);
  });
}

// ─── Helpers for test runner ──────────────────────────────────────────────────

// Extract the top-level function name from user code e.g. "def fib(n):" -> "fib"
function extractFunctionName(code: string): string | null {
  const match = code.match(/^def\s+(\w+)\s*\(/m);
  return match ? match[1] : null;
}

// Parse test input string into comma-separated Python args
// "5" -> "5"
// "[-1,0,3,5,9,12] 9" -> "[-1,0,3,5,9,12], 9"
function parseTestInput(raw: string): string {
  const trimmed = raw.trim();
  const args: string[] = [];
  let depth = 0;
  let current = "";
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed[i];
    if (ch === "[" || ch === "(" || ch === "{") depth++;
    else if (ch === "]" || ch === ")" || ch === "}") depth--;
    if (ch === " " && depth === 0 && current.trim()) {
      args.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args.join(", ");
}

// ─── Run code against test cases ──────────────────────────────────────────────

async function runAgainstTestCases(
  code: string,
  testCases: { input: string; output: string }[]
): Promise<TestResult[]> {
  const py = await loadPyodide();
  const fnName = extractFunctionName(code);
  const results: TestResult[] = [];

  for (const tc of testCases) {
    try {
      py.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);
      const args = parseTestInput(tc.input);
      // Define function, call it, print result
      const runnable = fnName
        ? `${code}\nprint(${fnName}(${args}))`
        : code;
      await py.runPythonAsync(runnable);
      const stdout = py.runPython("sys.stdout.getvalue()").trim();
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: stdout,
        passed: stdout === tc.expected,
      });
    } catch (err: any) {
      results.push({
        input: tc.input,
        expected: tc.expected,
        actual: `ERROR: ${err.message}`,
        passed: false,
      });
    }
  }

  return results;
}

// ─── Run code (stdout only) ───────────────────────────────────────────────────

async function runCodeOutput(code: string): Promise<string> {
  const py = await loadPyodide();
  py.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);
  try {
    await py.runPythonAsync(code);
    const out = py.runPython("sys.stdout.getvalue()");
    const err = py.runPython("sys.stderr.getvalue()");
    return (out || "") + (err ? `\n[stderr] ${err}` : "") || "(no output)";
  } catch (e: any) {
    return `[crash] ${e.message}`;
  }
}

// ─── ProblemCard component ─────────────────────────────────────────────────────

function ProblemCard({
  item,
  onStart,
}: {
  item: ProblemListItem;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 border border-white/10 rounded-xl bg-[#1a0a0a] overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-[#EFEDE3] font-semibold text-sm leading-snug">
            {item.title}
          </p>
          <span
            className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[item.difficulty] ?? "text-white/50"}`}
          >
            {item.difficulty}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-[#EFEDE3]/50 border border-white/5 uppercase tracking-wider"
            >
              {t}
            </span>
          ))}
        </div>
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#EFEDE3] text-[#3D1515] text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors"
        >
          <ChevronRight size={14} />
          Start Coding
        </button>
      </div>
    </motion.div>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────

function ChatBubble({
  msg,
  onStartProblem,
}: {
  msg: ChatMessage;
  onStartProblem: (id: string) => void;
}) {
  const isKodo = msg.role === "kodo";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isKodo ? "justify-start" : "justify-end"} mb-4`}
    >
      <div className={`max-w-[85%] ${isKodo ? "order-2" : "order-1"}`}>
        {isKodo && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EFEDE3] shadow-[0_0_6px_rgba(239,237,227,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EFEDE3]/40">
              Kōdo
            </span>
            {msg.streaming && (
              <span className="flex gap-0.5 ml-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-[#EFEDE3]/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            )}
          </div>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isKodo
              ? "bg-[#1a0808] border border-white/8 text-[#EFEDE3]/90 rounded-tl-sm"
              : "bg-[#EFEDE3]/10 border border-white/10 text-[#EFEDE3] rounded-tr-sm"
          }`}
        >
          {msg.content}
          {msg.streaming && (
            <span className="inline-block w-0.5 h-3.5 bg-[#EFEDE3]/60 ml-0.5 animate-pulse" />
          )}
        </div>

        {/* Problem card attached to message */}
        {msg.action?.type === "open_problem" && msg.problemCard && (
          <ProblemCard
            item={msg.problemCard}
            onStart={() => onStartProblem(msg.action!.problem_id)}
          />
        )}
      </div>
    </motion.div>
  );
}

// ─── TestResultsPanel ─────────────────────────────────────────────────────────

function TestResultsPanel({
  results,
  onClose,
}: {
  results: TestResult[];
  onClose: () => void;
}) {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 bg-[#0d0d0d]/98 z-30 flex flex-col overflow-hidden rounded-xl"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          {allPassed ? (
            <CheckCircle size={18} className="text-emerald-400" />
          ) : (
            <XCircle size={18} className="text-rose-400" />
          )}
          <span className="text-sm font-bold text-[#EFEDE3]">
            {passed}/{total} test cases passed
          </span>
        </div>
        <button onClick={onClose} className="text-[#EFEDE3]/40 hover:text-[#EFEDE3] transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {results.map((r, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 text-xs font-mono ${
              r.passed
                ? "border-emerald-400/20 bg-emerald-400/5"
                : "border-rose-400/20 bg-rose-400/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {r.passed ? (
                <CheckCircle size={12} className="text-emerald-400" />
              ) : (
                <XCircle size={12} className="text-rose-400" />
              )}
              <span className="text-[#EFEDE3]/60 uppercase tracking-wider text-[10px]">
                Case {i + 1}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[#EFEDE3]/30 text-[10px] mb-1">INPUT</p>
                <p className="text-[#EFEDE3]/70">{r.input}</p>
              </div>
              <div>
                <p className="text-[#EFEDE3]/30 text-[10px] mb-1">EXPECTED</p>
                <p className="text-[#EFEDE3]/70">{r.expected}</p>
              </div>
              <div>
                <p className="text-[#EFEDE3]/30 text-[10px] mb-1">GOT</p>
                <p className={r.passed ? "text-emerald-400" : "text-rose-400"}>
                  {r.actual}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── WeeklyInsightModal ────────────────────────────────────────────────────────

function WeeklyInsightModal({
  onClose,
  userId,
}: {
  onClose: () => void;
  userId: string;
}) {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/insight/weekly?user_id=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setInsight(typeof data === "string" ? data : JSON.stringify(data));
        setLoading(false);
      })
      .catch(() => {
        setInsight("Could not load weekly insight.");
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#1a0808] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-[#EFEDE3]/60" />
            <span className="text-sm font-black uppercase tracking-widest text-[#EFEDE3]">
              Weekly Insight
            </span>
          </div>
          <button onClick={onClose} className="text-[#EFEDE3]/40 hover:text-[#EFEDE3] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-3 text-[#EFEDE3]/40">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Reflecting on your week...</span>
            </div>
          ) : (
            <p className="text-[#EFEDE3]/80 text-sm leading-relaxed whitespace-pre-wrap">
              {insight}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkspacePage() {
  // ── userId — evaluated on client only, never during SSR ──
  // Initialised to "" so session/start waits until the real ID is known
  const [userId, setUserId] = useState<string>("");
  useEffect(() => { setUserId(getOrCreateUserId()); }, []);

  // ── Chat state ──
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── IDE state ──
  const [ideOpen, setIdeOpen] = useState(false);
  const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [problemDescOpen, setProblemDescOpen] = useState(true);
  const [attempts, setAttempts] = useState(0);

  // ── UI state ──
  const [showInsight, setShowInsight] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);

  // ── Scroll chat to bottom ──
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Preload Pyodide silently ──
  useEffect(() => {
    loadPyodide().then(() => setPyodideReady(true));
  }, []);

  // ── Session start — waits for real userId before firing ──────────────────
  useEffect(() => {
    if (!userId) return; // userId still initialising, wait for next render
    const startSession = async () => {
      const greetId = `kodo_${Date.now()}`;
      setMessages([
        {
          id: greetId,
          role: "kodo",
          content: "",
          streaming: true,
        },
      ]);

      try {
        const res = await fetch(`${API}/session/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        });
        const text = await res.text();
        // /session/start returns a plain string
        const greeting = text.startsWith('"') ? JSON.parse(text) : text;
        setMessages([
          {
            id: greetId,
            role: "kodo",
            content: greeting,
            streaming: false,
          },
        ]);
      } catch {
        setMessages([
          {
            id: greetId,
            role: "kodo",
            content:
              "Hey — I'm Kōdo. Something went wrong connecting to the server, but I'm here. What are you working on today?",
            streaming: false,
          },
        ]);
      }
    };

    startSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // fires once when userId is resolved from localStorage

  // ── Open a problem in the IDE ──────────────────────────────────────────────
  const openProblem = useCallback(async (problemId: string) => {
    try {
      const res = await fetch(`${API}/problem/${problemId}`);
      const problem: Problem = await res.json();
      setActiveProblem(problem);
      setCode(problem.starter_code);
      setConsoleOutput([]);
      setTestResults(null);
      setAttempts(0);
      setIdeOpen(true);
      setProblemDescOpen(true);
    } catch {
      // silently fail — chat will still be usable
    }
  }, []);

  // ── Fetch problem card — uses /problem/{id} directly, no full list needed ─
  const fetchProblemCard = useCallback(
    async (problemId: string): Promise<ProblemListItem | null> => {
      try {
        const res = await fetch(`${API}/problem/${problemId}`);
        const p: Problem = await res.json();
        if (p.id) return { id: p.id, title: p.title, difficulty: p.difficulty, tags: p.tags };
        return null;
      } catch {
        return null;
      }
    },
    []
  );

  // ── Send chat message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || chatLoading) return;
    setInput("");

    const userMsgId = `user_${Date.now()}`;
    const kodoMsgId = `kodo_${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: trimmed },
    ]);

    setChatLoading(true);

    try {
      const payload: Record<string, any> = {
        user_id: userId,
        query: trimmed,
      };

      // If user is currently in an IDE session, include context
      if (ideOpen && activeProblem) {
        payload.problem_id = activeProblem.id;
        payload.current_code = code;
      }

      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type") ?? "";

      // ── Case A: JSON response (contains action) ────────────────────────
      if (contentType.includes("application/json")) {
        const data = await res.json();

        let problemCard: ProblemListItem | null = null;
        if (data.action?.type === "open_problem") {
          problemCard = await fetchProblemCard(data.action.problem_id);
        }

        setMessages((prev) => [
          ...prev,
          {
            id: kodoMsgId,
            role: "kodo",
            content: data.message ?? "",
            streaming: false,
            action: data.action ?? undefined,
            problemCard,
          },
        ]);
      }
      // ── Case B: Streaming text/plain ───────────────────────────────────
      else {
        // Add a streaming placeholder
        setMessages((prev) => [
          ...prev,
          { id: kodoMsgId, role: "kodo", content: "", streaming: true },
        ]);

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let full = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          full += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === kodoMsgId
                ? { ...m, content: full, streaming: true }
                : m
            )
          );
        }

        // Mark streaming done
        setMessages((prev) =>
          prev.map((m) =>
            m.id === kodoMsgId ? { ...m, streaming: false } : m
          )
        );
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: kodoMsgId,
          role: "kodo",
          content: "I lost connection for a moment. Try again.",
          streaming: false,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [input, chatLoading, ideOpen, activeProblem, code, userId, fetchProblemCard]);

  // ── Run code (stdout) ──────────────────────────────────────────────────────
  const runCode = useCallback(async () => {
    if (!pyodideReady) {
      setConsoleOutput(["Pyodide is still loading, please wait..."]);
      return;
    }
    setIsRunning(true);
    setConsoleOutput([]);
    setTestResults(null);
    const out = await runCodeOutput(code);
    setConsoleOutput(out.split("\n"));
    setIsRunning(false);
  }, [code, pyodideReady]);

  // ── Submit code ────────────────────────────────────────────────────────────
  const submitCode = useCallback(async () => {
    if (!activeProblem || !pyodideReady) return;
    setIsSubmitting(true);
    setTestResults(null);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // 1. Run locally against test cases
    const results = await runAgainstTestCases(
      code,
      activeProblem.test_cases
    );
    setTestResults(results);

    const passed = results.every((r) => r.passed);

    // 2. Report to backend (backend stores behavioral analysis in memory)
    try {
      const res = await fetch(`${API}/problem/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          problem_id: activeProblem.id,
          code,
          passed,
          attempts: newAttempts,
        }),
      });
      const data = await res.json();

      // 3. Show Kōdo's feedback in the chat
      const feedbackId = `kodo_submit_${Date.now()}`;
      const emoji = passed ? "✓" : "✗";
      const intro = passed
        ? `Nice — you got it. Here's my read on how you solved it:`
        : `Not there yet. Here's what I observed:`;
      setMessages((prev) => [
        ...prev,
        {
          id: feedbackId,
          role: "kodo",
          content: `${emoji} **${activeProblem.title}** — ${passed ? "Passed" : "Failed"}\n\n${intro}\n\n${data.feedback ?? ""}`,
          streaming: false,
        },
      ]);
    } catch {
      // Backend unreachable — still show test results
    }

    setIsSubmitting(false);
  }, [activeProblem, code, attempts, pyodideReady, userId]);

  // ── Key handler for chat input ─────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#2a0f0f] flex overflow-hidden font-sans pt-0">

      {/* ── CHAT PANEL ──────────────────────────────────────────────────────── */}
      <motion.div
        animate={{ width: ideOpen ? "380px" : "100%" }}
        transition={{ duration: 0.5, ease: [0.32, 0, 0.67, 0] }}
        className="relative flex flex-col h-full bg-[#1e0909] border-r border-white/8 shrink-0"
        style={{ minWidth: ideOpen ? "320px" : undefined }}
      >
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#EFEDE3] shadow-[0_0_10px_rgba(239,237,227,0.9)] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#EFEDE3]">
              Kōdo
            </span>
            <span className="text-[10px] text-[#EFEDE3]/30 uppercase tracking-wider">
              Mentor
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!pyodideReady && (
              <span className="text-[10px] text-[#EFEDE3]/30 flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" />
                Loading runtime
              </span>
            )}
            <button
              onClick={() => setShowInsight(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#EFEDE3]/50 hover:text-[#EFEDE3] transition-all"
              title="Weekly Insight"
            >
              <BarChart2 size={14} />
            </button>
            {ideOpen && (
              <button
                onClick={() => setIdeOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#EFEDE3]/50 hover:text-[#EFEDE3] transition-all"
                title="Close IDE"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              msg={msg}
              onStartProblem={openProblem}
            />
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-5 pt-3 border-t border-white/8">
          {ideOpen && activeProblem && (
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Zap size={10} className="text-[#EFEDE3]/30" />
              <span className="text-[10px] text-[#EFEDE3]/30">
                Kōdo can see your current code
              </span>
            </div>
          )}
          <div className="flex items-end gap-2 bg-[#0d0404] border border-white/10 rounded-xl px-3 py-2 focus-within:border-white/25 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                ideOpen
                  ? "Ask for a hint, explain your approach..."
                  : "Ask for a problem, or just say hi..."
              }
              rows={1}
              className="flex-1 bg-transparent text-[#EFEDE3] text-sm placeholder-[#EFEDE3]/25 resize-none outline-none leading-relaxed max-h-32 overflow-y-auto"
              style={{ fieldSizing: "content" } as any}
              disabled={chatLoading}
            />
            <button
              onClick={sendMessage}
              disabled={chatLoading || !input.trim()}
              className="shrink-0 w-7 h-7 rounded-lg bg-[#EFEDE3] text-[#3D1515] flex items-center justify-center hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {chatLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={12} />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── IDE PANEL ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {ideOpen && activeProblem && (
          <motion.div
            key="ide"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.4, ease: [0.32, 0, 0.67, 0] }}
            className="flex-1 flex flex-col h-full bg-[#0d0404] overflow-hidden"
          >
            {/* IDE header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-[#1a0808] shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[#EFEDE3] font-semibold text-sm">
                  {activeProblem.title}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${DIFFICULTY_COLOR[activeProblem.difficulty]}`}
                >
                  {activeProblem.difficulty}
                </span>
                {activeProblem.tags.map((t) => (
                  <span
                    key={t}
                    className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-[#EFEDE3]/40 border border-white/5 uppercase tracking-wider"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#EFEDE3]/30">
                  Attempts: {attempts}
                </span>
                <button
                  onClick={() => setCode(activeProblem.starter_code)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#EFEDE3]/40 hover:text-[#EFEDE3] transition-all"
                  title="Reset code"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left: problem desc + editor stacked */}
              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Problem description (collapsible) */}
                <div
                  className={`border-b border-white/8 bg-[#120606] transition-all duration-300 overflow-hidden ${
                    problemDescOpen ? "max-h-64" : "max-h-10"
                  }`}
                >
                  <button
                    onClick={() => setProblemDescOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-[#EFEDE3]/60 hover:text-[#EFEDE3] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        Problem
                      </span>
                    </div>
                    {problemDescOpen ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>
                  {problemDescOpen && (
                    <div className="px-4 pb-4 overflow-y-auto max-h-52 space-y-3">
                      <p className="text-[#EFEDE3]/75 text-xs leading-relaxed">
                        {activeProblem.description}
                      </p>
                      {activeProblem.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="bg-black/30 rounded-lg p-3 font-mono text-xs space-y-1"
                        >
                          <p className="text-[#EFEDE3]/40 uppercase text-[10px] tracking-wider">
                            Example {i + 1}
                          </p>
                          <p className="text-[#EFEDE3]/70">
                            <span className="text-[#EFEDE3]/40">Input: </span>
                            {ex.input}
                          </p>
                          <p className="text-[#EFEDE3]/70">
                            <span className="text-[#EFEDE3]/40">Output: </span>
                            {ex.output}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Monaco editor */}
                <div className="flex-1 relative overflow-hidden">
                  <MonacoEditor
                    height="100%"
                    defaultLanguage="python"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val ?? "")}
                    options={{
                      fontSize: 13,
                      fontFamily: "JetBrains Mono, Fira Code, monospace",
                      minimap: { enabled: false },
                      padding: { top: 16 },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: "line",
                    }}
                  />

                  {/* Test results overlay */}
                  <AnimatePresence>
                    {testResults && (
                      <TestResultsPanel
                        results={testResults}
                        onClose={() => setTestResults(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* Console output */}
                <div className="h-32 border-t border-white/8 bg-[#080202] flex flex-col shrink-0">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                    <span className="text-[10px] font-mono text-[#EFEDE3]/30 uppercase tracking-widest">
                      Console
                    </span>
                    <button
                      onClick={() => setConsoleOutput([])}
                      className="text-[#EFEDE3]/20 hover:text-[#EFEDE3]/50 transition-colors text-[10px]"
                    >
                      clear
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-2 font-mono text-xs text-[#EFEDE3]/60">
                    {consoleOutput.length === 0 ? (
                      <span className="text-[#EFEDE3]/20">
                        Run your code to see output...
                      </span>
                    ) : (
                      consoleOutput.map((line, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-[#EFEDE3]/20 select-none">
                            {">"}
                          </span>
                          <span>{line}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right sidebar: action buttons */}
              <div className="w-14 flex flex-col items-center py-4 gap-3 border-l border-white/8 bg-[#120606] shrink-0">
                <button
                  onClick={runCode}
                  disabled={isRunning || !pyodideReady}
                  title="Run"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-[#EFEDE3]/15 text-[#EFEDE3]/60 hover:text-[#EFEDE3] flex items-center justify-center transition-all disabled:opacity-30"
                >
                  {isRunning ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Play size={15} fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={submitCode}
                  disabled={isSubmitting || !pyodideReady}
                  title="Submit"
                  className="w-9 h-9 rounded-xl bg-[#EFEDE3]/10 hover:bg-[#EFEDE3]/20 text-[#EFEDE3] flex items-center justify-center transition-all disabled:opacity-30"
                >
                  {isSubmitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle size={15} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Weekly Insight Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showInsight && (
          <WeeklyInsightModal onClose={() => setShowInsight(false)} userId={userId} />
        )}
      </AnimatePresence>
    </div>
  );
}