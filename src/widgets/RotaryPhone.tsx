import { useEffect, useMemo, useState } from "react";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { Hotspot } from "./Hotspot";
import { Control } from "./Control";
import rotaryPhoneImgUrl from "../assets/RotaryPhone.png";
import styles from "./RotaryPhone.module.css";
import type { WidgetProps } from "./widget";


const rotarLeft = 400;
const rotarTop = 200;
const rotarSize = 500;

interface RotaryPhoneProps extends WidgetProps {
    onDial?: (dialed: string) => void;
}

export function RotaryPhone(props: RotaryPhoneProps) {
    const [ dialed, setDialed ] = useState<string>("");
    const dial = (digit: number) => {
        const newDialed = `${dialed}${digit}`;
        setDialed(newDialed);
        props.onDial?.(newDialed);
    };

    if (props.scaleDown) {
        return <img className={styles.ScaledDown} src={rotaryPhoneImgUrl} inert={props.blockInteraction} />;
    }

    return (
        <div className={styles.RotaryPhone}>
            <img className={styles.RotaryPhoneImg} src={rotaryPhoneImgUrl} />
            <RotaryPhoneRotar
                left={rotarLeft}
                top={rotarTop}
                size={rotarSize}
            />
            <div style={{
                position: "absolute",
                left: rotarLeft + (rotarSize / 2),
                top: rotarTop + (rotarSize /2),
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

interface RotaryPhoneRotarProps {
    left: number;
    top: number;
    size: number
}

function RotaryPhoneRotar(props: RotaryPhoneRotarProps) {
    return (
        <Control
            left={props.left}
            top={props.top}
            width={props.size}
            height={props.size}
            onClick={() => console.log("rotor clicked")}
            clipPath="circle(50% at 50% 50%)"
            debug
        >
            <div></div>
        </Control>
    );
}


const rotarHoleSize = 80;
const rotarDigitDiameter = rotarSize - 100;

interface RotaryPhoneDigitProps {
    digit: number;
    onClick?: (digit: number) => void;
}

function RotaryPhoneDigit(props: RotaryPhoneDigitProps) {
    const dist = 100;
    const angle = useMemo(() => {
        const digit = props.digit === 0 ? 10 : props.digit;
        return (Math.PI / 8) + (digit * Math.PI / 6);
    }, [props.digit]);
    const radius = (rotarDigitDiameter - rotarHoleSize) / 2;
    const top = -radius * Math.sin(angle) - rotarHoleSize / 2;
    const left = radius * Math.cos(angle) - rotarHoleSize / 2;

    return (
        <Control
            left={left}
            top={top}
            width={rotarHoleSize}
            height={rotarHoleSize}
            onClick={() => props.onClick?.(props.digit)}
            clipPath="circle(50% at 50% 50%)"
            debug
        >
            <span className={styles.RotaryPhoneDigit}>{props.digit}</span>
        </Control>
    );
}
