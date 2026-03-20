"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { FloatingDock } from "@/components/ui/floating-dock";

export default function Navbar() {
    const pathname = usePathname();
    const isAuthPage = pathname === "/login" || pathname === "/register";

    if (isAuthPage) return null;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-fit px-4 mix-blend-normal">
            <FloatingDock />
        </div>
    );
}
