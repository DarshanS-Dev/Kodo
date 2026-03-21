"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getProblemList, ProblemSummary } from "@/lib/api";
import { Loader2, Code2, ArrowRight } from "lucide-react";

interface ProblemListProps {
  onSelect: (id: string) => void;
}

const DIFF_COLORS = {
  easy: "bg-[#EAF3DE] text-[#3B6D11]",
  medium: "bg-[#FAEEDA] text-[#854F0B]",
  hard: "bg-[#FCEBEB] text-[#A32D2D]"
};

export function ProblemList({ onSelect }: ProblemListProps) {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await getProblemList();
        setProblems(list);
      } catch (err) {
        console.error("Failed to load problem list:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-20 space-y-4">
        <Loader2 className="animate-spin" size={32} />
        <p className="text-sm font-black tracking-[0.2em] uppercase">Fetching Challenges...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-10 max-w-[1400px] mx-auto w-full">
      {problems.map((p, i) => (
        <motion.div
           key={p.id}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: i * 0.05 }}
           onClick={() => onSelect(p.id)}
           className="group relative cursor-pointer"
        >
          <div className="h-full p-6 bg-[#EFEDE3]/5 border border-white/5 rounded-3xl backdrop-blur-sm hover:border-white/20 transition-all hover:-translate-y-1 overflow-hidden">
             
             {/* Background Glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-white/10 transition-colors" />

             <div className="flex items-start justify-between mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${DIFF_COLORS[p.difficulty as keyof typeof DIFF_COLORS]}`}>
                  {p.difficulty}
                </span>
                <Code2 size={16} className="opacity-20 group-hover:opacity-100 transition-opacity" />
             </div>

             <h3 className="text-lg font-black tracking-tight leading-tight mb-3 text-[#EFEDE3]">{p.title}</h3>
             
             <div className="flex flex-wrap gap-1.5 mb-6">
                {p.tags.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-black/20 border border-white/5 rounded text-[9px] font-mono tracking-tighter opacity-40">#{t}</span>
                ))}
             </div>

             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 transition-opacity">
                <span>Engage Hindsight</span>
                <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
             </div>

          </div>
        </motion.div>
      ))}
    </div>
  );
}
