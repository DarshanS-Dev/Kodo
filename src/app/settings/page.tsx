"use client";

import React from "react";
import { Settings, Shield, User, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#3D1515] text-[#EFEDE3] flex flex-col p-20 pt-40">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-30">Parameters</span>
           <h1 className="text-4xl font-black italic tracking-tighter mb-8">System Configuration</h1>
        </div>
        
        <div className="space-y-6">
           {[
             { title: "Mentor Sensitivity", icon: <User size={16} />, value: "High (Adaptive)" },
             { title: "Cognitive Logging", icon: <Shield size={16} />, value: "Active" },
             { title: "Hindsight Alerts", icon: <Bell size={16} />, value: "Weekly Summary Only" }
           ].map(item => (
             <div key={item.title} className="flex items-center justify-between p-8 bg-[#EFEDE3]/5 border border-white/5 rounded-3xl hover:bg-[#EFEDE3]/10 hover:border-white/10 transition-all group">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                      {item.icon}
                   </div>
                   <div className="flex flex-col">
                      <h4 className="font-bold text-lg opacity-80 group-hover:opacity-100">{item.title}</h4>
                      <p className="text-[11px] font-mono tracking-widest opacity-30 uppercase">{item.value}</p>
                   </div>
                </div>
                <button className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-xs font-bold font-black tracking-[0.1em] uppercase">Configure</button>
             </div>
           ))}
        </div>

        <div className="p-12 bg-red-400/10 border border-red-400/20 rounded-3xl flex flex-col gap-4">
           <p className="text-[11px] font-black tracking-[0.4em] uppercase text-red-400/80">Danger Zone</p>
           <h2 className="text-xl font-bold">Wipe Cognitive History</h2>
           <p className="text-sm opacity-50 max-w-md">Once your Hindsight memory is cleared, Kōdo will forget every lesson and pattern it has learned about you. This action is irreversible.</p>
           <button className="w-fit mt-4 px-8 py-3 bg-red-400/20 hover:bg-red-400/40 border border-red-400/20 text-red-100 rounded-full text-xs font-black tracking-[0.15em] uppercase transition-all">Clear All Patterns</button>
        </div>
      </div>
    </div>
  );
}
