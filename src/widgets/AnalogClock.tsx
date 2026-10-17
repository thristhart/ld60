import { useCallback, useRef, useState } from "react";
import clockFaceImgUrl from "../assets/analog_clock/clock_face.png";
import hourHandImgUrl from "../assets/analog_clock/hour_hand.png";
import minuteHandImgUrl from "../assets/analog_clock/minute_hand.png";
import secondHandImgUrl from "../assets/analog_clock/second_hand.png";
import analogClockStyles from "./AnalogClock.module.css";

interface AnalogClockProps {}

function useRadianDrag(containerRef: React.RefObject<HTMLDivElement | null>, setDegrees: (degrees: number) => void) {
    const onMouseMove = useCallback(
        (ev: MouseEvent) => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const centerX = rect.x + rect.width / 2;
            const centerY = rect.y + rect.height / 2;
            const deltaX = ev.clientX - centerX;
            const deltaY = ev.clientY - centerY;

            // 2. Get the angle in radians (ranges from -π to π)
            const radians = Math.atan2(deltaY, deltaX);

            // 3. Convert radians to degrees (0 to 360)
            let degrees = radians * (180 / Math.PI);
            if (degrees < 0) {
                degrees += 360;
            }
            setDegrees(degrees);
        },
        [setDegrees]
    );

    return onMouseMove;
}

export function AnalogClock(props: AnalogClockProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const [hourAngle, setHourAngle] = useState(270);
    const [minuteAngle, setMinuteAngle] = useState(315);
    const [secondAngle, setSecondAngle] = useState(0);

    const hourHandRadianDrag = useRadianDrag(containerRef, setHourAngle);
    const minuteHandRadianDrag = useRadianDrag(containerRef, setMinuteAngle);
    const secondHandRadianDrag = useRadianDrag(containerRef, setSecondAngle);

    const onHourHandClick = useCallback(() => {
        window.addEventListener("mousemove", hourHandRadianDrag);
        const onMouseUp = () => {
            window.removeEventListener("mousemove", hourHandRadianDrag);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mouseup", onMouseUp);
    }, []);

    const onMinuteHandClick = useCallback(() => {
        window.addEventListener("mousemove", minuteHandRadianDrag);
        const onMouseUp = () => {
            window.removeEventListener("mousemove", minuteHandRadianDrag);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mouseup", onMouseUp);
    }, []);

    const onSecondHandClick = useCallback(() => {
        window.addEventListener("mousemove", secondHandRadianDrag);
        const onMouseUp = () => {
            window.removeEventListener("mousemove", secondHandRadianDrag);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mouseup", onMouseUp);
    }, []);

    return (
        <div ref={containerRef} className={analogClockStyles.AnalogClockContainer}>
            <img className={analogClockStyles.ClockFace} src={clockFaceImgUrl} draggable={false} />
            <img
                onMouseDown={onSecondHandClick}
                className={analogClockStyles.SecondHand}
                src={secondHandImgUrl}
                style={{ transform: `rotate(${secondAngle}deg)` }}
                draggable={false}
            />
            <img
                onMouseDown={onMinuteHandClick}
                className={analogClockStyles.MinuteHand}
                src={minuteHandImgUrl}
                style={{ transform: `rotate(${minuteAngle}deg)` }}
                draggable={false}
            />
            <img
                onMouseDown={onHourHandClick}
                className={analogClockStyles.HourHand}
                src={hourHandImgUrl}
                style={{ transform: `rotate(${hourAngle}deg)` }}
                draggable={false}
            />
        </div>
    );
}
