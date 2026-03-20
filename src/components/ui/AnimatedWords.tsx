"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

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
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const word = words[index];

    return (
        <div className="relative h-6 text-[#EFEDE3] font-bold tracking-widest text-sm uppercase flex justify-end overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -20, opacity: 0, filter: "blur(5px)" }}
                    transition={{
                        duration: 0.6,
                        ease: [0.32, 0.72, 0, 1], // Custom cubic-bezier matching Aceternity layout flip
                    }}
                    className="whitespace-nowrap absolute right-0"
                >
                    {word.split("").map((char, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: i * 0.03, // Stagger letter typing
                                duration: 0.3,
                                ease: "easeOut",
                            }}
                            className={clsx("inline-block", char === " " && "w-2")}
                        >
                            {char}
                        </motion.span>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
