"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ChevronDown,
  Zap,
  Flame,
} from "lucide-react";

const API = "http://localhost:8000";

function getUserId(): string {
  if (typeof window === "undefined") return "user_dev";
  const existing = localStorage.getItem("kodo_user_id");
  if (existing) return existing;
  const id = `user_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("kodo_user_id", id);
  return id;
}

interface InsightSection {
  id: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  accent: string;
  accentRgba: string;
  accentBorder: string;
  number: string;
  content: string;
}

function parseInsight(raw: string): {
  learned: string; atRisk: string; unfinished: string; behavioral: string; headline: string;
} {
  if (!raw || raw.length < 10) {
    const e = "No data yet for this section.";
    return { learned: e, atRisk: e, unfinished: e, behavioral: e, headline: "No insight available yet." };
  }
  const sentences = raw.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 10);
  const headline = sentences[0] ?? "Your weekly learning analysis.";
  const learnedKw = ["learned", "new concept", "introduced", "understood", "mastered", "covered", "studied"];
  const atRiskKw = ["risk", "forgotten", "not revised", "hasn't", "haven't", "neglect", "avoid", "skipped", "missing"];
  const unfinishedKw = ["unfinished", "pending", "incomplete", "attempt", "failed", "not solved", "still", "progress"];
  const behavioralKw = ["behavior", "approach", "improvement", "pattern", "rush", "careful", "thorough", "compared", "better", "worse", "changed"];
  const buckets: Record<string, string[]> = { learned: [], atRisk: [], unfinished: [], behavioral: [] };
  for (const s of sentences) {
    const lower = s.toLowerCase();
    if (learnedKw.some((k) => lower.includes(k))) buckets.learned.push(s);
    else if (atRiskKw.some((k) => lower.includes(k))) buckets.atRisk.push(s);
    else if (unfinishedKw.some((k) => lower.includes(k))) buckets.unfinished.push(s);
    else if (behavioralKw.some((k) => lower.includes(k))) buckets.behavioral.push(s);
  }
  const unassigned = sentences.filter((s) => !Object.values(buckets).flat().includes(s));
  const keys = ["learned", "atRisk", "unfinished", "behavioral"] as const;
  unassigned.forEach((s, i) => buckets[keys[i % 4]].push(s));
  const fallback = "Kōdo doesn't have enough data for this section yet.";
  return {
    headline,
    learned: buckets.learned.slice(0, 3).join(" ") || fallback,
    atRisk: buckets.atRisk.slice(0, 3).join(" ") || fallback,
    unfinished: buckets.unfinished.slice(0, 3).join(" ") || fallback,
    behavioral: buckets.behavioral.slice(0, 3).join(" ") || fallback,
  };
}

const THINKING = ["Reviewing your sessions...", "Analyzing patterns...", "Checking forgotten topics...", "Reading behavioral signals...", "Synthesizing your week..."];

function ThinkingText() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % THINKING.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.span key={idx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }} className="text-[#EFEDE3]/40 text-[10px] tracking-[0.2em] uppercase font-bold">
        {THINKING[idx]}
      </motion.span>
    </AnimatePresence>
  );
}

function SkeletonCard({ delay, tall }: { delay: number; tall?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.5 }}
      className={`rounded-3xl border border-white/5 bg-[#0e0202] p-7 flex flex-col gap-5 ${tall ? "h-full min-h-[280px]" : "min-h-[160px]"}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/5 animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-2 w-20 rounded-full bg-white/5 animate-pulse" />
          <div className="h-1.5 w-14 rounded-full bg-white/3 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {[1, 0.9, 0.75, tall ? 0.85 : 0, tall ? 0.6 : 0].filter(Boolean).map((w, i) => (
          <div key={i} className="h-2 rounded-full bg-white/4 animate-pulse" style={{ width: `${w * 100}%` }} />
        ))}
      </div>
    </motion.div>
  );
}

function InsightCard({ section, index, tall }: { section: InsightSection; index: number; tall?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-3xl border ${section.accentBorder} bg-[#0b0202] p-7 flex flex-col gap-5 overflow-hidden cursor-default hover:bg-[#100303] transition-colors duration-500 ${tall ? "h-full min-h-[280px]" : ""}`}
    >
      {/* Hover radial wash */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"
        style={{ background: `radial-gradient(ellipse 70% 50% at 100% 0%, ${section.accentRgba} 0%, transparent 70%)` }} />

      {/* Watermark number */}
      <div className={`pointer-events-none absolute -bottom-6 -right-3 text-[8rem] font-black leading-none select-none ${section.accent} opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500`}>
        {section.number}
      </div>

      {/* Icon + label */}
      <div className="relative z-10 flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${section.accentBorder} ${section.accent}`}
          style={{ background: section.accentRgba }}>
          {section.icon}
        </div>
        <div>
          <p className={`text-[11px] font-black uppercase tracking-[0.22em] ${section.accent}`}>{section.label}</p>
          <p className="text-[10px] text-[#EFEDE3]/22 uppercase tracking-wider mt-0.5">{section.sublabel}</p>
        </div>
      </div>

      {/* Accent rule */}
      <div className="relative z-10 h-px w-10 rounded-full opacity-30" style={{ background: section.accentRgba.replace("0.08", "1") }} />

      {/* Body text */}
      <p className="relative z-10 text-[#EFEDE3]/60 text-[13px] leading-[1.8] flex-1">{section.content}</p>
    </motion.div>
  );
}

export default function InsightPage() {
  const [userId, setUserId] = useState("");
  const [rawInsight, setRawInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullOpen, setFullOpen] = useState(false);
  const hasFetched = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ container: scrollRef });
  const barWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => { setUserId(getUserId()); }, []);

  useEffect(() => {
    if (!userId || hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    const fetchInsight = async () => {
      setError(null);
      try {
        const res = await fetch(`${API}/insight/weekly?user_id=${userId}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setRawInsight(typeof data === "string" ? data : JSON.stringify(data, null, 2));
      } catch (e: any) {
        setError(e.message ?? "Could not load insight.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
  }, [userId]);

  const parsed = rawInsight ? parseInsight(rawInsight) : null;

  const sections: InsightSection[] = parsed ? [
    { id: "learned", icon: <Brain size={15} />, label: "What You Learned", sublabel: "New concepts this week", accent: "text-sky-400", accentRgba: "rgba(56,189,248,0.08)", accentBorder: "border-sky-500/20", number: "01", content: parsed.learned },
    { id: "atRisk", icon: <Flame size={15} />, label: "At Risk", sublabel: "Fading from memory", accent: "text-amber-400", accentRgba: "rgba(251,191,36,0.08)", accentBorder: "border-amber-500/20", number: "02", content: parsed.atRisk },
    { id: "unfinished", icon: <RefreshCw size={15} />, label: "Still Pending", sublabel: "Unfinished problems", accent: "text-rose-400", accentRgba: "rgba(251,113,133,0.08)", accentBorder: "border-rose-500/20", number: "03", content: parsed.unfinished },
    { id: "behavioral", icon: <TrendingUp size={15} />, label: "Behavioral Shift", sublabel: "How your approach changed", accent: "text-emerald-400", accentRgba: "rgba(52,211,153,0.08)", accentBorder: "border-emerald-500/20", number: "04", content: parsed.behavioral },
  ] : [];

  const weekLabel = (() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
  })();

  return (
    <div ref={scrollRef} className="h-screen overflow-y-auto bg-[#070101] text-[#EFEDE3] font-sans" style={{ scrollbarWidth: "none" }}>

      {/* Scroll progress */}
      <motion.div className="fixed top-0 left-0 h-[1.5px] z-50 bg-gradient-to-r from-[#5C2020] via-[#EFEDE3]/50 to-transparent" style={{ width: barWidth }} />

      {/* Noise grain */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "180px" }} />

      {/* Ambient light blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-[15%] w-[700px] h-[500px] rounded-full bg-[#5C2020] opacity-[0.05] blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#3D1515] opacity-[0.04] blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-12 pb-28">

        {/* Top bar */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-14">
          <Link href="/workspace" className="group flex items-center gap-2.5 text-[#EFEDE3]/25 hover:text-[#EFEDE3]/70 transition-colors duration-300">
            <div className="w-7 h-7 rounded-xl border border-white/8 flex items-center justify-center group-hover:border-white/20 transition-colors">
              <ArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Workspace</span>
          </Link>
          <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#EFEDE3]/18">{weekLabel}</span>
        </motion.div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="mb-14">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EFEDE3]/20 mb-6 flex items-center gap-2">
            <span className="w-4 h-px bg-[#EFEDE3]/15" />
            Kōdo · Weekly Insight
          </p>

          {loading ? (
            <div className="space-y-4">
              <div className="h-20 w-72 rounded-2xl bg-white/4 animate-pulse" />
              <div className="h-3 w-52 rounded-xl bg-white/3 animate-pulse" />
            </div>
          ) : error ? (
            <h1 className="text-[clamp(3rem,8vw,5rem)] font-display font-black tracking-tighter leading-[0.88] text-[#EFEDE3]/15">
              No data<br />yet.
            </h1>
          ) : (
            <>
              <h1 className="text-[clamp(3.5rem,9vw,6rem)] font-display font-black tracking-tighter leading-[0.88] mb-6">
                Your<br /><span className="text-[#EFEDE3]/25">Week.</span>
              </h1>
              {parsed?.headline && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="text-[#EFEDE3]/40 text-[13px] leading-relaxed max-w-md">
                  {parsed.headline}
                </motion.p>
              )}
            </>
          )}
        </motion.div>

        {/* Thin rule */}
        <div className="w-full h-px bg-gradient-to-r from-white/8 via-white/4 to-transparent mb-10" />

        {/* Loading */}
        {loading && (
          <div>
            <div className="flex items-center gap-3 mb-7">
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-1 h-1 rounded-full bg-[#EFEDE3]/25"
                    animate={{ opacity: [0.25, 0.8, 0.25] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }} />
                ))}
              </div>
              <ThinkingText />
            </div>
            {/* Bento skeleton */}
            <div className="grid grid-cols-2 gap-3">
              <div className="row-span-2"><SkeletonCard delay={0} tall /></div>
              <SkeletonCard delay={0.1} />
              <SkeletonCard delay={0.2} />
            </div>
            <div className="mt-3"><SkeletonCard delay={0.3} /></div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="relative rounded-3xl border border-white/6 bg-[#0c0202] p-10 overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06]" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,113,133,0.5) 0%, transparent 70%)" }} />
            <AlertTriangle size={28} className="text-[#EFEDE3]/15 mb-5" />
            <p className="text-[#EFEDE3]/40 text-sm leading-relaxed mb-2 max-w-sm">
              {error.includes("fetch") || error.includes("500") || error.includes("404")
                ? "Your memory bank is empty — complete a few sessions with Kōdo first."
                : error}
            </p>
            <p className="text-[#EFEDE3]/18 text-xs">Backend must be running at localhost:8000</p>
          </motion.div>
        )}

        {/* Insight bento grid */}
        {!loading && !error && sections.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

            {/* Bento: tall left + two stacked right */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="sm:row-span-2 flex flex-col">
                <InsightCard section={sections[0]} index={0} tall />
              </div>
              <InsightCard section={sections[1]} index={1} />
              <InsightCard section={sections[2]} index={2} />
            </div>

            {/* Full-width bottom card */}
            <InsightCard section={sections[3]} index={3} />

            {/* Divider */}
            <div className="my-10 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#EFEDE3]/12">Raw Output</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Full analysis accordion */}
            <div className="rounded-3xl border border-white/6 overflow-hidden bg-[#090101]">
              <button onClick={() => setFullOpen((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.015] transition-colors group">
                <div className="flex items-center gap-3">
                  <Zap size={11} className="text-[#EFEDE3]/20 group-hover:text-[#EFEDE3]/45 transition-colors" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#EFEDE3]/25 group-hover:text-[#EFEDE3]/55 transition-colors">
                    Full Analysis from Kōdo
                  </span>
                </div>
                <motion.div animate={{ rotate: fullOpen ? 180 : 0 }} transition={{ duration: 0.35 }}>
                  <ChevronDown size={12} className="text-[#EFEDE3]/18" />
                </motion.div>
              </button>

              <AnimatePresence>
                {fullOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden">
                    <div className="border-t border-white/5 px-6 py-6">
                      <p className="text-[#EFEDE3]/35 text-[11px] leading-[2.1] whitespace-pre-wrap font-mono">{rawInsight}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="flex items-center justify-center gap-3 mt-14">
              <div className="w-6 h-px bg-white/8" />
              <span className="text-[8px] font-bold uppercase tracking-[0.35em] text-[#EFEDE3]/12">
                Generated from session memory
              </span>
              <div className="w-6 h-px bg-white/8" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}