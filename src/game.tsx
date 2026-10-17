import { useEffect, useRef, useState } from "react";
import bgImgUrl from "./assets/Placeholder BG Asset - Sketch 1.png";
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
}
function WidgetClickArea(props: WidgetClickAreaProps) {
    const store = useGameStore();
    return (
        <button
            className={styles.widgetClickArea}
            style={{
                left: props.left,
                top: props.top,
                width: props.width,
                height: props.height,
            }}
            onClick={() => store.setOpenWidget(props.widget)}
        />
    );
}

function Overview() {
    return (
        <>
            <WidgetClickArea left={1120} top={600} width={360} height={250} widget={TV} />
            <WidgetClickArea left={1500} top={300} width={250} height={250} widget={AnalogClock} />
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

export default function Game() {
    const containerRef = useRef<HTMLImageElement>(null);
    const scale = useFitToScreen();
    return (
        <div className={styles.playArea} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
            <img className={styles.bgImg} src={bgImgUrl} ref={containerRef} />
            <Overview />
            <WidgetView />
        </div>
    );
}
