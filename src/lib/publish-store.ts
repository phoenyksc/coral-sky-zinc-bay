import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PublishState {
  publicLive: boolean;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setPublicLive: (v: boolean) => void;
}

export const usePublishStore = create<PublishState>()(
  persist(
    (set) => ({
      publicLive: false,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      setPublicLive: (publicLive) => set({ publicLive }),
    }),
    {
      name: "sol-beautiful-publish-v1",
      partialize: (s) => ({ publicLive: s.publicLive }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
