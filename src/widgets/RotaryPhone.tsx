import { useMemo } from "react";
import rotaryPhoneImgUrl from "../assets/Rphone_placeholder_body.png";
import { useGameStore } from "../state/store";
import { Control } from "./Control";
import styles from "./RotaryPhone.module.css";
import type { WidgetProps } from "./widget";

const rotorLeft = 190;
const rotorTop = 320;
const rotorSize = 400;

interface RotaryPhoneProps extends WidgetProps {
    onDial?: (dialed: string) => void;
}

export function RotaryPhone(props: RotaryPhoneProps) {
    const dialed = useGameStore((s) => s.widgets.rotaryPhone.dialed);
    const addDialedNumber = useGameStore((s) => s.widgets.rotaryPhone.addDialedNumber);
    const isPhoneRinging = useGameStore((s) => s.widgets.rotaryPhone.ringing);
    const answerPhone = useGameStore((s) => s.widgets.rotaryPhone.answer);
    const dial = (digit: number) => {
        addDialedNumber(digit);
    };

    if (props.scaleDown) {
        return <PhoneImage inert={props.blockInteraction} />;
    }

    return (
        <div className={styles.RotaryPhone}>
            <PhoneImage />
            {isPhoneRinging && <Control top={0} left={0} height={500} width={1200} onClick={answerPhone} />}
            <RotaryPhoneRotor left={rotorLeft} top={rotorTop} size={rotorSize} />
            <div
                style={{
                    position: "absolute",
                    left: rotorLeft + rotorSize / 2,
                    top: rotorTop + rotorSize / 2,
                }}>
                <RotaryPhoneDigit digit={1} onClick={dial} />
                <RotaryPhoneDigit digit={2} onClick={dial} />
                <RotaryPhoneDigit digit={3} onClick={dial} />
                <RotaryPhoneDigit digit={4} onClick={dial} />
                <RotaryPhoneDigit digit={5} onClick={dial} />
                <RotaryPhoneDigit digit={6} onClick={dial} />
                <RotaryPhoneDigit digit={7} onClick={dial} />
                <RotaryPhoneDigit digit={8} onClick={dial} />
                <RotaryPhoneDigit digit={9} onClick={dial} />
                <RotaryPhoneDigit digit={0} onClick={dial} />
            </div>
        </div>
    );
}

interface PhoneImageProps {
    inert?: boolean;
}

function PhoneImage(props: PhoneImageProps) {
    return (
        <div className={styles.RotaryPhoneFrame} inert={props.inert}>
            <img className={styles.RotaryPhoneImg} src={rotaryPhoneImgUrl} draggable={false} />
        </div>
    );
}

interface RotaryPhoneRotorProps {
    left: number;
    top: number;
    size: number;
}

function RotaryPhoneRotor(props: RotaryPhoneRotorProps) {
    return (
        <Control
            left={props.left}
            top={props.top}
            width={props.size}
            height={props.size}
            onClick={() => console.log("rotor clicked")}
            clipPath="circle(50% at 50% 50%)"
            debug>
            <div></div>
        </Control>
    );
}

const rotorHoleSize = 50;
const rotorDigitDiameter = rotorSize - 70;

interface RotaryPhoneDigitProps {
    digit: number;
    onClick?: (digit: number) => void;
}

function RotaryPhoneDigit(props: RotaryPhoneDigitProps) {
    const dist = 100;
    const angle = useMemo(() => {
        const digit = props.digit === 0 ? 10 : props.digit;
        return Math.PI / 8 + (digit * Math.PI) / 6;
    }, [props.digit]);
    const radius = (rotorDigitDiameter - rotorHoleSize) / 2;
    const top = -radius * Math.sin(angle) - rotorHoleSize / 2;
    const left = radius * Math.cos(angle) - rotorHoleSize / 2;

    return (
        <Control
            left={left}
            top={top}
            width={rotorHoleSize}
            height={rotorHoleSize}
            onClick={() => props.onClick?.(props.digit)}
            clipPath="circle(50% at 50% 50%)"
            debug>
            <span className={styles.RotaryPhoneDigit}>{props.digit}</span>
        </Control>
    );
}
