// store.ts
import { create } from "zustand";
import type { Widget } from "../widgets/widget";
const initialState = {
    openWidget: undefined as Widget | undefined,
    widgets: {
        clock: {
            hourAngle: 270,
            minuteAngle: 315,
            secondAngle: 0,
        },
    },
};

type GameState = typeof initialState & {
    setOpenWidget: (newWidget: Widget | undefined) => void;
    widgets: {
        clock: {
            setClockHandAngle: (hand: "hour" | "minute" | "second", angle: number) => void;
        };
    };
};

export const useGameStore = create<GameState>()((set) => ({
    ...initialState,
    setOpenWidget: (newWidget) => set({ openWidget: newWidget }),
    widgets: {
        ...initialState.widgets,
        clock: {
            ...initialState.widgets.clock,
            setClockHandAngle: (hand, angle) =>
                set((s) => ({ widgets: { clock: { ...s.widgets.clock, [`${hand}Angle`]: angle } } })),
        },
    },
}));
