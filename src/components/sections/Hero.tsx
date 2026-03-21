"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { Cover } from "@/components/ui/cover";
import { motion } from "framer-motion";

const words = [
    "PATTERN RECOGNITION",
    "COMEBACK BRIEF",
    "ADAPTIVE MEMORY",
    "FAILURE DNA",
    "BEHAVIORAL SIGNALS",
    "WEAK AREA TARGETING",
    "HINDSIGHT ENGINE",
];

export default function Hero() {
    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!marqueeRef.current) return;

        const container = marqueeRef.current;
        gsap.to(container, {
            xPercent: -50,
            ease: "none",
            duration: 35, // Slower marquee for better readability
            repeat: -1,
        });
    }, []);

    return (
        <section className="relative w-full h-screen overflow-hidden flex flex-col justify-between pt-32 pb-16 px-12 z-0 bg-[#5C2020]">

            {/* Spotlight / Radial Glow */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-50%] left-[-20%] w-[100vw] h-[100vw] rounded-full bg-white opacity-[0.03] blur-[150px]"></div>
                <div className="absolute bottom-[-40%] right-[-10%] w-[80vw] h-[80vw] rounded-full bg-[#EFEDE3] opacity-[0.02] blur-[120px]"></div>
            </div>

            {/* Background Grain/Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-[1]"></div>

            {/* Background Marquee Text */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[200vw] h-max flex items-center pointer-events-none z-[0] opacity-80 scale-110">
                <div ref={marqueeRef} className="flex gap-20 whitespace-nowrap">
                    <h1 className="text-[14vw] font-display text-[#EFEDE3] leading-none tracking-tighter select-none">
                        <Cover className="bg-transparent border-transparent cursor-default">KŌDO</Cover>
                        <span className="opacity-40 font-display">— MENTOR</span>
                    </h1>
                    <h1 className="text-[14vw] font-display text-[#EFEDE3] leading-none tracking-tighter select-none">
                        <Cover className="bg-transparent border-transparent cursor-default">KŌDO</Cover>
                        <span className="opacity-40 font-display">— MENTOR</span>
                    </h1>
                </div>
            </div>

            {/* Top row */}
            <div className="flex justify-between w-full max-w-[1400px] mx-auto z-10 text-[#EFEDE3]">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex items-start gap-4"
                >
                    <div className="w-1.5 h-1.5 bg-[#EFEDE3] mt-2 rounded-full shadow-[0_0_12px_rgba(239,237,227,0.8)]"></div>
                    <p className="text-sm font-medium opacity-80 leading-snug tracking-wide">
                        The only mentor that remembers <br />
                        how you think — not just what you coded.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex items-start gap-4 w-64 relative"
                >
                    <div className="w-1.5 h-1.5 bg-[#EFEDE3] mt-2 rounded-full shadow-[0_0_12px_rgba(239,237,227,0.8)]"></div>
                    <div className="flex flex-col">
                        <p className="text-sm font-medium opacity-80 leading-snug mb-1">
                            You will be master on:
                        </p>
                        <span className="font-bold tracking-widest text-sm uppercase text-[#EFEDE3]">ADAPTIVE EXPLANATIONS</span>
                    </div>
                </motion.div>
            </div>

            {/* Center focus indicator (subtle) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-10 opacity-30 pointer-events-none">
                <div className="w-[1px] h-32 bg-gradient-to-b from-transparent via-[#EFEDE3] to-transparent"></div>
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end w-full max-w-[1400px] mx-auto z-10 text-[#EFEDE3]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="max-w-xs"
                >
                    <p className="text-base font-medium opacity-80 leading-relaxed max-w-xs text-balance">
                        Kōdo learns your behavioral patterns across every session —
                        where you fail, which analogies click, and exactly where to pick you up next time.
                    </p>
                </motion.div>

                <div className="flex flex-col items-end gap-12">
                    <button className="group flex items-center gap-8 text-xs font-black tracking-[0.4em] uppercase">
                        <span className="opacity-40 group-hover:opacity-100 transition-all duration-500">INITIATE GROWTH PROTOCOL</span>
                        <div className="w-14 h-14 rounded-full bg-transparent border border-[#EFEDE3]/20 flex items-center justify-center transition-all duration-700 group-hover:scale-125 group-hover:bg-[#EFEDE3] group-hover:border-[#EFEDE3] group-hover:shadow-[0_0_30px_rgba(239,237,227,0.3)]">
                            <svg width="18" height="18" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-500 group-hover:rotate-45">
                                <path d="M1 5H13M13 5L9 1M13 5L9 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-colors group-hover:stroke-[#5C2020]" />
                            </svg>
                        </div>
                    </button>

                    <div className="flex flex-col items-end gap-3 pr-2 border-r border-[#EFEDE3]/20 h-10">
                        <p className="text-[10px] tracking-[0.3em] font-black opacity-30 uppercase">Cognitive Node</p>
                        <LayoutTextFlip
                            text=""
                            words={words}
                            className="justify-end"
                        />
                    </div>
                </div>
            </div>

        </section>
    );
}
