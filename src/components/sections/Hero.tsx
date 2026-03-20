"use client";

import React, { useEffect, useRef } from "react";
import AnimatedWords from "@/components/ui/AnimatedWords";
import gsap from "gsap";

export default function Hero() {
    const marqueeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!marqueeRef.current) return;

        // simple marquee animation
        const container = marqueeRef.current;

        gsap.to(container, {
            xPercent: -50,
            ease: "none",
            duration: 20,
            repeat: -1,
        });
    }, []);

    return (
        <section className="relative w-full h-screen overflow-hidden flex flex-col justify-between pt-32 pb-12 px-12 z-0">

            {/* Background Marquee Text */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[200vw] h-max flex items-center pointer-events-none z-[-1]">
                <div ref={marqueeRef} className="flex gap-16 whitespace-nowrap">
                    <h1 className="text-[14vw] font-display text-[#EFEDE3] leading-none tracking-tighter opacity-90 select-none">
                        KŌDO — AI CODING MENTOR WITH MEMORY
                    </h1>
                    <h1 className="text-[14vw] font-display text-[#EFEDE3] leading-none tracking-tighter opacity-90 select-none">
                        KŌDO — AI CODING MENTOR WITH MEMORY
                    </h1>
                </div>
            </div>

            {/* Top row */}
            <div className="flex justify-between w-full max-w-[1400px] mx-auto z-10 text-[#EFEDE3]">
                <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-[#5C2020] mt-1.5 rounded-sm"></div>
                    <p className="text-sm font-medium opacity-80 leading-snug">
                        The only mentor that remembers <br />
                        how you think — not just what you coded.
                    </p>
                </div>

                <div className="flex items-start gap-3 w-48 relative">
                    <div className="w-1.5 h-1.5 bg-[#5C2020] mt-1.5 rounded-sm"></div>
                    <div className="flex flex-col">
                        <p className="text-sm font-medium opacity-80 leading-snug mb-1">
                            You will be master on:
                        </p>
                        <span className="font-bold tracking-widest text-sm uppercase">ADAPTIVE EXPLANATIONS</span>
                    </div>
                </div>
            </div>

            {/* Bottom row */}
            <div className="flex justify-between items-end w-full max-w-[1400px] mx-auto z-10 text-[#EFEDE3]">
                <div className="max-w-xs">
                    <p className="text-sm font-medium opacity-80 leading-relaxed">
                        Kōdo learns your behavioral patterns across every session —<br />
                        where you fail, which analogies click, and exactly where<br />
                        to pick you up next time.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <button className="flex items-center gap-4 text-xs font-bold tracking-[0.2em] uppercase">
                        THE AI MENTOR THAT GROWS WITH YOU
                        <span className="w-6 h-6 rounded-full bg-[#5C2020] border border-[#EFEDE3] flex items-center justify-center shrink-0">
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L5 5L9 1" stroke="#EFEDE3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    </button>
                    <div className="mr-10">
                        <AnimatedWords />
                    </div>
                </div>
            </div>

        </section>
    );
}
