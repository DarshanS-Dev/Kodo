"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LayoutTextFlip = ({
    text,
    words,
    className,
}: {
    text: string;
    words: string[];
    className?: string;
}) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [words.length]);

    return (
        <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
            <span className="text-[#EFEDE3]">{text}</span>
            <div className="relative inline-block h-[1.2em] overflow-hidden min-w-[300px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ y: 20, opacity: 0, rotateX: -90 }}
                        animate={{ y: 0, opacity: 1, rotateX: 0 }}
                        exit={{ y: -20, opacity: 0, rotateX: 90 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        className="absolute left-0 top-0 whitespace-nowrap text-[#EFEDE3] font-bold"
                    >
                        {words[index].split("").map((letter, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                transition={{
                                    delay: i * 0.05,
                                    duration: 0.4,
                                }}
                                className="inline-block"
                            >
                                {letter === " " ? "\u00A0" : letter}
                            </motion.span>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
