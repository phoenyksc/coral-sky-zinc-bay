import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentState {
  handles: string[];
  push: (handle: string) => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      handles: [],
      push: (handle) => {
        const next = [handle, ...get().handles.filter((h) => h !== handle)].slice(0, 8);
        set({ handles: next });
      },
    }),
    { name: "sol-beautiful-recent-v1" },
  ),
);
