import { useCallback } from "react";
import rotaryPhoneImgUrl from "../../assets/Rphone_placeholder_body.png";
import { useGameStore } from "../../state/store";
import { Control } from "../Control";
import styles from "./RotaryPhone.module.css";
import type { WidgetProps } from "../widget";
import {
    circlePath,
    digits,
    fingerStopAngle,
    holeOffset,
    rotorHoleRingRadius,
    rotorHoleSize,
} from "./rotaryPhoneUtils";
import { useRotorDial } from "./useRotorDial";

const rotorLeft = 195;
const rotorTop = 370;
const rotorSize = 380;

interface RotaryPhoneProps extends WidgetProps {
    onDial?: (dialed: string) => void;
}

export function RotaryPhone(props: RotaryPhoneProps) {
    const isPhoneRinging = useGameStore((s) => s.widgets.rotaryPhone.ringing);
    const answerPhone = useGameStore((s) => s.widgets.rotaryPhone.answer);
    const addDialedNumber = useGameStore((s) => s.widgets.rotaryPhone.addDialedNumber);
    const { onDial } = props;
    const dial = useCallback(
        (digit: number) => {
            addDialedNumber(digit);
            onDial?.(useGameStore.getState().widgets.rotaryPhone.dialed);
        },
        [addDialedNumber, onDial]
    );

    if (props.scaleDown) {
        return <PhoneImage inert={props.blockInteraction} />;
    }

    return (
        <div className={styles.RotaryPhone}>
            <PhoneImage />
            {isPhoneRinging && <Control top={0} left={0} height={500} width={1200} onClick={answerPhone} />}
            <div
                style={{
                    position: "absolute",
                    left: rotorLeft + rotorSize / 2,
                    top: rotorTop + rotorSize / 2,
                }}>
                {digits.map((digit) => (
                    <RotaryPhoneDigit key={digit} digit={digit} />
                ))}
            </div>
            <RotaryPhoneRotor left={rotorLeft} top={rotorTop} size={rotorSize} onDialed={dial} />
            <FingerStop />
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
    onDialed: (digit: number) => void;
}

function RotaryPhoneRotor(props: RotaryPhoneRotorProps) {
    const { rotorRef, angle, returnMs, grab, onReturned } = useRotorDial(props.onDialed);

    const strokeWidth = 5;
    const center = props.size / 2;

    const holes = digits.map((digit) => {
        const offset = holeOffset(digit, props.size);
        return { digit, left: center + offset.x, top: center + offset.y };
    });

    const d = [
        circlePath(center, center, center - strokeWidth / 2),
        ...holes.map((hole) => circlePath(hole.left, hole.top, rotorHoleSize / 2)),
    ].join(" ");

    return (
        <div
            ref={rotorRef}
            style={{
                position: "absolute",
                left: props.left,
                top: props.top,
                width: props.size,
                height: props.size,
                transform: `rotate(${angle}rad)`,
                transition: returnMs ? `transform ${returnMs}ms ease-out` : "none",
                touchAction: "none",
            }}
            onTransitionEnd={onReturned}>
            <svg
                style={{ display: "block" }}
                width={props.size}
                height={props.size}
                viewBox={`0 0 ${props.size} ${props.size}`}>
                <path d={d} fillRule="evenodd" fill="#0d4466" stroke="black" strokeWidth={strokeWidth} />
            </svg>
            {holes.map((hole) => (
                <Control
                    key={hole.digit}
                    left={hole.left - rotorHoleSize / 2}
                    top={hole.top - rotorHoleSize / 2}
                    width={rotorHoleSize}
                    height={rotorHoleSize}
                    onPointerDown={(e) => grab(hole.digit, e)}
                    clipPath="circle(50% at 50% 50%)"
                    debug
                />
            ))}
        </div>
    );
}

function FingerStop() {
    const thickness = 14;
    const inner = rotorHoleRingRadius(rotorSize);
    const outer = rotorSize / 2 + 10;

    return (
        <div
            style={{
                position: "absolute",
                left: rotorLeft + rotorSize / 2,
                top: rotorTop + rotorSize / 2 - thickness / 2,
                width: outer,
                height: thickness,
                transformOrigin: "0 50%",
                transform: `rotate(${-fingerStopAngle}rad)`,
                pointerEvents: "none",
            }}>
            <div
                style={{
                    marginLeft: inner,
                    height: "100%",
                    backgroundColor: "#bbb",
                    border: "2px solid black",
                    borderRadius: thickness / 2,
                }}
            />
        </div>
    );
}

interface RotaryPhoneDigitProps {
    digit: number;
}

function RotaryPhoneDigit(props: RotaryPhoneDigitProps) {
    const offset = holeOffset(props.digit, rotorSize);

    return (
        <div
            className={styles.RotaryPhoneDigit}
            style={{
                position: "absolute",
                top: offset.y - rotorHoleSize / 2,
                left: offset.x - rotorHoleSize / 2,
                width: rotorHoleSize,
                height: rotorHoleSize,
            }}>
            {props.digit}
        </div>
    );
}
