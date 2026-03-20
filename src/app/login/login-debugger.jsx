import { useState, useEffect, useRef } from "react";

const CREAM = "#F2EDE4";
const RED = "#6B1A1A";
const RED_MID = "#8B2222";

// ── Debugger data ──────────────────────────────────────────────
const CODE_LINES = [
  { tokens: [{ t: "comment", v: "// login.js  —  checking session" }], bp: false, err: false },
  { tokens: [], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "function " }, { t: "fn", v: "validateUser" }, { t: "plain", v: "(" }, { t: "param", v: "payload" }, { t: "plain", v: ") {" }], bp: true, err: false },
  { tokens: [{ t: "keyword", v: "  const " }, { t: "param", v: "user" }, { t: "plain", v: " = " }, { t: "fn", v: "db.find" }, { t: "plain", v: "(" }, { t: "param", v: "payload" }, { t: "plain", v: ".id);" }], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "  if " }, { t: "plain", v: "(" }, { t: "param", v: "user" }, { t: "plain", v: " === " }, { t: "keyword", v: "null" }, { t: "plain", v: ") {" }], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "    throw " }, { t: "keyword", v: "new " }, { t: "fn", v: "Error" }, { t: "plain", v: "(" }, { t: "string", v: '"User not found"' }, { t: "plain", v: ");" }], bp: false, err: true },
  { tokens: [{ t: "plain", v: "  }" }], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "  return " }, { t: "param", v: "user" }, { t: "plain", v: ".session;" }], bp: false, err: false },
  { tokens: [{ t: "plain", v: "}" }], bp: false, err: false },
  { tokens: [], bp: false, err: false },
  { tokens: [{ t: "keyword", v: "const " }, { t: "param", v: "session" }, { t: "plain", v: " = " }, { t: "fn", v: "validateUser" }, { t: "plain", v: "({ id: " }, { t: "num", v: "42" }, { t: "plain", v: " });" }], bp: false, err: false },
  { tokens: [{ t: "fn", v: "console" }, { t: "plain", v: "." }, { t: "fn", v: "log" }, { t: "plain", v: "(" }, { t: "string", v: '"session →"' }, { t: "plain", v: ", " }, { t: "param", v: "session" }, { t: "plain", v: ");" }], bp: false, err: false },
];

// Console log sequence
const CONSOLE_STEPS = [
  { type: "info",    text: "Debugger attached  •  PID 8341",           delay: 300 },
  { type: "log",     text: "> validateUser({ id: 42 })",               delay: 900 },
  { type: "warn",    text: "⚠  db.find() returned null",               delay: 1700 },
  { type: "error",   text: '✖  Uncaught Error: "User not found"',      delay: 2500 },
  { type: "trace",   text: "    at validateUser  login.js:6",          delay: 2700 },
  { type: "trace",   text: "    at Object.<anonymous>  login.js:11",   delay: 2850 },
  { type: "info",    text: "⏸  Paused on exception  —  line 6",        delay: 3400 },
  { type: "fix",     text: "✔  Patch applied: null-check added",       delay: 5000 },
  { type: "success", text: "✔  session → { token: 'x9kZ...', ttl: 3600 }", delay: 6000 },
];

const TOKEN_COLORS = {
  keyword: "#c084fc",
  fn:      "#60a5fa",
  string:  "#4ade80",
  param:   "#fbbf24",
  num:     "#f97316",
  comment: "#6b7280",
  plain:   "#e2e8f0",
};

const CONSOLE_COLORS = {
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
  const [activeLine, setActiveLine]     = useState(null);   // currently stepped line
  const [consoleLogs, setConsoleLogs]   = useState([]);
  const [phase, setPhase]               = useState("idle"); // idle | running | paused | fixed
  const [tick, setTick]                 = useState(0);
  const consoleRef                      = useRef(null);
  const stepTimer                       = useRef(null);

  // Step-through highlight: lines 3→4→5→6 (indices)
  const STEP_SEQUENCE = [2, 3, 4, 5, 5, 7, 10, 11];
  const [stepIdx, setStepIdx] = useState(0);

  // Kick off cycle
  function startCycle() {
    setActiveLine(null);
    setConsoleLogs([]);
    setPhase("running");
    setStepIdx(0);
    setTick(t => t + 1);
  }

  // Auto-start
  useEffect(() => { startCycle(); }, []);

  // Step through lines with timing
  useEffect(() => {
    if (phase !== "running" && phase !== "paused") return;
    if (stepIdx >= STEP_SEQUENCE.length) return;

    const delay = stepIdx === 0 ? 600 :
                  stepIdx === 3 ? 900 :   // linger on error line
                  stepIdx === 4 ? 600 : 420;

    stepTimer.current = setTimeout(() => {
      const lineIdx = STEP_SEQUENCE[stepIdx];
      setActiveLine(lineIdx);

      // pause on error line
      if (CODE_LINES[lineIdx].err && stepIdx === 4) {
        setPhase("paused");
      } else {
        setStepIdx(s => s + 1);
      }
    }, delay);

    return () => clearTimeout(stepTimer.current);
  }, [stepIdx, phase, tick]);

  // Resume after pause
  useEffect(() => {
    if (phase !== "paused") return;
    const t = setTimeout(() => {
      setPhase("running");
      setStepIdx(s => s + 1);
    }, 1800);
    return () => clearTimeout(t);
  }, [phase]);

  // Mark fixed then restart
  useEffect(() => {
    if (stepIdx < STEP_SEQUENCE.length) return;
    setPhase("fixed");
    const t = setTimeout(() => startCycle(), 3200);
    return () => clearTimeout(t);
  }, [stepIdx]);

  // Drip in console logs
  useEffect(() => {
    const timers = CONSOLE_STEPS.map(step =>
      setTimeout(() => {
        setConsoleLogs(prev => [...prev, step]);
      }, step.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [tick]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current)
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
  }, [consoleLogs]);

  function renderLine(line, idx) {
    return line.tokens.map((tok, i) => (
      <span key={i} style={{ color: TOKEN_COLORS[tok.t] || TOKEN_COLORS.plain }}>
        {tok.v}
      </span>
    ));
  }

  const statusLabel = phase === "running" ? "▶  Running"
    : phase === "paused" ? "⏸  Paused on exception"
    : phase === "fixed"  ? "✔  Fixed & passing"
    : "Idle";

  const statusColor = phase === "running" ? "#4ade80"
    : phase === "paused" ? "#f87171"
    : phase === "fixed"  ? "#a78bfa"
    : "#6b7280";

  return (
    <div style={{
      background: "#0d0f16",
      borderRadius: "16px",
      border: "1.5px solid rgba(107,26,26,0.4)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)",
      overflow: "hidden",
      width: "360px",
      fontFamily: "'Fira Code','Cascadia Code','JetBrains Mono',monospace",
      fontSize: "0.72rem",
    }}>

      {/* Title bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "7px",
        padding: "9px 14px",
        background: "#161822",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, color: "#94a3b8", fontSize: "0.7rem", letterSpacing: "0.04em" }}>
          login.js
        </span>
        {/* Debugger controls */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          {["▶", "⏭", "↓", "↑"].map((sym, i) => (
            <span key={i} style={{
              color: phase === "running" ? "#60a5fa" : "#374151",
              cursor: "pointer", fontSize: "0.75rem",
              transition: "color 0.2s",
            }}>{sym}</span>
          ))}
        </div>
      </div>

      {/* Code pane */}
      <div style={{ padding: "10px 0", lineHeight: "1.75", maxHeight: "192px", overflowY: "hidden" }}>
        {CODE_LINES.map((line, idx) => {
          const isActive  = activeLine === idx;
          const isErr     = line.err;
          const isPaused  = isActive && phase === "paused";

          return (
            <div key={idx} style={{
              display: "flex",
              alignItems: "center",
              background: isPaused
                ? "rgba(248,113,113,0.13)"
                : isActive
                  ? "rgba(96,165,250,0.08)"
                  : "transparent",
              borderLeft: isPaused
                ? "3px solid #f87171"
                : isActive
                  ? "3px solid #60a5fa"
                  : "3px solid transparent",
              transition: "background 0.25s, border-color 0.25s",
            }}>
              {/* Breakpoint gutter */}
              <span style={{
                minWidth: "22px", textAlign: "center",
                color: line.bp ? "#f87171" : "transparent",
                fontSize: "0.65rem", paddingLeft: "2px",
              }}>●</span>

              {/* Line number */}
              <span style={{
                minWidth: "28px", textAlign: "right",
                paddingRight: "12px",
                color: isActive ? "#94a3b8" : "#374151",
                userSelect: "none", fontSize: "0.65rem",
              }}>{idx + 1}</span>

              {/* Code */}
              <span style={{
                textDecoration: isErr && phase === "paused" ? "underline wavy #f87171" : "none",
              }}>
                {renderLine(line, idx)}
              </span>

              {/* Active arrow */}
              {isActive && (
                <span style={{
                  marginLeft: 6,
                  color: isPaused ? "#f87171" : "#60a5fa",
                  fontSize: "0.65rem",
                  animation: "pulse 0.8s ease-in-out infinite",
                }}>
                  {isPaused ? "⬤" : "→"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

      {/* Console */}
      <div>
        <div style={{
          padding: "5px 14px",
          background: "#111318",
          color: "#475569",
          fontSize: "0.64rem",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>Console</span>
          <span style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
        </div>
        <div ref={consoleRef} style={{
          padding: "8px 14px",
          maxHeight: "110px",
          overflowY: "auto",
          background: "#0a0b10",
          lineHeight: "1.8",
        }}>
          {consoleLogs.map((log, i) => (
            <div key={i} style={{
              color: CONSOLE_COLORS[log.type] || "#cbd5e1",
              opacity: 0,
              animation: `fadeUp 0.3s ${i * 0.02}s forwards`,
              fontSize: "0.69rem",
            }}>
              {log.text}
            </div>
          ))}
          {/* blinking cursor */}
          <span style={{
            display: "inline-block",
            width: 6, height: 11,
            background: "#4ade80",
            marginLeft: 2,
            verticalAlign: "middle",
            animation: "blink 1s step-end infinite",
          }} />
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        padding: "5px 14px",
        background: RED,
        display: "flex", justifyContent: "space-between",
        fontSize: "0.64rem",
        color: "rgba(242,237,228,0.75)",
        letterSpacing: "0.05em",
      }}>
        <span>JS Debugger</span>
        <span>Ln {activeLine !== null ? activeLine + 1 : "—"}  ·  Col 1</span>
      </div>
    </div>
  );
}

// ── Floating particles ─────────────────────────────────────────
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
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {pts.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: p.filled ? `rgba(107,26,26,0.35)` : "transparent",
          border: p.filled ? "none" : `1.5px solid rgba(107,26,26,0.28)`,
          animation: `float ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [focused,  setFocused]  = useState(null);

  function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:${CREAM}; font-family:'DM Sans',sans-serif; }

        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes float    { from{transform:translateY(0) scale(1);opacity:.6} to{transform:translateY(-12px) scale(1.1);opacity:1} }
        @keyframes cardIn   { from{opacity:0;transform:translateY(28px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes rightIn  { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>

      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: CREAM,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Big red circle */}
        <div style={{
          position: "fixed", bottom: "-12vh", right: "-12vw",
          width: "65vw", height: "65vw",
          background: RED, borderRadius: "50%", zIndex: 0,
        }} />
        {/* Soft top-left echo */}
        <div style={{
          position: "fixed", top: "-8vw", left: "-8vw",
          width: "26vw", height: "26vw",
          background: "rgba(107,26,26,0.1)", borderRadius: "50%", zIndex: 0,
        }} />

        <Particles />

        <div style={{
          position: "relative", zIndex: 1,
          display: "flex", alignItems: "center",
          gap: "44px", padding: "24px",
        }}>

          {/* ── Login Card ── */}
          <div style={{
            background: "rgba(242,237,228,0.84)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(107,26,26,0.15)",
            borderRadius: "28px", padding: "52px 44px 44px",
            width: "360px",
            boxShadow: "0 8px 40px rgba(107,26,26,0.13)",
            animation: "cardIn 0.7s cubic-bezier(.22,1,.36,1) both",
          }}>
            <h1 style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "2rem", fontWeight: 700,
              color: RED, textAlign: "center",
              marginBottom: "32px", letterSpacing: "-0.02em",
            }}>Login Now</h1>

            {[
              { ph: "Email or Username", val: email,    set: setEmail,    type: "text",     k: "email" },
              { ph: "Password",          val: password, set: setPassword, type: "password", k: "pass"  },
            ].map(({ ph, val, set, type, k }) => (
              <input key={k} type={type} placeholder={ph}
                value={val} onChange={e => set(e.target.value)}
                onFocus={() => setFocused(k)} onBlur={() => setFocused(null)}
                style={{
                  width: "100%", padding: "13px 18px",
                  borderRadius: "12px",
                  border: `1.5px solid ${focused === k ? RED_MID : "rgba(107,26,26,0.2)"}`,
                  background: "rgba(255,255,255,0.6)",
                  fontFamily: "'DM Sans',sans-serif", fontSize: "0.9rem",
                  color: "#2a1010", outline: "none", marginBottom: "14px",
                  boxShadow: focused === k ? "0 0 0 3px rgba(107,26,26,0.1)" : "none",
                  transition: "border-color .2s, box-shadow .2s",
                }}
              />
            ))}

            <button onClick={handleLogin} style={{
              width: "100%", padding: "14px",
              background: loading ? RED_MID : RED,
              color: CREAM, border: "none", borderRadius: "12px",
              fontFamily: "'DM Sans',sans-serif", fontSize: "0.92rem",
              fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "20px",
              boxShadow: "0 4px 16px rgba(107,26,26,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "background .2s",
            }}>
              {loading && (
                <div style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(242,237,228,0.3)",
                  borderTop: `2px solid ${CREAM}`,
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
              )}
              {loading ? "Authenticating..." : "Login"}
            </button>

            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              marginBottom: "16px", color: "#5a3333", fontSize: "0.82rem", opacity: 0.7,
            }}>
              <div style={{ flex:1, height:1, background:"rgba(107,26,26,0.18)" }} />
              Or login with
              <div style={{ flex:1, height:1, background:"rgba(107,26,26,0.18)" }} />
            </div>

            <div style={{ display:"flex", gap:"12px", marginBottom:"22px" }}>
              {[
                { label:"Facebook", icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.313 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg> },
                { label:"Google",   icon:<svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg> },
              ].map(({ label, icon }) => (
                <button key={label} style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                  padding:"11px", borderRadius:"11px",
                  border:"1.5px solid rgba(107,26,26,0.2)",
                  background:"rgba(255,255,255,0.55)",
                  fontFamily:"'DM Sans',sans-serif", fontSize:"0.87rem", fontWeight:500,
                  color:"#2a1010", cursor:"pointer",
                }}>
                  {icon}{label}
                </button>
              ))}
            </div>

            <p style={{ textAlign:"center", fontSize:"0.84rem", color:"#5a3333", opacity:0.85 }}>
              Not a member?{" "}
              <a href="#" style={{ color:RED, fontWeight:600, textDecoration:"none" }}>Register Now</a>
            </p>
          </div>

          {/* ── Debugger Panel ── */}
          <div style={{
            animation: "rightIn 0.9s 0.2s cubic-bezier(.22,1,.36,1) both",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "14px",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              color: "rgba(242,237,228,0.8)",
              fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: "#f87171",
                boxShadow: "0 0 7px #f87171",
                animation: "pulse 1.2s ease-in-out infinite",
              }} />
              JS Debugger
            </div>

            <DebuggerPanel />

            <div style={{
              color: "rgba(242,237,228,0.4)",
              fontSize: "0.7rem", letterSpacing: "0.06em",
            }}>
              Breakpoints · Call Stack · Console
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
