import { useCallback, useId } from "react";
import clickSoundUrl from "../../assets/audio/click_2.mp3";
import rotaryPhoneImgUrl from "../../assets/phone_base.webp";
import rotorImgUrl from "../../assets/phone_rotor.webp";
import { useGameStore } from "../../state/store";
import { Control } from "../Control";
import type { WidgetProps } from "../widget";
import styles from "./RotaryPhone.module.css";
import {
    circlePath,
    digits,
    fingerStopAngle,
    holeOffset,
    rotorHoleRingRadius,
    rotorHoleSize,
} from "./rotaryPhoneUtils";
import { useRotorDial } from "./useRotorDial";

const dialClick = new Howl({
    src: [clickSoundUrl],
    volume: 0.5,
});

const rotorLeft = 245;
const rotorTop = 420;
const rotorSize = 280;

interface RotaryPhoneProps extends WidgetProps {
    onDial?: (dialed: string) => void;
}

export function RotaryPhone(props: RotaryPhoneProps) {
    const isPhoneRinging = useGameStore((s) => s.widgets.rotaryPhone.ringing);
    const answerPhone = useGameStore((s) => s.widgets.rotaryPhone.answer);
    const setDialedNumber = useGameStore((s) => s.widgets.rotaryPhone.setDialedNumber);
    const { onDial } = props;
    const dial = useCallback(
        (digit: number) => {
            dialClick.play();
            const newDialed = `${useGameStore.getState().widgets.rotaryPhone.dialed}${digit.toString()}`;
            setDialedNumber(newDialed);
            onDial?.(useGameStore.getState().widgets.rotaryPhone.dialed);
        },
        [setDialedNumber, onDial]
    );

    if (props.scaleDown) {
        return <PhoneImage inert={props.blockInteraction} includeRotor={true} />;
    }

    return (
        <div className={styles.RotaryPhone}>
            <PhoneImage includeRotor={false} />
            {isPhoneRinging && <Control top={0} left={0} height={500} width={1200} onClick={answerPhone} />}
            <RotaryPhoneNumberPlate left={rotorLeft} top={rotorTop} size={rotorSize} />
            <RotaryPhoneRotor left={rotorLeft} top={rotorTop} size={rotorSize} onDialed={dial} />
            <FingerStop />
        </div>
    );
}

interface PhoneImageProps {
    inert?: boolean;
    includeRotor: boolean;
}

function PhoneImage(props: PhoneImageProps) {
    return (
        <div className={styles.RotaryPhoneFrame} inert={props.inert}>
            <img className={styles.RotaryPhoneImg} src={rotaryPhoneImgUrl} draggable={false} />
            {props.includeRotor && <img className={styles.RotaryPhoneRotor} src={rotorImgUrl} />}
        </div>
    );
}

interface RotaryPhoneNumberPlateProps {
    left: number;
    top: number;
    size: number;
}

function RotaryPhoneNumberPlate(props: RotaryPhoneNumberPlateProps) {
    const clipId = useId();

    const center = props.size / 2;
    const holeSize = rotorHoleSize(props.size);

    const clip = digits
        .map((digit) => {
            const offset = holeOffset(digit, props.size);
            return circlePath(center + offset.x, center + offset.y, holeSize / 2);
        })
        .join(" ");

    return (
        <svg
            style={{ position: "absolute", left: props.left, top: props.top, pointerEvents: "none" }}
            width={props.size}
            height={props.size}
            viewBox={`0 0 ${props.size} ${props.size}`}>
            <clipPath id={clipId}>
                <path d={clip} />
            </clipPath>
            <image href={rotorImgUrl} width={props.size} height={props.size} clipPath={`url(#${CSS.escape(clipId)})`} />
        </svg>
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
    const clipId = useId();

    const center = props.size / 2;
    const holeSize = rotorHoleSize(props.size);

    const holes = digits.map((digit) => {
        const offset = holeOffset(digit, props.size);
        return { digit, left: center + offset.x, top: center + offset.y };
    });

    // The art paints the holes in; cut them out so the number plate underneath shows through
    const clip = [
        `M 0 0 H ${props.size} V ${props.size} H 0 Z`,
        ...holes.map((hole) => circlePath(hole.left, hole.top, holeSize / 2)),
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
                <clipPath id={clipId}>
                    <path d={clip} clipRule="evenodd" />
                </clipPath>
                <image
                    href={rotorImgUrl}
                    width={props.size}
                    height={props.size}
                    clipPath={`url(#${CSS.escape(clipId)})`}
                />
            </svg>
            {holes.map((hole) => (
                <Control
                    key={hole.digit}
                    left={hole.left - holeSize / 2}
                    top={hole.top - holeSize / 2}
                    width={holeSize}
                    height={holeSize}
                    onPointerDown={(e) => grab(hole.digit, e)}
                    clipPath="circle(50% at 50% 50%)"
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
