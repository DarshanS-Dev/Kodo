"use client";

import { useEffect } from "react";
import { startSession } from "@/lib/api";
import { useKodoStore } from "@/lib/store";

export function SessionInit() {
  const setGreeting = useKodoStore((s) => s.setSessionGreeting);

  useEffect(() => {
    async function init() {
      try {
        const greeting = await startSession();
        setGreeting(greeting);
      } catch (err) {
        console.error("Session INIT error:", err);
      }
    }
    init();
  }, [setGreeting]);

  return null;
}
