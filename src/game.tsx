import { useEffect, useRef, useState, type RefObject } from "react";
import bgImgUrl from "./assets/PLACEHOLDER_BACKGROUND.png";
import styles from "./game.module.css";

// Area on the background image that we must ensure is always visible
const safeZoneLeft = 180;
const safeZoneRight = 700;
const safeZoneTop = 600;
const safeZoneBottom = 1200;

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

export default function Game() {
    const containerRef = useRef<HTMLImageElement>(null);
    const scale = useFitToScreen();
    return (
        <>
            <img
                className={styles.bgImg}
                src={bgImgUrl}
                ref={containerRef}
                style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
            />
        </>
    );
}
