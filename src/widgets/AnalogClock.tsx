import classNames from "classnames";
import { useCallback, useRef } from "react";
import clockFaceImgUrl from "../assets/analog_clock/clock_face.png";
import hourHandImgUrl from "../assets/analog_clock/hour_hand.png";
import minuteHandImgUrl from "../assets/analog_clock/minute_hand.png";
import { useGameStore } from "../state/store";
import analogClockStyles from "./AnalogClock.module.css";
import type { WidgetProps } from "./widget";

interface AnalogClockProps extends WidgetProps {}

function useRadianDrag(
    containerRef: React.RefObject<HTMLDivElement | null>,
    imgRef: React.RefObject<HTMLImageElement | null>,
    setDegrees: (degrees: number) => void
) {
    const onMouseMove = useCallback(
        (ev: MouseEvent) => {
            const container = containerRef.current;
            if (!container) return;

            if (imgRef.current) {
                imgRef.current.dataset.forcehover = "true";
            }

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
    const hourHandRef = useRef<HTMLImageElement>(null);
    const minuteHandRef = useRef<HTMLImageElement>(null);

    const { hourAngle, minuteAngle, setClockHandAngle } = useGameStore((s) => s.widgets.clock);

    const hourHandRadianDrag = useRadianDrag(
        containerRef,
        hourHandRef,
        useCallback((a) => setClockHandAngle("hour", a), [setClockHandAngle])
    );
    const minuteHandRadianDrag = useRadianDrag(
        containerRef,
        minuteHandRef,
        useCallback((a) => setClockHandAngle("minute", a), [setClockHandAngle])
    );

    const onHourHandClick = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.dataset.cursor = "point";
        }

        window.addEventListener("mousemove", hourHandRadianDrag);
        const onMouseUp = (e: MouseEvent) => {
            window.removeEventListener("mousemove", hourHandRadianDrag);
            window.removeEventListener("mouseup", onMouseUp);
            if (containerRef.current) {
                delete containerRef.current.dataset.cursor;
            }
            if (hourHandRef.current) {
                delete hourHandRef.current.dataset.forcehover;
            }
        };
        window.addEventListener("mouseup", onMouseUp);
    }, []);

    const onMinuteHandClick = useCallback(() => {
        if (containerRef.current) {
            containerRef.current.dataset.cursor = "point";
        }
        window.addEventListener("mousemove", minuteHandRadianDrag);
        const onMouseUp = (e: MouseEvent) => {
            window.removeEventListener("mousemove", minuteHandRadianDrag);
            window.removeEventListener("mouseup", onMouseUp);
            if (containerRef.current) {
                delete containerRef.current.dataset.cursor;
            }
            if (minuteHandRef.current) {
                delete minuteHandRef.current.dataset.forcehover;
            }
        };
        window.addEventListener("mouseup", onMouseUp);
    }, []);

    return (
        <div
            ref={containerRef}
            className={classNames(
                analogClockStyles.AnalogClockContainer,
                props.scaleDown && analogClockStyles.ScaledDown
            )}
            inert={props.blockInteraction}
            draggable={false}>
            <img className={analogClockStyles.ClockFace} src={clockFaceImgUrl} draggable={false} />
            <img
                ref={minuteHandRef}
                onMouseDown={onMinuteHandClick}
                className={analogClockStyles.MinuteHand}
                src={minuteHandImgUrl}
                style={{ transform: `rotate(${minuteAngle}deg)` }}
                draggable={false}
                data-cursor="point"
            />
            <img
                ref={hourHandRef}
                onMouseDown={onHourHandClick}
                className={analogClockStyles.HourHand}
                src={hourHandImgUrl}
                style={{ transform: `rotate(${hourAngle}deg)` }}
                draggable={false}
                data-cursor="point"
            />
        </div>
    );
}
