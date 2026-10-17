import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
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
    const tvState = useGameStore((s) => s.widgets.tv);
    const isTVFocused = useGameStore((s) => s.openWidget === TV);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const updateVideoCurrentTime = () => {
            playbackTrackingAnimationFrame = requestAnimationFrame(updateVideoCurrentTime);
            tvState.setCurrentTime(videoRef.current?.currentTime);
        };
        let playbackTrackingAnimationFrame = requestAnimationFrame(updateVideoCurrentTime);
        return () => {
            cancelAnimationFrame(playbackTrackingAnimationFrame);
        };
    }, [tvState.setCurrentTime]);

    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        if (props.scaleDown) {
            videoRef.current.currentTime = tvState.currentTime ?? 0;
        }
    }, [tvState.currentTime, props.scaleDown]);

    return (
        <div className={classNames(styles.TV, props.scaleDown && styles.ScaledDown)} inert={props.blockInteraction}>
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id === "vhsDrop") {
                        tvState.setHasTape(true);
                        requestAnimationFrame(() => {
                            videoRef.current?.play();
                        });
                    }
                }}>
                <VHSDropTarget />
                {!props.scaleDown && !tvState.hasTape && <VHS />}
                {tvState.hasTape && (
                    <video
                        className={styles.TVVideo}
                        src={vhsTapeUrl}
                        playsInline
                        ref={videoRef}
                        muted={props.blockInteraction && isTVFocused}
                    />
                )}
                <img className={styles.TVimg} src={props.scaleDown ? tvOverviewImgUrl : tvImgUrl} />
            </DragDropProvider>
        </div>
    );
}
