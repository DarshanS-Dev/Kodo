"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, BarChart3, Settings, User, 
  Sparkles, ChevronRight, LayoutDashboard
} from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Workspace", href: "/workspace", icon: LayoutDashboard },
  { name: "Progress", href: "/progress", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function NavSection() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl"
    >
      <div className="flex items-center justify-between px-6 py-3 rounded-2xl bg-[#3D1515]/40 backdrop-blur-xl border border-white/10 shadow-2xl ring-1 ring-white/5">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#EFEDE3]/20 to-transparent border border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/30">
            <Sparkles size={16} className="text-[#EFEDE3] relative z-10" />
            <motion.div 
              className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-display text-[#EFEDE3] tracking-wider uppercase">Kōdo</span>
            <span className="text-[9px] text-[#EFEDE3]/40 font-mono tracking-tighter leading-none">AI Mentor</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-black/20 rounded-xl border border-white/5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className="relative px-4 py-2 group">
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-[#EFEDE3] rounded-lg shadow-[0_0_15px_rgba(239,237,227,0.3)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                  isActive ? "text-[#3D1515]" : "text-[#EFEDE3]/60 group-hover:text-[#EFEDE3]"
                }`}>
                  <link.icon size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wide">{link.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* User Profile / Status */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-[#EFEDE3]/30 font-mono leading-none">System Status</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-[10px] font-bold text-[#EFEDE3]/70 uppercase tracking-widest">Connected</span>
            </div>
          </div>
          
          <button className="relative w-9 h-9 rounded-full bg-[#EFEDE3]/10 border border-white/10 flex items-center justify-center group hover:border-[#EFEDE3]/30 transition-all">
            <User size={16} className="text-[#EFEDE3]/60 group-hover:text-[#EFEDE3] transition-colors" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#EFEDE3] rounded-full border-2 border-[#3D1515] shadow-lg" />
          </button>
        </div>

      </div>
    </motion.nav>
  );
}
