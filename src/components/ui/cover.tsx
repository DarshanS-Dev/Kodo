"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const Cover = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    const [hovered, setHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "group/container relative inline-block rounded-xl px-2 py-1 transition-all duration-300",
                className
            )}
        >
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-0 bg-neutral-200/20 mix-blend-overlay blur-xl"
                        style={{
                            left: mousePosition.x - 100,
                            top: mousePosition.y - 100,
                            width: 200,
                            height: 200,
                        }}
                    />
                )}
            </AnimatePresence>
            <motion.span
                className={cn(
                    "relative z-10 block transition-all duration-300",
                    hovered ? "text-white scale-105" : "text-inherit"
                )}
            >
                {children}
            </motion.span>
        </div>
    );
};
