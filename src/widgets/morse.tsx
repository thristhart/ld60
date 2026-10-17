import classNames from "classnames";
import { useEffect, useState } from "react";
import telegraphKeyBaseImgUrl from "../assets/placeholder_telegraph_key_base.png";
import telegraphKeyLeverImgUrl from "../assets/placeholder_telegraph_key_lever.png";
import telegraphKeyLightOffImgUrl from "../assets/placeholder_telegraph_key_off.png";
import telegraphKeyLightOnImgUrl from "../assets/placeholder_telegraph_key_on.png";
import telegraphKeyOverviewImgUrl from "../assets/placeholder_telegraph_key_overview.png";
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

function TelegraphKey() {
    const { context, gain } = useMorseAudioContext();
    const [pressed, setPressed] = useState(false);

    useEffect(() => {
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
    }, [pressed]);

    return (
        <div className={styles.TelegraphKey}>
            <img className={styles.TelegraphKeyBase} src={telegraphKeyBaseImgUrl} />
            <img
                className={styles.TelegraphKeyLight}
                src={pressed ? telegraphKeyLightOnImgUrl : telegraphKeyLightOffImgUrl}
            />
            <img
                className={classNames(styles.TelegraphKeyLever, pressed && styles.LeverPressed)}
                src={telegraphKeyLeverImgUrl}
            />
            <Control
                className={styles.TelegraphButton}
                left={865}
                top={660}
                width={130}
                height={200}
                onDown={() => setPressed(true)}
                onUp={() => setPressed(false)}
                onExit={() => setPressed(false)}
            />
        </div>
    );
}
