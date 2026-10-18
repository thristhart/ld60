import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import classNames from "classnames";
import { use, useEffect } from "react";
import vhsAudioUrl from "../assets/audio/vhs_intro_raw.mp3";
import vhsReversedAudioUrl from "../assets/audio/vhs_intro_raw_reversed.mp3";
import tvOverviewImgUrl from "../assets/placeholder_tv_overview.png";
import vhsPortraitImgUrl from "../assets/placeholder_vhs_portrait.png";
import tvImgUrl from "../assets/TV_placeholder.png";
import vhsImgUrl from "../assets/vhs.png";
import { useGameStore } from "../state/store";
import styles from "./tv.module.css";
import type { WidgetProps } from "./widget";

function VHSDropTarget() {
    const droppable = useDroppable({
        id: "vhsDrop",
    });
    return <div className={styles.VHSDropTarget} ref={droppable.ref}></div>;
}

function VHS() {
    const draggable = useDraggable({
        id: "vhs",
    });
    const manager = useDragDropManager();
    manager?.registry.plugins.get(Scroller)?.disable();
    if (draggable.isDragging) {
        document.documentElement.dataset.cursor = "grab_closed";
    } else {
        delete document.documentElement.dataset.cursor;
    }
    useEffect(() => {
        return () => {
            delete document.documentElement.dataset.cursor;
        };
    }, []);
    return (
        <img
            className={styles.VHS}
            src={vhsImgUrl}
            ref={draggable.ref}
            data-cursor={draggable.isDragging ? "grab_closed" : "grab_open"}
        />
    );
}

async function getAudioBuffer(audioContext: AudioContext, audioUrl: string) {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();

    return audioContext.decodeAudioData(arrayBuffer);
}

let contextPromise: ReturnType<typeof createVHSAudioContext> | undefined = undefined;

async function createVHSAudioContext() {
    const context = new AudioContext();

    const [forwardBuffer, reversedBuffer] = await Promise.all([
        getAudioBuffer(context, vhsAudioUrl),
        getAudioBuffer(context, vhsReversedAudioUrl),
    ]);

    const gain = context.createGain();
    gain.gain.value = 0.2;
    gain.connect(context.destination);

    return { context, gain, forwardBuffer, reversedBuffer };
}

function getVHSAudioContext() {
    if (contextPromise) {
        return contextPromise;
    }
    contextPromise = createVHSAudioContext();
    return contextPromise;
}

function useVHSAudioContext() {
    return use(getVHSAudioContext());
}

interface TVProps extends WidgetProps {}
export function TV(props: TVProps) {
    const currentTime = useGameStore((s) => s.widgets.tv.currentTime);
    const setCurrentTime = useGameStore((s) => s.widgets.tv.setCurrentTime);
    const hasTape = useGameStore((s) => s.widgets.tv.hasTape);
    const setHasTape = useGameStore((s) => s.widgets.tv.setHasTape);

    const isTVFocused = useGameStore((s) => s.openWidget === TV);

    useEffect(() => {
        const updateVideoCurrentTime = () => {
            playbackTrackingAnimationFrame = requestAnimationFrame(updateVideoCurrentTime);
        };
        let playbackTrackingAnimationFrame = requestAnimationFrame(updateVideoCurrentTime);
        return () => {
            cancelAnimationFrame(playbackTrackingAnimationFrame);
        };
    }, [setCurrentTime]);

    return (
        <div className={classNames(styles.TV, props.scaleDown && styles.ScaledDown)} inert={props.blockInteraction}>
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id === "vhsDrop") {
                        setHasTape(true);
                        // TODO: start playing audio
                    }
                }}>
                <VHSDropTarget />
                <img className={styles.TVVideo} src={vhsPortraitImgUrl} />
                <img className={styles.TVimg} src={props.scaleDown ? tvOverviewImgUrl : tvImgUrl} />
                {!props.scaleDown && <button className={styles.TVPlay}>▶️</button>}
                {!props.scaleDown && <button className={styles.TVRewind}>⏪</button>}
                {!props.scaleDown && !hasTape && <VHS />}
            </DragDropProvider>
        </div>
    );
}
