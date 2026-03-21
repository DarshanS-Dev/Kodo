"use client";

import React, { useState, useEffect, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Terminal, Play, Save, RefreshCw } from "lucide-react";

export default function Editor() {
  const [code, setCode] = useState<string>(
    '# Welcome to Kōdo\n# Start coding in Python\n\ndef main():\n    print("Hello, Kōdo World!")\n\nif __name__ == "__main__":\n    main()'
  );
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState<any>(null);

  // Load Pyodide from CDN
  useEffect(() => {
    const loadPyodideAsync = async () => {
      if (typeof window === "undefined") return;
      
      // Add the script tag for Pyodide
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      script.async = true;
      script.onload = async () => {
        // @ts-ignore
        const py = await window.loadPyodide();
        setPyodide(py);
        setOutput((prev) => [...prev, "✓ Pyodide runtime loaded."]);
      };
      document.body.appendChild(script);
    };

    loadPyodideAsync();
  }, []);

  const runCode = useCallback(async () => {
    console.log("Run button clicked, checking pyodide status...", !!pyodide);
    if (!pyodide) {
      setOutput((prev) => [...prev, "Error: Pyodide is still loading..."]);
      return;
    }

    setIsRunning(true);
    setOutput([]); // Clear previous output
    
    try {
      console.log("Input code:", code);
      // Capture stdout
      pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      await pyodide.runPythonAsync(code);
      
      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      const stderr = pyodide.runPython("sys.stderr.getvalue()");
      
      console.log("Stdout result:", stdout);
      console.log("Stderr result:", stderr);

      if (stdout) setOutput((prev) => [...prev, stdout]);
      if (stderr) setOutput((prev) => [...prev, `[ERROR] ${stderr}`]);
      if (!stdout && !stderr) setOutput((prev) => [...prev, "Code executed (no output)."]);
    } catch (err: any) {
      console.error("Pyodide execution error:", err);
      setOutput((prev) => [...prev, `[CRASH] ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  }, [pyodide, code]);

  return (
    <div className="flex h-full w-full bg-[#1e1e1e]/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Section */}
      <div className="flex-1 h-full border-r border-white/5 relative">
        <header className="absolute top-0 left-0 right-0 h-10 bg-[#3D1515]/80 backdrop-blur-md z-10 flex items-center justify-between px-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-[#EFEDE3]/60 text-xs font-mono">
            <Terminal size={14} />
            main.py
          </div>
          <div className="flex gap-2">
            <button 
              onClick={runCode}
              disabled={isRunning || !pyodide}
              className="p-1 px-3 bg-[#EFEDE3] hover:bg-white text-[#3D1515] rounded text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
            >
              {isRunning ? <RefreshCw className="animate-spin" size={12} /> : <Play size={12} fill="currentColor" />}
              RUN
            </button>
          </div>
        </header>

        <div className="pt-10 h-full">
          <MonacoEditor
            height="100%"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              fontSize: 14,
              fontFamily: "var(--font-mono, monospace)",
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      {/* Terminal / Output Section */}
      <div className="w-1/3 h-full flex flex-col bg-[#0d0d0d]/90">
        <header className="h-10 bg-[#EFEDE3]/5 flex items-center px-4 border-b border-white/5 text-[#EFEDE3]/60 text-xs font-mono uppercase tracking-widest">
          Console
        </header>
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
          {output.length === 0 ? (
            <div className="text-[#EFEDE3]/20 italic">Run your code to see output...</div>
          ) : (
            output.map((line, idx) => (
              <div key={idx} className="text-[#EFEDE3] whitespace-pre-wrap mb-1 transition-all animate-in fade-in slide-in-from-left-2">
                <span className="text-[#EFEDE3]/30 mr-2 select-none">{'>'}</span>
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
