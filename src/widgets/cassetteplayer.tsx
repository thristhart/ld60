import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import { use, useEffect, useRef } from "react";
import casetteAudioUrl from "../assets/audio/cassette_ad.mp3";
import casetteAudioReversedUrl from "../assets/audio/cassette_ad_reversed.mp3";
import cassettePlayerButtonsImgUrl from "../assets/cassette_player_buttons.png";
import cassettePlayerClosedImgUrl from "../assets/cassette_player_closed.png";
import cassettePlayerOpenImgUrl from "../assets/cassette_player_open.png";
import pauseButtonImgUrl from "../assets/cassette_player_pause.png";
import playButtonImgUrl from "../assets/cassette_player_play.png";
import rewindButtonImgUrl from "../assets/cassette_player_rewind.png";
import stopButtonImgUrl from "../assets/cassette_player_stop.png";
import cassetteTapeImgUrl from "../assets/placeholder_cassette_tape.png";
import { useGameStore } from "../state/store";
import styles from "./cassetteplayer.module.css";
import { Control } from "./Control";
import type { WidgetProps } from "./widget";

async function getAudioBuffer(audioContext: AudioContext, audioUrl: string) {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();

    return audioContext.decodeAudioData(arrayBuffer);
}

let contextPromise: ReturnType<typeof createCasetteAudioContext> | undefined = undefined;

async function createCasetteAudioContext() {
    const context = new AudioContext();

    const [forwardBuffer, reversedBuffer] = await Promise.all([
        getAudioBuffer(context, casetteAudioUrl),
        getAudioBuffer(context, casetteAudioReversedUrl),
    ]);

    const gain = context.createGain();
    gain.gain.value = 0.2;
    gain.connect(context.destination);

    return { context, gain, forwardBuffer, reversedBuffer };
}

function getCasetteAudioContext() {
    if (contextPromise) {
        return contextPromise;
    }
    contextPromise = createCasetteAudioContext();
    return contextPromise;
}

function useCassetteAudioContext() {
    return use(getCasetteAudioContext());
}

const rewindTopSpeed = 3.5;
const rewindRampDuration = 0.8;

interface CassetteProps extends WidgetProps {}
export function CassettePlayer(props: CassetteProps) {
    const cassetteTapeInsidePlayer = useGameStore((s) => s.widgets.cassette.tapeInside);
    const playerHasCassette = useGameStore((s) => s.hasCasetteTape);
    const setCurrentTime = useGameStore((s) => s.widgets.cassette.setCurrentTime);
    const insertTape = useGameStore((s) => s.widgets.cassette.insertTape);
    const eject = useGameStore((s) => s.widgets.cassette.eject);

    const audio = useCassetteAudioContext();
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const playbackPositionRef = useRef<number | null>(31.4);
    const playbackStartTimeRef = useRef<number | null>(null);
    const rewindStartTimeRef = useRef<number | null>(null);
    const isRewindingRef = useRef<boolean>(false);

    function rewind() {
        isRewindingRef.current = true;
        if (currentSourceRef.current) {
            currentSourceRef.current.stop();
        }

        const source = audio.context.createBufferSource();
        source.buffer = audio.reversedBuffer;
        source.connect(audio.gain);

        // playing
        if (currentSourceRef.current) {
            pause();
        }
        useGameStore.setState((s) => ({
            widgets: { ...s.widgets, cassette: { ...s.widgets.cassette, isRewinding: true } },
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
            widgets: { ...s.widgets, cassette: { ...s.widgets.cassette, isPlaying: false, isRewinding: false } },
        }));
        if (!currentSourceRef.current) return;

        const now = audio.context.currentTime;

        playbackPositionRef.current = (playbackPositionRef.current ?? 0) + (now - (playbackStartTimeRef.current ?? 0));
        currentSourceRef.current.stop();
        currentSourceRef.current = null;
    }
    function stopRewind() {
        useGameStore.setState((s) => ({
            widgets: { ...s.widgets, cassette: { ...s.widgets.cassette, isPlaying: false, isRewinding: false } },
        }));
        isRewindingRef.current = false;
        if (!currentSourceRef.current) return;

        const now = audio.context.currentTime;

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
            widgets: { ...s.widgets, cassette: { ...s.widgets.cassette, isPlaying: true, isRewinding: false } },
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
            if (!cassetteTapeInsidePlayer) {
                return;
            }
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
    if (props.scaleDown) {
        return (
            <div className={styles.ScaledDown}>
                <img
                    className={styles.CassetteImage}
                    src={cassetteTapeInsidePlayer ? cassettePlayerClosedImgUrl : cassettePlayerOpenImgUrl}
                />
                <img className={styles.CassetteButtons} src={cassettePlayerButtonsImgUrl} />
            </div>
        );
    }
    return (
        <div>
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id === "cassetteDrop") {
                        insertTape();
                    }
                }}>
                <CassettePlayerDropTarget />
                <img
                    src={cassetteTapeInsidePlayer ? cassettePlayerClosedImgUrl : cassettePlayerOpenImgUrl}
                    className={styles.CassettePlayerWidget}
                />
                {!cassetteTapeInsidePlayer && (
                    <img src={cassettePlayerButtonsImgUrl} className={styles.CassetteButtons} />
                )}
                {cassetteTapeInsidePlayer && (
                    <>
                        <Control width={130} height={130} top={835} left={905} onDown={rewind} onUp={stopRewind}>
                            <img src={rewindButtonImgUrl} />
                        </Control>
                        <Control width={100} height={130} top={855} left={1025} onClick={pause}>
                            <img src={pauseButtonImgUrl} />
                        </Control>
                        <Control
                            width={110}
                            height={130}
                            top={875}
                            left={1140}
                            onClick={() => {
                                pause();
                                eject();
                            }}>
                            <img src={stopButtonImgUrl} />
                        </Control>
                        <Control width={130} height={130} top={898} left={1260} onClick={play}>
                            <img src={playButtonImgUrl} />
                        </Control>
                    </>
                )}
                {playerHasCassette && <DraggableCassetteTape />}
            </DragDropProvider>
        </div>
    );
}

function CassettePlayerDropTarget() {
    const droppable = useDroppable({
        id: "cassetteDrop",
    });
    return <div className={styles.DropTarget} ref={droppable.ref}></div>;
}
function DraggableCassetteTape() {
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
    return <img className={styles.DraggableTape} src={cassetteTapeImgUrl} ref={draggable.ref} />;
}

export function CassetteTape() {
    return <img src={cassetteTapeImgUrl} />;
}
