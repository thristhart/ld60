import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { dialedDigit, maxRotation } from "./rotaryPhoneUtils";

const dialTolerance = Math.PI / 36;
const reverseLockAngle = Math.PI / 60;
const returnSpeed = (2 * Math.PI) / 1500;

export function useRotorDial(onDialed: (digit: number) => void) {
    const rotorRef = useRef<HTMLDivElement>(null);
    const [angle, setAngle] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [returnMs, setReturnMs] = useState(0);
    const stopDragRef = useRef<() => void>(undefined);

    const onDialedRef = useRef(onDialed);
    useEffect(() => {
        onDialedRef.current = onDialed;
    });

    useEffect(() => () => stopDragRef.current?.(), []);

    const grab = useCallback(
        (digit: number, e: PointerEvent) => {
            // The rotor can't be grabbed until it's back home
            if (!rotorRef.current || dragging || returnMs > 0) {
                return;
            }
            e.preventDefault();

            const rect = rotorRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const pointerAngle = (x: number, y: number) => Math.atan2(y - cy, x - cx);

            const max = maxRotation(digit);
            let lastAngle = pointerAngle(e.clientX, e.clientY);
            let rotation = 0;
            let peak = 0;
            let returning = false;

            const onMove = (ev: globalThis.PointerEvent) => {
                const current = pointerAngle(ev.clientX, ev.clientY);
                let delta = current - lastAngle;
                // atan2 jumps between π and -π; unwrap so long dials stay continuous
                if (delta > Math.PI) {
                    delta -= 2 * Math.PI;
                } else if (delta < -Math.PI) {
                    delta += 2 * Math.PI;
                }
                lastAngle = current;
                if (returning) {
                    rotation += Math.min(delta, 0);
                } else {
                    rotation = Math.min(rotation + delta, max);
                    peak = Math.max(peak, rotation);
                    returning = rotation < peak - reverseLockAngle;
                }
                if (returning && rotation <= 0) {
                    onUp();
                    return;
                }
                setAngle(Math.max(rotation, 0));
            };

            const onUp = () => {
                stopDrag();
                const dialed = dialedDigit(peak, dialTolerance);
                if (dialed !== undefined) {
                    onDialedRef.current(dialed);
                }
                if (rotation > 0) {
                    setReturnMs(rotation / returnSpeed);
                }
                setAngle(0);
            };

            const stopDrag = () => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                window.removeEventListener("pointercancel", onUp);
                stopDragRef.current = undefined;
                setDragging(false);
            };

            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
            window.addEventListener("pointercancel", onUp);
            stopDragRef.current = stopDrag;
            setDragging(true);
        },
        [dragging, returnMs]
    );

    const onReturned = useCallback(() => setReturnMs(0), []);

    return { rotorRef, angle, returnMs, grab, onReturned };
}
