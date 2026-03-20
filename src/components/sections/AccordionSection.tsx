"use client";

import React, { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

const cards = [
    {
        id: 1,
        title: "1",
        bgColor: "bg-[#3D1515]",
        textColor: "text-white",
        content: (
            <div className="flex flex-col h-full justify-center max-w-lg px-12 md:px-20 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-1.5 rounded-[1px] border border-current bg-transparent"></span>
                        <span className="text-sm font-medium opacity-80">Comeback Brief.</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-medium leading-[1.3] opacity-90 tracking-tight">
                        Whether you left off stuck on recursion or halfway through a DP problem, Kōdo already knows. Every session opens with a personalized brief built entirely from your last interaction.
                    </p>
                </div>
                <ul className="space-y-4">
                    {[
                        { n: "1", t: "Where you left off" },
                        { n: "2", t: "What to fix today" },
                        { n: "3", t: "Your momentum score" },
                    ].map((itm) => (
                        <li key={itm.n} className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-full border border-current border-opacity-20 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {itm.n}
                            </span>
                            <span className="text-sm font-medium">{itm.t}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ),
    },
    {
        id: 2,
        title: "2",
        bgColor: "bg-[#EFEDE3]",
        textColor: "text-[#3D1515]",
        content: (
            <div className="flex flex-col h-full justify-center max-w-lg px-12 md:px-20 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1 h-1 rounded-full border border-current bg-transparent"></span>
                        <span className="text-sm font-medium opacity-80">Pattern Interrupt.</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-medium leading-[1.3] opacity-90 tracking-tight">
                        Kōdo watches how you think — not just what you answer. Before it helps, it names the pattern. Rushed? Skipping edge cases? Avoiding recursion? It calls it out before it lets you repeat it.
                    </p>
                </div>
                <ul className="space-y-4">
                    {[
                        { n: "1", t: "Behavioral signals" },
                        { n: "2", t: "Recurring blind spots" },
                        { n: "3", t: "Break the loop" },
                    ].map((itm) => (
                        <li key={itm.n} className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-full bg-[#3D1515] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                {itm.n}
                            </span>
                            <span className="text-sm font-medium opacity-90">{itm.t}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ),
    },
    {
        id: 3,
        title: "3",
        bgColor: "bg-[#3D1515]",
        textColor: "text-white",
        content: (
            <div className="flex flex-col h-full justify-center max-w-lg px-12 md:px-20 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6 opacity-60">
                        <span className="w-1 h-1 rounded-full border border-current bg-transparent"></span>
                        <span className="text-sm font-medium">Adaptive Explanation.</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-medium leading-[1.3] opacity-90 tracking-tight">
                        Kōdo remembers which analogy made arrays click for you last Tuesday. It never explains the same concept the same way twice — it explains it the way that worked for you, refined.
                    </p>
                </div>
                <ul className="space-y-4">
                    {[
                        { n: "1", t: "Analogy memory" },
                        { n: "2", t: "Concept reinforcement" },
                        { n: "3", t: "Explanation depth" },
                    ].map((itm) => (
                        <li key={itm.n} className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-full bg-white text-[#3D1515] flex items-center justify-center text-[10px] font-bold shrink-0">
                                {itm.n}
                            </span>
                            <span className="text-sm font-medium opacity-90">{itm.t}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ),
    },
    {
        id: 4,
        title: "4",
        bgColor: "bg-[#3D1515]",
        textColor: "text-white",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        content: (
            <div className="flex flex-col h-full justify-center max-w-lg px-12 md:px-20 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-700 mix-blend-difference text-white">
                <div className="mb-12">
                    <p className="text-2xl md:text-3xl font-medium leading-[1.3] tracking-tight mb-8">
                        Mastering your Failure DNA & building Hindsight into every session.
                    </p>
                    <ul className="space-y-4">
                        {[
                            { n: "1", t: "Weekly Insight Card" },
                            { n: "2", t: "Failure DNA map" },
                            { n: "3", t: "Long-term growth" },
                        ].map((itm) => (
                            <li key={itm.n} className="flex items-center gap-4">
                                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {itm.n}
                                </span>
                                <span className="text-sm font-medium">{itm.t}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
    },
];

export default function AccordionSection() {
    const [activeId, setActiveId] = useState(2);

    return (
        <section className="w-full h-screen bg-[#3D1515] py-2 px-2 overflow-hidden">
            <div className="w-full h-full flex rounded-3xl overflow-hidden shadow-2xl relative">
                {cards.map((card) => {
                    const isActive = card.id === activeId;
                    return (
                        <div
                            key={card.id}
                            onClick={() => setActiveId(card.id)}
                            className={clsx(
                                "group relative h-full flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-[800ms] ease-in-out",
                                card.bgColor,
                                card.textColor,
                                isActive ? "flex-[6]" : "flex-1 hover:flex-[1.2]"
                            )}
                        >
                            {/* Optional Background Image */}
                            {card.image && (
                                <div className="absolute inset-0 w-full h-full">
                                    <Image
                                        src={card.image}
                                        alt="Background placeholder"
                                        fill
                                        className={clsx(
                                            "object-cover object-center transition-all duration-1000",
                                            isActive ? "scale-100 grayscale-0" : "scale-110 grayscale"
                                        )}
                                    />
                                    <div className="absolute inset-0 bg-black/20" />
                                </div>
                            )}

                            {/* Content Container (only visible when active) */}
                            <div
                                className={clsx(
                                    "absolute inset-0 h-full w-full flex items-center transition-opacity duration-300 delay-300",
                                    isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                                )}
                            >
                                {isActive && card.content}
                            </div>

                            {/* Large Number */}
                            <div
                                className={clsx(
                                    "absolute bottom-0 w-full transition-all duration-[800ms] ease-in-out",
                                    isActive ? "right-[-10%] sm:right-[10%] opacity-100 translate-x-0" : "right-1/2 translate-x-1/2 opacity-70"
                                )}
                            >
                                <span
                                    className={clsx(
                                        "block text-center font-display font-bold leading-none tracking-tighter transition-all duration-1000",
                                        isActive ? "text-[25vh] sm:text-[35vh] text-right" : "text-[15vh] sm:text-[20vh]"
                                    )}
                                    style={{ transform: "translateY(15%)" }}
                                >
                                    {card.title}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
