"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const words = [
    "PATTERN RECOGNITION",
    "COMEBACK BRIEF",
    "ADAPTIVE MEMORY",
    "FAILURE DNA",
    "BEHAVIORAL SIGNALS",
    "WEAK AREA TARGETING",
    "HINDSIGHT ENGINE",
];

export default function AnimatedWords() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Create a GSAP timeline that loops
        const tl = gsap.timeline({ repeat: -1 });
        const textElements = containerRef.current.children;

        // Hide all initially except the first one (handled by CSS)
        gsap.set(textElements, { y: 20, opacity: 0, position: "absolute", top: 0, left: 0 });

        for (let i = 0; i < textElements.length; i++) {
            tl.to(textElements[i], {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: "back.out(1.7)"
            })
                .to(textElements[i], {
                    y: -20,
                    opacity: 0,
                    duration: 0.5,
                    delay: 1.5,
                    ease: "power2.in"
                });
        }

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <div className="relative h-6 text-[#493035] font-bold tracking-widest text-sm uppercase" ref={containerRef}>
            {words.map((word, i) => (
                <span key={i} className="whitespace-nowrap">
                    {word}
                </span>
            ))}
        </div>
    );
}
