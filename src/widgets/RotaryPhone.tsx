import rotaryPhoneImgUrl from "../assets/Rphone_placeholder_body.png";
import { useGameStore } from "../state/store";
import { Control } from "./Control";
import styles from "./RotaryPhone.module.css";
import type { WidgetProps } from "./widget";

const rotorLeft = 195;
const rotorTop = 370;
const rotorSize = 380;

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
                {digits.map((digit) => (
                    <RotaryPhoneDigit key={digit} digit={digit} onClick={dial} />
                ))}
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
    const strokeWidth = 5;
    const center = props.size / 2;

    const d = [
        circlePath(center, center, center - strokeWidth / 2),
        ...digits.map((digit) =>
            circlePath(
                center + rotorHoleRingRadius * Math.cos(digitAngle(digit)),
                center - rotorHoleRingRadius * Math.sin(digitAngle(digit)),
                rotorHoleSize / 2
            )
        ),
    ].join(" ");

    return (
        <svg
            style={{ position: "absolute", left: props.left, top: props.top }}
            width={props.size}
            height={props.size}
            viewBox={`0 0 ${props.size} ${props.size}`}>
            <path d={d} fillRule="evenodd" fill="#0d4466" stroke="black" strokeWidth={strokeWidth} />
        </svg>
    );
}

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const rotorHoleSize = 50;
const rotorDigitDiameter = rotorSize - 70;
const rotorHoleRingRadius = (rotorDigitDiameter - rotorHoleSize) / 2;

function digitAngle(digit: number) {
    return Math.PI / 8 + ((digit === 0 ? 10 : digit) * Math.PI) / 6;
}

function circlePath(cx: number, cy: number, r: number) {
    return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
}

interface RotaryPhoneDigitProps {
    digit: number;
    onClick?: (digit: number) => void;
}

function RotaryPhoneDigit(props: RotaryPhoneDigitProps) {
    const angle = digitAngle(props.digit);
    const top = -rotorHoleRingRadius * Math.sin(angle) - rotorHoleSize / 2;
    const left = rotorHoleRingRadius * Math.cos(angle) - rotorHoleSize / 2;

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
