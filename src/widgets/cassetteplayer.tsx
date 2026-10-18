import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import { use, useEffect, useRef } from "react";
import casetteAudioReversedUrl from "../assets/Kia of West Chester - Thats Crazy! reversed.mp3";
import casetteAudioUrl from "../assets/Kia of West Chester - Thats Crazy!.mp3";
import cassettePlayerImgUrl from "../assets/placeholder_cassette_player.png";
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
    const casetteAudioReversedElement = document.createElement("audio");
    casetteAudioReversedElement.src = casetteAudioReversedUrl;

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
    const insertTape = useGameStore((s) => s.widgets.cassette.insertTape);
    const eject = useGameStore((s) => s.widgets.cassette.eject);

    const audio = useCassetteAudioContext();
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const playbackPositionRef = useRef<number | null>(audio.forwardBuffer.duration - 10);
    const playbackStartTimeRef = useRef<number | null>(null);
    const rewindStartTimeRef = useRef<number | null>(null);

    function rewind() {
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

        const currentTime = playbackPositionRef.current ?? 0;
        const rewindOffset = audio.forwardBuffer.duration - currentTime;

        const now = audio.context.currentTime;
        source.playbackRate.setValueAtTime(1.0, now);
        source.playbackRate.linearRampToValueAtTime(rewindTopSpeed, now + rewindRampDuration);

        source.start(now, rewindOffset);

        currentSourceRef.current = source;
        rewindStartTimeRef.current = now;
    }
    function pause() {
        if (!currentSourceRef.current) return;

        const now = audio.context.currentTime;

        playbackPositionRef.current = (playbackPositionRef.current ?? 0) + (now - (playbackStartTimeRef.current ?? 0));
        currentSourceRef.current.stop();
        currentSourceRef.current = null;
    }
    function stopRewind() {
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

        const forwardsSource = audio.context.createBufferSource();
        forwardsSource.buffer = audio.forwardBuffer;
        forwardsSource.connect(audio.gain);

        const startOffset = playbackPositionRef.current ?? 0;
        forwardsSource.start(audio.context.currentTime, startOffset);

        currentSourceRef.current = forwardsSource;
        playbackStartTimeRef.current = audio.context.currentTime;
    }
    if (props.scaleDown) {
        return <img className={styles.ScaledDown} src={cassettePlayerImgUrl} />;
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
                <img src={cassettePlayerImgUrl} className={styles.CassettePlayerWidget} />
                {cassetteTapeInsidePlayer && (
                    <>
                        <Control width={50} height={50} top={830} left={980} onDown={rewind} onUp={stopRewind} />
                        <Control width={50} height={50} top={845} left={1040} onClick={pause} />
                        <Control
                            width={58}
                            height={50}
                            top={860}
                            left={1095}
                            onClick={() => {
                                pause();
                                eject();
                            }}
                        />
                        <Control width={60} height={50} top={880} left={1150} onClick={play} />
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
