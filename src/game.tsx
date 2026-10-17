import { useEffect, useRef, useState } from "react";
import bgImgUrl from "./assets/Placeholder BG Asset - Sketch 1.png";
import styles from "./game.module.css";
import { TV } from "./widgets/tv";

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

export default function Game() {
    const containerRef = useRef<HTMLImageElement>(null);
    const scale = useFitToScreen();
    return (
        <div className={styles.playArea} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
            <img className={styles.bgImg} src={bgImgUrl} ref={containerRef} />
            <TV left={100} top={100} />
        </div>
    );
}
