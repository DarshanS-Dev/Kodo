"use client";

import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";

export default function Navbar() {
    return (
        <div className="fixed top-12 right-12 z-[100] w-full max-w-fit px-4 mix-blend-normal">
            <FloatingDock />
        </div>
    );
}
