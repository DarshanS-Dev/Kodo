"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import for components that use browser APIs
const Editor = dynamic(() => import("@/components/ui/Editor"), { ssr: false });

export default function WorkspacePage() {
    return (
        <div className="min-h-screen bg-[#3D1515] pt-16">
            <main className="container mx-auto px-4 h-[calc(100vh-64px)] overflow-hidden">
                <div className="flex flex-col h-full gap-4 pb-4">
                    <header className="flex justify-between items-center py-2 px-4 bg-[#EFEDE3]/5 rounded-lg border border-white/10">
                        <h1 className="text-[#EFEDE3] font-oswald text-xl uppercase tracking-widest">Workspace / Editor</h1>
                        <div className="flex gap-2">
                             <span className="text-[#EFEDE3]/40 text-xs">Python Mode</span>
                        </div>
                    </header>
                    <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <Suspense fallback={<div className="h-full flex items-center justify-center text-[#EFEDE3]">Loading IDE...</div>}>
                            <Editor />
                        </Suspense>
                    </div>
                </div>
            </main>
        </div>
    );
}
