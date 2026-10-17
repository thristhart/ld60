import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import bgImgUrlLeft from "./assets/left_window_furniture.png";
import bgImgUrl from "./assets/Placeholder BG Asset - Sketch 1.png";
import grabClosedHandImgUrl from "./assets/placeholder_hand_grabbing_closed.png";
import grabOpenHandImgUrl from "./assets/placeholder_hand_grabbing_open.png";
import pointHandImgUrl from "./assets/placeholder_hand_pointing.png";
import bgImgUrlTable from "./assets/table_layer.png";
import styles from "./game.module.css";
import { useGameStore } from "./state/store";
import { AnalogClock } from "./widgets/AnalogClock";
import { TV } from "./widgets/tv";
import type { Widget } from "./widgets/widget";

// Area on the background image that we must ensure is always visible
const safeZoneLeft = 240;
const safeZoneRight = 2386;
const safeZoneTop = 240;
const safeZoneBottom = 1240;

const safeZoneDimensions = { width: safeZoneRight - safeZoneLeft, height: safeZoneBottom - safeZoneTop };

function useDisplaySize() {
    const [dimensions, setDimensions] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

    useEffect(() => {
        const onResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return dimensions;
}

function useFitToScreen() {
    const displaySize = useDisplaySize();
    if (displaySize.width > safeZoneDimensions.width && displaySize.height > safeZoneDimensions.height) {
        return 1;
    }
    const widthScale = displaySize.width / safeZoneDimensions.width;
    const heightScale = displaySize.height / safeZoneDimensions.height;

    return Math.min(widthScale, heightScale);
}

interface WidgetClickAreaProps {
    left: number;
    top: number;
    width: number;
    height: number;
    widget: Widget;
    clipPath?: CSSProperties["clipPath"];
    debug?: boolean;
}
function WidgetClickArea(props: WidgetClickAreaProps) {
    const store = useGameStore();
    return (
        <button
            inert={!!store.openWidget}
            data-cursor="point"
            className={styles.widgetClickArea}
            style={{
                left: props.left,
                top: props.top,
                width: props.width,
                height: props.height,
                backgroundColor: props.debug ? "rgba(255, 0, 0, .5)" : "transparent",
                clipPath: props.clipPath ?? "none",
            }}
            onClick={() => store.setOpenWidget(props.widget)}>
            <props.widget scaleDown blockInteraction></props.widget>
        </button>
    );
}

function Overview() {
    return (
        <>
            <WidgetClickArea left={1120} top={600} width={360} height={250} widget={TV} />
            <WidgetClickArea left={1505} top={300} width={235} height={235} widget={AnalogClock} />
        </>
    );
}

function WidgetView() {
    const store = useGameStore();
    useEffect(() => {
        if (!store.openWidget) {
            return () => {};
        }
        const keyup = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                store.setOpenWidget(undefined);
            }
        };
        window.addEventListener("keyup", keyup);
        return () => window.removeEventListener("keyup", keyup);
    });
    if (!store.openWidget) {
        return null;
    }

    return (
        <div className={styles.widgetView}>
            <store.openWidget />
            <span className={styles.widgetViewInstructions}>hit ESC to close</span>
        </div>
    );
}

function getCursorImageForType(cursorType: string | undefined) {
    if (cursorType === "point") {
        return pointHandImgUrl;
    }
    if (cursorType === "grab_open") {
        return grabOpenHandImgUrl;
    }
    if (cursorType === "grab_closed") {
        return grabClosedHandImgUrl;
    }

    return "";
}

function useCustomCursor(pointerImgRef: RefObject<HTMLImageElement | null>, scale: number) {
    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;

            const hoverTargets = document.elementsFromPoint(x, y);
            let cursorType = undefined;
            for (const target of hoverTargets) {
                if ("dataset" in target) {
                    let targetCursor = (target as HTMLElement).dataset.cursor;
                    if (targetCursor) {
                        cursorType = targetCursor;
                        break;
                    }
                }
            }
            if (pointerImgRef.current) {
                // hacks to make sure it's always on top
                pointerImgRef.current?.hidePopover();
                pointerImgRef.current?.showPopover();

                const newImg = getCursorImageForType(cursorType);
                pointerImgRef.current.src = newImg;
                pointerImgRef.current.style.transform = `translate3d(calc(${x}px), ${y}px, 0) scale(${scale})`;
            }
        };
        window.addEventListener("mousemove", mouseMove);
        return () => window.removeEventListener("mousemove", mouseMove);
    });
}

export default function Game() {
    const customPointerRef = useRef<HTMLImageElement>(null);

    const scale = useFitToScreen();
    useCustomCursor(customPointerRef, scale);

    return (
        <>
            <div className={styles.playArea} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
                <img className={styles.bgImg} src={bgImgUrl} />
                <img className={styles.bgImg} src={bgImgUrlLeft} />
                <img className={styles.bgImg} src={bgImgUrlTable} />
                <Overview />
                <WidgetView />
            </div>
            <img className={styles.customPointer} ref={customPointerRef} popover="manual" />
        </>
    );
}
