import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  handles: string[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  toggle: (handle: string) => boolean;
  has: (handle: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      handles: [],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      toggle: (handle) => {
        const has = get().handles.includes(handle);
        set({
          handles: has ? get().handles.filter((h) => h !== handle) : [...get().handles, handle],
        });
        return !has;
      },
      has: (handle) => get().handles.includes(handle),
    }),
    {
      name: "sol-beautiful-wishlist-v1",
      partialize: (s) => ({ handles: s.handles }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
