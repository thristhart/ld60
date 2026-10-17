import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { useEffect, useState } from "react";
import vhsTapeUrl from "../assets/placeholder_vhs_tape_video.mp4";
import tvImgUrl from "../assets/tv.png";
import vhsImgUrl from "../assets/vhs.png";
import styles from "./tv.module.css";

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

interface TVProps {}
export function TV(props: TVProps) {
    const [bVHSTapeInPlayer, setVHSInPlayer] = useState(false);

    return (
        <div className={styles.TV}>
            <DragDropProvider
                onDragEnd={(event) => {
                    if (event.canceled) {
                        return;
                    }
                    if (event.operation.target?.id === "vhsDrop") {
                        setVHSInPlayer(true);
                    }
                }}>
                <img className={styles.TVimg} src={tvImgUrl} />
                <VHSDropTarget />
                {!bVHSTapeInPlayer && <VHS />}
                {bVHSTapeInPlayer && <video className={styles.TVVideo} src={vhsTapeUrl} playsInline autoPlay />}
            </DragDropProvider>
        </div>
    );
}
