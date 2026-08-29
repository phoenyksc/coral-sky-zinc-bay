import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-store-BS1HWLPH.js
var useOrdersStore = create()(persist((set, get) => ({
	orders: [],
	add: (order) => set({ orders: [order, ...get().orders] }),
	get: (id) => get().orders.find((o) => o.id === id)
}), { name: "sol-beautiful-orders-v1" }));
//#endregion
export { useOrdersStore as t };
