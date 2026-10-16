// store.ts
import { create } from 'zustand'


const initialState = { puzzles: 0 }

type GameState = typeof initialState & {
  increase: (delta: number) => void
  reset: () => void
}

export const useGameStore = create<GameState>()((set) => ({
  ...initialState,
  increase: ( delta: number ) => set((s) => ({ puzzles: s.puzzles + delta })),
  reset: () => set(initialState),
}))
