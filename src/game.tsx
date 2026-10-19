import { useEffect, useRef, useState } from "react";
import phoneCallAudioUrl from "./assets/audio/win phone call.mp3";
import bgImgUrlLeft from "./assets/left_window_furniture.png";
import bgImgUrl from "./assets/Placeholder BG Asset - Sketch 1.png";
import bgImgUrlTable from "./assets/table_layer.png";
import styles from "./game.module.css";
import { useGameStore } from "./state/store";
import { Subtitles } from "./subtitles";
import { AnalogClock } from "./widgets/AnalogClock";
import { CassettePlayer } from "./widgets/cassetteplayer";
import { LeftDrawer, RightDrawer } from "./widgets/drawers";
import { Hotspot } from "./widgets/Hotspot";
import { Morse } from "./widgets/morse";
import { MorseReference } from "./widgets/morseReference";
import { RotaryPhone } from "./widgets/RotaryPhone";
import { SwitchBoard } from "./widgets/SwitchBoard";
import { TV } from "./widgets/tv";
import type { WidgetProps } from "./widgets/widget";

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

function LoggingRotaryPhone(props: WidgetProps) {
    return <RotaryPhone {...props} onDial={(dialed) => console.log(`dialed ${dialed}`)} />;
}

function Overview() {
    return (
        <>
            <Hotspot left={630} top={330} width={400} height={600} widget={MorseReference} />
            <Hotspot left={1120} top={600} width={1490 / 4} height={1064 / 4} widget={TV} />
            <Hotspot left={1505} top={300} width={235} height={235} widget={AnalogClock} />
            <Hotspot left={895} top={750} width={190} height={150} widget={LoggingRotaryPhone} />
            <Hotspot left={520} top={780} width={190} height={150} widget={Morse} />
            <Hotspot left={1925} top={246} width={400} height={400} widget={SwitchBoard} />
            <Hotspot left={1525} top={830} width={150} height={150} widget={CassettePlayer} />
            <LeftDrawer />
            <RightDrawer />
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

function YouWinScreen() {
    const hasWon = useGameStore((s) => s.hasWon);
    const phoneCallAudioRef = useRef<HTMLAudioElement>(null);
    useEffect(() => {
        if (hasWon) {
            phoneCallAudioRef.current?.play();
        } else {
            return;
        }

        const updatePhonecallCurrentTime = () => {
            playbackTrackingAnimationFrame = requestAnimationFrame(updatePhonecallCurrentTime);
            useGameStore.setState({ phoneCallCurrentTime: phoneCallAudioRef.current?.currentTime ?? undefined });
        };
        let playbackTrackingAnimationFrame = requestAnimationFrame(updatePhonecallCurrentTime);
        return () => {
            cancelAnimationFrame(playbackTrackingAnimationFrame);
        };
    }, [hasWon]);

    if (!hasWon) {
        return null;
    }
    return (
        <div className={styles.YouWinScreen}>
            <section>
                <audio src={phoneCallAudioUrl} ref={phoneCallAudioRef} />
                <h2>Thanks for playing!</h2>
                <p>Featuring the work of:</p>
                <ul>
                    <li>
                        <a href="https://bsky.app/profile/thristhart.bsky.social">thristhart</a>
                    </li>
                    <li>other people's credits as they prefer</li>
                </ul>
            </section>
        </div>
    );
}

export default function Game() {
    const scale = useFitToScreen();

    return (
        <>
            <div className={styles.playArea} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
                <img className={styles.bgImg} src={bgImgUrl} />
                <img className={styles.bgImg} src={bgImgUrlLeft} />
                <img className={styles.bgImg} src={bgImgUrlTable} />
                <Overview />
                <WidgetView />
                <YouWinScreen />
                <Subtitles />
            </div>
        </>
    );
}
