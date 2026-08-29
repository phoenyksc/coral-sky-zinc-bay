import { create } from "zustand";

interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  navOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  navOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen, navOpen: false, searchOpen: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen, navOpen: false }),
  setNavOpen: (navOpen) => set({ navOpen, searchOpen: false }),
}));
