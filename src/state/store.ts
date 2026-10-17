// store.ts
import { create } from "zustand";
import type { Widget } from "../widgets/widget";

const initialState = {
    analogClockHourDegree: 270,
    analogClockMinuteDegree: 315,
    analogClockSecondDegree: 0,
    openWidget: undefined as Widget | undefined,
};

type GameState = typeof initialState & {
    setAnalogClockHourDegree: ( degree: number ) => void;
    setAnalogClockMinuteDegree: ( degree: number ) => void;
    setAnalogClockSecondDegree: ( degree: number ) => void;
    setOpenWidget: (newWidget: Widget | undefined) => void;
};

export const useGameStore = create<GameState>()((set) => ({
    ...initialState,
    setAnalogClockHourDegree: ( degree: number ) => set({ analogClockHourDegree: degree }), 
    setAnalogClockMinuteDegree: ( degree: number ) => set({ analogClockMinuteDegree: degree }), 
    setAnalogClockSecondDegree: ( degree: number ) => set({ analogClockSecondDegree: degree }), 
    setOpenWidget: (newWidget) => set({ openWidget: newWidget }),
}));