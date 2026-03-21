"use client";

import { create } from "zustand";

interface KodoState {
  sessionGreeting: string;
  setSessionGreeting: (greeting: string) => void;
}

export const useKodoStore = create<KodoState>((set) => ({
  sessionGreeting: "",
  setSessionGreeting: (greeting: string) => set({ sessionGreeting: greeting }),
}));
