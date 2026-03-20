"use client";

import React, { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

const cards = [
    {
        id: 1,
        title: "1",
        bgColor: "bg-canvas",
        textColor: "text-primary",
        content: (
            <div className="flex flex-col h-full justify-center max-w-lg px-12 md:px-20 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1.5 h-1.5 rounded-[1px] border border-current bg-transparent"></span>
                        <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Comeback Brief</span>
                    </div>
                    <p className="text-2xl md:text-4xl font-display leading-[1.1] opacity-90 tracking-tight">
                        Whether you left off stuck on recursion or halfway through a DP problem, Kōdo already knows. Every session opens with a personalized brief.
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
                            <span className="text-sm font-medium opacity-70 uppercase tracking-tighter">{itm.t}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ),
    },
    {
        id: 2,
        title: "2",
        bgColor: "bg-primary",
        textColor: "text-black",
        content: (
            <div className="flex flex-col h-full justify-center max-w-lg px-12 md:px-20 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-1 h-1 rounded-full border border-current bg-transparent"></span>
                        <span className="text-sm font-medium opacity-80 uppercase tracking-widest">Pattern Interrupt</span>
                    </div>
                    <p className="text-2xl md:text-4xl font-display leading-[1.1] opacity-90 tracking-tight">
                        Kōdo watches how you think — not just what you answer. Before it helps, it names the pattern. It calls it out before it lets you repeat it.
                    </p>
                </div>
                <ul className="space-y-4">
                    {[
                        { n: "1", t: "Behavioral signals" },
                        { n: "2", t: "Recurring blind spots" },
                        { n: "3", t: "Break the loop" },
                    ].map((itm) => (
                        <li key={itm.n} className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-full bg-canvas text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                {itm.n}
                            </span>
                            <span className="text-sm font-medium opacity-70 uppercase tracking-tighter">{itm.t}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ),
    },
    {
        id: 3,
        title: "3",
        bgColor: "bg-canvas",
        textColor: "text-primary",
        content: (
            <div className="flex flex-col h-full justify-center max-w-lg px-12 md:px-20 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6 opacity-60">
                        <span className="w-1 h-1 rounded-full border border-current bg-transparent"></span>
                        <span className="text-sm font-medium uppercase tracking-widest">Adaptive Explanation</span>
                    </div>
                    <p className="text-2xl md:text-4xl font-display leading-[1.1] opacity-90 tracking-tight">
                        Kōdo remembers which analogy made arrays click for you last Tuesday. It explains it the way that worked for you, refined.
                    </p>
                </div>
                <ul className="space-y-4">
                    {[
                        { n: "1", t: "Analogy memory" },
                        { n: "2", t: "Concept reinforcement" },
                        { n: "3", t: "Explanation depth" },
                    ].map((itm) => (
                        <li key={itm.n} className="flex items-center gap-4">
                            <span className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center text-[10px] font-bold shrink-0">
                                {itm.n}
                            </span>
                            <span className="text-sm font-medium opacity-70 uppercase tracking-tighter">{itm.t}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ),
    },
    {
        id: 4,
        title: "4",
        bgColor: "bg-black",
        textColor: "text-primary",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
        content: (
            <div className="flex flex-col h-full justify-center max-w-lg px-12 md:px-20 relative z-10 w-full animate-in fade-in slide-in-from-left-4 duration-700 mix-blend-difference text-primary">
                <div className="mb-12">
                    <p className="text-2xl md:text-4xl font-display leading-[1.1] tracking-tight mb-8">
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
                                <span className="text-sm font-medium uppercase tracking-tighter">{itm.t}</span>
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
        <section id="process" className="w-full h-screen bg-canvas py-2 px-2 overflow-hidden border-t border-white/5">
            <div className="w-full h-full flex rounded-3xl overflow-hidden shadow-2xl relative bg-canvas">
                {cards.map((card) => {
                    const isActive = card.id === activeId;
                    return (
                        <div
                            key={card.id}
                            onClick={() => setActiveId(card.id)}
                            className={clsx(
                                "group relative h-full flex-shrink-0 cursor-pointer overflow-hidden transition-all duration-[800ms] cubic-bezier(0.4, 0, 0.2, 1) will-change-[flex]",
                                card.bgColor,
                                card.textColor,
                                isActive ? "flex-[6]" : "flex-1 hover:flex-[1.2]"
                            )}
                        >
                            {/* Background Image */}
                            {card.image && (
                                <div className="absolute inset-0 w-full h-full">
                                    <Image
                                        src={card.image}
                                        alt="Background"
                                        fill
                                        className={clsx(
                                            "object-cover object-center transition-transform duration-1000",
                                            isActive ? "scale-100 grayscale-0" : "scale-110 grayscale"
                                        )}
                                    />
                                    <div className="absolute inset-0 bg-black/20" />
                                </div>
                            )}

                            {/* Content Container */}
                            <div
                                className={clsx(
                                    "absolute inset-0 h-full w-full flex items-center transition-opacity duration-300 delay-300",
                                    isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                                )}
                            >
                                {isActive && card.content}
                            </div>

                            {/* GPU Optimized Numbers */}
                            <div
                                className={clsx(
                                    "absolute bottom-0 w-full transition-all duration-[800ms] pointer-events-none select-none will-change-transform",
                                    isActive ? "right-[-10%] sm:right-[10%] opacity-100 translate-x-0" : "right-1/2 translate-x-1/2 opacity-70"
                                )}
                                style={{ transform: "translateY(15%)" }}
                            >
                                <span
                                    className={clsx(
                                        "block text-center font-display font-bold leading-none tracking-tighter transition-all duration-[800ms] origin-bottom",
                                        isActive ? "text-right" : "text-center"
                                    )}
                                    style={{
                                        fontSize: "25vh",
                                        transform: isActive ? "scale(1.5)" : "scale(0.8)",
                                        transitionProperty: "transform, opacity, right"
                                    }}
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
