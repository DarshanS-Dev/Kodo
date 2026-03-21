"use client";

import React, { useState, useEffect } from "react";
import { getWeeklyInsight } from "@/lib/api";
import { motion } from "framer-motion";
import { LineChart, Sparkles, Loader2 } from "lucide-react";

export function WeeklyInsight() {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const text = await getWeeklyInsight();
        setInsight(text);
      } catch (err) {
        console.error("Failed to load weekly insight:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 opacity-10 space-y-4">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  if (!insight) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      className="p-10 w-full max-w-[1400px] mx-auto"
    >
      <div className="p-8 bg-[#EFEDE3]/5 border border-white/5 rounded-3xl backdrop-blur-md flex flex-col items-start gap-4">
        <div className="flex items-center gap-3 opacity-40">
           <LineChart size={16} />
           <span className="text-[11px] font-black uppercase tracking-[0.3em]">Weekly Signal Insight</span>
        </div>
        
        <h2 className="text-2xl font-black tracking-tight text-[#EFEDE3] leading-snug">Hindsight Analysis</h2>
        
        <div className="space-y-4">
          <p className="text-[#EFEDE3]/70 text-[15px] leading-relaxed italic border-l-2 border-[#EFEDE3]/20 pl-6 py-1">
             {insight}
          </p>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase bg-[#EFEDE3]/5 px-3 py-1 rounded-full text-[#EFEDE3]/30 tracking-widest">
             <Sparkles size={8} className="opacity-40" />
             Patterns refined across all sessions.
          </div>
        </div>
      </div>
    </motion.div>
  );
}
