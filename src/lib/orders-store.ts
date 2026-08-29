import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/lib/types";

interface OrdersState {
  orders: Order[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  add: (order: Order) => void;
  get: (id: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      add: (order) => set({ orders: [order, ...get().orders] }),
      get: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: "sol-beautiful-orders-v1",
      partialize: (s) => ({ orders: s.orders }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);
