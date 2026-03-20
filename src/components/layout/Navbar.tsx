"use client";

import React from "react";
import { Layers } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none mix-blend-difference text-white">
            {/* Logo */}
            <div className="bg-[#3D1515] p-3 rounded-lg flex items-center justify-center pointer-events-auto border border-[#3D1515] shadow-sm">
                <Layers className="text-[#EFEDE3] w-5 h-5" />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pointer-events-auto">
                <button className="px-6 py-2 rounded-full border border-[#3D1515] text-xs font-semibold tracking-widest bg-transparent uppercase text-[#EFEDE3] hover:bg-[#3D1515] transition-colors">
                    Chapters
                </button>
                <button className="px-6 py-2 rounded-full text-xs font-semibold tracking-widest bg-[#3D1515] text-[#EFEDE3] uppercase shadow-sm hover:bg-[#7a2a2a] transition-colors">
                    Get Started
                </button>
            </div>
        </nav>
    );
}
