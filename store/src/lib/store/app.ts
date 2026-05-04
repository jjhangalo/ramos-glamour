import { create } from "zustand";

interface AppState {
  isInitialLoading: boolean;
  setIsInitialLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialLoading: true,
  setIsInitialLoading: (loading) => set({ isInitialLoading: loading }),
}));
