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
        tv: {
            hasTape: false,
            currentTime: undefined as number | undefined,
        },
    },
};

type GameState = typeof initialState & {
    setOpenWidget: (newWidget: Widget | undefined) => void;
    widgets: {
        clock: {
            setClockHandAngle: (hand: "hour" | "minute" | "second", angle: number) => void;
        };
        tv: {
            setHasTape: (hasTape: boolean) => void;
            setCurrentTime: (currentTime: number | undefined) => void;
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
                set((s) => ({ widgets: { ...s.widgets, clock: { ...s.widgets.clock, [`${hand}Angle`]: angle } } })),
        },
        tv: {
            ...initialState.widgets.tv,
            setHasTape: (hasTape: boolean) =>
                set((s) => ({ widgets: { ...s.widgets, tv: { ...s.widgets.tv, hasTape } } })),
            setCurrentTime: (currentTime: number | undefined) =>
                set((s) => {
                    if (s.widgets.tv.currentTime === currentTime) {
                        return s;
                    }
                    return { widgets: { ...s.widgets, tv: { ...s.widgets.tv, currentTime } } };
                }),
        },
    },
}));
