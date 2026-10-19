import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import telegraphKeyOverviewImgUrl from "../assets/telegraph_key.png";
import telegraphKeyBaseImgUrl from "../assets/telegraph_key_base.png";
import telegraphKeyLeverImgUrl from "../assets/telegraph_key_lever.png";
import { useGameStore } from "../state/store";
import { Control } from "./Control";
import styles from "./morse.module.css";
import type { WidgetProps } from "./widget";

interface MorseProps extends WidgetProps {}

function useMorseAudioContext() {
    return useState(() => {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        gain.gain.value = 0;
        oscillator.frequency.value = 600;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        return { context, oscillator, gain };
    })[0];
}

export function Morse(props: MorseProps) {
    if (props.scaleDown) {
        return <img className={styles.ScaledDown} src={telegraphKeyOverviewImgUrl} inert={props.blockInteraction} />;
    }
    return <TelegraphKey />;
}

const secondsMorseBeepFade = 0.05;
const morseBeepVolume = 0.01;
const maxDotLength = 300; // 300ms
const minSpaceLength = 500; // half a second

function TelegraphKey() {
    const { context, gain } = useMorseAudioContext();
    const [pressed, setPressed] = useState(false);
    let lastPressed = useRef(false);
    let lastPressedTime = useRef(Date.now());
    let lastUnpressedTime = useRef(Date.now());
    const previewRef = useRef<HTMLDivElement>(null);
    const currentMorse = useGameStore((s) => s.widgets.morse.currentValue);
    const addMorse = useGameStore((s) => s.widgets.morse.addMorse);
    const addSpaceTimeoutRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        if (lastPressed.current !== pressed) {
            if (addSpaceTimeoutRef.current) {
                clearTimeout(addSpaceTimeoutRef.current);
            }
            const timeNow = Date.now();
            if (pressed) {
                lastPressedTime.current = Date.now();
            } else {
                // if newly unpressed:
                if (timeNow - lastPressedTime.current > maxDotLength) {
                    addMorse("-");
                } else {
                    addMorse(".");
                }

                lastUnpressedTime.current = Date.now();

                addSpaceTimeoutRef.current = window.setTimeout(() => {
                    addMorse(" ");
                }, minSpaceLength);
            }
        }
        if (pressed) {
            gain.gain.setValueAtTime(0, context.currentTime);
            gain.gain.linearRampToValueAtTime(morseBeepVolume, context.currentTime + secondsMorseBeepFade);
            gain.gain.setValueAtTime(morseBeepVolume, context.currentTime + secondsMorseBeepFade);
        } else {
            if (gain.gain.value !== 0) {
                gain.gain.setValueAtTime(morseBeepVolume, context.currentTime);
                gain.gain.linearRampToValueAtTime(0, context.currentTime + secondsMorseBeepFade);
                gain.gain.setValueAtTime(0, context.currentTime + secondsMorseBeepFade);
            }
        }
        lastPressed.current = pressed;
    }, [pressed]);

    return (
        <div className={styles.TelegraphKey}>
            <img className={styles.TelegraphKeyBase} src={telegraphKeyBaseImgUrl} />
            <img
                className={classNames(styles.TelegraphKeyLever, pressed && styles.LeverPressed)}
                src={telegraphKeyLeverImgUrl}
            />
            <div className={styles.TelegraphPreview}>
                <div ref={previewRef} className={styles.TelegraphPreviewText}>
                    {currentMorse}
                </div>
            </div>
            <Control
                className={styles.TelegraphButton}
                left={1565}
                top={300}
                width={230}
                height={400}
                onDown={() => setPressed(true)}
                onUp={() => setPressed(false)}
                onExit={() => setPressed(false)}
            />
        </div>
    );
}
