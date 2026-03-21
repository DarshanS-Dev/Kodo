"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamic import for Three.js component to keep SSR performance
const FloatingAnimation = dynamic(() => import("@/components/three/FloatingNodes").then(mod => mod.FloatingAnimation), { ssr: false });

export default function RevealHero() {
    return (
        <section className="relative min-h-[120vh] w-full bg-[#EFEDE3] flex flex-col items-center justify-center py-20 overflow-hidden">

            {/* Organic Center Capsule (Reveal Shape) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-2xl px-12 py-32 rounded-[45%_45%_10%_10%] sm:rounded-[45%_45%_50%_50%] bg-[#5C2020] aspect-[3/4] sm:aspect-[4/5] flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden"
            >
                {/* Internal Reveal Noise */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-0"></div>

                <h1 className="relative z-10 text-4xl md:text-6xl font-display text-[#EFEDE3] leading-[1.1] tracking-tight text-pretty px-6">
                    When Kōdo <br />
                    perfects your logic, <br />
                    it doesn't alter it, <br />
                    <span className="italic opacity-60 font-serif">it reveals it.</span>
                </h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 flex flex-col items-center gap-2"
                >
                    <div className="w-[1px] h-12 bg-[#EFEDE3]/40"></div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-40 text-[#EFEDE3]">Cognitive Sync</span>
                </motion.div>
            </motion.div>

            {/* Floating React Animations (Replacing Images) */}
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-20">
                {/* Animation 1 - Top Right */}
                <motion.div
                    initial={{ rotate: -5, y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="absolute top-[10%] right-[10%] w-64 h-80 rounded-3xl overflow-hidden pointer-events-auto"
                >
                    <FloatingAnimation type={1} />
                    <div className="absolute bottom-4 left-4 p-4 text-[10px] font-bold text-[#3D1515] uppercase tracking-widest bg-[#EFEDE3]/90 rounded-lg">
                        Memory Latency
                    </div>
                </motion.div>

                {/* Animation 2 - Middle Left */}
                <motion.div
                    initial={{ rotate: 10, x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="absolute top-[40%] left-[5%] w-72 h-[450px] rounded-3xl overflow-hidden pointer-events-auto shadow-2xl group border border-white/10"
                >
                    <FloatingAnimation type={2} />

                    {/* High-Impact Scanning Overlay */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        {/* Scanning Line with Flicker */}
                        <motion.div
                            animate={{ 
                                top: ["-10%", "110%"],
                                opacity: [0.4, 0.9, 0.4],
                            }}
                            transition={{
                                duration: 2.2,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="absolute left-0 w-full h-[60px] bg-gradient-to-b from-transparent via-white/30 to-transparent flex items-center justify-center"
                        >
                            <div className="w-full h-[1px] bg-white shadow-[0_0_25px_white]" />
                        </motion.div>

                        {/* Floating Data Fragments */}
                        {Array.from({ length: 15 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ 
                                    x: Math.random() * 240 - 120, 
                                    y: Math.random() * 450,
                                    opacity: 0,
                                    scale: 0.5
                                }}
                                animate={{ 
                                    y: [null, Math.random() * -120 - 60],
                                    opacity: [0, 0.8, 0],
                                    scale: [0.6, 1.1, 0.6]
                                }}
                                transition={{
                                    duration: 2.5 + Math.random() * 3,
                                    repeat: Infinity,
                                    delay: Math.random() * 4,
                                    ease: "linear"
                                }}
                                className="absolute left-1/2 -translate-x-1/2 p-1 text-[9px] font-mono text-white/50 whitespace-nowrap"
                            >
                                {i % 3 === 0 ? ">>> INDUCT" : i % 3 === 1 ? "01101" : "MATCH++"}
                            </motion.div>
                        ))}

                        {/* Pulsing Status Badge */}
                        <div className="absolute top-6 left-6 flex items-center gap-2">
                             <motion.div 
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" 
                             />
                             <span className="text-[8px] font-bold text-[#EFEDE3]/60 tracking-[0.2em] uppercase">Induction Active</span>
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-4 p-4 text-[10px] font-bold text-[#EFEDE3] uppercase tracking-widest bg-[#3D1515]/90 rounded-lg backdrop-blur-md border border-[#EFEDE3]/10 z-30">
                        Pattern Induction
                    </div>
                </motion.div>

                {/* Animation 3 - Bottom Right */}
                <motion.div
                    initial={{ rotate: -15, y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="absolute bottom-[5%] right-[15%] w-80 h-56 rounded-3xl overflow-hidden pointer-events-auto"
                >
                    <FloatingAnimation type={1} />
                    <div className="absolute top-4 left-4 p-4 text-[10px] font-bold text-[#3D1515] uppercase tracking-widest bg-[#EFEDE3]/90 rounded-lg">
                        Structural Reveal
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-10 flex items-center gap-4 text-xs font-bold tracking-widest text-[#3D1515] opacity-40">
                <div className="w-12 h-[1px] bg-[#3D1515]"></div>
                <span>MEMORIZED SESSIONS / 04</span>
            </div>

        </section>
    );
}
