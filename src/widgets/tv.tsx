import { Scroller } from "@dnd-kit/dom";
import { DragDropProvider, useDragDropManager, useDraggable, useDroppable } from "@dnd-kit/react";
import classNames from "classnames";
import { useEffect, useRef } from "react";
import tvOverviewImgUrl from "../assets/placeholder_tv_overview.png";
import vhsTapeUrl from "../assets/placeholder_vhs_tape_video.mp4";
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

interface TVProps extends WidgetProps {}
export function TV(props: TVProps) {
    const currentTime = useGameStore((s) => s.widgets.tv.currentTime);
    const setCurrentTime = useGameStore((s) => s.widgets.tv.setCurrentTime);
    const hasTape = useGameStore((s) => s.widgets.tv.hasTape);
    const setHasTape = useGameStore((s) => s.widgets.tv.setHasTape);

    const isTVFocused = useGameStore((s) => s.openWidget === TV);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const updateVideoCurrentTime = () => {
            playbackTrackingAnimationFrame = requestAnimationFrame(updateVideoCurrentTime);
            setCurrentTime(videoRef.current?.currentTime);
        };
        let playbackTrackingAnimationFrame = requestAnimationFrame(updateVideoCurrentTime);
        return () => {
            cancelAnimationFrame(playbackTrackingAnimationFrame);
        };
    }, [setCurrentTime]);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        if (videoRef.current.paused) {
            videoRef.current.currentTime = currentTime ?? 0;
        }
    }, [currentTime, props.scaleDown]);

    return (
        <div className={classNames(styles.TV, props.scaleDown && styles.ScaledDown)} inert={props.blockInteraction}>
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id === "vhsDrop") {
                        setHasTape(true);
                        requestAnimationFrame(() => {
                            videoRef.current?.play();
                        });
                    }
                }}>
                <VHSDropTarget />
                <video
                    className={styles.TVVideo}
                    src={vhsTapeUrl}
                    playsInline
                    ref={videoRef}
                    muted={props.blockInteraction && isTVFocused}
                />
                <img className={styles.TVimg} src={props.scaleDown ? tvOverviewImgUrl : tvImgUrl} />
                {!props.scaleDown && !hasTape && <VHS />}
            </DragDropProvider>
        </div>
    );
}
