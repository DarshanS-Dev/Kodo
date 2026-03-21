"use client";

import React from "react";
import { WeeklyInsight } from "@/components/ui/WeeklyInsight";
import { motion } from "framer-motion";

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-[#3D1515] text-[#EFEDE3] flex flex-col p-12">
      <div className="flex flex-col items-center py-20">
        <h1 className="text-5xl font-black italic tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          Growth Protocol
        </h1>
        <p className="max-w-md text-center opacity-40 text-sm font-medium tracking-wide mb-12">
          Your behavioral signals are being processed. Hindsight is analyzing your cognitive drift.
        </p>
        
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { label: "Cognitive Nodes", value: "84%" },
            { label: "Retention Rate", value: "92%" },
            { label: "Patterns Identified", value: "128" }
          ].map((stat, i) => (
            <motion.div 
               key={stat.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-6 bg-[#EFEDE3]/5 border border-white/5 rounded-3xl backdrop-blur-sm"
            >
               <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-2">{stat.label}</p>
               <h4 className="text-3xl font-black">{stat.value}</h4>
            </motion.div>
          ))}
        </div>

        <WeeklyInsight />
      </div>
    </div>
  );
}
