// store.ts
import { create } from "zustand";
import type { Widget } from "../widgets/widget";
const initialState = {
    puzzles: 0,
    openWidget: undefined as Widget | undefined,
};

type GameState = typeof initialState & {
    increase: (delta: number) => void;
    reset: () => void;
    setOpenWidget: (newWidget: Widget | undefined) => void;
};

export const useGameStore = create<GameState>()((set) => ({
    ...initialState,
    increase: (delta: number) => set((s) => ({ puzzles: s.puzzles + delta })),
    reset: () => set(initialState),
    setOpenWidget: (newWidget) => set({ openWidget: newWidget }),
}));
