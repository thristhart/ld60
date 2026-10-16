import { useEffect, useState } from "react";
import bgImgUrl from "./assets/PLACEHOLDER_BACKGROUND.png";
import styles from "./game.module.css";

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

export default function Game() {
    const displaySize = useDisplaySize();
    console.log(displaySize);
    return (
        <>
            <img className={styles.bgImg} src={bgImgUrl} />
        </>
    );
}
