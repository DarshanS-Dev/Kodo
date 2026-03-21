"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Terminal } from "lucide-react";
import Link from "next/link";

export const FloatingDock = ({
    className,
}: {
    className?: string;
}) => {
    const mouseX = useMotionValue(Infinity);

    const items = [
        { title: "Home", icon: <Home className="h-full w-full" />, href: "/" },
        { title: "Workspace", icon: <Terminal className="h-full w-full" />, href: "/workspace" },
    ];

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                "mx-auto flex h-16 items-end gap-4 rounded-2xl bg-[#EFEDE3]/10 px-4 pb-3 backdrop-blur-md border border-white/10 shadow-2xl",
                className
            )}
        >
            {items.map((item) => (
                <IconContainer mouseX={mouseX} key={item.title} {...item} />
            ))}
        </motion.div>
    );
};

function IconContainer({
    mouseX,
    title,
    icon,
    href,
    highlight
}: {
    mouseX: any;
    title: string;
    icon: React.ReactNode;
    href: string;
    highlight?: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

    const width = useSpring(widthTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });
    const height = useSpring(heightTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={href}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative"
        >
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 2, x: "-50%" }}
                        className="absolute -top-12 left-1/2 w-fit whitespace-pre rounded-md border border-white/10 bg-[#EFEDE3] px-2 py-0.5 text-xs font-bold text-[#3D1515] shadow-xl"
                    >
                        {title}
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div
                ref={ref}
                style={{ width, height }}
                className={cn(
                    "flex items-center justify-center rounded-full transition-colors",
                    highlight ? "bg-[#EFEDE3]" : "bg-[#EFEDE3]/20 hover:bg-[#EFEDE3]/40 text-[#EFEDE3]"
                )}
            >
                <div className="flex h-1/2 w-1/2 items-center justify-center">{icon}</div>
            </motion.div>
        </Link>
    );
}
