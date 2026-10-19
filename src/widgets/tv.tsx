import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import classNames from "classnames";
import { use, useEffect, useRef } from "react";
import vhsAudioUrl from "../assets/audio/vhs_intro.mp3";
import vhsReversedAudioUrl from "../assets/audio/vhs_intro_reversed.mp3";
import tvOverviewImgUrl from "../assets/placeholder_tv_overview.png";
import vhsPortraitImgUrl from "../assets/placeholder_vhs_portrait.png";
import tvImgUrl from "../assets/TV_placeholder.png";
import vhsImgUrl from "../assets/vhs.png";
import { useGameStore } from "../state/store";
import { Control } from "./Control";
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

const rewindTopSpeed = 3.5;
const rewindRampDuration = 0.8;

interface TVProps extends WidgetProps {}
export function TV(props: TVProps) {
    const setCurrentTime = useGameStore((s) => s.widgets.tv.setCurrentTime);
    const hasTape = useGameStore((s) => s.widgets.tv.hasTape);
    const setHasTape = useGameStore((s) => s.widgets.tv.setHasTape);

    const audio = useVHSAudioContext();
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const playbackPositionRef = useRef<number | null>(null);
    const playbackStartTimeRef = useRef<number | null>(null);
    const rewindStartTimeRef = useRef<number | null>(null);
    const isRewindingRef = useRef<boolean>(false);

    function rewind() {
        if (currentSourceRef.current) {
            currentSourceRef.current.stop();
        }
        isRewindingRef.current = true;

        const source = audio.context.createBufferSource();
        source.buffer = audio.reversedBuffer;
        source.connect(audio.gain);

        // playing
        if (currentSourceRef.current) {
            pause();
        }
        useGameStore.setState((s) => ({
            widgets: { ...s.widgets, tv: { ...s.widgets.tv, isPlaying: true, isRewinding: true } },
        }));

        const currentTime = playbackPositionRef.current ?? 0;
        const rewindOffset = Math.max(audio.forwardBuffer.duration - currentTime, 0);

        const now = audio.context.currentTime;
        source.playbackRate.setValueAtTime(1.0, now);
        source.playbackRate.linearRampToValueAtTime(rewindTopSpeed, now + rewindRampDuration);

        source.start(now, rewindOffset);

        currentSourceRef.current = source;
        rewindStartTimeRef.current = now;
    }
    function pause() {
        useGameStore.setState((s) => ({
            widgets: { ...s.widgets, tv: { ...s.widgets.tv, isPlaying: false, isRewinding: false } },
        }));
        if (!currentSourceRef.current) return;

        const now = audio.context.currentTime;

        playbackPositionRef.current = (playbackPositionRef.current ?? 0) + (now - (playbackStartTimeRef.current ?? 0));
        currentSourceRef.current.stop();
        currentSourceRef.current = null;
    }
    function stopRewind() {
        useGameStore.setState((s) => ({
            widgets: { ...s.widgets, tv: { ...s.widgets.tv, isPlaying: false, isRewinding: false } },
        }));
        if (!currentSourceRef.current) return;

        const now = audio.context.currentTime;

        isRewindingRef.current = false;

        // not rewinding, so just pause
        if (!rewindStartTimeRef.current) {
            playbackPositionRef.current = now - (playbackStartTimeRef.current ?? 0);
            currentSourceRef.current.stop();
            currentSourceRef.current = null;
            return;
        }

        const timeSpentRewinding = now - rewindStartTimeRef.current;
        let forwardTimeLost = 0;

        if (timeSpentRewinding <= 0.8) {
            // stopped rewinding while doing linearRampToValueAtTime
            const endingRateAtStop = 1.0 + (rewindTopSpeed - 1.0) * (timeSpentRewinding / rewindRampDuration);
            const averageRate = (1.0 + endingRateAtStop) / 2;
            forwardTimeLost = timeSpentRewinding * averageRate;
        } else {
            // stopped after ramping
            const rampTimeLost = rewindRampDuration * ((1.0 + rewindTopSpeed) / 2);
            const constantTimeLost = (timeSpentRewinding - rewindRampDuration) * rewindTopSpeed;
            forwardTimeLost = rampTimeLost + constantTimeLost;
        }
        playbackPositionRef.current = Math.max(0, (playbackPositionRef.current ?? 0) - forwardTimeLost);
        rewindStartTimeRef.current = null;
        currentSourceRef.current.stop();
        currentSourceRef.current = null;
    }
    function play() {
        if (currentSourceRef.current) {
            currentSourceRef.current.stop();
        }
        pause();
        useGameStore.setState((s) => ({
            widgets: { ...s.widgets, tv: { ...s.widgets.tv, isPlaying: true, isRewinding: false } },
        }));

        const forwardsSource = audio.context.createBufferSource();
        forwardsSource.buffer = audio.forwardBuffer;
        forwardsSource.connect(audio.gain);

        const startOffset = playbackPositionRef.current ?? 0;
        forwardsSource.start(audio.context.currentTime, startOffset);

        currentSourceRef.current = forwardsSource;
        playbackStartTimeRef.current = audio.context.currentTime;
    }

    useEffect(() => {
        if (props.scaleDown) {
            return;
        }

        const updateVideoCurrentTime = () => {
            playbackTrackingAnimationFrame = requestAnimationFrame(updateVideoCurrentTime);
            if (isRewindingRef.current) {
                if (rewindStartTimeRef.current) {
                    const now = audio.context.currentTime;
                    const timeSpentRewinding = now - rewindStartTimeRef.current;
                    let forwardTimeLost = 0;

                    if (timeSpentRewinding <= 0.8) {
                        // stopped rewinding while doing linearRampToValueAtTime
                        const endingRateAtStop =
                            1.0 + (rewindTopSpeed - 1.0) * (timeSpentRewinding / rewindRampDuration);
                        const averageRate = (1.0 + endingRateAtStop) / 2;
                        forwardTimeLost = timeSpentRewinding * averageRate;
                    } else {
                        // stopped after ramping
                        const rampTimeLost = rewindRampDuration * ((1.0 + rewindTopSpeed) / 2);
                        const constantTimeLost = (timeSpentRewinding - rewindRampDuration) * rewindTopSpeed;
                        forwardTimeLost = rampTimeLost + constantTimeLost;
                    }
                    setCurrentTime(Math.max(0, playbackPositionRef.current! - forwardTimeLost));
                }
                return;
            }
            setCurrentTime(
                (playbackPositionRef.current ?? 0) +
                    (currentSourceRef.current ? audio.context.currentTime - (playbackStartTimeRef.current ?? 0) : 0)
            );
        };
        let playbackTrackingAnimationFrame = requestAnimationFrame(updateVideoCurrentTime);
        return () => {
            cancelAnimationFrame(playbackTrackingAnimationFrame);
        };
    }, [props.scaleDown, setCurrentTime]);

    return (
        <div className={classNames(styles.TV, props.scaleDown && styles.ScaledDown)} inert={props.blockInteraction}>
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id === "vhsDrop") {
                        setHasTape(true);
                        play();
                    }
                }}>
                <VHSDropTarget />
                <div className={styles.TVVideo}></div>
                {hasTape && <img className={styles.TVVideo} src={vhsPortraitImgUrl} />}
                <img className={styles.TVimg} src={props.scaleDown ? tvOverviewImgUrl : tvImgUrl} />
                {!props.scaleDown && hasTape && (
                    <Control
                        debug
                        className={styles.TVPlay}
                        onClick={() => (currentSourceRef.current ? pause() : play())}
                        left={1800}
                        top={755}
                        width={100}
                        height={100}>
                        ▶️
                    </Control>
                )}
                {!props.scaleDown && hasTape && (
                    <Control
                        debug
                        className={styles.TVRewind}
                        left={1800}
                        top={860}
                        width={100}
                        height={100}
                        onDown={rewind}
                        onUp={stopRewind}>
                        ⏪
                    </Control>
                )}
                {!props.scaleDown && !hasTape && <VHS />}
            </DragDropProvider>
        </div>
    );
}
