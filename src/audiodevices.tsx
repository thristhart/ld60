// raised out of the widgets so that this can persist seamlessly in the overview
import { createContext, use, useEffect, useMemo, useRef } from "react";
import casetteAudioUrl from "./assets/audio/cassette_ad.mp3";
import casetteAudioReversedUrl from "./assets/audio/cassette_ad_reversed.mp3";
import vhsAudioUrl from "./assets/audio/vhs_intro.mp3";
import vhsReversedAudioUrl from "./assets/audio/vhs_intro_reversed.mp3";
import { useGameStore } from "./state/store";

const rewindTopSpeed = 3.5;
const rewindRampDuration = 0.8;

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

interface VHSAudioContext_t {
    rewind: () => void;
    stopRewind: () => void;
    togglePlay: () => void;
    play: () => void;
}
export const VHSAudioContext = createContext(undefined! as VHSAudioContext_t);

export function VHSAudioProvider(props: { children: React.ReactNode }) {
    const setCurrentTime = useGameStore((s) => s.widgets.tv.setCurrentTime);
    const audio = useVHSAudioContext();
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const playbackPositionRef = useRef<number | null>(null);
    const playbackStartTimeRef = useRef<number | null>(null);
    const rewindStartTimeRef = useRef<number | null>(null);
    const isRewindingRef = useRef<boolean>(false);
    const volume = useGameStore((s) => (s.muted ? 0 : s.volume * baseVolume));
    audio.gain.gain.value = volume;

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
        play();
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
    }, [setCurrentTime]);

    const value = useMemo(
        () => ({ togglePlay: () => (currentSourceRef.current ? pause() : play()), play, rewind, stopRewind }),
        []
    );

    return <VHSAudioContext.Provider value={value} children={props.children} />;
}

const baseVolume = 0.2;

let cassetteContextPromise: ReturnType<typeof createCasetteAudioContext> | undefined = undefined;

async function createCasetteAudioContext() {
    const context = new AudioContext();

    const [forwardBuffer, reversedBuffer] = await Promise.all([
        getAudioBuffer(context, casetteAudioUrl),
        getAudioBuffer(context, casetteAudioReversedUrl),
    ]);

    const gain = context.createGain();
    gain.gain.value = baseVolume;
    gain.connect(context.destination);

    return { context, gain, forwardBuffer, reversedBuffer };
}

function getCasetteAudioContext() {
    if (cassetteContextPromise) {
        return cassetteContextPromise;
    }
    cassetteContextPromise = createCasetteAudioContext();
    return cassetteContextPromise;
}

function useCassetteAudioContext() {
    return use(getCasetteAudioContext());
}

interface CassetteAudioContext_t {
    rewind: () => void;
    stopRewind: () => void;
    pause: () => void;
    play: () => void;
}
export const CassetteAudioContext = createContext(undefined! as CassetteAudioContext_t);

export function CassetteAudioProvider(props: { children: React.ReactNode }) {
    const cassetteTapeInsidePlayer = useGameStore((s) => s.widgets.cassette.tapeInside);
    const setCurrentTime = useGameStore((s) => s.widgets.cassette.setCurrentTime);
    const audio = useCassetteAudioContext();
    const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const playbackPositionRef = useRef<number | null>(31.4);
    const playbackStartTimeRef = useRef<number | null>(null);
    const rewindStartTimeRef = useRef<number | null>(null);
    const isRewindingRef = useRef<boolean>(false);
    const volume = useGameStore((s) => (s.muted ? 0 : s.volume * baseVolume));
    audio.gain.gain.value = volume;

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
        play();
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
    }, [setCurrentTime, cassetteTapeInsidePlayer]);

    const value = useMemo(() => ({ play, pause, rewind, stopRewind }), []);

    return <CassetteAudioContext.Provider value={value} children={props.children} />;
}
