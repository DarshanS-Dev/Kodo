"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, Play, RefreshCw, Trash2, Terminal,
  Circle, CheckCircle2, XCircle, FlaskConical, Trophy, X,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

declare global {
  interface Window { loadPyodide: (config?: object) => Promise<unknown>; }
}

// ─── Constants ────────────────────────────────────────────────────────────────
const API = "https://kodo-yx1z.onrender.com";

// Helper to get consistent user ID
const getUserId = () => {
  if (typeof window === "undefined") return "user_001";
  return localStorage.getItem("kodo_user_id") ?? "user_001";
};

// Helper to extract function name from starter code
const getFuncName = (starterCode: string) => {
  const match = starterCode.match(/def\s+(\w+)\s*\(/);
  return match ? match[1] : null;
};

// Helper to format test case inputs into valid Python arguments
const formatArgs = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) return "";

  let processed = trimmed;
  if (trimmed.includes(" ") && (trimmed.includes("[") || trimmed.includes("{"))) {
    processed = processed.replace(/\]\s+/g, "], ");
    processed = processed.replace(/\}\s+/g, "}, ");
    processed = processed.replace(/\)\s+/g, "), ");
  } else if (trimmed.includes(" ") && !trimmed.startsWith("'") && !trimmed.startsWith('"') && !trimmed.startsWith("[")) {
    processed = processed.split(/\s+/).join(", ");
  }

  const isNumeric = !isNaN(Number(processed));
  const isBracketed = processed.startsWith("[") || processed.startsWith("{") || processed.startsWith("(");
  const isQuoted = (processed.startsWith("'") && processed.endsWith("'")) || (processed.startsWith('"') && processed.endsWith('"'));
  const isReserved = ["True", "False", "None"].includes(processed);

  if (!isNumeric && !isBracketed && !isQuoted && !isReserved && processed.length > 0 && !processed.includes(",")) {
    return `'${processed}'`;
  }

  return processed;
};
const STARTER_CODE = `# Welcome to Kōdo IDE
# Python runs entirely in your browser!

def greet(name):
    return f"Hello, {name}! Welcome to Kōdo."

print(greet("World"))

numbers = [1, 2, 3, 4, 5]
print(f"Sum: {sum(numbers)}")
print(f"Average: {sum(numbers) / len(numbers)}")
`;

const DIFF_COLOR: Record<string, string> = {
  easy: "text-green-400", medium: "text-yellow-400", hard: "text-red-400",
};
const DIFF_BG: Record<string, string> = {
  easy: "bg-green-400/10 border-green-400/20",
  medium: "bg-yellow-400/10 border-yellow-400/20",
  hard: "bg-red-400/10 border-red-400/20",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type OutputLine = { text: string; type: "stdout" | "stderr" | "system" | "info" };

type TestResult = {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
};

interface EditorProblem {
  id: string;
  title?: string;
  difficulty?: string;
  description?: string;
  test_cases?: { input: string; output: string }[];
  starter_code?: string;
}

interface EditorProps {
  problem?: EditorProblem;
  onSubmit?: (passed: boolean, code: string, attempts: number) => void;
}

// ─── Test results overlay ─────────────────────────────────────────────────────
function TestResultsPanel({ results, onClose }: { results: TestResult[]; onClose: () => void }) {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-white/10 z-20 max-h-[55%] flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          {allPassed
            ? <Trophy size={13} className="text-yellow-400" />
            : <FlaskConical size={13} className="text-[#EFEDE3]/40" />
          }
          <span className="text-[12px] font-bold text-[#EFEDE3]/70">
            Test Results — {passed}/{total} passed
          </span>
          {allPassed && (
            <span className="px-2 py-0.5 bg-green-400/15 border border-green-400/20 rounded text-[10px] font-bold text-green-400">
              ALL PASSED
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 text-[#EFEDE3]/25 hover:text-[#EFEDE3]/60 transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="overflow-y-auto p-3 space-y-2">
        {results.map((r, i) => (
          <div key={i} className={`flex items-start gap-3 p-2.5 rounded-lg border ${r.passed ? "bg-green-400/5 border-green-400/15" : "bg-red-400/5 border-red-400/15"
            }`}>
            {r.passed
              ? <CheckCircle2 size={14} className="text-green-400 shrink-0 mt-0.5" />
              : <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            }
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-[#EFEDE3]/40">Input:</span>
                <code className="text-[#EFEDE3]/70">{r.input}</code>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-[#EFEDE3]/40">Expected:</span>
                <code className="text-green-400/70">{r.expected}</code>
              </div>
              {!r.passed && (
                <div className="flex items-center gap-3 text-[11px] font-mono">
                  <span className="text-[#EFEDE3]/40">Got:</span>
                  <code className="text-red-400/70">{r.actual || "(no output)"}</code>
                </div>
              )}
            </div>
            <span className={`text-[10px] font-bold shrink-0 ${r.passed ? "text-green-400" : "text-red-400"}`}>
              {r.passed ? "PASS" : "FAIL"}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Editor Component ────────────────────────────────────────────────────
export function KodoEditor({ problem, onSubmit }: EditorProps) {
  const [code, setCode] = useState(problem?.starter_code ?? STARTER_CODE);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState<"loading" | "ready" | "error">("loading");
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [attempts, setAttempts] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pyodideRef = useRef<any>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Reset when problem changes
  useEffect(() => {
    if (problem?.starter_code) {
      setCode(problem.starter_code);
      setTestResults(null);
      setAttempts(0);
    }
  }, [problem?.id, problem?.starter_code]);

  useEffect(() => { outputEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [output]);

  const addOutput = (text: string, type: OutputLine["type"]) =>
    setOutput((prev) => [...prev, { text, type }]);

  // Load Pyodide once
  useEffect(() => {
    if (pyodideRef.current) return;
    const load = async () => {
      try {
        if (!document.getElementById("pyodide-script")) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.id = "pyodide-script";
            s.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load Pyodide"));
            document.head.appendChild(s);
          });
        }
        const py = await window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" });
        pyodideRef.current = py;
        setPyodideStatus("ready");
        setOutput([{ text: "✓ Python runtime ready.", type: "system" }]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setPyodideStatus("error");
        setOutput([{ text: `✗ ${msg}`, type: "stderr" }]);
      }
    };
    load();
  }, []);

  // Run code normally (no tests)
  const runCode = useCallback(async () => {
    const py = pyodideRef.current;
    if (!py || pyodideStatus !== "ready") { addOutput("Runtime loading...", "info"); return; }
    setIsRunning(true);
    setOutput([]);
    setTestResults(null);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const funcName = getFuncName(problem?.starter_code ?? "");

    // If no test cases or no problem, just run the code and show output
    if (!problem || !problem.test_cases || problem.test_cases.length === 0) {
      try {
        const escaped = code.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
        await py.runPythonAsync(`
import sys, io, traceback
_out = io.StringIO(); _err = io.StringIO()
sys.stdout = _out; sys.stderr = _err
try:
    exec("""${escaped}""", {})
except SystemExit: pass
except Exception: traceback.print_exc()
sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__
_kodo_stdout = _out.getvalue(); _kodo_stderr = _err.getvalue()
        `);
        const stdout: string = py.globals.get("_kodo_stdout") ?? "";
        const stderr: string = py.globals.get("_kodo_stderr") ?? "";
        if (stdout.trim()) stdout.split("\n").forEach((l) => l && addOutput(l, "stdout"));
        if (stderr.trim()) stderr.split("\n").forEach((l) => l && addOutput(l, "stderr"));
        if (!stdout.trim() && !stderr.trim()) addOutput("Executed (no output).", "system");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        addOutput(`Error: ${msg}`, "stderr");
      }
      setIsRunning(false);
      return;
    }

    // Run against each test case
    const results: TestResult[] = [];
    const logs: string[] = [];

    for (const tc of problem.test_cases) {
      try {
        const escaped = code.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"');
        const formattedArgs = formatArgs(tc.input);

        // Execute user code, then call the function and print with a delimiter
        const testScript = funcName
          ? `${escaped}\n_kodo_res = ${funcName}(${formattedArgs})\nprint(f"__KODO_RES__:{_kodo_res}")`
          : escaped;

        await py.runPythonAsync(`
import sys, io, traceback
_out = io.StringIO(); _err = io.StringIO()
sys.stdout = _out; sys.stderr = _err
try:
    _ns = {}
    exec("""${testScript.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"')}""", _ns)
except SystemExit: pass
except Exception: traceback.print_exc()
sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__
_kodo_stdout = _out.getvalue().strip(); _kodo_stderr = _err.getvalue().strip()
        `);

        const rawOutput: string = py.globals.get("_kodo_stdout") ?? "";
        const stderr: string = (py.globals.get("_kodo_stderr") ?? "").trim();

        if (stderr) {
          results.push({ input: tc.input, expected: tc.output, actual: `Error: ${stderr}`, passed: false });
          logs.push(`Test: ${tc.input} => [ERROR] ${stderr} ❌`);
        } else {
          // Extract result from the __KODO_RES__ marker
          // This allows user to have their own print statements without breaking tests
          const match = rawOutput.match(/__KODO_RES__:(.*)$/m);
          const actual = match ? match[1].trim() : rawOutput.trim();

          const expected = tc.output.trim();

          // Improved normalization: handle booleans, lists, and quotes
          const normalize = (s: string) => s.toLowerCase().replace(/^['"]|['"]$/g, "").replace(/\s+/g, "");
          const passed = normalize(actual) === normalize(expected) || actual === expected;

          results.push({ input: tc.input, expected, actual, passed });
          logs.push(`Test: ${tc.input} => got: ${actual} | expected: ${expected} ${passed ? "✅" : "❌"}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ input: tc.input, expected: tc.output, actual: msg, passed: false });
        logs.push(`Test: ${tc.input} => [CRASH] ${msg} ❌`);
      }
    }

    const allPassed = results.every((r) => r.passed);
    const summary = allPassed
      ? `✅ All ${results.length} tests passed!`
      : `❌ ${results.filter((r) => r.passed).length}/${results.length} tests passed`;

    setOutput([{ text: summary, type: allPassed ? "system" : "stderr" }, ...logs.map((l) => ({ text: l, type: "stdout" as const }))]);
    setTestResults(results);

    // Notify parent
    onSubmit?.(allPassed, code, newAttempts);

    setIsRunning(false);
  }, [code, pyodideStatus, problem, attempts, onSubmit]);

  // Validate button (runs test cases only)
  const validateCode = useCallback(async () => {
    if (!problem?.test_cases || problem.test_cases.length === 0) return;
    setIsValidating(true);
    await runCode();
    setIsValidating(false);
  }, [runCode, problem]);

  // ⌘+Enter to run
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); runCode(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [runCode]);

  const statusColor = { loading: "text-yellow-400", ready: "text-green-400", error: "text-red-400" }[pyodideStatus];
  const statusLabel = { loading: "Loading...", ready: "Python 3.11", error: "Error" }[pyodideStatus];

  return (
    <div className="flex h-full w-full flex-col bg-[#0f0f0f] overflow-hidden relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-10 bg-[#1a1a1a] border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex items-center gap-2 px-2.5 py-0.5 bg-[#2a2a2a] rounded text-[11px] text-[#EFEDE3]/50 font-mono border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/70" />
            {problem?.title ? `${problem.title.toLowerCase().replace(/ /g, "_")}.py` : "main.py"}
          </div>
          {problem?.difficulty && (
            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${DIFF_BG[problem.difficulty]} ${DIFF_COLOR[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-[10px] font-mono ${statusColor}`}>
            <Circle size={6} fill="currentColor" className={pyodideStatus === "loading" ? "animate-pulse" : ""} />
            {statusLabel}
          </div>
          <span className="text-[#EFEDE3]/15 text-[9px] font-mono hidden sm:block">⌘+Enter</span>
          <button onClick={() => { setOutput([]); setTestResults(null); }} title="Clear"
            className="p-1 rounded text-[#EFEDE3]/20 hover:text-[#EFEDE3]/60 hover:bg-white/5 transition-all">
            <Trash2 size={11} />
          </button>

          {problem?.test_cases && problem.test_cases.length > 0 && (
            <button onClick={validateCode} disabled={isValidating || pyodideStatus !== "ready"}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#5C2020] hover:bg-[#6d2525] border border-white/10 text-[#EFEDE3]/80 hover:text-[#EFEDE3] rounded text-[11px] font-bold transition-all disabled:opacity-40">
              {isValidating
                ? <><RefreshCw size={10} className="animate-spin" />Testing...</>
                : <><FlaskConical size={10} />Validate</>
              }
            </button>
          )}

          <button onClick={runCode} disabled={isRunning || pyodideStatus !== "ready"}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#EFEDE3] hover:bg-white text-[#1a1a1a] rounded text-[11px] font-bold transition-all disabled:opacity-40">
            {isRunning
              ? <><RefreshCw size={10} className="animate-spin" />Running</>
              : <><Play size={10} fill="currentColor" />Run</>
            }
          </button>
        </div>
      </div>

      {/* Problem description */}
      {problem?.description && (
        <div className="px-4 py-2 bg-[#160808] border-b border-white/5 shrink-0">
          <p className="text-[11px] text-[#EFEDE3]/40 leading-relaxed line-clamp-2">{problem.description}</p>
        </div>
      )}

      {/* Monaco editor */}
      <div className="flex-[65] min-h-0">
        <MonacoEditor height="100%" defaultLanguage="python" theme="vs-dark" value={code}
          onChange={(v) => setCode(v ?? "")}
          options={{
            fontSize: 13, fontFamily: "'JetBrains Mono','Fira Code',monospace", fontLigatures: true,
            minimap: { enabled: false }, padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false, automaticLayout: true, tabSize: 4,
            lineNumbers: "on", renderLineHighlight: "line", cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on", smoothScrolling: true,
            bracketPairColorization: { enabled: true }, wordWrap: "on",
            scrollbar: { verticalScrollbarSize: 3, horizontalScrollbarSize: 3 },
          }}
        />
      </div>

      <div className="h-[1px] bg-white/5 shrink-0" />

      {/* Console output */}
      <div className="flex-[35] min-h-0 flex flex-col bg-[#0d0d0d]">
        <div className="flex items-center justify-between px-4 h-8 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-[#EFEDE3]/25 text-[10px] font-mono uppercase tracking-widest">
            <Terminal size={10} />Console
          </div>
          {output.length > 0 && (
            <span className="text-[#EFEDE3]/15 text-[10px] font-mono">{output.length} lines</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[12px] space-y-0.5">
          {output.length === 0
            ? <div className="text-[#EFEDE3]/15 italic text-[11px] pt-1">Run your code to see output...</div>
            : output.map((line, idx) => (
              <div key={idx} className={`flex items-start gap-2 leading-relaxed ${line.type === "stderr" ? "text-red-400"
                : line.type === "system" ? "text-[#EFEDE3]/20 italic text-[10px]"
                  : line.type === "info" ? "text-yellow-400/50"
                    : "text-[#EFEDE3]"
                }`}>
                {line.type === "stdout" && <ChevronRight size={10} className="mt-1 shrink-0 text-[#EFEDE3]/15" />}
                {line.type === "stderr" && <span className="shrink-0 text-[9px] font-bold text-red-400 mt-0.5">ERR</span>}
                <span className="whitespace-pre-wrap break-all">{line.text}</span>
              </div>
            ))
          }
          <div ref={outputEndRef} />
        </div>
      </div>

      {/* Test results overlay */}
      <AnimatePresence>
        {testResults && (
          <TestResultsPanel results={testResults} onClose={() => setTestResults(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}