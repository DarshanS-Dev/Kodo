"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { FloatingDock } from "@/components/ui/floating-dock";

const HIDDEN_ROUTES = ["/login", "/register"];

export default function Navbar() {
    const pathname = usePathname();

    if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return null;

    return (
        <div className="fixed top-12 right-12 z-[100] w-full max-w-fit px-4 mix-blend-normal">
            <FloatingDock />
        </div>
    );
}
