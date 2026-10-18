// store.ts
import { Howl } from "howler";
import { create } from "zustand";
import drawerOpeningSoundUrl from "../assets/audio/placeholder_drawer_opening.wav";
import type { Widget } from "../widgets/widget";

const drawerOpeningSound = new Howl({
    src: [drawerOpeningSoundUrl],
});

export type PlugPositions = "base" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
const initialState = {
    openWidget: undefined as Widget | undefined,
    widgets: {
        switchboard: {
            plugOnePosition: "base" as PlugPositions,
            plugTwoPosition: "base" as PlugPositions,
        },
        clock: {
            hourAngle: 270,
            minuteAngle: 315,
        },
        tv: {
            hasTape: false,
            currentTime: undefined as number | undefined,
        },
        morse: {
            currentValue: "" as string,
        },
        rightDrawer: {
            isOpen: false,
            containsTape: true,
        },
        leftDrawer: {
            isOpen: false,
        },
        cassette: {
            tapeInside: false,
        },
        rotaryPhone: {
            dialed: "",
        },
    },
    hasCasetteTape: false,
};

type GameState = typeof initialState & {
    setOpenWidget: (newWidget: Widget | undefined) => void;
    widgets: {
        switchboard: {
            setPlugPosition: (plugNumber: "One" | "Two", plugPosition: PlugPositions) => void;
        };
        clock: {
            setClockHandAngle: (hand: "hour" | "minute", angle: number) => void;
        };
        tv: {
            setHasTape: (hasTape: boolean) => void;
            setCurrentTime: (currentTime: number | undefined) => void;
        };
        morse: {
            addMorse: (newCharacter: string) => void;
        };
        cassette: {
            insertTape: () => void;
            eject: () => void;
        };
        rightDrawer: {
            open: () => void;
            takeTape: () => void;
        };
        leftDrawer: {
            open: () => void;
        };
        rotaryPhone: {
            addDialedNumber: (newNumber: number) => void;
        };
    };
};

export const useGameStore = create<GameState>()((set) => ({
    ...initialState,
    setOpenWidget: (newWidget) => set({ openWidget: newWidget }),
    widgets: {
        ...initialState.widgets,
        switchboard: {
            ...initialState.widgets.switchboard,
            setPlugPosition: (plugNumber, plugPosition) =>
                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        switchboard: { ...s.widgets.switchboard, [`plug${plugNumber}Position`]: plugPosition },
                    },
                })),
        },
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
        morse: {
            ...initialState.widgets.morse,
            addMorse(newCharacter: string) {
                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        morse: {
                            ...s.widgets.morse,
                            currentValue: (s.widgets.morse.currentValue + newCharacter).slice(-50),
                        },
                    },
                }));
            },
        },
        rightDrawer: {
            ...initialState.widgets.rightDrawer,
            open() {
                drawerOpeningSound.play();

                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        rightDrawer: {
                            ...s.widgets.rightDrawer,
                            isOpen: true,
                        },
                    },
                }));
            },
            takeTape() {
                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        rightDrawer: {
                            ...s.widgets.rightDrawer,
                            containsTape: false,
                        },
                    },
                    hasCasetteTape: true,
                }));
            },
        },
        leftDrawer: {
            ...initialState.widgets.leftDrawer,
            open() {
                drawerOpeningSound.play();

                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        leftDrawer: {
                            ...s.widgets.leftDrawer,
                            isOpen: true,
                        },
                    },
                }));
            },
        },
        cassette: {
            ...initialState.widgets.cassette,
            insertTape() {
                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        cassette: {
                            ...s.widgets.cassette,
                            tapeInside: true,
                        },
                    },
                    hasCasetteTape: false,
                }));
            },
            eject() {
                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        cassette: {
                            ...s.widgets.cassette,
                            tapeInside: false,
                        },
                    },
                    hasCasetteTape: true,
                }));
            },
        },
        rotaryPhone: {
            ...initialState.widgets.rotaryPhone,
            addDialedNumber(newDialedNumber: number) {
                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        rotaryPhone: {
                            ...s.widgets.rotaryPhone,
                            dialed: s.widgets.rotaryPhone.dialed + newDialedNumber.toString(),
                        },
                    },
                }));
            },
            resetDialedNumber() {
                set((s) => ({
                    widgets: {
                        ...s.widgets,
                        rotaryPhone: {
                            ...s.widgets.rotaryPhone,
                            dialed: "",
                        },
                    },
                }));
            },
        },
    },
}));

const targetHourAngleRange = { min: 24, max: 59 };
const targetMinuteAngleRange = { min: 209, max: 238 };

const targetPhoneNumber = "123456";

function hourInRange(hour: number) {
    return hour < targetHourAngleRange.max && hour > targetHourAngleRange.min;
}
function minuteInRange(minute: number) {
    return minute < targetMinuteAngleRange.max && minute > targetMinuteAngleRange.min;
}

useGameStore.subscribe((state) => {
    if (!state.widgets.rightDrawer.isOpen) {
        const hourCorrect = hourInRange(state.widgets.clock.hourAngle);
        const minuteCorrect = minuteInRange(state.widgets.clock.minuteAngle);
        if (hourCorrect && minuteCorrect) {
            state.widgets.rightDrawer.open();
        }
    }

    if (!state.widgets.leftDrawer.isOpen) {
        const phoneNumberCorrect = state.widgets.rotaryPhone.dialed === targetPhoneNumber;
        if (phoneNumberCorrect) {
            state.widgets.leftDrawer.open();
        }
    }
});
